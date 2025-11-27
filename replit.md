# replit.md

## Overview

This is a full-stack React application with an Express.js backend and TypeScript, designed as a creative art generation platform. Its primary purpose is to enable companies to generate branded visual content from pre-defined templates. Key capabilities include user authentication, company management, template browsing, and the automated generation of branded artwork. The platform aims to streamline visual content creation for businesses, offering a comprehensive solution for marketing and branding needs.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (August 3, 2025)

### Logo System Simplified
- Simplified logo management from multiple formats to single logo with format specification
- Added `logo_formato` field to companies database for tracking logo format (quadrada/retangular/vertical)
- Updated company forms to include logo format selector instead of complex multi-format upload
- Removed logo_quadrada, logo_retangular, logo_vertical fields from schema
- Simplified API endpoints to use single logo upload with format specification
- Updated both empresas.tsx and minha-empresa.tsx to use simplified logo system

### Template Category Editing Fixed
- Fixed database schema field name mismatch in template editing
- Updated form fields from `empresa_categoria` to `empresa_segmento` 
- Changed category field type from string to number to match database schema
- Both create and edit template forms now properly save category selections
- Form validation updated to handle numeric category IDs correctly

## Previous Changes (August 2, 2025)

### Modal de Zoom Completo Implementado
- Preview clicável nas imagens dos templates
- Modal full-screen com overlay escuro
- Botão X funcional (cor original branca transparente)
- Fechamento via ESC, clique no fundo ou botão X
- Informações da imagem no canto superior
- Z-index otimizado (9999 para modal, 10000 para botão)
- Integrado também na página de templates com botão "Visualizar"

### Modal de Personalização Otimizado  
- Layout 65/35 (preview expandido vs controles)
- Header compacto com botão Reportar movido
- Seções colapsáveis: Conteúdo, Design, Outros
- Footer fixo com botões de ação
- Contadores de campos nas seções
- Removido elemento div com dimensões da imagem

### Interface do Assistente de IA Melhorada
- Dropdown de tom de voz agora exibe título e descrição
- Formato consistente com seleção de tipo de postagem
- Ícones, títulos em negrito e descrições em cada opção
- Trigger mostra informação completa da opção selecionada

### Funcionalidade de Gravação de Áudio Implementada
- Ícone de microfone na caixa de texto do tema
- Contador regressivo 3-2-1 antes de iniciar gravação
- Modal de gravação com timer em tempo real
- Transcrição automática usando OpenAI Whisper
- Texto transcrito inserido automaticamente na caixa de texto
- Suporte para cancelar gravação e estados de loading

### Sistema de Filtros Completo com Sidebar Deslizante
- Botão "Filtros" no header com badge contador de filtros ativos
- Sidebar deslizante da direita com overlay escuro
- Seções de Acesso Rápido (Populares/Recentes)
- Filtros colapsáveis: Tipo de Conteúdo, Serviço/Produto, Proporção
- Filtros condicionais que aparecem apenas quando "Data Comemorativa" selecionado
- Seções condicionais com visual azul diferenciado
- Tags de filtros ativos no header principal
- Fechamento via ESC, clique no overlay ou botão X
- Footer com botões "Limpar tudo" e "Aplicar Filtros"

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with CSS custom properties
- **State Management**: React Query for server state
- **Routing**: Wouter
- **Authentication**: Supabase Auth integration
- **UI/UX Decisions**:
    - Main layout features a sidebar navigation.
    - Components are designed for accessibility.
    - Theming is handled via Tailwind CSS and CSS custom properties.
    - Modals are used for workflows like art generation.
    - Consistent professional UI across all sections (e.g., admin tables, product cards, content history).
    - Masonry layout for art and template displays.
    - Conditional rendering for admin master users (e.g., specific navigation, hidden sidebar collapse).

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (for serverless environments)
- **API Structure**: RESTful API
- **Development**: ESM modules with tsx for development server
- **Technical Implementations**:
    - Authentication handled via Supabase JWT tokens.
    - Full CRUD operations for core entities (companies, templates, arts, users, categories, digital assets, N8N workflows, AI content generation).
    - Webhook integrations for external services (e.g., art generation, AI content generation, template addition).
    - Data validation using Zod schemas.
    - Automatic logo conversion from Base64 to public URLs.
    - Real-time updates via WebSockets for content generation.
    - Auto-polling system for webhook responses to ensure content readiness.
    - Brazilian phone number formatting and validation.
    - Monetary values handled in cents for database storage with proper Brazilian currency formatting for display.
- **Feature Specifications**:
    - **User Management**: Authentication, profile management, role-based access (regular users, admin master).
    - **Company Management**: Create, edit, and manage company profiles including branding (colors, logo), products/services, and digital assets.
    - **Template Management**: Browse, select, and add design templates, categorized by business type.
    - **Art Generation**: Generate branded artwork from templates using company data and user inputs. Includes support for archival and supplementary text.
    - **AI Assistant**: Generate AI-powered content (headlines, body, CTAs) with configurable themes, post types, and voice tones. Supports various content formats (Feed, Story, Reels, Carousel, Calendar).
    - **Onboarding Flow**: Step-by-step guidance for new users to set up company profiles and create their first art.
    - **Admin Systems**: Dedicated interfaces for managing plans, business categories (segments), N8N workflows, users, and templates.

### Database Schema (Core Entities)
- **Artes**: Generated artwork, linked to companies.
- **EmpresaCategoria**: Business category classification.
- **Empresas**: Company information (branding, contact).
- **Templates**: Design templates, categorized.
- **Usuarios**: User profiles, linked to Supabase auth users.
- **Planos**: Subscription plans.
- **N8NWorkflows**: Records for managing N8N workflows.
- **AIContentGeneration**: Stores AI-generated content details.
- **DigitalAssets**: Manages company-specific digital assets (social media, WhatsApp, etc.).

## External Dependencies

- **Supabase**: Authentication service and user management.
- **PostgreSQL**: Primary database for application data.
- **Neon Database**: Serverless PostgreSQL provider.
- **Drizzle ORM**: Type-safe ORM for database interactions.
- **Radix UI**: Unstyled, accessible UI primitive components.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Lucide React**: Icon library.
- **shadcn/ui**: Pre-built component system leveraging Radix UI and Tailwind CSS.
- **Vite**: Frontend development server and build tool.
- **TypeScript**: Language used for type safety across the stack.
- **ESBuild**: Fast JavaScript bundler for production.