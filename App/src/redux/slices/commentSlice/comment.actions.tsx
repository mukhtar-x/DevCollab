import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../api/axios";
import { normalizeError } from "../../../utils/getErrorMessage";

export const getTaskComments = createAsyncThunk(
    'comments/get',
    async ({id: projectId, taskId}, {rejectWithValue}) => {
        try {
            const res = await axiosInstance.get(`/project/${projectId}/tasks/${taskId}/comments`);

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);

export const postComment = createAsyncThunk(
    'comment/post',
    async ({id: projectId, taskId, commentBody}, {rejectWithValue}) => {
        try {
            const res  = await axiosInstance.post(`/project/${projectId}/tasks/${taskId}/comments`, {commentBody});

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);

export const updateComment = createAsyncThunk(
    'comment/patch',
    async ({id: projectId, commentId, commentBody}, {rejectWithValue}) => {
        console.log(commentBody)
        try {
            const res = await axiosInstance.patch(`/project/${projectId}/comments/${commentId}`, {commentBody});

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);

export const deleteComment = createAsyncThunk(
    'comment/delete',
    async ({id: projectId, commentId}, {rejectWithValue}) => {
        try {
            const res = await axiosInstance.delete(`/project/${projectId}/comments/${commentId}`);

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);