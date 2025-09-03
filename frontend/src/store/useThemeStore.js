import { create } from "zustand";

export const useThemeStore = create((set) => ({

    // grab theme from local store, else default
    theme: localStorage.getItem("chat-theme") || "retro",

    // set into local storage
    setTheme: (theme) => {
        localStorage.setItem("chat-theme", theme);

        set({ theme });
    },
}));