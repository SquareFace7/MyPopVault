const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.log('⚠️ STRIPE_SECRET_KEY is not configured yet in .env. Stripe routes will be disabled.');
}

// Webhook endpoint - MUST use raw body
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    console.error('❌ Stripe is not configured. Webhook rejected.');
    return res.status(500).send('Stripe is not configured on this server.');
  }
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;

    if (userId) {
      try {
        const user = await User.findById(userId);
        if (user) {
          user.isVip = true;
          if (user.role !== 'admin') {
            user.role = 'vip';
          }
          await user.save();
          console.log(`👑 User ${user.username} upgraded to VIP via Stripe!`);
        }
      } catch (err) {
        console.error('❌ Failed to update user VIP status in webhook:', err);
        return res.status(500).json({ error: 'Failed to update user' });
      }
    }
  }

  res.json({ received: true });
});

// Create Checkout Session - uses json parser (or routes specific middleware)
router.post('/create-checkout-session', express.json(), authMiddleware, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured on this server.' });
    }
    const rawFrontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || process.env.BASE_URL || 'https://mypopvault.online';
    const frontendUrl = (rawFrontendUrl.includes('localhost') || rawFrontendUrl.includes('127.0.0.1') || rawFrontendUrl.includes('54.145.')) && process.env.NODE_ENV === 'production'
      ? 'https://mypopvault.online'
      : (rawFrontendUrl.replace(/\/+$/, '') || 'https://mypopvault.online');
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'MyPopVault VIP Premium Upgrade',
              description: 'Unlock unlimited vault size, exclusive badges, private chat channels, and grail alerts!',
            },
            unit_amount: 999, // $9.99
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/vip-success`,
      cancel_url: `${frontendUrl}/vip-cancel`,
      metadata: {
        userId: req.user._id.toString(),
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('❌ Stripe checkout session error:', error);
    res.status(500).json({ error: 'Failed to create Stripe session', message: error.message });
  }
});

// POST /api/payment/confirm-vip - Upgrades VIP status for authenticated user upon successful payment return
router.post('/confirm-vip', express.json(), authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isVip = true;
    if (user.role !== 'admin') {
      user.role = 'vip';
    }
    await user.save();
    console.log(`👑 VIP status confirmed and upgraded for user: ${user.username}`);

    res.json({
      success: true,
      message: 'VIP status activated successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVip: user.isVip,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('❌ Confirm VIP Error:', error);
    res.status(500).json({ error: 'Failed to confirm VIP status', message: error.message });
  }
});

module.exports = router;
