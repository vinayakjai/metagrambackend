const User = require("../models/User");
const Post = require("../models/Post");
const cloudinary=require("cloudinary");

exports.register = async (req, res) => {
    try {
        const { name, email, password ,avtar} = req.body;
       
        console.log('h')
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "all fields are required"
            })
        }
        let user = await User.findOne({ email });
        if (user) {
           return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }
        const myCloud=await cloudinary.v2.uploader.upload(avtar,{
            folder:"avtars"
        })
        user = await User.create({
            name, email, password
            , avtar: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        })

        const token = await user.generateToken();


        res.cookie("myytoken", token, {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)//expires after 90 days
            , secure: true,
           
            httpOnly: true
        })

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user,
           
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: `Can't register user `,
        })
    }
}

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
       

        if (!email || !password) {
            res.status(401).json({
                success: false,
                message: "all fields are required"
            })

            return;
        }
        const user = await User.findOne({ email }).select("+password").populate("posts followers followings")

        if (!user) {
            res.status(400).json({
                success: false,
                message: "User doesn't exists please register",

            })
            return;
        }

        const isMatch = await user.matchPassword(password, user.password);

        if (!isMatch) {
            res.status(402).json({
                success: false,
                message: "Password is incorrect",


            })
            return;
        }

        const token = await user.generateToken();
        const cookieOptions = {
            maxAge: 7 * 24 * 60 * 60 * 1000,//7days
            httpOnly: true,
            secure: true
         }
         
        res.cookie("myytoken",token,cookieOptions)
        return res.status(201).json({
            success: true,
            message: "User loggedin successfully",
            user,
           
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Sorry can't login user`
        })
    }
}


exports.followUser = async (req, res, next) => {
    try {


        if (!req.params.id) {
            return res.status(401).json({
                success: false,
                message: "can;t get id of user",
            })
        }

        const usertoFollow = await User.findById(req.params.id);
        const loggedInUser = await User.findById(req.user._id);

        if (!usertoFollow) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            })
        }
        if (loggedInUser.followings.includes(usertoFollow._id)) {
            const indexofuser = loggedInUser.followings.indexOf(usertoFollow._id);
            loggedInUser.followings.splice(indexofuser, 1);
            const indexofLoggedInUser = usertoFollow.followers.indexOf(loggedInUser._id);
            usertoFollow.followers.splice(indexofLoggedInUser, 1);
            await loggedInUser.save();
            await usertoFollow.save();

            res.status(201).json({
                success: true,
                message: "user unfollowed",
            })

        } else {

            loggedInUser.followings.push(usertoFollow._id);
            usertoFollow.followers.push(loggedInUser._id);

            await loggedInUser.save();
            await usertoFollow.save();

            res.status(201).json({
                success: true,
                message: "User followed"
            })

        }

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Some problem occured!"
        })
    }
}



exports.logout = async (req, res, next) => {
    try {

        res.status(200).cookie("myytoken", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        }).json({
            success: true,
            message: "user logged out successfully"
        })
    } catch (err) {
        res.status(400).json({
            success: false,
            message: `Can't logout due to some problem`
        })
    }
}


exports.updatePassword = async (req, res, next) => {
    try {

        
        const user = await User.findById(req.user._id).select("+password");

        const { oldPassword, newPassword } = req.body;
        console.log(oldPassword,newPassword);
        if (!oldPassword || !newPassword) {
          return  res.status(401).json({
                success: false,
                message: "all fields are required"
            })
        }
        const isMatch = await user.matchPassword(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "incorrect old password"
            })
        }

        user.password = newPassword;
        await user.save();
       return res.status(201).json({
            success: true,
            message: "Password Updated"
        })

    } catch (err) {
      return  res.status(401).json({
            success: false,
            message: `Can't update Password`
        })
    }
}

exports.updateProfile = async (req, res, next) => {
    try {

        const user = await User.findById(req.user._id);
        console.log(req.body.name);
        
        const { name, email,avtar } = req.body;
        if (!name || !email || ! avtar) {
            return res.status(401).json({
                success: false,
                message: "all fields are required"
            })
        }
        if (name) {
            user.name = name;

        }
        if (email) {
            user.email = email;
        }
       
        if(avtar){
             
             await cloudinary.v2.uploader.destroy(user.avtar.public_id);
             const myCloud=await cloudinary.v2.uploader.upload(avtar,{
                folder:"avtars",
             })
           
             user.avtar.public_id=myCloud.public_id;
             user.avtar.url=myCloud.url;
           
        }
        console.log("reached");
        await user.save();
        res.status(201).json({
            success: true,
            message: "profile updated",
        })
    } catch (err) {
        res.status(401).json({
            success: false,
            message: "can't update profile"
        })
       
    }
}

