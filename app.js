const express = require("express");
const cookieParser=require("cookie-parser");
const cors=require("cors");
//const morgan=require("morgan")
const connecttodb=require("./config/databaseDriver")
const app=express();
connecttodb();
require("dotenv").config({path:"./config/config.env"});
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader(`Access-Control-Allow-Origin", ${process.env.DOMAIN}`);
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
})
/*
app.use(cors({
    origin:process.env.DOMAIN,
    credentials:true,
}))
*/

//app.use(morgan('dev'));
app.use(express.json({
  limit:"50mb"
}));
app.use(express.urlencoded({extended:true,limit:'50mb'}));


const post=require("./routes/post");
const user=require("./routes/user");

app.get('/ping',(req,res)=>{
  return res.json({
    msg:'pong',
  })
})

app.use("/api/v1/post",post);
app.use("/api/v1/",user);

module.exports=app;