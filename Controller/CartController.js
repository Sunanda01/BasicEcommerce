const Product = require('../Model/Product');
const CartController={
    async addToCart(req,res){
        try{
            const {productId}=req.body;
            const user=req.user;
            const existingItems=user.cartItems.find((item)=>item.id===productId);
            if(existingItems) existingItems.quantity+=1;
            else user.cartItems.push(productId);
            await user.save();
            return res.json({success:true,msg:"Added To Cart",details:user.cartItems});
        }
        catch(err){
            return res.json({success:false,msg:"Failed To Add To Cart"});
        }
    },

    async getCartProduct(req,res){
        try{
            const products=await Product.find({_id: {$in: req.user.cartItems}});
            const cartItems=products.map((product)=>{
                const item=req.user.cartItems.find((cartItem)=>cartItem.id===product.id);
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
            const {quantity}=req.body;
            const user=req.user;
            const existingItems=user.cartItems.find((item)=>item.id === productId);
            if(existingItems){
                if(quantity === 0) user.cartItems=user.cartItems.filter((item)=>item.id !== productId);
                else existingItems.quantity=quantity;   
                await user.save();
                return res.json({success:true, cartItems:user.cartItems});
            }
        }
        catch(err){
            return res.json({success:false,msg:"Failed to Update Quantity"})
        }
    },

    async removeFromCart(req,res){
        try{
            const {productId}=req.body;
            const user=req.user;
            if(!productId) user.cartItems=[];
            else user.cartItems=user.cartItems.filter((item)=>item.id !== productId);
            await user.save();
            return res.json({success:true,msg:"Item removed From Cart",cartItems:user.cartItems});
        }
        catch(err){
            return res.json({success:false,msg:"Failed to Remove from Cart"});
        }
    }
}
module.exports=CartController;