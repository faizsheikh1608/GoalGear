const mongoose = require("mongoose");
const validator = require("validator");

const {Schema} = mongoose;


const productSchema = new Schema({
    productName : {
        type : String,
        required : true,
        trim : true,
    },
    stock : {
        type : Number,
        trim : true,
        required : true,
    },
    description :
        {
            descriptionHeading : {
                type : String,
                required : true,
                trim : true,
            },
            descriptionData :{
                type : [String],    
            }
        }
    ,
    price : {
        type : Number,
        required : true,
        trim : true,
    },
    color : [
        {
            colorName: {
                type: String,
                required: true,
            },
            mainImageUrl: {
                type: String,
                required: true,
                validate(value) {
                    if (!validator.isURL(value)) {
                        throw new Error("Main image URL must be valid");
                    }
                },
            },
            hoverImageUrl: {
                type: String,
                required: true,
                validate(value) {
                    if (!validator.isURL(value)) {
                        throw new Error("Hover image URL must be valid");
                    }
                },
            },
        },
    ],
    category : {
        type : String,
        enum : {
            values : ['Shoes','Socks',"T-Shirts",'Shorts','Assecceires','Tracksuit','Football'],
            message : `{VALUE} is not a valid role`,
        },
        trim : true,
        required : true,
    },
    size : {
        type : [String],
        enum : {
            values : ['S','M',"L",'XL','7','8','9',10],
            message : `{VALUE} is not valid`,
        },
       
    }       

})


const Product = mongoose.model("Product" , productSchema);

module.exports = {
    Product
}