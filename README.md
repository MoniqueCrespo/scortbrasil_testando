# ScortRio - Frontend React + WordPress API

Diretório de acompanhantes com frontend React/TypeScript e backend WordPress REST API.

## 🚀 Deploy Rápido no Vercel

### 1. Subir no GitHub

```bash
# Clone ou faça fork deste repositório
git clone <URL_DO_REPO>
cd <NOME_DO_PROJETO>

# Ou crie um novo repo e faça push
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USER/SEU_REPO.git
git push -u origin main
```

### 2. Conectar no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New Project"**
3. Importe seu repositório do GitHub
4. Configure as **Environment Variables**:

| Variável | Valor |
|----------|-------|
| `VITE_SUPABASE_PROJECT_ID` | `rptbxqicrvapiryjadcu` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGJ4cWljcnZhcGlyeWphZGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NjAyOTgsImV4cCI6MjA4MDQzNjI5OH0.ouXQ85nPyq7tNPl2a1MQpnBKjpph0JpSQCoC-Xkb3eM` |
| `VITE_SUPABASE_URL` | `https://rptbxqicrvapiryjadcu.supabase.co` |
| `VITE_WORDPRESS_API_URL` | `https://escortsacompanhantes.com/wp-json/scortrio/v1` |

5. Clique em **Deploy**

### 3. Pronto!

Seu site estará disponível em `https://seu-projeto.vercel.app`

---

## 📂 Estrutura do Projeto

```
src/
├── lib/
│   └── wordpress-api.ts      # Serviço API WordPress
├── hooks/
│   └── useWordPressAPI.tsx   # Hooks React para dados
├── pages/
│   ├── Home.tsx              # Página inicial
│   ├── Index.tsx             # Listagem de perfis
│   ├── ProfileDetail.tsx     # Detalhes do perfil
│   ├── StateView.tsx         # Vista por estado
│   ├── CityView.tsx          # Vista por cidade
│   └── FeedExplorer.tsx      # Feed estilo TikTok
├── components/
│   ├── SEOContent.tsx        # Conteúdo SEO
│   └── ...
└── data/
    ├── mockProfiles.ts       # Dados mock (fallback)
    └── locations.ts          # Estados e cidades
```

## 🔌 API WordPress

O frontend consome dados da API REST do WordPress:

```
GET /wp-json/scortrio/v1/acompanhantes
GET /wp-json/scortrio/v1/acompanhantes/{slug}
GET /wp-json/scortrio/v1/cidades
GET /wp-json/scortrio/v1/categorias
```

### Fallback Automático

Se a API WordPress não responder, o sistema usa **dados mock** automaticamente.

---

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📦 Tecnologias

- **React 18** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Supabase** - Auth e Dashboard
- **WordPress REST API** - Dados públicos

## 🔐 Autenticação

- Páginas públicas: WordPress API
- Login/Dashboard: Supabase Auth

---

## 📝 Licença

Projeto privado - Todos os direitos reservados.
