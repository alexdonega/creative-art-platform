import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { 
  empresaCategoria, 
  empresas, 
  templates, 
  artes, 
  usuarios, 
  users 
} from "../shared/schema";

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function setupDatabase() {
  try {
    console.log("Setting up database tables...");
    
    // Create tables using raw SQL since we need IF NOT EXISTS
    await sql`
      CREATE TABLE IF NOT EXISTS "EmpresaCategoria" (
        "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        "name" TEXT
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" UUID PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS "Empresas" (
        "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "nome" TEXT,
        "credito" BIGINT,
        "admin" UUID,
        "cores" JSON DEFAULT '{"cor-1": "#1A73E8", "cor-2": "#34A853", "cor-3": "#FBBC05", "cor-4": "#EA4335"}',
        "logo" TEXT DEFAULT 'https://novoenvio.com.br/wp-content/uploads/2025/01/logo_novoenvio_padrao.svg',
        "whatsapp" TEXT DEFAULT '(45) 9 9999-9999',
        "telefone" TEXT DEFAULT '(45) 9999-9999',
        "email" TEXT DEFAULT 'email@gmail.com',
        "endereco" TEXT DEFAULT 'Rua Sem Nome, 87 - AP 654 - Bairro - Cidade - UF',
        "instagram" TEXT DEFAULT '@instagram',
        "facebook" TEXT DEFAULT '/facebook',
        "empresa_categoria" BIGINT REFERENCES "EmpresaCategoria"("id")
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS "Templates" (
        "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "template_id" TEXT,
        "width" BIGINT,
        "height" BIGINT,
        "context" JSON,
        "image" TEXT,
        "empresa_categoria" BIGINT REFERENCES "EmpresaCategoria"("id"),
        "name" TEXT
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS "Artes" (
        "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "link" TEXT,
        "width" BIGINT,
        "height" BIGINT,
        "empresa" BIGINT REFERENCES "Empresas"("id")
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS "Usuarios" (
        "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "usuario" UUID,
        "empresa" BIGINT REFERENCES "Empresas"("id"),
        "nome" TEXT,
        "telefone" TEXT
      );
    `;
    
    console.log("✅ Database tables created successfully!");
    
    // Insert sample categories
    console.log("Adding sample categories...");
    await db.insert(empresaCategoria).values([
      { name: "Restaurante" },
      { name: "Loja de Roupas" },
      { name: "Salão de Beleza" },
      { name: "Academia" },
      { name: "Serviços" },
    ]).onConflictDoNothing();
    
    // Insert sample templates
    console.log("Adding sample templates...");
    await db.insert(templates).values([
      {
        name: "Promoção de Comida",
        template_id: "food-promo-1",
        width: 1080,
        height: 1080,
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=500&fit=crop",
        empresa_categoria: 1,
        context: {
          fields: [
            { name: "title", label: "Título Principal", type: "text", placeholder: "Ex: Promoção Especial" },
            { name: "subtitle", label: "Subtítulo", type: "text", placeholder: "Ex: Aproveite os descontos" },
            { name: "description", label: "Descrição", type: "textarea", placeholder: "Descreva sua promoção..." },
            { name: "price", label: "Preço", type: "text", placeholder: "Ex: R$ 29,90" },
            { name: "validity", label: "Validade", type: "text", placeholder: "Ex: Até 31/12/2024" }
          ]
        }
      },
      {
        name: "Coleção de Verão",
        template_id: "fashion-summer-1",
        width: 1080,
        height: 1080,
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=500&fit=crop",
        empresa_categoria: 2,
        context: {
          fields: [
            { name: "title", label: "Título da Coleção", type: "text", placeholder: "Ex: Coleção Verão 2024" },
            { name: "subtitle", label: "Slogan", type: "text", placeholder: "Ex: Vista o melhor do verão" },
            { name: "discount", label: "Desconto", type: "text", placeholder: "Ex: 30% OFF" },
            { name: "validity", label: "Período", type: "text", placeholder: "Ex: Válido até 15/03" }
          ]
        }
      },
      {
        name: "Serviços de Beleza",
        template_id: "beauty-services-1",
        width: 1080,
        height: 1350,
        image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&h=600&fit=crop",
        empresa_categoria: 3,
        context: {
          fields: [
            { name: "service", label: "Serviço", type: "text", placeholder: "Ex: Corte + Escova" },
            { name: "price", label: "Preço", type: "text", placeholder: "Ex: A partir de R$ 50" },
            { name: "appointment", label: "Agendamento", type: "text", placeholder: "Ex: Agende pelo WhatsApp" }
          ]
        }
      }
    ]).onConflictDoNothing();
    
    console.log("✅ Sample data inserted successfully!");
    console.log("🎉 Database setup complete!");
    
    await sql.end();
  } catch (error) {
    console.error("❌ Error setting up database:", error);
    process.exit(1);
  }
}

setupDatabase();