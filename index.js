const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const nodemailer = require('nodemailer');
const cors = require("cors");
const app = express();
const bcrypt = require("bcrypt");

dotenv.config();

const port = process.env.PORT;
const mongo_url = process.env.MONGO_URL;

const User = require("./model/user.js");
const path = require("path");
const userRouter=require("./routes/user.js");

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Middleware to parse JSON bodies

app.use(cors()); // Allow cross-origin requests

const session = require("express-session");
const MongoStore = require("connect-mongo");

const store = MongoStore.create({
  mongoUrl: mongo_url,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 60 * 60,
});

store.on("error", () => {
  console.log("ERROR in Mongo Session Store", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, //expiry of cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // expiry of cookies
    httpOnly: true, // only for security purpose nothing else
  },
};

app.use(session(sessionOptions));

// Connect to MongoDB
mongoose
  .connect(mongo_url)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });


app.use("/",userRouter);


app.all('*',(req,res)=>{
  res.status(404).json({ message: "Path Doesn't exist" });
})

app.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});
