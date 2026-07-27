const { ROLE_PERMISSIONS } = require("../constants/permission");
const projectMemberDal = require("../DAL/projectMember.dal");
const CustomError = require("../utils/CustomError");

const requirePermission = (requiredPermission) => {
    return async(req, res, next) => {
        try {
            const userId = req.user?._id;
            const projectId = req.params.projectId;

            if (!projectId) throw new CustomError(400, "Project Id is required");

            const member = await projectMemberDal.getProjectMember(userId, projectId);

            if (!member) throw new CustomError(403, "Forbidden: You are not a member of this project");

            const assignedPermissions = ROLE_PERMISSIONS[member.role] || [];

            if (!assignedPermissions.includes(requiredPermission)) throw new CustomError(403, `Forbidden: Lacking required permission [${requiredPermission}]`);

            req.projectMember = member;
            next();
        } catch (error) {
            next(error);    
        }
    }
};


module.exports = {requirePermission};