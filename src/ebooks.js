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
      <button type="button" class="btn btn-primary btn-full ae-download-any"
        data-url="${escapeHtml(ebook.downloadUrl)}"
        data-filename="${escapeHtml(filename)}">
        <i data-lucide="download"></i> Baixar e-book gratuito
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

/* download universal — data URL ou URL externa (Supabase Storage, etc.) */
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.ae-download-any')
  if (!btn || btn.disabled) return

  const rawUrl = btn.dataset.url
  const filename = btn.dataset.filename || 'ebook.pdf'

  const originalHtml = btn.innerHTML
  btn.disabled = true
  btn.innerHTML = '<i data-lucide="loader-2"></i> Baixando…'
  window.lucide?.createIcons()

  try {
    let blob

    if (rawUrl.startsWith('data:')) {
      const [header, b64] = rawUrl.split(',')
      const mime = header.match(/:(.*?);/)?.[1] || 'application/pdf'
      const bytes = atob(b64)
      const arr = new Uint8Array(bytes.length)
      for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
      blob = new Blob([arr], { type: mime })
    } else {
      const res = await fetch(rawUrl)
      blob = await res.blob()
    }

    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(objectUrl), 2000)
  } catch {
    window.open(rawUrl, '_blank')
  } finally {
    btn.disabled = false
    btn.innerHTML = originalHtml
    window.lucide?.createIcons()
  }
})
