import express from 'express'
import { registerController, loginController, logoutController, updateController, checkAuth} from '../controllers/auth.controller.js'
import { protectRoute } from '../middleware/auth.protectRoute.js'


const authRouter = express.Router()

// register
authRouter.post('/register', registerController);

// login
authRouter.post('/login', loginController);

// clears cookies and token
authRouter.post('/logout', logoutController);

// checks if authenticated, then calls next to update
authRouter.put('/update-profile', protectRoute, updateController);

// for page refreshes (to profile or login page)
authRouter.get('/checkAuth', protectRoute, checkAuth);

export default authRouter;