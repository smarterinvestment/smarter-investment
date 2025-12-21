// ============================================
// 🤖 CLAUDE API - VERCEL EDGE FUNCTION
// Proxy seguro para llamar a Anthropic API
// ============================================

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get API key from environment variable (try both names)
  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || process.env.VITE_CLAUDE_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
  
  if (!CLAUDE_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured', fallback: true }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { messages, financialContext, userMessage } = body;

    // Build the system prompt
    const systemPrompt = `Eres un asesor financiero personal experto y amigable llamado "Smarter Assistant". 
Tu trabajo es ayudar a los usuarios a mejorar sus finanzas personales.

CONTEXTO FINANCIERO DEL USUARIO:
${financialContext}

INSTRUCCIONES:
1. Analiza los datos financieros del usuario y da consejos personalizados
2. Sé específico con los números y porcentajes
3. Usa emojis para hacer las respuestas más amigables
4. Da consejos prácticos y accionables
5. Si detectas problemas (gastos excesivos, poco ahorro), menciónalos con tacto
6. Responde siempre en español
7. Mantén las respuestas concisas pero útiles (máximo 400 palabras)
8. Usa formato con ## para títulos y ** para negritas

REGLAS:
- Nunca des consejos de inversión específicos (acciones particulares)
- Siempre recomienda consultar profesionales para decisiones importantes
- Sé empático y positivo`;

    // Build messages array
    const apiMessages = [
      ...(messages || []).slice(-6).map((m: any) => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user', content: userMessage }
    ];

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: apiMessages
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Claude API error:', error);
      return new Response(JSON.stringify({ 
        error: error.error?.message || 'API error',
        fallback: true 
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      content: data.content[0].text,
      model: data.model,
      usage: data.usage
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
    });

  } catch (error: any) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      fallback: true 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
