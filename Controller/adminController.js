const Admin = require("../model/adminModel");
const Category = require("../model/categoryModel");
const User = require("../model/userModel");
const Product = require("../model/productModel");
const Order = require("../model/orderModel");
const Coupon = require("../model/couponModel");

const bcrypt = require("bcrypt");
const Swal = require("sweetalert");

const moment = require("moment");

const ExcelJS = require("exceljs");
const pdfkit = require("pdfkit");

//Admin Login
const loadAdminLogin = async (req, res) => {
  try {
    res.render("adminLogin");
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})
  }
};
// admin Login verify
const loginVerify = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const adminData = await Admin.findOne({ email: email });
  if (adminData) {
    const passwordMatch = await bcrypt.compare(password, adminData.password);
    if (passwordMatch) {
      req.session.admin_id = adminData._id;
      // console.log(
      //   "session is : ",
      //   req.session,
      //   " adminData._id is :",
      //   adminData._id
      // );

      const product = await Product.find({});
      const category = await Category.find({});
      const user = await User.find({});

      //  res.render('adminhome',{admin:adminData, product, category, user})
      res.redirect("/admin/dashboard");
    } else {
      res.render("adminLogin", { message: "Username and password is wrong" });
    }
  } else {
    res.render("adminLogin", { message: "Username and password is wrong" });
  }
};

