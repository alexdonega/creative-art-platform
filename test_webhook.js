const fetch = require('fetch');

async function testWebhook() {
  const response = await fetch('http://localhost:5173/api/ai-content/webhook/15', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      output: {
        headline: "🎉 Notificação Automática Testada!",
        conteudo: "Este teste confirma que o sistema de notificação automática está funcionando. O resultado aparece automaticamente na interface com toast de sucesso e scroll para a seção de resultados.",
        cta: "Sistema funcionando perfeitamente! ✅"
      }
    })
  });

  const result = await response.text();
  console.log('Response:', result);
}

testWebhook().catch(console.error);