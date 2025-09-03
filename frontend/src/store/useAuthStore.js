// states and functions for different component use 

import {create} from 'zustand';
import axiosInstance from '../lib/axios.js';
import toast from 'react-hot-toast';
import {io} from 'socket.io-client';

const BASE_URL = import.meta.env.MODE === "development" ? import.meta.env.VITE_BACKEND_DEV_URL : import.meta.env.VITE_BACKEND_PROD_URL;

export const useAuthStore = create((set, get) => ({

    authUser:null,

    isCheckingAuth:true,

    isSigningUp: false,

    isLogginIn: false,

    socket: null,

    isUpdatingProfile:false,

    onlineUsers: [],

    checkAuth: async() => {
        try {
            
            const res = await axiosInstance.get('/auth/checkAuth');
            set({authUser: res.data})
            get().connectSocket();
        } catch (error) {
            console.log('Error in checkAuth', error);
            set({authUser:null})
        } finally {
            set({isCheckingAuth:null}) 
        }
    },

    signup: async (data) => {
        set({isSigningUp:true});
        try {
            const res = await axiosInstance.post('/auth/register', data);
            set({authUser: res.data})
            toast.success('Account created successfully');

            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
            
        } finally {
            set({isSigningUp: false})
        }
    },

    logout: async() => {
        try {
            await axiosInstance.post('/auth/logout');
            set({authUser: null});
            toast.success('Logged out successfully')

            get().disconnectSocket()
        } catch (error) {
            toast.error('Something went wrong!');

        }
    },
    
    login: async(data) => {
        set({isLogginIn:true});
        try {
            const res = await axiosInstance.post('/auth/login', data);
            set({authUser:res.data});
            toast.success('Logged in successfully');

            get().connectSocket();
        } catch (error) {
            toast.error('Log in failed');
        } finally {
            set({isLogginIn: false});
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("error in update profile:", error);
            toast.error(error.response.data.message);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const {authUser} = get()
        if (!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            // additional parameters found in socket.handshake.query
            // immutable per session
            query: {
                userId: authUser._id,
            },
        });

        socket.connect()
        set({socket:socket});

        socket.on('GetOnlineUsers', (userIds) => {
            set({onlineUsers: userIds});
        })
    },

    disconnectSocket: () => {
        if (get().socket?.connected) {
            get().socket.disconnect();
        }
    }

}));

