import React, { useState } from 'react';
import {
  PackageCheck,
  X,
  Edit2,
  Trash2,
  Clock,
  Calendar,
  UserIcon,
  MessageSquare,
  Send,
  ArrowLeft,
} from 'lucide-react';
import Button from '../Button';
import CustomInput from '../CustomInput';
import Textarea from '../Textarea';
import Dropdown from '../Dropdown';

interface TaskDetailModalProps {
  currentUser: any;
  isOpen: boolean;
  onClose: () => void;
  activeTask: any;
  isEditingTask: boolean;
  setIsEditingTask: (val: boolean) => void;
  editingTaskForm: any;
  setEditingTaskForm: React.Dispatch<React.SetStateAction<any>>;
  members: any[];
  onToggleEditAssignee: (id: string) => void;
  onUpdate: () => void;
  onDelete: () => void;
  comments?: any[];
  onCommentSubmit: (e: React.FormEvent, text: string, setText: (val: string) => void) => void;
  onUpdateComment?: (commentId: string, text: string) => void;
  onDeleteComment?: (commentId: string) => void;
  hasPermit?: (permission: string) => boolean;
}

export const RenderTaskDetailModal: React.FC<TaskDetailModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  activeTask,
  isEditingTask,
  setIsEditingTask,
  editingTaskForm,
  setEditingTaskForm,
  members = [],
  onToggleEditAssignee,
  onUpdate,
  onDelete,
  comments = [],
  onCommentSubmit,
  onUpdateComment,
  onDeleteComment,
  hasPermit,
}) => {
  if (!isOpen || !activeTask) return null;

  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  // Permission evaluation helpers
  const canEditTask = hasPermit ? hasPermit('task:edit') : true;
  const canDeleteTask = hasPermit ? hasPermit('task:delete') : true;
  const canComment = hasPermit ? hasPermit('task:comment') : true;

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'in-progress':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/80 flex items-center justify-center z-50 backdrop-blur-sm p-2 mt-5 animate-in fade-in duration-150">
      <div className="flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl w-[calc(100vw-20px)] h-[calc(100vh-60px)] shadow-2xl text-zinc-200 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-900/30 shrink-0">
          <div className="flex items-center gap-3">
            <PackageCheck className="h-5 w-5 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              {isEditingTask ? 'Editing Task Parameters' : 'Task Workspace'}
            </span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2-Column Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-zinc-900">
          {/* LEFT COLUMN: Task Details & Editing */}
          <div className="lg:col-span-7 flex flex-col h-full overflow-hidden">
            <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              {isEditingTask && canEditTask ? (
                /* EDIT FORM VIEW */
                <div className="space-y-5">
                  <CustomInput
                    title="Task Title *"
                    value={editingTaskForm.title}
                    onChange={(e) =>
                      setEditingTaskForm((p: any) => ({ ...p, title: e.target.value }))
                    }
                  />

                  <Textarea
                    label="Description Details *"
                    value={editingTaskForm.description}
                    rows={5}
                    onChange={(e) =>
                      setEditingTaskForm((p: any) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                  />

                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400 font-semibold">
                      Assign Team Members *
                    </label>
                    <div className="max-h-36 overflow-y-auto border border-zinc-900 bg-zinc-900/30 rounded-xl p-2 space-y-1 custom-scrollbar">
                      {members?.map((member: any) => {
                        const isSelected = editingTaskForm.assigneesId?.includes(member._id);
                        return (
                          <div
                            key={member._id}
                            onClick={() => onToggleEditAssignee(member._id)}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-zinc-800 text-zinc-100'
                                : 'hover:bg-zinc-900/60 text-zinc-400'
                            }`}
                          >
                            <span>{member.name || member.email}</span>
                            <div
                              className={`h-4 w-4 rounded border flex items-center justify-center text-[10px] ${
                                isSelected
                                  ? 'border-zinc-400 bg-zinc-100 text-zinc-950 font-bold'
                                  : 'border-zinc-700'
                              }`}
                            >
                              {isSelected && '✓'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-400 font-semibold">Status</label>
                      <Dropdown
                        items={[
                          {
                            label: 'To Do',
                            onClick: () =>
                              setEditingTaskForm((p: any) => ({ ...p, status: 'to-do' })),
                          },
                          {
                            label: 'In Progress',
                            onClick: () =>
                              setEditingTaskForm((p: any) => ({
                                ...p,
                                status: 'in-progress',
                              })),
                          },
                          {
                            label: 'Completed',
                            onClick: () =>
                              setEditingTaskForm((p: any) => ({
                                ...p,
                                status: 'completed',
                              })),
                          },
                        ]}
                        align="left"
                        trigger={
                          <div className="border-zinc-800 border bg-zinc-900 px-3 py-2 rounded-xl text-xs text-zinc-200 capitalize cursor-pointer">
                            {editingTaskForm.status}
                          </div>
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-zinc-400 font-semibold">Priority</label>
                      <Dropdown
                        items={[
                          {
                            label: 'Low',
                            onClick: () =>
                              setEditingTaskForm((p: any) => ({ ...p, priority: 'low' })),
                          },
                          {
                            label: 'Medium',
                            onClick: () =>
                              setEditingTaskForm((p: any) => ({ ...p, priority: 'medium' })),
                          },
                          {
                            label: 'High',
                            onClick: () =>
                              setEditingTaskForm((p: any) => ({ ...p, priority: 'high' })),
                          },
                        ]}
                        align="left"
                        trigger={
                          <div className="border-zinc-800 border bg-zinc-900 px-3 py-2 rounded-xl text-xs text-zinc-200 capitalize cursor-pointer">
                            {editingTaskForm.priority}
                          </div>
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-zinc-400 font-semibold">Due Date</label>
                      <input
                        type="date"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 h-[38px]"
                        value={editingTaskForm.dueDate}
                        onChange={(e) =>
                          setEditingTaskForm((p: any) => ({ ...p, dueDate: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* READ-ONLY VIEW */
                <>
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-tight leading-snug">
                      {activeTask.title}
                    </h2>
                    <div className="flex items-center gap-2 shrink-0">
                      {canEditTask && (
                        <button
                          onClick={() => setIsEditingTask(true)}
                          type="button"
                          className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
                          title="Edit Task"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      {canDeleteTask && (
                        <button
                          onClick={onDelete}
                          type="button"
                          className="p-2.5 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 hover:text-red-300 hover:bg-red-900/30 hover:border-red-700 transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                        activeTask.status
                      )} capitalize`}
                    >
                      {activeTask.status}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(
                        activeTask.priority
                      )} capitalize`}
                    >
                      {activeTask.priority} Priority
                    </span>
                  </div>

                  <div className="space-y-2 bg-zinc-900/30 p-5 border border-zinc-900 rounded-xl">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Description
                    </h4>
                    <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {activeTask.description || 'No detailed description provided.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-zinc-900/80 pt-5">
                    <div className="flex items-center gap-3 text-zinc-400">
                      <Clock className="h-5 w-5 text-zinc-500 shrink-0" />
                      <div className="text-xs">
                        <p className="text-zinc-500 font-medium">Due Date</p>
                        <p className="text-zinc-200 font-semibold mt-0.5">
                          {activeTask.dueDate
                            ? new Date(activeTask.dueDate).toLocaleDateString()
                            : 'No Target Date'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-400">
                      <Calendar className="h-5 w-5 text-zinc-500 shrink-0" />
                      <div className="text-xs">
                        <p className="text-zinc-500 font-medium">Created</p>
                        <p className="text-zinc-200 font-semibold mt-0.5">
                          {activeTask.createdAt
                            ? new Date(activeTask.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-900/80 pt-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Assigned Team Members
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                      {activeTask.assigneesId && activeTask.assigneesId.length > 0 ? (
                        activeTask.assigneesId.map((assignee: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 px-3 py-2 border border-zinc-900 bg-zinc-950/50 rounded-xl"
                          >
                            <UserIcon size={16} className="text-indigo-400 shrink-0" />
                            <span className="text-xs text-zinc-300 truncate">
                              {assignee?.email || assignee?.name || assignee}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-500 italic">No assignees selected.</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Left Action Footer */}
            <div className="p-4 border-t border-zinc-900 bg-zinc-900/20 shrink-0 flex justify-end gap-3">
              {isEditingTask && canEditTask ? (
                <>
                  <Button variant="ghost" onClick={() => setIsEditingTask(false)}>
                    <div className="flex items-center gap-1.5">
                      <ArrowLeft className="h-4 w-4" /> Cancel
                    </div>
                  </Button>
                  <Button onClick={onUpdate}>Save Changes</Button>
                </>
              ) : (
                <Button variant="ghost" onClick={onClose}>
                  Close Workspace
                </Button>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Dedicated Comments Thread */}
          <div className="lg:col-span-5 flex flex-col h-full bg-zinc-950/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-900/80 bg-zinc-900/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Discussion & Updates ({comments.length})
                </h3>
              </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar">
              {comments.length > 0 ? (
                comments.map((comment: any) => (
                  <div
                    key={comment._id}
                    className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-indigo-950 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
                          <UserIcon size={12} />
                        </div>
                        <span className="font-semibold text-zinc-200">
                          {comment?.authorId?.email || comment?.authorId?._id || 'Team Member'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500">
                          {comment.createdAt
                            ? new Date(comment.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                        {editingCommentId !== comment._id &&
                          comment.authorId?._id === currentUser?._id && (
                            <div className="flex items-center gap-1 pl-2 border-l border-zinc-800">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCommentId(comment._id);
                                  setEditingCommentText(comment.body);
                                }}
                                className="text-zinc-500 hover:text-zinc-300 p-1"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteComment?.(comment._id)}
                                className="text-zinc-500 hover:text-red-400 p-1"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                      </div>
                    </div>

                    {editingCommentId === comment._id ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          value={editingCommentText}
                          onChange={(e) => setEditingCommentText(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingCommentId(null)}
                            className="px-2.5 py-1 text-[11px] text-zinc-400 hover:text-zinc-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateComment?.(comment._id, editingCommentText);
                              setEditingCommentId(null);
                            }}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] rounded-md font-medium"
                          >
                            Save Update
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap pl-8">
                        {comment.body}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-10">
                  <MessageSquare className="h-8 w-8 text-zinc-800" />
                  <p className="text-xs text-zinc-500 italic">
                    No comments in this thread yet.
                  </p>
                </div>
              )}
            </div>

            {/* Comment Input Footer */}
            {canComment ? (
              <form
                onSubmit={(e) => onCommentSubmit(e, newCommentText, setNewCommentText)}
                className="p-4 border-t border-zinc-900 bg-zinc-900/40 shrink-0"
              >
                <div className="flex gap-2 items-end">
                  <textarea
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Add a comment or update..."
                    rows={2}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                  />
                  <Button
                    size="sm"
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="h-[42px] px-4"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-4 border-t border-zinc-900 bg-zinc-900/20 text-center text-xs text-zinc-500 italic shrink-0">
                You do not have permission to post comments.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenderTaskDetailModal;