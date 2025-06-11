import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js"

export const authenticateUser = async (req,res,next) => {

    const token = req.headers.authorization?.split(" ")[1]

    if(!token) {
        return res.status(401).json({ message: "Access Denied: No Token" })
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()

    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }

}