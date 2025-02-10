const express=require('express');
const PORT=require('./Config/config').PORT;
const connection=require('./Utils/connection');
const cors=require('cors');
const routes=require('./Routes/routes');
const cookieParser=require('cookie-parser');
const app=express();
app.use(cors({
    origin: 'http://localhost:5176',
    credentials:true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(routes);
app.listen(PORT,()=>{
    connection();
    console.log(`Connected at PORT ${PORT}`);
})