export const EBOOKS_STORAGE_KEY = 'bv-ebooks-data'

export const defaultEbooks = [
  {
    status: 'free',
    title: 'O Que Toda Mãe Precisa Saber',
    description: 'Um guia para mães que querem entender melhor seus direitos sobre pensão alimentícia, guarda e convivência, com orientações práticas para decidir com mais segurança jurídica.',
    price: '',
    cover: '/ebook-mae-capa.jpg',
    downloadUrl: '/ebooks/o-que-toda-mae-precisa-saber.pdf',
  },
  {
    status: 'soon',
    title: '',
    description: 'Um novo material está em preparação. Em breve você encontrará aqui mais conteúdo para te ajudar a entender seus direitos.',
    price: '',
    cover: '',
    downloadUrl: '',
  },
]

export function loadEbooks() {
  try {
    const raw = localStorage.getItem(EBOOKS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return defaultEbooks.map(ebook => ({ ...ebook }))
}

export function saveEbooks(ebooks) {
  localStorage.setItem(EBOOKS_STORAGE_KEY, JSON.stringify(ebooks))
}

export function resetEbooks() {
  localStorage.removeItem(EBOOKS_STORAGE_KEY)
}
