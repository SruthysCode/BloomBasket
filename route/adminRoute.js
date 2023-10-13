require('dotenv').config();
const express=require('express')
const admin_route=express()
const cookieParser=require('cookie-parser')

const session=require('express-session')

const auth=require('../middleware/adminauth')
const config=require('../config/config')
const path=require("path")

const sessionSecret = process.env.SECRET_KEY;
// var DataTable = require( 'datatables.net' );

const multer=require("multer")
const storage= multer.diskStorage({
    destination: function(req,file,cb)
    {
        cb(null,path.join(__dirname,"../public/productimages"))
    },
    filename: function(req,file,cb){
        const name=Date.now()+'-'+file.originalname
        cb(null,name)
    }
})
const upload=multer({storage:storage})

admin_route.use(cookieParser())
admin_route.use(session({
    secret: config.sessionSecret,
    resave: false, 
    saveUninitialized: false ,
    cookie:{secure: false}
}))


const nocache=require('nocache')
admin_route.use(nocache())
//const { urlencoded } = require("body-parser")
admin_route.set('view engine', 'ejs')
admin_route.set('views','./views/admin')

admin_route.use(express.json())
admin_route.use(express.urlencoded({extended:true}))

const adminController= require('../Controller/adminController')

admin_route.get('/',auth.isLogout,adminController.loadAdminLogin)
admin_route.post('/',adminController.loginVerify)
 admin_route.get('/home',auth.isLogin,adminController.loadAdminhome)
 
 admin_route.get('/dashboard',auth.isLogin,adminController.loadDashboard)
admin_route.get('/product',auth.isLogin,adminController.loadProducts)
admin_route.get('/categories',auth.isLogin,adminController.loadCategories)
admin_route.get('/user',auth.isLogin,adminController.loadUsers)

admin_route.get('/new-category',adminController.addCategory)
admin_route.post('/new-category',adminController.addNewcategory)
admin_route.get('/edit-category',adminController.editCategory)
admin_route.post('/edit-category',adminController.updateCategory)
admin_route.get('/delete-category',adminController.deleteCategory)

admin_route.get('/edit-user',adminController.editUser)
admin_route.post('/edit-user',adminController.updateUser)
admin_route.get('/delete-user',adminController.deleteUser)
admin_route.get('/new-user',adminController.addUser)
admin_route.post('/new-user',adminController.addNewuser)
admin_route.post('/unblock-user',adminController.unblockUser)
admin_route.post('/block-user',adminController.blockUser)

admin_route.get('/new-product',adminController.addProduct)
admin_route.post('/new-product',upload.array('images', 3),adminController.addNewproduct)
admin_route.get('/delete-product',adminController.deleteProduct)
admin_route.get('/edit-product',adminController.editProduct)
admin_route.post('/edit-product',upload.array('images',3),adminController.updateProduct)
admin_route.get('/deleteimg',adminController.deleteImage)

admin_route.get('/order',auth.isLogin,adminController.loadOrders)
admin_route.get('/edit-order',auth.isLogin,adminController.editOrder)
admin_route.post('/edit-order', adminController.changeStatus)
admin_route.get('/delete-order',adminController.deleteOrder)


admin_route.get('/coupon', adminController.loadCoupon)
admin_route.get('/addcoupon',adminController.addCoupon)
admin_route.post('/addcoupon',adminController.addNewcoupon)
admin_route.get('/deletecoupon',adminController.deleteCoupon)

admin_route.get('/report',adminController.reports)
admin_route.post('/daily-report',adminController.dailyReport)
admin_route.get('/dailysales/download',adminController.dailySalesdownload)
admin_route.get('/dailysales/downloadpdf',adminController.dailySalesdownloadpdf)
admin_route.post('/monthly-report',adminController.monthlyReport)
admin_route.get('/monthlyreport/download',adminController.monthlySalesdownload)
admin_route.post('/yearly-report',adminController.yearlyReport)
admin_route.get('/yearlyreport/download',adminController.yearlySalesdownload)

admin_route.get('/dayReport',adminController.dayReport)
admin_route.get('/weekReport',adminController.weekReport)
admin_route.get('/monthReport',adminController.monthReport)


admin_route.get('/logout',adminController.adminLogout)

// admin_route.get('*', function(req,res){
//     res.redirect('/admin');
// })


//admin_route.get('/order',adminController.getOrder)

module.exports=admin_route
                 