const Product=require('../Model/Product');
const client=require('../Utils/redis');
const cloudinary=require('../Utils/cloudinary');
async function cacheFeaturedProduct(req,res){
    try{
        const featuredProduct=await Product.find({isFeatured:true}).lean();
        await client.set("featuredProduct",JSON.stringify(featuredProduct),"EX",1*24*60*60);
    }
    catch(err){
        return res.json({success:false,msg:"Unable to save Featured Product in Redis DB"});
    }
}
const ProductController={
    async createProduct(req,res){
        try{
            const {name,description,price,image,category}=req.body;
            let cloudinaryRes=null;
            if(image) cloudinaryRes=await cloudinary.UploadStream.upload(image,{folder:"products"});
            const product=await Product.create({
                name,
                description,
                price,
                image:cloudinaryRes?.secure_url ? cloudinaryRes?.secure_url : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5Sh209MMxKFXtyWOKLVXe-JjSc7_eFz-p6g&s",
                category
            })
            res.json({success:true,msg:"Product Added",product});
        }
        catch(err){
            return res.json({success:false,msg:"Failed to Create Product"});
        }
    },

    async getAllProduct(req,res){
        try{
            const product=await Product.find({});
            return res.json({success:true,product});
        }
        catch(err){
            return res.json({success:false,msg:"Unable to Access Product"});
        }
    },

   
    async deleteProduct(req,res){
        try{
            const {id}=req.params;
            const product=await Product.findById({_id:id});
            if(!product) return res.json({success:false,msg:"Product Not Found"});
            if(product.image) {
                const publicId=product.image.split("/").pop().split(".")[0];
                try {
                    await cloudinary.uploader.destroy(`products/${publicId}`);
                }
                catch(err){
                    return res.json({success:false,msg:"Error in Deleting Product Image from Cloudinary"});
                }
            }
            await product.deleteOne({_id:id});
            return res.json({success:true,msg:"Product Deleted Successfully"});
        }
        catch(err){
            return res.json({success:false,msg:"Error in Deleting Product"});
        }
    },

    async getFeaturedProduct(req,res){
        try{
            let featuredProduct=await client.get("featuredProduct");
            if(featuredProduct) return res.json(JSON.parse(featuredProduct));
            featuredProduct=await Product.find({isFeatured:true}).lean();
            if(!featuredProduct) return res.json({success:false,msg:"Featured Product Not Found"});
            await client.set("featuredProduct",JSON.stringify(featuredProduct));
            return res.json({success:true,featuredProduct});
        }
        catch(err){
            return res.json({success:false,msg:"Unable to get Featured Product"});
        }
    },

    async getProductCategory(req,res){
        const {category}=req.params;
        try{
            const product=await Product.find({category});
            res.json({success:true,product});
        }
        catch(err){
            return res.json({success:false,msg:"Unable to fetch Product"});
        }
    },

    async toggleFeaturedProduct(req,res){
        try{
            const {id}=req.params;
            const product=await Product.findById(id);
            product.isFeatured=!product.isFeatured;
            const updateProduct=await product.save();
            await cacheFeaturedProduct();
            return res.json({success:true,updateProduct});
        }
        catch(err){
            return res.json({success:false,msg:"Error in Toogle Featured Product Controller"});
        }
    }
}
module.exports=ProductController;