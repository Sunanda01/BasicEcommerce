const Redis=require('ioredis');
const REDIS_URL=require('../Config/config').REDIS_URL;
const client=new Redis(REDIS_URL);
module.exports=client;