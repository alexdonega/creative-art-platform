#!/bin/bash

# Test the webhook with the new calendar format
curl -X POST "http://localhost:5173/api/ai-content/webhook/16" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "response": {
        "body": {
          "calendario_sazonal": [
            {
              "headline": "Janeiro - Teste de Notificação Automática 🎉",
              "conteudo": "Este é um teste para verificar se o sistema de notificação automática está funcionando corretamente com o novo formato de webhook. O resultado deve aparecer automaticamente na interface.",
              "cta": "Sistema funcionando perfeitamente! ✅"
            },
            {
              "headline": "Fevereiro - Segundo Teste",
              "conteudo": "Este é outro item do calendário para testar se múltiplos itens são exibidos corretamente.",
              "cta": "Confira as funcionalidades!"
            }
          ]
        },
        "headers": {},
        "statusCode": 200
      }
    }
  ]'