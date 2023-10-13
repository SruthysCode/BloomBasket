const User = require("../model/userModel");
const Product = require("../model/productModel");
const Otp = require("../model/otpModel");
const Cart = require("../model/cartModel");
const Order = require("../model/orderModel");
const Category = require("../model/categoryModel");
const Address = require("../model/addressModel");
const Coupon = require("../model/couponModel");

const nodemailer = require("nodemailer");
const Swal = require("sweetalert");

const moment = require("moment");
var easyinvoice = require("easyinvoice");
const fs = require("fs");

const config = require("../config/config");
const bcrypt = require("bcrypt");
const { use } = require("../route/userRoute");
const session = require("express-session");
// encrypt password
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};
//User home page
const loadHome = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const totalPages = req.body.limit || 1;
    const product = await Product.find({});
    const category = await Category.find({});
    const user = await User.findOne({ _id: user_id });
    //  console.log("USER ::: "+ user_id,user)
    //  console.log("user session :: "+ user_id)

    if (user) {
      console.log("user id: " + req.session.user_id);
      const CartCount = user.cart.length || 0;
      res.render("home", {
        product,
        user: user_id,
        totalPages: totalPages,
        category: category,
        CartCount,
      });
    } else {
      res.render("home", {
        product,
        user: user_id,
        totalPages: totalPages,
        category: category,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
// Sign up
const signUp = async (req, res) => {
  try {
    const category = await Category.find({});
    res.render("signup", { user: req.session.user_id, category: category });
  } catch (error) {
    console.log(error.message);
  }
};

// Add users
const insertUser = async (req, res) => {
  try {
    const category = await Category.find({});
    const email = req.body.email;
    const sec_password = await securePassword(req.body.password);
    const checkuser = await User.findOne({ email: email });

    if (checkuser) {
      res.render("/signup", {
        message: "Email already exists",
        user: req.session.user_id,
        category: category,
      });
    } else {
      const user = new User({
        name: req.body.name,
        email: email,

        mobile: req.body.mobile,
        password: sec_password,
        blocked: false,
        is_verified: false,
        wallet: 0,
      });
      // console.log(user)
      const userData = await user.save();

      if (userData) {
        sendOtp(req.body.name, req.body.email, userData._id);
        res.redirect(`/otp/user_id=${userData._id}`);
      } else {
        res.render("/signup", {
          message: "Registration failed !!!",
          user: null,
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const resendOtp = async (req, res) => {
  try {
    console.log(
      "in resend >>" + req.body.user_id,
      req.query.user_id,
      req.params.user_id
    );
    const userData = await User.find({ _id: req.query.user_id });

    console.log(
      "resend ::" + userData,
      userData[0].name,
      userData[0],
      userData.user_id
    );
    sendOtp(userData[0].name, userData[0].email, userData[0]._id);
    res.redirect(`/otp/user_id=${userData[0]._id}`);
  } catch (error) {
    console.log(error.message);
  }
};
// Send OTP to mail after signup
const sendOtp = async (name, email, user_id) => {
  try {
    const category = await Category.find({});
    console.log("name,email,id" + name, email, user_id);
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.mailUsername || "sruthyrobin@gmail.com",
        pass: process.env.mailPassword || "qpanwgabccnonknj",
      },
    });
    const otp = `${Math.floor(10000 + Math.random() * 9000)}`;
    console.log("OTP is >>" + otp);
    //mail option
    const mailOptions = {
      from: config.mailUsername,
      to: email,
      subject: "OTP Verification for Your Email",
      html:
        `<p> Hi, ` +
        name +
        `,Enter <b>${otp}</b> in the app to verify your email address and complete the sign in process</p>This code <b>expires in 1 hour</b>.</p>`,
    };
    //hash the otp
    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(otp, saltRounds);
    const newOtp = await new Otp({
      user_id: user_id,
      email: email,
      otp: hashedOtp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });
    console.log("OTTTPPP  : " + newOtp);
    //save otp record
    const otpsave = await newOtp.save();
    if (otpsave) {
      console.log("done>>>>");
    }
    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email has been sent: ", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

// Get OTP from email
const getOtp = async (req, res) => {
  try {
    const category = await Category.find({});
    const userid = req.params.user_id || req.query.user_id;
    res.render("getotp", { user_id: userid, user: null, category: category });
  } catch (error) {
    console.log(error.message);
  }
};
// verify for OTP
const verifyOtp = async (req, res) => {
  try {
    const category = await Category.find({});
    const user_id = req.body.user_id;
    const otp = req.body.otp;
    console.log("un,otp " + user_id, otp);
    const userid = user_id.substring("user_id=".length);
    console.log(userid);
    if (!userid || !otp) {
      if (true) {
        const message = `Empty otp details are not allowed.`;
        return res.render("userAlert", { message });
      }

      // throw Error("Empty otp details are not allowed");
    } else {
      const userOtpRecords = await Otp.find({ user_id: userid });
      console.log(userOtpRecords.length);
      if (userOtpRecords.length === 0) {
        throw new Error("Account record not exist or already verified");
      } else {
        const userOtpRecord = userOtpRecords[0];
        const expiresAt = userOtpRecord.expiresAt;
        const hashedOtp = userOtpRecord.otp;
        console.log(expiresAt);
        if (expiresAt < Date.now()) {
          // OTP record has expired
          await Otp.deleteMany({ user_id: userid });
          //res.render('/signup',{message:"OTP has expired "})
          throw new Error("Code has expired");
        } else {
          console.log("Otp is ::", otp);
          const validOtp = await bcrypt.compare(otp, hashedOtp);
          console.log(validOtp + "valid");
          if (!validOtp) {
            //alert("invalid otp")
            const errorMessage =
              "Custom error message: The OTP you entered is not valid. Please try again.";
            //res.status(400).send(errorMessage);
            //res.status(400).json({ success: false });
            //res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.'})
            //res.render('message',{title:'BloomBASKET',message:'Invalid OTP'})
            if (true) {
              const message = `Invalid OTP.`;
              return res.render("userAlert", { message });
            }

            // throw new Error("Invalid otp");
          } else {
            await User.updateOne(
              { _id: userid },
              { $set: { is_verified: true } }
            );
            await Otp.deleteMany({ user_id: userid });

            const cart = new Cart({
              user_id: userid,
              product: [],
            });
            await cart.save();

            const addr = new Address({
              user_id: userid,
              address: [],
            });
            await addr.save();

            console.log("awaiting...");
            res.redirect("/login");
          }
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// User login
const login = async (req, res) => {
  try {
    const category = await Category.find({});
    res.render("login", { message: "", user: null, category: category });
  } catch (error) {
    console.log(error.message);
  }
};
// Verify user login credentials
const verifylogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const totalPages = req.body.limit || 1;
    // console.log(email,password)
    console.log("is sesssion : ", req.session)
    const userData = await User.findOne({ email: email });
    const product = await Product.find({});
    const category = await Category.find({});
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (!userData.blocked && userData.is_verified) {
          console.log("Session is : ", req.session)
          req.session.user_id = userData._id;
          req.session.user = userData;
           console.log("Session : "+ req.session.user_id)
           console.log("session is : ", req.session," userData._id is :", userData._id)
            
           req.session.loggedIn = true;
          req.flash("success", "You're In ");
          //    await req.toastr.success("Successfully Logged","You're In ")
          console.log("Session log is  : " + req.session.loggedIn, req.flash);
          // console.log("Session req : "+ req)

          // if (req.session.loggedIn) {
          //     const message =`User found.`
          //     return  res.render('userAlert', { message });
          //       }

          const user = await User.findOne({ _id: userData._id });
          // console.log("in Verify login >"+user.cart)
          const CartCount = user.cart.length || 0;
          req.session.cartcount = CartCount;
          res.render("home", {
            user: userData,
            product: product,
            totalPages: totalPages,
            category: category,
            CartCount: req.session.cartcount,
          });
        } else {
          res.render("login", {
            message: "You have been blocked/not verified by Admin!!!",
            user: req.session.user_id,
            product: product,
            category: category,
          });
        }
      } else {
        res.render("login", {
          message: "Incorrect username and password",
          user: req.session.user_id,
          product: product,
          category: category,
        });
      }
    } else {
      res.render("login", {
        message: "Incorrect username and password",
        user: req.session.user_id,
        product: product,
        category: category,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
// forgot password
const forgotPassword = async (req, res) => {
  try {
    const category=await Category.find()
    res.render("forgotpassword", { user: req.session.user_id,category});
  } catch (error) {
    console.log(error.message);
  }
};
// update password
const updatePassword = async (req, res) => {
  try {
    const email = req.body.email;
    const sec_password = await securePassword(req.body.password);
    const user = await User.findOne({ email: email });
    const userData = await User.findByIdAndUpdate(
      { _id: user._id },
      { $set: { password: sec_password } }
    );
    if (userData) {
      res.redirect("/login", { user: req.session.user_id });
    } else {
      res.render("/forgotpassword", { user: req.session.user_id });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Product details
const viewProductdetails = async (req, res) => {
  try {
    const id = req.query.id;
    const user_id = req.session.user_id;
    const category = await Category.find({});
    const user = await User.findOne({ _id: user_id });
    const CartCount = user.cart.length;
    const productData = await Product.findOne({ _id: id });
    if (productData) {
      res.render("productdetails", {
        product: productData,
        user: req.session.user_id,
        category: category,
        CartCount,
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};
// User logout
const logout = async (req, res) => {
  try {
    req.session.destroy();
    // req.session.loggedIn=false
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};
//User Profile details
const getProfile = async (req, res) => {
  try {
    if (res.locals.blocked) {
      //alert("You are blocked by ADMIN")
      //await Swal("blo","sed","success")
      await Swal.fire({
        title: "Blocked",
        text: "You are blocked by ADMIN",
        icon: "error",
        confirmButtonText: "OK",
      });
    } else {
      console.log("in getprofile");
      const userData = await User.findOne({ _id: req.session.user_id });
      const category = await Category.find({});
      const user = await User.findOne({ _id: req.session.user_id });
      const CartCount = user.cart.length;
      const address = await Address.find({ user_id: req.session.user_id });
      console.log(
        "Address is : " + address,
        address[0].address,
        address[0].address[1],
        address[0].length
      );
      res.render("profile", { user: userData, address, category, CartCount });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Update profile of user
const updateProfile = async (req, res) => {
  try {
    const id = req.body.id;
    const name = req.body.name;
    console.log("in update profile");
    const email = req.body.email;
    const mobile = req.body.mobile;
    // console.log("in update ::"+ id,name,address,email,mobile)
    const addr = await Address.find({ user_id: req.session.user_id });
    const addressvalues = [];
    for (let i = 0; i < addr[0].address.length; ++i) {
      console.log("in looooop");
      let key = "address" + i;
      const addrvalue = req.body[key];
      addressvalues.push(addrvalue);
      console.log("addresss is " + i, addrvalue);
      console.log("array is :" + addressvalues);
    }
    const addr_upd = await Address.findOneAndUpdate(
      { user_id: id },
      { $set: { address: addressvalues } }
    );
    const userData = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { name: name, mobile: mobile } }
    );
    res.redirect("profile");
  } catch (error) {
    console.log(error.message);
  }
};
// update address of user
const updateAddress = async (req, res) => {
  try {
    console.log("Update address");
    const user = await User.findOne({ _id: req.session.user_id });
    const CartCount = user.cart.length;

    const id = req.body.id;
    const category = await Category.find({});
    const address = req.body.address;
    // console.log("in address ::"+ id,address)

    const useraddr = await Address.findOne({ user_id: id });
    if (useraddr) {
      const userData = await Address.findOneAndUpdate(
        { user_id: id },
        { $push: { address: address } }
      );
    } else {
      const addr = new Address({
        user_id: id,
        address: [address],
      });
      await addr.save();
    }
    const addr = await Address.find({ user_id: id });
    console.log(" After address updated >>");
    res.render("profile", {
      category,
      user: req.session.user_id,
      CartCount,
      address: addr,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// change user password
const changePassword = async (req, res) => {
  try {
    const id = req.body.id;
    const sec_password = await securePassword(req.body.password);
    const user = await User.findOne({ _id: id });
    const userData = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { password: sec_password } }
    );
    res.redirect("profile");
  } catch (error) {
    console.log(error.message);
  }
};

// Add products to cart
const addTocart = async (req, res) => {
  try {
    console.log("in addTocart");
    const product_id = req.body.id;
    const user_id = req.session.user_id;
    // console.log("to cart :"+product_id,user_id)
    const productData = await Product.findOne({ _id: product_id });
    if (productData.stock < 1) {
      if (true) {
        const message = `Out of stock. Cannot add to cart.`;
        return res.render("userAlert", { message });
      }
      // console.log('Out of stock. Cannot add to cart.' );
      return;
    }

    const productin = await User.findOne({
      _id: user_id,
      "cart.product": product_id,
    });
    // console.log("PRoduct IN ::"+productin)
    // console.log("PRoduct is : "+ product_id)
    if (productin) {
      const updatedCartItem = await User.findOneAndUpdate(
        { _id: user_id, "cart.product": product_id },
        { $inc: { "cart.$.qty": 1 } }
      );
      console.log("Item already in cart");
    } else {
      await User.findByIdAndUpdate(
        {
          _id: user_id,
        },
        {
          $push: {
            cart: {
              product: product_id,
              qty: 1,
            },
          },
        }
      );
    }
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

// get the cart details of user
const getCart = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const category = await Category.find({});

    const user = await User.findOne({ _id: user_id })
      .populate("cart.product")
      .lean();
    console.log("user : :" + user, user_id, user.cart);
    const cart = user.cart;
    // console.log("CART ::" +cart[0],cart.length,cart[1]._id,cart[1].category,cart[0].product,cart[0].product.name)

    let totalSum = 0;
    cart.forEach((val) => {
      val.total = val.product.price * val.qty;
      totalSum += val.total;
    });

    res.render("cartdetails", {
      cart: cart,
      user: user_id,
      category: category,
      totalSum,
      CartCount: cart.length,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCartItem = async (req, res) => {
  try {
    console.log("in del cart item " + req.body.productId);
    const prod_id = req.body.productId;
    await User.updateOne(
      { _id: req.session.user_id },
      { $pull: { cart: { product: prod_id } } }
    );

    res.redirect("/cart");
    //   res.render('cartdetails',{cart:cart, user:req.session.user_id, category:category,totalSum, CartCount:cart.length})
  } catch (error) {
    console.log(error.message);
  }
};

const removeProduct = async (req, res) => {
  try {
    console.log("in rem product fn withquery");
    const userId = req.query.userId;
    const proId = req.query.proId;

    await User.updateOne(
      { _id: userId },
      { $pull: { cart: { product: proId } } }
    );
    console.log("product removed from cart");
    // res.redirect('/cart')
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};

// const incrementQty=(req,res)=>{
//     try {
//         const product_id=req.query.productId
//         const user_id=req.session.user_id
//         console.log(product_id)
//         const cartData=  User.findByIdAndUpdate(
//             {_id:user_id, 'cart.product':product_id },
//             {
//                  $inc: { 'cart.$.qty': 1 }
//             })
//         const category=Category.find({})
//         const user= User.findOne({_id:user_id}).populate('cart.product').lean()
//         console.log("user : :"+ user,user.cart)
//         const cart=user.cart
//         console.log("CART ::" +cart[0],cart.length,cart[1]._id,cart[1].category,cart[0].product,cart[0].product.name)
//         let totalSum=0
//         cart.forEach((val) => {
//             val.total= val.product.price * val.qty
//             totalSum += val.total
//         });
//         res.render('cartdetails',{cart:cart, user:req.session.user_id, category:category,totalSum})
//     } catch (error) {
//         console.log(error.message)
//         return res.status(500).send('Internal Server Error');
//     }
// }

const incrementQty = (req, res) => {
  try {
    console.log("in incrmt QTY :::");
    const product_id = req.query.productId;
    const user_id = req.session.user_id;
    console.log(product_id);

    User.findByIdAndUpdate(
      { _id: user_id, "cart.product": product_id },
      { $inc: { "cart.$.qty": 1 } },
      (err, cartData) => {
        if (err) {
          console.log(err.message);
          return res.status(500).send("Internal Server Error");
        }

        Category.find({}, (err, category) => {
          if (err) {
            console.log(err.message);
            return res.status(500).send("Internal Server Error");
          }

          User.findOne({ _id: user_id })
            .populate("cart.product")
            .lean()
            .exec((err, user) => {
              if (err) {
                console.log(err.message);
                return res.status(500).send("Internal Server Error");
              }

              console.log("user : :" + user, user.cart);
              const cart = user.cart;
              console.log(
                "CART ::" + cart[0],
                cart.length,
                cart[1]._id,
                cart[1].category,
                cart[0].product,
                cart[0].product.name
              );

              let totalSum = 0;
              cart.forEach((val) => {
                val.total = val.product.price * val.qty;
                totalSum += val.total;
              });

              res.render("cartdetails", {
                cart: cart,
                user: req.session.user_id,
                category: category,
                totalSum,
                CartCount: cart.length,
              });
            });
        });
      }
    );
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Internal Server Error");
  }
};

// updating cart
const updateCart = async (req, res) => {
  try {
    console.log("in cart updation ");
    const user = req.session.user_id;
    const userData = await User.findById({ _id: req.session.user_id });
    console.log("USERS DATA : " + userData);
    let data = await User.find(
      { _id: userData._id },
      { _id: 0, cart: 1 }
    ).lean();
    console.log("DATA IS  :" + data, data.length, data[0].cart);

    data[0].cart.forEach((val, i) => {
      console.log("\nLoop : " + i, val, req.body.datas[i].quantity);
      val.qty = req.body.datas[i].quantity;
      console.log("\nLoop : " + i, val, req.body.datas[i].quantity);
    });
    await User.updateOne(
      { _id: userData._id },
      { $set: { cart: data[0].cart } }
    );
    res.json("from backend ,cartUpdation json");
  } catch (error) {
    console.log(error.message);
  }
};

// order placed by user from cart
const orderPlaced = async (req, res) => {
  try {
    console.log("orderplaced!!!!");
    const category = await Category.find({});
    const users = await User.findOne({ _id: req.session.user_id })
      .populate("cart.product")
      .lean();
    const CartCount = users.cart.length;
    const user = req.body.user_id;
    //const cart=req.body.cart_id

    const cart = users.cart;
    console.log(user, cart);
    //    const productData=  cart.product

    // const productData=await Cart.aggregate([ { $match: { user_id: '64f052943646a6a00ceaa259' } }, { $unwind: '$product' }, { $project: { _id: 0,  'product.item': 1, 'product.qty': 1  } }]);

    var totalamount = 0;
    var products = [];
    console.log("..<<" + products, totalamount, cart.length);
    for (let i = 0; i < cart.length; ++i) {
      console.log(cart[i].qty, cart[i].product.price);
      totalamount += cart[i].qty * cart[i].product.price;
      const productdetails = {
        pro_id: cart[i].product._id,
        price: cart[i].product.price,
        qty: cart[i].qty,
      };
      products.push(productdetails);
    }
    // const currentDate = new Date();
    // const day = currentDate.getDate();
    // const month = currentDate.toLocaleString('default', { month: 'short' }); // Get the abbreviated month name
    // const year = currentDate.getFullYear();
    // // Concatenate the components to form the desired date format
    // const formattedDate = `${day} ${month} ${year}`;

    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Adding 1 to month because months are zero-based
    const year = currentDate.getFullYear();
    // Format the date as "YYYY-MM-DD"
    const formattedDate = `${year}-${month}-${day}`;

    console.log("Formattd Date :" + formattedDate);
    console.log("..>>" + products, totalamount);
    const order = new Order({
      user_id: user,
      amount: totalamount,
      orderstatus: "Pending",
      product: products,
      address: "",
      date: formattedDate,
    });
    console.log("\n\nORDER : " + order);
    //const orderData=await order.save()
    //const userData=await User.findOne({_id:user})
    const address = await Address.find(
      { user_id: req.session.user_id },
      { address: 1, _id: 0 }
    );
    const addr = address.flatMap((user) => user.address);
    console.log("ADDR is : " + addr, addr.length);
    console.log("addreddd is ::" + address);
    console.log("user is: " + users);
    //console.log("\n\norder data is : "+ orderData,orderData._id)

    res.render("addaddress", { user: users, category, CartCount, addr });
  } catch (error) {
    console.log(error.message);
  }
};

// payment
const makePayment = async (req, res) => {
  try {
    console.log("in payment ");
    // const orderid= req.body.orderid
    // console.log("ord id >>"+ orderid)
    console.log(req.body);
    const category = await Category.find({});
    const users = await User.findOne({ _id: req.session.user_id })
      .populate("cart.product")
      .lean();
    const CartCount = users.cart.length;
    const cart = users.cart;

    console.log("userss data is :: " + users, users.cart.qty, users.wallet);
    console.log("cart is  >>>" + cart, cart[0].product, cart[0].qty);
    var amount = 0;
    cart.forEach((val) => {
      amount += val.product.price * val.qty;
    });

    console.log("amount is :" + amount);
    console.log(req.body);
    console.log("delv-add >>" + String(req.body.delivery - address));
    console.log("new addr >> " + req.body.newaddress);
    var address = "my address is";
    console.log("delv-add >>" + req.body["delivery-address"]);
    console.log("new addr >> " + req.body["newaddress"]);

    if (req.body["delivery-address"] === "on") {
      console.log("inside if " + req.body.newaddress);
      address = req.body["newaddress"];
    } else {
      // console.log("inside ELSE  "+req.body['delivery-address'])
      address = req.body["delivery-address"];
    }
    console.log("outsude >" + address);
    const user = req.session.user_id;
    const coupon = await Coupon.find({});
    // console.log("ord id >>"+ orderid)

    // const orderData=await Order.findOneAndUpdate({_id:orderid ,user_id:req.session.user_id},{"$set": { "address":address}})
    console.log(
      "updated with addr ::" + user,
      category,
      CartCount,
      address,
      amount
    );
    res.render("payment", {
      user: user,
      users,
      category,
      CartCount,
      address: address,
      amount: amount,
      coupon: coupon,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// Re-view the orders placed
const reviewOrder = async (req, res) => {
  try {
    console.log("in review");

    const category = await Category.find({});
    const user = await User.findOne({ _id: req.session.user_id });
    const CartCount = user.cart.length;
    const address = req.body.selectedAddress;
    const paymethod = req.body.paymentMethod;

    // update stock
    let usercart = user.cart;
    usercart.forEach(async (item) => {
      const product_id = item.product;
      const qty = item.qty;

      // update stock
      const product = await Product.findById({ _id: product_id });
      const stock = product.stock;
      const newStock = stock - qty;
      await Product.updateOne(
        { _id: product_id },
        { $set: { stock: newStock } }
      );
    });

    // need to update order collection here

    const userData = await User.findOne({ _id: req.session.user_id }).populate(
      "cart.product"
    );
    const cart = userData.cart;

    let subTotal = 0;
    cart.forEach((val) => {
      subTotal += val.product.price * val.qty;
    });

    let productData = cart.map((item) => {
      return {
        pro_id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        qty: item.qty,
        image: item.product.image[0],
      };
    });

    const result = Math.random().toString(36).substring(2, 7);
    const id = Math.floor(100000 + Math.random() * 900000);
    const orderid = result + id;

    // date calculation
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Adding 1 to month because months are zero-based
    const year = currentDate.getFullYear();
    // Format the date as "YYYY-MM-DD"
    const formattedDate = `${year}-${month}-${day}`;
    console.log("Formattd Date :" + formattedDate);

    /// order saving function

    let saveOrder = async () => {
      if (req.body.couponData) {
        const order = new Order({
          user_id: req.session.user_id,
          product: productData,
          address: address,
          // orderId: orderid,
          amount: subTotal,
          paymentmethod: paymethod,
          //  date: formattedDate,
          orderstatus: "Placed",
          discountAmt: req.body.couponData.discountAmt,
          amtAftrDiscount: req.body.couponData.newTotal,
          coupon: req.body.couponName,
        });
        const ordered = await order.save();
      } else {
        const order = new Order({
          user_id: req.session.user_id,
          product: productData,
          address: address,
          amount: subTotal,
          paymentmethod: paymethod,
          //  date: formattedDate,
          orderstatus: "Placed",
        });
        console.log(order, "without coupon");
        await order.save();
      }
      // order updation ends
      user.cart = [];
      await user.save();
    };
    if (address) {
      if (req.body["paymentMethod"] === "cash-on-delivery") {
        saveOrder();
        res.json({
          CODsucess: true,
          total: subTotal,
        });
      }
      if (paymethod === "razorpay") {
        const amount = req.body.amount;
        saveOrder();
        res.json({
          razorPaySucess: true,
          amount: subTotal,
        });
      }

      if (paymethod === "wallet") {
        console.log("from wallet.");
        const newWallet = req.body.updateWallet;
        const userId = req.session.user_id;
        console.log(newWallet, "wallet & user Id", userId);
        await User.findByIdAndUpdate(
          userId,
          { $set: { wallet: newWallet } },
          { new: true }
        );
        saveOrder();
        res.json(newWallet);
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// check out- thank you page
const checkoutOrder = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.user_id });
    const CartCount = user.cart.length || 0;
    const category = await Category.find({});
    // const orderid= req.body.orderid
    console.log("thank you");

    //  await Order.findOneAndUpdate(
    //         {_id:orderid, user_id:req.session.user_id},
    //         {$set:{orderstatus:"Placed"}})

    res.render("thankyou", {
      user: req.session.user_id,
      CartCount,
      category: category,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// Searching products
const searchProduct = async (req, res) => {
  try {
    console.log("in search");
    const user = req.session.user_id;
    if (user) {
      const user = await User.findOne({ _id: req.session.user_id });
      const CartCount = user.cart.length || 0;
    }
    const category = await Category.find({});
    var search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    var category_search = "";
    if (req.query.category) {
      category_search = req.query.category;
    }
    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    var limit = req.query.limit || 2;
    const productData = await Product.find({
      $and: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
        { category: { $regex: ".*" + category_search + ".*", $options: "i" } },
      ],
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await Product.find({
      $and: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
        { category: { $regex: ".*" + category_search + ".*", $options: "i" } },
      ],
    }).countDocuments();

    if (user) {
      res.render("home", {
        product: productData,
        user: user,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        category: category,
        CartCount: CartCount,
      });
    } else {
      res.render("home", {
        product: productData,
        user: user,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        category: category,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const justTest = async (req, res) => {
  try {
    const user = req.session.user_id;
    const category = await Category.find({});

    res.render("test2", { user: user, category: category });
  } catch (error) {
    console.log(error.message);
  }
};

const messageBox = async (req, res) => {
  const title = "BloomBASKET";
  const message = "hello";
  res.render("message", { title, message });
};

const changeQuantity = async (req, res, next) => {
  try {
    console.log(req.body);
    // change product quantity
  } catch (error) {
    console.log(error.message);
  }
};

// details of orders placed
const 
viewOrders = async (req, res) => {
  try {
    const category = await Category.find({});
    const order = await Order.find({ user_id: req.session.user_id }).sort({
      date: -1,
    });
    console.log("order frm user :", order);

    const user = await User.findOne({ _id: req.session.user_id });
    const CartCount = user.cart.length;
    let message = "";

    if (req.session.wallet) {
      console.log("inside req wallert");
      message = "Wallet updated. Balance is : ₹ " + req.session.wallet;
      delete req.session.wallet;
      console.log(message);
    }
    console.log("MESSAGE HAS TO BE ", message);
    // formatting the date from order collection
    const formattedOrders = order.map((order) => {
      const formattedDate = moment(order.date).format("DD-MMM-YYYY");
      return { ...order.toObject(), date: formattedDate };
    });

    //  console.log("forder: ", formattedOrders)

    res.render("orders", {
      user: req.session.user_id,
      order: formattedOrders,
      category: category,
      CartCount,
      message: message,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// order cancell

const cancelOrder = async (req, res) => {
  try {
    console.log("cancel order");
    const orderid = req.query.orderid;

    console.log("oderid is :", orderid, req.body, req.query);

    const order_products = await Order.findOne({ _id: orderid })
      .populate("product.pro_id")
      .lean();
    console.log(
      "Products in ordersssssssss :",
      order_products,
      order_products.product
    );
    updateStock(order_products.product);
    console.log("Back in main aftre stock updation ");
    const order = await Order.findOne({ _id: orderid });
    console.log(order.orderstatus);
    if (order.orderstatus == "Placed") {
      const orderData = await Order.findByIdAndUpdate(
        { _id: orderid },
        {
          $set: { orderstatus: "Cancelled" },
        }
      );
      console.log("cancelled" + orderid);

      if (orderData.paymentmethod !== "cash-on-delivery") {
        walletupdation(orderid);
        let userData = await User.find({ _id: order.user_id });
        console.log("userssdata is : ", userData, userData[0].wallet);
        req.session.wallet = userData[0].wallet;
        console.log(req.session.wallet, "is wallet");
      }
    } else if (order.orderstatus == "Delivered") {
      const orderData = await Order.findByIdAndUpdate(
        { _id: orderid },
        {
          $set: { orderstatus: "Returned" },
        }
      );

      walletupdation(orderid);
      let userData = await User.find({ _id: order.user_id });
      console.log("userssdata is : ", userData, userData[0].wallet);
      req.session.wallet = userData[0].wallet;
      console.log(req.session.wallet, "is wallet");
    }

    // if(orderData.paymentmethod!=='cash-on-delivery')
    // {    console.log("inside wallet updation")
    //     const user= await User.findOne({_id:orderData.user_id})
    //     const newwallet= orderData.amount + user.wallet
    //     console.log("ne www ",newwallet)
    //     await User.findByIdAndUpdate({_id:orderData.user_id},
    //         {
    //         $set :{wallet: newwallet}
    //         })
    //     let userData= await User.find({_id:orderData.user_id})
    //     console.log("userssdata is : ",userData,userData[0].wallet)
    //     req.session.wallet=userData[0].wallet
    //     console.log(req.session.wallet,"is wallet")
    // }

    res.redirect("/view-orders");
  } catch (error) {
    console.log(error.message);
  }
};
// return amount to wallet when cancelled or returned product
let walletupdation = async (orderid) => {
  console.log("inside wallet updation", orderid);
  const orderData = await Order.findOne({ _id: orderid });
  const user = await User.findOne({ _id: orderData.user_id });
  const newwallet = orderData.amount + user.wallet;
  console.log("ne www ", newwallet);
  await User.findByIdAndUpdate(
    { _id: orderData.user_id },
    {
      $set: { wallet: newwallet },
    }
  );
};

// when purchase done, stock gets updated
const updateStock = async (orderData) => {
  try {
    console.log("In Stock updation.... dear");
    console.log(orderData);
    orderData.forEach(async (item) => {
      const stock = item.pro_id.stock;
      const qty = item.qty;
      const product_id = item.pro_id._id;
      console.log("Stock ::", product_id, stock, qty);
      // update stock
      //     const product = await Product.findById({_id:product_id})
      //     const stock = product.stock
      const newStock = stock + qty;
      console.log("Stock ::", stock, qty, newStock);
      await Product.updateOne(
        { _id: product_id },
        { $set: { stock: newStock } }
      );
    });
    console.log("Updated Stock dear :::");
  } catch (error) {
    console.error(error.message);
  }
};

// order details in user profile
const viewOrderDetails = async (req, res) => {
  try {
    console.log("in view order det");
    const category = await Category.find({});
    const user = await User.findOne({ _id: req.session.user_id });
    const CartCount = user.cart.length;

    const orderid = req.query.id;

    var order = await Order.findOne({ _id: orderid });
    const products = order.product.map((product) => ({
      quantity: product.qty,
      description: product.name,
      tax: 10,
      price: product.price,
    }));

    console.log("products      ", products, products[0].quantity);
    order = await Order.findOne({ _id: orderid })
      .sort({ date: -1 })
      .populate("product.pro_id")
      .lean();
    console.log("Sorted order : ", order);
    console.log("order is  : :" + req.body, req.query);
    console.log(
      "order from db : " + order.amount,
      order.user_id,
      order.date,
      order.product
    );
    res.render("vieworder", {
      user: req.session.user_id,
      order: order,
      category,
      CartCount,
      username: user.name,
      products,
    });

    // find all values
    // const date = moment(order.date).format('MMMM D, YYYY');

    // till here
  } catch (error) {
    console.log(error.message);
  }
};

// coupon
const couponValidate = async (req, res) => {
  try {
    console.log("in coupon validation");

    console.log(req.body, "bodyyyyyyyyyyyyyyyyyyyyyy");
    const { couponVal, subTotal } = req.body;
    const coupon = await Coupon.findOne({ code: couponVal });
    console.log("Coupon is :", coupon);
    if (!coupon) {
      console.log("invalid inside");
      res.json("invalid");
    } else if (coupon.expiryDate < new Date()) {
      console.log(" inside expired");
      res.json("expired");
    } else {
      console.log(" inside elseeeeeee");
      const couponId = coupon._id;
      const discount = coupon.discount;
      const userId = req.session.user_id;
      const isCouponUsed = await Coupon.findOne({
        _id: couponId,
        usedBy: { $in: [userId] },
      });
      if (isCouponUsed) {
        res.json("already used");
      } else {
        await Coupon.updateOne(
          { _id: couponId },
          { $push: { usedBy: userId } }
        );
        const discnt = Number(discount);
        const discountAmt = (subTotal * discnt) / 100;
        const newTotal = subTotal - discountAmt;
        const user = User.findById(userId);
        res.json({
          discountAmt,
          newTotal,
          discount,
          success: "success",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getInvoice = async (req, res) => {
  try {
    const orderid = req.query.orderid;
    // const user_id= req.session.user_id
    console.log("in getinvoice");
    const order = await Order.findById(orderid);
    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }
    console.log("order is invoice ninnu", order);
    const { user_id, address } = order;

    console.log("uid,add ", user_id, address);
    //  product details
    const products = order.product.map((product) => ({
      quantity: product.qty,
      description: product.name,
      "tax-rate": 10,
      price: product.price,
    }));

    const date = moment(order.date).format("MMMM D, YYYY");

    console.log("PRODUCT :: ", products);
    console.log("DATE : ", date);

    const [user] = await Promise.all([
      User.findById(user_id),
      // Address.findById(address),
    ]);

    // const data = {
    //     currency: 'INR',
    //     taxNotation: 'vat',
    //     marginTop: 25,
    //     marginRight: 25,
    //     marginLeft: 25,
    //     marginBottom: 25,
    //     background: 'https://public.easyinvoice.cloud/img/watermark-draft.jpg',
    //     // Your own data
    //     sender: {
    //         company: 'Bloom Basket',
    //         address: 'Bloom Nagar',
    //         zip: 'Nadathara',
    //         city: 'Thrissur',
    //         country: 'India',
    //     },
    //     // Your recipient
    //     client: {
    //         company: user.name,
    //         address: order.address,
    //         zip: '680751',
    //         city: "City",
    //         country: 'India',
    //     },

    //     information: {
    //         // Invoice number
    //         number: "2023.0001",
    //         // Invoice data
    //         date: date,

    //     },
    //     // invoiceNumber: '2023001',
    //     // invoiceDate: date,
    //     products: products

    // };

    //***************************************************************

    var data = {
      currency: "INR",
      taxNotation: "vat",
      marginTop: 25,
      marginRight: 25,
      marginLeft: 25,
      marginBottom: 25,

      background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",

      // Your own data
      sender: {
        company: "Sample Corp",
        address: "Sample Street 123",
        zip: "1234 AB",
        city: "Sampletown",
        country: "Samplecountry",
      },
      // Your recipient
      client: {
        company: "Client Corp",
        address: "Clientstreet 456",
        zip: "4567 CD",
        city: "Clientcity",
        country: "Clientcountry",
      },
      information: {
        number: "2021.0001",

        date: 12 - 12 - 2021,

        duedate: 31 - 12 - 2021,
      },
      products: [
        {
          quantity: "2",
          description: "Product 1",
          "tax-rate": 6,
          price: 33.87,
        },
        {
          quantity: "4.1",
          description: "Product 2",
          "tax-rate": 6,
          price: 12.34,
        },
        {
          quantity: "4",
          description: "Product 3",
          "tax-rate": 21,
          price: 6324.453456,
        },
      ],
    };

    //************************************************************* */

    console.log("NEW DATA IS ", data);

    //Create your invoice! Easy!
    //      easyinvoice.createInvoice(data,async function (result) {
    //     const fileName = 'invoice.pdf'
    //     const pdfBuffer = Buffer.from(result.pdf, 'base64');
    //     res.setHeader('Content-Type', 'application/pdf');
    //     res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
    //     res.send(pdfBuffer);
    // })

    await fs.writeFileSync("invoice.pdf", result.pdf, "base64");
    console.log("success you shold get!!!");
    // end of new dataaaaaaaaa
  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);
  }
};

const getin = async (req, res) => {
  try {
    var data = {
      // Customize enables you to provide your own templates
      // Please review the documentation for instructions and examples
      customize: {
        //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
      },
      images: {
        // The logo on top of your invoice
        logo: "https://public.easyinvoice.cloud/img/logo_en_original.png",
        // The invoice background
        background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
      },
      // Your own data
      sender: {
        company: "Sample Corp",
        address: "Sample Street 123",
        zip: "1234 AB",
        city: "Sampletown",
        country: "Samplecountry",
        //"custom1": "custom value 1",
        //"custom2": "custom value 2",
        //"custom3": "custom value 3"
      },
      // Your recipient
      client: {
        company: "Client Corp",
        address: "Clientstreet 456",
        zip: "4567 CD",
        city: "Clientcity",
        country: "Clientcountry",
        // "custom1": "custom value 1",
        // "custom2": "custom value 2",
        // "custom3": "custom value 3"
      },
      information: {
        // Invoice number
        number: "2021.0001",
        // Invoice data
        date: "12-12-2021",
        // Invoice due date
        "due-date": "31-12-2021",
      },
      // The products you would like to see on your invoice
      // Total values are being calculated automatically
      products: [
        {
          quantity: 2,
          description: "Product 1",
          "tax-rate": 6,
          price: 33.87,
        },
        {
          quantity: 4.1,
          description: "Product 2",
          "tax-rate": 6,
          price: 12.34,
        },
        {
          quantity: 4.5678,
          description: "Product 3",
          "tax-rate": 21,
          price: 6324.453456,
        },
      ],
      // The message you would like to display on the bottom of your invoice
      "bottom-notice": "Kindly pay your invoice within 15 days.",
      // Settings to customize your invoice
      settings: {
        currency: "USD", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
        // "locale": "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')
        // "margin-top": 25, // Defaults to '25'
        // "margin-right": 25, // Defaults to '25'
        // "margin-left": 25, // Defaults to '25'
        // "margin-bottom": 25, // Defaults to '25'
        // "format": "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
        // "height": "1000px", // allowed units: mm, cm, in, px
        // "width": "500px", // allowed units: mm, cm, in, px
        // "orientation": "landscape", // portrait or landscape, defaults to portrait
      },
      // Translate your invoice to your preferred language
      translate: {
        // "invoice": "FACTUUR",  // Default to 'INVOICE'
        // "number": "Nummer", // Defaults to 'Number'
        // "date": "Datum", // Default to 'Date'
        // "due-date": "Verloopdatum", // Defaults to 'Due Date'
        // "subtotal": "Subtotaal", // Defaults to 'Subtotal'
        // "products": "Producten", // Defaults to 'Products'
        // "quantity": "Aantal", // Default to 'Quantity'
        // "price": "Prijs", // Defaults to 'Price'
        // "product-total": "Totaal", // Defaults to 'Total'
        // "total": "Totaal", // Defaults to 'Total'
        // "vat": "btw" // Defaults to 'vat'
      },
    };

    //Create your invoice! Easy!
    // easyinvoice.createInvoice(data,async function (result) {
    //     //The response will contain a base64 encoded PDF file
    //     console.log('PDF base64 string: ', result.pdf);
    // });

    const result = await easyinvoice.createInvoice(
      data,
      async function (result) {
        console.log("ininnnn");
      }
    );
    await fs.writeFileSync("invoice.pdf", result.pdf, "base64");

    console.log("enddd");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadHome,
  signUp,
  insertUser,
  // OTP
  getOtp,
  verifyOtp,
  resendOtp,
  // Login
  login,
  verifylogin,
  forgotPassword,
  updatePassword,
  viewProductdetails,
  logout,
  // Profile
  getProfile,
  updateProfile,
  updateAddress,
  changePassword,
  // Cart
  addTocart,
  getCart,
  updateCart,
  deleteCartItem,
  removeProduct,
  // purchase
  orderPlaced,
  makePayment,
  reviewOrder,
  checkoutOrder,
  //search
  searchProduct,

  justTest,
  messageBox,
  incrementQty,
  changeQuantity,

  // Orders
  viewOrders,
  cancelOrder,
  viewOrderDetails,
  getInvoice,
  getin,

  // coupon
  couponValidate,
};
