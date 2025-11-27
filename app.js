// ========================================
// VERCEL SERVERLESS FUNCTION - CLAUDE API PROXY
// ========================================
// Resuelve problemas de CORS para Claude API

export default async function handler(req, res) {
    // ========================================
    // CONFIGURACIÓN CORS
    // ========================================
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400', // 24 horas
        'Content-Type': 'application/json'
    };

    // Aplicar headers CORS a todas las respuestas
    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });

    // ========================================
    // MANEJAR OPTIONS (PREFLIGHT)
    // ========================================
    if (req.method === 'OPTIONS') {
        console.log('🔄 Preflight request recibido');
        return res.status(200).json({ message: 'CORS preflight OK' });
    }

    // ========================================
    // VALIDAR MÉTODO
    // ========================================
    if (req.method !== 'POST') {
        console.log(`❌ Método no permitido: ${req.method}`);
        return res.status(405).json({ 
            error: 'Método no permitido', 
            allowedMethods: ['POST', 'OPTIONS'] 
        });
    }

    try {
        // ========================================
        // EXTRAER DATOS DEL REQUEST
        // ========================================
        const { messages, apiKey, model, maxTokens = 1000 } = req.body;

        // Validaciones
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ 
                error: 'El campo "messages" es requerido y debe ser un array' 
            });
        }

        if (!apiKey) {
            return res.status(400).json({ 
                error: 'API Key de Anthropic es requerida' 
            });
        }

        console.log('📤 Enviando request a Claude API...');
        console.log('📊 Mensajes:', messages.length);
        console.log('🤖 Modelo:', model || 'claude-3-5-sonnet-20241022');

        // ========================================
        // LLAMAR A CLAUDE API
        // ========================================
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true' // Header para CORS
            },
            body: JSON.stringify({
                model: model || 'claude-3-5-sonnet-20241022',
                max_tokens: Math.min(maxTokens, 4096), // Limitar tokens
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))
            })
        });

        // ========================================
        // PROCESAR RESPUESTA
        // ========================================
        const data = await claudeResponse.json();

        if (!claudeResponse.ok) {
            console.error('❌ Error de Claude API:', data);
            
            // Manejar errores específicos de Anthropic
            if (data.error?.type === 'authentication_error') {
                return res.status(401).json({
                    error: 'API Key inválida',
                    details: 'Verifica tu API Key de Anthropic'
                });
            }
            
            if (data.error?.type === 'rate_limit_error') {
                return res.status(429).json({
                    error: 'Límite de rate alcanzado',
                    details: 'Espera unos minutos antes de hacer otra consulta'
                });
            }

            throw new Error(data.error?.message || `HTTP ${claudeResponse.status}`);
        }

        console.log('✅ Respuesta exitosa de Claude API');
        
        // ========================================
        // ENVIAR RESPUESTA EXITOSA
        // ========================================
        return res.status(200).json({
            success: true,
            data: {
                id: data.id,
                content: data.content,
                model: data.model,
                usage: data.usage,
                role: data.role
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('💥 Error en proxy de Claude:', error);
        
        // ========================================
        // MANEJAR ERRORES
        // ========================================
        let errorMessage = 'Error interno del servidor';
        let statusCode = 500;
        
        if (error.message.includes('fetch')) {
            errorMessage = 'Error de conectividad con Claude API';
            statusCode = 503;
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Timeout al conectar con Claude API';
            statusCode = 504;
        } else if (error.message.includes('API')) {
            errorMessage = error.message;
            statusCode = 400;
        }

        return res.status(statusCode).json({
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            timestamp: new Date().toISOString()
        });
    }
}

// ========================================
// CONFIGURACIÓN DE VERCEL
// ========================================
export const config = {
    runtime: 'nodejs18.x',
    maxDuration: 30,
    regions: ['iad1'], // US East para mejor latencia
    memory: 256
};
