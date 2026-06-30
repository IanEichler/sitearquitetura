import { loadData, defaultProfile, defaultLinks, iconOptions } from './links-data.js'
import { loadEbooks, defaultEbooks } from './ebooks-data.js'
import { supabaseAdmin } from './supabase.js'

/* ─── SENHA DE ACESSO ─── */
const ADMIN_PASSWORD_HASH = '066c28b1fb6067337ba74be3cff1dc3b7c50fea80ec958673fe68f8113ab6c97'
const AUTH_KEY = 'bv-admin-auth'

async function hashPassword(text) {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('')
}

const loginScreen   = document.getElementById('adminLogin')
const editorScreen  = document.getElementById('adminEditor')
const loginForm     = document.getElementById('loginForm')
const passwordInput = document.getElementById('adminPassword')
const loginError    = document.getElementById('adminError')

const sidebar        = document.getElementById('adminSidebar')
const sidebarOverlay = document.getElementById('sidebarOverlay')
const sidebarToggle  = document.getElementById('sidebarToggle')
const navItems       = document.querySelectorAll('.admin-nav-item')
const panels         = document.querySelectorAll('.admin-panel')
const topbarTitle    = document.getElementById('topbarTitle')
const previewToggle  = document.getElementById('previewToggle')

const previewModal      = document.getElementById('previewModal')
const previewModalFrame = document.getElementById('previewModalFrame')
const previewModalClose = document.getElementById('previewModalClose')

const statLinks  = document.getElementById('statLinks')
const statEbooks = document.getElementById('statEbooks')

const avatarDropzone       = document.getElementById('avatarDropzone')
const avatarDropzoneEmpty  = document.getElementById('avatarDropzoneEmpty')
const avatarDropzoneFilled = document.getElementById('avatarDropzoneFilled')
const profileAvatarFile    = document.getElementById('profileAvatarFile')
const profileAvatarPreview = document.getElementById('profileAvatarPreview')
const profileAvatarChange  = document.getElementById('profileAvatarChange')
const profileAvatarRemove  = document.getElementById('profileAvatarRemove')
const profileAvatarInput   = document.getElementById('profileAvatar')
const profileNameInput     = document.getElementById('profileName')
const profileSubtitleInput = document.getElementById('profileSubtitle')

const linksEditorList  = document.getElementById('linksEditorList')
const addLinkBtn       = document.getElementById('addLinkBtn')
const ebooksEditorList = document.getElementById('ebooksEditorList')
const addEbookBtn      = document.getElementById('addEbookBtn')

const resetBtn  = document.getElementById('resetBtn')
const logoutBtn = document.getElementById('logoutBtn')

const saveBtn       = document.getElementById('saveBtn')
const savebarStatus = document.getElementById('savebarStatus')
const adminToasts   = document.getElementById('adminToasts')

let state = { profile: { ...defaultProfile }, links: [] }
let ebooksState = []
let siteConfig = { sobrePhoto: '' }
let expandedEbookIndex = null

/* ─── UPLOAD PARA SUPABASE STORAGE ─── */

async function uploadToStorage(dataUrl, bucket, filename) {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bytes = atob(base64)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  const blob = new Blob([arr], { type: mime })

  const { error } = await supabaseAdmin.storage.from(bucket).upload(filename, blob, {
    upsert: true,
    contentType: mime,
  })
  if (error) throw error

  const { data: { publicUrl } } = supabaseAdmin.storage.from(bucket).getPublicUrl(filename)
  return publicUrl
}

async function uploadPdfToStorage(file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-')
  const filename = `${Date.now()}-${safeName}`
  const { error } = await supabaseAdmin.storage.from('ebooks-files').upload(filename, file, {
    upsert: false,
    contentType: 'application/pdf',
  })
  if (error) throw error

  const { data: { publicUrl } } = supabaseAdmin.storage.from('ebooks-files').getPublicUrl(filename)
  return publicUrl
}

/* ─── LOGIN ─── */

async function initData() {
  const [linkData, ebooks] = await Promise.all([loadData(), loadEbooks()])
  state = { profile: linkData.profile, links: linkData.links }
  ebooksState = ebooks
  siteConfig = { sobrePhoto: linkData.sobrePhoto || '' }
  if (siteConfig.sobrePhoto) sobrePhotoPreview.src = siteConfig.sobrePhoto
  renderEditor()
}

async function showEditor() {
  loginScreen.classList.add('hidden')
  editorScreen.classList.remove('hidden')
  editorScreen.classList.add('loading')
  try {
    await initData()
  } catch {
    showToast('Erro ao carregar dados. Verifique a conexão.', 'error')
  }
  showPanel('dashboard')
  markClean()
  setTimeout(() => editorScreen.classList.remove('loading'), 400)
}

function showLogin() {
  editorScreen.classList.add('hidden')
  loginScreen.classList.remove('hidden')
  passwordInput.value = ''
  passwordInput.focus()
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const hash = await hashPassword(passwordInput.value)
  if (hash === ADMIN_PASSWORD_HASH) {
    sessionStorage.setItem(AUTH_KEY, '1')
    loginError.classList.add('hidden')
    showEditor()
  } else {
    loginError.classList.remove('hidden')
  }
})

/* ─── NAVEGAÇÃO POR ABAS ─── */

const PANEL_TITLES = {
  dashboard: 'Dashboard',
  perfil: 'Perfil',
  links: 'Links',
  ebooks: 'E-books',
  config: 'Configurações',
}

const PANEL_PREVIEW_SRC = {
  perfil: '/links.html',
  links: '/links.html',
  ebooks: '/index.html#ebooks',
}

let currentPanel = 'dashboard'

