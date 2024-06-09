const mongoose = require("mongoose");

const connectDB = async()=>{
        const connection = mongoose.connect("mongodb://127.0.0.1:27017/bayata2")
        .then(() => console.log("database connected"))
        .catch((err)=>console.log(err));
}

module.exports = connectDB;

