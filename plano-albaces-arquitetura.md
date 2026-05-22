# Plano de Desenvolvimento — Albaces Arquitetura
**Referência: Site Orthogonal Studio (Behance, 2026)**

---

## 1. Identidade Visual

### Paleta de Cores

| Token | Hex | Uso |
|---|---|---|
| `--navy` | `#0B1F3A` | Fundo seções escuras, navbar scrolled |
| `--blue-accent` | `#1558B0` | Botões primários, badges, destaques |
| `--white` | `#FFFFFF` | Fundo das seções claras |
| `--off-white` | `#F7F8FA` | Fundo de seções alternadas |
| `--gray-100` | `#EEF0F4` | Bordas de cards, fundos de ícones |
| `--gray-400` | `#8A93A6` | Textos secundários e legendas |
| `--gold` | `#C9963A` | Números, detalhes, badges dourados |

### Tipografia

| Papel | Fonte | Peso | Uso |
|---|---|---|---|
| Display / Headings | **Syne** | 700–800 | Títulos H1, H2, logo, números |
| Body / UI | **DM Sans** | 300–500 | Parágrafos, navegação, botões |

> Contraste entre Syne ultra-bold nos títulos e DM Sans light no corpo = sofisticação sem esforço.

### Logo

Wordmark `ALBACES` em Syne 800 + símbolo geométrico: quadrado 32×32px com borda dourada rotacionado 45°, inicial "A" dentro. Versão branca para fundos navy, versão navy para fundos claros.

---

## 2. Arquitetura de Páginas

```
/              → Home (landing page completa)
/projetos      → Portfólio com grid e filtros
/projeto/[slug]→ Case individual com galeria
/sobre         → Sobre o escritório e equipe
/servicos      → Serviços detalhados
/contato       → Formulário, mapa e WhatsApp
```

---

## 3. Navbar

**Comportamento:**
- `position: fixed top-0`, fundo transparente no topo da página
- Ao rolar 80px: `background: rgba(11,31,58,0.97)` + `backdrop-filter: blur(12px)` + sombra sutil
- Altura: 72px

**Layout:**
```
[LOGO MARK] ALBACES    Sobre  Serviços  Projetos  Contato   [Orçamento Grátis]
```

**Detalhes:**
- Links com underline animado dourado no hover (`width: 0 → 100%`, transition 0.3s)
- Botão "Orçamento Grátis": fundo `#1A6FD4`, border-radius 8px, hover escurece
- Menu mobile: hambúrguer → overlay fullscreen navy, links em Syne 700, 36px

---

## 4. Hero Section

**Visual:** Tela cheia `100vh`. Fundo navy com imagem de projeto em overlay (~22% opacidade). Gradiente da base para cima (navy sólido → transparente) para legibilidade do texto.

**Conteúdo (de cima para baixo):**

1. Badge pill — "Rondonópolis, Mato Grosso" (fundo `rgba(255,255,255,0.10)`, bullet dourado)
2. Headline em Syne 800, `clamp(42px, 6vw, 78px)`, tracking `-0.02em`:
   ```
   Transformamos
   sua visão em
   arquitetura real.
   ```
3. Subtexto: DM Sans 300, 17px, `rgba(255,255,255,0.65)`, max-width 520px
4. Dois botões:
   - **Ver Projetos →** — primário azul sólido
   - **Falar no WhatsApp** — outline branco, hover `rgba(255,255,255,0.08)`
5. Scroll indicator: linha vertical pulsante + texto "SCROLL" uppercase 11px, centrado no bottom

**Animações de entrada:** `opacity: 0→1` + `translateY(28px→0)`, delays escalonados:
badge 0.2s, h1 0.4s, parágrafo 0.6s, botões 0.8s, scroll indicator 1.2s.

---

## 5. Stats Bar

Faixa logo abaixo do hero. Fundo navy `#0B1F3A`. `border-top: rgba(255,255,255,0.08)`. Padding 48px vertical.

**Grid 4 colunas com divisores verticais:**

| Número | Label |
|---|---|
| `+120` | Projetos Entregues |
| `+8 anos` | de Experiência |
| `4` | Cidades Atendidas |
| `100%` | Satisfação Garantida |

- Números: Syne 800, 42px, branco. Símbolo (`+`, `%`, `anos`) em dourado.
- Labels: uppercase, 13px, `rgba(255,255,255,0.5)`.
- Animação: count-up ao entrar na viewport (IntersectionObserver + requestAnimationFrame).
- Divisores: `1px solid rgba(255,255,255,0.10)` entre colunas.

---

