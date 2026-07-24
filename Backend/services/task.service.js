const taskDal = require("../DAL/task.dal");
const CustomError = require("../utils/CustomError");
const eventBus = require("../events/log.event")

class taskService {
    constructor() { };


    async createTask(reporterId, projectId, projectData) {
        if (!reporterId || !projectId || Object.entries(projectData)?.length == 0) throw new CustomError(400, "Required Details Missing");

        if (projectData?.assigneesId?.length == 0) throw new CustomError(400, "Task must be assigned to atleast one member");

        if (projectData?.dueDate && new Date(projectData.dueDate) < Date.now()) throw new CustomError(400, "Invalid Due Date");

        if (!['low', 'medium', 'high'].includes(projectData?.priority?.toLowerCase())) throw new CustomError(400, "Invalid Priority");

        const createdTask = await taskDal.createTask({
            projectId,
            reporterId,
            title: projectData?.title,
            description: projectData?.description,
            status: projectData?.status,
            priority: projectData?.priority || 'medium',
            dueDate: projectData?.dueDate || null,
            assigneesId: projectData?.assigneesId
        });

        if (!createdTask) throw new CustomError(400, "Error Creating Task");

        eventBus.emit('activity:log', {
            projectId,
            actorId: reporterId,
            action: 'TASK_CREATED',
            targetType: 'TASK',
            targetId: createdTask._id
        });

        return createdTask;
    };


    async getTasks(projectId, queryParams) {
        if (!projectId) throw new CustomError(400, "ProjectId is required");

        const { status, priority, search, limit = 10, cursor } = queryParams;
        const parsedLimit = parseInt(limit, 10);

        let searchQueryObject = { projectId };

        if (status) searchQueryObject['status'] = status;
        if (priority) searchQueryObject['priority'] = priority;

        if (search) {
            searchQueryObject.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        };

        if (cursor) searchQueryObject._id = { $lt: cursor };

        const tasks = await taskDal.getTasksByQuery(searchQueryObject, parsedLimit);

        if (!tasks || tasks?.length == 0) return { tasks: [], nextCursor: null, hasNextPage: false };

        const hasNextPage = tasks.length > parsedLimit;
        if (hasNextPage) tasks.pop();

        const nextCursor = tasks?.length > 0 ? tasks[tasks?.length - 1]._id : null;

        return {
            tasks,
            nextCursor,
            hasNextPage
        };
    };

    async getTask(projectId, taskId) {
        if (!projectId || !taskId) throw new CustomError(400, "ProjectId or TaskId is required");

        const task = await taskDal.getTaskByKey({ projectId, _id: taskId });

        if (!task) throw new CustomError(404, "Task not found");

        return task;
    };

    async updateTask(projectId, taskId, updatedData) {
        if (!projectId || !taskId) throw new CustomError(400, "ProjectId or TaskId is required");

        let updates = {};
        let updateExist = false;

        Object.entries(updatedData).forEach(([key, value]) => {
            if (value !== undefined && (typeof value !== 'string' || value.trim().length !== 0)) {
                updates[key] = value;
                updateExist = true;
            }
        });

        if (!updateExist) throw new CustomError(400, "No valid fields provided for update");

        const updatedTask = await taskDal.updateTask({ projectId, _id: taskId }, updates);
        if (!updatedTask) throw new CustomError(404, "Task not found");

        eventBus.emit('activity:log', {
            projectId,
            actorId: updatedTask?.reporterId,
            action: 'TASK_UPDATED',
            targetType: 'TASK',
            targetId: updatedTask._id
        });


        return updatedTask;
    }


    async deleteTask(projectId, taskId) {
        if (!projectId || !taskId) throw new CustomError(400, "ProjectId or TaskId is required");

        await taskDal.deleteTask({ projectId, _id: taskId });

        return true;
    };

    async updateTaskStatus(projectId, taskId, status) {
        if (!projectId || !taskId) throw new CustomError(400, "ProjectId or TaskId is required");

        if (!['in-progress', 'completed', 'to-do'].includes(status?.toLowerCase())) throw new CustomError(400, "Invalid Status Update");

        const updatedTask = await taskDal.updateTask({ projectId, _id: taskId }, { status: status });

        return updatedTask;
    }
}

module.exports = new taskService();