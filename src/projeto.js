import Lenis from 'lenis'
import { getProject, getAdjacentProjects } from './projects-data.js'
import { initModal } from './modal.js'

initModal()

/* ── LUCIDE ── */
const initIcons = () => window.lucide && window.lucide.createIcons()
document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', initIcons)
  : initIcons()

/* ── LENIS ── */
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
function raf(t) { lenis.raf(t); requestAnimationFrame(raf) }
requestAnimationFrame(raf)

/* ── CURSOR ── */
const cursor = document.getElementById('cursor')
const ring   = document.getElementById('cursor-ring')
let mx = -100, my = -100, rx = -100, ry = -100

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY })
;(function tick() {
  rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12
  cursor.style.left = mx + 'px'; cursor.style.top = my + 'px'
  ring.style.left   = rx + 'px'; ring.style.top   = ry + 'px'
  requestAnimationFrame(tick)
})()

document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('c-hover'))
  el.addEventListener('mouseleave', () => document.body.classList.remove('c-hover'))
})

/* ── NAVBAR ── */
const hamburger  = document.getElementById('hamburger')
const mobileMenu = document.getElementById('mobileMenu')
document.getElementById('mobileClose').addEventListener('click', () => mobileMenu.classList.remove('open'))
hamburger.addEventListener('click', () => mobileMenu.classList.add('open'))

/* ── LER SLUG DA URL ── */
const slug = new URLSearchParams(window.location.search).get('slug')
const project = getProject(slug)

if (!project) {
  document.title = 'Projeto não encontrado — Albaces'
  document.querySelector('.projeto-hero').innerHTML =
    '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#fff;font-family:var(--fd);font-size:32px;padding-top:72px">Projeto não encontrado</div>'
} else {
  renderProject(project)
}

function renderProject(p) {
  /* meta do browser */
  document.title = `${p.title} — Albaces Arquitetura`

  /* hero */
  document.getElementById('heroImg').src = p.heroImage
  document.getElementById('heroImg').alt = p.title
  document.getElementById('pjCategory').textContent = p.category
  document.getElementById('pjTitle').textContent    = p.title

  /* meta lateral */
  document.getElementById('pjMeta').innerHTML = `
    <div class="meta-item">
      <span>Categoria</span>
      <strong>${p.category}</strong>
    </div>
    <div class="meta-divider"></div>
    <div class="meta-item">
      <span>Ano</span>
      <strong>${p.year}</strong>
    </div>
    <div class="meta-divider"></div>
    <div class="meta-item">
      <span>Localização</span>
      <strong>${p.location}</strong>
    </div>
    <div class="meta-divider"></div>
    <div class="meta-item">
      <span>Área</span>
      <strong>${p.area}</strong>
    </div>
    <div class="meta-divider"></div>
    <button class="btn btn-primary" data-modal="orcamento" style="margin-top:8px">
      Solicitar Orçamento →
    </button>
  `

  /* descrição */
  document.getElementById('pjDesc').innerHTML =
    p.description.map(t => `<p>${t}</p>`).join('')

  /* galeria */
  const grid = document.getElementById('galleryGrid')
  p.images.forEach((src, i) => {
    const div = document.createElement('div')
    div.className = 'gallery-item' + (i === 0 || i === 3 ? ' tall' : '')
    div.innerHTML = `<img src="${src}" alt="${p.title} — foto ${i + 1}" loading="lazy" />`
    div.addEventListener('click', () => openLightbox(i))
    grid.appendChild(div)
  })

  /* próximo projeto */
  const { next } = getAdjacentProjects(slug)
  document.getElementById('nextLink').href   = `/projeto.html?slug=${next.slug}`
  document.getElementById('nextImg').src     = next.heroImage
  document.getElementById('nextImg').alt     = next.title
  document.getElementById('nextTitle').textContent = next.title

  /* re-init icons (botão dinâmico) */
  setTimeout(() => window.lucide && window.lucide.createIcons(), 100)

  /* scroll reveal simples */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) } })
  }, { threshold: 0.1 })
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
}

/* ── LIGHTBOX ── */
let currentIdx = 0
const images = () => getProject(slug)?.images ?? []

function buildLightbox() {
  const lb = document.createElement('div')
  lb.className = 'lightbox'
  lb.id = 'lightbox'
  lb.innerHTML = `
    <button class="lb-close" id="lbClose">✕</button>
    <button class="lb-prev" id="lbPrev"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>
    <img class="lightbox-img" id="lbImg" src="" alt="" />
    <button class="lb-next" id="lbNext"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></button>
    <span class="lb-counter" id="lbCounter"></span>
  `
  document.body.appendChild(lb)

  document.getElementById('lbClose').addEventListener('click', closeLightbox)
  document.getElementById('lbPrev').addEventListener('click', () => navigate(-1))
  document.getElementById('lbNext').addEventListener('click', () => navigate(1))
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox() })
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowLeft')  navigate(-1)
    if (e.key === 'ArrowRight') navigate(1)
  })
}

function openLightbox(idx) {
  if (!document.getElementById('lightbox')) buildLightbox()
  currentIdx = idx
  updateLightbox()
  document.getElementById('lightbox').classList.add('open')
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  document.getElementById('lightbox')?.classList.remove('open')
  document.body.style.overflow = ''
}

function navigate(dir) {
  const imgs = images()
  currentIdx = (currentIdx + dir + imgs.length) % imgs.length
  updateLightbox()
}

function updateLightbox() {
  const imgs = images()
  document.getElementById('lbImg').src = imgs[currentIdx]
  document.getElementById('lbCounter').textContent = `${currentIdx + 1} / ${imgs.length}`
}
