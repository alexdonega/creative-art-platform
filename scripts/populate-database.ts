import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function populateDatabase() {
  try {
    console.log('🔄 Populando banco de dados...');

    // 1. Limpar dados existentes (exceto users essenciais) - ordem correta para evitar FK constraints
    await db.delete(schema.aiContentGeneration);
    await db.delete(schema.aiDesignSuggestions);
    await db.delete(schema.reportesErros);
    await db.delete(schema.artes);
    await db.delete(schema.usuarioEmpresas);
    await db.delete(schema.templates);
    await db.delete(schema.empresas);
    await db.delete(schema.planos);
    await db.delete(schema.empresaCategoria);
    
    // Manter apenas usuários essenciais (admin e user existente)
    const existingUsers = await db.select().from(schema.users);
    console.log(`📋 Mantendo ${existingUsers.length} usuários existentes`);

    // 2. Criar categorias de empresa
    const categorias = await db.insert(schema.empresaCategoria).values([
      { name: 'Tecnologia' },
      { name: 'Saúde' },
      { name: 'Educação' },
      { name: 'Alimentação' },
      { name: 'Moda' },
      { name: 'Construção' },
      { name: 'Transporte' },
      { name: 'Finanças' },
      { name: 'Entretenimento' },
      { name: 'Beleza' },
      { name: 'Esportes' },
      { name: 'Turismo' }
    ]).returning();
    console.log(`✅ Criadas ${categorias.length} categorias`);

    // 3. Criar planos
    const planos = await db.insert(schema.planos).values([
      {
        nome: 'Básico',
        preco_mensal: 2999, // R$ 29.99 em centavos
        limite_usuarios: 1,
        limite_artes_mes: 50,
        recursos: ['Templates básicos', 'Suporte por email', '50 artes/mês']
      },
      {
        nome: 'Profissional',
        preco_mensal: 5999, // R$ 59.99 em centavos
        limite_usuarios: 3,
        limite_artes_mes: 200,
        recursos: ['Templates premium', 'Suporte prioritário', '200 artes/mês', 'IA Assistant']
      },
      {
        nome: 'Empresarial',
        preco_mensal: 9999, // R$ 99.99 em centavos
        limite_usuarios: 10,
        limite_artes_mes: 500,
        recursos: ['Templates ilimitados', 'Suporte 24/7', '500 artes/mês', 'IA Assistant', 'API Access']
      },
      {
        nome: 'Enterprise',
        preco_mensal: 19999, // R$ 199.99 em centavos
        limite_usuarios: -1, // Ilimitado
        limite_artes_mes: -1, // Ilimitado
        recursos: ['Recursos ilimitados', 'Suporte dedicado', 'Customização completa', 'Integrações avançadas']
      }
    ]).returning();
    console.log(`✅ Criados ${planos.length} planos`);

    // 4. Criar empresas
    const empresas = await db.insert(schema.empresas).values([
      {
        nome: 'TechCorp Solutions',
        email: 'contato@techcorp.com',
        telefone: '(11) 9999-0001',
        endereco: 'Av. Paulista, 1000 - São Paulo, SP',
        admin: existingUsers[0]?.id || 'admin-uuid',
        empresa_categoria: categorias[0].id,
        plano_id: planos[1].id,
        cores: {
          "cor-1": "#3B82F6",
          "cor-2": "#1E40AF",
          "cor-3": "#60A5FA",
          "cor-4": "#1D4ED8"
        },
        logo: 'https://via.placeholder.com/150x150/3B82F6/white?text=TC',
        slug: 'techcorp-solutions'
      },
      {
        nome: 'HealthCare Plus',
        email: 'info@healthcareplus.com',
        telefone: '(11) 9999-0002',
        endereco: 'Rua da Saúde, 500 - São Paulo, SP',
        admin: existingUsers[1]?.id || 'admin-uuid',
        empresa_categoria: categorias[1].id,
        plano_id: planos[2].id,
        cores: {
          "cor-1": "#10B981",
          "cor-2": "#059669",
          "cor-3": "#34D399",
          "cor-4": "#047857"
        },
        logo: 'https://via.placeholder.com/150x150/10B981/white?text=HC',
        slug: 'healthcare-plus'
      },
      {
        nome: 'EduTech Academy',
        email: 'contato@edutech.com',
        telefone: '(11) 9999-0003',
        endereco: 'Rua do Conhecimento, 300 - São Paulo, SP',
        admin: 'user-3',
        empresa_categoria: categorias[2].id,
        plano_id: planos[1].id,
        cores: {
          "cor-1": "#8B5CF6",
          "cor-2": "#7C3AED",
          "cor-3": "#A78BFA",
          "cor-4": "#6D28D9"
        },
        logo: 'https://via.placeholder.com/150x150/8B5CF6/white?text=EA',
        slug: 'edutech-academy'
      },
      {
        nome: 'Sabor & Cia',
        email: 'pedidos@saboreCIA.com',
        telefone: '(11) 9999-0004',
        endereco: 'Av. Gastronômica, 800 - São Paulo, SP',
        admin: 'user-4',
        empresa_categoria: categorias[3].id,
        plano_id: planos[0].id,
        cores: {
          "cor-1": "#F59E0B",
          "cor-2": "#D97706",
          "cor-3": "#FCD34D",
          "cor-4": "#B45309"
        },
        logo: 'https://via.placeholder.com/150x150/F59E0B/white?text=SC',
        slug: 'sabor-cia'
      },
      {
        nome: 'Fashion Forward',
        email: 'vendas@fashionforward.com',
        telefone: '(11) 9999-0005',
        endereco: 'Rua da Moda, 200 - São Paulo, SP',
        admin: 'user-5',
        empresa_categoria: categorias[4].id,
        plano_id: planos[2].id,
        cores: {
          "cor-1": "#EC4899",
          "cor-2": "#DB2777",
          "cor-3": "#F472B6",
          "cor-4": "#BE185D"
        },
        logo: 'https://via.placeholder.com/150x150/EC4899/white?text=FF',
        slug: 'fashion-forward'
      },
      {
        nome: 'Construtora Alicerce',
        email: 'obras@alicerce.com',
        telefone: '(11) 9999-0006',
        endereco: 'Av. das Construções, 1500 - São Paulo, SP',
        admin: existingUsers[0]?.id || 'admin-uuid',
        empresa_categoria: categorias[5].id,
        plano_id: planos[3].id,
        cores: {
          "cor-1": "#6B7280",
          "cor-2": "#4B5563",
          "cor-3": "#9CA3AF",
          "cor-4": "#374151"
        },
        logo: 'https://via.placeholder.com/150x150/6B7280/white?text=CA',
        slug: 'construtora-alicerce'
      }
    ]).returning();
    console.log(`✅ Criadas ${empresas.length} empresas`);

    // 5. Criar usuários adicionais (apenas na tabela usuarios para compatibilidade)
    const novosUsuarios = await db.insert(schema.usuarios).values([
      {
        nome: 'João Silva',
        email: 'joao@techcorp.com',
        telefone: '(11) 98765-4321',
        user_id: existingUsers[0]?.id || 'user-1'
      },
      {
        nome: 'Maria Santos',
        email: 'maria@healthcareplus.com',
        telefone: '(11) 98765-4322',
        user_id: existingUsers[1]?.id || 'user-2'
      },
      {
        nome: 'Pedro Costa',
        email: 'pedro@edutech.com',
        telefone: '(11) 98765-4323',
        user_id: 'user-3'
      },
      {
        nome: 'Ana Oliveira',
        email: 'ana@saborevia.com',
        telefone: '(11) 98765-4324',
        user_id: 'user-4'
      },
      {
        nome: 'Carlos Ferreira',
        email: 'carlos@fashionforward.com',
        telefone: '(11) 98765-4325',
        user_id: 'user-5'
      }
    ]).returning();
    console.log(`✅ Criados ${novosUsuarios.length} usuários`);

    // 6. Criar relacionamentos usuário-empresa
    const userEmpresas = await db.insert(schema.usuarioEmpresas).values([
      {
        user_id: existingUsers[0]?.id || 'user-1',
        empresa_id: empresas[0].id,
        role: 'admin'
      },
      {
        user_id: existingUsers[1]?.id || 'user-2',
        empresa_id: empresas[1].id,
        role: 'admin'
      },
      {
        user_id: 'user-3',
        empresa_id: empresas[2].id,
        role: 'admin'
      },
      {
        user_id: 'user-4',
        empresa_id: empresas[3].id,
        role: 'admin'
      },
      {
        user_id: 'user-5',
        empresa_id: empresas[4].id,
        role: 'admin'
      },
      {
        user_id: existingUsers[0]?.id || 'user-1',
        empresa_id: empresas[5].id,
        role: 'editor'
      }
    ]).returning();
    console.log(`✅ Criados ${userEmpresas.length} relacionamentos usuário-empresa`);

    // 7. Criar templates
    const templates = await db.insert(schema.templates).values([
      {
        name: 'Post Instagram - Tecnologia',
        template_id: 'tech-post-001',
        empresa_categoria: categorias[0].id,
        width: 400,
        height: 400,
        context: {
          tipo: 'post',
          campos_editaveis: ['titulo', 'subtitulo', 'cor_primaria', 'logo']
        },
        image: 'https://via.placeholder.com/400x400/3B82F6/white?text=Tech+Post',
        texto_apoio: 'Compartilhe as últimas novidades em tecnologia com este template moderno e profissional.'
      },
      {
        nome: 'Story - Saúde',
        descricao: 'Template para stories sobre saúde e bem-estar',
        template_id: 'health-story-001',
        categoria_id: categorias[1].id,
        tipo: 'story',
        campos_editaveis: ['titulo', 'descricao', 'cor_secundaria'],
        preview_url: 'https://via.placeholder.com/300x533/10B981/white?text=Health+Story',
        texto_apoio: 'Promova saúde e bem-estar com este template atrativo para stories.'
      },
      {
        nome: 'Banner - Educação',
        descricao: 'Banner promocional para cursos e educação',
        template_id: 'edu-banner-001',
        categoria_id: categorias[2].id,
        tipo: 'banner',
        campos_editaveis: ['titulo', 'subtitulo', 'cta', 'cor_primaria'],
        preview_url: 'https://via.placeholder.com/800x400/8B5CF6/white?text=Edu+Banner',
        texto_apoio: 'Divulgue seus cursos e conteúdos educacionais com este banner impactante.'
      },
      {
        nome: 'Cardápio - Alimentação',
        descricao: 'Template para cardápios e menus',
        template_id: 'food-menu-001',
        categoria_id: categorias[3].id,
        tipo: 'menu',
        campos_editaveis: ['titulo', 'itens', 'precos', 'cor_primaria'],
        preview_url: 'https://via.placeholder.com/400x600/F59E0B/white?text=Food+Menu',
        texto_apoio: 'Apresente seu cardápio de forma atrativa e organizada.'
      },
      {
        nome: 'Lookbook - Moda',
        descricao: 'Template para showcase de produtos de moda',
        template_id: 'fashion-lookbook-001',
        categoria_id: categorias[4].id,
        tipo: 'lookbook',
        campos_editaveis: ['titulo', 'produtos', 'cor_primaria', 'cor_secundaria'],
        preview_url: 'https://via.placeholder.com/400x500/EC4899/white?text=Fashion+Look',
        texto_apoio: 'Destaque suas peças de moda com este template elegante e moderno.'
      },
      {
        nome: 'Projeto - Construção',
        descricao: 'Template para apresentar projetos de construção',
        template_id: 'construction-project-001',
        categoria_id: categorias[5].id,
        tipo: 'projeto',
        campos_editaveis: ['titulo', 'descricao', 'antes_depois', 'contato'],
        preview_url: 'https://via.placeholder.com/500x400/6B7280/white?text=Construction',
        texto_apoio: 'Apresente seus projetos de construção de forma profissional.'
      }
    ]).returning();
    console.log(`✅ Criados ${templates.length} templates`);

    // 8. Criar artes
    const artes = await db.insert(schema.artes).values([
      {
        nome: 'Post - Lançamento App',
        template_id: templates[0].id,
        empresa_id: empresas[0].id,
        dados_personalizados: {
          titulo: 'Novo App Disponível!',
          subtitulo: 'Baixe agora e revolucione sua produtividade',
          cor_primaria: '#3B82F6'
        },
        status: 'concluida',
        arquivo_url: 'https://via.placeholder.com/400x400/3B82F6/white?text=App+Launch',
        texto_apoio: 'Nosso novo aplicativo já está disponível! Baixe gratuitamente e transforme sua forma de trabalhar.'
      },
      {
        nome: 'Story - Dicas de Saúde',
        template_id: templates[1].id,
        empresa_id: empresas[1].id,
        dados_personalizados: {
          titulo: '5 Dicas de Saúde',
          descricao: 'Cuide melhor da sua saúde todos os dias',
          cor_secundaria: '#059669'
        },
        status: 'concluida',
        arquivo_url: 'https://via.placeholder.com/300x533/10B981/white?text=Health+Tips',
        texto_apoio: 'Confira essas 5 dicas essenciais para manter sua saúde em dia durante toda a semana.'
      },
      {
        nome: 'Banner - Curso de Python',
        template_id: templates[2].id,
        empresa_id: empresas[2].id,
        dados_personalizados: {
          titulo: 'Curso de Python',
          subtitulo: 'Do zero ao profissional em 8 semanas',
          cta: 'Inscreva-se Agora',
          cor_primaria: '#8B5CF6'
        },
        status: 'concluida',
        arquivo_url: 'https://via.placeholder.com/800x400/8B5CF6/white?text=Python+Course',
        texto_apoio: 'Aprenda Python do básico ao avançado! Curso completo com certificado e suporte para carreira.'
      },
      {
        nome: 'Cardápio - Semana Especial',
        template_id: templates[3].id,
        empresa_id: empresas[3].id,
        dados_personalizados: {
          titulo: 'Semana Especial',
          itens: ['Feijoada Completa', 'Moqueca de Peixe', 'Bobó de Camarão'],
          precos: ['R$ 25,90', 'R$ 32,90', 'R$ 38,90'],
          cor_primaria: '#F59E0B'
        },
        status: 'concluida',
        arquivo_url: 'https://via.placeholder.com/400x600/F59E0B/white?text=Special+Menu',
        texto_apoio: 'Experimente nossa semana especial com pratos tradicionais brasileiros preparados com muito carinho.'
      },
      {
        nome: 'Lookbook - Coleção Verão',
        template_id: templates[4].id,
        empresa_id: empresas[4].id,
        dados_personalizados: {
          titulo: 'Coleção Verão 2025',
          produtos: ['Vestido Floral', 'Blusa Cropped', 'Saia Midi'],
          cor_primaria: '#EC4899',
          cor_secundaria: '#DB2777'
        },
        status: 'concluida',
        arquivo_url: 'https://via.placeholder.com/400x500/EC4899/white?text=Summer+2025',
        texto_apoio: 'Descubra as tendências do verão 2025! Peças únicas e exclusivas para você arrasar na estação.'
      },
      {
        nome: 'Projeto - Residencial Jardins',
        template_id: templates[5].id,
        empresa_id: empresas[5].id,
        dados_personalizados: {
          titulo: 'Residencial Jardins',
          descricao: 'Apartamentos de alto padrão com área verde',
          contato: '(11) 9999-0006'
        },
        status: 'concluida',
        arquivo_url: 'https://via.placeholder.com/500x400/6B7280/white?text=Jardins+Project',
        texto_apoio: 'Conheça o mais novo empreendimento da cidade! Apartamentos com vista para área verde e acabamento premium.'
      }
    ]).returning();
    console.log(`✅ Criadas ${artes.length} artes`);

    // 9. Criar relatórios de erro
    const reportes = await db.insert(schema.reportesErros).values([
      {
        empresa_id: empresas[0].id,
        user_id: existingUsers[0]?.id || 'user-1',
        tipo_erro: 'template',
        descricao: 'Template não carregou corretamente no mobile',
        detalhes: { template_id: templates[0].id, device: 'mobile', browser: 'Chrome' },
        status: 'resolvido',
        prioridade: 'media'
      },
      {
        empresa_id: empresas[1].id,
        user_id: existingUsers[1]?.id || 'user-2',
        tipo_erro: 'upload',
        descricao: 'Falha ao fazer upload da logo',
        detalhes: { file_size: '2MB', file_type: 'PNG' },
        status: 'pendente',
        prioridade: 'alta'
      },
      {
        empresa_id: empresas[2].id,
        user_id: 'user-3',
        tipo_erro: 'sistema',
        descricao: 'Lentidão ao gerar arte',
        detalhes: { template_id: templates[2].id, load_time: '45s' },
        status: 'investigando',
        prioridade: 'baixa'
      }
    ]).returning();
    console.log(`✅ Criados ${reportes.length} relatórios de erro`);

    // 10. Criar sugestões de design AI
    const aiSuggestions = await db.insert(schema.aiDesignSuggestions).values([
      {
        empresa_id: empresas[0].id,
        template_id: templates[0].id,
        tipo_sugestao: 'color',
        titulo: 'Paleta de Cores Tecnológica',
        descricao: 'Sugestão de cores modernas para tech',
        dados_sugestao: {
          primary: '#3B82F6',
          secondary: '#1E40AF',
          accent: '#60A5FA'
        },
        confianca: 0.95,
        status: 'aplicada'
      },
      {
        empresa_id: empresas[1].id,
        template_id: templates[1].id,
        tipo_sugestao: 'content',
        titulo: 'Conteúdo para Saúde',
        descricao: 'Sugestões de texto para área da saúde',
        dados_sugestao: {
          headlines: ['Cuide da sua saúde', 'Bem-estar em primeiro lugar'],
          ctas: ['Agende sua consulta', 'Saiba mais']
        },
        confianca: 0.88,
        status: 'pendente'
      }
    ]).returning();
    console.log(`✅ Criadas ${aiSuggestions.length} sugestões de IA`);

    // 11. Criar gerações de conteúdo AI
    const aiContent = await db.insert(schema.aiContentGeneration).values([
      {
        empresa_id: empresas[0].id,
        user_id: existingUsers[0]?.id || 'user-1',
        tema: 'Lançamento de novo produto tecnológico',
        tipo_post: 'Feed',
        tom_voz: 'Profissional',
        conteudo_gerado: {
          headlines: ['Inovação que transforma', 'Tecnologia do futuro'],
          content: 'Apresentamos nossa mais nova solução tecnológica...',
          ctas: ['Conheça agora', 'Solicite demonstração']
        },
        status: 'concluida'
      },
      {
        empresa_id: empresas[1].id,
        user_id: existingUsers[1]?.id || 'user-2',
        tema: 'Dicas de prevenção em saúde',
        tipo_post: 'Story',
        tom_voz: 'Amigável',
        conteudo_gerado: {
          headlines: ['Sua saúde em dia', 'Prevenção é o melhor remédio'],
          content: 'Confira essas dicas essenciais para manter sua saúde...',
          ctas: ['Saiba mais', 'Agende consulta']
        },
        status: 'concluida'
      }
    ]).returning();
    console.log(`✅ Criadas ${aiContent.length} gerações de conteúdo AI`);

    console.log('\n🎉 Banco de dados populado com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`• ${categorias.length} categorias de empresa`);
    console.log(`• ${planos.length} planos de assinatura`);
    console.log(`• ${empresas.length} empresas`);
    console.log(`• ${novosUsuarios.length} usuários`);
    console.log(`• ${userEmpresas.length} relacionamentos usuário-empresa`);
    console.log(`• ${templates.length} templates`);
    console.log(`• ${artes.length} artes criadas`);
    console.log(`• ${reportes.length} relatórios de erro`);
    console.log(`• ${aiSuggestions.length} sugestões de IA`);
    console.log(`• ${aiContent.length} gerações de conteúdo AI`);

  } catch (error) {
    console.error('❌ Erro ao popular banco de dados:', error);
  } finally {
    await pool.end();
  }
}

populateDatabase();