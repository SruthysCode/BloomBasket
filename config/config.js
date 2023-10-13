// multer
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
//const upload=multer({storage:storage})

// mongodb

const mongoose=require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/bloomBASKET")




 const sessionSecret = 'whoisseeingthis'
// const mailPassword= 'qpanwgabccnonknj'
// const mailUsername= 'sruthyrobin@gmail.com'

module.exports={
		 sessionSecret,
		// mailPassword,
		// mailUsername,

		//upload,
		multer,
		mongoose,
}
