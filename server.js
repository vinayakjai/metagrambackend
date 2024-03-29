const app=require("./app.js");
const cloudinary=require("cloudinary");
const dotenv=require('dotenv');
dotenv.config();
const PORT=process.env.PORT || 4200;
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});
app.listen(PORT,(req,res)=>{
  
    console.log(`server is running at http://localhost:${PORT}`);
    
})