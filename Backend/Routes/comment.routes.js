const { Permission } = require("../constants/permission");
const AuthorizationMiddleware = require("../middlewares/authorization.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");
const commentController = require("../controllers/comment.controller.js");

const router = require("express").Router();


router.route("/:projectId/tasks/:taskId/comments")
.post(AuthorizationMiddleware, requirePermission(Permission.COMMENT), commentController.createComment)
.get(AuthorizationMiddleware, requirePermission(Permission.COMMENT), commentController.getTaskComments);

router.route("/:projectId/comments/:commentId")
.patch(AuthorizationMiddleware, requirePermission(Permission.COMMENT), commentController.updateComment)
.delete(AuthorizationMiddleware, requirePermission(Permission.COMMENT), commentController.deleteComment);

module.exports = router;