## 6. Sobre / Quem Somos

**Background:** `#FFFFFF`

**Layout 2 colunas (`1fr 1fr`), gap 80px, `align-items: center`:**

**Coluna esquerda — Imagem:**
- Foto do escritório ou projeto em andamento
- `height: 480px`, `border-radius: 14px`, `object-fit: cover`
- Badge flutuante `bottom: 24px, left: -24px`: fundo navy, `border-radius: 14px`, padding 20px 28px
  - Número Syne 800, 28px, dourado (ex: `+120`)
  - Subtexto DM Sans 300, 13px, `rgba(255,255,255,0.6)` ("projetos realizados")

**Coluna direita — Texto:**
- Badge de seção: linha azul 24px + "SOBRE NÓS" uppercase 12px azul
- H2 Syne 800: "Arquitetura que **respeita** quem você é" — palavra destaque em azul
- 2 parágrafos: DM Sans 300, 16px, `#4A5168`, line-height 1.8
- 3 features com ícone (40×40px, fundo `#EEF0F4`, border-radius 8px) + título bold + subtexto muted:
  - 📐 **Projeto Completo** — Do estudo preliminar à entrega da obra
  - 🎨 **Renders 3D Realistas** — Veja seu projeto antes de construir
  - 🏗️ **Acompanhamento de Obra** — Supervisão técnica em todas as etapas

---

## 7. Serviços

**Background:** `#F7F8FA`

**Header da seção:** badge + H2 à esquerda | subtexto de apoio à direita (`justify-content: space-between`).

**Grid 3×2 de cards:**
- Background `#FFFFFF`, `border: 1px solid #D8DCE5`, `border-radius: 14px`, padding `36px 32px`
- Hover: `translateY(-6px)` + sombra `0 24px 48px rgba(11,31,58,0.10)` + borda desaparece
- Barra azul `height: 3px` no topo do card: `scaleX(0→1)` no hover, `transform-origin: left`

**Conteúdo de cada card:**
- Número sequencial em Syne, cor `#D8DCE5`: `01`, `02`...
- Emoji ícone 28px
- Título H3 em Syne 700, 20px, cor navy
- Descrição: DM Sans 300, 14px, `#8A93A6`

**Os 6 cards:**

1. 🏡 **Projeto Residencial** — Casas e apartamentos projetados com personalidade, conforto e eficiência
2. 🏢 **Projeto Comercial** — Espaços que reforçam a identidade da sua marca
3. 🛋️ **Design de Interiores** — Seleção de materiais, cores e mobiliário alinhados ao seu estilo
4. 🎯 **Renderização 3D** — Visualize seu projeto com detalhes realistas antes de construir
5. 🔧 **Reforma e Retrofit** — Revitalização de espaços com modernização funcional e estética
6. 📋 **Consultoria** — Orientação técnica especializada para decisões em projetos e investimentos

---

## 8. Portfólio Destaque

**Background:** `#FFFFFF`

**Filtros:** pills com borda cinza. Active/hover: fundo navy + texto branco.
Opções: `Todos` | `Residencial` | `Comercial` | `Interiores` | `3D`

**Grid editorial (base 12 colunas):**

```
[ Projeto 1 ─ 8 colunas ─ 420px ]  [ Projeto 2 ─ 4 colunas ─ 420px ]
[ Proj 3 ─ 4col ─ 320px ]  [ Proj 4 ─ 4col ─ 320px ]  [ Proj 5 ─ 4col ─ 320px ]
```

**Cada card:**
- `border-radius: 14px`, `overflow: hidden`
- Hover imagem: `scale(1.06)`, `transition: 0.6s ease`
- Overlay gradiente navy→transparente de baixo para cima: `opacity: 0→1` no hover
- Info na base com `translateY(8px→0)` + opacity no hover:
  - Tag pill azul (tipo do projeto)
  - Título Syne 700 branco
  - Local e ano: DM Sans 300, `rgba(255,255,255,0.6)`

**Cursor customizado global:**
- Dot azul 12px + ring azul 36px, `position: fixed`, seguem o mouse
- Hover em links/cards: dot → 18px, ring → 50px

**CTA:** botão "Ver Todos os Projetos →" centralizado, estilo primário azul.

---

## 9. Processo (Como Trabalhamos)

**Background:** navy `#0B1F3A`. Padding 100px vertical.

**Linha conectora:** `position: absolute`, horizontal em `top: 36px`, cor `rgba(255,255,255,0.15)`.
Animação: preenche da esquerda para direita via SVG `stroke-dashoffset` (GSAP ScrollTrigger).

