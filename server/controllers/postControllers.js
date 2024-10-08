const Post = require('../models/postModel')
const User = require('../models/userModel')
const path = require('path')
const fs = require('fs')
const {v4: uuid} = require('uuid')
const HttpError = require('../models/errorModel')






// =========================== Create Post===================//
// POST : api/posts
// Protected
const createPost = async (req, res, next) => {
    try {
        let {title, category, description} = req.body;
        if(!title || !category || !description || !req.files){
            return next(new HttpError('Please fill in all fields', 422))
        }

        const {thumbnail} = req.files;
        //check file size 
        if(thumbnail.size > 2000000){
            return next(new HttpError('File size is too large', 422))
        }
        let fileName = thumbnail.name;
        let splittedFileName = fileName.split('.')
        let newFilename = splittedFileName[0] + uuid() + "." + splittedFileName[splittedFileName.length - 1]
        thumbnail.mv(path.join(__dirname, '..', '/uploads', newFilename), async(err) => {
            if(err){
                return next(new HttpError('Error uploading file', 422))
            }else{
                const newPost = await Post.create({title, category, description, thumbnail: newFilename, creator:  req.user.id})
                if(!newPost){
                    return next(new HttpError('Error creating post', 422))
                }
                // find user and increase post count by 1
                const currentUSer = await User.findById(req.user.id);
                const userPostCount = currentUSer.posts +1;
                await User.findByIdAndUpdate(req.user.id, {posts: userPostCount})
                
                res.status(201).json({message: 'Post created successfully', post: newPost})
            }
        })


    } catch (error) {
        return next(new HttpError(error))
    }
}




// =========================== Get Post===================//
// GET : api/posts
// UnProtected
const getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find().sort({updatedAt: -1})
        res.status(200).json({posts})
    } catch (error) {
        return next(new HttpError(error))
    }
}





// =========================== Get single Post===================//
// GET : api/posts/:id
// UnProtected
const getPost = async (req, res, next) => {
    try {
        const postId = req.params.id
        const post = await Post.findById(postId)
        if(!post){
            return next(new HttpError('Post not found', 404))
        }
        res.status(200).json({post})
    } catch (error) {
        return next(new HttpError(error))
    }
}





// =========================== Get post by Category===================//
// GET : api/posts/categories/:category
// Protected
const getCatPosts = async (req, res, next) => {
    try {
        const {category} = req.params;
        const catPosts = await Post.find({category}).sort({createdAt: -1})
        res.status(200).json({catPosts})
    } catch (error) {
        return next(new HttpError(error))
    }
}






// =========================== Get Author Post ===================//
// GET : api/posts/users/:id
// UnProtected
const getUserPosts = async (req, res, next) => {
    try {
        const {id} = req.params;
        const posts = await Post.find({creator: id}).sort({createdAt: -1})
        res.status(200).json({posts})
    } catch (error) {
        return next(new HttpError(error))

    }
}





// =========================== Edit Post ===================//
// PATCH : api/posts/:id
// Protected


const editPost = async (req, res, next) => {
    try {
        let fileName;
        let newFileName;
        let updatedPost;
        const postId = req.params.id;
        let {title, description, category} = req.body;

        if(!title || !category || description.length < 12){
            return next(new HttpError('Fill in all Fields',422))
        }

        const oldPost = await Post.findById(postId)
        if(req.user.id == oldPost.creator){
            if(!req.files){
                updatedPost = await Post.findByIdAndUpdate(postId, {title, category, description},{new: true})
            }
            else{
               fs.unlink(path.join(__dirname, '..', 'uploads', oldPost.thumbnail), async (err) => {
                    if (err) {
                        return next(new HttpError(err))
                    }                  
                }) 
                const {thumbnail} = req.files;
                    if(thumbnail.size > 2000000){
                        return next(new HttpError('File size is too large', 422))
                    }
                    fileName = thumbnail.name;
                    let splittedFilename = fileName.split('.')
                    newFileName = splittedFilename[0] +  uuid() +'.' + splittedFilename[splittedFilename.length - 1]
                    thumbnail.mv(path.join(__dirname, '..', 'uploads', newFileName), async (err) => {
                        if (err) {
                            return next(new HttpError(err))
                        }
                    })
    
                    updatedPost = await Post.findByIdAndUpdate(postId, {title, category, description, thumbnail: newFileName}, {new: true})
        }
    }
        if(!updatedPost){
            return next (new HttpError("Could not update", 400))
        }
        res.status(200).json(updatedPost)
    } catch (error) {
        return  next(new HttpError(error))

    }
}




// =========================== Delete Post ===================//
// DELETE : api/posts/:id
// Protected
const deletePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        if(!postId){
            return next(new HttpError('Post Unavailable', 400))
        }
        const post = await Post.findById(postId);
        const fileName = post?.thumbnail;

        if(req.user.id == post.creator){
            fs.unlink(path.join(__dirname, '..', 'uploads', fileName), async(err) => {
                if (err) {
                    return next(new HttpError(err))
                }else{
                    await Post.findByIdAndDelete(postId);
                    const currentUser = await User.findById(req.user.id);
                    const userPostCount = currentUser?.posts - 1;
                    await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });
                    res.json(`Post ${postId} deleted successfully.`)
                }
            })
        }else{
            return next(new HttpError('You are not the creator of this post', 403))
        }
    } catch (error) {
        return next (new HttpError(error))
    }
}





module.exports = {createPost, getPosts, getPost, getCatPosts, getUserPosts, editPost, deletePost}
