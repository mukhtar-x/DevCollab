import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../api/axios";
import { normalizeError } from "../../../utils/getErrorMessage";

export const createProject = createAsyncThunk(
    'project/create',
    async ({data:projectData}:any, {rejectWithValue}) => {
        try {
            const res = await axiosInstance.post("/project/create", {projectData});

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);


export const updateProject = createAsyncThunk(
    'project/update',
    async ({id: projectId, data:updatedProjectData}:any, {rejectWithValue}) => {
        try {
            const res = await axiosInstance.put(`/project/${projectId}`, {updatedProjectData});

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);

export const deleteProject = createAsyncThunk(
    'project/delete',
    async ({id:projectId} : any,{rejectWithValue}) => {
        try {
            const res = await axiosInstance.delete(`/project/${projectId}`);

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);


export const getUserProjects = createAsyncThunk(
    'project/getAll',
    async (_, {rejectWithValue}) => {
        try {
            const res = await axiosInstance.get(`/user/projects`);

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);

export const getProjectById = createAsyncThunk(
    'project/getOne',
    async ({id:projectId}:any, {rejectWithValue}) => {
        try {
            const res = await axiosInstance.get(`/project/${projectId}`);

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);

export const getProjectStats = createAsyncThunk(
    'project/stats/get', 
    async ({id:projectId}, {rejectWithValue}) => {
        try {
            const res = await axiosInstance.get(`/project/${projectId}/project-stats`);

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);