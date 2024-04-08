const express = require('express');

const{auth, isAdmin} = require("../middleware/auth")

const adminCtrl = require('../controllers/adminController');

const router = express.Router();

router.route("/addAdmin").post(auth,isAdmin,adminCtrl.addAdmin);

router.route("/getAllDonors").get(auth,isAdmin,adminCtrl.getAllDonors);
router.route("/getAllVolunteers").get(auth,isAdmin,adminCtrl.getAllVolunteers);
router.route("/getAllAdmins").get(auth,isAdmin,adminCtrl.getAllAdmins);
router.route("/getAllOrganizations").get(auth,isAdmin,adminCtrl.getAllOrganizations);
router.route("/getAllCampaigns").get(auth,isAdmin,adminCtrl.getAllCampaigns);
// router.route("/getAllDonations").get(auth,isAdmin,getAllDonations);

router.route("/getUser/:id").get(auth,isAdmin,adminCtrl.getUserById);
router.route("/getCampaign/:id").get(auth,isAdmin,adminCtrl.getCampaignById);
router.route("/getOrganization/:id").get(auth,isAdmin,adminCtrl.getOrganizationById);
// router.route("/getDonation/:id").get(auth,isAdmin,getDonationById);


module.exports = router;