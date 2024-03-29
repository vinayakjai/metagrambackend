const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please enter a name"],

    },
    email: {
        type: String,
        required: [true, "please enter email"],
        unique: [true, "email already exists!"]
    },
    password: {
        type: String,
        required: [true, "please enter a password"],
        minlength: [6, "password must be atleast 6 characters"],
        select: false,
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",

        }
    ],
    followings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",

        }
    ],
    
    avtar: {
        public_id: String,
        url: String,

    }
},{
    timestamps:true
})
userSchema.pre('save', async function(next) {
   
    
   if(this.isModified("password")){
    this.password = await bcrypt.hash(this.password, 10);
   }//hashing password
   next();
  
})

userSchema.methods.matchPassword = async function(plainTextPassword,userpassword){
    
    const isMatch= await bcrypt.compare(plainTextPassword,userpassword);
   
    return isMatch
}

userSchema.methods.generateToken = async function (){

    const token=await jsonwebtoken.sign({ _id: this._id }, process.env.JWT_SECRET,{
        expiresIn:"24hr",
    });
   
    return token;
}

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;