// admin homepage
const loadAdminhome = async (req, res) => {
  try {
    const products = await Product.find({});
    const categorys = await Category.find({});
    const users = await User.find({});
    const orders = await Order.find({});

    //res.render('adminhome',{products,categorys,users,orders})
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};
// product management page
const loadProducts = async (req, res) => {
  try {
    const product = await Product.find({});
    // console.log("PRoducts : >> " + product);
    res.render("products", { product });
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};

// category management page
const loadCategories = async (req, res) => {
  try {
    const category = await Category.find({});
    res.render("categories", { category });
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};
// User management page
const loadUsers = async (req, res) => {
  try {
    const user = await User.find({});

    res.render("users", { user });
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};
// add category page
const addCategory = async (req, res) => {
  try {
    res.render("addcategory");
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};
// Add category
const addNewcategory = async (req, res) => {
  try {
    const categoryName = req.body.category;
    const description = req.body.description;
    // console.log(categoryName, description);
    const category = new Category({
      name: categoryName,
      description: description,
    });
    const categoryData = await category.save();
    if (categoryData) {
      res.redirect("/admin/categories");
    } else {
      res.render("new-category", { message: "Something went wrong." });
    }
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};
//Edit category
const editCategory = async (req, res) => {
  try {
    // console.log("in edit cat");
    const id = req.query.id;
    const categoryData = await Category.findOne({ _id: id });
    // console.log(categoryData);
    if (categoryData) {
      res.render("editcategory", { category: categoryData });
    } else {
      res.redirect("admin/categories");
    }
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};
// Update category that was edited
const updateCategory = async (req, res) => {
  try {
    const id = req.body.id;
    const name = req.body.name;
    const description = req.body.description;

    // console.log(id, name, description);
    const categoryData = await Category.findByIdAndUpdate(
      { _id: id },
      { $set: { name: name, description: description } }
    );
    res.redirect("/admin/categories");
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};
// delete category
const deleteCategory = async (req, res) => {
  try {
    //console.log("in del ", req.body.id, req.query.id)
    const id = req.query.id;
    await Category.deleteOne({ _id: id });
    res.redirect("/admin/categories");
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};
// edit user
const editUser = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.query.id });
    if (userData) {
      res.render("edituser", { user: userData });
    } else {
      res.redirect("admin/user");
    }
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};
// update user details that was edited
const updateUser = async (req, res) => {
  try {
    const id = req.body.id;
    const name = req.body.name;
    const address = req.body.address;
    const email = req.body.email;
    const mobile = req.body.mobile;

    const userData = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { name: name, address: address, email: email, mobile: mobile } }
    );
    res.redirect("/admin/user");
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};
// delete user
const deleteUser = async (req, res) => {
  try {
    const id = req.query.id;
    await User.deleteOne({ _id: id });
    res.redirect("/admin/user");
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};
// Add user page
const addUser = async (req, res) => {
  try {
    res.render("adduser");
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};
// Add a new user
const addNewuser = async (req, res) => {
  try {
    const username = req.body.name;
    const address = req.body.address;
    const email = req.body.email;
    const mobile = req.body.mobile;
    // console.log(username, address, email, mobile);



    
    const user = new User({
      name: username,
      address: address,
      email: email,
      mobile: mobile,
    });
    const userData = await user.save();
    if (userData) {
      res.redirect("/admin/user");
    } else {
      res.render("new-user", { message: "Something went wrong." });
    }
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};
// Unblock user
const unblockUser = async (req, res) => {
  try {
    const id = req.body.id;
    const userData = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { blocked: false } }
    );
    res.redirect("/admin/user");
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};
// Block user
const blockUser = async (req, res) => {
  try {
    const id = req.body.id;
    const userData = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { blocked: true } }
    );
    res.redirect("/admin/user");
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};

// Add Product page
const addProduct = async (req, res) => {
  try {
    const category = await Category.find({});
    // console.log(category);
    res.render("addproduct", { category });
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};
// Add new product
const addNewproduct = async (req, res) => {
  try {
    const productname = req.body.name.trim();
    const description = req.body.description.trim();
    const category = req.body.category;
    const price = req.body.price;
    const stock = req.body.stock;
    // const image=req.file.filename

    const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
    let extension = true;
    const images = [];
    const file = req.files;
    file.forEach((element) => {
      const image = element.filename;

      if (allowedExtensions.test(image)) {
        images.push(image);
      } else {
        extension = false;
        const message = `Invalid File Type. Use .jpg,.jpeg,.png files`;
        return res.render("adminAlert", { message });
      }
    });

    const priceValue = price.trim();
    if (!/^\d+(\.\d{1,2})?$/.test(priceValue) || parseFloat(priceValue) <= 0) {
      extension = false;
      const message =
        "Price must be a positive number with up to two decimal places.";
      return res.render("adminAlert", { message });
    }

    const stockValue = stock.trim();
    if (!/^\d+$/.test(stockValue) || parseInt(stockValue) <= 0) {
      extension = false;
      const message = "Stock must be a non-negative integer.";
      return res.render("adminAlert", { message });
    }
    if (productname === "" || description === "") {
      extension = false;
      const message = "Enter a Value. It cannot be empty";
      return res.render("adminAlert", { message });
    }

    if (extension) {
      const product = new Product({
        name: productname,
        description: description,
        category: category,
        price: price,
        stock: stock,
        image: images,
      });

      const productData = product.save();
      if (productData) {
        res.redirect("/admin/product");
      }
    } else {
      res.render("new-product", { message: "Something went wrong." });
    }
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};
// Delete product
const deleteProduct = async (req, res) => {
  try {
    // console.log("in del product")
    // console.log(req.query.id,req.body.id)

    const id = req.query.id;
    await Product.deleteOne({ _id: id });
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};
// Edit product page
const editProduct = async (req, res) => {
  try {
    const productData = await Product.findOne({ _id: req.query.id });
    const category = await Category.find({});
    if (productData) {
      res.render("editproduct", { product: productData, category });
    } else {
      res.redirect("admin/product");
    }
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};

const deleteImage = async (req, res) => {
  try {
    // console.log("in del img")
    const img = Number(req.query.image);
    const prodid = req.query.prodid;
    var imgname = await Product.find({ _id: prodid }, { _id: 0, image: 1 });
    // console.log("name is :",imgname, imgname[0].image[0],imgname[0].image[img])
    imgname = imgname[0].image[img];
    // console.log("##############", imgname)
    // console.log(img,"wefwefwe",prodid)
    //  const p1=await Product.updateOne({ _id: prodid }, { $unset: { [`images.${img}`]: 1 } })
    //console.log(p1,"11111111111111111")
    const p2 = await Product.updateOne(
      { _id: prodid },
      { $pull: { image: imgname } }
    );
    // console.log(p2, "2222222222222222");
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};

// Update product details that was edited
const updateProduct = async (req, res) => {
  try {
    // console.log("in up producr")
    // console.log(req.body,"vbnmbvbnm",req.body.images ,req.files,req.file)
    const id = req.body.id;
    const name = req.body.name;
    const price = req.body.price;
    const description = req.body.description;
    const category = req.body.category;
    const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
    let extension = true;
    const images = [];
    const file = req.files;
    // console.log("images from ", file, req.file, )
    file.forEach((element) => {
      const image = element.filename;
      if (allowedExtensions.test(image)) {
        images.push(image);
      } else {
        extension = false;
        const message = `Invalid File Type. Use .jpg,.jpeg,.png files`;
        return res.render("adminAlert", { message });
      }
    });
    if (extension) {
      await Product.updateOne(
        { _id: id },
        { $push: { image: { $each: images } } }
      );
    }
    const productData = await Product.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          name: name,
          price: price,
          description: description,
          category: category,
        },
      }
    );
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};
// Admin Logout
const adminLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};

// get orders placed by users
const loadOrders = async (req, res) => {
  try {
    // const ord=await Order.find().sort({date:1}).populate('user_id').lean()
    // console.log("Sorted ;", ord)
    const order = await Order.find({})
      .sort({ date: -1 })
      .populate("user_id")
      .lean();
    const ord = await Order.find({}).sort({ date: -1 });
    // console.log("orders is : "+ order[1].date)
    // console.log("Order from 3 is ", order[3])
    let message = "";

    if (req.session.wallet) {
      // console.log("inside req wallert")
      message = "Wallet updated. Balance is : ₹ " + req.session.wallet;
      delete req.session.wallet;
      // console.log(message)
    }

    // formatting the date from order collection
    const formattedOrders = ord.map((order) => {
      const formattedDate = moment(order.date).format("DD-MMM-YYYY");
      return { ...order.toObject(), date: formattedDate };
    });

    res.render("order", {
      order: order,
      ord_details: formattedOrders,
      message: message,
    });
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};

const editOrder = async (req, res) => {
  try {
    const orderid = req.query.id;
    // console.log("order id is :"+ orderid)
    const order = await Order.findOne({ _id: orderid })
      .populate("user_id")
      .populate("product.pro_id")
      .lean();
    // console.log("order from db : "+order.amount,order.user_id,order.product)
    res.render("editorder", { order: order });
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};

const changeStatus = async (req, res) => {
  try {
    // console.log("in status ")
    const orderid = req.query.id;
    // console.log("orderid :", orderid)
    const clickedIs = req.body.action;

    if (clickedIs == "Shipped") {
      // console.log("Shipped")
      await Order.findByIdAndUpdate(
        { _id: orderid },
        {
          $set: { orderstatus: "Shipped" },
        }
      );
    } else if (clickedIs == "Cancelled") {
      const orderData = await Order.findOne({ _id: orderid })
        .populate("product.pro_id")
        .lean();
      // console.log("order data is :", orderData,orderData.product,orderData.user_id)
      updateStock(orderData.product);
      // console.log("stock updated....")

      updateWallet(orderData.user_id, orderData.amount);
      await Order.findByIdAndUpdate(
        { _id: orderid },
        {
          $set: { orderstatus: "Cancelled" },
        }
      );
      // console.log("Cancelled")

      let userData = await User.find({ _id: orderData.user_id });
      // console.log("userssdata is : ",userData,userData[0].wallet)
      req.session.wallet = userData[0].wallet;
      //  console.log(req.session.wallet,"is wallet")

      // update stock

      // update wallet
    } else if (clickedIs == "Delivered") {
      // console.log("Delivered")
      await Order.findByIdAndUpdate(
        { _id: orderid },
        {
          $set: { orderstatus: "Delivered" },
        }
      );
    } else if (clickedIs == "Returned") {
      // console.log("Returned")

      const orderData = await Order.findOne({ _id: orderid })
        .populate("product.pro_id")
        .lean();
      // console.log("order data is :", orderData,orderData.product,orderData.user_id)
      updateStock(orderData.product);
      // console.log("stock updated....returned innnnn")

      updateWallet(orderData.user_id, orderData.amount);
      await Order.findByIdAndUpdate(
        { _id: orderid },
        {
          $set: { orderstatus: "Returned" },
        }
      );

      let userData = await User.find({ _id: orderData.user_id });

      req.session.wallet = userData[0].wallet;
      //  console.log(req.session.wallet,"is wallet")

      // update stock

      // update wallet
    }
    //         const status=req.body.status
    //         console.log("STATUS :" + status)
    //        if( status==1)
    //         {
    //             //editstatus ='Shipped'
    //             await Order.findByIdAndUpdate({_id:orderid},
    //                 {
    //                     $set :{orderstatus: 'Shipped'}
    //                 })
    //         }
    //         if(status==2)
    //         {
    //             // Delivered
    //             await Order.findByIdAndUpdate({_id:orderid},
    //                 {
    //                     $set :{orderstatus: 'Delivered'}
    //                 })
    //         }
    //         if(status==3)
    //         {
    //             console.log("del")
    //             // Cancelled
    //             await Order.findByIdAndUpdate({_id:orderid},
    //                 {
    //                     $set :{orderstatus: 'Cancelled'}
    //                 })
    //         }
    //         if(status==='change order status')
    //         {
    //         }
    // console.log("ensdeeeeeeeeee")
    //         const order= await Order.find({}).populate('user_id').lean()

    //        // res.render('order',{order:order})

    res.redirect("/admin/order");
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};

const updateStock = async (orderData) => {
  try {
    // console.log("In Stock updation.... dear")
    // console.log(orderData)
    orderData.forEach(async (item) => {
      const stock = item.pro_id.stock;
      const qty = item.qty;
      const product_id = item.pro_id._id;
      // console.log("Stock ::", product_id, stock,qty)
      // update stock
      //     const product = await Product.findById({_id:product_id})
      //     const stock = product.stock
      const newStock = stock + qty;
      //  console.log("Stock ::", stock, qty, newStock)
      await Product.updateOne(
        { _id: product_id },
        { $set: { stock: newStock } }
      );
    });
    // console.log("Updated Stock dear :::")
  } catch (error) {
    console.error(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};

const updateWallet = async (userid, amount) => {
  try {
    // console.log("In walletupdation.... dear")
    // console.log(userid)

    const user = await User.findOne({ _id: userid });
    const newwallet = amount + user.wallet;
    // console.log("ne www ",newwallet)
    await User.findByIdAndUpdate(
      { _id: userid },
      {
        $set: { wallet: newwallet },
      }
    );
  } catch (error) {
    console.error(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};

const deleteOrder = async (req, res) => {
  try {
    // console.log("in del")
    const orderid = req.query.id;
    // console.log("orderid in del:"+orderid,req.query)

    await Order.deleteOne({ _id: orderid });
    res.redirect("/admin/order");
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};

const loadCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.find({});
    // console.log("COupon : "+ coupon)
    res.render("coupon",{coupon: coupon });
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};

const addCoupon = async (req, res) => {
  try {
    res.render("addcoupon", { message: "" });
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};

const addNewcoupon = async (req, res) => {
  try {
    const code = req.body.code;
    const discountamt = req.body.percent;
    const expirydate = req.body.expiry;
    // console.log("in add coupon "+ code, discountamt,expirydate)
    const couponData = await Coupon.findOne({ code: code });

    // console.log("Data of coupon ", couponData,"and is")

    if (!couponData) {
      const coupon = new Coupon({
        code: code,
        discount: discountamt,
        expiry: expirydate,
      });

      await coupon.save();
      res.redirect("/admin/coupon");
    } else {
      res.render("addcoupon", { message: "Coupon Already Exists !!!" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};

const deleteCoupon = async (req, res) => {
  try {
    const id = req.query.id;
    await Coupon.findByIdAndDelete(id);
    res.redirect("/admin/coupon");
  } catch (error) {
    console.log(error);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};

const loadDashboard = async (req, res) => {
  try {
    // console.log("in load dsahboard")
    const users = await User.find({}).count();
    const products = await Product.find({}).count();
    const orders = await Order.find({}).count();
    const allOrders = await Order.find({ orderstatus: "Delivered" });
    const totalRevenue = allOrders.reduce(
      (totall, order) => totall + Number(order.amount),
      0
    );

    // console.log(" values from initial to assign ", users,products,orders,allOrders.length,totalRevenue)

    const categorys = await Category.find({}).count();
    // const delivered = await Order.find({ status: 'Delivered' })
    //  console.log(categorys,'categorys count')
    const orderdata = await Order.aggregate([
      {
        $sort: {
          date: 1,
        },
      },
      {
        $group: {
          _id: {
            $month: "$date",
          },
          orders: {
            $push: "$$ROOT",
          },
        },
      },

      {
        $project: {
          _id: 0,
          month: "$_id",
          orders: 1,
        },
      },
      {
        $sort: {
          month: 1,
        },
      },
    ]);

    //  console.log(orderdata,75555)

    const ordersnum = [];
    orderdata.forEach((element) => {
      const num = element.orders.length;
      ordersnum.push(num);
    });

    // console.log("ordersnum ", ordersnum)

    const ordermonth = [];
    orderdata.forEach((element) => {
      const num = element.month;
      ordermonth.push(num);
    });
    // console.log(ordermonth, 8999999);

    const monthNames = ordermonth.map((monthNumber) =>
      new Date(0, monthNumber - 1).toLocaleString("default", { month: "long" })
    );
    // console.log(monthNames, "monthnamessss", monthNames.length);

    // category sales
    const categorysale = await Order.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product.pro_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $group: {
          _id: "$product.category",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "name",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          _id: 0,
          category: "$category.name",
          count: 1,
        },
      },
    ]).exec();

    // console.log("Category ssale ",categorysale)

    var cashOnDeliveryCount = await Order.countDocuments({
      paymentmethod: "cash-on-delivery",
    });

    const catsales = await Order.aggregate([
      {
        $unwind: "$product",
      },
      {
        $lookup: {
          from: "products", // Name of the 'Product' collection
          localField: "product.pro_id",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $unwind: "$productData",
      },
      {
        $group: {
          _id: "$productData.category", // Group by category
          totalSales: {
            $sum: { $multiply: ["$product.qty", "$product.price"] },
          }, // Calculate total sales
        },
      },
    ]).exec();

    // console.log("**** Cat SALES is : ",catsales)

    // console.log("cash on delivery count ",cashOnDeliveryCount)

    var razorpayCount = await Order.countDocuments({
      paymentmethod: "razorpay",
    });
    // console.log("RAzorpay count",razorpayCount)

    var walletCount = await Order.countDocuments({
      paymentmethod: "wallet",
    });
    // console.log("Wallet count",walletCount)

    const pipeline = [
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: 1,
            },
          },
          count: 1,
        },
      },

      {
        $sort: {
          date: 1,
        },
      },
    ];
    //  console.log(pipeline, "pipelineeeeeeeee")
    const ordersByMonth = await Order.aggregate(pipeline).exec();
    //  console.log(ordersByMonth, 132222)

    const orderCounts = ordersByMonth.map(({ date, count }) => ({
      month: date ? date.toLocaleString("default", { month: "long" }) : null,
      count,
    }));

    //  console.log(orderCounts, "OrderCountsssssssssss")
    // console.log(categorysale, "categorysaleeeeeeeeeeee");

    res.render("dashboard", {
      //categorysale,
      catsales,
      cashOnDeliveryCount,
      razorpayCount,
      walletCount,
      orderCounts,
      users,
      products,
      orders,
      totalRevenue,
      monthNames,
      ordersnum,
    });
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};

const reports = async (req, res) => {
  try {
    res.render("report");
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};

const dailyReport = async (req, res) => {
  try {
    // console.log("in daily report")
    const orderDate = req.body.daily;
    const startDate = moment(orderDate, "YYYY-MM-DD").startOf("day").toDate();
    const endDate = moment(orderDate, "YYYY-MM-DD").endOf("day").toDate();
    // console.log(orderDate, "orderDate");
    // console.log(startDate, "startDate");
    // console.log(endDate, "endDate");

    dailyorders = await Order.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).populate("user_id");
    //  console.log(dailyorders, "DailyOrdersssss");
    totalOrderBill = dailyorders.reduce(
      (total, order) => total + Number(order.amount),
      0
    );
    //  console.log(totalOrderBill, "totalOrderBill");
    res.render("dailyreport", { dailyorders, totalOrderBill });
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};

const dailySalesdownload = async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sales Data");
  worksheet.columns = [
    { header: "Order ID", key: "orderId", width: 10 },
    { header: "Customer Name", key: "customerName", width: 20 },
    { header: "Order Date", key: "orderDate", width: 15 },
    // { header: "Discount", key: "discount", width: 10 },
    { header: "Total Bill", key: "totalBill", width: 10 },
    { header: "TotalOrders", key: "totalOrders", width: 10 },
    { header: "TotalRevenue", key: "totalRevenue", width: 20 },
  ];

  dailyorders.forEach((order) => {
    worksheet.addRow({
      orderId: order._id,
      customerName: order.user_id.name,
      orderDate: order.date,
      //   discount: order.discount,
      totalBill: order.amount,
    });
  });
  worksheet.addRow({
    totalOrders: dailyorders.length,
    totalRevenue: totalOrderBill,
  });
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + "SalesData.xlsx"
  );

  workbook.xlsx
    .write(res)
    .then(() => {
      res.end();
    })
    .catch((err) => {
      res.status(500).send("An error occurred while generating the Excel file");
    });
};

//pdf

const dailySalesdownloadpdf = (req, res) => {
  const doc = new pdfkit({ size: "A4", margin: 50 });

  const fs = require("fs");

  //  doc.pipe(fs.createWriteStream("output.pdf"))
  console.log("DO >",dailyorders);

  // doc.text("HEllo ").fontSize(15)
  // dailyorders.forEach((order) => {
  //     doc.text(`orderId: ${order._id}`)
  //      .text(`customerName: ${order.user_id.name}`)
  //       .text(`orderDate: ${order.date}`)
  //       .text(order._id)
  //       .moveDown()
  //   });

  // customerName: order.user_id.name,
  // orderDate: order.date,

  // totalBill: order.amount,

  
  // new try

  //generateHeader(doc);
  /*
  doc
    //.image("C:\Users\robin\MyPrograms\BROCAMP\Project 1\BloomBASKET\Blooming\public\assets\images\logo.png", 50, 45, { width: 50 })
    .fillColor("#444444")
    .fontSize(20)
    .text("Bloom Basket", 110, 57)
    .fontSize(10)
    .text("Bloom Basket", 200, 50, { align: "right" })
    .text("Bloom Nagar ", 200, 65, { align: "right" })
    .text("Thrissur, Kerala, 680751", 200, 80, { align: "right" })
    .moveDown();

  //generateCustomerInformation(doc, invoice);

  doc.fillColor("#444444").fontSize(20).text("Invoice", 50, 160);

  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, 185)
    .lineTo(550, 185)
    .stroke();

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("Invoice Number:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text("45678", 150, customerInformationTop)
    .font("Helvetica")
    .text("Invoice Date:", 50, customerInformationTop + 15)
    .text(new Date(), 150, customerInformationTop + 15)
    .text("Balance Due:", 50, customerInformationTop + 30)
    .text(dailyorders.amount, 150, customerInformationTop + 30)

    .font("Helvetica-Bold")
    .text("invoice.shipping.name", 300, customerInformationTop)
    .font("Helvetica")
    .text("invoice.shipping.address", 300, customerInformationTop + 15)
    .text(
      "invoice.shipping.city" +
        ", " +
        "invoice.shipping.state" +
        ", " +
        "invoice.shipping.country",
      300,
      customerInformationTop + 30
    )
    .moveDown();

  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, 252)
    .lineTo(550, 252)
    .stroke();

  const invoiceTableTop = 300;

  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, invoiceTableTop + 20)
    .lineTo(550, invoiceTableTop + 20)
    .stroke();

  doc.end();
  doc.pipe(fs.createWriteStream("out.pdf"));
  //new try ends here

  */

  //******************************************************************** */

  //************************************************************************ */

  //   doc.end()
  return;
};

// pdf fns starts

// pdf fns ends

const monthlyReport = async (req, res) => {
  try {
    const monthinput = req.body.month;
    // console.log(monthinput,"Monthhhhh")
    const year = parseInt(monthinput.substring(0, 4));
    const month = parseInt(monthinput.substring(5));

    // console.log(year, "year");
    // console.log(month, "month");

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // console.log(startDate, "startDate");
    // console.log(endDate, "endDate");

    monthlyOrders = await Order.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
      orderstatus: "Delivered", // Filter by status
    }).sort({ date: "desc" });
    totalMonthlyBill = monthlyOrders.reduce(
      (totall, order) => totall + Number(order.amount),
      0
    );
    console.log("monthly orders ", monthlyOrders);
    res.render("monthlyreport", { monthlyOrders, totalMonthlyBill });
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};

const monthlySalesdownload = async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sales Data");
  // Add headers to the worksheet
  worksheet.columns = [
    { header: "Order ID", key: "orderId", width: 10 },
    { header: "Order Date", key: "orderDate", width: 15 },
    //{ header: "Discount", key: "discount", width: 10 },
    { header: "Total Bill", key: "totalBill", width: 10 },
    { header: "TotalOrders", key: "totalOrders", width: 10 },
    { header: "TotalRevenue", key: "totalRevenue", width: 20 },
  ];

  monthlyOrders.forEach((order) => {
    worksheet.addRow({
      orderId: order._id,
      orderDate: order.date,
      //     discount: order.discount,
      totalBill: order.amount,
    });
  });
  worksheet.addRow({
    totalOrders: monthlyOrders.length,
    totalRevenue: totalMonthlyBill,
  });
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + "SalesData.xlsx"
  );
  workbook.xlsx
    .write(res)
    .then(() => {
      res.end();
    })
    .catch((err) => {
      res.status(500).send("An error occurred while generating the Excel file");
    });
};

const yearlyReport = async (req, res) => {
  try {
    const orders = await Order.find();
    const year = req.body.yearly;

    yearlyorders = orders.filter((order) => {
      const orderYear = new Date(order.date).getFullYear();
      return orderYear === parseInt(year);
    });

    totalYearlyBill = yearlyorders.reduce(
      (total, order) => total + Number(order.amount),
      0
    );
    res.render("yearlyreport", { yearlyorders, totalYearlyBill });
  } catch (error) {
    res.status(500).send({ message: `${error}` });
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};

const yearlySalesdownload = async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sales Data");

  // Add headers to the worksheet
  worksheet.columns = [
    { header: "Order ID", key: "orderId", width: 10 },
    { header: "Order Date", key: "orderDate", width: 15 },
    // { header: "Discount", key: "discount", width: 10 },
    { header: "Total Bill", key: "totalBill", width: 10 },
    { header: "TotalOrders", key: "totalOrders", width: 10 },
    { header: "TotalRevenue", key: "totalRevenue", width: 20 },
  ];

  yearlyorders.forEach((order) => {
    worksheet.addRow({
      orderId: order._id,
      orderDate: order.date,
      // discount: order.discount,
      totalBill: order.amount,
    });
  });
  worksheet.addRow({
    totalOrders: yearlyorders.length,
    totalRevenue: totalYearlyBill,
  });
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + "SalesData.xlsx"
  );

  workbook.xlsx
    .write(res)
    .then(() => {
      res.end();
    })
    .catch((err) => {
      res.status(500).send("An error occurred while generating the Excel file");
      res.render("error",{message:error.message, errorstatus:error.status})

    });
};

// rreports test mode

const dayReport = async (req, res) => {
  try {
    console.log("in day report");
    const orderDate = new Date();
    const startDate = moment(orderDate, "YYYY-MM-DD").startOf("day").toDate();
    const endDate = moment(orderDate, "YYYY-MM-DD").endOf("day").toDate();
    // console.log(orderDate, "orderDate");
    // console.log(startDate, "startDate");
    // console.log(endDate, "endDate");
    dailyorders = await Order.find(
      {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      },
      {
        _id: 0,
        amount: 1,
        date: 1,
      }
    );
    // console.log(dailyorders, "DailyOrdersssss");

    res.json({
      data: dailyorders,
    });
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};
// week ly sales

const weekReport = async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    // console.log(startDate, "startDate");
    // console.log(endDate, "endDate");

    const weekOrders = await Order.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" },
          },
          totalSales: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    // console.log("week orders ", weekOrders);

    res.json({
      data: weekOrders,
    });
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};

// month based sales on chart
const monthReport = async (req, res) => {
  try {
    const currentDate = new Date();
    const startDate = new Date();
    startDate.setMonth(currentDate.getMonth() - 6);
    const endDate = new Date();

    // console.log(startDate, "startDate");
    // console.log(endDate, "endDate");

    const monthOrders = await Order.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            //  year: { $year: '$date' },
            month: { $month: "$date" },
          },
          totalSales: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    //  console.log("monthly orders ", monthlyOrders)
    // console.log("month orders ", monthOrders);

    res.json({
      data: monthOrders,
    });
  } catch (error) {
    console.log(error.message);
    res.render("error",{message:error.message, errorstatus:error.status})

  }
};


module.exports = {
  loadAdminLogin,
  loginVerify,
  loadAdminhome,
  loadProducts,
  loadCategories,
  loadUsers,
  // category
  addCategory,
  addNewcategory,
  editCategory,
  updateCategory,
  deleteCategory,
  //user
  editUser,
  updateUser,
  deleteUser,
  addNewuser,
  addUser,
  unblockUser,
  blockUser,

  //product
  addProduct,
  addNewproduct,
  deleteProduct,
  editProduct,
  updateProduct,
  deleteImage,

  adminLogout,

  // order
  loadOrders,
  editOrder,
  changeStatus,
  deleteOrder,

  // coupon
  loadCoupon,
  addCoupon,
  addNewcoupon,
  deleteCoupon,

  // charts
  loadDashboard,

  // reports
  reports,
  dailyReport,
  dailySalesdownload,
  dailySalesdownloadpdf,
  monthlyReport,
  monthlySalesdownload,
  yearlyReport,
  yearlySalesdownload,

  // salesreport for chart/graph
  dayReport,
  weekReport,
  monthReport,
};