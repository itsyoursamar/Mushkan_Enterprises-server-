const express=require("express");
const app=express();

const router = express.Router();

const path = require("path");
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Middleware to parse JSON bodies
const User = require("../model/user.js");

const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const cors = require("cors");
const dotenv = require("dotenv");
const { signup, sendEmail } = require("../controller/user.js");
dotenv.config();
app.use(cors()); 

const userController=require("../controller/user.js");

router.get("/", (req, res) => {
    res.send("ok");
  });


// Signup route
router.post("/signup", userController.signup);

//login route
router.post("/login", userController.login);
  
//email route
router.post('/send-email', userController.sendEmail);


module.exports=router;