const Router = require("express").Router();
const authorizationMiddleware = require("../middlewares/authorization.middleware.js");
const projectController = require("../controllers/project.controller.js");
const { requirePermission } = require("../middlewares/permission.middleware.js");
const { Permission } = require("../constants/permission.js");


// Router.route("/");

Router.route("/create").post(authorizationMiddleware, projectController.createProject);

Router.route("/:projectId")
    .delete(authorizationMiddleware, requirePermission(Permission.DELETE_PROJECT), projectController.deleteProject)
    .put(authorizationMiddleware, requirePermission(Permission.UPDATE_PROJECT), projectController.updateProject)
    .get(authorizationMiddleware, projectController.getProjectById);

Router.route("/:projectId/invitations")
    .get(authorizationMiddleware, requirePermission(Permission.MANAGE_MEMBERS), projectController.getProjectInvitations)
    .post(authorizationMiddleware, requirePermission(Permission.MANAGE_MEMBERS), projectController.inviteMember)
    .delete(authorizationMiddleware, requirePermission(Permission.MANAGE_MEMBERS), projectController.removeProjectInvitation);

Router.route("/:projectId/members")
    .get(authorizationMiddleware, requirePermission(Permission.MANAGE_MEMBERS), projectController.getProjectMembers)
    .delete(authorizationMiddleware, requirePermission(Permission.MANAGE_MEMBERS), projectController.removeProjectMember);

Router.route("/:projectId/activity-logs")
.get(authorizationMiddleware, requirePermission(Permission.MEMEBR), projectController.getActivityLogs);    

Router.route("/:projectId/project-stats")
.get(authorizationMiddleware, requirePermission(Permission.MEMEBR), projectController.getProjectStats);

module.exports = Router;
