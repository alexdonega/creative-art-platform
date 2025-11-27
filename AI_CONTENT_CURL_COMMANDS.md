# AI Content Generation API - Comandos CURL

## Configuração Inicial

### 1. Login (Obrigatório)
```bash
curl -X POST "http://localhost:5000/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}' \
  -c cookies.txt
```

## Operações CRUD

### 2. Buscar Conteúdo AI por ID
```bash
curl -X GET "http://localhost:5000/api/ai-content/1" \
  -H "Cookie: $(cat cookies.txt)" \
  -H "Content-Type: application/json"
```

### 3. Listar Todos os Conteúdos de um Usuário
```bash
curl -X GET "http://localhost:5000/api/ai-content/by-user/admin-uuid" \
  -H "Cookie: $(cat cookies.txt)" \
  -H "Content-Type: application/json"
```

### 4. Atualizar Conteúdo AI
```bash
curl -X PUT "http://localhost:5000/api/ai-content/1" \
  -H "Content-Type: application/json" \
  -H "Cookie: $(cat cookies.txt)" \
  -d '{
    "tema": "Marketing Digital Atualizado",
    "tipo_postagem": "story",
    "tom_voz": "casual",
    "headline": "Nova headline personalizada",
    "conteudo": "Conteúdo completamente atualizado",
    "cta": "Saiba mais agora!",
    "status": "completed"
  }'
```

### 5. Deletar Conteúdo AI
```bash
curl -X DELETE "http://localhost:5000/api/ai-content/1" \
  -H "Cookie: $(cat cookies.txt)"
```

## Para Ambiente Externo (Replit Deployment)

Substitua `YOUR_REPLIT_URL` pela URL do seu deployment:

### Login Externo
```bash
curl -X POST "https://YOUR_REPLIT_URL/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}' \
  -c cookies.txt
```

### Buscar por ID (Externo)
```bash
curl -X GET "https://YOUR_REPLIT_URL/api/ai-content/ID_DO_CONTEUDO" \
  -H "Cookie: $(cat cookies.txt)" \
  -H "Content-Type: application/json"
```

### Listar por Usuário (Externo)
```bash
curl -X GET "https://YOUR_REPLIT_URL/api/ai-content/by-user/USER_ID" \
  -H "Cookie: $(cat cookies.txt)" \
  -H "Content-Type: application/json"
```

### Atualizar (Externo)
```bash
curl -X PUT "https://YOUR_REPLIT_URL/api/ai-content/ID_DO_CONTEUDO" \
  -H "Content-Type: application/json" \
  -H "Cookie: $(cat cookies.txt)" \
  -d '{"tema":"Novo tema","headline":"Nova headline","status":"completed"}'
```

### Deletar (Externo)
```bash
curl -X DELETE "https://YOUR_REPLIT_URL/api/ai-content/ID_DO_CONTEUDO" \
  -H "Cookie: $(cat cookies.txt)"
```

## Teste Sequencial Completo

Execute estes comandos em sequência para testar todas as funcionalidades:

```bash
# 1. Fazer login
curl -X POST "http://localhost:5000/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}' \
  -c test_cookies.txt

# 2. Listar conteúdos existentes
echo "Conteúdos existentes:"
curl -X GET "http://localhost:5000/api/ai-content/by-user/admin-uuid" \
  -H "Cookie: $(cat test_cookies.txt)" && echo

# 3. Testar busca por ID inexistente
echo "Testando ID inexistente:"
curl -X GET "http://localhost:5000/api/ai-content/999" \
  -H "Cookie: $(cat test_cookies.txt)" && echo

# 4. Se houver conteúdo existente, teste atualização (substitua ID_REAL pelo ID correto)
# curl -X PUT "http://localhost:5000/api/ai-content/ID_REAL" \
#   -H "Content-Type: application/json" \
#   -H "Cookie: $(cat test_cookies.txt)" \
#   -d '{"tema":"Teste atualizado","headline":"Nova headline"}'
```

## Campos Disponíveis para Atualização

Todos os campos são opcionais no PUT:

- `tema`: string - Tema/tópico do conteúdo
- `tipo_postagem`: "feed"|"story"|"reels"|"carousel"|"calendar"
- `quantidade_artes`: number - Quantidade de artes (padrão: 1)
- `quantidade_dias`: number - Quantidade de dias (padrão: 1)
- `tom_voz`: "profissional"|"casual"|"divertido"|"inspirador"|"educativo"
- `headline`: string - Título gerado
- `conteudo`: string - Conteúdo gerado
- `cta`: string - Call-to-action
- `status`: "pending"|"completed"|"failed"

## Respostas das APIs

### Sucesso (200/201)
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
  "headline": "Título do conteúdo",
  "conteudo": "Conteúdo completo...",
  "cta": "Saiba mais!",
  "status": "completed",
  "created_at": "2025-07-21T01:00:00Z",
  "updated_at": "2025-07-21T01:05:00Z"
}
```

### Erro 404 (Não encontrado)
```json
{
  "error": "AI content not found"
}
```

### Erro 401 (Não autenticado)
```json
{
  "message": "Unauthorized"
}
```

### Erro 400 (Validação)
```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "number",
      "path": ["tema"],
      "message": "Expected string, received number"
    }
  ]
}
```