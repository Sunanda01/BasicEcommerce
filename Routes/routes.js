const routes=require('express').Router();
const UserController=require('../Controller/UserController');
const ProductController=require('../Controller/ProductController');
const CartController=require('../Controller/CartController');
const verifyToken=require('../Middleware/verifyToken');
const {verifyAccessToken,adminAuth}=require('../Middleware/AuthMiddleware');
const PaymentController=require('../Controller/Paymentcontroller');
const CouponController=require('../Controller/CouponController');
const AnalyticsController=require('../Controller/AnalyticsController');

//User Routes
routes.post('/register',UserController.register);
routes.post('/login',UserController.login);
routes.post('/refresh-Token',verifyToken,UserController.refreshToken);
routes.post('/logout',verifyToken,UserController.logout);
routes.get('/get-user',verifyAccessToken,UserController.getUser);

//Product Routes
routes.post('/create-Product',verifyAccessToken,adminAuth,ProductController.createProduct);
routes.get('/get-all-Product',verifyAccessToken,adminAuth,ProductController.getAllProduct);
routes.get('/get-product-category/:category',ProductController.getProductCategory);
routes.get('/get-featured-product',ProductController.getFeaturedProduct);
routes.patch('/toggle-featured-product/:id',verifyAccessToken,adminAuth,ProductController.toggleFeaturedProduct);
routes.delete('/delete-product/:id',verifyAccessToken,adminAuth,ProductController.deleteProduct);
routes.get("/recommendations", ProductController.getRecommendedProducts);

//cart Routes
routes.post('/add-to-cart',verifyAccessToken,CartController.addToCart);
routes.get('/get-cart-product',verifyAccessToken,CartController.getCartProduct);
routes.put('/update-quantity/:id',verifyAccessToken,CartController.updateQuantity);
routes.delete('/remove-from-cart',verifyAccessToken,CartController.removeFromCart);

//Coupon Routes
routes.get("/get-coupon",verifyAccessToken,CouponController.getCoupon);
routes.post("/validate-coupon",verifyAccessToken,CouponController.validateCoupon);

//Payment Routes
routes.post('/create-checkout-session',verifyAccessToken,PaymentController.createCheckoutsession);
routes.post('/checkout-success',verifyAccessToken,PaymentController.checkoutSuccess);

//Analytics Routes
routes.get("/analysis-data",verifyAccessToken,adminAuth,async(req,res)=>{
    try{
        const analyticsdata=await AnalyticsController.getAnalyticsDetails();
        const endDate=new Date();
        const startDate=new Date(endDate.getTime()-7*24*60*60*1000);
        const dailySalesData=await AnalyticsController.getDailySalesData(startDate,endDate);
        res.json({
            analyticsdata,
            dailySalesData
        });
    }
    catch(err){
        res.status(500).json({ message: "Server error", err: err.message });
    }
})

module.exports=routes;