import { db } from '../server/db';
import { 
  empresaCategoria, 
  empresas, 
  templates, 
  artes, 
  usuarios 
} from '../shared/schema';

async function seedData() {
  try {
    console.log('Seeding database with sample data...');
    
    // Add sample categories
    const categories = await db.insert(empresaCategoria).values([
      { name: 'Restaurante' },
      { name: 'Loja de Roupas' },
      { name: 'Salão de Beleza' },
      { name: 'Academia' },
      { name: 'Serviços' },
    ]).returning();
    
    console.log('✅ Categories created:', categories.length);
    
    // Add sample templates
    const templateData = [
      {
        name: 'Promoção de Comida',
        template_id: 'food-promo-1',
        width: 1080,
        height: 1080,
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=500&fit=crop',
        empresa_categoria: categories[0].id,
        context: {
          fields: [
            { name: 'title', label: 'Título Principal', type: 'text', placeholder: 'Ex: Promoção Especial' },
            { name: 'subtitle', label: 'Subtítulo', type: 'text', placeholder: 'Ex: Aproveite os descontos' },
            { name: 'description', label: 'Descrição', type: 'textarea', placeholder: 'Descreva sua promoção...' },
            { name: 'price', label: 'Preço', type: 'text', placeholder: 'Ex: R$ 29,90' },
            { name: 'validity', label: 'Validade', type: 'text', placeholder: 'Ex: Até 31/12/2024' }
          ]
        }
      },
      {
        name: 'Coleção de Verão',
        template_id: 'fashion-summer-1',
        width: 1080,
        height: 1080,
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=500&fit=crop',
        empresa_categoria: categories[1].id,
        context: {
          fields: [
            { name: 'title', label: 'Título da Coleção', type: 'text', placeholder: 'Ex: Coleção Verão 2024' },
            { name: 'subtitle', label: 'Slogan', type: 'text', placeholder: 'Ex: Vista o melhor do verão' },
            { name: 'discount', label: 'Desconto', type: 'text', placeholder: 'Ex: 30% OFF' },
            { name: 'validity', label: 'Período', type: 'text', placeholder: 'Ex: Válido até 15/03' }
          ]
        }
      },
      {
        name: 'Serviços de Beleza',
        template_id: 'beauty-services-1',
        width: 1080,
        height: 1350,
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&h=600&fit=crop',
        empresa_categoria: categories[2].id,
        context: {
          fields: [
            { name: 'service', label: 'Serviço', type: 'text', placeholder: 'Ex: Corte + Escova' },
            { name: 'price', label: 'Preço', type: 'text', placeholder: 'Ex: A partir de R$ 50' },
            { name: 'appointment', label: 'Agendamento', type: 'text', placeholder: 'Ex: Agende pelo WhatsApp' }
          ]
        }
      }
    ];
    
    const insertedTemplates = await db.insert(templates).values(templateData).returning();
    console.log('✅ Templates created:', insertedTemplates.length);
    
    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedData();