// Single Chat history container
// chat header component
// messages history with profile pic, timestamp, message
// type bar

import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";


const ChatContainer = () => {
    const {messages, getMessages, isMessagesLoading, selectedUser, subMessages, unsubMessages}= useChatStore();
    const {authUser} = useAuthStore();
    const messageEndRef = useRef(null);

    // on mount useEffects
    useEffect(() => {
        getMessages(selectedUser._id);

        subMessages();

        return () => unsubMessages();

    }, [selectedUser._id, getMessages, subMessages, unsubMessages]);

     useEffect(() => {
        if (messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    if (isMessagesLoading) {
        return (
            <div className='flex-1 flex flex-col overflow-auto'>
                <ChatHeader/>
                <MessageSkeleton/>
                <MessageInput/>
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col overflow-auto">
            <ChatHeader />

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    
                    <div
                        key={message._id}
                        className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                        ref={messageEndRef}
                    >   
                        {/* Display the profile pic of each user in chat */}
                        <div className=" chat-image avatar">
                            <div className="size-10 rounded-full border">
                                <img
                                    src={
                                        message.senderId === authUser._id
                                        ? authUser.profilePic || "/avatar.png"
                                        : selectedUser.profilePic || "/avatar.png"
                                    }
                                    alt="profile pic"
                                />
                            </div>
                        </div>

                        {/* display the timestamp */}
                        <div className="chat-header mb-1">
                            <time className="text-xs opacity-50 ml-1"> {formatMessageTime(message.createdAt)}</time>
                        </div>

                        {/* chat bubble */}
                        <div className="chat-bubble flex flex-col">

                            {/* if there is an image in this message, display */}
                            {message.image && (
                                <img
                                    src={message.image}
                                    alt="Attachment"
                                    className="sm:max-w-[200px] rounded-md mb-2"
                                />
                            )}

                            {/* if there is text in this message, display */}
                            {message.text && <p>{message.text}</p>}
                        </div>
                    </div>
                ))}
            </div>
            {/* Message Input Component that is a child of this ChatContainer */}
            <MessageInput />
        </div>
    );
};
export default ChatContainer;