exports.deleteMyProfile = async (req, res, next) => {
    try {

        const user = await User.findById(req.user._id);
        const posts = user.posts;
        const followers = user.followers;
        const following = user.followings;
        const userId = user._id;

        await cloudinary.v2.uploader.destroy(user.avtar.public_id);


        await user.deleteOne();

        //logging out user after deleting profile

        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        })

        //deleting each posts of user
        for (let i = 0; i < posts.length; i++) {

            const post = await Post.findById(posts[i]);
            await cloudinary.v2.uploader.destroy(post.image.public_id);

            await post.deleteOne();



        }

        //deleting user from followers following's

        for (let i = 0; i < followers.length; i++) {
            const follower = await User.findById(followers[i]);
            const index = follower.followings.indexOf(userId);
            follower.followings.splice(index, 1);//removing user id from follower following's
            await follower.save();
        }

        //deleting user from following's follower's
        for (let i = 0; i < following.length; i++) {
            const follows = await User.findById(following[i]);

            const index = follows.followers.indexOf(userId);

            follows.followers.splice(index, 1);//removing user id from follower following's

            await follows.save();
        }


        //deleting all comments of user from all posts

        const allPosts=await Post.find();
        for(let i=0;i<allPosts.length;i++){
            const post=await Post.findById(allPosts[i]._id);
            for(let j=0;j<post.comments.length;j++){
                if(post.comments[j].user===userId){
                    post.comments.splice(j,1);
                   
                }
            }

            await post.save();
        }


          //deleting all likes of user from all posts

         
          for(let i=0;i<allPosts.length;i++){
              const post=await Post.findById(allPosts[i]._id);
              for(let j=0;j<post.likes.length;j++){
                  if(post.likes[j].user===userId){
                      post.likes.splice(j,1);
                     
                  }
              }
              await post.save();
          }

      

        res.status(201).json({
            success: true,
            message: "profile deleted susccessfully"
        })

    } catch (err) {
        res.status(402).json({
            success: false,
            message:`Can't delete Profile`
        })
    }
}

exports.myProfile = async (req, res, next) => {
    try {

       
        const user = await User.findById(req.user._id).populate("posts followers followings");
        if (!user) {
            res.status(401).json({
                success: false,
                message: "user doesn't exists can't get profile details"
            })
            return;
        }

        return res.status(201).json({
            success: true,
            user,
        })

    } catch (err) {
        return res.status(401).json({
            success: false,
            message: `Some Problem Occured`
        })
    }
}

exports.getUserProfile = async (req, res, next) => {
    try {
     
        const user = await User.findById(req.params.id).populate('followers followings posts');
       
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            })
        }

        res.status(201).json({
            success: true,
            user,
        })

    } catch (err) {
        res.status(501).json({
            success: false,
            message: `Some Problem Occured`
        })
    }
}


exports.getAllUsers = async (req, res) => {
    try {
      
        const users = await User.find({name:{$regex:req.query.name,$options:"i"}});

        if(!users){
            res.status(401).json({
                success:false,
                message:"Unable to find Users"
            })
        }

        res.status(201).json({
            success: true,
            users
        })

    } catch (err) {
        res.status(501).json({
            success: false,
            message: `Some problem Occured`
        })
    }
}

exports.getMyAllPosts=async (req,res,next)=>{
   try{
  
    const user=await User.findById(req.user._id);
    
     const posts=[];
     for(let i=0;i<user.posts.length;i++){
        const post=await Post.findById(user.posts[i]).populate("likes comments.user owner");
        posts.push(post);
     }

    res.status(201).json({
        success:true,
        posts

    })
   }catch(err){
    return res.status(402).json({
        success:false,
        message:"Can't fetch your posts"
    })
   }
}





exports.getUserPosts=async (req,res,next)=>{
    try{
   
     const user=await User.findById(req.params.id);
     
      const posts=[];
      for(let i=0;i<user.posts.length;i++){
         const post=await Post.findById(user.posts[i]).populate("likes comments.user owner");
         posts.push(post);
      }
 
     res.status(201).json({
         success:true,
         posts
 
     })
    }catch(err){
     return res.status(402).json({
         success:false,
         message:`Some problem occured`
     })
    }
 }