import {create} from 'zustand'
import axiosInstance from '../lib/axios.js'
import toast from 'react-hot-toast'
import {useAuthStore} from './useAuthStore.js'

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async() => {
        set({isUsersLoading:true});
        try {
            const res = await axiosInstance.get('/messages/users');
            set({users:res.data});
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({isUsersLoading:false});
        }
    },

    getMessages: async (userId) => {

        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
        set({ isMessagesLoading: false });
        }
    },

    setSelectedUser: (selectedUser) => {
        set({selectedUser: selectedUser})
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data] });
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    // listens for new message events sent from server-side
    subMessages: () => {
        const {selectedUser} = get()
        if (!selectedUser) return;
        const socket = useAuthStore.getState().socket;

        socket.on('newMessage', (newMessage) => {
            // we only want to update our chat history on the correct ID container
            if (newMessage.senderId !== selectedUser._id) return ;
            set({ messages: [...get().messages, newMessage] })
        });
    },

    // Not needed: but cleans up listeners when out of focus, reduces re-rendering, etc.
    unsubMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off('newMessage');
    }



}));
