// src/config/axios.js

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const api = axios.create({
    baseURL: Platform.select({
        android: 'http://10.0.2.2:9005/api',
        ios: 'http://localhost:9005/api',
    }),
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to add token to headers
api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Token added to headers:', token);

        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
