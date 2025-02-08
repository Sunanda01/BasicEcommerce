const routes=require('express').Router();
const UserController=require('../Controller/UserController');
const verifyToken=require('../Middleware/verifyToken');
const {verifyAccessToken,adminAuth}=require('../Middleware/AuthMiddleware');
const ProductController=require('../Controller/ProductController');
//User Routes
routes.post('/register',UserController.register);
routes.post('/login',UserController.login);
routes.post('/refresh-Token',verifyToken,UserController.refreshToken);
routes.post('/logout',verifyToken,UserController.logout);

//Product Routes
routes.post('/create-Product',verifyAccessToken,adminAuth,ProductController.createProduct);
routes.get('/get-All-Product',verifyAccessToken,adminAuth,ProductController.getAllProduct);
routes.get('/get-Product-Category/:category',ProductController.getProductCategory);
routes.get('/get-Featured-Product',ProductController.getFeaturedProduct);
routes.patch('/toggle-Featured-Product/:id',verifyAccessToken,adminAuth,ProductController.toggleFeaturedProduct);
routes.delete('/delete-Product/:id',verifyAccessToken,adminAuth,ProductController.deleteProduct);

module.exports=routes;