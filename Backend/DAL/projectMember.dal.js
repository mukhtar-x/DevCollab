const ProjectMember = require("../Models/projectMember.model.js");
const CustomError = require("../utils/CustomError.js");

class projectMemberDal { 
    constructor(){};

   async getProjectMember (userId, projectId) {
        if (!userId || !projectId) return null;
        return await ProjectMember.findOne({ userId, projectId }).lean();
    }

    async getUserMemberShips (userId) {
        if (!userId) return null;

        return await ProjectMember.find({userId}).lean();
    }

    async getProjectMembers (projectId) {
        if (!projectId) return null;

        return await ProjectMember.find({projectId}).lean();
    }

    async createProjectMember (memberObj) {
        if (!memberObj || Object.entries(memberObj)?.length == 0) return null;
        return (await ProjectMember.create(memberObj)).toObject();
    };

    async deleteProjectMember (userId, projectId) {
        if (!userId || !projectId) return null;
        return await ProjectMember.findOneAndDelete({ projectId, userId });
    };

    async findAllProjectMembers (projectId) {
        if (!projectId) return []; 

        return await ProjectMember.find({ projectId }).lean();
    };

    async deleteProjectMembers (projectId, userId) {
        let idkey = 'projectId';
        let idvalue = projectId;
        if (!projectId && !userId) return null;

        if (!projectId) {
            idkey = 'userId';
            idvalue = userId;
        }

        return await ProjectMember.deleteMany({[idkey] : idvalue});
    }
}

module.exports = new projectMemberDal();