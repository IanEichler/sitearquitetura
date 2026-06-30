import { supabase } from './supabase.js'

export const defaultEbooks = [
  {
    status: 'free',
    title: 'O Que Toda Mãe Precisa Saber',
    description: 'Um guia para mães que querem entender melhor seus direitos sobre pensão alimentícia, guarda e convivência, com orientações práticas para decidir com mais segurança jurídica.',
    price: '',
    cover: '/ebook-mae-capa.jpg',
    downloadUrl: '/ebooks/o-que-toda-mae-precisa-saber.pdf',
    showInLinks: true,
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

export async function loadEbooks() {
  try {
    const { data, error } = await supabase.from('ebooks').select('*').order('position')
    if (error || !data?.length) return defaultEbooks.map(e => ({ ...e }))
    return data.map(e => ({
      status:      e.status      || 'free',
      title:       e.title       || '',
      description: e.description || '',
      price:       e.price       || '',
      cover:       e.cover_url   || '',
      downloadUrl: e.download_url || '',
      showInLinks: e.show_in_links !== false,
    }))
  } catch {
    return defaultEbooks.map(e => ({ ...e }))
  }
}
