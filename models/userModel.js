const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phoneNo:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isAdmin:{
        type:Boolean,
        required:true
    },
    joinedGroups:[{
        name:{
            type:String,
            required:true           
        },
        groupId:{
            type:String,
            required:true           
        },
        groupProfile:{
            type:String,
            required:true           
        },
    }]
});

module.exports = mongoose.model('usermodel',userSchema);
