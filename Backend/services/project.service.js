const invitationDal = require("../DAL/invitation.dal");
const projectDal = require("../DAL/project.dal");
const projectMemberDal = require("../DAL/projectMember.dal");
const CustomError = require("../utils/CustomError");
const eventBus = require("../events/log.event");
const activityLogDal = require("../DAL/activitylog.dal");
const taskDal = require("../DAL/task.dal");
const { ROLE_PERMISSIONS } = require("../constants/permission");

class projectService {
    constructor() { };


    async createProject(user, data) {
        if (!user._id || !user.email || !data || Object.keys(data).length === 0) throw new CustomError(500, "Invalid Data");

        const project = await projectDal.createProject(user._id, data);

        if (!project) throw new CustomError(400, "Error Creating Project");

        const isAlreadyMember = await projectMemberDal.getProjectMember(user._id, project._id);

        if (isAlreadyMember) {
            return project;
        }
        const memberAdded = await projectMemberDal.createProjectMember({
            projectId: project._id,
            userId: user._id,
            email: user.email,
            role: 'Owner'
        });
        if (!memberAdded) throw new CustomError(400, "Project Owner didn't become owner");

        return project;
    };


    async deleteProject(userId, projectId) {
        if (!projectId || !userId) throw new CustomError(404, "Project ID, UserId required");

        const project = await projectDal.getProjectByKey('_id', projectId);

        if (!project) throw new CustomError(404, "Project not Found");

        if (project?.ownerId != userId) throw new CustomError(404, "Forbidden");

        const isProjectDeleted = await projectDal.deleteProject(projectId);

        if (!isProjectDeleted) throw new CustomError(400, "Error Deleting project");

        await projectMemberDal.deleteProjectMembers(projectId);
    };

    async updateProject(userId, projectId, updatedData) {
        if (!projectId || !userId || Object.entries(updatedData)?.length == 0) throw new CustomError(404, "Project ID, UserId, Updated Feilds required");

        const project = await projectDal.getProjectByKey('_id', projectId);
        if (!project) throw new CustomError(404, "Project not Found");

        if (project?.ownerId != userId) throw new CustomError(404, "Forbidden");

        const allowedUpdates = ['title', 'description', 'visibility'];
        const updatedContent = {};
        let hasChange = false;

        Object.entries(updatedData).forEach(([key, value]) => {
            if (allowedUpdates.includes(key) && value !== undefined && String(value).trim().length > 0) {
                updatedContent[key] = value;
                hasChange = true;
            }
        });

        if (!hasChange) return project;

        const updatedProject = await projectDal.updateProject(projectId, updatedContent);

        if (!updatedProject) {
            throw new CustomError(500, "Failed to update project. Please try again.");
        }

        eventBus.emit('activity:log', {
            projectId: updatedProject._id,
            actorId: userId,
            action: 'PROJECT_UPDATED',
            targetType: 'PROJECT',
            targetId: updatedProject._id
        });

        return updatedProject;
    }

    async getProjectById(userId, projectId) {
        if (!projectId || !userId) throw new CustomError(404, "Project ID, UserId required");

        const project = await projectDal.getProjectByKey('_id', projectId);
        if (!project) {
            throw new CustomError(404, "Project not found");
        }

        const membership = await projectMemberDal.getProjectMember(userId, projectId);

        if (project.visibility === 'private' && !membership) {
            throw new CustomError(403, "Access Denied: You do not have access to this project");
        }
        const currentUserRole = membership ? membership.role : 'Guest';
        const userPermissions = ROLE_PERMISSIONS[currentUserRole] || [];

        return {
            ...project.toObject ? project.toObject() : project,
            currentUserRole,
            userPermissions
        };
    };

    async getProjectMembers(projectId) {
        if (!projectId) throw new CustomError(404, "Project ID is required");

        const projectMembers = await projectMemberDal.getProjectMembers(projectId);

        return projectMembers;
    }

    async getProjectInvitations(projectId) {
        if (!projectId) throw new CustomError(404, "Project ID is required");

        const projectInvitations = await invitationDal.getInvitations('projectId', projectId);

        return projectInvitations;
    }

    async getProjectLogs(projectId, queryOptions) {
        if (!projectId) throw new CustomError(404, "Project ID is required");

        const page = parseInt(queryOptions.page, 10) || 1;
        const limit = parseInt(queryOptions.limit, 10) || 20;
        const skip = (page - 1) * limit;

        // Execute DAL queries
        const [logs, total] = await Promise.all([
            activityLogDal.findLogsByProjectId(projectId, { skip, limit }),
            activityLogDal.countLogsByProjectId(projectId),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            logs,
            pagination: {
                totalItems: total,
                currentPage: page,
                totalPages: totalPages,
                pageSize: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        }
    };

    async getProjectStats(projectId) {
        if (!projectId) throw new CustomError(400, "Project ID is required");

        // Execute the task aggregation pipeline and activity count in parallel
        const [taskStats, activityCount] = await Promise.all([
            taskDal.getProjectTaskStats(projectId),
            activityLogDal.countLogsByProjectId(projectId)
        ]);

        const completedTasks = taskStats.statusMap.COMPLETED || 0;
        const completionRate = taskStats.totalTasks > 0
            ? Math.round((completedTasks / taskStats.totalTasks) * 100)
            : 0;

        return {
            totalTasks: taskStats.totalTasks,
            overdueTasks: taskStats.overdueTasks,
            activityCount: activityCount,
            completionRate: completionRate,
            tasksByStatus: taskStats.statusMap
        };
    };
};



module.exports = new projectService();