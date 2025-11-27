import { pgTable, bigint, text, timestamp, json, boolean, varchar, jsonb, uuid, index, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Segmentos de empresas
export const empresaSegmento = pgTable("EmpresaSegmento", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  name: text("name"),
});

// Empresas
export const empresas = pgTable("Empresas", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  nome: text("nome").notNull(),
  credito: bigint("credito", { mode: "number" }).default(0),
  admin: varchar("admin").references(() => users.id).notNull(),
  slug: text("slug").unique(),
  plano_id: bigint("plano_id", { mode: "number" }).references(() => planos.id).notNull(),
  credito_restante: bigint("credito_restante", { mode: "number" }).default(0),
  artes_mes_atual: bigint("artes_mes_atual", { mode: "number" }).default(0),
  mes_referencia: text("mes_referencia"),
  cores: json("cores").default({
    "arte_clara": {
      "cor-1": "#1A73E8",
      "cor-2": "#34A853", 
      "cor-fundo": "#FFFFFF",
      "cor-texto": "#000000"
    },
    "arte_escura": {
      "cor-1": "#1A73E8",
      "cor-2": "#34A853", 
      "cor-fundo": "#000000",
      "cor-texto": "#FFFFFF"
    }
  }),
  logo: text("logo").default("https://novoenvio.com.br/wp-content/uploads/2025/01/logo_novoenvio_padrao.svg"),
  logo_formato: text("logo_formato"), // 'quadrada', 'retangular', 'vertical'
  whatsapp: text("whatsapp"),
  telefone: text("telefone"),
  email: text("email"),
  endereco: text("endereco"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  website: text("website"),
  empresa_segmento: bigint("empresa_segmento", { mode: "number" }).references(() => empresaSegmento.id),
  ativo: boolean("ativo").default(true),
  data_vencimento: timestamp("data_vencimento", { withTimezone: true }),
  estado: text("estado"),
  cidade: text("cidade"),
  rodape: text("rodape"),
  hashtag: text("hashtag"),
});

// Templates
export const templates = pgTable("Templates", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  template_id: text("template_id"),
  width: bigint("width", { mode: "number" }),
  height: bigint("height", { mode: "number" }),
  context: json("context"),
  image: text("image"),
  empresa_segmento: bigint("empresa_segmento", { mode: "number" }).references(() => empresaSegmento.id),
  name: text("name"),
  logo_formato: text("logo_formato"), // 'quadrada', 'retangular', 'vertical'
  texto_apoio: text("texto_apoio").default(""),
});

// Artes
export const artes = pgTable("Artes", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  link: text("link"),
  width: bigint("width", { mode: "number" }),
  height: bigint("height", { mode: "number" }),
  empresa: bigint("empresa", { mode: "number" }).references(() => empresas.id),
  arquivada: boolean("arquivada").default(false),
  texto_apoio: text("texto_apoio").default(""),
});

// Planos de assinatura
export const planos = pgTable("Planos", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  nome: text("nome").notNull(),
  preco_mensal: bigint("preco_mensal", { mode: "number" }).notNull(),
  limite_usuarios: bigint("limite_usuarios", { mode: "number" }),
  limite_artes_mes: bigint("limite_artes_mes", { mode: "number" }),
  recursos: json("recursos"),
  ativo: boolean("ativo").default(true),
});

// Tabela de relacionamento usuário-empresa com roles
export const usuarioEmpresas = pgTable("UsuarioEmpresas", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  user_id: varchar("user_id").references(() => users.id).notNull(),
  empresa_id: bigint("empresa_id", { mode: "number" }).references(() => empresas.id).notNull(),
  role: text("role").notNull().default("member"), // admin, member, viewer
  ativo: boolean("ativo").default(true),
  status: text("status").notNull().default("pendente"), // 'pendente', 'aceito', 'rejeitado'
});

// Tabela de reportes de erros
export const reportesErros = pgTable("ReportesErros", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  user_id: varchar("user_id").references(() => users.id).notNull(),
  empresa_id: bigint("empresa_id", { mode: "number" }).references(() => empresas.id).notNull(),
  arte_id: bigint("arte_id", { mode: "number" }).references(() => artes.id),
  template_id: bigint("template_id", { mode: "number" }).references(() => templates.id),
  tipo_erro: text("tipo_erro").notNull(), // 'arte' ou 'template'
  descricao: text("descricao").notNull(),
  status: text("status").notNull().default("pendente"), // 'pendente', 'em_analise', 'resolvido'
  resposta_admin: text("resposta_admin"),
  data_resolucao: timestamp("data_resolucao", { withTimezone: true }),
});

