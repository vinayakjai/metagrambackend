const mongoose=require("mongoose");
const dotenv=require('dotenv');
dotenv.config();
const connecttodb=async()=>{
    try{
    
      const res=  await mongoose.connect(process.env.MONGO_URI);
      console.log("connected to database",res.connection.host);
    }catch(err){

        console.log("can't connect to database due to",err);

    }
}
module.exports=connecttodb;