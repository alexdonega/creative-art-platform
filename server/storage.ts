import { db, pool } from './db';
import { eq, and, sql } from "drizzle-orm";
import {
  empresaSegmento,
  empresas,
  templates,
  artes,
  planos,
  usuarioEmpresas,
  users,
  reportesErros,
  aiDesignSuggestions,
  aiContentGeneration,
  n8nWorkflows,
  ativosDigitais,
  produtosServicos,
  empresaProdutosServicos,
  type EmpresaSegmento,
  type Empresas,
  type Templates,
  type Artes,
  type Planos,
  type UsuarioEmpresas,
  type User,
  type ReportesErros,
  type InsertEmpresaSegmento,
  type InsertEmpresas,
  type InsertTemplates,
  type InsertArtes,
  type InsertPlanos,
  type InsertUsuarioEmpresas,
  type InsertUser,
  type UpsertUser,
  type InsertReportesErros,
  type AiDesignSuggestions,
  type InsertAiDesignSuggestions,
  type AiContentGeneration,
  type InsertAiContentGeneration,
  type N8nWorkflows,
  type InsertN8nWorkflows,
  type AtivosDigitais,
  type InsertAtivosDigitais,
  type ProdutosServicos,
  type InsertProdutosServicos,
  type EmpresaProdutosServicos,
  type InsertEmpresaProdutosServicos,
  // Backwards compatibility
  type Usuarios,
  type InsertUsuarios,
} from "@shared/schema";

export interface IStorage {
  // Segments
  getEmpresaSegmento(id: number): Promise<EmpresaSegmento | undefined>;
  getAllEmpresaSegmentos(): Promise<EmpresaSegmento[]>;
  createEmpresaSegmento(segmento: InsertEmpresaSegmento): Promise<EmpresaSegmento>;

  // Planos
  getPlano(id: number): Promise<Planos | undefined>;
  getAllPlanos(): Promise<Planos[]>;
  createPlano(plano: InsertPlanos): Promise<Planos>;
  updatePlano(id: number, plano: Partial<InsertPlanos>): Promise<Planos>;

  // Companies (Multi-tenant)
  getEmpresa(id: number): Promise<Empresas | undefined>;
  getEmpresasByUser(userId: string): Promise<Empresas[]>;
  createEmpresa(empresa: InsertEmpresas): Promise<Empresas>;
  updateEmpresa(id: number, empresa: Partial<InsertEmpresas>): Promise<Empresas>;

  // User-Company Relationships
  getUserEmpresas(userId: string): Promise<UsuarioEmpresas[]>;
  getEmpresaUsuarios(empresaId: number): Promise<UsuarioEmpresas[]>;
  addUserToEmpresa(data: InsertUsuarioEmpresas): Promise<UsuarioEmpresas>;
  updateUserEmpresaRole(id: number, role: string): Promise<UsuarioEmpresas>;
  removeUserFromEmpresa(userId: string, empresaId: number): Promise<void>;

  // Templates
  getTemplate(id: number): Promise<Templates | undefined>;
  getTemplateByTemplateId(templateId: string): Promise<Templates | undefined>;
  getTemplatesBySegmento(segmentoId: number): Promise<Templates[]>;
  getAllTemplates(): Promise<Templates[]>;
  createTemplate(template: InsertTemplates): Promise<Templates>;
  updateTemplate(id: number, template: Partial<InsertTemplates>): Promise<Templates>;
  deleteTemplate(id: number): Promise<void>;

  // Arts
  getArte(id: number): Promise<Artes | undefined>;
  getArtesByEmpresa(empresaId: number): Promise<Artes[]>;
  getArquivadasByEmpresa(empresaId: number): Promise<Artes[]>;
  createArte(arte: InsertArtes): Promise<Artes>;
  updateArte(id: number, arte: Partial<InsertArtes>): Promise<Artes>;
  archiveArte(id: number): Promise<Artes>;
  unarchiveArte(id: number): Promise<Artes>;

  // Users (auth table) - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // User Profiles (using users table directly)
  getUserProfile(userId: string): Promise<User | undefined>;

