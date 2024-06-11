const mongoose = require("mongoose");

const connectDB = async()=>{
        const connection = mongoose.connect("mongodb+srv://saivarun3241:varun@cluster0.rumxkm1.mongodb.net/sip")
        .then(() => console.log("database connected"))
        .catch((err)=>console.log(err));
}

module.exports = connectDB;

