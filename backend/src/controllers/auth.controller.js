import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import { generateToken } from '../lib/utils.js'
import cloudinary from '../lib/cloudinary.js'

export const registerController = async (req, res) => {

    const { fullName, email, password } = req.body;
    try {

        if (!fullName || !email || !password) {
            return res.status(400).json({msg: 'Missing full name, email or password'});
        }

        if (password.length < 6) {
            return res.status(400).json({message: "Password must be at least 6 characters"});
        }

        // check email valid
        const user = await User.findOne({email})
        if (user) return res.status(400).json({msg : "Email already exists"});

        // hash password 
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // create new user
        const newUser = new User({
            fullName: fullName,
            email: email,
            password: hashedPassword
        })

        // check if creation is valid
        if (newUser) {
            
            // generate JWT
            generateToken(newUser._id, res)
            
            await newUser.save()

            res.status(201).json({
                _id: newUser._id, 
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            })

        } else {
            res.status(400).json({msg: "Invalid user data"});
        }

    } catch (error) {
        console.log('Error in signup controller: ', error.mesage);
        res.status(500).json({msg: 'Internal Server Error'});
    }
};

export const loginController = async (req, res) => {

    const { email, password } = req.body
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg : 'Invalid credentials' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({msg: 'Invalid credentials'});
        }

        generateToken(user._id, res)
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        });

    } catch (error) {
        console.log('Error in login controller: ', error.message);
        res.status(500).json({msg: 'Internal server error'});
    }
};

export const logoutController = (req, res) => {
    try {
        // clear out cookies 
        res.cookie('jwt', '', {maxAge:0})
        res.status(200).json({msg:'Logged out successfully'});
    } catch (error) {
        console.log('Error in logout controller: ', error.message);
        res.status(500).json({msg: 'internal server error'});
    }
};

export const updateController = async (req, res) => {
    try {
        // grab the profile picture and userId (mongo)
        const {profilePic} = req.body;
        const userId = req.user._id;

        // check if picture is valid
        if (!profilePic) {
            res.status(400).json({msg: 'Profile picture is required'});
        }
        // upload to cloudinary, cloudinary returns an object with secure url to uploaded picture
        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        // find user, update profile pic in MongoDB, return updated user
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {new:true});
        res.status(200).json(updatedUser);
    } catch (error) {
        console.log('Error in update profile: ', error.message);
        res.status(500).json({msg: 'Internal Server Error'});
    }
};

export const checkAuth = (req, res) => {

    // protectRoute middleware already called
    // assigned req.user if successful
    try {
        res.status(200).json(req.user);
    // no such req.user field, thus protectRoute middleware caught error 
    } catch (error) {
        console.log('Error in checkAuth controller: ', error.message);
        res.status(500).json({msg: 'Internal Server Error'});
    }
    
};