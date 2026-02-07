const User = require("../models/user");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require("dotenv").config();

const registerUser = async (req,res)=>{
    try {
        const { email, password } = req.body;
        const checkUser = await User.findOne({ $or : [{email}]});
        if(checkUser){
            return res.status(400).json({
                success: false,
                message: "Another user exists with the same email"
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashpass = await bcrypt.hash(password, salt);

        const newlyCreatedUser = User({
            
            email,
            password: hashpass,
            
        });

        await newlyCreatedUser.save();

        if(newlyCreatedUser){
            res.status(201).json({
                success: true,
                message: "user created successfully"
            })
        }else{
            res.status(400).json({
                success: false,
                message: "something went wrong"
            })
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Error occurred. Try again"
        })
    }
}


const loginUser = async (req,res)=>{
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                success: false,
                message: "invalid"
            })
        }else{
            const checkPassword = await bcrypt.compare(password, user.password);
            if(!checkPassword){
                return res.status(400).json({
                    success: false,
                    message: "email and password do not match"
                })
            }else{
                const accessToken = jwt.sign({
                    userID : user._id,
                    email : user.email
                }, process.env.JWT_SECRET_KEY,{
                    expiresIn: 100000
                });

                res.status(200).json({
                    success: true,
                    message: "Login successful",
                    accessToken
                })
            }
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Error occurred. Try again"
        })
    }
}

module.exports = {registerUser, loginUser};