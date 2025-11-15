const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { message, context: userContext } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    // Inicializar cliente de Anthropic
    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });

    // Crear el prompt del sistema
    const systemPrompt = `Eres un asistente financiero personal experto. Ayudas a usuarios a:
- Analizar sus gastos e ingresos
- Crear presupuestos inteligentes
- Establecer metas financieras
- Dar consejos de ahorro e inversión
- Identificar patrones de gasto
- Sugerir optimizaciones financieras

Contexto del usuario:
${JSON.stringify(userContext, null, 2)}

Proporciona respuestas claras, accionables y personalizadas. Usa un tono amigable pero profesional.`;

    // Llamar a Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: response.content[0].text,
        usage: response.usage,
      }),
    };
  } catch (error) {
    console.error('Error in Claude assistant:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error procesando tu solicitud',
        details: error.message,
      }),
    };
  }
};
