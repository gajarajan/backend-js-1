const express=require('express');
const connectDb=require('./config/db');
const app=express();
connectDb();

//init middleware
app.use(express.json({extended:false}));
app.get('/',(req,res)=>res.send('app run'));
app.use('/api/users',require('./router/api/users'));
app.use('/api/auth',require('./router/api/auth'));
app.use('/api/profile',require('./router/api/profile'));
app.use('/api/post',require('./router/api/post'));
const PORT=process.env.PORT||5000;
app.listen(PORT,()=>console.log(`server runing`)
);