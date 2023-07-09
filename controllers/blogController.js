const Blog = require('../models/blog');
const Comment = require('../models/comment');
const mongoose = require('mongoose');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const get_blogs = asyncHandler(
    async (req, res) => {
        const blogs = await Blog.find({}, {date : 0, comments : 0}).populate('author', {username : 1}).exec();
        res.json({blogs});
    }
)

const post_blog = [
    body('title')
    .isLength({min : 1})
    .withMessage("Title should have at least 1 character"),
    asyncHandler(
        async (req, res) => {
            const error = validationResult(req);
            
            if (!error.isEmpty()){
                res.status(403).json(
                    {
                        err : error.array().map(i => i.msg)
                    }
                )
            }

            const window = new JSDOM('').window;
            const DOMPurify = createDOMPurify(window);
            const clean = DOMPurify.sanitize(req.body.body);

            const blog = new Blog(
                {
                    title : req.body.title,
                    body : clean,
                    author : req.user._id,
                    date : Date.now()
                }
            );

            await blog.save();
            res.json({
                msg : "Blog posted."
            })
        }
    )
]

const get_blog = asyncHandler(
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)){
            res.status(404).json(
                {
                    err : ['Blog is invalid.']
                }
            );
            return;
        }

        const blog = await Blog.findById(req.params.id).populate("comments").populate("author", {username : 1}).exec();

        if (blog === null){
            res.status(404).json({
                err : ['Blog not found.']
            });
            return;
        }

        res.json({
            blog
        });
    }
)

const post_comment = asyncHandler(
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)){
            res.status(404).json(
                {
                    err : ['Blog is invalid.']
                }
            );
            return;
        }

        const blog = await Blog.findById(req.params.id).exec();

        if (blog === null){
            res.status(404).json({
                err : ['Blog not found.']
            });
            return;
        }

        const window = new JSDOM('').window;
        const DOMPurify = createDOMPurify(window);
        const clean = DOMPurify.sanitize(req.body.content);


        const comment = new Comment(
            {
                content : clean,
                author : req.user._id,
                date : Date.now()
            }
        );

        blog.comments.push(comment);
        await comment.save();
        await blog.save();

        res.json({
            msg : "Comment posted."
        })
    }
)

const update_blog = [
    body('title')
    .isLength({min : 1})
    .withMessage("Title should have at least 1 character"),
    asyncHandler(
        async (req, res) => {
            const error = validationResult(req);
            
            if (!error.isEmpty()){
                res.status(403).json(
                    {
                        err : error.array().map(i => i.msg)
                    }
                )
            }

            if (!mongoose.isValidObjectId(req.params.id)){
                res.status(404).json(
                    {
                        err : ['Blog is invalid.']
                    }
                );
                return;
            }

            const blog = await Blog.findById(req.params.id).exec();

            if (blog === null){
                res.status(404).json({
                    err : ['Blog not found.']
                });
                return;
            }

            if (blog.author._id.toString() !== req.user._id){
                res.status(403).json({
                    err : ['Unauthorized.']
                });
                return;
            }

            const window = new JSDOM('').window;
            const DOMPurify = createDOMPurify(window);
            const clean = DOMPurify.sanitize(req.body.body);

            blog.title = req.body.title;
            blog.body = clean;

            await blog.save();
            res.json({
                msg : "Blog updated."
            })
        }
    )
]

const delete_blog = asyncHandler(
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)){
            res.status(404).json(
                {
                    err : ['Blog is invalid.']
                }
            );
            return;
        }

        const blog = await Blog.findById(req.params.id).exec();

        if (blog === null){
            res.status(404).json({
                err : ['Blog not found.']
            });
            return;
        }

        if (blog.author._id.toString() !== req.user._id){
            res.status(403).json({
                err : ['Unauthorized.']
            });
            return;
        }

        await Comment.deleteMany({ _id: { $in: blog.comments.map(i => i._id.toString())}});;
        await Blog.findByIdAndRemove(req.params.id).exec();
        res.json(
            {
                msg : "Blog deleted."
            }
        );
    }
)

const update_comment = asyncHandler(
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.blogid)){
            res.status(404).json(
                {
                    err : ['Blog is invalid.']
                }
            );
            return;
        }

        const blog = await Blog.findById(req.params.blogid).exec();

        if (blog === null){
            res.status(404).json({
                err : ['Blog not found.']
            });
            return;
        }

        const window = new JSDOM('').window;
        const DOMPurify = createDOMPurify(window);
        const clean = DOMPurify.sanitize(req.body.content);

        if (!mongoose.isValidObjectId(req.params.id)){
            res.status(404).json(
                {
                    err : ['Comment is invalid.']
                }
            );
            return;
        }

        const comment = await Comment.findById(req.params.id).exec();

        if (comment === null){
            res.status(404).json({
                err : ['Comment not found.']
            });
            return;
        }

        if (comment.author._id.toString() !== req.user._id){
            res.status(403).json({
                err : ['Unauthorized.']
            });
            return;
        }

        comment.content = clean;
        await comment.save();

        res.json({
            msg : "Comment updated."
        })
    }
)

const delete_comment = asyncHandler(
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.blogid)){
            res.status(404).json(
                {
                    err : ['Blog is invalid.']
                }
            );
            return;
        }

        const blog = await Blog.findById(req.params.blogid).exec();

        if (blog === null){
            res.status(404).json({
                err : ['Blog not found.']
            });
            return;
        }

        if (!mongoose.isValidObjectId(req.params.id)){
            res.status(404).json(
                {
                    err : ['Comment is invalid.']
                }
            );
            return;
        }

        const comment = await Comment.findById(req.params.id).exec();

        if (comment === null){
            res.status(404).json({
                err : ['Comment not found.']
            });
            return;
        }

        if (comment.author._id.toString() !== req.user._id){
            res.status(403).json({
                err : ['Unauthorized.']
            });
            return;
        }

        blog.comments = blog.comments.filter(i => i._id.toString() !== req.params.id);

        await blog.save();
        await Comment.findByIdAndRemove(req.params.id).exec();

        res.json({
            msg : "Comment deleted."
        })
    }
)

module.exports = {
    get_blogs,
    post_blog,
    get_blog,
    post_comment,
    update_blog,
    delete_blog,
    update_comment,
    delete_comment
}