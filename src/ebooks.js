import { loadEbooks, EBOOKS_STORAGE_KEY } from './ebooks-data.js'

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str ?? ''
  return div.innerHTML
}

/* Mesmo critério de src/links.js: links internos começam com "/", "#",
   "mailto:" ou "tel:". Qualquer outra coisa recebe "https://" automaticamente
   se faltar o protocolo. */
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
      <div class="ebook-cover ${ebook.status === 'free' ? 'ebook-cover-free' : 'ebook-cover-paid'} ebook-cover-img">
        <img src="${escapeHtml(cover)}" alt="Capa do e-book${title ? `: ${escapeHtml(title)}` : ''}, de Bianca Viana" loading="lazy" />
        <span class="ebook-cover-tag">${escapeHtml(tag)}</span>
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
    const isExternal = !isInternalUrl(ebook.downloadUrl)
    return `
      <a href="${escapeHtml(downloadUrl)}" download class="btn btn-primary btn-full" ${isExternal ? 'target="_blank" rel="noopener"' : ''}>
        <i data-lucide="download"></i> Baixar e-book gratuito
      </a>
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

function render() {
  const grid = document.getElementById('ebooksGrid')
  if (!grid) return

  const ebooks = loadEbooks()
  grid.innerHTML = ebooks.map(renderCard).join('')

  window.lucide?.createIcons()
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', render)
  : render()

/* Permite que o painel admin atualize esta página em tempo real
   (ex.: dentro de um iframe de pré-visualização) quando os dados mudam. */
window.addEventListener('storage', (e) => {
  if (e.key === EBOOKS_STORAGE_KEY) render()
})
