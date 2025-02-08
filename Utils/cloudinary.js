const cloudinary=require('cloudinary').v2;
const cloud_name=require('../Config/config').CLOUDINARY_CLOUD_NAME;
const api_key=require('../Config/config').CLOUDINARY_API_KEY;
const api_secret=require('../Config/config').CLOUDINARY_API_SECRET;
cloudinary.config({
    cloud_name:cloud_name,
    api_key:api_key,
    api_secret:api_secret
})
module.exports=cloudinary;