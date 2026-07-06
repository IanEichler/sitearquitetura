const WA_NUMBER = '5566996216698'

const SERVICES = [
  'Divórcio e Dissolução de União Estável',
  'Guarda, Convivência e Pensão Alimentícia',
  'Inventário e Partilha de Bens',
  'Testamento e Planejamento Sucessório',
  'Pactos Antenupciais e Regime de Bens',
  'Reconhecimento de União Estável e Paternidade',
]

const STEPS = [
  {
    id: 'nome',
    counter: '01 — 03',
    question: 'Qual é o seu nome?',
    type: 'input',
    inputType: 'text',
    placeholder: 'Digite seu nome completo',
    required: true,
  },
  {
    id: 'telefone',
    counter: '02 — 03',
    question: 'Qual o seu WhatsApp?',
    type: 'input',
    inputType: 'tel',
    placeholder: '(XX) 9 9999-9999',
    required: true,
  },
  {
    id: 'servico',
    counter: '03 — 03',
    question: 'Qual área você precisa de ajuda?',
    type: 'options',
    required: true,
  },
  {
    id: 'descricao',
    counter: 'Quase lá',
    question: 'Conte brevemente sua situação',
    hint: 'Opcional — quanto mais você contar, melhor podemos te orientar.',
    type: 'textarea',
    placeholder: 'Ex: estou passando por um divórcio e preciso de orientação sobre a partilha de bens...',
    required: false,
  },
]

let state = { nome: '', telefone: '', servico: '', descricao: '' }
let currentStep = 0

export function initModal() {
  buildDOM()
  bindGlobalTriggers()
}

/* ─── BUILD DOM ─── */
function buildDOM() {
  const el = document.createElement('div')
  el.id = 'orcamentoModal'
  el.className = 'orc-modal'
  el.innerHTML = `
    <div class="orc-backdrop" id="orcBackdrop"></div>
    <div class="orc-card" role="dialog" aria-modal="true" aria-label="Agendar Consulta">
      <button class="orc-close" id="orcClose" aria-label="Fechar">
        <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      <div class="orc-progress-wrap">
        <div class="orc-progress-bar" id="orcProgressBar"></div>
      </div>

      <div class="orc-steps" id="orcSteps"></div>
    </div>
  `
  document.body.appendChild(el)

  document.getElementById('orcBackdrop').addEventListener('click', closeModal)
  document.getElementById('orcClose').addEventListener('click', closeModal)
  document.addEventListener('keydown', onKeyDown)

  renderStep(0)
}

/* ─── RENDER STEP ─── */
function renderStep(idx) {
  const step = STEPS[idx]
  const stepsEl = document.getElementById('orcSteps')
  const progress = ((idx) / STEPS.length) * 100

  document.getElementById('orcProgressBar').style.width = progress + '%'

  const html = `
    <div class="orc-step" data-step="${idx}">
      <span class="orc-counter">${step.counter}</span>
      <h2 class="orc-question">${step.question}</h2>
      ${step.hint ? `<p class="orc-hint">${step.hint}</p>` : ''}

      ${step.type === 'input' ? `
        <input
          class="orc-input"
          id="orcInput"
          type="${step.inputType}"
          placeholder="${step.placeholder}"
          value="${state[step.id] || ''}"
          autocomplete="${step.id === 'nome' ? 'name' : 'tel'}"
        />
        <div class="orc-error" id="orcError"></div>
        <button class="btn btn-primary orc-btn-next" id="orcNext">
          Continuar <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      ` : ''}

      ${step.type === 'options' ? `
        <div class="orc-options" id="orcOptions">
          ${SERVICES.map(s => `
            <button class="orc-option${state.servico === s ? ' selected' : ''}" data-value="${s}">${s}</button>
          `).join('')}
        </div>
      ` : ''}

      ${step.type === 'textarea' ? `
        <textarea
          class="orc-input orc-textarea"
          id="orcTextarea"
          placeholder="${step.placeholder}"
          rows="4"
        >${state.descricao || ''}</textarea>
        <button class="btn btn-whatsapp orc-btn-submit" id="orcSubmit">
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Enviar pelo WhatsApp
        </button>
      ` : ''}
    </div>
  `

  /* slide out atual → slide in novo */
  const old = stepsEl.querySelector('.orc-step')
  if (old) {
    old.classList.add('exit')
    setTimeout(() => {
      stepsEl.innerHTML = html
      bindStepEvents(idx)
      focusInput()
    }, 220)
  } else {
    stepsEl.innerHTML = html
    bindStepEvents(idx)
    focusInput()
  }
}

