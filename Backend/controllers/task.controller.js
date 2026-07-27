const taskService = require("../services/task.service.js");

const createProjectTask = async (req, res, next) => {
    try {
        const projectId = req.params?.projectId;
        const userId = req.user?._id;
        const { taskData } = req.body;

        const response = await taskService.createTask(userId, projectId, taskData);

        return res.status(201).json({
            success: true,
            message: "Task created Successfully",
            task: response
        });
    } catch (error) {
        next(error);
    }
};


const getProjectTasks = async (req, res, next) => {
    try {
        const queryParams = req.query;
        const projectId = req.params?.projectId;

        const response = await taskService.getTasks(projectId, queryParams);

        return res.status(200).json({
            success: true,
            message: "Tasks Fetched Successfully",
            tasks: response.tasks,
            pagination: {
                nextCursor: response.nextCursor,
                hasNextPage: response.hasNextPage
            }
        })
    } catch (error) {
        next(error);
    }
};

const getTask = async (req, res, next) => {
    try {
        const projectId = req.params?.projectId;
        const taskId = req.params?.taskId;

        const response = await taskService.getTask(projectId, taskId);

        return res.status(200).json({
            success: true,
            messgae: "Task details fetched successfully",
            task: response
        });
    } catch (error) {
        next(error);
    }
};

const updateTask = async (req, res, next) => {
    try {
        const projectId = req.params?.projectId;
        const taskId = req.params?.taskId;
        const { updatedTaskData } = req.body;

        const response = await taskService.updateTask(projectId, taskId, updatedTaskData);

        return res.status(200).json({
            success: true,
            messgae: "Task updated successfully",
            task: response
        });
    } catch (error) {
        next(error);
    }
};


const updateTaskStatus = async (req, res, next) => {
    try {
        const projectId = req.params?.projectId;
        const taskId = req.params?.taskId;
        const status = req.body?.status;

        const response = await taskService.updateTaskStatus(projectId, taskId, status);

        return res.status(200).json({
            success: true,
            messgae: "Task status updated successfully",
            task: response
        });
    } catch (error) {
        next(error);
    }
};


const deleteTask = async (req, res, next) => {
    try {
        const projectId = req.params?.projectId;
        const taskId = req.params?.taskId;

        const response = await taskService.deleteTask(projectId, taskId);

        return res.status(200).json({
            success: true,
            messgae: "Task deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProjectTask,
    getProjectTasks,
    getTask,
    updateTask,
    deleteTask,
    updateTaskStatus
};