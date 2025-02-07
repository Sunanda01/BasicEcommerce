const routes=require('express').Router();
const UserController=require('../Controller/UserController');
routes.post('/register',UserController.register);
routes.post('/login',UserController.login);
routes.post('/refresh-Token',UserController.refreshToken);
routes.post('/logout',UserController.logout);
module.exports=routes;