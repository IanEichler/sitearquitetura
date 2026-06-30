import { loadEbooks } from './ebooks-data.js'

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str ?? ''
  return div.innerHTML
}

function isInternalUrl(url) {
  return /^(\/|#|mailto:|tel:)/i.test((url ?? '').trim())
}
function resolveUrl(url) {
  const trimmed = (url ?? '').trim()
  if (!trimmed) return ''
  if (isInternalUrl(trimmed) || /^https?:/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function renderCover(ebook) {
  const cover = (ebook.cover ?? '').trim()
  const title = (ebook.title ?? '').trim()

  let tag
  if (ebook.status === 'free') tag = 'E-book Gratuito'
  else if (ebook.status === 'paid') tag = (ebook.price ?? '').trim() || 'Pago'
  else tag = 'Em breve'

  if (cover) {
    return `
      <div class="ebook-cover ebook-cover-img">
        <img src="${escapeHtml(cover)}" alt="Capa do e-book${title ? `: ${escapeHtml(title)}` : ''}, de Bianca Viana" loading="lazy" />
      </div>
    `
  }

  const icon = ebook.status === 'free' ? 'download' : ebook.status === 'paid' ? 'shopping-cart' : 'clock'

  return `
    <div class="ebook-cover ${ebook.status === 'free' ? 'ebook-cover-free' : 'ebook-cover-paid'}">
      <span class="ebook-cover-tag">${escapeHtml(tag)}</span>
      <div class="ebook-cover-icon"><i data-lucide="${icon}"></i></div>
      <div class="ebook-cover-body">
        ${title ? `<div class="ebook-cover-title">${escapeHtml(title)}</div>` : ''}
        <span class="ebook-cover-author">Bianca Viana</span>
      </div>
    </div>
  `
}

function renderAction(ebook) {
  const downloadUrl = resolveUrl(ebook.downloadUrl)

  if (ebook.status === 'free') {
    if (!downloadUrl) {
      return `
        <button type="button" class="btn btn-primary btn-full" disabled>
          <i data-lucide="download"></i> Em breve
        </button>
      `
    }
    const filename = `${(ebook.title || 'ebook').replace(/\s+/g, '-').toLowerCase()}.pdf`
    return `
      <button type="button" class="btn btn-primary btn-full ae-open-pdf"
        data-url="${escapeHtml(ebook.downloadUrl)}"
        data-title="${escapeHtml(ebook.title || 'E-book')}"
        data-filename="${escapeHtml(filename)}">
        <i data-lucide="book-open"></i> Ler e-book gratuito
      </button>
    `
  }

  if (ebook.status === 'paid') {
    if (!downloadUrl) {
      return `
        <button type="button" class="btn btn-outline btn-full" disabled>
          <i data-lucide="lock"></i> Em breve
        </button>
      `
    }
    const isExternal = !isInternalUrl(ebook.downloadUrl)
    return `
      <a href="${escapeHtml(downloadUrl)}" class="btn btn-primary btn-full" ${isExternal ? 'target="_blank" rel="noopener"' : ''}>
        <i data-lucide="shopping-cart"></i> Comprar e-book
      </a>
    `
  }

  return `
    <button type="button" class="btn btn-outline btn-full" disabled>
      <i data-lucide="clock"></i> Disponível em breve
    </button>
  `
}

function renderCard(ebook) {
  const title = (ebook.title ?? '').trim() || (ebook.status === 'soon' ? 'Em breve' : 'E-book')
  const description = ebook.description ?? ''

  let priceLabel, priceClass
  if (ebook.status === 'free') {
    priceLabel = 'Gratuito'
    priceClass = 'ebook-price ebook-price-free'
  } else if (ebook.status === 'paid') {
    priceLabel = (ebook.price ?? '').trim() || 'Pago'
    priceClass = 'ebook-price'
  } else {
    priceLabel = 'Em breve'
    priceClass = 'ebook-price'
  }

  return `
    <div class="ebook-card">
      ${renderCover(ebook)}
      <div class="ebook-info">
        <span class="${priceClass}">${escapeHtml(priceLabel)}</span>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(description)}</p>
        ${renderAction(ebook)}
      </div>
    </div>
  `
}

/* ─── LIGHTBOX ─── */
function initLightbox() {
  const lb = document.createElement('div')
  lb.className = 'img-lightbox'
  lb.innerHTML = '<button class="img-lightbox-close" aria-label="Fechar">✕</button><img alt="" />'
  document.body.appendChild(lb)

  const img = lb.querySelector('img')
  const closeBtn = lb.querySelector('.img-lightbox-close')

  function open(src) {
    img.src = src
    lb.classList.add('open')
    document.body.style.overflow = 'hidden'
  }
  function close() {
    lb.classList.remove('open')
    document.body.style.overflow = ''
    setTimeout(() => { img.src = '' }, 300)
  }

  lb.addEventListener('click', (e) => { if (e.target === lb) close() })
  closeBtn.addEventListener('click', close)
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close() })
}

async function render() {
  const grid = document.getElementById('ebooksGrid')
  if (!grid) return

  const ebooks = await loadEbooks()
  grid.innerHTML = ebooks.map(renderCard).join('')

  window.lucide?.createIcons()
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', () => { render(); initLightbox() })
  : (render(), initLightbox())

/* ─── VISUALIZADOR DE PDF ─── */
;(function initPdfViewer() {
  const modal = document.createElement('div')
  modal.className = 'pdf-viewer'
  modal.innerHTML = `
    <div class="pdf-viewer-bar">
      <span class="pdf-viewer-title"></span>
      <div class="pdf-viewer-actions">
        <button class="pdf-viewer-download btn-pv-dl">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Baixar
        </button>
        <button class="pdf-viewer-close" aria-label="Fechar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div class="pdf-viewer-body">
      <iframe class="pdf-viewer-frame" title="Visualizador de e-book"></iframe>
    </div>
  `
  document.body.appendChild(modal)

  const frame    = modal.querySelector('.pdf-viewer-frame')
  const titleEl  = modal.querySelector('.pdf-viewer-title')
  const dlBtn    = modal.querySelector('.pdf-viewer-download')
  const closeBtn = modal.querySelector('.pdf-viewer-close')

  let currentUrl = '', currentFilename = ''

  function open(url, title, filename) {
    currentUrl = url
    currentFilename = filename
    titleEl.textContent = title
    // data URLs vão direto para o iframe; URLs externas também funcionam
    frame.src = url
    modal.classList.add('open')
    document.body.style.overflow = 'hidden'
  }

  function close() {
    modal.classList.remove('open')
    document.body.style.overflow = ''
    setTimeout(() => { frame.src = '' }, 300)
    currentUrl = ''
  }

  closeBtn.addEventListener('click', close)
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close() })

  dlBtn.addEventListener('click', async () => {
    const url = currentUrl
    const filename = currentFilename || 'ebook.pdf'
    dlBtn.disabled = true
    try {
      let blob
      if (url.startsWith('data:')) {
        const [header, b64] = url.split(',')
        const mime = header.match(/:(.*?);/)?.[1] || 'application/pdf'
        const bytes = atob(b64)
        const arr = new Uint8Array(bytes.length)
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
        blob = new Blob([arr], { type: mime })
      } else {
        const res = await fetch(url)
        blob = await res.blob()
      }
      const objUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objUrl; a.download = filename
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(objUrl), 2000)
    } catch {
      window.open(url, '_blank')
    } finally {
      dlBtn.disabled = false
    }
  })

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.ae-open-pdf')
    if (!btn) return
    open(btn.dataset.url, btn.dataset.title || 'E-book', btn.dataset.filename || 'ebook.pdf')
  })
})()
