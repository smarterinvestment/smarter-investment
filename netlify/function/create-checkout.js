/**
 * 🔐 NETLIFY FUNCTION: Stripe Checkout
 * ====================================
 * Crear sesiones de checkout seguras para suscripciones
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Planes de suscripción
const SUBSCRIPTION_PLANS = {
    pro: {
        name: 'Pro',
        priceId: process.env.STRIPE_PRICE_ID_PRO,
        features: [
            'Hasta 500 gastos por mes',
            '100 consultas AI por mes',
            'Reportes básicos',
            'Notificaciones inteligentes',
            'Soporte por email'
        ]
    },
    premium: {
        name: 'Premium',
        priceId: process.env.STRIPE_PRICE_ID_PREMIUM,
        features: [
            'Gastos ilimitados',
            'Consultas AI ilimitadas',
            'Reportes avanzados',
            'Exportación de datos',
            'Soporte prioritario 24/7',
            'Asesoría financiera personalizada'
        ]
    }
};

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Método no permitido' })
        };
    }
    
    try {
        const { plan, userId, userEmail, successUrl, cancelUrl } = JSON.parse(event.body);
        
        // Validaciones
        if (!plan || !SUBSCRIPTION_PLANS[plan]) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Plan inválido' })
            };
        }
        
        if (!userId || !userEmail) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Usuario no autenticado' })
            };
        }
        
        // Crear o recuperar customer de Stripe
        let customer;
        const customers = await stripe.customers.list({
            email: userEmail,
            limit: 1
        });
        
        if (customers.data.length > 0) {
            customer = customers.data[0];
        } else {
            customer = await stripe.customers.create({
                email: userEmail,
                metadata: {
                    userId: userId,
                    app: 'smarter-investment'
                }
            });
        }
        
        // Crear sesión de checkout
        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{
                price: SUBSCRIPTION_PLANS[plan].priceId,
                quantity: 1,
            }],
            success_url: successUrl || `${process.env.URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || `${process.env.URL}/pricing`,
            metadata: {
                userId: userId,
                plan: plan
            },
            subscription_data: {
                metadata: {
                    userId: userId,
                    plan: plan
                }
            },
            allow_promotion_codes: true,
            billing_address_collection: 'required'
        });
        
        console.log(`✅ Checkout session creada para usuario ${userId} - Plan: ${plan}`);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                sessionId: session.id,
                url: session.url
            })
        };
        
    } catch (error) {
        console.error('❌ Error creando checkout:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Error al crear sesión de pago',
                message: process.env.NODE_ENV === 'development' ? error.message : undefined
            })
        };
    }
};
