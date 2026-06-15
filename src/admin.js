import { loadData, saveData, resetData, defaultProfile, defaultLinks, iconOptions } from './links-data.js'

/* Senha de acesso ao painel — altere aqui se necessário */
const ADMIN_PASSWORD = 'biancaviana2026'
const AUTH_KEY = 'bv-admin-auth'

const loginScreen  = document.getElementById('adminLogin')
const editorScreen = document.getElementById('adminEditor')
const loginForm    = document.getElementById('loginForm')
const passwordInput = document.getElementById('adminPassword')
const loginError   = document.getElementById('adminError')

const profileNameInput     = document.getElementById('profileName')
const profileSubtitleInput = document.getElementById('profileSubtitle')
const profileAvatarInput   = document.getElementById('profileAvatar')
const linksEditorList      = document.getElementById('linksEditorList')
const addLinkBtn            = document.getElementById('addLinkBtn')
const saveBtn               = document.getElementById('saveBtn')
const resetBtn              = document.getElementById('resetBtn')
const saveStatus            = document.getElementById('saveStatus')
const logoutBtn              = document.getElementById('logoutBtn')

let state = loadData()

function showEditor() {
  loginScreen.classList.add('hidden')
  editorScreen.classList.remove('hidden')
  renderEditor()
}

function showLogin() {
  editorScreen.classList.add('hidden')
  loginScreen.classList.remove('hidden')
  passwordInput.value = ''
  passwordInput.focus()
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault()
  if (passwordInput.value === ADMIN_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, '1')
    loginError.classList.add('hidden')
    showEditor()
  } else {
    loginError.classList.remove('hidden')
  }
})

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem(AUTH_KEY)
  showLogin()
})

function renderEditor() {
  profileNameInput.value = state.profile.name
  profileSubtitleInput.value = state.profile.subtitle
  profileAvatarInput.value = state.profile.avatar
  renderLinksList()
}

function renderLinksList() {
  linksEditorList.innerHTML = state.links.map((link, i) => {
    const isKnown = iconOptions.some(opt => opt.value === link.icon)
    const optionsHtml = iconOptions.map(opt =>
      `<option value="${opt.value}" ${link.icon === opt.value ? 'selected' : ''}>${opt.label}</option>`
    ).join('')

    return `
    <div class="admin-link-row" data-index="${i}">
      <div class="al-icon-cell">
        <div class="al-icon-row">
          <span class="al-icon-preview"><i data-lucide="${escapeAttr(isKnown ? link.icon : (link.icon || 'link'))}"></i></span>
          <select class="al-icon">
            ${optionsHtml}
            <option value="__custom__" ${!isKnown ? 'selected' : ''}>Outro (avançado)</option>
          </select>
        </div>
        <input type="text" class="al-icon-custom ${isKnown ? 'hidden' : ''}" placeholder="nome-do-ícone (lucide.dev/icons)" value="${escapeAttr(isKnown ? '' : link.icon)}" />
      </div>
      <input type="text" class="al-label" placeholder="Texto do botão" value="${escapeAttr(link.label)}" />
      <input type="url" class="al-url" placeholder="https://..." value="${escapeAttr(link.url)}" />
      <label class="al-primary">
        <input type="checkbox" class="al-primary-check" ${link.primary ? 'checked' : ''} />
        Destaque
      </label>
      <div class="al-controls">
        <button type="button" class="al-up" title="Mover para cima" ${i === 0 ? 'disabled' : ''}>↑</button>
        <button type="button" class="al-down" title="Mover para baixo" ${i === state.links.length - 1 ? 'disabled' : ''}>↓</button>
        <button type="button" class="al-remove" title="Remover">✕</button>
      </div>
    </div>
  `
  }).join('')

  window.lucide?.createIcons()
}

function escapeAttr(str) {
  const div = document.createElement('div')
  div.textContent = str ?? ''
  return div.innerHTML.replace(/"/g, '&quot;')
}

function syncLinksFromDom() {
  const rows = linksEditorList.querySelectorAll('.admin-link-row')
  state.links = Array.from(rows).map(row => {
    const select = row.querySelector('.al-icon')
    const custom = row.querySelector('.al-icon-custom')
    const icon = select.value === '__custom__' ? custom.value.trim() : select.value
    return {
      icon,
      label: row.querySelector('.al-label').value.trim(),
      url: row.querySelector('.al-url').value.trim(),
      primary: row.querySelector('.al-primary-check').checked,
    }
  })
}

function updateIconPreview(row, iconName) {
  const preview = row.querySelector('.al-icon-preview')
  preview.innerHTML = `<i data-lucide="${escapeAttr(iconName || 'link')}"></i>`
  window.lucide?.createIcons()
}

linksEditorList.addEventListener('change', (e) => {
  if (!e.target.classList.contains('al-icon')) return
  const row = e.target.closest('.admin-link-row')
  const customInput = row.querySelector('.al-icon-custom')
  if (e.target.value === '__custom__') {
    customInput.classList.remove('hidden')
    customInput.focus()
    updateIconPreview(row, customInput.value.trim())
  } else {
    customInput.classList.add('hidden')
    updateIconPreview(row, e.target.value)
  }
})

linksEditorList.addEventListener('input', (e) => {
  if (!e.target.classList.contains('al-icon-custom')) return
  updateIconPreview(e.target.closest('.admin-link-row'), e.target.value.trim())
})

linksEditorList.addEventListener('click', (e) => {
  const row = e.target.closest('.admin-link-row')
  if (!row) return
  syncLinksFromDom()
  const index = Array.from(linksEditorList.children).indexOf(row)

  if (e.target.classList.contains('al-remove')) {
    state.links.splice(index, 1)
    renderLinksList()
  } else if (e.target.classList.contains('al-up') && index > 0) {
    ;[state.links[index - 1], state.links[index]] = [state.links[index], state.links[index - 1]]
    renderLinksList()
  } else if (e.target.classList.contains('al-down') && index < state.links.length - 1) {
    ;[state.links[index + 1], state.links[index]] = [state.links[index], state.links[index + 1]]
    renderLinksList()
  }
})

addLinkBtn.addEventListener('click', () => {
  syncLinksFromDom()
  state.links.push({ icon: 'link', label: 'Novo link', url: 'https://', primary: false })
  renderLinksList()
})

saveBtn.addEventListener('click', () => {
  syncLinksFromDom()
  state.profile = {
    name: profileNameInput.value.trim(),
    subtitle: profileSubtitleInput.value,
    avatar: profileAvatarInput.value.trim(),
  }
  saveData(state)
  saveStatus.classList.add('show')
  setTimeout(() => saveStatus.classList.remove('show'), 2200)
})

resetBtn.addEventListener('click', () => {
  if (!confirm('Restaurar os links para o padrão original? As alterações salvas serão perdidas.')) return
  resetData()
  state = {
    profile: { ...defaultProfile },
    links: defaultLinks.map(link => ({ ...link })),
  }
  renderEditor()
})

/* ─── INIT ─── */
if (sessionStorage.getItem(AUTH_KEY) === '1') {
  showEditor()
} else {
  showLogin()
}
