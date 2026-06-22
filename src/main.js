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

/* ─── MODAL DEMONSTRAÇÃO ─── */
document.getElementById('demoClose')?.addEventListener('click', () => {
  document.getElementById('demoModal').classList.add('hidden')
})

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

/* ─── PROCESSO: animação automática bolina a bolina ─── */
;(function initProcessAnim() {
  const circles = Array.from(document.querySelectorAll('.process-step .step-circle'))
  if (!circles.length) return
  let current = 0

  function advance() {
    circles[current].classList.remove('active')
    current = (current + 1) % circles.length
    circles[current].classList.add('active')
  }

  circles[0].classList.add('active')
  setInterval(advance, 2000)
})()

/* ─── ANO DINÂMICO NO RODAPÉ ─── */
const footerYear = document.getElementById('footerYear')
if (footerYear) footerYear.textContent = new Date().getFullYear()

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

/* Scroll para hash da URL ao carregar a página (ex.: index.html#servicos) */
if (window.location.hash) {
  const hashTarget = document.querySelector(window.location.hash)
  if (hashTarget) {
    setTimeout(() => lenis.scrollTo(hashTarget, { offset: -72, duration: 1.2 }), 400)
  }
}

/* ─── FORM SUBMIT → WHATSAPP ─── */
const form = document.getElementById('contactForm')
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(form))
    const lines = [
      `Olá, Bianca Viana! Vim pelo site.`,
      ``,
      `*Nome:* ${data.nome || '-'}`,
      `*WhatsApp:* ${data.telefone || '-'}`,
      `*E-mail:* ${data.email || '-'}`,
      `*Área de interesse:* ${data.servico || '-'}`,
    ]
    if (data.mensagem?.trim()) {
      lines.push(``, `*Mensagem:*`, data.mensagem.trim())
    }
    const text = encodeURIComponent(lines.join('\n'))
    window.open(`https://wa.me/55XXXXXXXXXXX?text=${text}`, '_blank')
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

/* ─── COPY PHONE ─── */
document.querySelectorAll('.copy-phone-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(btn.dataset.copy).then(() => {
      btn.classList.add('copied')
      const toast = btn.nextElementSibling
      toast?.classList.add('show')
      window.lucide?.createIcons()
      setTimeout(() => {
        btn.classList.remove('copied')
        toast?.classList.remove('show')
        window.lucide?.createIcons()
      }, 2000)
    })
  })
})
