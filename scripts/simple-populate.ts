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

    // Limpar dados existentes
    await db.delete(schema.aiContentGeneration);
    await db.delete(schema.aiDesignSuggestions);
    await db.delete(schema.reportesErros);
    await db.delete(schema.artes);
    await db.delete(schema.usuarioEmpresas);
    await db.delete(schema.templates);
    await db.delete(schema.empresas);
    await db.delete(schema.planos);
    await db.delete(schema.empresaCategoria);

    // Criar categorias
    const categorias = await db.insert(schema.empresaCategoria).values([
      { name: 'Tecnologia' },
      { name: 'Saúde' },
      { name: 'Educação' },
      { name: 'Alimentação' },
      { name: 'Moda' },
      { name: 'Construção' }
    ]).returning();

    // Criar planos
    const planos = await db.insert(schema.planos).values([
      {
        nome: 'Básico',
        preco_mensal: 2999,
        limite_usuarios: 1,
        limite_artes_mes: 50,
        recursos: ['Templates básicos', 'Suporte por email']
      },
      {
        nome: 'Profissional',
        preco_mensal: 5999,
        limite_usuarios: 5,
        limite_artes_mes: 200,
        recursos: ['Templates premium', 'Suporte prioritário', 'IA Assistant']
      },
      {
        nome: 'Enterprise',
        preco_mensal: 9999,
        limite_usuarios: 20,
        limite_artes_mes: 500,
        recursos: ['Recursos ilimitados', 'Suporte dedicado', 'API Access']
      }
    ]).returning();

    // Criar empresas
    const empresas = await db.insert(schema.empresas).values([
      {
        nome: 'TechCorp Solutions',
        email: 'contato@techcorp.com',
        telefone: '(11) 9999-0001',
        endereco: 'Av. Paulista, 1000 - São Paulo, SP',
        admin: 'admin-uuid',
        empresa_categoria: categorias[0].id,
        plano_id: planos[1].id,
        slug: 'techcorp-solutions'
      },
      {
        nome: 'HealthCare Plus',
        email: 'info@healthcareplus.com',
        telefone: '(11) 9999-0002',
        endereco: 'Rua da Saúde, 500 - São Paulo, SP',
        admin: 'admin-uuid',
        empresa_categoria: categorias[1].id,
        plano_id: planos[2].id,
        slug: 'healthcare-plus'
      },
      {
        nome: 'EduTech Academy',
        email: 'contato@edutech.com',
        telefone: '(11) 9999-0003',
        endereco: 'Rua do Conhecimento, 300 - São Paulo, SP',
        admin: 'admin-uuid',
        empresa_categoria: categorias[2].id,
        plano_id: planos[1].id,
        slug: 'edutech-academy'
      },
      {
        nome: 'Sabor & Cia',
        email: 'pedidos@saboreCIA.com',
        telefone: '(11) 9999-0004',
        endereco: 'Av. Gastronômica, 800 - São Paulo, SP',
        admin: 'admin-uuid',
        empresa_categoria: categorias[3].id,
        plano_id: planos[0].id,
        slug: 'sabor-cia'
      },
      {
        nome: 'Fashion Forward',
        email: 'vendas@fashionforward.com',
        telefone: '(11) 9999-0005',
        endereco: 'Rua da Moda, 200 - São Paulo, SP',
        admin: 'admin-uuid',
        empresa_categoria: categorias[4].id,
        plano_id: planos[2].id,
        slug: 'fashion-forward'
      }
    ]).returning();

    // Criar templates
    const templates = await db.insert(schema.templates).values([
      {
        name: 'Post Instagram - Tecnologia',
        template_id: 'tech-post-001',
        empresa_categoria: categorias[0].id,
        width: 400,
        height: 400,
        image: 'https://via.placeholder.com/400x400/3B82F6/white?text=Tech+Post',
        texto_apoio: 'Template moderno para posts sobre tecnologia'
      },
      {
        name: 'Story - Saúde',
        template_id: 'health-story-001',
        empresa_categoria: categorias[1].id,
        width: 300,
        height: 533,
        image: 'https://via.placeholder.com/300x533/10B981/white?text=Health+Story',
        texto_apoio: 'Template para stories sobre saúde e bem-estar'
      },
      {
        name: 'Banner - Educação',
        template_id: 'edu-banner-001',
        empresa_categoria: categorias[2].id,
        width: 800,
        height: 400,
        image: 'https://via.placeholder.com/800x400/8B5CF6/white?text=Edu+Banner',
        texto_apoio: 'Banner promocional para cursos e educação'
      },
      {
        name: 'Cardápio - Alimentação',
        template_id: 'food-menu-001',
        empresa_categoria: categorias[3].id,
        width: 400,
        height: 600,
        image: 'https://via.placeholder.com/400x600/F59E0B/white?text=Food+Menu',
        texto_apoio: 'Template para cardápios e menus'
      },
      {
        name: 'Lookbook - Moda',
        template_id: 'fashion-lookbook-001',
        empresa_categoria: categorias[4].id,
        width: 400,
        height: 500,
        image: 'https://via.placeholder.com/400x500/EC4899/white?text=Fashion+Look',
        texto_apoio: 'Template para showcase de produtos de moda'
      }
    ]).returning();

    // Criar artes
    const artes = await db.insert(schema.artes).values([
      {
        link: 'https://via.placeholder.com/400x400/3B82F6/white?text=App+Launch',
        width: 400,
        height: 400,
        empresa: empresas[0].id,
        texto_apoio: 'Post sobre lançamento de app'
      },
      {
        link: 'https://via.placeholder.com/300x533/10B981/white?text=Health+Tips',
        width: 300,
        height: 533,
        empresa: empresas[1].id,
        texto_apoio: 'Story com dicas de saúde'
      },
      {
        link: 'https://via.placeholder.com/800x400/8B5CF6/white?text=Python+Course',
        width: 800,
        height: 400,
        empresa: empresas[2].id,
        texto_apoio: 'Banner para curso de Python'
      },
      {
        link: 'https://via.placeholder.com/400x600/F59E0B/white?text=Special+Menu',
        width: 400,
        height: 600,
        empresa: empresas[3].id,
        texto_apoio: 'Cardápio especial da semana'
      },
      {
        link: 'https://via.placeholder.com/400x500/EC4899/white?text=Summer+2025',
        width: 400,
        height: 500,
        empresa: empresas[4].id,
        texto_apoio: 'Lookbook coleção verão 2025'
      }
    ]).returning();

    console.log('\n🎉 Banco de dados populado com sucesso!');
    console.log(`✅ ${categorias.length} categorias criadas`);
    console.log(`✅ ${planos.length} planos criados`);
    console.log(`✅ ${empresas.length} empresas criadas`);
    console.log(`✅ ${templates.length} templates criados`);
    console.log(`✅ ${artes.length} artes criadas`);

  } catch (error) {
    console.error('❌ Erro ao popular banco de dados:', error);
  } finally {
    await pool.end();
  }
}

populateDatabase();