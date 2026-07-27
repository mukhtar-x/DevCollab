const commentService = require("../services/comment.service.js");

const createComment = async (req, res, next) => {
    try {
        const projectId = req.params?.projectId;
        const taskId = req.params?.taskId;
        const userId = req?.user?._id;
        const commentBody = req.body?.commentBody;

        const response = await commentService.createComment(projectId, taskId, userId, commentBody);

        return res.status(201).json({
            success : true,
            message : "Comment Posted Successfully",
            comment : response
        });
    } catch (error) {
        next(error);
    }
}

const getTaskComments = async (req, res, next) => {
    try {
        const projectId = req.params?.projectId;
        const taskId = req.params?.taskId;

        const response = await commentService.getTaskComments(projectId, taskId);

        return res.status(200).json({
            success : true,
            message : "Comment Fetched Successfully",
            comments : response
        });
    } catch (error) {
        next(error);
    }
}

const updateComment = async (req, res, next) => {
    try {
        const userId = req?.user?._id;
        const commentId = req.params?.commentId;
        const commentBody = req.body?.commentBody;


        const response = await commentService.updateComment(userId, commentId, commentBody);

        return res.status(201).json({
            success : true,
            message : "Comment Updated Successfully",
            comment : response
        });
    } catch (error) {
        next(error);
    }
}

const deleteComment = async (req, res, next) => {
    try {
        const userId = req?.user?._id;
        const commentId = req.params?.commentId;

        const response = await commentService.deleteComment(userId, commentId);

        return res.status(201).json({
            success : true,
            message : "Comment Removed Successfully",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createComment,
    updateComment, 
    deleteComment, 
    getTaskComments
};