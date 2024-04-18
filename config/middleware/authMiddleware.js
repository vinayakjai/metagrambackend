const jwt=require("jsonwebtoken");
const User=require('../../models/User');

exports.isLogin=async(req,res,next)=>{
   try{
   
    const {token} =req.cookies;

   
    if(!token){
       return  res.status(402).json({
            success:false,
            message:"please login first",
            
        })
    }
    
    const decoded=await jwt.verify(token,process.env.JWT_SECRET);
   
    req.user=await User.findById(decoded._id);
    next();
   }catch(err){
    return res.status(501).json({
        success:false,
        message:`problem in authentication middleware due to->${err.message}`,
    })
   }
}