const Product = require('../Model/Product');
const User=require('../Model/User');

const CartController={
    async addToCart(req,res){
        try{
            const {productId}=req.body;
            const user=req.user;
            const existingItems=user.cartItems.find((item)=>item.id===productId);
            if(existingItems) item+=1;
            else user.cartItems.push(productId);
            await user.save();
            return res.json({success:true,msg:"Added To Cart"},user.cartItems);
        }
        catch(err){
            return res.json({success:false,msg:"Failed To Add To Cart"});
        }
    },

    async getCartProduct(req,res){
        try{
            const product=await Product.find({_id: {$in: req.user.cartItems}});
            const cartItems=product.map((products)=>{
                const item=req.user.cartItems.find((cartItem)=>cartItem.id===products.id);
                return {...product.toJSON(),quantity:item.quantity};
            })
            return res.json({success:true,cartItems});
        }
        catch(err){
            return res.json({success:false,msg:"Failed To Access Cart Items"});
        }
    },

    async updateQuantity(req,res){
        try{
            const {id:productId}=req.params;
            const quantity=req.body;
            const user=req.user;
            const existingItems=user.cartItems.find((item)=>item.id===productId);
            if(existingItems){
                if(quantity===0){
                    user.cartItems=user.cartItems.filter((item)=>item.id!=productId);
                    await user.save();
                    return res.json({success:true},user.cartItems);
                }
            }
        }
        catch(err){
            return res.json({success:false,msg:"Failed to Update Quantity"})
        }
    },

    async removeAllFromCart(req,res){
        try{
            const {productId}=req.body;
            const user=req.user;
            if(!productId) user.cartItems=[];
            else user.cartItems=user.cartItems.filter((item)=>item.id!=productId);
            await user.save();
            return res.json({success:true,msg:"Item removed From Cart"},user.cartItems);
        }
        catch(err){
            return res.json({success:false,msg:"Failed to Remove from Cart"});
        }
    }
}
module.exports=CartController;