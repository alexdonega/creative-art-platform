# API Documentation

## APIs Existentes

### 1. API para Listar Categorias de Empresas

**Endpoint:** `GET /api/categories`

**Descrição:** Retorna todas as categorias de empresas disponíveis no sistema.

**Resposta:**
```json
[
  {
    "id": 6,
    "name": "Auto Escola"
  },
  {
    "id": 12,
    "name": "Restaurante"
  }
]
```

**Exemplo de uso:**
```bash
curl -X GET "http://localhost:5000/api/categories"
```

### 2. API para Adicionar Categorias de Empresas

**Endpoint:** `POST /api/categories`

**Descrição:** Cria uma nova categoria de empresa.

**Body:**
```json
{
  "name": "Nome da Categoria"
}
```

**Resposta:**
```json
{
  "id": 13,
  "name": "Nome da Categoria"
}
```

**Exemplo de uso:**
```bash
curl -X POST "http://localhost:5000/api/categories" \
  -H "Content-Type: application/json" \
  -d '{"name": "Clínica Médica"}'
```

### 3. API para Listar Templates

**Endpoint:** `GET /api/templates`

**Descrição:** Retorna todos os templates ou templates filtrados por categoria.

**Parâmetros de Query:**
- `categoria` (opcional): ID da categoria para filtrar os templates

**Resposta:**
```json
[
  {
    "id": 27,
    "created_at": "2025-07-07T02:10:53.000Z",
    "name": "Template Auto Escola",
    "categoria_id": 6,
    "image": "https://exemplo.com/template.jpg",
    "width": 1080,
    "height": 1080,
    "context": "{\"fields\":[{\"name\":\"nome\",\"type\":\"text\"},{\"name\":\"telefone\",\"type\":\"text\"}]}",
    "texto_apoio": "Texto de apoio do template"
  }
]
```

**Exemplo de uso:**
```bash
# Listar todos os templates
curl -X GET "http://localhost:5000/api/templates"

# Listar templates de uma categoria específica
curl -X GET "http://localhost:5000/api/templates?categoria=6"
```

### 4. API para Buscar Template por Template ID

**Endpoint:** `GET /api/templates/template/:templateId`

**Descrição:** Busca um template específico usando seu template_id único.

**Parâmetros:**
- `templateId` (obrigatório): ID único do template no sistema externo

**Resposta:**
```json
{
  "id": 27,
  "created_at": "2025-07-07T02:10:53.483Z",
  "template_id": "686a6dd8960ca6c146da12a4",
  "width": 640,
  "height": 950,
  "name": "TESTE 2",
  "empresa_categoria": 6,
  "image": "https://files.markupgo.com/tasks/68694031960ca6c146da045f/1751805792354.png",
  "context": {
    "nome": "Deverse Conclave 2025",
    "nomecompelto": "Matthew John Alexander",
    "departamento": "SPEAKER",
    "logo": "https://assets.markupgo.com/templates/qr-2/avatar.png?v1",
    "cor-1": "#000",
    "col-2": "#333",
    "qr": "https://assets.markupgo.com/templates/qr-2/markupgo-qr.png"
  },
  "texto_apoio": "Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
}
```

**Resposta de erro (404):**
```json
{
  "error": "Template not found"
}
```

**Exemplo de uso:**
```bash
curl -X GET "http://localhost:5000/api/templates/template/686a6dd8960ca6c146da12a4"
```

### 5. API para Adicionar Templates

**Endpoint:** `POST /api/templates`

**Descrição:** Cria um novo template no sistema.

**Body:**
```json
{
  "name": "Nome do Template",
  "categoria_id": 6,
  "image": "https://exemplo.com/template.jpg",
  "width": 1080,
  "height": 1080,
  "context": "{\"fields\":[{\"name\":\"nome\",\"type\":\"text\",\"defaultValue\":\"\"},{\"name\":\"telefone\",\"type\":\"text\",\"defaultValue\":\"\"}]}",
  "texto_apoio": "Texto de apoio padrão do template"
}
```

**Resposta:**
```json
{
  "id": 28,
  "created_at": "2025-07-13T22:00:00.000Z",
  "name": "Nome do Template",
  "categoria_id": 6,
  "image": "https://exemplo.com/template.jpg",
  "width": 1080,
  "height": 1080,
  "context": "{\"fields\":[{\"name\":\"nome\",\"type\":\"text\",\"defaultValue\":\"\"},{\"name\":\"telefone\",\"type\":\"text\",\"defaultValue\":\"\"}]}",
  "texto_apoio": "Texto de apoio padrão do template"
}
```

**Exemplo de uso:**
```bash
curl -X POST "http://localhost:5000/api/templates" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Template Restaurante",
    "categoria_id": 12,
    "image": "https://exemplo.com/restaurante.jpg",
    "width": 1080,
    "height": 1080,
    "context": "{\"fields\":[{\"name\":\"nome\",\"type\":\"text\"},{\"name\":\"telefone\",\"type\":\"text\"},{\"name\":\"endereco\",\"type\":\"text\"}]}",
    "texto_apoio": "Venha conhecer nosso restaurante!"
  }'
```

