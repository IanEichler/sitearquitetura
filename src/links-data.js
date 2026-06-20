export const STORAGE_KEY = 'bv-links-data'

/* Ícones disponíveis no painel — rótulo em português → nome do ícone (lucide.dev/icons) */
export const iconOptions = [
  { value: 'calendar-check', label: 'Agenda / Consulta' },
  { value: 'message-circle', label: 'WhatsApp / Mensagem' },
  { value: 'phone',          label: 'Telefone' },
  { value: 'mail',           label: 'E-mail' },
  { value: 'globe',          label: 'Site' },
  { value: 'camera',         label: 'Instagram / Foto' },
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
    label: 'Agende sua Consulta',
    url: 'https://wa.me/5566996781296?text=Ol%C3%A1%2C%20Bianca%20Viana!%20Vim%20pelo%20link%20da%20bio%20e%20gostaria%20de%20agendar%20uma%20consulta.',
    primary: true,
  },
  { icon: 'globe', label: 'Site Oficial', url: '/index.html', primary: false },
  { icon: 'scale', label: 'Áreas de Atuação', url: '/index.html#servicos', primary: false },
  { icon: 'book-open', label: 'E-books Gratuitos', url: '/index.html#ebooks', primary: false },
  { icon: 'camera', label: 'Instagram', url: 'https://instagram.com/biancavianaadvogada', primary: false },
  { icon: 'mail', label: 'E-mail', url: 'mailto:contato@biancavianaadvogada.com.br', primary: false },
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
