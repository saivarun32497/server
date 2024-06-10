const express = require('express');
const { createUser, loginUser, getUserData, createGroup, getGroupData, createFileUploadNow, createFileUploadTime, deleteGroup, getAllGroups, joinGroup, leaveGroup, getAdmins, removeAdmin, updateUserDetails } = require('../controllers/userAndAdminController');
const validateToken = require('../config/tokenValidator');
const router = express.Router();

router.route("/createUser").post(createUser);
router.route("/login").post(loginUser);
router.route("/getUserData").get(validateToken,getUserData);

router.route("/createGroup").post(createGroup);
router.route("/getGroupData").get(getGroupData);
router.route('/createFileUploadNow').post(createFileUploadNow);
router.route('/createFileUploadTime').post(createFileUploadTime)
router.route('/deleteGroup').get(deleteGroup)
router.route('/getAllGroups').get(getAllGroups)
router.route('/joinGroup').get(joinGroup)
router.route('/leaveGroup').get(leaveGroup)
router.route('/getAdmins').get(getAdmins);
router.route('/removeAdmin').get(removeAdmin);

router.route('/updateUserDetails').post(updateUserDetails);









module.exports = router;