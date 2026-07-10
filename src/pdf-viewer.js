import * as pdfjsLib from 'pdfjs-dist'
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

export function initPdfViewer() {
  const modal = document.createElement('div')
  modal.className = 'pdf-viewer'
  modal.innerHTML = `
    <div class="pdf-viewer-bar">
      <span class="pdf-viewer-title"></span>
      <div class="pdf-viewer-actions">
        <span class="pdf-viewer-pages"></span>
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
      <div class="pdf-viewer-canvas-wrap" id="pdfCanvasWrap">
        <div class="pdf-viewer-loading">
          <div class="pdf-viewer-spinner"></div>
          <span>Carregando...</span>
        </div>
      </div>
    </div>
  `
  document.body.appendChild(modal)

  const wrap    = modal.querySelector('#pdfCanvasWrap')
  const titleEl = modal.querySelector('.pdf-viewer-title')
  const pagesEl = modal.querySelector('.pdf-viewer-pages')
  const dlBtn   = modal.querySelector('.pdf-viewer-download')
  const closeBtn= modal.querySelector('.pdf-viewer-close')

  let currentUrl = '', currentFilename = '', renderTask = null

  async function open(url, title, filename) {
    currentUrl = url
    currentFilename = filename
    titleEl.textContent = title
    pagesEl.textContent = ''
    wrap.innerHTML = `<div class="pdf-viewer-loading"><div class="pdf-viewer-spinner"></div><span>Carregando...</span></div>`
    modal.classList.add('open')
    const scrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    try {
      const loadingTask = pdfjsLib.getDocument(url)
      const pdf = await loadingTask.promise

      wrap.innerHTML = ''
      pagesEl.textContent = `${pdf.numPages} página${pdf.numPages > 1 ? 's' : ''}`

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const containerWidth = wrap.clientWidth || window.innerWidth
        const naturalViewport = page.getViewport({ scale: 1 })
        const scale = (containerWidth - 32) / naturalViewport.width
        const viewport = page.getViewport({ scale })

        const canvas = document.createElement('canvas')
        canvas.className = 'pdf-viewer-canvas'
        canvas.width  = viewport.width
        canvas.height = viewport.height

        wrap.appendChild(canvas)

        renderTask = page.render({ canvasContext: canvas.getContext('2d'), viewport })
        await renderTask.promise
      }
    } catch (err) {
      if (err?.name === 'RenderingCancelledException') return
      wrap.innerHTML = `<div class="pdf-viewer-error">Não foi possível carregar o PDF.<br><a href="${url}" target="_blank" rel="noopener">Abrir em nova aba</a></div>`
    }
  }

  function close() {
    modal.classList.remove('open')
    const scrollY = Math.abs(parseInt(document.body.style.top || '0'))
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    window.scrollTo(0, scrollY)
    renderTask?.cancel?.()
    setTimeout(() => {
      wrap.innerHTML = ''
      pagesEl.textContent = ''
      currentUrl = ''
    }, 300)
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
