# Guia de Contribuição

Obrigado por considerar contribuir para o ArtGen! Este documento fornece diretrizes para contribuir com o projeto.

## Como Contribuir

### 1. Fork o Projeto
```bash
# Clone seu fork
git clone https://github.com/seu-usuario/artgen.git
cd artgen
```

### 2. Configurar o Ambiente
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Configurar banco de dados
npm run db:push
```

### 3. Criar uma Branch
```bash
git checkout -b feature/nova-funcionalidade
```

### 4. Fazer suas Alterações
- Mantenha o código limpo e bem documentado
- Siga os padrões de código existentes
- Adicione testes quando apropriado

### 5. Commit e Push
```bash
git add .
git commit -m "feat: adicionar nova funcionalidade"
git push origin feature/nova-funcionalidade
```

### 6. Criar Pull Request
- Descreva claramente as mudanças
- Inclua screenshots se relevante
- Referencie issues relacionadas

## Padrões de Código

### TypeScript
- Use types explícitos quando necessário
- Evite `any` sempre que possível
- Mantenha interfaces e tipos no arquivo `shared/schema.ts`

### React
- Use hooks funcionais
- Implemente error boundaries quando apropriado
- Mantenha componentes pequenos e reutilizáveis

### Styling
- Use Tailwind CSS para estilização
- Mantenha consistência com o sistema de design
- Use componentes shadcn/ui quando possível

### Commits
Siga o padrão Conventional Commits:
- `feat:` para novas funcionalidades
- `fix:` para correções de bugs
- `docs:` para documentação
- `style:` para formatação
- `refactor:` para refatoração
- `test:` para testes

## Estrutura de Branches

- `main` - Branch principal (produção)
- `develop` - Branch de desenvolvimento
- `feature/*` - Novas funcionalidades
- `fix/*` - Correções de bugs
- `hotfix/*` - Correções urgentes

## Processo de Review

1. Todos os PRs precisam de pelo menos 1 aprovação
2. Testes automatizados devem passar
3. Código deve estar formatado corretamente
4. Documentação deve ser atualizada se necessário

## Reportar Bugs

Use o template de issue para reportar bugs:
- Descreva o comportamento esperado
- Descreva o comportamento atual
- Passos para reproduzir
- Screenshots se aplicável
- Informações do ambiente

## Sugerir Funcionalidades

Use o template de feature request:
- Descreva a funcionalidade
- Explique o problema que resolve
- Considere implementações alternativas
- Adicione contexto adicional

## Dúvidas?

Abra uma issue com a tag `question` ou entre em contato através dos canais oficiais do projeto.