## Campos Obrigatórios para Templates

- `name`: Nome do template
- `categoria_id`: ID da categoria (deve existir na tabela EmpresaCategoria)
- `width`: Largura da imagem em pixels
- `height`: Altura da imagem em pixels

## Campos Opcionais para Templates

- `image`: URL da imagem do template
- `context`: JSON string com configuração dos campos dinâmicos
- `texto_apoio`: Texto de apoio padrão do template

## Estrutura do Context

O campo `context` é uma string JSON que define os campos dinâmicos do template:

```json
{
  "fields": [
    {
      "name": "nome",
      "type": "text",
      "defaultValue": ""
    },
    {
      "name": "telefone", 
      "type": "text",
      "defaultValue": ""
    }
  ]
}
```

## Campos Automáticos do Sistema

O sistema automaticamente mapeia os seguintes campos com dados da empresa ativa:

- `nome` ou `empresa` → nome da empresa
- `telefone` → telefone da empresa
- `email` → email da empresa
- `endereco` ou `endereço` → endereço da empresa
- `whatsapp` → whatsapp da empresa
- `instagram` → instagram da empresa
- `facebook` → facebook da empresa
- `cidade` → cidade da empresa
- `estado` → estado da empresa
- `rodape` ou `rodapé` → rodapé da empresa
- `hashtag` ou `hashtags` → hashtags da empresa

### 5. API para Adicionar Artes

**Endpoint:** `POST /api/arts`

**Descrição:** Adiciona uma nova arte manualmente ao sistema.

**Body:**
```json
{
  "link": "https://exemplo.com/arte.jpg",
  "width": 1080,
  "height": 1080,
  "empresa": 7
}
```

**Resposta:**
```json
{
  "id": 15,
  "created_at": "2025-07-13T22:00:00.000Z",
  "link": "https://exemplo.com/arte.jpg",
  "width": 1080,
  "height": 1080,
  "empresa": 7
}
```

**Exemplo de uso:**
```bash
curl -X POST "http://localhost:5000/api/arts" \
  -H "Content-Type: application/json" \
  -d '{
    "link": "https://exemplo.com/arte-personalizada.jpg",
    "width": 1080,
    "height": 1080,
    "empresa": 7
  }'
```

### 6. API para Listar Artes por Empresa

**Endpoint:** `GET /api/arts/by-company/:companyId`

**Descrição:** Lista todas as artes ativas de uma empresa específica.

**Parâmetros:**
- `companyId`: ID da empresa

**Resposta:**
```json
[
  {
    "id": 15,
    "created_at": "2025-07-13T22:00:00.000Z",
    "link": "https://exemplo.com/arte.jpg",
    "width": 1080,
    "height": 1080,
    "empresa": 7
  }
]
```

**Exemplo de uso:**
```bash
curl -X GET "http://localhost:5000/api/arts/by-company/7"
```

### 7. API para Listar Artes Arquivadas

**Endpoint:** `GET /api/arts/archived/:companyId`

**Descrição:** Lista todas as artes arquivadas de uma empresa específica.

**Parâmetros:**
- `companyId`: ID da empresa

**Resposta:**
```json
[
  {
    "id": 16,
    "created_at": "2025-07-13T22:00:00.000Z",
    "link": "https://exemplo.com/arte-arquivada.jpg",
    "width": 1080,
    "height": 1080,
    "empresa": 7,
    "arquivada": true
  }
]
```

**Exemplo de uso:**
```bash
curl -X GET "http://localhost:5000/api/arts/archived/7"
```

### 8. API para Arquivar Arte

**Endpoint:** `PATCH /api/arts/:id/archive`

**Descrição:** Arquiva uma arte específica.

**Parâmetros:**
- `id`: ID da arte

**Resposta:**
```json
{
  "id": 15,
  "created_at": "2025-07-13T22:00:00.000Z",
  "link": "https://exemplo.com/arte.jpg",
  "width": 1080,
  "height": 1080,
  "empresa": 7,
  "arquivada": true
}
```

**Exemplo de uso:**
```bash
curl -X PATCH "http://localhost:5000/api/arts/15/archive"
```

### 9. API para Desarquivar Arte

**Endpoint:** `PATCH /api/arts/:id/unarchive`

**Descrição:** Restaura uma arte arquivada.

**Parâmetros:**
- `id`: ID da arte

**Resposta:**
```json
{
  "id": 15,
  "created_at": "2025-07-13T22:00:00.000Z",
  "link": "https://exemplo.com/arte.jpg",
  "width": 1080,
  "height": 1080,
  "empresa": 7,
  "arquivada": false
}
```

**Exemplo de uso:**
```bash
curl -X PATCH "http://localhost:5000/api/arts/15/unarchive"
```

## Campos Obrigatórios para Artes

- `empresa`: ID da empresa (deve existir na tabela Empresas)

## Campos Opcionais para Artes

