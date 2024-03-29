const express=require("express");

const { createPost, likeandUnlikePost, deletePost,getPostofFollowing, updateCaption, commentOnPost, deleteComment } = require("../controllers/post");
const { isLogin } = require("../config/middleware/authMiddleware");

const router=express.Router();

router.route('/post/upload').post(isLogin,createPost);
router.route('/post/:id').get(isLogin,likeandUnlikePost).put(isLogin,updateCaption).delete(isLogin,deletePost);

router.route('/post').get(isLogin,getPostofFollowing);
router.route('/post/comment/:id').put(isLogin,commentOnPost).delete(isLogin,deleteComment);

module.exports=router;