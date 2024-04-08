const express = require('express');

const{auth, isDonor} = require("../middleware/auth")

const userCtrl = require('../controllers/userController.js');

const router = express.Router();

// routes
router.route("/Register").post(userCtrl.register);
router.route("/Login").post(userCtrl.Login);
router.route("/Logout").get(auth,userCtrl.logout);
router.route("/updatePassword").put(auth,userCtrl.updatePassword);
router.route("/forgotPassword").post(userCtrl.forgotPassword);
router.route("/resetPassword/:token").put(userCtrl.resetPassword);
// router.route("/updateProfile").post(auth,updateProfile);

router.route("/getAllCampaigns").get(userCtrl.getAllCampaigns);
router.route("/getCampaign/:id").get(userCtrl.getCampaignById);

// router.route("/Donation/:id").get(auth,isDonor,doDonation);//id=campaign

module.exports = router;