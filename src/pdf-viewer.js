export function initPdfViewer() {
  const modal = document.createElement('div')
  modal.className = 'pdf-viewer'
  modal.innerHTML = `
    <div class="pdf-viewer-bar">
      <span class="pdf-viewer-title"></span>
      <div class="pdf-viewer-actions">
        <button class="pdf-viewer-download">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Baixar
        </button>
        <button class="pdf-viewer-close" aria-label="Fechar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div class="pdf-viewer-body">
      <iframe class="pdf-viewer-iframe" id="pdfIframe" title="Visualizador de PDF"></iframe>
    </div>
  `
  document.body.appendChild(modal)

  const iframe   = modal.querySelector('#pdfIframe')
  const titleEl  = modal.querySelector('.pdf-viewer-title')
  const dlBtn    = modal.querySelector('.pdf-viewer-download')
  const closeBtn = modal.querySelector('.pdf-viewer-close')

  let currentUrl = '', currentFilename = ''

  function open(url, title, filename) {
    currentUrl = url
    currentFilename = filename
    titleEl.textContent = title

    iframe.src = url

    modal.classList.add('open')
    const scrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
  }

  function close() {
    modal.classList.remove('open')
    const scrollY = Math.abs(parseInt(document.body.style.top || '0'))
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    window.scrollTo(0, scrollY)
    iframe.src = ''
  }

  closeBtn.addEventListener('click', close)
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close() })

  dlBtn.addEventListener('click', async () => {
    const url = currentUrl
    const filename = currentFilename || 'ebook.pdf'
    dlBtn.disabled = true
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const objUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objUrl; a.download = filename
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(objUrl), 2000)
    } catch {
      window.open(url, '_blank')
    } finally {
      dlBtn.disabled = false
    }
  })

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.ae-open-pdf')
    if (!btn) return
    open(btn.dataset.url, btn.dataset.title || 'E-book', btn.dataset.filename || 'ebook.pdf')
  })
}
