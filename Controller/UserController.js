const User=require('../Model/User');
const bcrypt=require('bcrypt');
const bcrypt_SaltLevel=require('../Config/config').bcrypt_SaltLevel;
const jwt=require('jsonwebtoken');
const JWTHASHVALUE=require('../Config/config').JWTHASHVALUE;
const JWTTOKENEXPIRY=require('../Config/config').JWTTOKENEXPIRY;
const REFRESHJWTHASHVALUE=require('../Config/config').REFRESHJWTHASHVALUE;
const REFRESHTOKENEXPIRY=require('../Config/config').REFRESHTOKENEXPIRY;
const client=require('../Utils/redis');
const generateToken=async(userId)=>{
    const user=await User.findById(userId);
    if(!user) throw new Error("User Not Found");
    const accessToken=jwt.sign({id:userId},JWTHASHVALUE,{expiresIn:JWTTOKENEXPIRY});
    const refreshToken=jwt.sign({id:userId},REFRESHJWTHASHVALUE,{expiresIn:REFRESHTOKENEXPIRY});
    return {accessToken,refreshToken};
}
const accessTokenOption={
    httpOnly:true,
    secure:true,
    sameSite:"strict",
    maxAge:15*60*1000
}
const refreshTokenOption={
    httpOnly:true,
    secure:true,
    sameSite:"strict",
    maxAge:7*24*60*60*1000
}
const storeRefreshToken=async(userId,refreshToken)=>{
    await client.set(`${userId}`,refreshToken,"EX",7*24*60*60);
}
const UserController={
    async refreshToken(req,res){
        try{
            const refreshToken=req.cookies.refreshToken;
            const id=req.user.id;
            const storedToken=await client.get(`${id}`);
            if(refreshToken!==storedToken) return res.json({success:false,msg:"Invalid Token"});
            const accessToken=jwt.sign({id},JWTHASHVALUE,{expiresIn:JWTTOKENEXPIRY});
            return res
            .cookie("accessToken",accessToken,accessTokenOption)
            .json({success:true,msg:"Token Refreshed successfully"});
        }
        catch(err){
            return res.json({success:false,msg:"Failed to Generate Token"});
        }
    },

    async register(req,res){
        const {name,email,password}=req.body;
        if(!name || !email || !password) return res.json({success:false,msg:"Fields Are Missing"});
        try{
            const existUser=await User.findOne({email});
            if(existUser) return res.json({success:false, msg:"Email Already Registered"});
            const salt=await bcrypt.genSalt(Number(bcrypt_SaltLevel));
            const hashpassword=await bcrypt.hash(password,salt);
            const newUser=new User({
                name,
                email,
                password:hashpassword
            })
            const data=await newUser.save();
            const {accessToken,refreshToken}=await generateToken(data._id);
            await storeRefreshToken(data._id,refreshToken);
            return res
            .cookie("refreshToken",refreshToken,refreshTokenOption)
            .cookie("accessToken",accessToken,accessTokenOption)
            .json({success:true,msg:"User Profile Created",name,email});
        }catch(err){
            return res.json({success:false,msg:"Failed to Save User"});
        }
    },

    async login(req,res){
        const {email,password}=req.body;
        if(!email || !password) return res.json({success:false,msg:"Fields are Missing"});
        try{
            const user=await User.findOne({email});
            if(!user) return res.json({success:false,msg:"User Not Found"});
            const validatePassword=await bcrypt.compare(password,user.password);
            if(!validatePassword) return res.json({success:false,msg:"Invalid Password"});
            const {accessToken,refreshToken}=await generateToken(user._id);
            await storeRefreshToken(user._id,refreshToken);
            return res
            .cookie("refreshToken",refreshToken,refreshTokenOption)
            .cookie("accessToken",accessToken,accessTokenOption)
            .json({success:true,msg:"Login Successfully"});
        }
        catch(err){
            return res.json({success:false,msg:"Login Failed"});
        }
    },

    async logout(req,res){
        try{
            const id=req.user.id;
            await client.del(`${id}`);
            return res
            .clearCookie("refreshToken")
            .clearCookie("accessToken")
            .json({success:true,msg:"Logout Successfully"});
        }
        catch(err){
            return res.json({success:false,msg:"Something Went Wrong"});
        }
    }
}
module.exports=UserController;