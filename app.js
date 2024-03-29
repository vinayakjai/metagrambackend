const express = require("express");
const cookieParser=require("cookie-parser");
const cors=require("cors");
//const morgan=require("morgan")
const connecttodb=require("./config/databaseDriver")
const app=express();
connecttodb();
require("dotenv").config({path:"./config/config.env"});
app.use(cookieParser());
/*app.use(cors({
    origin:'http://localhost:5173',
    credentials:true,
}))
*/
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header(
      'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization,  X-PINGOTHER'
    );
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS');
    next();
  });
//app.use(morgan('dev'));
app.use(express.json({
  limit:"50mb"
}));
app.use(express.urlencoded({extended:true,limit:'50mb'}));


const post=require("./routes/post");
const user=require("./routes/user");

app.use("/api/v1/",post);
app.use("/api/v1/",user);

module.exports=app;