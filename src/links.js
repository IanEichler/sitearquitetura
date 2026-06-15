import { loadData, STORAGE_KEY } from './links-data.js'

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str ?? ''
  return div.innerHTML
}

/* Links internos começam com "/", "#", "mailto:" ou "tel:".
   Qualquer outra coisa (ex.: "youtube.com") é tratada como link
   externo e recebe "https://" automaticamente se faltar o protocolo. */
function isInternalUrl(url) {
  return /^(\/|#|mailto:|tel:)/i.test((url ?? '').trim())
}
function resolveUrl(url) {
  const trimmed = (url ?? '').trim()
  if (!trimmed) return '#'
  if (isInternalUrl(trimmed) || /^https?:/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function render() {
  const { profile, links } = loadData()

  const profileEl = document.getElementById('linksProfile')
  profileEl.innerHTML = `
    <div class="links-avatar">
      <img src="${escapeHtml(profile.avatar)}" alt="${escapeHtml(profile.name)}" loading="eager" />
    </div>
    <h1>${escapeHtml(profile.name)}</h1>
    <p>${escapeHtml(profile.subtitle).replace(/\n/g, '<br>')}</p>
  `

  const listEl = document.getElementById('linksList')
  listEl.innerHTML = links.map(link => {
    const href = resolveUrl(link.url)
    const isExternal = !isInternalUrl(link.url)
    const cls = ['link-btn', link.primary ? 'link-btn-primary' : ''].filter(Boolean).join(' ')
    return `
      <a class="${cls}" href="${escapeHtml(href)}" ${isExternal ? 'target="_blank" rel="noopener"' : ''}>
        <span class="link-icon"><i data-lucide="${escapeHtml(link.icon)}"></i></span>
        <span class="link-label">${escapeHtml(link.label)}</span>
      </a>
    `
  }).join('')

  window.lucide?.createIcons()
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', render)
  : render()

/* Permite que o painel admin atualize esta página em tempo real
   (ex.: dentro de um iframe de pré-visualização) quando os dados mudam. */
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) render()
})
