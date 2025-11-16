/**
 * 🤖 VERCEL FUNCTION - Claude API Proxy
 * =====================================
 * Función serverless para comunicarse con Claude API
 * Sin problemas de CORS ✅
 * 
 * PARTE 1 DE 3
 * 
 * Ruta: /api/claude
 * Método: POST
 */

export default async function handler(req, res) {
    // ✅ Configurar CORS para permitir requests desde tu dominio
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejar preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Solo aceptar POST
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Método no permitido. Usa POST.' 
        });
    }

    try {
        const { message, expenses, income, budgets, goals } = req.body;

        if (!message) {
            return res.status(400).json({ 
                error: 'Mensaje requerido' 
            });
        }

        // 🔐 IMPORTANTE: Toma la API key de las variables de entorno
        const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

        if (!ANTHROPIC_API_KEY) {
            console.error('❌ API Key de Anthropic no configurada');
            return res.status(500).json({ 
                error: 'API Key no configurada en Vercel' 
            });
        }

        // 📊 Construir contexto financiero para Claude
        const financialContext = buildFinancialContext(expenses, income, budgets, goals);

        // ============================================
        // CONTINÚA EN LA PARTE 2...
        // ============================================
        // ============================================
        // PARTE 2 DE 3 - CONTINUACIÓN
        // ============================================

        // 🤖 Llamar a Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 2000,
                system: `Eres un asesor financiero experto en finanzas personales, inversiones y trading. 

Tu especialidad:
- Análisis de gastos e ingresos personales
- Optimización de presupuestos
- Estrategias de ahorro e inversión
- Trading para principiantes e intermedios
- Educación financiera práctica

Contexto financiero del usuario:
${financialContext}

Instrucciones:
1. Analiza los datos financieros proporcionados
2. Proporciona consejos personalizados y accionables
3. Sé específico con números y porcentajes
4. Incluye ejemplos prácticos
5. Para trading: explica estrategias seguras para principiantes
6. Usa emojis para hacer las respuestas más amigables
7. Responde en español de manera profesional pero cercana`,
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Error de Claude API:', errorData);
            return res.status(response.status).json({ 
                error: 'Error al comunicarse con Claude',
                details: errorData 
            });
        }

        const data = await response.json();
        
        // Extraer el texto de la respuesta de Claude
        const assistantMessage = data.content[0].text;

        return res.status(200).json({
            success: true,
            message: assistantMessage,
            usage: data.usage
        });

    } catch (error) {
        console.error('❌ Error en función de Vercel:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
}

// ============================================
// CONTINÚA EN LA PARTE 3...
// ============================================
// ============================================
// PARTE 3 DE 3 - FINAL
// ============================================

/**
 * 📊 Construir contexto financiero para Claude
 */
function buildFinancialContext(expenses = [], income = [], budgets = [], goals = []) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calcular totales del mes actual
    const monthlyExpenses = expenses.filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const monthlyIncome = income.filter(i => {
        const date = new Date(i.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalIncome = monthlyIncome.reduce((sum, i) => sum + (i.amount || 0), 0);
    const balance = totalIncome - totalExpenses;

    // Gastos por categoría
    const expensesByCategory = {};
    monthlyExpenses.forEach(e => {
        const cat = e.category || 'Sin categoría';
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + e.amount;
    });

    // Presupuestos
    const budgetStatus = budgets.map(b => {
        const spent = expensesByCategory[b.category] || 0;
/**
 * 🤖 VERCEL FUNCTION - Claude API Proxy
 * =====================================
 * Función serverless para comunicarse con Claude API
 * Sin problemas de CORS ✅
 * 
 * PARTE 1 DE 3
 * 
 * Ruta: /api/claude
 * Método: POST
 */

export default async function handler(req, res) {
    // ✅ Configurar CORS para permitir requests desde tu dominio
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejar preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Solo aceptar POST
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Método no permitido. Usa POST.' 
        });
    }

    try {
        const { message, expenses, income, budgets, goals } = req.body;

        if (!message) {
            return res.status(400).json({ 
                error: 'Mensaje requerido' 
            });
        }

        // 🔐 IMPORTANTE: Toma la API key de las variables de entorno
        const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

        if (!ANTHROPIC_API_KEY) {
            console.error('❌ API Key de Anthropic no configurada');
            return res.status(500).json({ 
                error: 'API Key no configurada en Vercel' 
            });
        }

        // 📊 Construir contexto financiero para Claude
        const financialContext = buildFinancialContext(expenses, income, budgets, goals);

        // ============================================
        // CONTINÚA EN LA PARTE 2...
        // ============================================
        // ============================================
        // PARTE 2 DE 3 - CONTINUACIÓN
        // ============================================

        // 🤖 Llamar a Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 2000,
                system: `Eres un asesor financiero experto en finanzas personales, inversiones y trading. 

Tu especialidad:
- Análisis de gastos e ingresos personales
- Optimización de presupuestos
- Estrategias de ahorro e inversión
- Trading para principiantes e intermedios
- Educación financiera práctica

Contexto financiero del usuario:
${financialContext}

Instrucciones:
1. Analiza los datos financieros proporcionados
2. Proporciona consejos personalizados y accionables
3. Sé específico con números y porcentajes
4. Incluye ejemplos prácticos
5. Para trading: explica estrategias seguras para principiantes
6. Usa emojis para hacer las respuestas más amigables
7. Responde en español de manera profesional pero cercana`,
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ]
            })

        if (!response.ok) {
            const errorData = await response.json();
                details: errorData 
            });
        }

        const data = await response.json();
        
        // Extraer el texto de la respuesta de Claude
        const assistantMessage = data.content[0].text;

        return res.status(200).json({
            success: true,
            message: assistantMessage,
            usage: data.usage
        });

    } catch (error) {
        console.error('❌ Error en función de Vercel:', error);
        return res.status(500).json({ 
    }
}

// ============================================
// CONTINÚA EN LA PARTE 3...
// ============================================
// ============================================
// PARTE 3 DE 3 - FINAL
// ============================================

/**
 * 📊 Construir contexto financiero para Claude
 */
function buildFinancialContext(expenses = [], income = [], budgets = [], goals = []) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calcular totales del mes actual
    const monthlyExpenses = expenses.filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const monthlyIncome = income.filter(i => {
        const date = new Date(i.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });


    // Gastos por categoría
    const expensesByCategory = {};
    monthlyExpenses.forEach(e => {
        const cat = e.category || 'Sin categoría';
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + e.amount;
    });

    // Presupuestos
    const budgetStatus = budgets.map(b => {
        const spent = expensesByCategory[b.category] || 0;
        const remaining = b.amount - spent;
        const percentage = b.amount > 0 ? ((spent / b.amount) * 100).toFixed(1) : 0;
        return {
            category: b.category,
            budget: b.amount,
            spent: spent,
            remaining: remaining,
            percentage: percentage
        };
    });

    // Metas
    const goalsStatus = goals.map(g => {
        const progress = g.current || 0;
        const target = g.target || 0;
        const percentage = target > 0 ? ((progress / target) * 100).toFixed(1) : 0;
        return {
            name: g.name,
            target: target,
            current: progress,
            remaining: target - progress,
            percentage: percentage
        };
    });

    return `
📊 DATOS FINANCIEROS DEL USUARIO:

💰 Balance del mes:
- Ingresos totales: $${totalIncome.toFixed(2)}
- Gastos totales: $${totalExpenses.toFixed(2)}
- Balance neto: $${balance.toFixed(2)}

📈 Gastos por categoría:
${Object.entries(expensesByCategory)
    .map(([cat, amount]) => `- ${cat}: $${amount.toFixed(2)}`)
    .join('\n') || 'Sin gastos registrados'}

🎯 Estado de presupuestos:
${budgetStatus.length > 0 
    ? budgetStatus.map(b => 
        `- ${b.category}: $${b.spent.toFixed(2)} / $${b.budget.toFixed(2)} (${b.percentage}% usado)`
    ).join('\n')
    : 'Sin presupuestos configurados'}

🌟 Estado de metas:
${goalsStatus.length > 0
    ? goalsStatus.map(g =>
        `- ${g.name}: $${g.current.toFixed(2)} / $${g.target.toFixed(2)} (${g.percentage}% alcanzado)`
    ).join('\n')
    : 'Sin metas configuradas'}
`;
}

// ============================================
// FIN DEL ARCHIVO - Este es el archivo COMPLETO
// ============================================




    const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalIncome = monthlyIncome.reduce((sum, i) => sum + (i.amount || 0), 0);
    const balance = totalIncome - totalExpenses;
            error: 'Error interno del servidor',
            details: error.message 
        });
            console.error('❌ Error de Claude API:', errorData);
            return res.status(response.status).json({ 
                error: 'Error al comunicarse con Claude',

