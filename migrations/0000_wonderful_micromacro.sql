-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "EmpresaCategoria" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name ""EmpresaCategoria_id_seq"" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1),
	"name" text
);
--> statement-breakpoint
CREATE TABLE "Templates" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name ""Templates_id_seq"" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"template_id" text,
	"width" bigint,
	"height" bigint,
	"context" json,
	"image" text,
	"empresa_categoria" bigint,
	"name" text
);
--> statement-breakpoint
CREATE TABLE "Artes" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name ""Artes_id_seq"" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"link" text,
	"width" bigint,
	"height" bigint,
	"empresa" bigint
);
--> statement-breakpoint
CREATE TABLE "Empresas" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name ""Empresas_id_seq"" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"nome" text,
	"credito" bigint,
	"admin" uuid,
	"cores" json DEFAULT '{"cor-1":"#1A73E8","cor-2":"#34A853","cor-3":"#FBBC05","cor-4":"#EA4335"}'::json,
	"logo" text DEFAULT 'https://novoenvio.com.br/wp-content/uploads/2025/01/logo_novoenvio_padrao.svg',
	"whatsapp" text DEFAULT '(45) 9 9999-9999',
	"telefone" text DEFAULT '(45) 9999-9999',
	"email" text DEFAULT 'email@gmail.com',
	"endereco" text DEFAULT 'Rua Sem Nome, 87 - AP 654 - Bairro - Cidade - UF',
	"instagram" text DEFAULT '@instagram',
	"facebook" text DEFAULT '/facebook',
	"empresa_categoria" bigint,
	"plano_id" bigint
);
--> statement-breakpoint
CREATE TABLE "Usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"empresa_id" integer NOT NULL,
	"nome" text NOT NULL,
	"telefone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "UsuarioEmpresas" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name ""UsuarioEmpresas_id_seq"" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"empresa_id" bigint NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"ativo" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "Planos" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name ""Planos_id_seq"" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"nome" text NOT NULL,
	"preco_mensal" bigint NOT NULL,
	"limite_usuarios" bigint,
	"limite_artes_mes" bigint,
	"recursos" json,
	"ativo" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "PerfilUsuarios" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name ""PerfilUsuarios_id_seq"" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"telefone" text,
	"avatar_url" text,
	"timezone" text DEFAULT 'America/Sao_Paulo'
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_empresa_categoria_EmpresaCategoria_id_fk" FOREIGN KEY ("empresa_categoria") REFERENCES "public"."EmpresaCategoria"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Artes" ADD CONSTRAINT "Artes_empresa_Empresas_id_fk" FOREIGN KEY ("empresa") REFERENCES "public"."Empresas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Empresas" ADD CONSTRAINT "Empresas_empresa_categoria_EmpresaCategoria_id_fk" FOREIGN KEY ("empresa_categoria") REFERENCES "public"."EmpresaCategoria"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Empresas" ADD CONSTRAINT "Empresas_plano_id_fkey" FOREIGN KEY ("plano_id") REFERENCES "public"."Planos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Usuarios" ADD CONSTRAINT "Usuarios_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."Empresas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UsuarioEmpresas" ADD CONSTRAINT "UsuarioEmpresas_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."Empresas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_session_expire" ON "sessions" USING btree ("expire" timestamp_ops);
*/