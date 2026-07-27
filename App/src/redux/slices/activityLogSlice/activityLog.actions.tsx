import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../api/axios";
import type { RootState } from "../../store";
import { normalizeError } from "../../../utils/getErrorMessage";

export const getProjectActivityLogs = createAsyncThunk(
    'log/get',
    async ({ id: projectId }, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const { page, limit } = state.projectActivityLogs?.pagination;
            const res = await axiosInstance.get(`/project/${projectId}/activity-logs?page=${page || 1}&limit=${limit || 10}`);

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);