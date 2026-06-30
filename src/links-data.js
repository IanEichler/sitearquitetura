import { supabase } from './supabase.js'

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
  subtitle: 'Advocacia de Família e Sucessões\nAtendimento em todo o Brasil',
  avatar: '/eu-sou-a-bianca.jpeg',
}

export const defaultLinks = [
  {
    icon: 'calendar-check',
    label: 'Conheça meu trabalho e agende seu horário comigo',
    url: 'https://wa.me/5566996216698?text=Ol%C3%A1%2C%20Bianca%20Viana!%20Vim%20pelo%20link%20da%20bio%20e%20gostaria%20de%20agendar%20uma%20consulta.',
    primary: true,
  },
  {
    icon: 'users',
    label: 'Mentoria, parcerias e consultoria de caso (para advogadas)',
    url: 'https://wa.me/5566996216698?text=Ol%C3%A1%2C%20Bianca%20Viana!%20Vim%20pelo%20link%20da%20bio%20e%20tenho%20interesse%20em%20mentoria%2C%20parceria%20ou%20consultoria%20de%20caso.',
    primary: false,
  },
]

export async function loadData() {
  try {
    const [configResult, linksResult] = await Promise.all([
      supabase.from('site_config').select('*').eq('id', 'main').single(),
      supabase.from('links').select('*').order('position'),
    ])

    const cfg = configResult.data
    const profile = cfg
      ? {
          name:     cfg.profile_name     || defaultProfile.name,
          subtitle: cfg.profile_subtitle || defaultProfile.subtitle,
          avatar:   cfg.profile_avatar   || defaultProfile.avatar,
        }
      : { ...defaultProfile }

    const rawLinks = linksResult.data || []
    const links = rawLinks.length
      ? rawLinks.map(l => ({ icon: l.icon || 'link', label: l.label, url: l.url, primary: l.is_primary }))
      : defaultLinks.map(l => ({ ...l }))

    return { profile, links, sobrePhoto: cfg?.sobre_photo || '' }
  } catch {
    return { profile: { ...defaultProfile }, links: defaultLinks.map(l => ({ ...l })), sobrePhoto: '' }
  }
}
