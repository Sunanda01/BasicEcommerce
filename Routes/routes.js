const routes=require('express').Router();
const UserController=require('../Controller/UserController');
const ProductController=require('../Controller/ProductController');
const CartController=require('../Controller/CartController');
const verifyToken=require('../Middleware/verifyToken');
const {verifyAccessToken,adminAuth}=require('../Middleware/AuthMiddleware');

//User Routes
routes.post('/register',UserController.register);
routes.post('/login',UserController.login);
routes.post('/refresh-Token',verifyToken,UserController.refreshToken);
routes.post('/logout',verifyToken,UserController.logout);

//Product Routes
routes.post('/create-Product',verifyAccessToken,adminAuth,ProductController.createProduct);
routes.get('/get-all-Product',verifyAccessToken,adminAuth,ProductController.getAllProduct);
routes.get('/get-product-category/:category',ProductController.getProductCategory);
routes.get('/get-featured-product',ProductController.getFeaturedProduct);
routes.patch('/toggle-featured-product/:id',verifyAccessToken,adminAuth,ProductController.toggleFeaturedProduct);
routes.delete('/delete-product/:id',verifyAccessToken,adminAuth,ProductController.deleteProduct);

//cart Routes
routes.post('/add-to-cart',verifyAccessToken,CartController.addToCart);
routes.get('/get-cart-product',verifyAccessToken,CartController.getCartProduct);
routes.put('update-quantity/:id',verifyAccessToken,CartController.updateQuantity);
routes.delete('remove-all-from-cart',verifyAccessToken,CartController.removeAllFromCart);

module.exports=routes;