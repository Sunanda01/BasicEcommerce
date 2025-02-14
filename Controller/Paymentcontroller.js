const stripe=require('../Service/stripe');
const Coupon=require('../Model/Coupon');
const FRONTEND_URL=require('../Config/config').FRONTEND_URL;
const Order=require('../Model/Order');

async function createStripeCoupon(discountPercentage, existingStripeCouponId) {
    if (existingStripeCouponId) return existingStripeCouponId; // Use existing coupon
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    });
    return coupon.id;
}

async function createNewCoupon(userId) {
	await Coupon.findOneAndDelete({ userId });
	const newCoupon = new Coupon({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
		userId: userId,
	});
	await newCoupon.save();
	return newCoupon;
}

const PaymentController={
    async createCheckoutsession(req, res) {
        try {
            const { products, couponCode } = req.body;
            if (!Array.isArray(products) || products.length === 0) {
                return res.status(400).json({ success: false, msg: "Invalid or Empty Products Array" });
            }
            let totalAmount = 0;
            const lineItems = products.map((product) => {
                const amount = Math.round(product.price * 100);
                totalAmount += amount * product.quantity;
                return {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: product.name,
                            images: [product.image],
                        },
                        unit_amount: amount,
                    },
                    quantity: product.quantity || 1,
                };
            });
            if (!req.user || !req.user.id) {
                return res.status(401).json({ success: false, msg: "User authentication required" });
            }
    
            let coupon = null;
            if (couponCode) {
                coupon = await Coupon.findOne({ code: couponCode, userId: req.user.id, isActive: true });
                if (coupon) totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
            }
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: lineItems,
                mode: "payment",
                success_url: `${FRONTEND_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${FRONTEND_URL}/purchase-cancel`,
                discounts: coupon
                    ? [
                          {
                              coupon: await createStripeCoupon(coupon.discountPercentage,coupon.stripeCouponId),
                          },
                      ]
                    : [],
                metadata: {
                    userId: req.user.id || "",
                    couponCode: couponCode || "",
                    products: JSON.stringify(
                        products.map((p) => ({
                            id: p._id,
                            quantity: p.quantity,
                            price: p.price,
                        }))
                    ),
                },
            });
            if (totalAmount >= 20000) await createNewCoupon(req.user._id);
            return res.json({ success: true, id: session.id, totalAmount });
        } catch (err) {
            res.status(500).json({ message: "Error processing checkout", error: err.message });
        }
    },

    async checkoutSuccess(req, res) {
    try {
        const { sessionId } = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session) {
            return res.status(400).json({ message: "Invalid session ID" });
        }

        if (session.payment_status !== "paid") {
            return res.status(400).json({ message: "Payment not completed yet." });
        }

        // Check if an order already exists for this session
        const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
        if (existingOrder) {
            return res.json({
                success:true,
                message: "Order has already been processed for this session.",
                orderId: existingOrder._id
            });
        }

        // Ensure metadata exists
        if (!session.metadata) {
            return res.status(400).json({ message: "Missing session metadata" });
        }

        // Handle coupon deactivation if applicable
        if (session.metadata.couponCode) {
            await Coupon.findOneAndUpdate(
                {
                    code: session.metadata.couponCode,
                    userId: session.metadata.userId,
                    isActive: true, // Ensure only active coupons are updated
                },
                { isActive: false }
            );
        }

        // Parse product metadata safely
        let products = [];
        try {
            products = JSON.parse(session.metadata.products);
        } catch (err) {
            return res.status(400).json({ message: "Invalid products data in session metadata" });
        }

        // Create and save new order
        const newOrder = new Order({
            user: session.metadata.userId,
            products: products.map((product) => ({
                product: product.id,
                quantity: product.quantity,
                price: product.price,
            })),
            totalAmount: session.amount_total / 100, // Convert from cents to dollars
            stripeSessionId: sessionId,
        });

        await newOrder.save();

        return res.status(200).json({
            success: true,
            message: "Payment successful, order created, and coupon deactivated if used.",
            orderId: newOrder._id,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error processing successful checkout",
            error: error.message,
        });
    }
}
}

module.exports=PaymentController;