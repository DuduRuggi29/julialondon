const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PRICES    = { A: 34.99, B: 52.49, C: 69.98 };
const UNITS     = { A: 1, B: 2, C: 3 };
const DISCOUNT_CODES = { JULIA10: 0.10, JULIE15: 0.15 };
const SHIPPING_PRICES = [0, 19.99];

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const {
            promo, qty, shippingPrice, discountCode,
            customerName, customerEmail, customerPhone,
            customerAddress, tamanho, cor
        } = req.body;

        const promoKey = PRICES[promo] ? promo : 'B';
        const quantity  = Math.max(1, parseInt(qty) || 1);
        const basePrice = PRICES[promoKey] * quantity;

        const code = (discountCode || '').toUpperCase();
        const discountPct = DISCOUNT_CODES[code] || 0;
        const discountAmount = Math.round(basePrice * discountPct * 100) / 100;

        const shipping = SHIPPING_PRICES.includes(parseFloat(shippingPrice)) ? parseFloat(shippingPrice) : 0;

        const total = Math.max(0, Math.round((basePrice - discountAmount + shipping) * 100) / 100);
        const amountInCents = Math.round(total * 100);

        if (!amountInCents || amountInCents <= 0) {
            return res.status(400).json({ error: 'Invalid order amount' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            payment_method_types: ['card'],
            receipt_email: customerEmail || undefined,
            metadata: {
                promo: promoKey,
                units: String(UNITS[promoKey] * quantity),
                customerName: customerName || '',
                customerEmail: customerEmail || '',
                customerPhone: customerPhone || '',
                street: customerAddress?.street || '',
                complement: customerAddress?.complement || '',
                city: customerAddress?.city || '',
                state: customerAddress?.state || '',
                zip: customerAddress?.zip || '',
                country: customerAddress?.country || '',
                tamanho: tamanho || '',
                cor: cor || '',
                shippingPrice: String(shipping),
                discountCode: code,
                discountAmount: String(discountAmount),
                subtotal: String(basePrice)
            }
        });

        return res.status(200).json({ clientSecret: paymentIntent.client_secret, total });
    } catch (err) {
        console.error('Stripe PaymentIntent error:', err);
        return res.status(500).json({ error: err.message });
    }
};
