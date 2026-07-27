const Router = require("express").Router();
const { uploadSingleAvatar } = require("../config/multer.js");
const userController = require("../controllers/user.controller.js");
const authorizationMiddleware = require("../middlewares/authorization.middleware.js");

Router.route("/profile").get(authorizationMiddleware, userController.getUserProfile);
Router.route("/profile").put(authorizationMiddleware, uploadSingleAvatar, userController.updateUserProfile);
// Router.route("/:userId/projects").get(authorizationMiddleware, userController.getProjectsByUserId);
Router.route("/projects").get(authorizationMiddleware, userController.getUserProjects);


module.exports = Router;