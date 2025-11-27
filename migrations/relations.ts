import { relations } from "drizzle-orm/relations";
import { empresaCategoria, templates, empresas, artes, planos, usuarios, usuarioEmpresas } from "./schema";

export const templatesRelations = relations(templates, ({one}) => ({
	empresaCategoria: one(empresaCategoria, {
		fields: [templates.empresaCategoria],
		references: [empresaCategoria.id]
	}),
}));

export const empresaCategoriaRelations = relations(empresaCategoria, ({many}) => ({
	templates: many(templates),
	empresas: many(empresas),
}));

export const artesRelations = relations(artes, ({one}) => ({
	empresa: one(empresas, {
		fields: [artes.empresa],
		references: [empresas.id]
	}),
}));

export const empresasRelations = relations(empresas, ({one, many}) => ({
	artes: many(artes),
	empresaCategoria: one(empresaCategoria, {
		fields: [empresas.empresaCategoria],
		references: [empresaCategoria.id]
	}),
	plano: one(planos, {
		fields: [empresas.planoId],
		references: [planos.id]
	}),
	usuarios: many(usuarios),
	usuarioEmpresas: many(usuarioEmpresas),
}));

export const planosRelations = relations(planos, ({many}) => ({
	empresas: many(empresas),
}));

export const usuariosRelations = relations(usuarios, ({one}) => ({
	empresa: one(empresas, {
		fields: [usuarios.empresaId],
		references: [empresas.id]
	}),
}));

export const usuarioEmpresasRelations = relations(usuarioEmpresas, ({one}) => ({
	empresa: one(empresas, {
		fields: [usuarioEmpresas.empresaId],
		references: [empresas.id]
	}),
}));