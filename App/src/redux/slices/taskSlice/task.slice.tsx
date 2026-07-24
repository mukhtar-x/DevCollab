import { createSlice } from "@reduxjs/toolkit";
import { createTask, deleteTask, getProjectTasks, getTaskDetails, updateTask, updateTaskStatus } from "./task.actions";

const initialState = {
    success: false,
    loading: false,
    error: null,
    tasks: [],
    task: null,
    pagination: {
        hasNextPage: null,
        nextCursor: null
    }
};


const taskSlice = createSlice({
    name: 'taskSlice',
    initialState,
    reducers: {
        clearTaskState: (state) => {
            state.task = null;
        },
        clearTasksState: (state) => {
            state.tasks = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createTask.pending, (state) => {
                state.loading = true,
                    state.success = false,
                    state.error = null
            })
            .addCase(createTask.fulfilled, (state, { payload }) => {
                state.loading = false,
                    state.success = true,
                    state.task = payload.task
                if (payload.task) {
                    state.tasks?.push(payload.task);
                }
            })
            .addCase(createTask.rejected, (state, { payload }) => {
                state.loading = false,
                    state.error = payload,
                    state.success = false
            })
            .addCase(getProjectTasks.pending, (state) => {
                state.loading = true,
                    state.success = false
            })
            .addCase(getProjectTasks.fulfilled, (state, { payload, meta }) => {
                state.loading = false,
                state.success = true;
                let newTasks = payload?.tasks || [];
                if (meta.arg?.isLoadMore) {
                    state.tasks = [...state.tasks, ...newTasks];
                } else {
                    state.tasks = newTasks;
                } state.pagination.hasNextPage = payload?.pagination?.hasNextPage;
                state.pagination.nextCursor = payload?.pagination?.nextCursor;
            })
            .addCase(getProjectTasks.rejected, (state, { payload }) => {
                state.loading = false,
                    state.error = payload,
                    state.success = false
            })
            .addCase(getTaskDetails.pending, (state) => {
                state.loading = true,
                    state.success = false
            })
            .addCase(getTaskDetails.fulfilled, (state, { payload }) => {
                state.loading = false,
                    state.success = true,
                    state.task = payload.task
            })
            .addCase(getTaskDetails.rejected, (state, { payload }) => {
                state.loading = false,
                    state.error = payload,
                    state.success = false
            })
            .addCase(updateTask.pending, (state) => {
                state.loading = true,
                    state.success = false
            })
            .addCase(updateTask.fulfilled, (state, { payload }) => {
                state.loading = false,
                    state.success = true
                let updated = payload.task;

                if (updated) {
                    state.task = updated;

                    let idx = state.tasks.findIndex((t) => t._id === updated._id);
                    if (idx !== -1) {
                        state.tasks[idx] = updated;
                    }
                }
            })
            .addCase(updateTask.rejected, (state, { payload }) => {
                state.loading = false,
                    state.error = payload,
                    state.success = false
            })
            .addCase(deleteTask.pending, (state) => {
                state.loading = true,
                    state.success = false
            })
            .addCase(deleteTask.fulfilled, (state, { payload, meta }) => {
                state.loading = false,
                    state.success = true
                let deletedTaskId = meta.arg?.taskId;

                if (deletedTaskId) {

                    state.tasks = state.tasks?.filter((t) => t._id !== deletedTaskId);

                    if (state.task?._id === deletedTaskId) {
                        state.task = null;
                    }
                }
            })
            .addCase(deleteTask.rejected, (state, { payload }) => {
                state.loading = false,
                    state.error = payload,
                    state.success = false
            })
            .addCase(updateTaskStatus.pending, (state) => {
                state.loading = true,
                    state.success = false
            })
            .addCase(updateTaskStatus.fulfilled, (state, { payload }) => {
                state.loading = false,
                    state.success = true,
                    state.task = payload.task
            })
            .addCase(updateTaskStatus.rejected, (state, { payload }) => {
                state.loading = false,
                    state.error = payload,
                    state.success = false
            })
    }
});

export default taskSlice.reducer;