const mongoose = require("mongoose");

const connectDB = async()=>{
        const connection = mongoose.connect("mongodb+srv://saitharakreddyv59:tharak@tharak.k1lxca6.mongodb.net/bayata2")
        .then(() => console.log("database connected"))
        .catch((err)=>console.log(err));
}

module.exports = connectDB;

