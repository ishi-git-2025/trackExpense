import user from "../models/userModel.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export default async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Not authorized or token missing" });
    }
    const token = authHeader.split(" ")[1];

    // Verify token
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const userDetails = await user.findById(payload.userId).select("-password");

        if(!userDetails) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        req.user = userDetails; // Attach user details to request object
        next(); 
    }
    catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }

}
