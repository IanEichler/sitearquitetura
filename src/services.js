const track = document.getElementById('servicesTrack')
const prevBtn = document.getElementById('servicesPrev')
const nextBtn = document.getElementById('servicesNext')

if (track && prevBtn && nextBtn) {
  const cards = Array.from(track.children)
  const titles = cards.map(c => c.querySelector('h3'))
  let index = 0

  function cardsPerView() {
    if (window.innerWidth <= 768) return 1
    if (window.innerWidth <= 1024) return 2
    return 3
  }

  // todos os cards e títulos recebem a mesma altura (a maior entre todos),
  // assim os textos ficam alinhados e os quadros não mudam de tamanho ao navegar
  function syncSizes() {
    cards.forEach(c => { c.style.height = 'auto' })

    const maxCardHeight = Math.max(...cards.map(c => c.getBoundingClientRect().height))
    cards.forEach(c => { c.style.height = `${maxCardHeight}px` })

    track.parentElement.style.height = `${maxCardHeight}px`
  }

  function update() {
    const maxIndex = Math.max(0, cards.length - cardsPerView())
    if (index > maxIndex) index = maxIndex
    syncSizes()
    const gap = parseFloat(getComputedStyle(track).gap) || 0
    const step = cards[0].getBoundingClientRect().width + gap
    track.style.transform = `translateX(-${index * step}px)`
  }

  function go(dir) {
    const maxIndex = Math.max(0, cards.length - cardsPerView())
    index += dir
    if (index < 0) index = maxIndex
    if (index > maxIndex) index = 0
    update()
  }

  prevBtn.addEventListener('click', () => go(-1))
  nextBtn.addEventListener('click', () => go(1))
  window.addEventListener('resize', update)
  update()

  setInterval(() => go(1), 5000)
}
