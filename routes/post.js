const express=require("express");

const { createPost, likeandUnlikePost, deletePost,getPostofFollowing, updateCaption, commentOnPost, deleteComment } = require("../controllers/post");
const { isLogin } = require("../config/middleware/authMiddleware");

const router=express.Router();

router.route('/upload').post(isLogin,createPost);
router.route('/:id').get(isLogin,likeandUnlikePost).put(isLogin,updateCaption).delete(isLogin,deletePost);

router.route('/').get(isLogin,getPostofFollowing);
router.route('/comment/:id').put(isLogin,commentOnPost).delete(isLogin,deleteComment);

module.exports=router;