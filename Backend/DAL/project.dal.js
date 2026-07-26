const Project = require("../Models/project.model.js");

class projectDal {
    constructor(){};

    async getProjectByKey (key, value){
        if (!key || !value) return null; 

        return await Project.findOne({ [key] : value }).lean();
    };

    async getProjectsByUserId (userId) {
        if (!userId) return []; 

     
        return await Project.find({ ownerId: userId }).lean(); 
    };

    async createProject (userId, data) {
        if (!userId || !data) return null;
        
        return await Project.create({ ownerId: userId, ...data });
    };

    async deleteProject (projectId) {
        if (!projectId) return null;

        return await Project.findOneAndDelete({_id:projectId});
    };

    async updateProject (projectId, updatedData) {
        if (!projectId, !updatedData) return null;

        return await Project.findOneAndUpdate({_id : projectId}, {"$set" : updatedData}, {new : true}).lean();
    };


};

module.exports = new projectDal(); 