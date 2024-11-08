const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const registerUser = async (req, res) => {
    const signupBody =  zod.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
        profile: z.string().optional().url(),
      });
  
    const { success } = signupBody.safeParse(req.body);
    if (!success) {
      return res.status(411).json({
        success: false,
        message: "Please enter correct inputs",
      });
    }
    try {
      const { name, email, password, profile } = req.body;
  
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        return res.status(411).json({
          success: false,
          message: "Email already taken, please try with another Email",
        });
      }
  
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
  
      const user = await User.create({
        name,
        email,
        password: hash,
        profile,
      });
      const token = jwt.sign(
        {
          _id: user._id,email: user.email
        },
        process.env.TOKEN_SECRET
      );
  
      return res.status(201).json({
        success: true,
        message: `Welcome, ${user.name}`,
        token: token,
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e,
      });
    }
  };
  
  const loginUser = async (req, res) => {
    const signinBody = zod.object({
      email: z.string().email(),
       password: z.string().min(6),
    });
  
    const { success } = signinBody.safeParse(req.body);
    if (!success) {
      return res.status(411).json({
        success: false,
        message: "Please enter correct inputs",
      });
    }
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({
        email,
      });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Please enter valid Email",
        });
      }
  
      const userPassword = bcrypt.compareSync(password, user.password);
  
      if (!userPassword) {
        return res.status(400).json({
          success: false,
          message: "Invalid Password",
        });
      }
  
      const token = jwt.sign({ _id: user._id,email: user.email }, process.env.TOKEN_SECRET);
      res.json({
         success: true,
        message: `Welcome, ${user.name}`,
        token,
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };

  const updateUserProfile = async (req,res) =>{
    const updateBody =  zod.object({
        name: z.string(),
        profile: z.string().optional().url(),
      });
  
    const { success } = updateBody.safeParse(req.body);
    if (!success) {
      return res.status(411).json({
        success: false,
        message: "Please enter correct inputs",
      });
    }
  
  try {
    const user = req.user;
    if (!user) {
        return res.status(400).json({
            success: false,
            message: "Invalid user",
        });
    }

    const updateUser = await User.findById(user._id);
    if (!updateUser) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }
    const { name, profile } = req.body;
    if (name) updateUser.name = name;
    if (profile) updateUser.profile = profile;
    const updatedUser = await updateUser.save();

    res.status(200).json({
        success: true,
       message: "Profile Updated Successfully"
     });
  } catch (error) {
    res.status(500).json({
        success: false,
        message: "An error occurred while updating profile",
        error: error.message,
    });
  }
}

const updateUserRole = async (req, res) => {
  
    try {
      const { userId, role } = req.body;
  
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({
              success: false,
              message: "User not found",
          });
      }
      if(role)  user.role = role;
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "User role updated successfully"
      });
    } catch (error) {
      res.status(500).json({
         success: false, 
         message: error.message
         });
    }
  };

  const updateUserStatus = async (req, res) => {
  
    try {
      const { userId, isActive } = req.body;
  
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({
              success: false,
              message: "User not found",
          });
      }
      if(isActive)  user.isActive = isActive;
      await user.save();
  
      res.status(200).json({
        success: true,
        message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message
     });
    }
  };

  const forgotPassword = async (req, res) => {
    const forgotPasswordSchema = zod.object({
      email: zod.string().email(),
    });
  
    const validation = forgotPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        errors: validation.error.issues,
      });
    }
  
    try {
      const { email } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ 
            success: false,
             message: "User not found" 
            });
      }
      const resetToken = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; 
      await user.save();
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_USER,
        subject: 'Password Reset',
        text: `You requested a password reset. Please click the following link or paste it into your browser to reset your password:\n\n
        http://${req.headers.host}/api/user/reset-password/${resetToken}\n\n
        If you did not request this, please ignore this email.`,
      };
      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error sending email' });
        }
        res.status(200).json({ success: true, message: 'Password reset link sent to email' });
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  const resetPassword = async (req, res) => {
    const resetPasswordSchema = zod.object({
      token: zod.string(),
      newPassword: zod.string().min(6),
    });
  
    const validation = resetPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid inputs",
        errors: validation.error.issues,
      });
    }
  
    try {
      const { token, newPassword } = req.body;
  
      
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Password reset token is invalid or has expired",
        });
      }
  
     
      user.password = await bcrypt.hash(newPassword, 10);
      user.resetPasswordToken = undefined; 
      user.resetPasswordExpires = undefined; 
  
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "Password has been reset successfully",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  module.exports = { registerUser, loginUser, updateUserProfile, updateUserRole,updateUserStatus, resetPassword, forgotPassword };