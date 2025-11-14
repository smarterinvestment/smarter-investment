/**
 * 🔐 NETLIFY FUNCTION: Stripe Webhook
 * ===================================
 * Manejar eventos de Stripe de forma segura
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Inicializar Firebase Admin (solo una vez)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
    });
}

const db = admin.firestore();

/**
 * Actualizar suscripción del usuario en Firestore
 */
async function updateUserSubscription(userId, subscriptionData) {
    try {
        await db.collection('users').doc(userId).update({
            subscription: {
                ...subscriptionData,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }
        });
        
        console.log(`✅ Suscripción actualizada para usuario: ${userId}`);
        return true;
    } catch (error) {
        console.error(`❌ Error actualizando suscripción:`, error);
        throw error;
    }
}

/**
 * Manejar evento de checkout completado
 */
async function handleCheckoutCompleted(session) {
    const { userId, plan } = session.metadata;
    
    await updateUserSubscription(userId, {
        status: 'active',
        plan: plan,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        currentPeriodStart: new Date(session.subscription_details?.current_period_start * 1000 || Date.now()),
        currentPeriodEnd: new Date(session.subscription_details?.current_period_end * 1000 || Date.now()),
        cancelAtPeriodEnd: false
    });
    
    // TODO: Enviar email de bienvenida
    console.log(`✅ Checkout completado para usuario: ${userId}`);
}

/**
 * Manejar actualización de suscripción
 */
async function handleSubscriptionUpdated(subscription) {
    const userId = subscription.metadata?.userId;
    
    if (!userId) {
        console.warn('⚠️ No se encontró userId en metadata de suscripción');
        return;
    }
    
    const status = subscription.status;
    const plan = subscription.metadata?.plan;
    
    await updateUserSubscription(userId, {
        status: status,
        plan: plan,
        stripeCustomerId: subscription.customer,
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
    });
    
    // Si la suscripción fue cancelada
    if (status === 'canceled' || subscription.cancel_at_period_end) {
        console.log(`⚠️ Suscripción cancelada para usuario: ${userId}`);
        // TODO: Enviar email de cancelación
    }
}

/**
 * Manejar fallo de pago
 */
async function handlePaymentFailed(invoice) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const userId = subscription.metadata?.userId;
    
    if (!userId) return;
    
    await updateUserSubscription(userId, {
        status: 'payment_failed',
        lastPaymentError: {
            message: 'Fallo en el pago',
            date: new Date()
        }
    });
    
    console.log(`❌ Fallo de pago para usuario: ${userId}`);
    // TODO: Enviar email de fallo de pago
}

/**
 * Manejar pago exitoso
 */
async function handlePaymentSucceeded(invoice) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const userId = subscription.metadata?.userId;
    
    if (!userId) return;
    
    await updateUserSubscription(userId, {
        status: 'active',
        lastPaymentSuccess: new Date(),
        lastPaymentAmount: invoice.amount_paid / 100, // Convertir de centavos
        lastPaymentError: null
    });
    
    console.log(`✅ Pago exitoso para usuario: ${userId}`);
    // TODO: Enviar recibo por email
}

/**
 * Handler principal del webhook
 */
exports.handler = async (event, context) => {
    // Solo permitir POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Método no permitido' })
        };
    }
    
    const sig = event.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let stripeEvent;
    
    try {
        // Verificar la firma del webhook
        stripeEvent = stripe.webhooks.constructEvent(
            event.body,
            sig,
            webhookSecret
        );
    } catch (err) {
        console.error('❌ Error verificando webhook:', err.message);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: `Webhook Error: ${err.message}` })
        };
    }
    
    console.log(`📨 Webhook recibido: ${stripeEvent.type}`);
    
    try {
        // Manejar diferentes tipos de eventos
        switch (stripeEvent.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(stripeEvent.data.object);
                break;
                
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(stripeEvent.data.object);
                break;
                
            case 'customer.subscription.deleted':
                const deletedSub = stripeEvent.data.object;
                await updateUserSubscription(deletedSub.metadata?.userId, {
                    status: 'canceled',
                    canceledAt: new Date()
                });
                break;
                
            case 'invoice.payment_failed':
                await handlePaymentFailed(stripeEvent.data.object);
                break;
                
            case 'invoice.payment_succeeded':
                await handlePaymentSucceeded(stripeEvent.data.object);
                break;
                
            default:
                console.log(`ℹ️ Evento no manejado: ${stripeEvent.type}`);
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({ received: true })
        };
        
    } catch (error) {
        console.error('❌ Error procesando webhook:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Error procesando webhook',
                message: error.message
            })
        };
    }
};
