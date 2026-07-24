import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../api/axios";
import { normalizeError } from "../../../utils/getErrorMessage";

export const createTask = createAsyncThunk(
    'task/create',
    async ({ id, taskData }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post(`/project/${id}/tasks`, { ...taskData });

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);


export const getProjectTasks = createAsyncThunk(
    'task/getall',
    async ({ id, filter = {}, isLoadMore }, { rejectWithValue, getState }) => {

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
            const res = await axiosInstance.get(`/project/${id}/tasks?${queryString}`);

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);

export const getTaskDetails = createAsyncThunk(
    'task/get',
    async ({ projectId: id, taskId }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(`/project/${id}/task/${taskId}`);

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);

export const updateTask = createAsyncThunk(
    'task/update',
    async ({ projectId: id, taskId, data }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.put(`/project/${id}/task/${taskId}`, { ...data });

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);

export const deleteTask = createAsyncThunk(
    'task/delete',
    async ({ projectId: id, taskId }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.delete(`/project/${id}/task/${taskId}`);

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);


export const updateTaskStatus = createAsyncThunk(
    'task/update/status',
    async ({ projectId: id, taskId, status }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.patch(`/project/${id}/task/${taskId}/status`, { status });

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);