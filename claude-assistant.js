/**
 * 🔐 NETLIFY FUNCTION: Claude AI Assistant
 * =========================================
 * Proxy seguro para la API de Claude Anthropic
 * - API key protegida en variables de entorno
 * - Rate limiting por usuario
 * - Validación de inputs
 * - Manejo de errores robusto
 * - Logs de uso
 */

const fetch = require('node-fetch');

// ✅ Rate limiting simple en memoria (para producción usar Redis)
const rateLimits = new Map();
const MAX_REQUESTS_PER_HOUR = 50;
const MAX_REQUESTS_PER_DAY = 200;

/**
 * Verificar rate limit para un usuario
 */
function checkRateLimit(userId, subscriptionPlan = 'free') {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    const dayAgo = now - (24 * 60 * 60 * 1000);
    
    if (!rateLimits.has(userId)) {
        rateLimits.set(userId, []);
    }
    
    const userRequests = rateLimits.get(userId);
    
    // Limpiar requests antiguos
    const recentRequests = userRequests.filter(timestamp => timestamp > dayAgo);
    rateLimits.set(userId, recentRequests);
    
    // Contar requests por período
    const requestsLastHour = recentRequests.filter(t => t > hourAgo).length;
    const requestsLastDay = recentRequests.length;
    
    // Límites según plan
    const limits = {
        free: { hour: 10, day: 50 },
        pro: { hour: 50, day: 200 },
        premium: { hour: 200, day: 1000 }
    };
    
    const planLimits = limits[subscriptionPlan] || limits.free;
    
    if (requestsLastHour >= planLimits.hour) {
        return {
            allowed: false,
            error: 'Rate limit excedido. Máximo por hora alcanzado.',
            retryAfter: 3600
        };
    }
    
    if (requestsLastDay >= planLimits.day) {
        return {
            allowed: false,
            error: 'Rate limit excedido. Máximo diario alcanzado.',
            retryAfter: 86400
        };
    }
    
    // Agregar este request
    recentRequests.push(now);
    
    return {
        allowed: true,
        remaining: {
            hour: planLimits.hour - requestsLastHour - 1,
            day: planLimits.day - requestsLastDay - 1
        }
    };
}

/**
 * Validar input del usuario
 */
function validateInput(data) {
    const errors = [];
    
    if (!data.prompt || typeof data.prompt !== 'string') {
        errors.push('El prompt es requerido y debe ser un string');
    }
    
    if (data.prompt && data.prompt.length > 4000) {
        errors.push('El prompt no puede exceder 4000 caracteres');
    }
    
    if (data.prompt && data.prompt.length < 3) {
        errors.push('El prompt debe tener al menos 3 caracteres');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Handler principal
 */
exports.handler = async (event, context) => {
    // ✅ CORS Headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };
    
    // Manejar preflight request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    
    // Solo permitir POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Método no permitido' })
        };
    }
    
    try {
        // ✅ Parsear body
        let requestData;
        try {
            requestData = JSON.parse(event.body);
        } catch (e) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'JSON inválido' })
            };
        }
        
        const { prompt, userId, subscriptionPlan = 'free', conversationHistory = [] } = requestData;
        
        // ✅ Validar userId
        if (!userId) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Usuario no autenticado' })
            };
        }
        
        // ✅ Verificar rate limit
        const rateLimitCheck = checkRateLimit(userId, subscriptionPlan);
        if (!rateLimitCheck.allowed) {
            return {
                statusCode: 429,
                headers: {
                    ...headers,
                    'Retry-After': rateLimitCheck.retryAfter.toString()
                },
                body: JSON.stringify({
                    error: rateLimitCheck.error,
                    retryAfter: rateLimitCheck.retryAfter
                })
            };
        }
        
        // ✅ Validar input
        const validation = validateInput({ prompt });
        if (!validation.valid) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Datos inválidos',
                    details: validation.errors
                })
            };
        }
        
        // ✅ Obtener API key de variables de entorno
        const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
        
        if (!CLAUDE_API_KEY) {
            console.error('❌ CLAUDE_API_KEY no configurada');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Configuración del servidor incorrecta' })
            };
        }
        
        // ✅ Construir mensajes para Claude
        const messages = [
            ...conversationHistory,
            { role: 'user', content: prompt }
        ];
        
        // ✅ Llamar a Claude API
        console.log(`🤖 Llamando a Claude API para usuario: ${userId}`);
        
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1500,
                temperature: 0.7,
                messages: messages,
                system: `Eres un asistente financiero experto que ayuda a usuarios de Smarter Investment.
                
Tus capacidades:
- Analizar gastos e ingresos
- Sugerir estrategias de ahorro
- Responder preguntas sobre finanzas personales
- Proporcionar consejos presupuestarios
- Ayudar con planificación financiera

Importante:
- Sé conciso y claro
- Usa ejemplos cuando sea necesario
- No des consejos de inversión específicos
- Si no estás seguro, admítelo
- Siempre piensa en el bienestar financiero del usuario`
            })
        });
        
        if (!claudeResponse.ok) {
            const errorText = await claudeResponse.text();
            console.error('❌ Error de Claude API:', errorText);
            
            return {
                statusCode: claudeResponse.status,
                headers,
                body: JSON.stringify({ 
                    error: 'Error al procesar la solicitud',
                    details: claudeResponse.status === 429 ? 'Demasiadas solicitudes' : 'Error del servicio'
                })
            };
        }
        
        const claudeData = await claudeResponse.json();
        
        // ✅ Log de uso (para analytics)
        console.log(`✅ Respuesta generada para usuario ${userId} - Tokens: ${claudeData.usage?.total_tokens || 'N/A'}`);
        
        // ✅ Retornar respuesta
        return {
            statusCode: 200,
            headers: {
                ...headers,
                'X-RateLimit-Remaining-Hour': rateLimitCheck.remaining.hour.toString(),
                'X-RateLimit-Remaining-Day': rateLimitCheck.remaining.day.toString()
            },
            body: JSON.stringify({
                response: claudeData.content[0].text,
                usage: claudeData.usage,
                rateLimitRemaining: rateLimitCheck.remaining
            })
        };
        
    } catch (error) {
        console.error('❌ Error en función:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Error interno del servidor',
                message: process.env.NODE_ENV === 'development' ? error.message : undefined
            })
        };
    }
};