function showPanel(name) {
  currentPanel = name
  panels.forEach(p => p.classList.toggle('active', p.dataset.panel === name))
  navItems.forEach(b => b.classList.toggle('active', b.dataset.panel === name))
  topbarTitle.textContent = PANEL_TITLES[name]
  previewToggle.classList.toggle('hidden', !PANEL_PREVIEW_SRC[name])
  if (name === 'dashboard') updateDashboardStats()
  closeSidebar()
}

navItems.forEach(btn => btn.addEventListener('click', () => showPanel(btn.dataset.panel)))

/* ─── SIDEBAR MOBILE ─── */

function openSidebar() {
  sidebar.classList.add('open')
  sidebarOverlay.classList.add('show')
}

function closeSidebar() {
  sidebar.classList.remove('open')
  sidebarOverlay.classList.remove('show')
}

sidebarToggle.addEventListener('click', openSidebar)
sidebarOverlay.addEventListener('click', closeSidebar)

/* ─── PREVIEW MODAL (mobile) ─── */

previewToggle.addEventListener('click', () => {
  const src = PANEL_PREVIEW_SRC[currentPanel]
  if (!src) return
  previewModalFrame.src = src
  previewModal.classList.remove('hidden')
})

previewModalClose.addEventListener('click', () => {
  previewModal.classList.add('hidden')
  previewModalFrame.src = ''
})

/* ─── TOASTS ─── */

function showToast(message, type = 'success') {
  const el = document.createElement('div')
  el.className = `admin-toast admin-toast-${type}`
  el.innerHTML = `<i data-lucide="${type === 'error' ? 'alert-circle' : 'check-circle'}"></i><span></span>`
  el.querySelector('span').textContent = message
  adminToasts.appendChild(el)
  window.lucide?.createIcons()
  requestAnimationFrame(() => el.classList.add('show'))
  setTimeout(() => {
    el.classList.remove('show')
    setTimeout(() => el.remove(), 250)
  }, 3500)
}

/* ─── ESTADO "SUJO" ─── */

let isDirty = false

function markDirty() {
  isDirty = true
  savebarStatus.textContent = 'Alterações não salvas'
  savebarStatus.classList.add('dirty')
}

function markClean() {
  isDirty = false
  savebarStatus.textContent = 'Tudo salvo'
  savebarStatus.classList.remove('dirty')
}

function syncProfileFromInputs() {
  state.profile = {
    name:     profileNameInput.value.trim(),
    subtitle: profileSubtitleInput.value,
    avatar:   profileAvatarInput.value.trim(),
  }
}

/* ─── SALVAR NO SUPABASE ─── */

saveBtn.addEventListener('click', async () => {
  syncProfileFromInputs()
  syncLinksFromDom()
  syncEbooksFromDom()

  saveBtn.disabled = true
  savebarStatus.textContent = 'Salvando...'

  try {
    // 1. Perfil / config
    await supabaseAdmin.from('site_config').upsert({
      id: 'main',
      profile_name:     state.profile.name,
      profile_subtitle: state.profile.subtitle,
      profile_avatar:   state.profile.avatar,
      sobre_photo:      siteConfig.sobrePhoto || '',
    })

    // 2. Links — substitui todos
    await supabaseAdmin.from('links').delete().gt('position', -1)
    if (state.links.length) {
      await supabaseAdmin.from('links').insert(
        state.links.map((l, i) => ({
          position:   i,
          label:      l.label,
          url:        l.url,
          icon:       l.icon || 'link',
          is_primary: l.primary || false,
        }))
      )
    }

    // 3. E-books — substitui todos
    await supabaseAdmin.from('ebooks').delete().gt('position', -1)
    if (ebooksState.length) {
      await supabaseAdmin.from('ebooks').insert(
        ebooksState.map((e, i) => ({
          position:     i,
          title:        e.title || '',
          description:  e.description || '',
          status:       e.status || 'free',
          price:        e.price || '',
          cover_url:    e.cover || '',
          download_url: e.downloadUrl || '',
          show_in_links: e.showInLinks !== false,
        }))
      )
    }

    markClean()
    showToast('Alterações salvas e publicadas')

    // Recarrega iframes de preview para refletir as mudanças
    document.querySelectorAll('.admin-preview-frame').forEach(iframe => {
      const src = iframe.src
      iframe.src = ''
      setTimeout(() => { iframe.src = src }, 100)
    })

  } catch (err) {
    showToast('Erro ao salvar: ' + (err.message || 'verifique a conexão'), 'error')
  } finally {
    saveBtn.disabled = false
    if (isDirty) savebarStatus.classList.add('dirty')
  }
})

/* ─── DASHBOARD ─── */

function updateDashboardStats() {
  statLinks.textContent = state.links.length
  statEbooks.textContent = ebooksState.length
}

/* ─── RENDER GERAL ─── */

