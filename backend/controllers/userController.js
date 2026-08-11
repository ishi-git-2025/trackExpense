import user from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = "your_jwt_secret_key";
const TOKEN_EXPIRATION = "24h";

const createToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
}

//register user
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Please fill all the fields" });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: "Please enter a valid email" });
    }
    if (password.length < 8) {
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }
    try {
        if (await user.findOne({ email })) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashed = await bcrypt.hash(password, 10);
        const newUser = await user.create({ name, email, password: hashed });
        const token = createToken(newUser._id);

        return res.status(201).json({
            success: true, message: "User registered successfully",
            user: { id: newUser._id, name: newUser.name, email: newUser.email },
            token
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// login user
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Please fill all the fields" });
    }
    try {
        const existingUser = await user.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ success: false, message: "User does not exist" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = createToken(existingUser._id);
        return res.status(200).json({
            success: true, message: "User logged in successfully",
            user: { id: existingUser._id, name: existingUser.name, email: existingUser.email },
            token
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// get user details
export const getUserDetails = async (req, res) => {
    const userId = req.user.id;
    try {
        const existingUser = await user.findById(userId).select("name email");
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, existingUser });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// update user details
export const updateProfile = async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ success: false, message: "Name or email is required" });
    }
    try {
        const existingUser = await user.findOne({ email, _id: req.user.id });
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const updatedUser = await user.findByIdAndUpdate(
            req.user.id,
            { name, email },
            { returnDocument: "after", runValidators: true, select: "name email" }
        );
        return res.status(200).json({
            success: true, message: "User details updated successfully",
            updatedUser
        });

    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// to change password
export const updatePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword || newPassword.length < 8) {
        return res.status(400).json({ success: false, message: "Password invalid or too short" });
    }
    try {
        const existingUser = await user.findById(req.user.id);
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(oldPassword, existingUser.password); //bcrypt generate a hash of oldPassword and compare it with the hash stored in the database for the user.
        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: "old password is incorrect" });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        existingUser.password = hashed;
        await existingUser.save();
        return res.status(200).json({ success: true, message: "Password updated successfully" });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
