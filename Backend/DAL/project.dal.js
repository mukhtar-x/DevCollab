const Project = require("../Models/project.model.js");
const ProjectMemberDal = require("../DAL/projectMember.dal.js");

class projectDal {
    constructor() { };

    async getProjectByKey(key, value) {
        if (!key || !value) return null;

        return await Project.findOne({ [key]: value }).lean();
    };

    async getProjectsByUserId(userId) {
        if (!userId) return [];

        const memberShips = await ProjectMemberDal.getUserMemberShips(userId);

        if (!memberShips?.length) return [];


        const roleMap = memberShips.reduce((acc, m) => {
            acc[m.projectId.toString()] = m.role;
            return acc;
        }, {});


        const projectIds = memberShips.map(m => m.projectId);

        let projects = await Project.find({ _id: { $in: projectIds } }).lean();

        return projects.map(project => ({
        ...project,
        currentUserRole: roleMap[project._id.toString()] || null
    }));
    };

    async createProject(userId, data) {
        if (!userId || !data) return null;

        return await Project.create({ ownerId: userId, ...data });
    };

    async deleteProject(projectId) {
        if (!projectId) return null;

        return await Project.findOneAndDelete({ _id: projectId });
    };

    async updateProject(projectId, updatedData) {
        if (!projectId, !updatedData) return null;

        return await Project.findOneAndUpdate({ _id: projectId }, { "$set": updatedData }, { new: true }).lean();
    };


};

module.exports = new projectDal(); 