function renderEditor() {
  profileNameInput.value     = state.profile.name
  profileSubtitleInput.value = state.profile.subtitle
  profileAvatarInput.value   = state.profile.avatar
  updateAvatarDropzone(state.profile.avatar)
  renderLinksList()
  renderEbooksList()
  updateDashboardStats()
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function updateImagePreview(img, removeBtn, value) {
  const v = (value ?? '').trim()
  if (v) {
    img.src = v
    img.classList.remove('hidden')
    removeBtn.classList.remove('hidden')
  } else {
    img.removeAttribute('src')
    img.classList.add('hidden')
    removeBtn.classList.add('hidden')
  }
}

function escapeAttr(str) {
  const div = document.createElement('div')
  div.textContent = str ?? ''
  return div.innerHTML.replace(/"/g, '&quot;')
}

/* ─── PERFIL: DROPZONE DO AVATAR ─── */

function updateAvatarDropzone(value) {
  const v = (value ?? '').trim()
  if (v) {
    profileAvatarPreview.src = v
    avatarDropzoneEmpty.classList.add('hidden')
    avatarDropzoneFilled.classList.remove('hidden')
  } else {
    profileAvatarPreview.removeAttribute('src')
    avatarDropzoneEmpty.classList.remove('hidden')
    avatarDropzoneFilled.classList.add('hidden')
  }
}

/* ─── CROP MODAL ─── */
const cropModal = (() => {
  const el = document.createElement('div')
  el.className = 'adm-crop-modal'
  el.innerHTML = `
    <div class="adm-crop-box">
      <p class="adm-crop-title">Ajustar imagem</p>
      <div class="adm-crop-stage" id="admCropStage">
        <img id="admCropImg" alt="" />
        <div class="adm-crop-overlay" id="admCropOverlay"></div>
      </div>
      <div class="adm-crop-zoom">
        <label>Zoom</label>
        <input type="range" id="admCropZoom" min="100" max="400" value="100" step="1" />
      </div>
      <div class="adm-crop-actions">
        <button class="adm-crop-cancel" id="admCropCancel">Cancelar</button>
        <button class="adm-crop-confirm" id="admCropConfirm">Aplicar</button>
      </div>
    </div>
  `
  document.body.appendChild(el)

  const stage      = el.querySelector('#admCropStage')
  const img        = el.querySelector('#admCropImg')
  const overlay    = el.querySelector('#admCropOverlay')
  const zoomSlider = el.querySelector('#admCropZoom')
  const cancelBtn  = el.querySelector('#admCropCancel')
  const confirmBtn = el.querySelector('#admCropConfirm')

  let scale = 1, tx = 0, ty = 0
  let dragging = false, startX = 0, startY = 0, startTx = 0, startTy = 0
  let onConfirm = null
  let outputW = 400, outputH = 400

  function applyTransform() {
    img.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${scale})`
    img.style.left = '50%'
    img.style.top  = '50%'
  }

  zoomSlider.addEventListener('input', () => {
    scale = zoomSlider.value / 100
    applyTransform()
  })

  stage.addEventListener('mousedown', (e) => {
    dragging = true; stage.classList.add('dragging')
    startX = e.clientX; startY = e.clientY
    startTx = tx; startTy = ty
  })
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return
    tx = startTx + (e.clientX - startX)
    ty = startTy + (e.clientY - startY)
    applyTransform()
  })
  window.addEventListener('mouseup', () => { dragging = false; stage.classList.remove('dragging') })

  stage.addEventListener('touchstart', (e) => {
    const t = e.touches[0]
    dragging = true; startX = t.clientX; startY = t.clientY
    startTx = tx; startTy = ty
  }, { passive: true })
  window.addEventListener('touchmove', (e) => {
    if (!dragging) return
    const t = e.touches[0]
    tx = startTx + (t.clientX - startX)
    ty = startTy + (t.clientY - startY)
    applyTransform()
  }, { passive: true })
  window.addEventListener('touchend', () => { dragging = false })

  stage.addEventListener('wheel', (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -5 : 5
    const next = Math.min(400, Math.max(100, parseInt(zoomSlider.value) + delta))
    zoomSlider.value = next
    scale = next / 100
    applyTransform()
  }, { passive: false })

  cancelBtn.addEventListener('click', close)
  el.addEventListener('click', (e) => { if (e.target === el) close() })
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && el.classList.contains('open')) close() })

  confirmBtn.addEventListener('click', () => {
    const stageRect = stage.getBoundingClientRect()
    const canvas = document.createElement('canvas')
    canvas.width  = outputW
    canvas.height = outputH
    const ctx = canvas.getContext('2d')
    const sw = stageRect.width
    const sh = stageRect.height
    const naturalW = img.naturalWidth
    const naturalH = img.naturalHeight
    const displayScale = scale * Math.min(sw / naturalW, sh / naturalH)
    const dw = naturalW * displayScale
    const dh = naturalH * displayScale
    const cx = sw / 2 + tx
    const cy = sh / 2 + ty
    const srcX = (cx - dw / 2)
    const srcY = (cy - dh / 2)
    const scaleToOutput = outputW / sw
    ctx.drawImage(img, 0, 0, naturalW, naturalH,
      srcX * scaleToOutput, srcY * scaleToOutput,
      dw * scaleToOutput, dh * scaleToOutput)
    const result = canvas.toDataURL('image/jpeg', .92)
    if (onConfirm) onConfirm(result)
    close()
  })

  function close() {
    el.classList.remove('open')
    setTimeout(() => { img.src = ''; tx = 0; ty = 0; scale = 1; zoomSlider.value = 100 }, 250)
  }

  return {
    open(src, { circular = true, w = 400, h = 400, callback } = {}) {
      outputW = w; outputH = h; onConfirm = callback
      tx = 0; ty = 0; scale = 1; zoomSlider.value = 100
      overlay.classList.toggle('rect', !circular)
      img.src = src
      img.onload = () => {
        applyTransform()
        el.classList.add('open')
      }
    }
  }
})()

async function handleAvatarFile(file) {
  if (!file) return
  const dataUrl = await readFileAsDataUrl(file)
  cropModal.open(dataUrl, { circular: true, w: 400, h: 400, callback: async (cropped) => {
    try {
      showToast('Enviando foto de perfil...')
      const url = await uploadToStorage(cropped, 'images', `avatar-${Date.now()}.jpg`)
      profileAvatarInput.value = url
      updateAvatarDropzone(url)
    } catch {
      profileAvatarInput.value = cropped
      updateAvatarDropzone(cropped)
      showToast('Não foi possível enviar para o servidor — foto salva localmente', 'error')
    }
    markDirty()
  }})
}

profileNameInput.addEventListener('input', markDirty)
profileSubtitleInput.addEventListener('input', markDirty)

profileAvatarInput.addEventListener('input', () => {
  updateAvatarDropzone(profileAvatarInput.value)
  markDirty()
})

profileAvatarFile.addEventListener('change', () => {
  handleAvatarFile(profileAvatarFile.files[0])
  profileAvatarFile.value = ''
})

profileAvatarChange.addEventListener('click', () => profileAvatarFile.click())

/* ─── FOTO DO SOBRE (SITE PRINCIPAL) ─── */
const sobrePhotoPreview = document.getElementById('sobrePhotoPreview')
const sobrePhotoFile    = document.getElementById('sobrePhotoFile')
const sobrePhotoRemove  = document.getElementById('sobrePhotoRemove')

sobrePhotoFile?.addEventListener('change', async () => {
  const file = sobrePhotoFile.files[0]
  if (!file) return
  cropModal.open(await readFileAsDataUrl(file), { circular: false, w: 800, h: 1000, callback: async (cropped) => {
    try {
      showToast('Enviando foto do site...')
      const url = await uploadToStorage(cropped, 'images', `sobre-${Date.now()}.jpg`)
      sobrePhotoPreview.src = url
      siteConfig.sobrePhoto = url
    } catch {
      sobrePhotoPreview.src = cropped
      siteConfig.sobrePhoto = cropped
      showToast('Não foi possível enviar para o servidor — foto salva localmente', 'error')
    }
    sobrePhotoFile.value = ''
    markDirty()
  }})
})

sobrePhotoRemove?.addEventListener('click', () => {
  sobrePhotoPreview.src = '/eu-sou-a-bianca.jpeg'
  siteConfig.sobrePhoto = ''
  markDirty()
})

profileAvatarRemove.addEventListener('click', () => {
  profileAvatarInput.value = ''
  updateAvatarDropzone('')
  markDirty()
})

avatarDropzone.addEventListener('click', () => {
  if (!avatarDropzoneFilled.classList.contains('hidden')) return
  profileAvatarFile.click()
})

avatarDropzone.addEventListener('dragover', (e) => {
  e.preventDefault()
  avatarDropzone.classList.add('dragover')
})

avatarDropzone.addEventListener('dragleave', () => {
  avatarDropzone.classList.remove('dragover')
})

avatarDropzone.addEventListener('drop', (e) => {
  e.preventDefault()
  avatarDropzone.classList.remove('dragover')
  handleAvatarFile(e.dataTransfer.files[0])
})

/* ─── LINKS ─── */

function urlPreview(url) {
  const trimmed = (url ?? '').trim()
  if (!trimmed) return 'Sem link definido'
  if (/^[/#]/.test(trimmed)) return trimmed
  if (/^mailto:/i.test(trimmed)) return trimmed.replace(/^mailto:/i, '')
  if (/^tel:/i.test(trimmed)) return trimmed.replace(/^tel:/i, '')
  try {
    const withProto = /^https?:/i.test(trimmed) ? trimmed : `https://${trimmed}`
    return new URL(withProto).hostname
  } catch {
    return trimmed
  }
}

function updateIconPreview(row, iconName) {
  const preview = row.querySelector('.al-icon-preview')
  preview.innerHTML = `<i data-lucide="${escapeAttr(iconName || 'link')}"></i>`
  window.lucide?.createIcons()
}

function renderLinksList() {
  linksEditorList.innerHTML = state.links.map((link, i) => {
    const isKnown = iconOptions.some(opt => opt.value === link.icon)
    const optionsHtml = iconOptions.map(opt =>
      `<option value="${opt.value}" ${link.icon === opt.value ? 'selected' : ''}>${opt.label}</option>`
    ).join('')

    return `
    <div class="admin-link-card" data-index="${i}">
      <div class="al-card-header">
        <span class="al-drag-handle" draggable="true"><i data-lucide="grip-vertical"></i></span>
        <span class="al-icon-preview"><i data-lucide="${escapeAttr(isKnown ? link.icon : (link.icon || 'link'))}"></i></span>
        <div class="al-card-title">
          <strong>${escapeAttr(link.label) || 'Novo link'}</strong>
          <small>${escapeAttr(urlPreview(link.url))}</small>
        </div>
        ${link.primary ? '<span class="al-badge">Destaque</span>' : ''}
        <button type="button" class="al-remove" title="Excluir"><i data-lucide="trash-2"></i></button>
      </div>
      <div class="al-card-body">
        <div class="al-card-body-row">
          <div class="al-field-group">
            <span class="al-field-label">Ícone</span>
            <select class="al-icon">
              ${optionsHtml}
              <option value="__custom__" ${!isKnown ? 'selected' : ''}>Outro (avançado)</option>
            </select>
            <input type="text" class="al-icon-custom ${isKnown ? 'hidden' : ''}" placeholder="ex: star, globe, heart…" value="${escapeAttr(isKnown ? '' : link.icon)}" />
          </div>
          <div class="al-field-group">
            <span class="al-field-label">Visibilidade</span>
            <label class="al-primary-pill">
              <input type="checkbox" class="al-primary-check" ${link.primary ? 'checked' : ''} />
              <span class="al-pill-dot"></span>
              <span>Destacar botão</span>
            </label>
          </div>
        </div>
        <div class="al-field-group">
          <span class="al-field-label">Texto do botão</span>
          <input type="text" class="al-label" placeholder="Ex.: Agendar consulta" value="${escapeAttr(link.label)}" />
        </div>
        <div class="al-field-group">
          <span class="al-field-label">Link</span>
          <input type="text" class="al-url" placeholder="https://... ou /index.html#secao" value="${escapeAttr(link.url)}" />
        </div>
      </div>
    </div>
  `
  }).join('')

  window.lucide?.createIcons()
}

function syncLinksFromDom() {
  const rows = linksEditorList.querySelectorAll('.admin-link-card')
  state.links = Array.from(rows).map(row => {
    const select = row.querySelector('.al-icon')
    const custom = row.querySelector('.al-icon-custom')
    const icon = select.value === '__custom__' ? custom.value.trim() : select.value
    return {
      icon,
      label: row.querySelector('.al-label').value.trim(),
      url:   row.querySelector('.al-url').value.trim(),
      primary: row.querySelector('.al-primary-check').checked,
    }
  })
}

linksEditorList.addEventListener('input', (e) => {
  const row = e.target.closest('.admin-link-card')
  if (!row) return

  if (e.target.classList.contains('al-label')) {
    row.querySelector('.al-card-title strong').textContent = e.target.value.trim() || 'Novo link'
  }
  if (e.target.classList.contains('al-url')) {
    row.querySelector('.al-card-title small').textContent = urlPreview(e.target.value)
  }
  if (e.target.classList.contains('al-icon-custom')) {
    updateIconPreview(row, e.target.value.trim())
  }

  markDirty()
})

linksEditorList.addEventListener('change', (e) => {
  if (!e.target.classList.contains('al-icon') && !e.target.classList.contains('al-primary-check')) return

  const row = e.target.closest('.admin-link-card')
  const index = Number(row.dataset.index)
  const focusCustom = e.target.classList.contains('al-icon') && e.target.value === '__custom__'

  syncLinksFromDom()
  renderLinksList()

  if (focusCustom) {
    linksEditorList.children[index]?.querySelector('.al-icon-custom')?.focus()
  }

  markDirty()
})

linksEditorList.addEventListener('click', (e) => {
  if (!e.target.closest('.al-remove')) return
  const row = e.target.closest('.admin-link-card')
  const index = Number(row.dataset.index)

  syncLinksFromDom()
  state.links.splice(index, 1)
  renderLinksList()
  markDirty()
  updateDashboardStats()
})

addLinkBtn.addEventListener('click', () => {
  syncLinksFromDom()
  state.links.push({ icon: 'link', label: 'Novo link', url: 'https://', primary: false })
  renderLinksList()
  markDirty()
  updateDashboardStats()
  showToast('Link adicionado')
})

/* ─── E-BOOKS ─── */

const EBOOK_STATUS_LABELS = { free: 'Gratuito', paid: 'Pago', soon: 'Em breve' }
const EBOOK_STATUS_ICONS  = { free: 'download', paid: 'shopping-cart', soon: 'clock' }

function renderEbooksList() {
  ebooksEditorList.innerHTML = ebooksState.map((ebook, i) => {
    const statusOptionsHtml = Object.entries(EBOOK_STATUS_LABELS).map(([value, label]) =>
      `<option value="${value}" ${ebook.status === value ? 'selected' : ''}>${label}</option>`
    ).join('')

    const isExpanded = i === expandedEbookIndex
    const title = (ebook.title ?? '').trim() || 'Novo e-book'
    const thumb = ebook.cover
      ? `<img class="ae-thumb" src="${escapeAttr(ebook.cover)}" alt="" />`
      : `<span class="ae-thumb-placeholder"><i data-lucide="${EBOOK_STATUS_ICONS[ebook.status] ?? 'file'}"></i></span>`

    const dlIsData = (ebook.downloadUrl || '').startsWith('data:')

    return `
    <div class="admin-ebook-card ${isExpanded ? 'expanded' : ''}" data-index="${i}">
      <div class="ae-header">
        <span class="ae-drag-handle" draggable="true"><i data-lucide="grip-vertical"></i></span>
        ${thumb}
        <div class="ae-header-title">
          <strong>${escapeAttr(title)}</strong>
          <small>${escapeAttr(EBOOK_STATUS_LABELS[ebook.status] ?? '')}</small>
        </div>
        <div class="ae-header-actions">
          <div class="al-controls">
            <button type="button" class="al-up" title="Mover para cima" ${i === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" class="al-down" title="Mover para baixo" ${i === ebooksState.length - 1 ? 'disabled' : ''}>↓</button>
            <button type="button" class="al-remove" title="Remover"><i data-lucide="trash-2"></i></button>
          </div>
          <i data-lucide="chevron-down" class="ae-chevron"></i>
        </div>
      </div>
      <div class="ae-body">
        <div class="ae-body-inner">

          <!-- linha 1: status + toggle links -->
          <div class="ae-row-2">
            <div class="admin-field">
              <label>Status</label>
              <select class="ae-status">${statusOptionsHtml}</select>
            </div>
            <div class="admin-field">
              <label>Visibilidade</label>
              <label class="ae-show-links-label">
                <input type="checkbox" class="ae-show-links" ${ebook.showInLinks !== false ? 'checked' : ''} />
                Mostrar na página de links
              </label>
            </div>
          </div>

          <!-- título -->
          <div class="admin-field">
            <label>Título</label>
            <input type="text" class="ae-title" placeholder="Título do e-book" value="${escapeAttr(ebook.title)}" />
          </div>

          <!-- descrição -->
          <div class="admin-field">
            <label>Descrição</label>
            <textarea class="ae-description" rows="3" placeholder="Breve descrição do conteúdo...">${escapeAttr(ebook.description)}</textarea>
          </div>

          <!-- preço (só pago) -->
          <div class="admin-field ae-price-field ${ebook.status === 'paid' ? '' : 'hidden'}">
            <label>Preço</label>
            <input type="text" class="ae-price" placeholder="Ex.: R$ 29,90" value="${escapeAttr(ebook.price)}" />
          </div>

          <!-- capa + arquivo lado a lado -->
          <div class="ae-row-2">
            <div class="admin-field">
              <label>Capa</label>
              <div class="ae-cover-area">
                <input type="hidden" class="ae-cover" value="${escapeAttr(ebook.cover)}" />
                <div class="admin-image-preview-wrap">
                  <img class="ae-cover-preview admin-image-preview ${ebook.cover ? '' : 'hidden'}" src="${escapeAttr(ebook.cover)}" alt="" style="width:56px;height:74px" />
                  <button type="button" class="admin-image-remove ae-cover-remove ${ebook.cover ? '' : 'hidden'}" title="Remover">✕</button>
                </div>
                <div style="display:flex;flex-direction:column;gap:6px">
                  <label class="admin-upload-btn">
                    <i data-lucide="image"></i> Imagem
                    <input type="file" class="ae-cover-file" accept="image/*" />
                  </label>
                  <button type="button" class="admin-upload-btn ae-pdf-cover-btn">
                    <i data-lucide="file-image"></i> Da 1ª pág. do PDF
                  </button>
                </div>
              </div>
            </div>

            <div class="admin-field">
              <label>Arquivo / Link</label>
              <div class="ae-download-tabs">
                <button type="button" class="ae-dl-tab ${!dlIsData ? 'active' : ''}" data-tab="link">
                  <i data-lucide="link"></i> Link
                </button>
                <button type="button" class="ae-dl-tab ${dlIsData ? 'active' : ''}" data-tab="file">
                  <i data-lucide="file-text"></i> PDF
                </button>
              </div>
              <input type="hidden" class="ae-download" value="${escapeAttr(ebook.downloadUrl)}" />
              <div class="ae-dl-link-wrap ${dlIsData ? 'hidden' : ''}">
                <input type="text" class="ae-download-link-input" placeholder="https://... ou /ebooks/arquivo.pdf" value="${escapeAttr(dlIsData ? '' : ebook.downloadUrl)}" />
              </div>
              <div class="ae-dl-file-wrap ${dlIsData ? '' : 'hidden'}">
                ${dlIsData
                  ? `<div class="ae-dl-file-badge"><i data-lucide="check-circle"></i> PDF enviado <button type="button" class="ae-dl-file-remove">✕</button></div>`
                  : (ebook.downloadUrl && !dlIsData && ebook.downloadUrl.startsWith('http')
                    ? `<div class="ae-dl-file-badge"><i data-lucide="check-circle"></i> PDF no servidor <button type="button" class="ae-dl-file-remove">✕</button></div>`
                    : '')}
                <label class="admin-upload-btn">
                  <i data-lucide="upload"></i> ${dlIsData ? 'Substituir PDF' : 'Enviar PDF'}
                  <input type="file" class="ae-download-file" accept="application/pdf" />
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
  }).join('')

  window.lucide?.createIcons()
}

function syncEbooksFromDom() {
  const rows = ebooksEditorList.querySelectorAll('.admin-ebook-card')
  ebooksState = Array.from(rows).map(row => ({
    status:      row.querySelector('.ae-status').value,
    title:       row.querySelector('.ae-title').value.trim(),
    description: row.querySelector('.ae-description').value.trim(),
    price:       row.querySelector('.ae-price').value.trim(),
    cover:       row.querySelector('.ae-cover').value.trim(),
    downloadUrl: row.querySelector('.ae-download').value.trim(),
    showInLinks: row.querySelector('.ae-show-links').checked,
  }))
}

ebooksEditorList.addEventListener('input', (e) => {
  const row = e.target.closest('.admin-ebook-card')
  if (!row) return

  if (e.target.classList.contains('ae-cover')) {
    updateImagePreview(row.querySelector('.ae-cover-preview'), row.querySelector('.ae-cover-remove'), e.target.value)
  }
  if (e.target.classList.contains('ae-download-link-input')) {
    row.querySelector('.ae-download').value = e.target.value.trim()
  }
  if (e.target.classList.contains('ae-title')) {
    row.querySelector('.ae-header-title strong').textContent = e.target.value.trim() || 'Novo e-book'
  }

  markDirty()
})

ebooksEditorList.addEventListener('change', async (e) => {
  const row = e.target.closest('.admin-ebook-card')
  if (!row) return

  if (e.target.classList.contains('ae-cover-file')) {
    const file = e.target.files[0]
    if (!file) return
    const dataUrl = await readFileAsDataUrl(file)
    e.target.value = ''
    cropModal.open(dataUrl, { circular: false, w: 300, h: 400, callback: async (cropped) => {
      try {
        showToast('Enviando capa...')
        const url = await uploadToStorage(cropped, 'images', `ebook-cover-${Date.now()}.jpg`)
        row.querySelector('.ae-cover').value = url
        updateImagePreview(row.querySelector('.ae-cover-preview'), row.querySelector('.ae-cover-remove'), url)
      } catch {
        row.querySelector('.ae-cover').value = cropped
        updateImagePreview(row.querySelector('.ae-cover-preview'), row.querySelector('.ae-cover-remove'), cropped)
      }
      syncEbooksFromDom()
      renderEbooksList()
      markDirty()
    }})
    return
  }

  if (e.target.classList.contains('ae-download-file')) {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''

    showToast('Enviando PDF...')
    let downloadValue = ''
    try {
      downloadValue = await uploadPdfToStorage(file)
    } catch {
      downloadValue = await readFileAsDataUrl(file)
      showToast('Não foi possível enviar ao servidor — PDF salvo localmente', 'error')
    }

    row.querySelector('.ae-download').value = downloadValue
    // atualiza badge
    const wrap = row.querySelector('.ae-dl-file-wrap')
    if (!wrap.querySelector('.ae-dl-file-badge')) {
      const badge = document.createElement('div')
      badge.className = 'ae-dl-file-badge'
      badge.innerHTML = `<i data-lucide="check-circle"></i> PDF enviado <button type="button" class="ae-dl-file-remove">✕</button>`
      wrap.insertBefore(badge, wrap.querySelector('label'))
      window.lucide?.createIcons()
    }
    wrap.querySelector('label i')?.setAttribute('data-lucide', 'upload')
    const labelNode = wrap.querySelector('label')?.childNodes
    if (labelNode?.[1]) labelNode[1].textContent = ' Substituir PDF'

    /* extrai título e descrição do PDF via PDF.js */
    if (window.pdfjsLib) {
      try {
        const pdfSrc = downloadValue.startsWith('data:') ? downloadValue : downloadValue
        const pdf = await window.pdfjsLib.getDocument(pdfSrc).promise

        const meta = await pdf.getMetadata().catch(() => ({}))
        const pdfTitle = meta?.info?.Title?.trim()
        const titleInput = row.querySelector('.ae-title')
        if (pdfTitle && !titleInput.value.trim()) {
          titleInput.value = pdfTitle
          row.querySelector('.ae-header-title strong').textContent = pdfTitle
        }

        const descInput = row.querySelector('.ae-description')
        if (!descInput.value.trim()) {
          let fullText = ''
          const pages = Math.min(pdf.numPages, 2)
          for (let p = 1; p <= pages; p++) {
            const page = await pdf.getPage(p)
            const content = await page.getTextContent()
            fullText += content.items.map(i => i.str).join(' ') + ' '
          }
          const clean = fullText.replace(/\s+/g, ' ').trim()
          const sentences = clean.match(/[^.!?]+[.!?]+/g) || []
          const desc = sentences.slice(0, 3).join(' ').trim()
          if (desc.length > 20) descInput.value = desc.slice(0, 300)
        }
      } catch {}
    }

    syncEbooksFromDom()
    renderEbooksList()
    markDirty()
    return
  }

  if (!e.target.classList.contains('ae-status')) return

  syncEbooksFromDom()
  renderEbooksList()
  markDirty()
})

ebooksEditorList.addEventListener('click', (e) => {
  const row = e.target.closest('.admin-ebook-card')
  if (!row) return
  const index = Number(row.dataset.index)

  /* abas link / arquivo */
  const dlTab = e.target.closest('.ae-dl-tab')
  if (dlTab) {
    const tab = dlTab.dataset.tab
    row.querySelectorAll('.ae-dl-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab))
    row.querySelector('.ae-dl-link-wrap').classList.toggle('hidden', tab !== 'link')
    row.querySelector('.ae-dl-file-wrap').classList.toggle('hidden', tab !== 'file')
    if (tab === 'link') {
      const linkVal = row.querySelector('.ae-download-link-input').value.trim()
      row.querySelector('.ae-download').value = linkVal
    }
    return
  }

  if (e.target.closest('.ae-dl-file-remove')) {
    row.querySelector('.ae-download').value = ''
    row.querySelector('.ae-dl-file-badge')?.remove()
    syncEbooksFromDom()
    markDirty()
    return
  }

  if (e.target.closest('.ae-cover-remove')) {
    row.querySelector('.ae-cover').value = ''
    updateImagePreview(row.querySelector('.ae-cover-preview'), row.querySelector('.ae-cover-remove'), '')
    markDirty()
    return
  }

  if (e.target.closest('.ae-pdf-cover-btn')) {
    const pdfSrc = row.querySelector('.ae-download').value.trim()
    if (!pdfSrc) {
      alert('Faça o upload do PDF primeiro para gerar a capa.')
      return
    }
    const btn = e.target.closest('.ae-pdf-cover-btn')
    btn.disabled = true
    btn.textContent = 'Gerando...'
    ;(async () => {
      try {
        const pdf = await window.pdfjsLib.getDocument(pdfSrc).promise
        const page = await pdf.getPage(1)
        const viewport = page.getViewport({ scale: 2 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92)

        try {
          showToast('Enviando capa gerada...')
          const url = await uploadToStorage(dataUrl, 'images', `ebook-cover-pdf-${Date.now()}.jpg`)
          row.querySelector('.ae-cover').value = url
          updateImagePreview(row.querySelector('.ae-cover-preview'), row.querySelector('.ae-cover-remove'), url)
        } catch {
          row.querySelector('.ae-cover').value = dataUrl
          updateImagePreview(row.querySelector('.ae-cover-preview'), row.querySelector('.ae-cover-remove'), dataUrl)
        }

        syncEbooksFromDom()
        renderEbooksList()
        markDirty()
      } catch {
        alert('Não foi possível gerar a capa. Verifique se o PDF foi carregado corretamente.')
      } finally {
        btn.disabled = false
        btn.innerHTML = '<i data-lucide="file-image"></i> Da 1ª pág. do PDF'
        window.lucide?.createIcons()
      }
    })()
    return
  }

  if (e.target.closest('.al-remove') || e.target.closest('.al-up') || e.target.closest('.al-down')) {
    syncEbooksFromDom()
    if (e.target.closest('.al-remove')) {
      if (index === expandedEbookIndex) expandedEbookIndex = null
      else if (expandedEbookIndex !== null && index < expandedEbookIndex) expandedEbookIndex--
      ebooksState.splice(index, 1)
    } else if (e.target.closest('.al-up') && index > 0) {
      ;[ebooksState[index - 1], ebooksState[index]] = [ebooksState[index], ebooksState[index - 1]]
      if (expandedEbookIndex === index) expandedEbookIndex = index - 1
      else if (expandedEbookIndex === index - 1) expandedEbookIndex = index
    } else if (e.target.closest('.al-down') && index < ebooksState.length - 1) {
      ;[ebooksState[index + 1], ebooksState[index]] = [ebooksState[index], ebooksState[index + 1]]
      if (expandedEbookIndex === index) expandedEbookIndex = index + 1
      else if (expandedEbookIndex === index + 1) expandedEbookIndex = index
    }
    renderEbooksList()
    markDirty()
    updateDashboardStats()
    return
  }

  if (e.target.closest('.ae-drag-handle')) return

  if (e.target.closest('.ae-header')) {
    expandedEbookIndex = expandedEbookIndex === index ? null : index
    renderEbooksList()
  }
})

addEbookBtn.addEventListener('click', () => {
  syncEbooksFromDom()
  ebooksState.push({ status: 'free', title: '', description: '', price: '', cover: '', downloadUrl: '', showInLinks: true })
  expandedEbookIndex = ebooksState.length - 1
  renderEbooksList()
  markDirty()
  updateDashboardStats()
  showToast('E-book criado')
})

/* ─── DRAG & DROP (reordenação) ─── */

function setupDragReorder(container, cardClass, getArray, onReordered) {
  let dragIndex = null

  container.addEventListener('dragstart', (e) => {
    const card = e.target.closest(`.${cardClass}`)
    if (!card) return
    dragIndex = Number(card.dataset.index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(dragIndex))
    requestAnimationFrame(() => card.classList.add('dragging'))
  })

  container.addEventListener('dragend', () => {
    container.querySelectorAll(`.${cardClass}`).forEach(c => {
      c.classList.remove('dragging', 'drag-over-top', 'drag-over-bottom')
    })
    dragIndex = null
  })

  container.addEventListener('dragover', (e) => {
    if (dragIndex === null) return
    e.preventDefault()
    const card = e.target.closest(`.${cardClass}`)
    if (!card) return
    container.querySelectorAll(`.${cardClass}`).forEach(c => c.classList.remove('drag-over-top', 'drag-over-bottom'))
    const overIndex = Number(card.dataset.index)
    if (overIndex === dragIndex) return
    const rect = card.getBoundingClientRect()
    const before = (e.clientY - rect.top) < rect.height / 2
    card.classList.add(before ? 'drag-over-top' : 'drag-over-bottom')
  })

  container.addEventListener('drop', (e) => {
    if (dragIndex === null) return
    e.preventDefault()
    const card = e.target.closest(`.${cardClass}`)
    container.querySelectorAll(`.${cardClass}`).forEach(c => c.classList.remove('dragging', 'drag-over-top', 'drag-over-bottom'))
    if (!card) { dragIndex = null; return }

    const overIndex = Number(card.dataset.index)
    if (overIndex !== dragIndex) {
      const rect = card.getBoundingClientRect()
      const before = (e.clientY - rect.top) < rect.height / 2
      let targetIndex = before ? overIndex : overIndex + 1
      if (dragIndex < targetIndex) targetIndex--

      if (targetIndex !== dragIndex) {
        const arr = getArray()
        const [moved] = arr.splice(dragIndex, 1)
        arr.splice(targetIndex, 0, moved)
        onReordered(dragIndex, targetIndex)
      }
    }
    dragIndex = null
  })
}

setupDragReorder(linksEditorList, 'admin-link-card', () => state.links, () => {
  renderLinksList()
  markDirty()
})

setupDragReorder(ebooksEditorList, 'admin-ebook-card', () => ebooksState, (from, to) => {
  if (expandedEbookIndex === from) {
    expandedEbookIndex = to
  } else if (expandedEbookIndex !== null) {
    if (from < to && expandedEbookIndex > from && expandedEbookIndex <= to) expandedEbookIndex--
    else if (from > to && expandedEbookIndex >= to && expandedEbookIndex < from) expandedEbookIndex++
  }
  renderEbooksList()
  markDirty()
})

/* ─── CONFIGURAÇÕES ─── */

resetBtn.addEventListener('click', async () => {
  if (!confirm('Restaurar os links, e-books e perfil para o padrão original? As alterações salvas no servidor serão perdidas.')) return

  saveBtn.disabled = true
  try {
    await supabaseAdmin.from('site_config').upsert({
      id: 'main',
      profile_name:     defaultProfile.name,
      profile_subtitle: defaultProfile.subtitle,
      profile_avatar:   defaultProfile.avatar,
      sobre_photo:      '',
    })
    await supabaseAdmin.from('links').delete().gt('position', -1)
    await supabaseAdmin.from('links').insert(
      defaultLinks.map((l, i) => ({
        position: i, label: l.label, url: l.url, icon: l.icon, is_primary: l.primary || false
      }))
    )
    await supabaseAdmin.from('ebooks').delete().gt('position', -1)
    await supabaseAdmin.from('ebooks').insert(
      defaultEbooks.map((e, i) => ({
        position: i, title: e.title, description: e.description, status: e.status,
        price: e.price, cover_url: e.cover, download_url: e.downloadUrl,
        show_in_links: e.showInLinks !== false,
      }))
    )

    state = { profile: { ...defaultProfile }, links: defaultLinks.map(l => ({ ...l })) }
    ebooksState = defaultEbooks.map(e => ({ ...e }))
    siteConfig = { sobrePhoto: '' }
    sobrePhotoPreview.src = '/eu-sou-a-bianca.jpeg'
    expandedEbookIndex = null

    renderEditor()
    markClean()
    showToast('Restaurado para o padrão')
  } catch (err) {
    showToast('Erro ao restaurar: ' + (err.message || ''), 'error')
  } finally {
    saveBtn.disabled = false
  }
})

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem(AUTH_KEY)
  showLogin()
})

/* ─── INIT ─── */
if (sessionStorage.getItem(AUTH_KEY) === '1') {
  showEditor()
} else {
  showLogin()
}

/* ─── LIGHTBOX DE IMAGENS NO PAINEL ─── */
;(function initAdminLightbox() {
  const lb = document.createElement('div')
  lb.className = 'adm-lightbox'
  lb.innerHTML = '<button class="adm-lightbox-close" aria-label="Fechar">✕</button><img alt="" />'
  document.body.appendChild(lb)

  const img = lb.querySelector('img')

  function open(src) {
    img.src = src
    lb.classList.add('open')
  }
  function close() {
    lb.classList.remove('open')
    setTimeout(() => { img.src = '' }, 250)
  }

  lb.addEventListener('click', (e) => { if (e.target === lb) close() })
  lb.querySelector('.adm-lightbox-close').addEventListener('click', close)
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close() })

  document.addEventListener('click', (e) => {
    const imgEl = e.target.closest('.admin-image-preview')
    if (!imgEl || !imgEl.src || imgEl.classList.contains('hidden')) return
    open(imgEl.src)
  })
})();
