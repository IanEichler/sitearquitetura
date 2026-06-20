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

/* Permite que o painel admin atualize esta página em tempo real
   (ex.: dentro de um iframe de pré-visualização) quando os dados mudam. */
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) render()
})

const footerYear = document.getElementById('footerYear')
if (footerYear) footerYear.textContent = new Date().getFullYear()
