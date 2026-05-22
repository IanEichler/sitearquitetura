import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import EmblaCarousel from 'embla-carousel'
import Splitting from 'splitting'
import 'splitting/dist/splitting.css'
import 'splitting/dist/splitting-cells.css'
import { initModal } from './modal.js'

gsap.registerPlugin(ScrollTrigger)
initModal()

/* Lucide icons — aguarda CDN carregar */
const initIcons = () => window.lucide && window.lucide.createIcons()
document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', initIcons)
  : initIcons()

/* ─── LENIS SMOOTH SCROLL ─── */
const lenis = new Lenis({
  lerp: 0.1,
  smoothWheel: true,
})
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

/* ─── CURSOR ─── */
const cursor     = document.getElementById('cursor')
const cursorRing = document.getElementById('cursor-ring')

let mouseX = -100, mouseY = -100
let ringX  = -100, ringY  = -100

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX
  mouseY = e.clientY
})

function animateCursor() {
  ringX += (mouseX - ringX) * 0.12
  ringY += (mouseY - ringY) * 0.12

  cursor.style.left     = mouseX + 'px'
  cursor.style.top      = mouseY + 'px'
  cursorRing.style.left = ringX  + 'px'
  cursorRing.style.top  = ringY  + 'px'

  requestAnimationFrame(animateCursor)
}
animateCursor()

document.querySelectorAll('a, button, .service-card, .pf-card, .filter-btn, .testi-card').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('c-hover'))
  el.addEventListener('mouseleave', () => document.body.classList.remove('c-hover'))
})

/* ─── NAVBAR ─── */
const navbar = document.getElementById('navbar')
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 80)
}, { passive: true })

/* ─── HAMBURGER ─── */
const hamburger  = document.getElementById('hamburger')
const mobileMenu = document.getElementById('mobileMenu')
const mobileClose= document.getElementById('mobileClose')

hamburger.addEventListener('click', () => mobileMenu.classList.add('open'))
mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'))
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'))
})

/* ─── SCROLL REVEAL ─── */
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible')
      revealObserver.unobserve(e.target)
    }
  }),
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
)
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el))

/* ─── COUNT UP ─── */
function animateCount(el) {
  const target   = parseInt(el.dataset.target, 10)
  const duration = 1800
  const start    = performance.now()

  function update(now) {
    const elapsed  = now - start
    const progress = Math.min(elapsed / duration, 1)
    const ease     = 1 - Math.pow(1 - progress, 3)
    el.textContent = Math.floor(ease * target)
    if (progress < 1) requestAnimationFrame(update)
  }
  requestAnimationFrame(update)
}

const counterObserver = new IntersectionObserver(
  (entries) => entries.forEach(e => {
    if (e.isIntersecting) {
      animateCount(e.target)
      counterObserver.unobserve(e.target)
    }
  }),
  { threshold: 0.5 }
)
document.querySelectorAll('.count').forEach(el => counterObserver.observe(el))

/* ─── PROCESSO: linha animada ─── */
const processFill = document.querySelector('.process-line-fill')
if (processFill) {
  ScrollTrigger.create({
    trigger: '#processo',
    start: 'top 65%',
    onEnter: () => processFill.classList.add('animate'),
  })
}

/* ─── PORTFÓLIO FILTROS ─── */
const filterBtns  = document.querySelectorAll('.filter-btn')
const pfCards     = document.querySelectorAll('.pf-card')

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    const filter = btn.dataset.filter
    pfCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter
      card.classList.toggle('hidden', !match)
    })
  })
})

/* ─── SMOOTH ANCHOR LINKS ─── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'))
    if (target) {
      e.preventDefault()
      lenis.scrollTo(target, { offset: -72, duration: 1.4 })
    }
  })
})

/* ─── FORM SUBMIT → WHATSAPP ─── */
const form = document.getElementById('contactForm')
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(form))
    const lines = [
      `Olá, Albaces! Vim pelo site.`,
      ``,
      `*Nome:* ${data.nome || '-'}`,
      `*WhatsApp:* ${data.telefone || '-'}`,
      `*E-mail:* ${data.email || '-'}`,
      `*Serviço:* ${data.servico || '-'}`,
    ]
    if (data.mensagem?.trim()) {
      lines.push(``, `*Mensagem:*`, data.mensagem.trim())
    }
    const text = encodeURIComponent(lines.join('\n'))
    window.open(`https://wa.me/5566999731937?text=${text}`, '_blank')
    form.reset()
  })
}

/* ─── CARROSSEL DEPOIMENTOS ─── */
const testiTrack = document.getElementById('testiTrack')
if (testiTrack) {
  // Duplica os cards para loop contínuo
  testiTrack.innerHTML += testiTrack.innerHTML

  // Pausa no hover
  testiTrack.closest('.testi-carousel-wrap')?.addEventListener('mouseenter', () => {
    testiTrack.classList.add('paused')
  })
  testiTrack.closest('.testi-carousel-wrap')?.addEventListener('mouseleave', () => {
    testiTrack.classList.remove('paused')
  })
}

/* ─── HERO PARALLAX SUTIL ─── */
const heroBg = document.querySelector('.hero-img')
if (heroBg) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY
    heroBg.style.transform = `translateY(${scrolled * 0.25}px)`
  }, { passive: true })
}
