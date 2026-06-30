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
      <iframe class="pdf-viewer-frame" title="Visualizador de e-book"></iframe>
    </div>
  `
  document.body.appendChild(modal)

  const frame    = modal.querySelector('.pdf-viewer-frame')
  const titleEl  = modal.querySelector('.pdf-viewer-title')
  const dlBtn    = modal.querySelector('.pdf-viewer-download')
  const closeBtn = modal.querySelector('.pdf-viewer-close')

  let currentUrl = '', currentFilename = ''

  function open(url, title, filename) {
    currentUrl = url
    currentFilename = filename
    titleEl.textContent = title
    frame.src = url
    modal.classList.add('open')
    document.body.style.overflow = 'hidden'
  }

  function close() {
    modal.classList.remove('open')
    document.body.style.overflow = ''
    setTimeout(() => { frame.src = '' }, 300)
    currentUrl = ''
  }

  closeBtn.addEventListener('click', close)
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close() })

  dlBtn.addEventListener('click', async () => {
    const url = currentUrl
    const filename = currentFilename || 'ebook.pdf'
    dlBtn.disabled = true
    try {
      let blob
      if (url.startsWith('data:')) {
        const [header, b64] = url.split(',')
        const mime = header.match(/:(.*?);/)?.[1] || 'application/pdf'
        const bytes = atob(b64)
        const arr = new Uint8Array(bytes.length)
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
        blob = new Blob([arr], { type: mime })
      } else {
        const res = await fetch(url)
        blob = await res.blob()
      }
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
