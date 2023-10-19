const User = require("../model/userModel");

const isLogin = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      next();     
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      next();
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const checkBlocked = async (req, res, next) => {
  try {
    const userid = req.session.user_id;
    const userdata = await User.findOne({ _id: userid });
    if (userdata && userdata.blocked == true) {
      console.log("Blocked by ADMIN");
      res.locals.blocked = true;
      req.session.user_id.destroy();
      res.redirect("/login");
    } else {
      res.locals.blocked = false;
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  isLogin,
  isLogout,
  checkBlocked,
};
