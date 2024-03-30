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
  res.setHeader(
    "Access-Control-Allow-Origin",
     process.env.DOMAIN
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Private-Network", true);
  //  Firefox caps this at 24 hours (86400 seconds). Chromium (starting in v76) caps at 2 hours (7200 seconds). The default value is 5 seconds.
  res.setHeader("Access-Control-Max-Age", 7200);

  next();
});


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