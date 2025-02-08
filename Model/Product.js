const mongoose=require('mongoose');
const ProductSchema=new mongoose.Schema({
    name:{type:String,required:true},
    description:{type:String,required:true},
    price:{type:Number,min:0,required:true},
    image:{type:String,required:[true, 'Image is Required']},
    category:{type:String,required:true},
    isFeatured:{type:Boolean,default:false}
},{timestamps:true})
module.exports=mongoose.model('Products',ProductSchema);