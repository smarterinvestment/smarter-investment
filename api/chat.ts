// ============================================
// 🤖 CLAUDE API - VERCEL EDGE FUNCTION
// Proxy seguro para llamar a Anthropic API
// ============================================

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get API key from environment variable (try multiple names)
  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || 
                         process.env.ANTHROPIC_API_KEY ||
                         process.env.VITE_CLAUDE_API_KEY || 
                         process.env.VITE_ANTHROPIC_API_KEY;
  
  // Debug: Log available environment variables (without values)
  console.log('[Claude API] Checking API key...');
  console.log('[Claude API] CLAUDE_API_KEY exists:', !!process.env.CLAUDE_API_KEY);
  console.log('[Claude API] ANTHROPIC_API_KEY exists:', !!process.env.ANTHROPIC_API_KEY);
  
  if (!CLAUDE_API_KEY) {
    console.error('[Claude API] No API key found');
    return new Response(JSON.stringify({ 
      error: 'API key not configured', 
      fallback: true,
      debug: 'No API key found in environment variables'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verify API key format (should start with sk-ant-)
  if (!CLAUDE_API_KEY.startsWith('sk-ant-')) {
    console.error('[Claude API] Invalid API key format');
    return new Response(JSON.stringify({ 
      error: 'Invalid API key format', 
      fallback: true,
      debug: 'API key should start with sk-ant-'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { messages, financialContext, userMessage } = body;

    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'No message provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build the system prompt
    const systemPrompt = `Eres un asesor financiero personal experto y amigable llamado "Smarter Assistant". 
Tu trabajo es ayudar a los usuarios a mejorar sus finanzas personales.

CONTEXTO FINANCIERO DEL USUARIO:
${JSON.stringify(financialContext, null, 2)}

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

    console.log('[Claude API] Calling Anthropic API...');

    // Call Claude API with claude-3-5-sonnet (latest stable)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: apiMessages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Claude API] API error:', response.status, errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      return new Response(JSON.stringify({ 
        error: errorData.error?.message || 'API error',
        status: response.status,
        fallback: true,
        debug: `API returned ${response.status}`
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('[Claude API] Success! Model:', data.model);
    
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
    console.error('[Claude API] Edge function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      fallback: true,
      debug: error.toString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
