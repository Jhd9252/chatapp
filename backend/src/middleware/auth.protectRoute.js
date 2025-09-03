import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

export const protectRoute = async (req, res, next) => {
    
    try {

        // parse the cookies given in request for JWT
        const token = req.cookies.jwt

        // check if token exists
        if (!token) {
            return res.status(401).json({msg: 'Not Authenticated - No Token Provided'})
        }
 
        // check if token is valid, signed
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // check if token is valid, not expired
        if (!decoded) {
            return res.status(401).json({msg: 'Unauthorized - Invalid Token'});
        }

        // get the user in database by ID, deselect password retrieval
        const user = await User.findById(decoded.userId).select('-password');

        // check if user if found 
        if (!user) {
            return res.status(404).json({msg: 'User not found'});
        }

        // add user field to request
        req.user = user

        // call next function
        next()

    } catch (error) {
        console.log('Error in protectRoute middleware: ', error.message)
        res.status(500).json({msg: 'Error in protected route handler'});
    }
}