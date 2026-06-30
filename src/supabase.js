import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://csnqjgzgbclxbhygntcm.supabase.co'
const ANON_KEY = 'sb_publishable_pyoTUvBDqqugbP7thQvEqg_wbzwspHM'

// Cliente único com chave pública — leitura e escrita via RLS
export const supabase = createClient(SUPABASE_URL, ANON_KEY)

// Alias para o admin (mesma chave — RLS permite escrita para conteúdo público)
export const supabaseAdmin = supabase
