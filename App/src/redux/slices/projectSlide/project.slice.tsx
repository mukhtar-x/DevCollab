import { createSlice } from "@reduxjs/toolkit";
import { createProject, deleteProject, getProjectById, getProjectStats, getUserProjects, updateProject } from "./project.actions";

const initialState = {
    loading: false,
    success: false,
    error: null,
    project: null, 
    projects: [],
    projectStats : {}
};

const projectSlice = createSlice({
    name: "project",
    initialState,
    reducers: {
       
        clearActiveProject: (state) => {
            state.project = null;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(createProject.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        })
        .addCase(createProject.fulfilled, (state, { payload }) => {
            state.loading = false;
            state.error = null;
            state.success = true;
            state.project = payload?.project;
            if (payload?.project) {
                state.projects.push(payload.project);
            }
        })
        .addCase(createProject.rejected, (state, { payload }) => {
            state.loading = false;
            state.success = false;
            state.error = payload;
        })

        .addCase(getUserProjects.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
            state.projects = []; 
        })
        .addCase(getUserProjects.fulfilled, (state, { payload }) => {
            state.loading = false;
            state.error = null;
            state.projects = payload?.projects || [];
            state.success = true;
        })
        .addCase(getUserProjects.rejected, (state, { payload }) => {
            state.loading = false;
            state.error = payload;
            state.success = false;
        })

        .addCase(getProjectById.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
            state.project = null; 
        })
        .addCase(getProjectById.fulfilled, (state, { payload }) => {
            state.loading = false;
            state.error = null;
            state.success = true;
            state.project = payload?.project;
        })
        .addCase(getProjectById.rejected, (state, { payload }) => {
            state.loading = false;
            state.success = false;
            state.error = payload;
        })
        .addCase(getProjectStats.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
            // state.projectStats = payload.stats; 
        })
        .addCase(getProjectStats.fulfilled, (state, { payload }) => {
            state.loading = false;
            state.error = null;
            state.success = true;
            state.projectStats = payload.stats; 
        })
        .addCase(getProjectStats.rejected, (state, { payload }) => {
            state.loading = false;
            state.success = false;
            state.error = payload;
        })

        .addCase(updateProject.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        })
        .addCase(updateProject.fulfilled, (state, { payload }) => {
            state.loading = false;
            state.error = null;
            state.success = true;
            const updated = payload?.project;

            if (updated) {
                state.project = updated;

                const index = state.projects.findIndex((p) => p._id === updated._id);
                if (index !== -1) {
                    state.projects[index] = updated;
                }
            }
        })
        .addCase(updateProject.rejected, (state, { payload }) => {
            state.loading = false;
            state.success = false;
            state.error = payload;
        })

        .addCase(deleteProject.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        })
        .addCase(deleteProject.fulfilled, (state, { payload, meta }) => {
            state.loading = false;
            state.error = null;
            state.success = true;

            const deletedId = payload?.projectId || meta?.arg?.id;

            if (deletedId) {
                state.projects = state.projects.filter((p) => p._id !== deletedId);

                if (state.project?._id === deletedId) {
                    state.project = null;
                }
            }
        })
        .addCase(deleteProject.rejected, (state, { payload }) => {
            state.loading = false;
            state.success = false;
            state.error = payload;
        });
    }
});

export const { clearActiveProject } = projectSlice.actions;
export default projectSlice.reducer;