  // Error Reports
  getReporteErro(id: number): Promise<ReportesErros | undefined>;
  getReportesErrosByEmpresa(empresaId: number): Promise<ReportesErros[]>;
  getAllReportesErros(): Promise<ReportesErros[]>;
  createReporteErro(reporte: InsertReportesErros): Promise<ReportesErros>;
  updateReporteErro(id: number, reporte: Partial<InsertReportesErros>): Promise<ReportesErros>;

  // AI Design Suggestions
  getAiDesignSuggestion(id: number): Promise<AiDesignSuggestions | undefined>;
  getAiDesignSuggestionsByEmpresa(empresaId: number): Promise<AiDesignSuggestions[]>;
  getAiDesignSuggestionsByTemplate(templateId: number): Promise<AiDesignSuggestions[]>;
  createAiDesignSuggestion(suggestion: InsertAiDesignSuggestions): Promise<AiDesignSuggestions>;
  updateAiDesignSuggestion(id: number, suggestion: Partial<InsertAiDesignSuggestions>): Promise<AiDesignSuggestions>;
  markSuggestionAsApplied(id: number): Promise<AiDesignSuggestions>;
  addSuggestionFeedback(id: number, feedback: string): Promise<AiDesignSuggestions>;

  // AI Content Generation
  getAiContentGeneration(id: number): Promise<AiContentGeneration | undefined>;
  getAiContentGenerationsByEmpresa(empresaId: number): Promise<AiContentGeneration[]>;
  getAiContentGenerationsByUser(userId: string): Promise<AiContentGeneration[]>;
  createAiContentGeneration(content: InsertAiContentGeneration): Promise<AiContentGeneration>;
  updateAiContentGeneration(id: number, content: Partial<InsertAiContentGeneration>): Promise<AiContentGeneration>;
  updateAiContentGenerationWebhookResponse(id: number, response: any): Promise<AiContentGeneration>;
  deleteAiContentGeneration(id: number): Promise<void>;

  // N8N Workflows
  getN8nWorkflow(id: number): Promise<N8nWorkflows | undefined>;
  getAllN8nWorkflows(): Promise<N8nWorkflows[]>;
  createN8nWorkflow(workflow: InsertN8nWorkflows): Promise<N8nWorkflows>;
  updateN8nWorkflow(id: number, workflow: Partial<InsertN8nWorkflows>): Promise<N8nWorkflows>;
  deleteN8nWorkflow(id: number): Promise<void>;
  getN8nWorkflowByN8nId(n8nId: string): Promise<N8nWorkflows | undefined>;

  // Digital Assets (Ativos Digitais)
  getAtivoDigital(id: number): Promise<AtivosDigitais | undefined>;
  getAtivosDigitaisByEmpresa(empresaId: number): Promise<AtivosDigitais[]>;
  createAtivoDigital(ativo: InsertAtivosDigitais): Promise<AtivosDigitais>;
  updateAtivoDigital(id: number, ativo: Partial<InsertAtivosDigitais>): Promise<AtivosDigitais>;
  deleteAtivoDigital(id: number): Promise<void>;

  // Products and Services (Produtos e Serviços)
  getProdutoServico(id: number): Promise<ProdutosServicos | undefined>;
  getProdutosServicosBySegmento(segmentoId: number): Promise<ProdutosServicos[]>;
  getProdutosServicosByEmpresa(empresaId: number): Promise<any[]>;
  getAllProdutosServicos(): Promise<ProdutosServicos[]>;
  createProdutoServico(produto: InsertProdutosServicos): Promise<ProdutosServicos>;
  updateProdutoServico(id: number, produto: Partial<InsertProdutosServicos>): Promise<ProdutosServicos>;
  deleteProdutoServico(id: number): Promise<void>;

  // Empresa Produtos/Serviços (relacionamento)
  getEmpresaProdutosServicos(empresaId: number): Promise<(ProdutosServicos & { empresa_produto_id: number })[]>;
  addProdutoServicoToEmpresa(data: InsertEmpresaProdutosServicos): Promise<EmpresaProdutosServicos>;
  removeProdutoServicoFromEmpresa(empresaId: number, produtoServicoId: number): Promise<void>;
  toggleEmpresaProdutoServicoStatus(empresaId: number, produtoServicoId: number, ativo: boolean): Promise<EmpresaProdutosServicos>;

