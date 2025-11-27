# ArtGen - Plataforma de Geração de Artes Visuais

Uma plataforma SaaS sofisticada para gerar artes visuais dinâmicas através de personalização inteligente de templates, permitindo que empresas criem materiais de marketing profissionais com automação avançada de design.

## 🚀 Funcionalidades

### 🏢 Gestão Multi-Tenant
- **Empresas Múltiplas**: Usuários podem possuir e gerenciar várias empresas
- **Gestão de Usuários**: Sistema completo de convites e papéis de usuário
- **Permissões Granulares**: Controle de acesso baseado em funções

### 🎨 Geração de Artes
- **Templates Inteligentes**: Biblioteca de templates categorizados por tipo de negócio
- **Personalização Automática**: Auto-preenchimento de campos com dados da empresa
- **Extração de Cores**: Geração automática de paletas de cores da logo da empresa
- **Sistema de Arquivamento**: Organização de artes ativas e arquivadas

### 🔄 Tempo Real
- **WebSocket Integration**: Atualizações em tempo real para múltiplos usuários
- **Sincronização Automática**: Cache invalidation automático com React Query
- **Status de Conexão**: Indicador visual de status da conexão WebSocket

### 📱 Interface Moderna
- **Design Responsivo**: Interface adaptável para desktop e mobile
- **Componentes Reutilizáveis**: Sistema de design baseado em shadcn/ui
- **Navegação Intuitiva**: Sidebar com seleção centralizada de empresas

## 🛠️ Tecnologias

### Frontend
- **React 18** com TypeScript
- **Vite** para desenvolvimento e build
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes
- **React Query** para gerenciamento de estado servidor
- **React Hook Form** com validação Zod
- **Wouter** para roteamento
- **Framer Motion** para animações

### Backend
- **Node.js** com Express.js
- **TypeScript** em todo o stack
- **PostgreSQL** como banco de dados
- **Drizzle ORM** para operações de banco
- **WebSocket** para comunicação em tempo real
- **Passport.js** para autenticação

### Infraestrutura
- **Replit** para hospedagem e desenvolvimento
- **PostgreSQL** banco de dados gerenciado
- **ESBuild** para builds de produção

## 📁 Estrutura do Projeto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Hooks customizados
│   │   └── lib/          # Utilitários e configurações
├── server/                # Backend Express
│   ├── routes.ts         # Rotas da API
│   ├── storage.ts        # Camada de dados
│   └── replitAuth.ts     # Autenticação
├── shared/               # Código compartilhado
│   └── schema.ts        # Schemas Drizzle
├── migrations/          # Migrações do banco
└── scripts/            # Scripts de setup
```

## 🗄️ Banco de Dados

### Tabelas Principais
- **users**: Usuários autenticados
- **empresas**: Dados das empresas
- **templates**: Templates de design
- **artes**: Artes geradas
- **usuario_empresas**: Relacionamento usuário-empresa
- **empresa_categoria**: Categorias de negócio
- **planos**: Planos de assinatura
- **reportes_erros**: Relatórios de erro

## 🚦 Como Executar

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Variáveis de ambiente configuradas

### Instalação
```bash
# Instalar dependências
npm install

# Configurar banco de dados
npm run db:push

# Executar seeds (opcional)
npm run db:seed

# Iniciar servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente
```env
DATABASE_URL=postgresql://...
NODE_ENV=development
```

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run db:push      # Aplicar mudanças no schema
npm run db:seed      # Popular banco com dados iniciais
npm run db:migrate   # Executar migrações
```

## 📊 Funcionalidades Detalhadas

### Sistema de Empresas
- Criação e edição de empresas
- Upload de logo com extração automática de cores
- Configuração de informações de contato
- Gestão de branding e identidade visual

### Geração de Artes
- Seleção de templates por categoria
- Preenchimento automático com dados da empresa
- Personalização de cores e textos
- Sistema de preview em tempo real
- Arquivamento e organização

### Gestão de Usuários
- Sistema de convites por email
- Diferentes níveis de permissão
- Gestão de múltiplas empresas por usuário
- Interface de administração

### Tempo Real
- Notificações instantâneas de novas artes
- Sincronização automática entre usuários
- Status de conexão WebSocket
- Atualizações automáticas de cache

## 🎯 Roadmap

- [ ] Sistema de pagamentos com Stripe
- [ ] API de webhooks para integração
- [ ] Editor de templates avançado
- [ ] Sistema de aprovação de artes
- [ ] Relatórios e analytics
- [ ] Integração com redes sociais

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia o guia de contribuição antes de submeter pull requests.

## 📧 Contato

Para dúvidas ou sugestões, entre em contato através do GitHub Issues.