function focusInput() {
  setTimeout(() => {
    const inp = document.getElementById('orcInput') || document.getElementById('orcTextarea')
    inp?.focus()
  }, 60)
}

/* ─── BIND EVENTS ─── */
function bindStepEvents(idx) {
  const step = STEPS[idx]

  if (step.type === 'input') {
    const input = document.getElementById('orcInput')
    const btn   = document.getElementById('orcNext')

    if (step.id === 'telefone' && input) {
      input.addEventListener('input', () => {
        let digits = input.value.replace(/\D/g, '').slice(0, 11)
        if (digits.length <= 2) {
          input.value = digits.length ? `(${digits}` : ''
        } else if (digits.length <= 7) {
          input.value = `(${digits.slice(0,2)}) ${digits.slice(2)}`
        } else {
          const mid = digits.length === 11 ? 7 : 6
          input.value = `(${digits.slice(0,2)}) ${digits.slice(2, mid)}-${digits.slice(mid)}`
        }
      })
    }

    input?.addEventListener('keydown', e => { if (e.key === 'Enter') advance(idx) })
    btn?.addEventListener('click', () => advance(idx))
  }

  if (step.type === 'options') {
    document.querySelectorAll('.orc-option').forEach(btn => {
      btn.addEventListener('click', () => {
        state.servico = btn.dataset.value
        document.querySelectorAll('.orc-option').forEach(b => b.classList.remove('selected'))
        btn.classList.add('selected')
        setTimeout(() => advance(idx), 300)
      })
    })
  }

  if (step.type === 'textarea') {
    document.getElementById('orcTextarea')?.addEventListener('input', e => {
      state.descricao = e.target.value
    })
    document.getElementById('orcSubmit')?.addEventListener('click', submit)
  }
}

/* ─── ADVANCE ─── */
function advance(idx) {
  const step = STEPS[idx]
  const input = document.getElementById('orcInput')

  if (step.type === 'input') {
    const val = input?.value.trim() ?? ''
    if (step.required && !val) {
      showError(step.id === 'nome' ? 'Por favor, digite seu nome.' : 'Por favor, digite seu WhatsApp.')
      input?.focus()
      return
    }
    if (step.id === 'telefone' && val && !/[\d\s\(\)\-\+]{8,}/.test(val)) {
      showError('Digite um número válido.')
      input?.focus()
      return
    }
    state[step.id] = val
  }

  currentStep = idx + 1
  if (currentStep < STEPS.length) {
    renderStep(currentStep)
  }
}

function showError(msg) {
  const el = document.getElementById('orcError')
  if (el) { el.textContent = msg; el.classList.add('visible') }
}

/* ─── SUBMIT → WHATSAPP ─── */
function submit() {
  const ta = document.getElementById('orcTextarea')
  if (ta) state.descricao = ta.value.trim()

  const lines = [
    `Olá, Bianca Viana! Vim pelo site.`,
    ``,
    `*Nome:* ${state.nome}`,
    `*WhatsApp:* ${state.telefone}`,
    `*Área de interesse:* ${state.servico}`,
  ]
  if (state.descricao) {
    lines.push(``, `*Situação:*`, state.descricao)
  }

  const text = encodeURIComponent(lines.join('\n'))
  window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, '_blank')

  /* atualiza progress a 100% e mostra confirmação */
  document.getElementById('orcProgressBar').style.width = '100%'
  document.getElementById('orcSteps').innerHTML = `
    <div class="orc-step orc-done">
      <div class="orc-done-icon">
        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2 class="orc-question">Mensagem enviada!</h2>
      <p class="orc-hint">O WhatsApp foi aberto com sua mensagem.<br/>Aguarde nosso contato em breve.</p>
      <button class="btn btn-primary" id="orcDoneClose">Fechar</button>
    </div>
  `
  document.getElementById('orcDoneClose')?.addEventListener('click', closeModal)
}

/* ─── OPEN / CLOSE ─── */
export function openModal() {
  state = { nome: '', telefone: '', servico: '', descricao: '' }
  currentStep = 0
  renderStep(0)

  const modal = document.getElementById('orcamentoModal')
  modal.classList.add('open')
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  document.getElementById('orcamentoModal')?.classList.remove('open')
  document.body.style.overflow = ''
}

function onKeyDown(e) {
  if (e.key === 'Escape') closeModal()
}

/* ─── BIND TRIGGERS ─── */
function bindGlobalTriggers() {
  document.addEventListener('click', e => {
    if (e.target.closest('[data-modal="orcamento"]')) {
      e.preventDefault()
      openModal()
    }
  })
}
