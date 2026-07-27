const invitationService = require("../services/invitation.service.js");
const projectService = require("../services/project.service.js");
const CustomError = require("../utils/CustomError.js");

const createProject = async (req, res, next) => {
    try {
        const { projectData } = req.body;
        const user = req.user;

        const response = await projectService.createProject(user, projectData);

        return res.status(201).json({
            success: true,
            message: "Project created Successfully",
            project: response
        });
    } catch (error) {
        next(error);
    }
};

const deleteProject = async (req, res, next) => {
    try {
        const projectId = req.params?.projectId;
        const user = req.user;

        const response = await projectService.deleteProject(user._id, projectId);

        return res.status(200).json({
            success: true,
            message: "Project Deleted Successfully"
        });
    } catch (error) {
        next(error);
    }
};


const updateProject = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const user = req.user;
        const { updatedProjectData } = req.body;

        const response = await projectService.updateProject(user._id, projectId, updatedProjectData);

        return res.status(200).json({
            success: true,
            message: "Project Details Updated Successfully",
            project: response
        });
    } catch (error) {data
        next(error);
    }
};

const getProjectById = async (req, res, next) => {
    try {
        const projectId = req.params?.projectId;
        const user = req.user;

        const response = await projectService.getProjectById(user._id, projectId);

        return res.status(200).json({
            success: true,
            message: "Project Fetched Successfully",
            project: response
        });
    } catch (error) {
        next(error);
    }
};


const inviteMember = async (req, res, next) => {
    try {
        const projectId = req.params?.projectId;
        const { email, role } = req.body;
        const currentUserEmail = req.projectMember?.email;

        if (!email || !projectId || !role) throw new CustomError(400, "Email or Project Required To Invite Member");

        const response = await invitationService.inviteMemberByEmail(email, role, projectId, currentUserEmail);

        return res.status(200).json({
            success: true,
            message: `Invitation send successfully to ${email}`,
            invitation: response
        });
    } catch (error) {
        next(error);
    }
};

const getProjectMembers = async (req, res, next) => {
    try {
        const projectId = req.params?.projectId;

        const response = await projectService.getProjectMembers(projectId);

        return res.status(200).json({
            success: true,
            message: "Member fetched successfully",
            members: response
        });
    } catch (error) {
        next(error);
    }
};

const getProjectInvitations = async (req, res, next) => {
    try {
        const projectId = req.params?.projectId;

        const response = await projectService.getProjectInvitations(projectId);

        return res.status(200).json({
            success: true,
            message: "Invitations fetched successfully",
            invitations: response
        });
    } catch (error) {
        next(error);
    }
};

const removeProjectMember = async (req, res, next) => {
    try {
        const projectId = req.params?.projectId;
        const memberId = req.body?.memberId;

        const response = await projectService.removeProjectMember(projectId, memberId);

        return res.status(200).json({
            success: true,
            message: "Member Removed successfully",
            members: response
        });
    } catch (error) {
        next(error);
    }
};

const removeProjectInvitation = async (req, res, next) => {
    try {
        const projectId = req.params?.projectId;
        const email = req.body?.email;

        const response = await projectService.removeProjectInvitation(projectId, email);

        return res.status(200).json({
            success: true,
            message: "Invitation Removed successfully",
            invitations: response
        });
    } catch (error) {
        next(error);
    }
};

const getActivityLogs = async (req, res, next) => {
    try {
        const projectId = req.params?.projectId;

        const response = await projectService.getProjectLogs(projectId, req.query);

        return res.status(200).json({
            success: true,
            message: "Logs Fetched Successfully",
            logs: response.logs,
            pagination: response.pagination,
        })
    } catch (error) {
        next(error);
    }
};

const getProjectStats = async (req, res, next) => {
    try {
        const projectId = req.params?.projectId;
        
        const response = await projectService.getProjectStats(projectId);

        return res.status(200).json({
            success : true,
            message : "Stats Fetched Successfully",
            stats : response
        })
    } catch (error) {
        next(error);
    }
};




module.exports = {
    createProject,
    deleteProject,
    updateProject,
    getProjectById,
    inviteMember,
    getProjectInvitations,
    getProjectMembers,
    removeProjectInvitation,
    removeProjectMember,
    getActivityLogs,
    getProjectStats
};