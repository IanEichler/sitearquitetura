import { loadData } from './links-data.js'
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
  if (!trimmed) return '#'
  if (isInternalUrl(trimmed) || /^https?:/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

const IG_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="17" height="17"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>`

function renderLinkBtn(link) {
  const href = resolveUrl(link.url)
  const isExternal = !isInternalUrl(link.url)
  const cls = ['link-btn', link.primary ? 'link-btn-primary' : ''].filter(Boolean).join(' ')
  const isIg = link.icon === 'instagram' || link.label.toLowerCase().includes('instagram')
  const iconHtml = isIg ? IG_SVG : `<i data-lucide="${escapeHtml(link.icon)}"></i>`
  return `
    <a class="${cls}" href="${escapeHtml(href)}" ${isExternal ? 'target="_blank" rel="noopener"' : ''}>
      <span class="link-icon">${iconHtml}</span>
      <span class="link-label">${escapeHtml(link.label)}</span>
    </a>
  `
}

function renderEbookBtn(ebook) {
  if (ebook.showInLinks === false) return ''
  const title = (ebook.title || 'E-book').trim()
  const url = (ebook.downloadUrl || '').trim()
  if (!url) return ''
  const isData = url.startsWith('data:')
  const href = isData ? url : resolveUrl(url)
  const isExternal = isData || !isInternalUrl(url)
  const download = isData ? ' download' : ''
  return `
    <a class="link-btn" href="${escapeHtml(href)}" ${isExternal ? 'target="_blank" rel="noopener"' : ''}${download}>
      <span class="link-icon"><i data-lucide="book-open"></i></span>
      <span class="link-label">${escapeHtml(title)}</span>
    </a>
  `
}

async function render() {
  const [{ profile, links }, ebooks] = await Promise.all([loadData(), loadEbooks()])

  const profileEl = document.getElementById('linksProfile')
  profileEl.innerHTML = `
    <div class="links-avatar">
      <img src="${escapeHtml(profile.avatar)}" alt="${escapeHtml(profile.name)}" loading="eager" />
    </div>
    <h1>${escapeHtml(profile.name)}</h1>
    <p>${escapeHtml(profile.subtitle).replace(/\n/g, '<br>')}</p>
  `

  const ebookBtns = ebooks.map(renderEbookBtn).filter(Boolean).join('')

  const listEl = document.getElementById('linksList')
  listEl.innerHTML =
    links.map(renderLinkBtn).join('') +
    (ebookBtns ? `
      <div class="links-section-divider">
        <span>E-books</span>
      </div>
      ${ebookBtns}
    ` : '')

  window.lucide?.createIcons()
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', render)
  : render()

/* ─── ANIMAÇÃO DE PARTÍCULAS NO FUNDO ─── */
;(function initParticles() {
  const canvas = document.getElementById('linksBgCanvas')
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  const COLORS = [
    'rgba(255,255,255,',
    'rgba(201,162,75,',
    'rgba(100,160,255,',
  ]

  let particles = []

  function resize() {
    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
  }

  function spawn() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.4,
      alpha: Math.random() * 0.5 + 0.1,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4 - 0.1,
      life: 0,
      maxLife: Math.random() * 300 + 150,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }
  }

  function init() {
    resize()
    particles = Array.from({ length: 60 }, spawn)
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const p of particles) {
      const progress = p.life / p.maxLife
      const fade = progress < 0.2 ? progress / 0.2 : progress > 0.8 ? (1 - progress) / 0.2 : 1
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = p.color + (p.alpha * fade).toFixed(3) + ')'
      ctx.fill()
    }
  }

  function tick() {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      p.x += p.vx
      p.y += p.vy
      p.life++
      if (p.life >= p.maxLife) particles[i] = spawn()
    }
    draw()
    requestAnimationFrame(tick)
  }

  window.addEventListener('resize', resize)
  init()
  tick()
})();

const footerYear = document.getElementById('footerYear')
if (footerYear) footerYear.textContent = new Date().getFullYear()
