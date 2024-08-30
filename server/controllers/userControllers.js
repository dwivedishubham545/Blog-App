const becrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const {v4: uuid} = require('uuid')

const User = require('../models/userModel')
const HttpError = require('../models/errorModel')


// ====================== Register New User =================== //
// POST : api/users/register
// UNPROTECTED

const registerUser = async(req, res, next) => {
    try {
        const {name, email, password, confirmPassword } = req.body;
        if(!name || !email || !password){
            return next(new HttpError("Fill in all fields", 422))
        }

        const newEmail = email.toLowerCase()
        const emailExists = await User.findOne({email: newEmail})

        if(emailExists){
            return next(new HttpError("Email already exists", 422))
        }

        if(password.trim().length < 6){
            return next(new HttpError("Password must be at least 6 characters", 422))
        }

        if(password !== confirmPassword){
            return next(new HttpError("Passwords do not match", 422))
        }

        const salt = await becrypt.genSalt(10)
        const hashedPassword = await becrypt.hash(password, salt);

        const newUser = await User.create({name, email: newEmail, password: hashedPassword})
        res.status(201).json(`New user ${newUser.email} registered.`)


    } catch (error) {
        return next(new HttpError("User Registration Failed", 422))
    }
}







// ================= Login A Registered USer ================= //
// POST : api/users/login
// UNPROTECTED
const loginUser = async(req, res, next) => {
    try {
        const {email, password}= req.body;

        if(!email || !password){
            return next(new HttpError("Fill in all fields", 422))
        }
        const newEmail = email.toLowerCase();

        const user = await User.findOne({email: newEmail})
        if(!user){
            return next(new HttpError("Invalid Credentials.", 422))   
        }

        const comparePass = await becrypt.compare(password, user.password)
        if(!comparePass){
            return next(new HttpError("Invalid Credentials.", 422))
        }

        const {_id: id, name} = user;
        const token = jwt.sign({id, name}, process.env.JWT_SECRET, {expiresIn: "1d"})

        res.status(200).json({token, id, name})
    } catch (error) {
        return next(new HttpError("Login Failed. Please check your credentials.", 422))
    }
}







// ====================== User Profile =================== //
// POST : api/users/:id
// PROTECTED
const getUser = async(req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password');
        if(!user){
            return next(new HttpError("User not found.", 404))
        }
        res.status(200).json(user);

    } catch (error) {
        return  next(new HttpError("Failed to fetch user profile.", 422))
    }
}





// ====================== Change User Avatar (Profile Picture)=================== //
// POST : api/users/change-avatar
// PROTECTED
const changeAvatar = async(req, res, next) => {
    try {
        if(!req.files.avatar){
            return next(new HttpError("Please select an image.", 422))
        }

        const user = await User.findById(req.user.id)

        if(user.avatar){
            fs.unlink(path.join(__dirname, '..', 'uploads', user.avatar), (err) => {
                if(err){
                    return  next(new HttpError(err))
                }
            })
        }
        const {avatar} = req.files;
        if(avatar.size > 500000){
            return next(new HttpError("Avatar size should not exceed 500KB", 422))
        }
        let fileName;
        fileName = avatar.name;
        let splittedFileName = fileName.split('.')
        let newFilename = splittedFileName[0] + uuid() + '.' + splittedFileName[splittedFileName.length - 1]
        avatar.mv(path.join(__dirname, '..', 'uploads', newFilename), async (err) => {
            if(err){
                return next(new HttpError(err))
            }
        })
        const updatedAvatar = await User.findByIdAndUpdate(req.user.id, {avatar: newFilename}, {new: true})
        if(!updatedAvatar){
            return next(new HttpError("Avatar could not be changed.", 422))
        }
        res.status(200).json(updatedAvatar)
    } catch (error) {
        return next(new HttpError(error))
    }
}







// ====================== Edit User Detail (form profile) =================== //
// POST : api/users/edit-user
// PROTECTED
const editUser = async(req, res, next) => {
    try {
        const {name, email, currentPassword, newPassword, confirmNewPassword} = req.body;
        if(!name || !email || !currentPassword || !newPassword){
            return next(new HttpError("Please fill all fields.", 422))
        }
        const user = await User.findById(req.user.id)
        if(!user){
            return next(new HttpError("User not found.", 403))
        }
        const emailExists = await User.findOne({email});
        if(emailExists && emailExists._id != req.user.id){
            return next(new HttpError("Email already exists.", 422))  
        }
        // compare current password to db password
        const validateUserPassword = await becrypt.compare(currentPassword, user.password)
        if(!validateUserPassword){
            return next(new HttpError("Current password is incorrect.", 422))
        }
        // check if new password and confirm password match
        if(newPassword != confirmNewPassword){
            return next(new HttpError("New password and confirm password do not match.", 422))
        }

        const salt = await becrypt.genSalt(10)
        const hashedPassword = await becrypt.hash(newPassword, salt);

        const newInfo = await User.findByIdAndUpdate(req.user.id, {name, email, password: hashedPassword}, {new: true})
        res.status(200).json(newInfo)

    } catch (error) {
        return next(new HttpError(error))
    }
}







// ====================== Get Authors =================== //
// POST : api/users/authors
// UNPROTECTED
const getAuthors = async(req, res, next) => {
    try {
        const authors = await User.find().select('-password');
        res.status(200).json(authors);
    } catch (error) {
        return next(new HttpError("Failed to fetch authors.", 422))

    }
}


module.exports = {registerUser, loginUser, getUser, changeAvatar, editUser, getAuthors}