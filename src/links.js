import { loadData } from './links-data.js'

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str ?? ''
  return div.innerHTML
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
    const isExternal = /^https?:\/\//.test(link.url)
    const cls = ['link-btn', link.primary ? 'link-btn-primary' : ''].filter(Boolean).join(' ')
    return `
      <a class="${cls}" href="${escapeHtml(link.url)}" ${isExternal ? 'target="_blank" rel="noopener"' : ''}>
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
