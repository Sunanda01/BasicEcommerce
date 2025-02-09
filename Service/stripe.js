const Stripe=require('stripe');
const STRIPE_SECRET_KEY=require('../Config/config').STRIPE_SECRET_KEY;
const stripe=new Stripe(STRIPE_SECRET_KEY);
module.exports=stripe;