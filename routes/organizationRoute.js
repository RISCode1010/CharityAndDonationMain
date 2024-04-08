const express = require('express');

const{auth, isOrganization} = require("../middleware/auth")

const orgCtrl = require('../controllers/organizationController');

const router = express.Router();

// routes
router.route("/Register").post(orgCtrl.registerOrganization);
router.route("/Login").post(orgCtrl.organizationLogin);

// router.route("/updateOrganization").post(auth,isOrganization,updateOrganization);

router.route("/createCampaign").post(auth,isOrganization,orgCtrl.createCampaign);
router.route("/updateCampaign/:id").put(auth,isOrganization,orgCtrl.updateCampaign);
router.route("/deleteCampaign/:id").delete(auth,isOrganization,orgCtrl.deleteCampaign);

// router.route("/getCampaigns").get(auth,isOrganization,getMyCampaigns);
// router.route("/getCampaign/:id").get(auth,isOrganization,getMyCampaignById);

// router.route("/getDonations").get(auth,isOrganization,getMyCampaignDonations);
// router.route("/getDonations/:id").get(auth,isOrganization,getMyCampaignDonationById);


module.exports = router;