const jwt=require('jsonwebtoken');
const JWTHASHVALUE=require('../Config/config').JWTHASHVALUE;
const User=require('../Model/User');
const verifyAccessToken=async(req,res,next)=>{
    try{
        const accessToken=req.cookies.accessToken;
        if(!accessToken) return res.status(401).json({success:false,msg:"No Access Token Found"});
        const decodedToken=jwt.verify(accessToken,JWTHASHVALUE);
        const user=await User.findById(decodedToken.id);
        if(!user) return res.json({success:false,msg:"User Not Found"});
        req.user=user;
        next(); 
    }
    catch(err){
        return res.json({success:false,msg:"Invalid or Expired Access Token"});
    }

}

const adminAuth=async(req,res,next)=>{
    if(req.user && req.user.role==="admin") next();
    else return res.json({success:false,msg:"You are un-authorized"});
   
}

module.exports={verifyAccessToken,adminAuth};