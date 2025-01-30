const mongoose = require('mongoose');


const connectDB = async function(){
    await mongoose.connect("mongodb+srv://faiz1999:Faiz1999@cluster0.rfus4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
}

module.exports = connectDB;