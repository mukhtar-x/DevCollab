const { default: mongoose } = require("mongoose");
const Task = require("../Models/task.model.js");

class taskDal {
    constructor() { };


    async createTask(taskData) {
        if (!taskData || Object.entries(taskData)?.length == 0) return null;

        return await Task.create(taskData);
    };

    async getTasksByQuery(query, limit) {
        if (!query || Object.entries(query).length == 0) return null;

        // Query limit + 1 to check if another page exists
        return await Task.find(query)
            .sort({ _id: -1 })
            .limit(limit + 1)
            .lean();

    }

    async getTaskByKey(key) {
        if (!key || Object.entries(key).length === 0) return null;

        return await Task.findOne(key)
            .populate({
                path: 'assigneesId',
                select: 'email',
                model: 'ProjectMember'
            })
            .lean();
    };

    async updateTask(key, data) {
        if (!key || Object.entries(key).length == 0 || !data || Object.entries(data).length == 0) return null;

        return await Task.findOneAndUpdate(key, { '$set': data }, { returnDocument: 'after' }).lean();
    };

    async deleteTask(key) {
        if (!key || Object.entries(key).length == 0) return null;

        return await Task.findOneAndDelete(key);
    };

  async getProjectTaskStats(projectId) {
    const objectId = new mongoose.Types.ObjectId(projectId);
    const now = new Date();

    const [result] = await Task.aggregate([
      { $match: { projectId: objectId } },
      {
        $facet: {
          // Tasks grouped by status
          statusCounts: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          // Overdue tasks count (dueDate < now AND status != COMPLETED)
          overdueCount: [
            {
              $match: {
                dueDate: { $lt: now },
                status: { $ne: 'completed' }
              }
            },
            { $count: 'count' }
          ],
          // Total tasks count
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ]);

    // Format statusCounts array into a key-value object map
    const statusMap = {
      todo: 0,
      inprogress: 0,
      completed: 0
    };

    if (result && result.statusCounts) {
      result.statusCounts.forEach((item) => {
        if (item._id) {
          statusMap[item._id] = item.count;
        }
      });
    }

    const totalTasks = result?.totalCount[0]?.count || 0;
    const overdueTasks = result?.overdueCount[0]?.count || 0;

    return {
      totalTasks,
      overdueTasks,
      statusMap
    };
  }
};


module.exports = new taskDal;