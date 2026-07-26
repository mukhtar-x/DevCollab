import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../api/axios";
import { normalizeError } from "../../../utils/getErrorMessage";

export const createProject = createAsyncThunk(
    'project/create',
    async ({data}:any, {rejectWithValue}) => {
        try {
            const res = await axiosInstance.post("/project/create", {...data});

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);


export const updateProject = createAsyncThunk(
    'project/update',
    async ({data}:any, {rejectWithValue}) => {
        try {
            const res = await axiosInstance.put(`/project/${data?.id}`, {...data});

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);

export const deleteProject = createAsyncThunk(
    'project/delete',
    async ({id} : any,{rejectWithValue}) => {
        try {
            const res = await axiosInstance.delete(`/project/${id}`);

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);


export const getUserProjects = createAsyncThunk(
    'project/getAll',
    async ({userId}:any, {rejectWithValue}) => {
        try {
            const res = await axiosInstance.get(`/user/${userId}/projects`);
            console.log(res.data);

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);

export const getProjectById = createAsyncThunk(
    'project/getOne',
    async ({id}:any, {rejectWithValue}) => {
        try {
            const res = await axiosInstance.get(`/project/${id}`);

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);

export const getProjectStats = createAsyncThunk(
    'project/stats/get', 
    async ({id}, {rejectWithValue}) => {
        try {
            const res = await axiosInstance.get(`/project/${id}/project-stats`);

            return res.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error));
        }
    }
);