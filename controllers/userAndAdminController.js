const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Group = require('../models/groupsModel');
const ACCESS_TOKEN_SECERT = "ejkvbehjcdascdascacaqhwejvwcvgvccvgavhadbcdvchcbhsvailk";


const createUser = asyncHandler(async(req,res)=>{
    const user = await User.create(req.body);
    res.status(200).json(user);
});


const loginUser = asyncHandler(async (req,res) =>{
    const {email,password} = req.body;
    if(!email || !password){
        res.status(400).json({error:"all fields are manditory"});
    }
    const user = await User.findOne({email});    

    if(user){
        if(user.password===password){
            const accessToken = jwt.sign(
                {
                    user : {
                        id : user._id,
                        email:user.email,
                    }
                }, 
                ACCESS_TOKEN_SECERT,
            );
            res.status(200).json({token:accessToken});
        }
        else{
            res.status(215).json({error:"Username or password dont match"});
            console.log("Username or password dont match");

        }
    }else{
        res.status(215).json({error:"Faculty not found"});
        console.log("Faculty not found");

    }
});

const getUserData = asyncHandler(async(req,res)=>{
    const currentUser = await User.findOne({ _id: req.user.id} );
    res.json(currentUser);
});

const getAdmins = asyncHandler(async(req,res)=>{
    const admins = await User.find({isAdmin:true});
    res.status(200).json(admins);
});

const removeAdmin = asyncHandler(async (req, res) => {
    const adminId = req.query.id;


    const admin = await User.findById(adminId);
    if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
    }

    const joinedGroups = admin.joinedGroups;

    await User.findByIdAndDelete(adminId);

    for (const group of joinedGroups) {
        await deleteGroupByIdForAdmin(group.groupId);
    }

    res.status(200).json({ message: 'Admin and their groups deleted successfully' });
});

const deleteGroupByIdForAdmin = async (groupId) => {
    const group = await Group.findByIdAndDelete(groupId);
    if (!group) {
        return;
    }

    const users = await User.find();
    for (const user of users) {
        user.joinedGroups = user.joinedGroups.filter(group => group.groupId !== groupId);
        await user.save();
    }
};

const updateUserDetails = asyncHandler(async(req,res)=>{
    const userId = req.query.id;
    const updatedData = req.body;
    const user = await User.findByIdAndUpdate(userId, updatedData, { new: true, runValidators: true });
    
    if (!user) {
        res.status(404).json({ message: 'User not found' });
    } else {
        res.status(200).json(user);
    }
})



const createGroup = asyncHandler(async(req,res)=>{
    const group = await Group.create(req.body);
    const obj = {
        name:group.groupName,
        groupId:group._id,
        groupProfile:group.groupProfile
    }
    const user = await User.findById(group.groupAdminID);
    temp = user.joinedGroups;
    temp.push(obj);
    user.joinedGroups = temp;
    await user.save();

    res.status(200).json({message:"success"});
})


const getGroupData = asyncHandler(async(req,res)=>{
    const id = req.query.groupId;
    const group = await Group.findById(id);
    res.status(200).json(group);
})

const createFileUploadNow = asyncHandler(async(req,res)=>{
    const data = req.body;
    const id = req.query.groupId;
    const group = await Group.findById(id);
    group.groupContent.push(data);
    await group.save();
    
    res.status(200).json({message:"success"});    
})

const createFileUploadTime = asyncHandler(async(req,res)=>{
    const data = req.body;
    const id = req.query.groupId;
    const group = await Group.findById(id);
    group.timedGroupContent.push(data);
    await group.save();
    
    res.status(200).json({message:"success"});    
});

const deleteGroup = asyncHandler(async(req,res)=>{
    const id = req.query.groupId;
    const group = await Group.findByIdAndDelete(id); 
    const users = await User.find();
    for (const user of users) {
        user.joinedGroups = user.joinedGroups.filter(group => group.groupId !== id);
        await user.save();
    }

    res.status(200).json({ message: 'Group deleted successfully' });
})

const getAllGroups = asyncHandler(async(req,res)=>{
    const groups = await Group.find();
    res.status(200).json(groups);
})
const joinGroup = asyncHandler(async(req,res)=>{
    const userId = req.query.userId;
    const groupId = req.query.groupId;

    const user = await User.findById(userId);
    const group = await Group.findById(groupId);

    user.joinedGroups.push({name:group.groupName,groupId:groupId,groupProfile:group.groupProfile});
    await user.save();

    group.groupMembers.push({name:user.name,email:user.email,userID:userId,phoneNo:user.phoneNo})
    await group.save();

    res.status(200).json({message:"success"});    

});

const leaveGroup = asyncHandler(async(req,res)=>{
    const userId = req.query.userId;
    const groupId = req.query.groupId;

    const user = await User.findById(userId);
    const group = await Group.findById(groupId);

    user.joinedGroups = user.joinedGroups.filter(group => group.groupId !== groupId);
    await user.save();

    group.groupMembers = group.groupMembers.filter(group => group.userID !== userId);
    await group.save();
    res.status(200).json({message:"success"});    
})

module.exports = {updateUserDetails,removeAdmin,getAdmins,leaveGroup,joinGroup,getAllGroups,createUser,loginUser,getUserData,createGroup,getGroupData,createFileUploadNow,createFileUploadTime,deleteGroup}