// AI Design Suggestions
export const aiDesignSuggestions = pgTable("AIDesignSuggestions", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  empresa_id: bigint("empresa_id", { mode: "number" }).references(() => empresas.id).notNull(),
  template_id: bigint("template_id", { mode: "number" }).references(() => templates.id),
  suggestion_type: text("suggestion_type").notNull(), // 'color', 'layout', 'content', 'branding'
  suggestion_data: jsonb("suggestion_data").notNull(), // AI-generated suggestions
  confidence_score: bigint("confidence_score", { mode: "number" }).default(85), // 0-100
  applied: boolean("applied").default(false),
  user_feedback: text("user_feedback"), // 'helpful', 'not_helpful', 'applied'
  context_data: jsonb("context_data"), // Company and template context used
});

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Email/Password Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  password: varchar("password").notNull(),
  nome: text("nome"), // Nome completo do usuário
  telefone: text("telefone"),
  avatar_url: text("avatar_url"),
  timezone: text("timezone").default("America/Sao_Paulo"),
  tipo: varchar("tipo", { enum: ["usuario", "admin"] }).default("usuario"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Content Generation table
export const aiContentGeneration = pgTable("AIContentGeneration", {
  id: serial("id").primaryKey(),
  empresa_id: integer("empresa_id").references(() => empresas.id).notNull(),
  user_id: varchar("user_id").references(() => users.id).notNull(),
  tema: text("tema").notNull(), // Theme/topic input
  tipo_postagem: varchar("tipo_postagem", { enum: ["feed", "story", "reels", "carousel", "calendar"] }).notNull(),
  quantidade_artes: integer("quantidade_artes").default(1), // For carousel
  quantidade_dias: integer("quantidade_dias").default(1), // For calendar
  tom_voz: varchar("tom_voz", { enum: ["profissional", "casual", "divertido", "inspirador", "educativo"] }).notNull(),
  webhook_response: jsonb("webhook_response"), // JSON response from webhook
  headline: text("headline"),
  conteudo: text("conteudo"),
  cta: text("cta"),
  status: varchar("status", { enum: ["pending", "completed", "failed"] }).default("pending"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// N8N Workflows table for admin management
export const n8nWorkflows = pgTable("N8NWorkflows", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  name: text("name").notNull(),
  description: text("description"),
  n8n_id: text("n8n_id").unique(),
  status: varchar("status", { length: 20 }).notNull().default("inactive"),
  webhook_url: text("webhook_url"),
  execution_url: text("execution_url"),
  tags: jsonb("tags").default([]),
  active: boolean("active").default(true),
  last_execution: timestamp("last_execution", { withTimezone: true }),
  execution_count: bigint("execution_count", { mode: "number" }).default(0),
  error_count: bigint("error_count", { mode: "number" }).default(0),
});

// Ativos Digitais (Digital Assets) table
export const ativosDigitais = pgTable("AtivosDigitais", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  empresa_id: bigint("empresa_id", { mode: "number" }).references(() => empresas.id).notNull(),
  nome: text("nome").notNull(),
  url: text("url").notNull(),
  descricao: text("descricao"),
  ativo: boolean("ativo").default(true),
});

// Produtos e Serviços table
export const produtosServicos = pgTable("ProdutosServicos", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  empresa_id: bigint("empresa_id", { mode: "number" }).references(() => empresas.id), // Nullable for global products/services
  segmento_id: bigint("segmento_id", { mode: "number" }).references(() => empresaSegmento.id).notNull(),
  tipo: varchar("tipo", { 
    enum: ["produto", "servico"] 
  }).notNull(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  preco: bigint("preco", { mode: "number" }), // Preço em centavos
  categoria: text("categoria"), // Ex: "Básico", "Premium", "Profissional"
  duracao: text("duracao"), // Ex: "1 mês", "6 meses", "1 ano" - para serviços
  caracteristicas: jsonb("caracteristicas").default([]), // Array de características/benefícios
  imagem_url: text("imagem_url"),
  ativo: boolean("ativo").default(true),
  ordem: bigint("ordem", { mode: "number" }).default(0), // Para ordenação
});

// Relacionamento Empresa - Produtos/Serviços table
export const empresaProdutosServicos = pgTable("EmpresaProdutosServicos", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  empresa_id: bigint("empresa_id", { mode: "number" }).references(() => empresas.id).notNull(),
  produto_servico_id: bigint("produto_servico_id", { mode: "number" }).references(() => produtosServicos.id).notNull(),
  ativo: boolean("ativo").default(true),
});

// Insert schemas  
export const insertEmpresaSegmentoSchema = createInsertSchema(empresaSegmento).omit({ id: true as const });
export const insertEmpresasSchema = createInsertSchema(empresas).omit({ id: true as const, created_at: true as const });
export const insertTemplatesSchema = createInsertSchema(templates).omit({ id: true as const, created_at: true as const });
export const insertArtesSchema = createInsertSchema(artes).omit({ id: true as const, created_at: true as const });
export const insertPlanosSchema = createInsertSchema(planos).omit({ id: true as const, created_at: true as const });
export const insertUsuarioEmpresasSchema = createInsertSchema(usuarioEmpresas).omit({ id: true as const, created_at: true as const });
export const insertReportesErrosSchema = createInsertSchema(reportesErros).omit({ id: true as const, created_at: true as const });
export const insertAiDesignSuggestionsSchema = createInsertSchema(aiDesignSuggestions).omit({ id: true as const, created_at: true as const });
export const insertAiContentGenerationSchema = createInsertSchema(aiContentGeneration).omit({ id: true as const, created_at: true as const, updated_at: true as const });
export const insertUsersSchema = createInsertSchema(users).omit({ createdAt: true as const, updatedAt: true as const });
export const insertN8nWorkflowsSchema = createInsertSchema(n8nWorkflows).omit({ id: true as const, created_at: true as const, updated_at: true as const });
export const insertAtivosDigitaisSchema = createInsertSchema(ativosDigitais).omit({ id: true as const, created_at: true as const });
export const insertProdutosServicosSchema = createInsertSchema(produtosServicos).omit({ id: true as const, created_at: true as const, updated_at: true as const });
export const insertEmpresaProdutosServicosSchema = createInsertSchema(empresaProdutosServicos).omit({ id: true as const, created_at: true as const, updated_at: true as const });

// Types
export type EmpresaSegmento = typeof empresaSegmento.$inferSelect;
export type InsertEmpresaSegmento = z.infer<typeof insertEmpresaSegmentoSchema>;

export type Empresas = typeof empresas.$inferSelect;
export type InsertEmpresas = z.infer<typeof insertEmpresasSchema>;

export type Templates = typeof templates.$inferSelect;
export type InsertTemplates = z.infer<typeof insertTemplatesSchema>;

export type Artes = typeof artes.$inferSelect;
export type InsertArtes = z.infer<typeof insertArtesSchema>;

export type Planos = typeof planos.$inferSelect;
export type InsertPlanos = z.infer<typeof insertPlanosSchema>;

export type UsuarioEmpresas = typeof usuarioEmpresas.$inferSelect;
export type InsertUsuarioEmpresas = z.infer<typeof insertUsuarioEmpresasSchema>;

export type ReportesErros = typeof reportesErros.$inferSelect;
export type InsertReportesErros = z.infer<typeof insertReportesErrosSchema>;

export type AiDesignSuggestions = typeof aiDesignSuggestions.$inferSelect;
export type InsertAiDesignSuggestions = z.infer<typeof insertAiDesignSuggestionsSchema>;

export type AiContentGeneration = typeof aiContentGeneration.$inferSelect;
export type InsertAiContentGeneration = z.infer<typeof insertAiContentGenerationSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUsersSchema>;
export type UpsertUser = typeof users.$inferInsert;

export type N8nWorkflows = typeof n8nWorkflows.$inferSelect;
export type InsertN8nWorkflows = z.infer<typeof insertN8nWorkflowsSchema>;

export type AtivosDigitais = typeof ativosDigitais.$inferSelect;
export type InsertAtivosDigitais = z.infer<typeof insertAtivosDigitaisSchema>;

export type ProdutosServicos = typeof produtosServicos.$inferSelect;
export type InsertProdutosServicos = z.infer<typeof insertProdutosServicosSchema>;

export type EmpresaProdutosServicos = typeof empresaProdutosServicos.$inferSelect;
export type InsertEmpresaProdutosServicos = z.infer<typeof insertEmpresaProdutosServicosSchema>;

// Backwards compatibility (deprecated - will be removed)
export type Usuarios = User;
export type InsertUsuarios = InsertUser;
export type PerfilUsuarios = User;
export type InsertPerfilUsuarios = InsertUser;