- `link`: URL da imagem da arte
- `width`: Largura da arte em pixels
- `height`: Altura da arte em pixels
- `arquivada`: Status de arquivamento (padrão: false)

## AI Content Generation API Endpoints

### 1. GET /api/ai-content/:id
Busca um conteúdo AI específico por ID

**Parâmetros:**
- `id`: ID do conteúdo AI

**Resposta (200 OK):**
```json
{
  "id": 1,
  "empresa_id": 12,
  "user_id": "admin-uuid",
  "tema": "Marketing Digital",
  "tipo_postagem": "feed",
  "quantidade_artes": 1,
  "quantidade_dias": 1,
  "tom_voz": "profissional",
  "webhook_response": {},
  "headline": "Como transformar sua estratégia digital",
  "conteudo": "O marketing digital é essencial...",
  "cta": "Saiba mais!",
  "status": "completed",
  "created_at": "2025-07-14T10:30:00Z",
  "updated_at": "2025-07-14T10:35:00Z"
}
```

**Resposta (404 Not Found):**
```json
{
  "error": "AI content not found"
}
```

**Exemplo de uso:**
```bash
curl -X GET "http://localhost:5000/api/ai-content/1" \
  -H "Cookie: connect.sid=SESSION_COOKIE"
```

### 2. PUT /api/ai-content/:id
Atualiza dados de um conteúdo AI

**Parâmetros:**
- `id`: ID do conteúdo AI

**Body (todos os campos são opcionais):**
```json
{
  "tema": "Novo tema de marketing",
  "tipo_postagem": "story",
  "quantidade_artes": 3,
  "tom_voz": "casual",
  "headline": "Headline atualizada",
  "conteudo": "Conteúdo atualizado",
  "cta": "Nova CTA",
  "status": "completed"
}
```

**Resposta (200 OK):**
```json
{
  "id": 1,
  "empresa_id": 12,
  "user_id": "admin-uuid",
  "tema": "Novo tema de marketing",
  "tipo_postagem": "story",
  "quantidade_artes": 3,
  "quantidade_dias": 1,
  "tom_voz": "casual",
  "webhook_response": {},
  "headline": "Headline atualizada",
  "conteudo": "Conteúdo atualizado",
  "cta": "Nova CTA",
  "status": "completed",
  "created_at": "2025-07-14T10:30:00Z",
  "updated_at": "2025-07-14T10:45:00Z"
}
```

**Exemplo de uso:**
```bash
curl -X PUT "http://localhost:5000/api/ai-content/1" \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=SESSION_COOKIE" \
  -d '{
    "tema": "Marketing Sustentável",
    "headline": "Como implementar marketing verde",
    "status": "completed"
  }'
```

### 3. DELETE /api/ai-content/:id
Remove um conteúdo AI

**Parâmetros:**
- `id`: ID do conteúdo AI

**Resposta (204 No Content):**
Sem conteúdo no corpo da resposta.

**Exemplo de uso:**
```bash
curl -X DELETE "http://localhost:5000/api/ai-content/1" \
  -H "Cookie: connect.sid=SESSION_COOKIE"
```

### 4. GET /api/ai-content/by-user/:userId
Lista todos os conteúdos AI de um usuário específico

**Parâmetros:**
- `userId`: ID do usuário

**Resposta (200 OK):**
```json
[
  {
    "id": 1,
    "tema": "Marketing Digital",
    "tipo_postagem": "feed",
    "headline": "Como transformar sua estratégia digital",
    "conteudo": "O marketing digital é essencial...",
    "cta": "Saiba mais!",
    "status": "completed",
    "created_at": "2025-07-14T10:30:00Z"
  },
  {
    "id": 2,
    "tema": "Vendas Online",
    "tipo_postagem": "story",
    "headline": "Aumente suas vendas hoje",
    "conteudo": "Estratégias comprovadas...",
    "cta": "Comece agora!",
    "status": "pending",
    "created_at": "2025-07-14T11:00:00Z"
  }
]
```

**Exemplo de uso:**
```bash
curl -X GET "http://localhost:5000/api/ai-content/by-user/admin-uuid" \
  -H "Cookie: connect.sid=SESSION_COOKIE"
```

## Campos do AI Content Generation

### Campos Obrigatórios (para criação):
- `tema`: Tema/tópico do conteúdo
- `tipo_postagem`: Tipo do post ("feed", "story", "reels", "carousel", "calendar")
- `tom_voz`: Tom de voz ("profissional", "casual", "divertido", "inspirador", "educativo")
- `empresa_id`: ID da empresa
- `user_id`: ID do usuário

### Campos Opcionais:
- `quantidade_artes`: Quantidade de artes (padrão: 1)
- `quantidade_dias`: Quantidade de dias (padrão: 1)
- `webhook_response`: Resposta do webhook (JSON)
- `headline`: Título gerado
- `conteudo`: Conteúdo gerado
- `cta`: Call-to-action
- `status`: Status ("pending", "completed", "failed")

### Campos Automáticos:
- `id`: ID único gerado automaticamente
- `created_at`: Data/hora de criação
- `updated_at`: Data/hora da última atualização