**5 steps em grid horizontal:**

Cada step contém:
- Círculo 72×72px: `border: 1px solid rgba(255,255,255,0.15)`, fundo `rgba(255,255,255,0.05)`
- Hover: fundo azul `#1A6FD4`, borda azul, `scale(1.1)`, transition 0.3s
- Emoji ícone 22px dentro do círculo
- Número `01–05` em dourado, `position: absolute` no canto superior direito do círculo
- Título H4: Syne 700, 15px, branco
- Descrição: DM Sans 300, 13px, `rgba(255,255,255,0.45)`

**As 5 etapas:**

1. 💬 **Briefing** — Entendemos sua visão, necessidades e estilo de vida
2. ✏️ **Conceito** — Estudos de viabilidade e anteprojeto inicial
3. 📐 **Projeto** — Desenvolvimento técnico completo com renders 3D
4. 🏗️ **Execução** — Acompanhamento técnico durante toda a obra
5. 🎉 **Entrega** — Seu espaço realizado exatamente como planejado

---

## 10. Depoimentos

**Background:** `#F7F8FA`

**Grid 3 colunas de cards:**
- Fundo branco, `border: 1px solid #D8DCE5`, `border-radius: 14px`, padding 36px
- Estrelas douradas no topo: `★★★★★`, 14px, letter-spacing 2px
- Citação: DM Sans 300 italic, 15px, `#4A5168`, line-height 1.75
  - Aspas decorativas em Syne 800, 48px, cor `#D8DCE5`, float left
- Author row:
  - Avatar 44px circular: inicial Syne 700 dourada, fundo navy
  - Nome: DM Sans 600, 14px
  - Projeto realizado: DM Sans 300, 13px, `#8A93A6`

---

## 11. CTA de Conversão

**Background:** navy `#0B1F3A` com imagem de projeto `opacity: 0.12`. Conteúdo centralizado.

**Conteúdo:**

1. Badge dourado: "Pronto para começar?"
2. Headline Syne 800, `clamp(36px, 5vw, 62px)`:
   ```
   Transforme seu espaço em
   algo extraordinário.
   ```
3. Subtexto: DM Sans 300, 17px, `rgba(255,255,255,0.55)`, max-width 500px
4. Dois botões:
   - **🟢 WhatsApp — Falar Agora**: fundo `#25D366`, hover escurece + sombra verde
   - **Solicitar Orçamento**: fundo `rgba(255,255,255,0.08)`, borda `rgba(255,255,255,0.20)`

---

## 12. Footer

**Background:** `#060F1E`

**Grid 4 colunas (`2fr + 1fr + 1fr + 1fr`), gap 48px:**

- Col 1: Logo + tagline + parágrafo breve (DM Sans 300, `rgba(255,255,255,0.4)`, max-width 280px)
- Col 2: **Navegação** — Sobre | Serviços | Projetos | Contato
- Col 3: **Serviços** — Residencial | Comercial | Interiores | 3D | Retrofit
- Col 4: **Contato** — Parque Sagrada Família, Rondonópolis-MT | (66) 99973-1937

**Links:** DM Sans 300, 14px, `rgba(255,255,255,0.45)` → hover `rgba(255,255,255,0.9)`.

**Rodapé final:** `border-top: 1px solid rgba(255,255,255,0.07)`.
Esquerda: © 2025 Albaces Arquitetura. Direita: créditos do desenvolvedor.

---

## 13. Elementos Globais

### Cursor Customizado
```css
#cursor {
  position: fixed;
  width: 12px; height: 12px;
  background: #1A6FD4;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transition: width .2s, height .2s;
}
#cursor-ring {
  position: fixed;
  width: 36px; height: 36px;
  border: 1.5px solid #1A6FD4;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0.5;
  transition: width .2s, height .2s;
}
/* Hover em links e cards: cursor 18px, ring 50px */
```

### WhatsApp Float
```
Posição: fixed, bottom 28px, right 28px
Tamanho: 56×56px, border-radius 50%
Background: #25D366
Sombra: 0 8px 24px rgba(37,211,102,0.4)
Hover: scale(1.1), sombra aumenta
Z-index: 500
```

### Scroll Reveal
```css
.reveal {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity .7s ease, transform .7s ease;
}
.reveal.visible         { opacity: 1; transform: translateY(0) }
.reveal-delay-1         { transition-delay: .1s }
.reveal-delay-2         { transition-delay: .2s }
.reveal-delay-3         { transition-delay: .3s }
.reveal-delay-4         { transition-delay: .4s }
```
```js
const observer = new IntersectionObserver(
  (entries) => entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  }),
  { threshold: 0.15 }
);
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
```

