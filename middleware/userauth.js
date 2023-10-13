const { Redirect } = require("request/lib/redirect")
const { default: swal } = require("sweetalert")
const User= require('../model/userModel')

const isLogin=async(req,res,next)=>{
    try{
        if(req.session.user_id){
            next()
          // res.redirect('/')
        }
        else
        {
          res.redirect('/')
        //  next()
        }     
    }catch(error)
    {
        console.log(error.message)
    }
}

const isLogout=async(req,res,next)=>{
    try{
        if(req.session.user_id){
           next()
        }
        else
        {
            res.redirect('/login')
        }

        
    }catch(error)
    {
        console.log(error.message)
    }
}


const checkBlocked = async (req, res, next) => {
   try {
    const userid = req.session.user_id
    const userdata = await User.findOne({ _id: userid })
    if (userdata && userdata.blocked == true) {
      //  alert("you aaere blocked!!!")
        //swal('hello','blocked','success')
             

        console.log("Blocked by ADMIN")
        res.locals.blocked=true
        
        req.session.destroy()
      res.redirect('/login')
    }
    else{
        res.locals.blocked=false
        next()
    }
     
    
   } catch (error) {
    console.log(error.message)
   }
  }
  

module.exports={
    isLogin,
    isLogout,
    checkBlocked
}