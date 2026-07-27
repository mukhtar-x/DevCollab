import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../api/axios";
import { normalizeError } from "../../../utils/getErrorMessage";

export const getProjectMembers = createAsyncThunk(
    'project/getMembers',
    async ({id:projectId}, {rejectWithValue}) => {
        try {
            const res = await axiosInstance.get(`/project/${projectId}/members`);
            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);

