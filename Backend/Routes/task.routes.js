const router = require("express").Router();
const AuthorizationMiddleware = require("../middlewares/authorization.middleware");
const taskController = require("../controllers/task.controller.js");
const { requirePermission } = require("../middlewares/permission.middleware.js");
const { Permission } = require("../constants/permission.js");

router.route("/:id/tasks")
    .get(AuthorizationMiddleware, taskController.getProjectTasks)
    .post(AuthorizationMiddleware, requirePermission(Permission.CREATE_TASK), taskController.createProjectTask);

router.route("/:id/task/:taskId")
    .get(AuthorizationMiddleware, requirePermission(Permission.READ_TASK), taskController.getTask)
    .put(AuthorizationMiddleware, requirePermission(Permission.UPDATE_TASK), taskController.updateTask)
    .delete(AuthorizationMiddleware, requirePermission(Permission.DELETE_TASK), taskController.deleteTask);

router.route("/:id/task/:taskId/status")
    .patch(AuthorizationMiddleware, requirePermission(Permission.UPDATE_TASK), taskController.updateTaskStatus);


module.exports = router;