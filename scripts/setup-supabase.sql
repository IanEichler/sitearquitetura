-- ════════════════════════════════════════════════════════
-- Bianca Viana Advocacia — Setup do Banco Supabase
-- Execute no Supabase Dashboard → SQL Editor → New Query
-- ════════════════════════════════════════════════════════

-- 1. TABELAS ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.links (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  position integer NOT NULL DEFAULT 0,
  label text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  icon text DEFAULT 'link',
  is_primary boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.ebooks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  position integer NOT NULL DEFAULT 0,
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  cover_url text DEFAULT '',
  download_url text DEFAULT '',
  status text DEFAULT 'free',
  price text DEFAULT '',
  show_in_links boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.site_config (
  id text PRIMARY KEY DEFAULT 'main',
  profile_name text DEFAULT 'Bianca Viana',
  profile_subtitle text DEFAULT '',
  profile_avatar text DEFAULT '/eu-sou-a-bianca.jpeg',
  sobre_photo text DEFAULT ''
);

-- 2. HABILITAR RLS ────────────────────────────────────────

ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS — leitura e escrita públicas
--    (o controle de acesso ao admin é feito pela senha no painel)

CREATE POLICY "Public read links"       ON public.links       FOR SELECT USING (true);
CREATE POLICY "Public write links"      ON public.links       FOR ALL    USING (true) WITH CHECK (true);
CREATE POLICY "Public read ebooks"      ON public.ebooks      FOR SELECT USING (true);
CREATE POLICY "Public write ebooks"     ON public.ebooks      FOR ALL    USING (true) WITH CHECK (true);
CREATE POLICY "Public read config"      ON public.site_config FOR SELECT USING (true);
CREATE POLICY "Public write config"     ON public.site_config FOR ALL    USING (true) WITH CHECK (true);

-- 4. BUCKETS DE STORAGE ──────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('ebooks-files', 'ebooks-files', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read images"       ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Public upload images"     ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');
CREATE POLICY "Public update images"     ON storage.objects FOR UPDATE USING (bucket_id = 'images');
CREATE POLICY "Public delete images"     ON storage.objects FOR DELETE USING (bucket_id = 'images');

CREATE POLICY "Public read ebooks-files"   ON storage.objects FOR SELECT USING (bucket_id = 'ebooks-files');
CREATE POLICY "Public upload ebooks-files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ebooks-files');
CREATE POLICY "Public delete ebooks-files" ON storage.objects FOR DELETE USING (bucket_id = 'ebooks-files');

-- 5. DADOS PADRÃO ─────────────────────────────────────────

INSERT INTO public.site_config (id, profile_name, profile_subtitle, profile_avatar, sobre_photo)
VALUES (
  'main',
  'Bianca Viana',
  'Advocacia de Família e Sucessões' || E'\n' || 'Atendimento em todo o Brasil',
  '/eu-sou-a-bianca.jpeg',
  ''
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.links (position, label, url, icon, is_primary) VALUES
(0, 'Conheça meu trabalho e agende seu horário comigo', 'https://wa.me/5566996216698?text=Ol%C3%A1%2C%20Bianca%20Viana!%20Vim%20pelo%20link%20da%20bio%20e%20gostaria%20de%20agendar%20uma%20consulta.', 'calendar-check', true),
(1, 'Mentoria, parcerias e consultoria de caso (para advogadas)', 'https://wa.me/5566996216698?text=Ol%C3%A1%2C%20Bianca%20Viana!%20Vim%20pelo%20link%20da%20bio%20e%20tenho%20interesse%20em%20mentoria%2C%20parceria%20ou%20consultoria%20de%20caso.', 'users', false);

INSERT INTO public.ebooks (position, title, description, status, price, cover_url, download_url, show_in_links) VALUES
(0, 'O Que Toda Mãe Precisa Saber', 'Um guia para mães que querem entender melhor seus direitos sobre pensão alimentícia, guarda e convivência, com orientações práticas para decidir com mais segurança jurídica.', 'free', '', '/ebook-mae-capa.jpg', '/ebooks/o-que-toda-mae-precisa-saber.pdf', true),
(1, '', 'Um novo material está em preparação. Em breve você encontrará aqui mais conteúdo para te ajudar a entender seus direitos.', 'soon', '', '', '', false);