  // Admin methods
  getAllEmpresas(): Promise<Empresas[]>;
  getAllUsers(): Promise<User[]>;
  getAllArtes(): Promise<Artes[]>;

  // Backwards compatibility
  getUsuario(id: number): Promise<Usuarios | undefined>;
  getUsuarioByUserId(userId: string): Promise<Usuarios | undefined>;
  createUsuario(usuario: InsertUsuarios): Promise<Usuarios>;
  updateUsuario(id: string, usuario: Partial<InsertUsuarios>): Promise<Usuarios>;
  deleteUsuario(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Segments
  async getEmpresaSegmento(id: number): Promise<EmpresaSegmento | undefined> {
    const result = await db.select().from(empresaSegmento).where(eq(empresaSegmento.id, id));
    return result[0];
  }

  async getAllEmpresaSegmentos(): Promise<EmpresaSegmento[]> {
    return await db.select().from(empresaSegmento);
  }

  async createEmpresaSegmento(segmento: InsertEmpresaSegmento): Promise<EmpresaSegmento> {
    const result = await db.insert(empresaSegmento).values(segmento).returning();
    return result[0];
  }

  // Planos
  async getPlano(id: number): Promise<Planos | undefined> {
    const result = await db.select().from(planos).where(eq(planos.id, id));
    return result[0];
  }

  async getAllPlanos(): Promise<Planos[]> {
    return await db.select().from(planos);
  }

  async createPlano(plano: InsertPlanos): Promise<Planos> {
    const result = await db.insert(planos).values(plano as any).returning();
    return result[0];
  }

  async updatePlano(id: number, plano: Partial<InsertPlanos>): Promise<Planos> {
    const result = await db.update(planos).set(plano).where(eq(planos.id, id)).returning();
    return result[0];
  }

  // Companies (Multi-tenant)
  async getEmpresa(id: number): Promise<Empresas | undefined> {
    const result = await db.select().from(empresas).where(eq(empresas.id, id));
    return result[0];
  }

  async getEmpresasByUser(userId: string): Promise<Empresas[]> {
    const result = await db
      .select({
        id: empresas.id,
        created_at: empresas.created_at,
        nome: empresas.nome,
        credito: empresas.credito,
        admin: empresas.admin,
        slug: empresas.slug,
        plano_id: empresas.plano_id,
        credito_restante: empresas.credito_restante,
        artes_mes_atual: empresas.artes_mes_atual,
        mes_referencia: empresas.mes_referencia,
        cores: empresas.cores,
        logo: empresas.logo,
        whatsapp: empresas.whatsapp,
        telefone: empresas.telefone,
        email: empresas.email,
        endereco: empresas.endereco,
        instagram: empresas.instagram,
        facebook: empresas.facebook,
        website: empresas.website,
        empresa_segmento: empresas.empresa_segmento,
        ativo: empresas.ativo,
        data_vencimento: empresas.data_vencimento,
        estado: empresas.estado,
        cidade: empresas.cidade,
        rodape: empresas.rodape,
        hashtag: empresas.hashtag,
        segmento_nome: empresaSegmento.name,
      })
      .from(empresas)
      .innerJoin(usuarioEmpresas, eq(empresas.id, usuarioEmpresas.empresa_id))
      .leftJoin(empresaSegmento, eq(empresas.empresa_segmento, empresaSegmento.id))
      .where(and(
        eq(usuarioEmpresas.user_id, userId),
        eq(usuarioEmpresas.ativo, true)
      ));
    
    return result as any[];
  }

  async createEmpresa(empresa: any): Promise<any> {
    const query = `
      INSERT INTO "Empresas" (nome, plano_id, empresa_segmento, email, telefone, endereco, whatsapp, instagram, facebook, website, logo, estado, cidade, rodape, hashtag, admin, credito)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;
    
    const values = [
      empresa.nome,
      empresa.plano_id,
      empresa.empresa_segmento,
      empresa.email,
      empresa.telefone,
      empresa.endereco,
      empresa.whatsapp,
      empresa.instagram,
      empresa.facebook,
      empresa.website,
      empresa.logo,
      empresa.estado,
      empresa.cidade,
      empresa.rodape,
      empresa.hashtag,
      empresa.admin,
      empresa.credito
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async updateEmpresa(id: number, empresa: Partial<InsertEmpresas>): Promise<Empresas> {
    const result = await db.update(empresas).set(empresa).where(eq(empresas.id, id)).returning();
    return result[0];
  }

  // User-Company Relationships
  async getUserEmpresas(userId: string): Promise<UsuarioEmpresas[]> {
    return await db.select().from(usuarioEmpresas)
      .where(and(
        eq(usuarioEmpresas.user_id, userId),
        eq(usuarioEmpresas.ativo, true)
      ));
  }

  async getEmpresaUsuarios(empresaId: number): Promise<UsuarioEmpresas[]> {
    return await db.select({
      id: usuarioEmpresas.id,
      created_at: usuarioEmpresas.created_at,
      user_id: usuarioEmpresas.user_id,
      empresa_id: usuarioEmpresas.empresa_id,
      role: usuarioEmpresas.role,
      ativo: usuarioEmpresas.ativo,
      status: usuarioEmpresas.status,
      // Include user details
      user_nome: users.nome,
      user_email: users.email,
      user_avatar_url: users.avatar_url,
    }).from(usuarioEmpresas)
      .leftJoin(users, eq(usuarioEmpresas.user_id, users.id))
      .where(and(
        eq(usuarioEmpresas.empresa_id, empresaId),
        eq(usuarioEmpresas.ativo, true)
      ));
  }

  async addUserToEmpresa(data: InsertUsuarioEmpresas): Promise<UsuarioEmpresas> {
    const result = await db.insert(usuarioEmpresas).values(data as any).returning();
    return result[0];
  }

  async updateUserEmpresaRole(id: number, role: string): Promise<UsuarioEmpresas> {
    const result = await db.update(usuarioEmpresas)
      .set({ role })
      .where(eq(usuarioEmpresas.id, id))
      .returning();
    return result[0];
  }

  async removeUserFromEmpresa(userId: string, empresaId: number): Promise<void> {
    await db.update(usuarioEmpresas)
      .set({ ativo: false })
      .where(and(
        eq(usuarioEmpresas.user_id, userId),
        eq(usuarioEmpresas.empresa_id, empresaId)
      ));
  }

  // Templates
  async getTemplate(id: number): Promise<Templates | undefined> {
    const result = await db.select().from(templates).where(eq(templates.id, id));
    return result[0];
  }

  async getTemplateByTemplateId(templateId: string): Promise<Templates | undefined> {
    const result = await db.select().from(templates).where(eq(templates.template_id, templateId));
    return result[0];
  }

  async getTemplatesBySegmento(segmentoId: number): Promise<Templates[]> {
    return await db.select().from(templates).where(eq(templates.empresa_segmento, segmentoId));
  }

  async getAllTemplates(): Promise<Templates[]> {
    return await db.select().from(templates);
  }

  async createTemplate(template: InsertTemplates): Promise<Templates> {
    const result = await db.insert(templates).values(template).returning();
    return result[0];
  }

  async updateTemplate(id: number, template: Partial<InsertTemplates>): Promise<Templates> {
    const result = await db.update(templates).set(template).where(eq(templates.id, id)).returning();
    return result[0];
  }

  async deleteTemplate(id: number): Promise<void> {
    await db.delete(templates).where(eq(templates.id, id));
  }

  // Arts
  async getArte(id: number): Promise<Artes | undefined> {
    const result = await db.select().from(artes).where(eq(artes.id, id));
    return result[0];
  }

  async getArtesByEmpresa(empresaId: number): Promise<Artes[]> {
    return await db.select().from(artes).where(and(eq(artes.empresa, empresaId), eq(artes.arquivada, false)));
  }

  async getArquivadasByEmpresa(empresaId: number): Promise<Artes[]> {
    return await db.select().from(artes).where(and(eq(artes.empresa, empresaId), eq(artes.arquivada, true)));
  }

  async createArte(arte: InsertArtes): Promise<Artes> {
    const result = await db.insert(artes).values(arte).returning();
    return result[0];
  }

  async updateArte(id: number, arte: Partial<InsertArtes>): Promise<Artes> {
    const [updated] = await db.update(artes).set(arte).where(eq(artes.id, id)).returning();
    return updated;
  }

  async archiveArte(id: number): Promise<Artes> {
    const [updated] = await db.update(artes).set({ arquivada: true }).where(eq(artes.id, id)).returning();
    return updated;
  }

  async unarchiveArte(id: number): Promise<Artes> {
    const [updated] = await db.update(artes).set({ arquivada: false }).where(eq(artes.id, id)).returning();
    return updated;
  }

  // Users
  // Users (auth table) implementation
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // User Profiles
  async getUserProfile(userId: string): Promise<User | undefined> {
    return this.getUser(userId);
  }

  // Backwards compatibility
  async getUsuario(id: number): Promise<Usuarios | undefined> {
    // Since we removed PerfilUsuarios, we'll return undefined
    return undefined;
  }

  async getUsuarioByUserId(userId: string): Promise<Usuarios | undefined> {
    // Use the users table directly
    return this.getUser(userId);
  }

  async createUsuario(usuario: InsertUsuarios): Promise<Usuarios> {
    // Use the users table directly
    return this.createUser(usuario);
  }

  async updateUsuario(id: string, usuario: Partial<InsertUsuarios>): Promise<Usuarios> {
    // Use the users table directly with string ID
    const result = await db.update(users).set(usuario).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUsuario(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Error Reports
  async getReporteErro(id: number): Promise<ReportesErros | undefined> {
    const result = await db.select().from(reportesErros).where(eq(reportesErros.id, id));
    return result[0];
  }

  async getReportesErrosByEmpresa(empresaId: number): Promise<ReportesErros[]> {
    return await db.select().from(reportesErros).where(eq(reportesErros.empresa_id, empresaId));
  }

  async getAllReportesErros(): Promise<ReportesErros[]> {
    return await db.select().from(reportesErros);
  }

  async createReporteErro(reporte: InsertReportesErros): Promise<ReportesErros> {
    const result = await db.insert(reportesErros).values(reporte as any).returning();
    return result[0];
  }

  async updateReporteErro(id: number, reporte: Partial<InsertReportesErros>): Promise<ReportesErros> {
    const result = await db.update(reportesErros).set(reporte).where(eq(reportesErros.id, id)).returning();
    return result[0];
  }

  // AI Design Suggestions
  async getAiDesignSuggestion(id: number): Promise<AiDesignSuggestions | undefined> {
    const result = await db.select().from(aiDesignSuggestions).where(eq(aiDesignSuggestions.id, id));
    return result[0];
  }

  async getAiDesignSuggestionsByEmpresa(empresaId: number): Promise<AiDesignSuggestions[]> {
    return await db.select().from(aiDesignSuggestions).where(eq(aiDesignSuggestions.empresa_id, empresaId));
  }

  async getAiDesignSuggestionsByTemplate(templateId: number): Promise<AiDesignSuggestions[]> {
    return await db.select().from(aiDesignSuggestions).where(eq(aiDesignSuggestions.template_id, templateId));
  }

  async createAiDesignSuggestion(suggestion: InsertAiDesignSuggestions): Promise<AiDesignSuggestions> {
    const result = await db.insert(aiDesignSuggestions).values(suggestion as any).returning();
    return result[0];
  }

  async updateAiDesignSuggestion(id: number, suggestion: Partial<InsertAiDesignSuggestions>): Promise<AiDesignSuggestions> {
    const result = await db.update(aiDesignSuggestions).set(suggestion).where(eq(aiDesignSuggestions.id, id)).returning();
    return result[0];
  }

  async markSuggestionAsApplied(id: number): Promise<AiDesignSuggestions> {
    const result = await db.update(aiDesignSuggestions).set({ applied: true }).where(eq(aiDesignSuggestions.id, id)).returning();
    return result[0];
  }

  async addSuggestionFeedback(id: number, feedback: string): Promise<AiDesignSuggestions> {
    const result = await db.update(aiDesignSuggestions).set({ user_feedback: feedback }).where(eq(aiDesignSuggestions.id, id)).returning();
    return result[0];
  }

  // AI Content Generation
  async getAiContentGeneration(id: number): Promise<AiContentGeneration | undefined> {
    const result = await db.select().from(aiContentGeneration).where(eq(aiContentGeneration.id, id));
    return result[0];
  }

  async getAiContentGenerationsByEmpresa(empresaId: number): Promise<AiContentGeneration[]> {
    return await db.select().from(aiContentGeneration).where(eq(aiContentGeneration.empresa_id, empresaId));
  }

  async getAiContentGenerationsByUser(userId: string): Promise<AiContentGeneration[]> {
    return await db.select().from(aiContentGeneration).where(eq(aiContentGeneration.user_id, userId));
  }

  async createAiContentGeneration(content: InsertAiContentGeneration): Promise<AiContentGeneration> {
    const result = await db.insert(aiContentGeneration).values(content).returning();
    return result[0];
  }

  async updateAiContentGeneration(id: number, content: Partial<InsertAiContentGeneration>): Promise<AiContentGeneration> {
    const result = await db.update(aiContentGeneration).set(content).where(eq(aiContentGeneration.id, id)).returning();
    return result[0];
  }

  async updateAiContentGenerationWebhookResponse(id: number, response: any): Promise<AiContentGeneration> {
    // Handle different webhook response formats
    let headline, conteudo, cta;
    
    // Handle new webhook format: [{ response: { body: { arteInstagram: {...} } } }]
    if (Array.isArray(response) && response[0]?.response?.body?.arteInstagram) {
      const arteData = response[0].response.body.arteInstagram;
      headline = arteData.headline;
      conteudo = arteData.conteudo;
      cta = arteData.chamadaParaAcao;
    }
    // Handle calendar format: [{ response: { body: { calendario_sazonal: [...] } } }]
    else if (Array.isArray(response) && response[0]?.response?.body?.calendario_sazonal) {
      const firstItem = response[0].response.body.calendario_sazonal[0];
      headline = firstItem?.headline;
      conteudo = firstItem?.conteudo;
      cta = firstItem?.cta;
    }
    // Handle old calendar format: { output: [...] }
    else if (response.output && Array.isArray(response.output)) {
      const firstItem = response.output[0];
      headline = firstItem?.headline;
      conteudo = firstItem?.conteudo;
      cta = firstItem?.cta;
    } 
    // Handle direct single content format
    else {
      headline = response.headline;
      conteudo = response.conteudo || response.content;
      cta = response.cta || response.chamadaParaAcao;
    }
    
    const result = await db.update(aiContentGeneration).set({ 
      webhook_response: response,
      headline: headline,
      conteudo: conteudo,
      cta: cta,
      status: 'completed'
    }).where(eq(aiContentGeneration.id, id)).returning();
    return result[0];
  }

  async deleteAiContentGeneration(id: number): Promise<void> {
    await db.delete(aiContentGeneration).where(eq(aiContentGeneration.id, id));
  }

  // N8N Workflows
  async getN8nWorkflow(id: number): Promise<N8nWorkflows | undefined> {
    const result = await db.select().from(n8nWorkflows).where(eq(n8nWorkflows.id, id));
    return result[0];
  }

  async getAllN8nWorkflows(): Promise<N8nWorkflows[]> {
    return await db.select().from(n8nWorkflows);
  }

  async createN8nWorkflow(workflow: InsertN8nWorkflows): Promise<N8nWorkflows> {
    const result = await db.insert(n8nWorkflows).values(workflow as any).returning();
    return result[0];
  }

  async updateN8nWorkflow(id: number, workflow: Partial<InsertN8nWorkflows>): Promise<N8nWorkflows> {
    const result = await db.update(n8nWorkflows).set({
      ...workflow,
      updated_at: new Date()
    }).where(eq(n8nWorkflows.id, id)).returning();
    return result[0];
  }

  async deleteN8nWorkflow(id: number): Promise<void> {
    await db.delete(n8nWorkflows).where(eq(n8nWorkflows.id, id));
  }

  async getN8nWorkflowByN8nId(n8nId: string): Promise<N8nWorkflows | undefined> {
    const result = await db.select().from(n8nWorkflows).where(eq(n8nWorkflows.n8n_id, n8nId));
    return result[0];
  }

  // Digital Assets (Ativos Digitais)
  async getAtivoDigital(id: number): Promise<AtivosDigitais | undefined> {
    const result = await db.select().from(ativosDigitais).where(eq(ativosDigitais.id, id));
    return result[0];
  }

  async getAtivosDigitaisByEmpresa(empresaId: number): Promise<AtivosDigitais[]> {
    return await db.select().from(ativosDigitais)
      .where(and(eq(ativosDigitais.empresa_id, empresaId), eq(ativosDigitais.ativo, true)))
      .orderBy(ativosDigitais.created_at);
  }

  async createAtivoDigital(ativo: InsertAtivosDigitais): Promise<AtivosDigitais> {
    const result = await db.insert(ativosDigitais).values(ativo as any).returning();
    return result[0];
  }

  async updateAtivoDigital(id: number, ativo: Partial<InsertAtivosDigitais>): Promise<AtivosDigitais> {
    const result = await db.update(ativosDigitais).set(ativo).where(eq(ativosDigitais.id, id)).returning();
    return result[0];
  }

  async deleteAtivoDigital(id: number): Promise<void> {
    await db.update(ativosDigitais).set({ ativo: false }).where(eq(ativosDigitais.id, id));
  }

  // Products and Services (Produtos e Serviços)
  async getProdutoServico(id: number): Promise<ProdutosServicos | undefined> {
    const result = await db.select().from(produtosServicos).where(eq(produtosServicos.id, id));
    return result[0];
  }

  async getProdutosServicosBySegmento(segmentoId: number): Promise<ProdutosServicos[]> {
    return await db.select().from(produtosServicos)
      .where(and(eq(produtosServicos.segmento_id, segmentoId), eq(produtosServicos.ativo, true)))
      .orderBy(produtosServicos.ordem, produtosServicos.nome);
  }

  async getProdutosServicosByEmpresa(empresaId: number): Promise<any[]> {
    // First get the company's segment
    const empresa = await this.getEmpresa(empresaId);
    if (!empresa?.empresa_segmento) {
      return [];
    }

    // Get all products/services from the company's segment (admin-created)
    const produtosSegmento = await db.select({
      id: produtosServicos.id,
      created_at: produtosServicos.created_at,
      updated_at: produtosServicos.updated_at,
      empresa_id: produtosServicos.empresa_id,
      segmento_id: produtosServicos.segmento_id,
      tipo: produtosServicos.tipo,
      nome: produtosServicos.nome,
      descricao: produtosServicos.descricao,
      preco: produtosServicos.preco,
      categoria: produtosServicos.categoria,
      duracao: produtosServicos.duracao,
      caracteristicas: produtosServicos.caracteristicas,
      imagem_url: produtosServicos.imagem_url,
      ativo: empresaProdutosServicos.ativo, // Status from relationship table
      ordem: produtosServicos.ordem,
      is_global: sql<boolean>`${produtosServicos.empresa_id} IS NULL`.as('is_global')
    })
    .from(produtosServicos)
    .leftJoin(
      empresaProdutosServicos, 
      and(
        eq(empresaProdutosServicos.produto_servico_id, produtosServicos.id),
        eq(empresaProdutosServicos.empresa_id, empresaId)
      )
    )
    .where(
      and(
        eq(produtosServicos.segmento_id, empresa.empresa_segmento),
        sql`${produtosServicos.empresa_id} IS NULL` // Only global products (admin-created)
      )
    )
    .orderBy(produtosServicos.ordem, produtosServicos.nome);

    // Auto-create relationships for products that don't have them yet
    for (const produto of produtosSegmento) {
      if (produto.ativo === null) {
        // Create relationship with default active status
        await db.insert(empresaProdutosServicos).values({
          empresa_id: empresaId,
          produto_servico_id: produto.id,
          ativo: true
        });
        produto.ativo = true;
      }
    }

    return produtosSegmento;
  }

  async getAllProdutosServicos(): Promise<ProdutosServicos[]> {
    return await db.select().from(produtosServicos)
      .where(eq(produtosServicos.ativo, true))
      .orderBy(produtosServicos.ordem, produtosServicos.nome);
  }

  async createProdutoServico(produto: InsertProdutosServicos): Promise<ProdutosServicos> {
    const result = await db.insert(produtosServicos).values(produto as any).returning();
    return result[0];
  }

  async updateProdutoServico(id: number, produto: Partial<InsertProdutosServicos>): Promise<ProdutosServicos> {
    const result = await db.update(produtosServicos).set({
      ...produto,
      updated_at: new Date()
    }).where(eq(produtosServicos.id, id)).returning();
    return result[0];
  }

  async deleteProdutoServico(id: number): Promise<void> {
    await db.update(produtosServicos).set({ ativo: false }).where(eq(produtosServicos.id, id));
  }

  // Empresa Produtos/Serviços (relacionamento)
  async getEmpresaProdutosServicos(empresaId: number): Promise<(ProdutosServicos & { empresa_produto_id: number })[]> {
    const result = await db
      .select({
        id: produtosServicos.id,
        created_at: produtosServicos.created_at,
        updated_at: produtosServicos.updated_at,
        empresa_id: produtosServicos.empresa_id,
        segmento_id: produtosServicos.segmento_id,
        tipo: produtosServicos.tipo,
        nome: produtosServicos.nome,
        descricao: produtosServicos.descricao,
        preco: produtosServicos.preco,
        categoria: produtosServicos.categoria,
        duracao: produtosServicos.duracao,
        caracteristicas: produtosServicos.caracteristicas,
        imagem_url: produtosServicos.imagem_url,
        ativo: produtosServicos.ativo,
        ordem: produtosServicos.ordem,
        empresa_produto_id: empresaProdutosServicos.id,
      })
      .from(empresaProdutosServicos)
      .innerJoin(produtosServicos, eq(empresaProdutosServicos.produto_servico_id, produtosServicos.id))
      .where(and(
        eq(empresaProdutosServicos.empresa_id, empresaId),
        eq(empresaProdutosServicos.ativo, true)
      ))
      .orderBy(produtosServicos.ordem, produtosServicos.nome);
    
    return result;
  }

  async addProdutoServicoToEmpresa(data: InsertEmpresaProdutosServicos): Promise<EmpresaProdutosServicos> {
    const result = await db.insert(empresaProdutosServicos).values(data as any).returning();
    return result[0];
  }

  async removeProdutoServicoFromEmpresa(empresaId: number, produtoServicoId: number): Promise<void> {
    await db.update(empresaProdutosServicos)
      .set({ ativo: false })
      .where(and(
        eq(empresaProdutosServicos.empresa_id, empresaId),
        eq(empresaProdutosServicos.produto_servico_id, produtoServicoId)
      ));
  }

  async toggleEmpresaProdutoServicoStatus(empresaId: number, produtoServicoId: number, ativo: boolean): Promise<EmpresaProdutosServicos> {
    // First try to update existing relationship
    const result = await db.update(empresaProdutosServicos)
      .set({ ativo, updated_at: new Date() })
      .where(and(
        eq(empresaProdutosServicos.empresa_id, empresaId),
        eq(empresaProdutosServicos.produto_servico_id, produtoServicoId)
      ))
      .returning();

    if (result.length > 0) {
      return result[0];
    }

    // If no existing relationship, create new one
    const created = await db.insert(empresaProdutosServicos)
      .values({
        empresa_id: empresaId,
        produto_servico_id: produtoServicoId,
        ativo: ativo
      })
      .returning();
    
    return created[0];
  }

  // Admin methods
  async getAllEmpresas(): Promise<Empresas[]> {
    return await db.select().from(empresas);
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllArtes(): Promise<Artes[]> {
    return await db.select().from(artes);
  }
}

export const storage = new DatabaseStorage();
