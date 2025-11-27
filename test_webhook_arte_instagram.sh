#!/bin/bash

# Test webhook with arteInstagram format
curl -X POST "https://d181ef92-efec-4dc0-85ff-a5ed56c74996-00-3guboz9f9iuu.kirk.replit.dev/api/ai-content/webhook/18" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "response": {
        "body": {
          "arteInstagram": {
            "headline": "Destaque Seu Restaurante com Marketing Gastronômico!",
            "conteudo": "Sabia que atrair clientes para seu restaurante vai além do sabor? Invista em fotos irresistíveis e descrições envolventes para seu cardápio. Conte histórias por trás dos seus pratos e conquiste corações (e paladares)! Visite Hode na Rua Ângelo Donin, 844 para mais dicas e inspirações.",
            "chamadaParaAcao": "Siga-nos para mais dicas exclusivas de marketing gastronômico!",
            "designSugestao": {
              "corFundo": "#F5F5DC",
              "imagem": "Foto de um prato gourmet atraente, de alta qualidade",
              "tipografia": {
                "headline": {
                  "fonte": "Montserrat Bold",
                  "tamanho": "36px",
                  "cor": "#D2691E"
                },
                "conteudo": {
                  "fonte": "Open Sans Regular",
                  "tamanho": "18px",
                  "cor": "#4B4B4B"
                },
                "cta": {
                  "fonte": "Montserrat SemiBold",
                  "tamanho": "20px",
                  "cor": "#D2691E"
                }
              },
              "elementosVisuais": [
                "Ícones sutis de utensílios de cozinha no canto inferior",
                "Borda delicada em tom marrom claro"
              ]
            }
          }
        },
        "headers": {},
        "statusCode": 200
      }
    }
  ]'