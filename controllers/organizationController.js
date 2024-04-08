const Campaign = require("../models/campaign");
const Organization = require("../models/organization");
// const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");


function generateRegistrationNumber() {
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const seconds = currentDate.getSeconds().toString().padStart(2, '0');

    // Concatenate components to create a unique registration number
    const registrationNumber = year + month + day + hours + minutes + seconds;

    return registrationNumber;
}


function getCurrentDateString() {
    // Get the current date
    const currentDate = new Date();

    // Extract the date components
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are zero-based
    const day = String(currentDate.getDate()).padStart(2, '0');

    // Concatenate the components to form the date string
    const dateString = `${day}-${month}-${year}`;

    return dateString;
}

const organizationController = {
    registerOrganization: async (req, res) => {
        try {
            const { name, username, description, email, password, confirmPassword, phoneNumber, city, state, country } = req.body;

            if (!name || !username || !description || !email || !password || !confirmPassword || !phoneNumber || !city || !state || !country) {
                return res.status(403).send({
                    success: false,
                    message: "All Fields are required",
                });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Password and Confirm Password do not match. Please try again.",
                });
            }

            let newUserName = username.toLowerCase().replace(/ /g, "");

            const organization = await Organization.findOne({ username: newUserName });
            if (organization) {
                return res.status(400).json({ msg: "This username is already taken." });
            }

            // const existingUser = await Organization.findOne({ email });
            // if (existingUser) {
            //     return res.status(400).json({
            //         success: false,
            //         message: "User already exists. Please sign in to continue.",
            //     });
            // }

            const registrationNumber = generateRegistrationNumber();
            console.log(registrationNumber);

            const newOrg = new Organization({
                name,
                username: newUserName,
                description,
                contact: {
                    email,
                    phoneNumber,
                    address: {
                        city,
                        state,
                        country,
                    }
                },
                registrationNumber,
                password,
            });

            const org = await newOrg.save();

            const token = org.getJwtToken();

            res.cookie("token", token, {
                path: "/",
                httpOnly: true,
                expires: new Date(Date.now() + 1000 * 86400), // 1 day
                sameSite: "none",
                secure: true,
            });

            res.status(200).json({
                success: true,
                msg: "Organization Registered Successfully",
                token,
                org,
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },


    organizationLogin: async (req, res) => {
        try {
            const { registrationNumber, password } = req.body;

            if (!registrationNumber || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Please Fill All the Required Fields",
                });
            }

            const org = await Organization.findOne({ registrationNumber });
            // console.log(user);

            if (!org) {
                return res.status(400).json({ msg: "Registration Number or Password is incorrect." });
            }

            const isMatch = await org.comparePassword(password);

            if (!isMatch) {
                return res.status(400).json({ msg: "Registration Number or Password is incorrect." });
            }

            const token = org.getJwtToken();

            res.cookie("token", token, {
                path: "/",
                httpOnly: true,
                expires: new Date(Date.now() + 1000 * 86400), // 1 day
                sameSite: "none",
                secure: true,
            });

            res.json({
                success: true,
                msg: "Logged in Successfully!",
                token,
                org: {
                    ...org._doc,
                    password: "",
                },
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    createCampaign: async (req, res) => {
        try {
            const { title, description, goalAmount, endDate, images, videos, campaignTags, city, state, country } = req.body;

            if (!title || !description || !goalAmount || !endDate || !campaignTags || !city || !state || !country) {
                return res.status(403).send({
                    success: false,
                    message: "All Fields are required",
                });
            }

            let todayDate = getCurrentDateString()

            const newCamp = new Campaign({
                title,
                description,
                organization: req.user.id,
                goalAmount,
                startDate: todayDate,
                endDate,
                campaignMedia: {
                    images,
                    videos,
                },
                campaignTags,
                location: {
                    city,
                    state,
                    country,
                },
            });

            console.log("newCamp=====", newCamp);

            await Organization.findOneAndUpdate(
                { _id: newCamp.organization },
                {
                    $push: { campaigns: newCamp._id },
                },
                { new: true }
            );

            const campaign = await newCamp.save();

            console.log(campaign);

            res.status(200).json({
                success: true,
                msg: "Campaign Registered Successfully",
                campaign,
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                msg: err.message
            });
        }
    },

    updateCampaign: async (req, res) => {
        try {
            const { title, description, goalAmount, endDate, images, videos, campaignTags, city, state, country } = req.body;

            const newCamp = await Campaign.findOneAndUpdate({
                    _id: req.params.id,
                    organization: req.user.id,
                },
                {
                    title,
                    description,
                    goalAmount,
                    endDate,
                    campaignMedia: {
                        images,
                        videos,
                    },
                    campaignTags,
                    location: {
                        city,
                        state,
                        country,
                    },
                },
                { new: true }
            )

            if(!newCamp) return res.status(500).json({
                success: false,
                msg: "You are not authorized to update this campaign."
            });

            res.status(200).json({
                success: true,
                msg: "Campaign Updated Successfully",
                newCamp,
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                msg: err.message
            });
        }
    },

    deleteCampaign: async (req, res) => {
        try {
            const campaign = await Campaign.findOneAndDelete({
                _id: req.params.id,
                organization: req.user.id, 
            });

            console.log(campaign);

            if(!campaign) return res.status(500).json({
                success: false,
                msg: "You are not authorized to Delete this campaign."
            });

            await Organization.findOneAndUpdate({ _id: campaign.organization }, {
                $pull: { campaigns: req.params.id }
              });
            
            res.status(200).json({
                success: true,
                msg: "Campaign Deleted Successfully",
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                msg: err.message
            });
        }
    }
};

module.exports = organizationController;