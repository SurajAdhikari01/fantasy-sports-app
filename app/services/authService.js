// src/services/authService.js

import api from '../config/axios';
import * as SecureStore from 'expo-secure-store';

export const authService = {
    async logout() {
        try {
            await api.post('/users/logout');
            await this.clearAuth();
        } catch (error) {
            console.error('Logout error:', error);
            await this.clearAuth();
        }
    },

    async clearAuth() {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('userData');
    },

    async getAuthToken() {
        return await SecureStore.getItemAsync('accessToken');
    },

    async getUserData() {
        const userDataString = await SecureStore.getItemAsync('userData');
        return userDataString ? JSON.parse(userDataString) : null;
    }
};

export default authService;