import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../api/axios";
import { normalizeError } from "../../../utils/getErrorMessage";

export const getProjectInvitations = createAsyncThunk(
    'project/getPendingInvitations',
    async ({id:projectId}, {rejectWithValue}) => {
        try {
            const res = await axiosInstance.get(`/project/${projectId}/invitations`);

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);

export const inviteMemberByMail = createAsyncThunk(
    'project/inviteMember',
    async ({email, role, id:projectId}, {rejectWithValue}) => {
        try {
            const res = await axiosInstance.post(`/project/${projectId}/invitations`, {email, role});

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);

export const getUserInvitations = createAsyncThunk(
    'invitations/me', 
    async (_, {rejectWithValue}) => {
        try {
            const res = await axiosInstance.get("/invitation/me");

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);

export const acceptInvitation = createAsyncThunk(
    'invitation/accept',
    async ({projectId, token}, {rejectWithValue}) => {
        try {
            const res = await axiosInstance.post("/invitation/accept", {projectId, token});

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);

export const rejectInvitation = createAsyncThunk(
    'invitation/reject',
    async ({projectId, token}, {rejectWithValue}) => {
        try {
            const res = await axiosInstance.post("/invitation/reject", {projectId, token});

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);