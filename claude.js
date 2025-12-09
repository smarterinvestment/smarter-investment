// ========================================
// 🤖 API/CLAUDE.JS - Serverless Function para Claude API
// ========================================
// Vercel Serverless Function para conectar con Claude API de Anthropic

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Solo POST permitido
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { message, userData, apiKey } = req.body;
        
        // Validar API Key
        const claudeApiKey = apiKey || process.env.CLAUDE_API_KEY;
        
        if (!claudeApiKey) {
            return res.status(400).json({ 
                error: 'API Key no configurada',
                message: 'Configura tu API Key de Claude en Configuración'
            });
        }
        
        // Construir prompt con contexto financiero
        const systemPrompt = buildSystemPrompt(userData);
        
        // Llamar a Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': claudeApiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307', // Modelo rápido y económico
                max_tokens: 1024,
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ]
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Claude API Error:', errorData);
            
            if (response.status === 401) {
                return res.status(401).json({ 
                    error: 'API Key inválida',
                    message: 'Verifica tu API Key de Claude'
                });
            }
            
            if (response.status === 429) {
                return res.status(429).json({ 
                    error: 'Límite de uso excedido',
                    message: 'Has excedido el límite de la API. Intenta más tarde.'
                });
            }
            
            return res.status(response.status).json({ 
                error: 'Error de API',
                message: errorData.error?.message || 'Error al conectar con Claude'
            });
        }
        
        const data = await response.json();
        const assistantMessage = data.content?.[0]?.text || 'No pude generar una respuesta.';
        
        return res.status(200).json({
            success: true,
            message: assistantMessage,
            usage: {
                input_tokens: data.usage?.input_tokens || 0,
                output_tokens: data.usage?.output_tokens || 0
            }
        });
        
    } catch (error) {
        console.error('Error en Claude API:', error);
        return res.status(500).json({ 
            error: 'Error interno',
            message: 'Error procesando tu solicitud'
        });
    }
}

// Construir system prompt con datos financieros
function buildSystemPrompt(userData) {
    const { expenses, incomes, budgets, goals, totalIncome, totalExpenses, recurringExpenses } = userData || {};
    
    let dataContext = '';
    
    if (totalIncome !== undefined || totalExpenses !== undefined) {
        dataContext = `
DATOS FINANCIEROS DEL USUARIO:
- Ingresos totales (mes): $${totalIncome?.toFixed(2) || '0.00'}
- Gastos totales (mes): $${totalExpenses?.toFixed(2) || '0.00'}
- Balance: $${((totalIncome || 0) - (totalExpenses || 0)).toFixed(2)}
- Tasa de ahorro: ${totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : 0}%
`;
        
        if (budgets && Object.keys(budgets).length > 0) {
            dataContext += '\nPRESUPUESTOS:\n';
            Object.entries(budgets).forEach(([cat, amount]) => {
                const spent = expenses?.filter(e => e.category === cat)
                    .reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
                const percent = amount > 0 ? ((spent / amount) * 100).toFixed(0) : 0;
                dataContext += `- ${cat}: $${spent.toFixed(0)} / $${amount.toFixed(0)} (${percent}%)\n`;
            });
        }
        
        if (goals && goals.length > 0) {
            dataContext += '\nMETAS:\n';
            goals.forEach(g => {
                const progress = g.target > 0 ? ((g.current / g.target) * 100).toFixed(0) : 0;
                dataContext += `- ${g.name}: $${g.current?.toFixed(0) || 0} / $${g.target?.toFixed(0) || 0} (${progress}%)\n`;
            });
        }
        
        if (recurringExpenses && recurringExpenses.length > 0) {
            const monthlyRecurring = recurringExpenses.reduce((sum, r) => {
                if (r.frequency === 'weekly') return sum + (r.amount * 4);
                if (r.frequency === 'biweekly') return sum + (r.amount * 2);
                if (r.frequency === 'yearly') return sum + (r.amount / 12);
                return sum + r.amount;
            }, 0);
            dataContext += `\nGASTOS RECURRENTES MENSUALES: $${monthlyRecurring.toFixed(2)}\n`;
        }
        
        if (expenses && expenses.length > 0) {
            // Top 5 gastos recientes
            const recentExpenses = expenses.slice(0, 5);
            dataContext += '\nÚLTIMOS GASTOS:\n';
            recentExpenses.forEach(e => {
                dataContext += `- ${e.description}: $${e.amount?.toFixed(2)} (${e.category})\n`;
            });
        }
    }
    
    return `Eres un asistente financiero personal experto llamado "Smarter AI". Tu objetivo es ayudar al usuario a mejorar su situación financiera.

REGLAS:
1. Responde SIEMPRE en español (a menos que te pregunten en otro idioma)
2. Sé conciso pero útil - respuestas de 2-4 párrafos máximo
3. Usa emojis para hacer la respuesta más visual
4. Da consejos ESPECÍFICOS basados en los datos del usuario
5. Si no tienes datos suficientes, pide más información
6. Nunca inventes datos - usa solo lo que se proporciona
7. Sé empático y motivador, pero realista
8. Si el usuario pregunta algo fuera de finanzas, redirige amablemente al tema

FORMATO DE RESPUESTA:
- Usa **negrita** para puntos importantes
- Usa listas cuando sea apropiado
- Incluye un consejo accionable al final

${dataContext}

Recuerda: Tu misión es ser el mejor asesor financiero personal del usuario.`;
}
