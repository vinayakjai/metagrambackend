const express = require("express");
const cookieParser=require("cookie-parser");
const cors=require("cors");
//const morgan=require("morgan")
const connecttodb=require("./config/databaseDriver")
const app=express();
connecttodb();
require("dotenv").config({path:"./config/config.env"});

app.use(cookieParser());

app.use(cors({
  origin:'https://metagramapp.netlify.app',
  credentials:true,
}))

//app.use(morgan('dev'));
app.use(express.json({
  limit:"50mb"
}));
app.use(express.urlencoded({extended:true,limit:'50mb'}));


const post=require("./routes/post");
const user=require("./routes/user");

app.get('/ping',(req,res)=>{
  return res.json({
    msg:'pongg',
  })
})

app.use("/api/v1/post",post);
app.use("/api/v1/",user);

module.exports=app;