const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET); // Use env variable in production

const paymentCreate =  async (req, res) => {
  try {
    const { amount } = req.body; // Amount in smallest currency unit (e.g., cents for USD, paise for INR)

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "inr",
      payment_method_types: ["card"],
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

module.exports = { paymentCreate };