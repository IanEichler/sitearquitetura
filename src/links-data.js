export const STORAGE_KEY = 'bv-links-data'

export const defaultProfile = {
  name: 'Bianca Viana',
  subtitle: 'Advocacia de Família e Sucessões\nAtendimento 100% Online · Todo o Brasil',
  avatar: '/eu-sou-a-bianca.png',
}

export const defaultLinks = [
  {
    icon: 'calendar-check',
    label: 'Agende sua Consulta',
    url: 'https://wa.me/55XXXXXXXXXXX?text=Ol%C3%A1%2C%20Bianca%20Viana!%20Vim%20pelo%20link%20da%20bio%20e%20gostaria%20de%20agendar%20uma%20consulta.',
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
      if (parsed && parsed.profile && Array.isArray(parsed.links)) return parsed
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
