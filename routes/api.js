const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const blogController = require('../controllers/blogController');

//Login
router.post('/login', authController.login);

//Register
router.post('/signup', authController.register);

//Get all the blogs
router.get('/blog', blogController.get_blogs);

//Post blog
router.post('/blog', authController.verifyToken, blogController.post_blog);

//Get a blog
router.get('/blog/:id', authController.verifyToken, blogController.get_blog);

//Post comment
router.post('/blog/:id', authController.verifyToken, blogController.post_comment);

//Update blog
router.put('/blog/:id', authController.verifyToken, blogController.update_blog);

//Delete blog
router.delete('/blog/:id', authController.verifyToken, blogController.delete_blog);

//Update comment
router.put('/blog/:blogid/comment/:id', authController.verifyToken, blogController.update_comment);

//Delete comment
router.delete('/blog/:blogid/comment/:id', authController.verifyToken, blogController.delete_comment);


module.exports = router;