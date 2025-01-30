const jwt = require("jsonwebtoken");
const User = require("../models/userSchema.js")

const Secret_Key = process.env.Secret_Key || "Faiz@123";

const userAuth = async function(req,res,next){
try{

    const {token} = req.cookies;

    if(!token){
        throw new Error("Please Login !")
    }

    const decodedMessage =  jwt.verify(token,Secret_Key)

    const user = await User.findById({_id : decodedMessage._id});

    if(!user){
        throw new Error("Invalid credentials")
    }

   

    req.user = user;
    next()
   
    
}catch(err){
    res.status(400).send("ERROR : " + err)
}

}

module.exports = userAuth;