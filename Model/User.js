const mongoose=require('mongoose');
const UserSchema=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    cartItems:[
        {quantity:{type:Number,default:1},
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"P1roduct"
        }
    }
    ],
    role:{
        type:String,
        enum:["customer","admin"],
        default:"customer"
    }
    // isVerified:{type:Boolean,default:false},
    // verifyOtp:{type:String},
    // verifyOtpExpiry:{type:Number,default:0},
    // resetOtp:{type:String},
    // resetOtpExpiry:{type:Number,default:0}
},{timestamps:true});
module.exports=mongoose.model('Users',UserSchema);