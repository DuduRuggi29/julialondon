const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_KEY     = process.env.SUPABASE_SERVICE_KEY;
const WEBHOOK_SECRET   = process.env.STRIPE_WEBHOOK_SECRET;

function buffer(readable) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readable.on('data', (chunk) => chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk));
        readable.on('end', () => resolve(Buffer.concat(chunks)));
        readable.on('error', reject);
    });
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).end();

    let event;
    try {
        const buf = await buffer(req);
        const sig = req.headers['stripe-signature'];
        event = stripe.webhooks.constructEvent(buf, sig, WEBHOOK_SECRET);
    } catch (err) {
        console.error('Stripe webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const pi = event.data.object;
        const m = pi.metadata || {};

        const orderData = {
            status: 'aprovado',
            nome: m.customerName || '',
            email: m.customerEmail || '',
            telefone: m.customerPhone || '',
            cpf: '',
            cep: m.zip || '',
            rua: m.street || '',
            numero: '',
            complemento: [m.complement, m.country].filter(Boolean).join(' · '),
            bairro: '',
            cidade: m.city || '',
            estado: m.state || '',
            tipo_frete: parseFloat(m.shippingPrice) === 0 ? 'Padrão' : 'Expresso',
            prazo_frete: '',
            custo_frete: parseFloat(m.shippingPrice) || 0,
            kit: m.promo || '',
            nome_kit: `Kit ${m.promo}`,
            quantidade: parseInt(m.units) || 1,
            tamanho: m.tamanho || '',
            cor: m.cor || '',
            forma_pagamento: 'Cartão de Crédito',
            status_pagamento: 'approved',
            subtotal: parseFloat(m.subtotal) || 0,
            desconto: parseFloat(m.discountAmount) || 0,
            total: pi.amount / 100,
            observacoes: `Stripe PI: ${pi.id}`
        };

        try {
            await fetch(`${SUPABASE_URL}/rest/v1/pedidos`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(orderData)
            });
        } catch (dbErr) {
            console.error('Supabase save error:', dbErr);
        }
    } else if (event.type === 'payment_intent.payment_failed') {
        console.log('Stripe payment failed:', event.data.object.id);
    }

    return res.status(200).json({ received: true });
};

module.exports.config = { api: { bodyParser: false } };
