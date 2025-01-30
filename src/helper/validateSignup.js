const validator = require("validator")

const validateSignup = function(req){
    const {firstName,lastName,emailId,age,gender} = req.body;


    if(!validator.isAlpha(firstName) || !validator.isAlpha(lastName) || !validator.isAlpha(gender)){
        throw new Error("Please Enter Only Alphabates in (firstNAme,lastName,gender).....")        
    }

    if(!validator.isEmail(emailId)){
        throw new Error("Please Enter Valid Email Id.....")
    }

    if(!validator.isInt(age.toString())){
        throw new Error("Please Enter a Numeric value in age....")
    }

    
}

module.exports = validateSignup;