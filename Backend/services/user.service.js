const { uploadImageBuffer } = require("../config/cloudinary.js");
const profileDal = require("../DAL/profile.dal");
const projectDal = require("../DAL/project.dal.js");
const userDal = require("../DAL/user.dal");
const CustomError = require("../utils/CustomError.js");
const { logger } = require("../utils/reusable.js");


class UserService {
    constructor() { };


    async getUserProfile(userId) {

        if (!userId) throw new CustomError(400, "Missing Paraams");

        const [userDoc, profileDoc] = await Promise.all([
            userDal.findUserByKey("_id", userId),
            profileDal.findProfileByUserId(userId)
        ]);


        if (!userDoc || !profileDoc) throw new CustomError(404, "User Profile Not Found");

        const user = userDoc.toObject();
        const profile = profileDoc.toObject();

        return {
            user: {
                _id : user._id,
                email: user.email,
            },
            profile: {
                _id: profile._id,
                name: profile.name,
                avatar: profile.avatar,
                bio: profile.bio,
                skills: profile.skills
            }
        };
    };


    async updateUserProfile(userId, profileUpdates, file) {

        if (!userId || !profileUpdates || typeof profileUpdates !== "object" || Object.keys(profileUpdates).length === 0) throw new CustomError(400, "Forbidden");

        const profileDoc = await profileDal.findProfileByUserId(userId);

        if (!profileDoc) throw new CustomError(404, "Profile Not Found");

        profileDoc.toObject();

        const allowedUpdates = ["avatar", "bio", "name", "skills"];
        const filteredUpdates = {};
        let isChanged = false;


        Object.entries(profileUpdates).forEach(([key, value]) => {
            if (allowedUpdates.includes(key) && value != undefined && profileDoc[key] !== value) {
                filteredUpdates[key] = value;
                isChanged = true;
            }
        });

        if (file?.buffer) {
            logger("Uploading to Cloud");
            const uploaded = await uploadImageBuffer(file.buffer);

            filteredUpdates.avatar = uploaded.secure_url;
            isChanged = true;
        }

        if (!isChanged) {
            throw new CustomError(400, "No changes detected, profile remains identical");
        };

        const updatedProfile = await profileDal.updateProfile(userId, filteredUpdates);

        if (!updatedProfile) {
            throw new CustomError(400, "Update Failed");
        }

        return updatedProfile;
    };

    async getUserProjects(loggedInUserId) {
        if (!loggedInUserId) throw new CustomError(400, "Forbidden: You're not logged In");

        const projects = await projectDal.getProjectsByUserId(loggedInUserId);

        if (!projects) return [];

        return projects;
    
    }

};


module.exports = new UserService();