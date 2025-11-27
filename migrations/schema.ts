import { pgTable, bigint, text, foreignKey, timestamp, json, uuid, serial, integer, boolean, index, varchar, jsonb, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const empresaCategoria = pgTable("EmpresaCategoria", {
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: ""EmpresaCategoria_id_seq"", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807 }),
        name: text(),
});

export const templates = pgTable("Templates", {
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: ""Templates_id_seq"", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807 }),
        createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        templateId: text("template_id"),
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        width: bigint({ mode: "number" }),
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        height: bigint({ mode: "number" }),
        context: json(),
        image: text(),
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        empresaCategoria: bigint("empresa_categoria", { mode: "number" }),
        name: text(),
}, (table) => [
        foreignKey({
                        columns: [table.empresaCategoria],
                        foreignColumns: [empresaCategoria.id],
                        name: "Templates_empresa_categoria_EmpresaCategoria_id_fk"
                }),
]);

export const artes = pgTable("Artes", {
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: ""Artes_id_seq"", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807 }),
        createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        link: text(),
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        width: bigint({ mode: "number" }),
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        height: bigint({ mode: "number" }),
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        empresa: bigint({ mode: "number" }),
}, (table) => [
        foreignKey({
                        columns: [table.empresa],
                        foreignColumns: [empresas.id],
                        name: "Artes_empresa_Empresas_id_fk"
                }),
]);

export const empresas = pgTable("Empresas", {
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: ""Empresas_id_seq"", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807 }),
        createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        nome: text(),
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        credito: bigint({ mode: "number" }),
        admin: uuid(),
        cores: json().default({"cor-1":"#1A73E8","cor-2":"#34A853","cor-3":"#FBBC05","cor-4":"#EA4335"}),
        logo: text().default('https://novoenvio.com.br/wp-content/uploads/2025/01/logo_novoenvio_padrao.svg'),
        whatsapp: text().default('(45) 9 9999-9999'),
        telefone: text().default('(45) 9999-9999'),
        email: text().default('email@gmail.com'),
        endereco: text().default('Rua Sem Nome, 87 - AP 654 - Bairro - Cidade - UF'),
        instagram: text().default('@instagram'),
        facebook: text().default('/facebook'),
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        empresaCategoria: bigint("empresa_categoria", { mode: "number" }),
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        planoId: bigint("plano_id", { mode: "number" }),
}, (table) => [
        foreignKey({
                        columns: [table.empresaCategoria],
                        foreignColumns: [empresaCategoria.id],
                        name: "Empresas_empresa_categoria_EmpresaCategoria_id_fk"
                }),
        foreignKey({
                        columns: [table.planoId],
                        foreignColumns: [planos.id],
                        name: "Empresas_plano_id_fkey"
                }),
]);

export const usuarios = pgTable("Usuarios", {
        id: serial().primaryKey().notNull(),
        userId: uuid("user_id").notNull(),
        empresaId: integer("empresa_id").notNull(),
        nome: text().notNull(),
        telefone: text(),
        createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
        foreignKey({
                        columns: [table.empresaId],
                        foreignColumns: [empresas.id],
                        name: "Usuarios_empresa_id_fkey"
                }),
]);

export const usuarioEmpresas = pgTable("UsuarioEmpresas", {
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: ""UsuarioEmpresas_id_seq"", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807 }),
        createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        userId: uuid("user_id").notNull(),
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        empresaId: bigint("empresa_id", { mode: "number" }).notNull(),
        role: text().default('member').notNull(),
        ativo: boolean().default(true),
}, (table) => [
        foreignKey({
                        columns: [table.empresaId],
                        foreignColumns: [empresas.id],
                        name: "UsuarioEmpresas_empresa_id_fkey"
                }),
]);

export const planos = pgTable("Planos", {
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: ""Planos_id_seq"", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807 }),
        createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        nome: text().notNull(),
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        precoMensal: bigint("preco_mensal", { mode: "number" }).notNull(),
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        limiteUsuarios: bigint("limite_usuarios", { mode: "number" }),
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        limiteArtesMes: bigint("limite_artes_mes", { mode: "number" }),
        recursos: json(),
        ativo: boolean().default(true),
});



export const sessions = pgTable("sessions", {
        sid: varchar().primaryKey().notNull(),
        sess: jsonb().notNull(),
        expire: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
        index("idx_session_expire").using("btree", table.expire.asc().nullsLast().op("timestamp_ops")),
]);

export const users = pgTable("users", {
        id: varchar().primaryKey().notNull(),
        email: varchar(),
        firstName: varchar("first_name"),
        lastName: varchar("last_name"),
        profileImageUrl: varchar("profile_image_url"),
        createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
        updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
        unique("users_email_key").on(table.email),
]);
