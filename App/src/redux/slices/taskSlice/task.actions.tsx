import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../api/axios";
import { normalizeError } from "../../../utils/getErrorMessage";

export const createTask = createAsyncThunk(
    'task/create',
    async ({id: projectId, taskData }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post(`/project/${projectId}/tasks`, { taskData });

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);


export const getProjectTasks = createAsyncThunk(
    'task/getall',
    async ({id: projectId, filter = {}, isLoadMore }, { rejectWithValue, getState }) => {

        const { nextCursor, limit=5 } = getState().projectTasks?.pagination;

        const params = new URLSearchParams();

        // Attach filters cleanly
        Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });

        if (limit) params.append('limit', limit);

        if (isLoadMore && nextCursor) {
            params.append('cursor', nextCursor);
        }

        const queryString = params.toString();

        try {
            const res = await axiosInstance.get(`/project/${projectId}/tasks?${queryString}`);

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);

export const getTaskDetails = createAsyncThunk(
    'task/get',
    async ({ id: projectId, taskId }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(`/project/${projectId}/task/${taskId}`);

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);

export const updateTask = createAsyncThunk(
    'task/update',
    async ({id: projectId, taskId, data:updatedTaskData }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.put(`/project/${projectId}/task/${taskId}`, { updatedTaskData });

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);

export const deleteTask = createAsyncThunk(
    'task/delete',
    async ({id: projectId, taskId }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.delete(`/project/${projectId}/task/${taskId}`);

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);


export const updateTaskStatus = createAsyncThunk(
    'task/update/status',
    async ({id: projectId, taskId, status }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.patch(`/project/${projectId}/task/${taskId}/status`, { status });

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);