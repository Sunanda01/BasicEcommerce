const jwt=require('jsonwebtoken');
const REFRESHJWTHASHVALUE=require('../Config/config').REFRESHJWTHASHVALUE;
function verifyToken(req,res,next){
    const refreshToken=req.cookies.refreshToken;
    if(!refreshToken) return res.json({success:false,msg:"No Refresh Token Found"});
    jwt.verify(refreshToken,REFRESHJWTHASHVALUE,function(err,user){
        if(err) return res.json({success:false,msg:"Invalid Token"});
        req.user=user;
        next();
    });
    
    
}
module.exports=verifyToken;