---

## 14. Mapa Completo de Animações

| Elemento | Animação | Trigger |
|---|---|---|
| Navbar | `background` + `box-shadow` aparecem | `scroll > 80px` |
| Hero badge, h1, p, btns | `fadeUp` com delays 0.2s a 0.8s | page load |
| Scroll indicator | pulso vertical contínuo | CSS `@keyframes` loop |
| Counters (stats) | count-up numérico 0 → valor | `IntersectionObserver` |
| Cards de serviço | `translateY(-6px)` + barra topo azul | hover CSS |
| Cards de portfólio | `scale(1.06)` na imagem + overlay fade | hover CSS |
| Linha do processo | `stroke-dashoffset` preenche da esquerda | GSAP `ScrollTrigger` |
| Círculos do processo | `scale(1.1)` + fundo azul | hover CSS |
| Todos `.reveal` | fadeUp 0.7s | `IntersectionObserver` |
| Cursor dot + ring | escala no hover de clicáveis | JS `mousemove` + `mouseover` |
| Menu mobile | overlay slide down | click hambúrguer |
| Botões CTA | `translateY(-2px)` + sombra colorida | hover CSS |

---

## 15. Stack Técnico

### Opção A — HTML + CSS + JS Puro (recomendado)

Melhor performance, zero overhead de framework, controle total.

```
Fontes:    Google Fonts — Syne + DM Sans
Animações: GSAP 3 + ScrollTrigger (CDN)
Scroll:    Lenis.js
Carrossel: Embla Carousel (depoimentos)
Deploy:    Vercel ou Netlify
Domínio:   albacesarquitetura.com.br
```

### Opção B — Next.js + CMS (se precisar de atualizações frequentes)

```
Framework: Next.js 14 (App Router)
Styling:   Tailwind CSS
Animações: GSAP + Framer Motion
CMS:       Sanity.io (projetos, depoimentos)
Deploy:    Vercel
```

---

## 16. Conteúdo Necessário

### Do Cliente (Albaces Arquitetura)
- [ ] Logo em SVG ou AI (vetorial)
- [ ] Foto profissional do(s) arquiteto(s) ou equipe
- [ ] Foto do escritório ou projeto em andamento
- [ ] Fotos de 6 a 10 projetos (mínimo 5 fotos por projeto, alta resolução)
- [ ] Renders 3D de projetos (se houver)
- [ ] Texto sobre o escritório (200 a 350 palavras)
- [ ] Lista de serviços com descrição curta
- [ ] 3 a 5 depoimentos de clientes (nome, projeto realizado, texto)
- [ ] Endereço completo: Parque Sagrada Família, Rondonópolis-MT

### Produzido pelo Dev
- [ ] Copywriting de todas as seções
- [ ] Favicon SVG + PNG 32px
- [ ] Open Graph image 1200×630px (para WhatsApp e redes)
- [ ] Imagens placeholder enquanto fotos reais não chegam

---

## 17. SEO e Performance

### SEO Local

```html
<title>Albaces Arquitetura | Escritório em Rondonópolis-MT</title>
<meta name="description"
  content="Projetos residenciais e comerciais, design de interiores e renders 3D
  em Rondonópolis-MT. Solicite seu orçamento.">
```

- Schema.org: `LocalBusiness` + `ArchitecturalService`
- Google Business Profile integrado
- Sitemap XML automático
- Open Graph + Twitter Card completos

### Metas de Performance (Lighthouse)

| Métrica | Meta |
|---|---|
| LCP | < 2.5s |
| CLS | < 0.1 |
| INP | < 100ms |
| Score geral | > 90 |

- Imagens em WebP, máx 150KB each
- `loading="lazy"` em todas as imagens abaixo do fold
- `font-display: swap` nas fontes
- `will-change: transform` apenas em elementos animados

---

## 18. Responsividade

| Breakpoint | Adaptações |
|---|---|
| Mobile `< 768px` | 1 coluna geral, menu hambúrguer, hero fonte reduzida, portfólio empilhado, stats 2×2 |
| Tablet `768–1024px` | 2 colunas em serviços, portfólio 2×2, processo 3+2 |
| Desktop `1024–1440px` | Layout completo conforme especificado |
| Wide `> 1440px` | `max-width: 1200px` nos containers, margens laterais crescem |

---

*Referência visual: Behance "Site Arquitetura" — Breno Nery (2026)*
*Cliente: Albaces Arquitetura — Parque Sagrada Família, Rondonópolis-MT | (66) 99973-1937*
