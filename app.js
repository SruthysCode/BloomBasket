const env = require("dotenv");
env.config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URL, { dbName: "bloomBasket" });

const express = require("express");
var app = express();
const nocache = require("nocache");
var session = require("express-session");
const config = require("./config/config");
const oneDay = 1000 * 60 * 60 * 24;
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    cookie: { maxAge: oneDay },
    saveUninitialized: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(nocache());
const flash = require("express-flash");
app.use(flash());
app.set("view engine", "ejs");
app.set("views", "./views"); // where is views kept

app.use(function (req, res, next) {
  res.locals.message = req.flash;
  next();
});
const path = require("path");
app.use('/static', express.static(path.join(__dirname, '/public')));

const userRoute = require("./route/userRoute");
app.use("/", userRoute);

const adminRoute = require("./route/adminRoute");
app.use("/admin", adminRoute);
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log("Server at..... http://localhost:" + PORT);
});
