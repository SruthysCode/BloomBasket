require('dotenv').config();
const express=require('express')
const user_route=express()
const cookieParser=require('cookie-parser')

const sessionSecret = process.env.SECRET_KEY

const session= require('express-session')
const auth= require('../middleware/userauth')

const path=require('path')
const toastr = require('express-toastr');
user_route.use(toastr())
const nocache=require('nocache')
//user_route.use(nocache())  

const config=require('../config/config')
user_route.use(cookieParser())
user_route.use(session({
    secret:config.sessionSecret,
    resave:false,
    saveUninitialized:false,
    cookie:{secure: false}
}))

user_route.set('view engine', 'ejs')
user_route.set('views','./views/user')

// trial for popup msg


user_route.use(express.json())
user_route.use(express.urlencoded({extended:true}))

const userController=require('../Controller/userController');
const { cookie } = require('request');
user_route.get('/',nocache(),userController.loadHome)

user_route.get('/signup',auth.isLogout,userController.signUp)
user_route.post('/signup',userController.insertUser)
user_route.get('/otp/:user_id',userController.getOtp)
user_route.post('/otp/:user_id',userController.verifyOtp)
user_route.get('/resendotp',userController.resendOtp)
user_route.get('/login',auth.checkBlocked, userController.login)
user_route.post('/login',userController.verifylogin)

user_route.get('/forgot-password',auth.isLogout,userController.forgotPassword)
user_route.post('/forgot-password',userController.updatePassword)

user_route.get('/logout',auth.isLogin,userController.logout)

user_route.get('/profile',auth.checkBlocked,userController.getProfile)
user_route.post('/editprofile',userController.updateProfile)
user_route.post('/add-address',userController.updateAddress)
user_route.post('/change-password',userController.changePassword)

user_route.get('/viewproductdetails',auth.isLogin,userController.viewProductdetails)

user_route.post('/addtocart',userController.addTocart)
user_route.get('/cart',auth.checkBlocked,auth.isLogin,userController.getCart)
user_route.post('/cart-updation',userController.updateCart)

user_route.post('/increment/:productId',auth.checkBlocked,userController.incrementQty)
//user_route.post('change-quantity',userController.changeQuantity)

user_route.post('/cart',auth.checkBlocked,userController.orderPlaced)

// user_route.post('/delete-cart-item',userController.deleteCartItem)
user_route.get('/remove',auth.checkBlocked,userController.removeProduct)

user_route.post('/payment',userController.makePayment)
user_route.post('/couponvalidate',userController.couponValidate)

user_route.post('/revieworder',userController.reviewOrder)
user_route.get('/checkout',auth.checkBlocked,userController.checkoutOrder)

user_route.get('/search',userController.searchProduct)

user_route.get('/test',userController.justTest)
user_route.get('/message',userController.messageBox)

user_route.get('/view-orders',auth.isLogin,userController.viewOrders)
user_route.get('/cancel-order',auth.checkBlocked,userController.cancelOrder)
user_route.get('/view-orderdetails',auth.isLogin,userController.viewOrderDetails)
user_route.get('/invoice',auth.checkBlocked,userController.getInvoice)
user_route.get('/in',userController.getin)

// user_route.get('*', function(req,res){
//     res.redirect('/');
// })
module.exports=user_route