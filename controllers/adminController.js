const User = require("../models/user");
const Campaign = require("../models/campaign");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const Organization = require("../models/organization");

const adminController = {
    addAdmin: async (req, res) => {
        try {
            const { fullname, email, gender, profilePicture, phoneNumber,} = req.body;

            if (!fullname || !email || !gender || !phoneNumber) {
                return res.status(403).send({
                    success: false,
                    message: "All Fields are required",
                });
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "User already exists. Please sign in to continue.",
                });
		    }

            let newProfilePicture = profilePicture; 
            if(!profilePicture) newProfilePicture=`https://api.dicebear.com/5.x/initials/svg?seed=${fullname}`;

            const password = phoneNumber.slice(-5);

            const newUser = new User({
                fullname,
                email,                password,
                role: "Admin",
                gender,
                profilePicture: newProfilePicture,
                phoneNumber,
            });

            const user = await newUser.save();

            await sendEmail({
                to: email,
                subject: "your Password",
                text: `Hello new admin, your password is the last 5 digits of your phone number. Please change it immediately after logging in.`,
              });

            res.status(200).json({
				success: true,
				msg: "Admin Registered Successfully",
				user,
            });
        } catch (err) {
            console.log("error");
            return res.status(500).json({ msg: err.message });
        }
    },


    getAllDonors: async (req, res) => {
        try {
            const donors = await User.find({role: "donor"}).select("-password");

            res.status(200).json({
                success: true,
                result: donors.length,
                donors,
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getAllVolunteers: async (req, res) => {
        try {
            const volunteers = await User.find({role: "volunteer"}).select("-password");

            res.status(200).json({
                success: true,
                result: volunteers.length,
                volunteers,
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getAllAdmins: async (req, res) => {
        try {
            const admins = await User.find({role: "Admin"}).select("-password");

            res.status(200).json({
                success: true,
                result: admins.length,
                admins,
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },


    getAllOrganizations: async (req, res) => {
        try {
            const org = await Organization.find().select("-password").populate("campaigns");

            res.status(200).json({
                success: true,
                result: org.length,
                org,
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },


    getAllCampaigns: async (req, res) => {
        try {
            const campaigns = await Campaign.find().populate('organization', 'name description contact');

            res.status(200).json({
                success: true,
                result: campaigns.length,
                campaigns,
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },


    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findById(id).select("-password");

            res.status(200).json({
                success: true,
                user,
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getCampaignById: async (req, res) => {
        try {
            const { id } = req.params;
            const campaign = await Campaign.findById(id).populate('organization', 'name description contact');

            res.status(200).json({
                success: true,
                campaign,
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getOrganizationById: async (req, res) => {
        try {
            const { id } = req.params;
            const org = await Organization.findById(id).select("-password").populate("campaigns");

            res.status(200).json({
                success: true,
                org,
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = adminController;