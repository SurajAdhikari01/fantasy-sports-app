// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../config/axios';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [authState, setAuthState] = useState({
        isLoading: true,
        isAuthenticated: false,
        userData: null,
    });

    useEffect(() => {
        loadAuthState();
    }, []);

    const loadAuthState = async () => {
        try {
            const [userDataString, accessToken] = await Promise.all([
                SecureStore.getItemAsync('userData'),
                SecureStore.getItemAsync('accessToken'),
            ]);

            if (userDataString && accessToken) {
                const userData = JSON.parse(userDataString);
                setAuthState({
                    isLoading: false,
                    isAuthenticated: true,
                    userData,
                });
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            } else {
                setAuthState({
                    isLoading: false,
                    isAuthenticated: false,
                    userData: null,
                });
            }
        } catch (error) {
            console.error('Error loading auth state:', error);
            setAuthState({
                isLoading: false,
                isAuthenticated: false,
                userData: null,
            });
        }
    };

    const signIn = async (userData, accessToken) => {
        try {
            await SecureStore.setItemAsync('userData', JSON.stringify(userData));
            await SecureStore.setItemAsync('accessToken', accessToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            setAuthState({
                isLoading: false,
                isAuthenticated: true,
                userData,
            });
            //console.log('Signed in:', userData, accessToken);
        } catch (error) {
            console.error('Error storing auth data:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await Promise.all([
                SecureStore.deleteItemAsync('userData'),
                SecureStore.deleteItemAsync('accessToken'),
            ]);
            delete api.defaults.headers.common['Authorization'];
            setAuthState({
                isLoading: false,
                isAuthenticated: false,
                userData: null,
            });
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider 
            value={{
                ...authState,
                signIn,
                signOut,
                reloadAuthState: loadAuthState,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

export default AuthContext;