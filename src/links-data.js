export const STORAGE_KEY = 'bv-links-data'

/* Ícones disponíveis no painel — rótulo em português → nome do ícone (lucide.dev/icons) */
export const iconOptions = [
  { value: 'calendar-check', label: 'Agenda / Consulta' },
  { value: 'message-circle', label: 'WhatsApp / Mensagem' },
  { value: 'phone',          label: 'Telefone' },
  { value: 'mail',           label: 'E-mail' },
  { value: 'globe',          label: 'Site' },
  { value: 'instagram',      label: 'Instagram' },
  { value: 'map-pin',        label: 'Localização' },
  { value: 'scale',          label: 'Jurídico / Balança' },
  { value: 'gavel',          label: 'Processo / Martelo' },
  { value: 'file-text',      label: 'Documento' },
  { value: 'book-open',      label: 'E-book / Artigo' },
  { value: 'video',          label: 'Vídeo' },
  { value: 'users',          label: 'Pessoas / Equipe' },
  { value: 'briefcase',      label: 'Profissional / Maleta' },
  { value: 'landmark',       label: 'Escritório / Instituição' },
  { value: 'newspaper',      label: 'Notícias / Blog' },
  { value: 'heart',          label: 'Coração' },
  { value: 'star',           label: 'Destaque / Estrela' },
  { value: 'badge-check',    label: 'Verificado' },
  { value: 'share-2',        label: 'Compartilhar' },
  { value: 'send',           label: 'Enviar' },
  { value: 'link',           label: 'Link genérico' },
]

export const defaultProfile = {
  name: 'Bianca Viana',
  subtitle: 'Advocacia de Família e Sucessões\nAtendimento 100% Online · Todo o Brasil',
  avatar: '/eu-sou-a-bianca.jpeg',
}

export const defaultLinks = [
  {
    icon: 'calendar-check',
    label: 'Conheça meu trabalho e agende seu horário comigo',
    url: 'https://wa.me/5566996781296?text=Ol%C3%A1%2C%20Bianca%20Viana!%20Vim%20pelo%20link%20da%20bio%20e%20gostaria%20de%20agendar%20uma%20consulta.',
    primary: true,
  },
  {
    icon: 'users',
    label: 'Mentoria, parcerias e consultoria de caso (para advogadas)',
    url: 'https://wa.me/5566996781296?text=Ol%C3%A1%2C%20Bianca%20Viana!%20Vim%20pelo%20link%20da%20bio%20e%20tenho%20interesse%20em%20mentoria%2C%20parceria%20ou%20consultoria%20de%20caso.',
    primary: false,
  },
  {
    icon: 'book-open',
    label: 'E-book gratuito: O Que Toda Mãe Precisa Saber sobre pensão, guarda, convivência e segurança jurídica',
    url: '/index.html#ebooks',
    primary: false,
  },
  { icon: 'book-open', label: 'E-book', url: '/index.html#ebooks', primary: false },
  { icon: 'book-open', label: 'E-book', url: '/index.html#ebooks', primary: false },
]

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.profile && Array.isArray(parsed.links)) {
        if (parsed.profile.avatar === '/eu-sou-a-bianca.png') {
          parsed.profile.avatar = '/eu-sou-a-bianca.jpeg'
        }
        parsed.links = parsed.links.filter(l =>
          !l.label.toLowerCase().includes('instagram') && l.icon !== 'instagram' && l.icon !== 'camera'
        )
        return parsed
      }
    }
  } catch {}
  return {
    profile: { ...defaultProfile },
    links: defaultLinks.map(link => ({ ...link })),
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function resetData() {
  localStorage.removeItem(STORAGE_KEY)
}
