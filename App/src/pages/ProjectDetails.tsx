import React, { useEffect, useState } from 'react';
import {
  FolderGit2, Users, Settings, Activity, Calendar, PackageCheck,
  UserIcon, Loader2, ChevronDown, Search, Plus, AlertTriangle, CheckCircle2, ListTodo, Clock
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Breadcrumb from '../components/Breadcrumb';
import Card from '../components/Card';
import Tabs from '../components/Tabs';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import Dropdown from '../components/Dropdown';
import NotFound from './NotFound';
import TaskRow from '../components/TaskRow';
import { normalizeError } from '../utils/getErrorMessage';

import RenderInviteModal from '../components/modals/RenderInviteModal';
import RenderTaskModal, { type TaskFormState } from '../components/modals/RenderTaskModal';
import RenderTaskDetailModal from '../components/modals/RenderTaskDetailModal';

// Redux Actions
import { deleteProject, getProjectById, getProjectStats, updateProject } from '../redux/slices/projectSlide/project.actions';
import { getProjectMembers } from '../redux/slices/memberSlice/member.actions';
import { getProjectInvitations, inviteMemberByMail } from '../redux/slices/invitationSlice/invitation.actions';
import { createTask, deleteTask, getProjectTasks, getTaskDetails, updateTask } from '../redux/slices/taskSlice/task.actions';
import { deleteComment, getTaskComments, postComment, updateComment } from '../redux/slices/commentSlice/comment.actions';
import { getProjectActivityLogs } from '../redux/slices/activityLogSlice/activityLog.actions';
import { setPage } from '../redux/slices/activityLogSlice/activityLog.slice';
import CustomInput from '../components/CustomInput';
import { usePermissions } from '../hooks/usePemissions';

const ProjectDetails = () => {
  const params = useParams();
  const { id } = params;
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();

  // Redux Store Selectors
  const { project, loading: projectLoading, projectStats } = useSelector((state: any) => state.project || {});
  const { members, loading: memberLoading } = useSelector((state: any) => state.projectMembers || {});
  const { projectInvitations, loading: invitationLoading } = useSelector((state: any) => state.invitations || {});
  const { tasks, task: reduxTask, loading: taskLoading, pagination: taskPagination } = useSelector((state: any) => state.projectTasks || {});
  const { comments, loading: commentLoading } = useSelector((state: any) => state.projectTaskComments || {});
  const { user } = useSelector((state: any) => state.user || {});
  const { logs, loading: activityLoading, pagination: activityPagination } = useSelector((state: any) => state.projectActivityLogs || {});

  // Custom Permits Hook for UI
  const { hasPermit } = usePermissions(project?.userPermissions);

  // UI Navigation & Filtering State
  const [activeTab, setActiveTab] = useState('overview');
  const [taskFilters, setTaskFilters] = useState<{
    status: string | null;
    priority: string | null;
    search: string | null;
  }>({
    status: null,
    priority: null,
    search: null,
  });

  // Modal Open/Close Toggle States
  const [addInviteModalOpen, setAddInviteModalOpen] = useState(false);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);

  // Form States
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'Guest' });
  const [form, setForm] = useState({ title: '', description: '', visibility: '' });

  const [taskForm, setTaskForm] = useState<TaskFormState>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'to-do',
    dueDate: '',
    assigneesId: [],
  });

  const [editingTaskForm, setEditingTaskForm] = useState<TaskFormState>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'to-do',
    dueDate: '',
    assigneesId: [],
  });

  // Sync edit form data directly from Redux state when viewing task details
  useEffect(() => {
    if (reduxTask && taskDetailModalOpen) {
      const formattedDate = reduxTask.dueDate ? new Date(reduxTask.dueDate).toISOString().split('T')[0] : '';
      const mappedAssigneeIds = reduxTask.assigneesId?.map((a: any) => (typeof a === 'object' ? a._id : a)) || [];

      setEditingTaskForm({
        title: reduxTask.title || '',
        description: reduxTask.description || '',
        priority: reduxTask.priority || 'medium',
        status: reduxTask.status || 'to-do',
        dueDate: formattedDate,
        assigneesId: mappedAssigneeIds,
      });
    }
  }, [reduxTask, taskDetailModalOpen]);

  const fetchTasksWithFilters = (isLoadMore = false) => {
    dispatch(getProjectTasks({ id, filter: taskFilters, isLoadMore }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTasksWithFilters(false);
  };

  // Fetch tab-specific data on change
  useEffect(() => {
    if (id) {
      if (activeTab === 'overview') {
        dispatch(getProjectStats({ id }));
        dispatch(getProjectById({ id }));
        fetchTasksWithFilters(false);
      }
      else if (activeTab === 'settings') {
        dispatch(getProjectById({ id }));
      } else if (activeTab === 'tasks') {
        fetchTasksWithFilters(false);
        if (!members || members.length === 0) {
          dispatch(getProjectMembers({ id }));
        }
      } else if (activeTab === 'activity') {
        dispatch(getProjectActivityLogs({ id }));
      } else {
        dispatch(getProjectMembers({ id }));
        if (hasPermit('member:manage') || hasPermit('member:invite')) {
          dispatch(getProjectInvitations({ id }));
        }
      }
    }
  }, [dispatch, id, activeTab, taskFilters?.priority, taskFilters?.status]);

  useEffect(() => {
    if (id && addTaskModalOpen && (!members || members.length === 0)) {
      dispatch(getProjectMembers({ id }));
    }
  }, [dispatch, id, addTaskModalOpen, members]);

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title ?? '',
        description: project.description ?? '',
        visibility: project.visibility ?? '',
      });
    }
  }, [project]);

  if (!projectLoading && (!project || Object.entries(project).length === 0)) return <NotFound />;

  // Filter settings tab if user lacks any project modification rights
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FolderGit2 className="h-4 w-4" /> },
    { id: 'members', label: 'Members', icon: <Users className="h-4 w-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <PackageCheck className="h-4 w-4" /> },
    { id: 'activity', label: 'Activity Logs', icon: <Activity className="h-4 w-4" /> },
    ...(hasPermit('project:update') || hasPermit('project:delete')
      ? [{ id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> }]
      : []),
  ];

  const handleLoadMoreActivity = () => {
    if (activityPagination?.hasNextPage && !activityLoading) {
      const nextPage = (activityPagination.currentPage || activityPagination.page || 1) + 1;
      dispatch(setPage(nextPage));
      dispatch(getProjectActivityLogs({ id }));
    }
  };

  const handleLoadMoreTasks = () => {
    if (taskPagination?.hasNextPage && !taskLoading) {
      fetchTasksWithFilters(true);
    }
  };

  const breadcrumbs = [
    { label: 'Projects', to: '/projects' },
    { label: project?.title || 'Loading Project...' },
  ];

  // Map Stats dynamically from available Project/Task state
  const totalTasks = projectStats?.totalTasks ?? (tasks?.length || 0);
  const overdueTasks = projectStats?.overdueTasks ?? (tasks?.filter((t: any) => new Date(t.dueDate) < new Date() && t.status !== 'completed')?.length || 0);
  const completedTasks = projectStats?.tasksByStatus?.COMPLETED ?? projectStats?.tasksByStatus?.completed ?? (tasks?.filter((t: any) => t.status === 'completed')?.length || 0);
  const inProgressTasks = projectStats?.tasksByStatus?.IN_PROGRESS ?? projectStats?.tasksByStatus?.['in-progress'] ?? (tasks?.filter((t: any) => t.status === 'in-progress')?.length || 0);
  const todoTasks = projectStats?.tasksByStatus?.TODO ?? projectStats?.tasksByStatus?.['to-do'] ?? (tasks?.filter((t: any) => t.status === 'to-do')?.length || 0);
  const activityCount = projectStats?.activityCount ?? (activityPagination?.totalItems || logs?.length || 0);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (projectLoading && !project) {
    return (
      <div className="flex-1 min-h-screen bg-zinc-950 p-6 md:p-10 text-zinc-400 flex items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
        <span>Loading project...</span>
      </div>
    );
  }

  // Project Actions
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermit('project:update')) return;
    if (id) {
      try {
        await dispatch(updateProject({ id, data: form })).unwrap();
        toast.success('Project details updated successfully.');
      } catch (error) {
        toast.error(normalizeError(error).error);
      }
    }
  };

  const handleDeleteProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermit('project:delete')) return;
    if (id) {
      try {
        await dispatch(deleteProject({ id })).unwrap();
        navigate(-1);
        toast.success('Project Deleted Successfully');
      } catch (error) {
        toast.error(normalizeError(error).error);
      }
    }
  };

  // Member Actions
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermit('member:manage') && !hasPermit('member:invite')) return;
    if (!inviteForm?.email || !inviteForm?.role) return;
    try {
      await dispatch(inviteMemberByMail({ email: inviteForm.email, role: inviteForm?.role, id })).unwrap();
      toast.success('Invitation Sent Successfully');
      setAddInviteModalOpen(false);
      setInviteForm({ email: '', role: 'Guest' });
    } catch (error) {
      setInviteForm({ email: '', role: 'Guest' });
      let er = normalizeError(error);
      toast.error(er.error);
    }
  };

  const handleToggleAssignee = (userId: string) => {
    setTaskForm((p) => {
      const exists = p.assigneesId.includes(userId);
      const updated = exists ? p.assigneesId.filter((item) => item !== userId) : [...p.assigneesId, userId];
      return { ...p, assigneesId: updated };
    });
  };

  const handleToggleEditAssignee = (userId: string) => {
    setEditingTaskForm((p) => {
      const exists = p.assigneesId.includes(userId);
      const updated = exists ? p.assigneesId.filter((item) => item !== userId) : [...p.assigneesId, userId];
      return { ...p, assigneesId: updated };
    });
  };

  // Task Actions
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermit('task:create')) return;
    if (!taskForm.title.trim() || !taskForm.description.trim()) {
      toast.error('Please fill in all mandatory fields.');
      return;
    }
    if (taskForm.assigneesId.length === 0) {
      toast.error('Please select at least one assignee.');
      return;
    }

    try {
      await dispatch(createTask({ id: project?._id, taskData: taskForm })).unwrap();
      toast.success('Task Created Successfully');
      setAddTaskModalOpen(false);
      setTaskForm({ title: '', description: '', priority: 'medium', status: 'to-do', dueDate: '', assigneesId: [] });
    } catch (error) {
      toast.error(normalizeError(error).error);
    }
  };

  const handleOpenTaskDetail = async (t: any) => {
    setIsEditingTask(false);
    setTaskDetailModalOpen(true);

    try {
      await dispatch(getTaskDetails({ id, taskId: t?._id })).unwrap();
      dispatch(getTaskComments({ id, taskId: t?._id }));
    } catch (error) {
      setTaskDetailModalOpen(false);
      toast.error(normalizeError(error).error);
    }
  };

  const handleUpdateTaskDetails = async () => {
    if (!hasPermit('task:update')) return;
    if (!editingTaskForm.title.trim() || !editingTaskForm.description.trim()) {
      toast.error('Title and Description parameters cannot be empty.');
      return;
    }
    if (editingTaskForm.assigneesId.length === 0) {
      toast.error('Please select at least one assignee.');
      return;
    }

    try {
      await dispatch(updateTask({ id, taskId: reduxTask?._id, data: editingTaskForm })).unwrap();
      toast.success('Successfully Updated Task');
      setIsEditingTask(false);
      setTaskDetailModalOpen(false);
    } catch (error) {
      toast.error(normalizeError(error).error);
    }
  };

  const handleDeleteTaskDetails = async () => {
    if (!hasPermit('task:delete')) return;
    const confirmDelete = window.confirm('Are you sure you want to permanently remove this task?');
    if (!confirmDelete) return;

    try {
      await dispatch(deleteTask({ id, taskId: reduxTask?._id })).unwrap();
      toast.success('Task Deleted Successfully');
      setTaskDetailModalOpen(false);
    } catch (error) {
      toast.error(normalizeError(error).error);
    }
  };

  // Comment Actions
  const handleCommentSubmit = async (
    e: React.FormEvent,
    newCommentText: string,
    setNewCommentText: (val: string) => void
  ) => {
    e.preventDefault();
    if (!hasPermit('task:comment')) return;
    if (!newCommentText.trim()) return;
    try {
      await dispatch(postComment({ id, taskId: reduxTask?._id, commentBody: newCommentText })).unwrap();
      toast.success('Comment Posted Successfully');
      setNewCommentText('');
    } catch (error) {
      toast.error(normalizeError(error).error);
    }
  };

  const handleUpdateComment = async (commentId: string, editingCommentText: string) => {
    if (!hasPermit('task:comment')) return;
    if (!editingCommentText?.trim()) return;
    try {
      await dispatch(updateComment({ id, commentId, commentBody: editingCommentText })).unwrap();
      toast.success('Comment Updated Successfully');
    } catch (error) {
      let er = normalizeError(error);
      toast.error(er.error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!hasPermit('task:comment')) return;
    if (!commentId?.trim()) return;
    try {
      await dispatch(deleteComment({ id, commentId })).unwrap();
      toast.success('Comment Deleted Successfully');
    } catch (error) {
      let er = normalizeError(error);
      toast.error(er.error);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 lg:p-12 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full space-y-8">
        {(hasPermit('member:manage') || hasPermit('member:invite')) && (
          <RenderInviteModal
            isOpen={addInviteModalOpen}
            onClose={() => setAddInviteModalOpen(false)}
            inviteForm={inviteForm}
            setInviteForm={setInviteForm}
            onSubmit={handleSendInvite}
            loading={invitationLoading}
          />
        )}

        {hasPermit('task:create') && (
          <RenderTaskModal
            isOpen={addTaskModalOpen}
            onClose={() => setAddTaskModalOpen(false)}
            form={taskForm}
            setForm={setTaskForm}
            members={members || []}
            onToggleAssignee={handleToggleAssignee}
            onSubmit={handleCreateTask}
            loading={taskLoading}
            hasPermit={hasPermit}
          />
        )}

        <RenderTaskDetailModal
          currentUser={user}
          isOpen={taskDetailModalOpen}
          onClose={() => {
            setTaskDetailModalOpen(false);
            setIsEditingTask(false);
          }}
          hasPermit={hasPermit}
          activeTask={reduxTask}
          isEditingTask={isEditingTask}
          setIsEditingTask={setIsEditingTask}
          editingTaskForm={editingTaskForm}
          setEditingTaskForm={setEditingTaskForm}
          members={members || []}
          comments={comments}
          onToggleEditAssignee={handleToggleEditAssignee}
          onUpdate={handleUpdateTaskDetails}
          onDelete={handleDeleteTaskDetails}
          onCommentSubmit={handleCommentSubmit}
          onUpdateComment={handleUpdateComment}
          onDeleteComment={handleDeleteComment}
          taskLoading={taskLoading}
          commentLoading={commentLoading}
          canEdit={hasPermit('task:update')}
          canDelete={hasPermit('task:delete')}
          canComment={hasPermit('task:comment')}
        />

        <div className="space-y-3 pb-6 border-b border-zinc-900">
          <Breadcrumb items={breadcrumbs} />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-zinc-100 tracking-tight flex items-center gap-2.5 min-h-[40px]">
                <FolderGit2 className="h-7 w-7 lg:h-8 lg:w-8 text-indigo-400" />
                {project?.title || 'Untitled Project'}
              </h1>
              <p className="text-sm text-zinc-400 mt-1">{project?.description || 'No description provided.'}</p>
            </div>
          </div>
        </div>

        <Card padding="none" className="overflow-hidden bg-zinc-900/30 border border-zinc-900 w-full">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="px-6 border-b border-zinc-900" />

          <div className="p-6 md:p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Metric Header Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 space-y-3 shadow-md relative overflow-hidden group hover:border-zinc-800 transition-all">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-xs font-semibold uppercase tracking-wider">Total Tasks</span>
                      <PackageCheck className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <p className="text-3xl font-black text-zinc-100">{totalTasks}</p>
                      <span className="text-xs text-zinc-500 font-medium">Recorded</span>
                    </div>
                  </div>

                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 space-y-3 shadow-md relative overflow-hidden group hover:border-zinc-800 transition-all">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-xs font-semibold uppercase tracking-wider">Completion Rate</span>
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <p className="text-3xl font-black text-zinc-100">{completionRate}%</p>
                      <span className="text-xs text-emerald-400 font-medium">{completedTasks} completed</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-2">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
                    </div>
                  </div>

                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 space-y-3 shadow-md relative overflow-hidden group hover:border-zinc-800 transition-all">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-xs font-semibold uppercase tracking-wider">Overdue Tasks</span>
                      <AlertTriangle className={`h-5 w-5 ${overdueTasks > 0 ? 'text-rose-400 animate-pulse' : 'text-zinc-500'}`} />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <p className="text-3xl font-black text-zinc-100">{overdueTasks}</p>
                      <span className={`text-xs font-medium ${overdueTasks > 0 ? 'text-rose-400' : 'text-zinc-500'}`}>
                        {overdueTasks > 0 ? 'Requires attention' : 'All clear'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 space-y-3 shadow-md relative overflow-hidden group hover:border-zinc-800 transition-all">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-xs font-semibold uppercase tracking-wider">Activity Events</span>
                      <Activity className="h-5 w-5 text-sky-400" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <p className="text-3xl font-black text-zinc-100">{activityCount}</p>
                      <span className="text-xs text-zinc-500 font-medium">Logged</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 space-y-5">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        <ListTodo className="h-4 w-4 text-indigo-400" /> Task Status Distribution
                      </h3>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-zinc-300">To Do</span>
                            <span className="text-zinc-400">{todoTasks} tasks</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                            <div className="bg-zinc-600 h-full rounded-full transition-all duration-300" style={{ width: `${totalTasks > 0 ? (todoTasks / totalTasks) * 100 : 0}%` }} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-amber-400">In Progress</span>
                            <span className="text-zinc-400">{inProgressTasks} tasks</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full transition-all duration-300" style={{ width: `${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%` }} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-emerald-400">Completed</span>
                            <span className="text-zinc-400">{completedTasks} tasks</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 bg-zinc-950/40 p-6 border border-zinc-900 rounded-2xl lg:col-span-1 w-full h-fit">
                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Workspace Metadata</h4>
                    <div className="space-y-4 text-xs text-zinc-400">
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                        <span className="flex items-center gap-1.5">
                          <Activity className="h-4 w-4 text-zinc-500" /> Project Status
                        </span>
                        <Badge variant={project?.status === 'Completed' ? 'success' : 'primary'} size="sm">
                          {project?.status || 'Active'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-zinc-500" /> Created Date
                        </span>
                        <span className="text-zinc-200 font-medium">
                          {project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-900 pb-3">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-zinc-500" /> Project Type
                        </span>
                        <span className="text-zinc-200 font-semibold capitalize">{project?.visibility || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-zinc-500" /> Total Members
                        </span>
                        <span className="text-zinc-200 font-semibold">{project?.memberCount || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div className="flex flex-col gap-8">
                {(memberLoading || invitationLoading) && (
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                    <span>Loading members & invitations...</span>
                  </div>
                )}

                <div className="space-y-4">
                  <p className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Active Members</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {members?.map((item: any, index: number) => (
                      <div key={index} className="flex flex-row rounded-xl border border-zinc-900 bg-zinc-950/50 p-4 gap-4 items-center shadow-lg transition-all duration-200 hover:border-zinc-800 w-full">
                        <UserIcon size={40} className="bg-zinc-900 text-zinc-400 p-2.5 rounded-xl border border-zinc-800 shrink-0" />
                        <div className="text-zinc-200 text-xs space-y-0.5 min-w-0 flex-1">
                          <p className="font-semibold truncate text-zinc-100" title={item?.email}>{item?.email}</p>
                          <p className="text-zinc-500 capitalize">{item?.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {(hasPermit('member:manage') || hasPermit('member:invite')) && (
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Invitations Sent</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {projectInvitations?.map((item: any, index: number) => (
                        <div key={index} className="flex flex-row rounded-xl border border-zinc-900 bg-zinc-950/50 p-4 gap-4 items-center shadow-lg transition-all duration-200 hover:border-zinc-800 w-full">
                          <UserIcon size={40} className="bg-zinc-900 text-zinc-400 p-2.5 rounded-xl border border-zinc-800 shrink-0" />
                          <div className="text-zinc-200 text-xs space-y-0.5 min-w-0 flex-1">
                            <p className="font-semibold truncate text-zinc-100" title={item?.invitedEmail}>{item?.invitedEmail}</p>
                            <p className="text-zinc-500 capitalize">{item?.role || 'Guest'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Guard Member Invitation UI Trigger */}
                {(hasPermit('member:manage') || hasPermit('member:invite')) && (
                  <div className="pt-2">
                    <Button onClick={() => setAddInviteModalOpen(true)}>Add Member</Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="w-full space-y-6">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-900/80 shadow-inner">
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="flex items-center p-1 gap-1 rounded-xl bg-zinc-900/80 border border-zinc-800/60 overflow-x-auto shrink-0">
                      {[
                        { label: 'All', value: null },
                        { label: 'To Do', value: 'to-do' },
                        { label: 'In Progress', value: 'in-progress' },
                        { label: 'Completed', value: 'completed' },
                      ].map((tab) => (
                        <button
                          key={tab.label}
                          type="button"
                          onClick={() => setTaskFilters((prev) => ({ ...prev, status: tab.value }))}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${taskFilters?.status === tab.value
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                            }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-[220px]">
                      <div className="relative flex-1">
                        <CustomInput
                          placeholder="Search tasks..."
                          value={taskFilters?.search || ''}
                          onChange={(e) => setTaskFilters((prev) => ({ ...prev, search: e.target.value }))}
                          className="w-full pl-9 pr-3 py-1.5 bg-zinc-900/90 border border-zinc-800 focus:border-indigo-500 text-xs rounded-xl text-zinc-100 placeholder:text-zinc-500"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                      </div>
                      <Button size="sm" type="submit" disabled={taskLoading} className="shrink-0 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700">
                        Search
                      </Button>
                    </form>

                    <Dropdown
                      items={[
                        { label: 'All Priorities', onClick() { setTaskFilters((prev) => ({ ...prev, priority: null })); } },
                        { label: 'Low', onClick() { setTaskFilters((prev) => ({ ...prev, priority: 'low' })); } },
                        { label: 'Medium', onClick() { setTaskFilters((prev) => ({ ...prev, priority: 'medium' })); } },
                        { label: 'High', onClick() { setTaskFilters((prev) => ({ ...prev, priority: 'high' })); } },
                      ]}
                      trigger={
                        <button className="flex items-center justify-between gap-3 px-3 py-2 text-xs font-medium rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 transition-colors shrink-0">
                          <span className="capitalize">{taskFilters?.priority || 'Priority'}</span>
                          <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                        </button>
                      }
                    />
                  </div>

                  {/* Guard Task Creation Button */}
                  {hasPermit('task:create') && (
                    <div className="flex items-center justify-end shrink-0">
                      <Button onClick={() => setAddTaskModalOpen(true)} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl px-4 py-2 shadow-sm">
                        <Plus className="h-4 w-4" />
                        <span>Create Task</span>
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-3 w-full">
                  {taskLoading && (!tasks || tasks.length === 0) ? (
                    <div className="flex items-center justify-center p-12 gap-2 text-xs text-zinc-400">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                      <span>Loading tasks...</span>
                    </div>
                  ) : !tasks || tasks.length === 0 ? (
                    <div className="border border-dashed border-zinc-900 rounded-xl p-12 text-center text-xs text-zinc-500">
                      No tasks found matching this filter criteria.
                    </div>
                  ) : (
                    <>
                      {tasks.map((task: any) => (
                        <div
                          key={task._id}
                          onClick={() => handleOpenTaskDetail(task)}
                          className="cursor-pointer transition-transform duration-150 active:scale-[0.99]"
                        >
                          <TaskRow task={task} />
                        </div>
                      ))}

                      {taskPagination?.hasNextPage && (
                        <div className="pt-6 pb-2 text-center">
                          <Button
                            size="sm"
                            disabled={taskLoading}
                            onClick={handleLoadMoreTasks}
                            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 px-6 py-2 rounded-xl text-xs font-medium transition-all shadow-sm inline-flex items-center gap-2"
                          >
                            {taskLoading ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                                <span>Fetching older tasks...</span>
                              </>
                            ) : (
                              <span>Load More Tasks</span>
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="w-full space-y-6 max-w-4xl">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
                      Workspace Activity Stream
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Audit trail of actions and events inside this project.
                    </p>
                  </div>
                </div>

                {activityLoading && (!logs || logs.length === 0) ? (
                  <div className="flex items-center justify-center p-12 gap-2 text-xs text-zinc-400">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                    <span>Fetching activity feed...</span>
                  </div>
                ) : !logs || logs.length === 0 ? (
                  <div className="border border-dashed border-zinc-900 rounded-xl p-10 text-center text-xs text-zinc-500">
                    No recent activity recorded for this workspace.
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-900">
                    {logs.map((log: any) => (
                      <div key={log._id} className="relative flex items-start gap-4 text-xs">
                        <div className="absolute -left-6 top-1 h-5 w-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        </div>

                        <div className="flex-1 bg-zinc-950/60 border border-zinc-900 rounded-xl p-4 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-zinc-200">
                              {log.actorId?.email || 'System'}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}
                            </span>
                          </div>
                          <p className="text-zinc-400 leading-relaxed">
                            {log.action || log.description || 'Performed an action'}
                          </p>
                        </div>
                      </div>
                    ))}

                    {activityPagination?.hasNextPage && (
                      <div className="pt-4 text-center">
                        <Button
                          size="sm"
                          disabled={activityLoading}
                          onClick={handleLoadMoreActivity}
                        >
                          {activityLoading ? 'Loading...' : 'Load Older Activity'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="w-full">
                <form onSubmit={handleUpdateSettings} className="space-y-6 w-full max-w-2xl">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">General Information</h4>
                    <Input label="Project Name" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
                    <div className="space-y-1.5">
                      <p className="text-xs text-zinc-400 font-semibold">Project visibility</p>
                      <Dropdown
                        items={[
                          { label: 'public', onClick() { setForm((prev) => ({ ...prev, visibility: 'public' })); } },
                          { label: 'private', onClick() { setForm((prev) => ({ ...prev, visibility: 'private' })); } },
                        ]}
                        align="left"
                        trigger={
                          <div className="border-zinc-800 border bg-zinc-900 pl-3 p-2.5 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors w-full max-w-xs">
                            <p className="text-sm text-zinc-200 capitalize">{form?.visibility || 'Select visibility'}</p>
                          </div>
                        }
                      />
                    </div>

                    <Textarea label="Project Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />

                    {/* Guard Project Details Form Submission */}
                    {hasPermit('project:update') && (
                      <Button size="sm" type="submit" disabled={projectLoading}>
                        {projectLoading ? 'Saving...' : 'Save Project Details'}
                      </Button>
                    )}
                  </div>
                </form>

                {/* Guard Project Deletion Area */}
                {hasPermit('project:delete') && (
                  <div className="space-y-2 mt-10 pt-6 border-t border-zinc-900 w-full max-w-2xl">
                    <p className="text-sm text-red-400 font-bold uppercase tracking-wider">Danger Zone</p>
                    <p className="text-xs text-zinc-500">Permanently delete this project workspace and all data associated with it.</p>
                    <Button
                      onClick={handleDeleteProject}
                      disabled={projectLoading}
                      className="bg-red-950/40 hover:bg-red-900 text-red-200 border-red-900/50 hover:border-red-800 focus:ring-0 mt-2"
                    >
                      {projectLoading ? 'Deleting...' : 'Delete Project'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetails;