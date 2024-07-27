const User = require("../model/user.js");
const express=require("express");
const app=express();

const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
app.use(cors()); 


module.exports.login= async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.find({ email });
      console.log(user);
      if (user.length == 0) {
        var isMatch = await bcrypt.compare(password, password);
      } else {
        var isMatch = await bcrypt.compare(password, user[0].password);
      }
      if (user.length == 0 || !isMatch) {
        return res.status(400).json({ message: "Invalid username or password" });
      } else {
        res.status(200).json({
          message: "Login successful",
          user: {
            _id: user._id,
            username: req.body.username,
            email: req.body.email,
            sessionId: req.sessionID,
          },
        });
      }
    } catch (error) {
      console.log("Error: " + error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  }

module.exports.signup=async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const user = await User.find({ email });
  
      if (user.length != 0) {
        console.log(user);
        return res.status(400).json({ message: "User already Exists" });
      }
      const hashPassword = await bcrypt.hash(password, 10);
      const createUser = new User({
        username: username,
        email: email,
        password: hashPassword,
      });
      await createUser.save();
      res.status(201).json({
         message: "User created Successfully" ,
         user: {
          _id: user._id,
          username: req.body.username,
          email: req.body.email,
          sessionId: req.sessionID,
        },});
    } catch (err) {
      console.log(err);
      if(err.errmsg === `E11000 duplicate key error collection: test.users index: username_1 dup key: { username: "xyz" }`){
        res.status(500).json({ message: "Username already Exists" });  
      }else{
        res.status(500).json({ message: "Internal Server Error" });
      } 
    }
  }

module.exports.sendEmail=(req, res) => {
    const { userEmail, idea, inquiry, orderSize,userPhone } = req.body;
    console.log('mail ok ');
    // Define email options
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      // host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
            user: process.env.EMAIL,
          pass:  process.env.EMAIL_PASS
      }
    });
    const mailOptions = {
      from: userEmail,
      to: process.env.EMAIL_TO, // Your email address where the email will be sent
      subject: 'New Query From User',
      text: `
        User Email: ${userEmail}\n
        Idea: ${idea}\n
        Inquiry: ${inquiry}\n
        Order Size: ${orderSize}\n
        userPhone: ${userPhone}
      `,
      html: `
        <h3>User Query</h3>
        <p><strong>User Email:</strong> ${userEmail}</p>
        <p><strong>Idea:</strong> ${idea}</p>
        <p><strong>Inquiry:</strong> ${inquiry}</p>
        <p><strong>Order Size:</strong> ${orderSize}</p>
        <p><strong>User Contact no.: </strong>${userPhone}</p>
      `
    };
  
    // Send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).send('Error sending email');
      }
      console.log('Email sent:', info.response);
      res.status(200).send('Email sent successfully');
    });
  }