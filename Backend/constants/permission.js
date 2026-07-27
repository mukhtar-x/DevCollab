const Permission = Object.freeze({
  DELETE_PROJECT: 'project:delete',
  UPDATE_PROJECT: 'project:update',
  MANAGE_MEMBERS: 'member:manage',
  CREATE_TASK: 'task:create',
  UPDATE_TASK: 'task:update',
  DELETE_TASK: 'task:delete',
  READ_TASK: 'task:read',
  COMMENT: 'task:comment',
  MEMEBR: 'project:member'
});

const ROLE_PERMISSIONS = {
  Owner: [
    Permission.DELETE_PROJECT,
    Permission.UPDATE_PROJECT,
    Permission.MANAGE_MEMBERS,
    Permission.CREATE_TASK,
    Permission.UPDATE_TASK,
    Permission.DELETE_TASK,
    Permission.COMMENT,
    Permission.MEMEBR,
    Permission.READ_TASK
  ],
  Admin: [
    Permission.UPDATE_PROJECT,
    Permission.MANAGE_MEMBERS,
    Permission.CREATE_TASK,
    Permission.UPDATE_TASK,
    Permission.DELETE_TASK,
    Permission.COMMENT,
    Permission.MEMEBR,
    Permission.READ_TASK
  ],
  PM: [
    Permission.CREATE_TASK,
    Permission.COMMENT,
    Permission.MEMEBR,
    Permission.READ_TASK
  ],
  Developer: [
    Permission.CREATE_TASK,
    Permission.COMMENT,
    Permission.MEMEBR,
    Permission.READ_TASK,
    Permission.MANAGE_MEMBERS
  ],
  Tester: [
    Permission.CREATE_TASK,
    Permission.COMMENT,
    Permission.MEMEBR,
    Permission.READ_TASK
  ],
  Guest: [] // Read-only
};

module.exports = {
  Permission,
  ROLE_PERMISSIONS
};