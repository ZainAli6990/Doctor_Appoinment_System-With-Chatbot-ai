import { useState, useRef, useEffect } from "react";
import api from "../../services/api";

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [messages, setMessages] = useState([
        {
            role: "assistant",
            text: "Hello! 👋 I'm your Doctor Appointment Assistant. How can I help you today?",
        },
    ]);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    const sendMessage = async () => {
        if (!message.trim() || loading) return;

        const userMessage = message.trim();

        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                text: userMessage,
            },
        ]);

        setMessage("");
        setLoading(true);

        try {
            const response = await api.post("/chat", {
                message: userMessage,
            });

            console.log("Chatbot Response:", response.data);

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text:
                        response.data.message ||
                        "Sorry, I couldn't generate a response.",
                },
            ]);
        } catch (error) {
            console.error("CHATBOT ERROR:", error);
            console.error("STATUS:", error.response?.status);
            console.error("DATA:", error.response?.data);

            let errorMessage = "Something went wrong.";

            if (error.response?.status === 401) {
                errorMessage =
                    "You are not authenticated. Please login again.";
            } else if (error.response?.status === 422) {
                errorMessage =
                    error.response?.data?.message ||
                    "Please enter a valid message.";
            } else if (error.response?.status === 500) {
                errorMessage =
                    error.response?.data?.message ||
                    "Gemini API request failed.";
            } else if (error.response?.data?.error) {
                errorMessage = JSON.stringify(
                    error.response.data.error
                );
            } else if (error.message) {
                errorMessage = error.message;
            }

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text: errorMessage,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="
                    fixed bottom-6 right-6 z-50
                    w-16 h-16
                    rounded-full
                    bg-blue-600
                    text-white
                    shadow-xl
                    flex items-center justify-center
                    text-2xl
                    hover:bg-blue-700
                    hover:scale-105
                    transition-all duration-200
                "
                aria-label="Open chatbot"
            >
                {isOpen ? "✕" : "💬"}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div
                    className="
                        fixed
                        bottom-24
                        right-6
                        z-50
                        w-[360px]
                        max-w-[calc(100vw-32px)]
                        h-[520px]
                        bg-white
                        rounded-2xl
                        shadow-2xl
                        border
                        border-gray-200
                        flex
                        flex-col
                        overflow-hidden
                    "
                >
                    {/* Header */}
                    <div className="bg-blue-600 text-white px-5 py-4 flex items-center gap-3">
                        <div
                            className="
                                w-10 h-10
                                rounded-full
                                bg-white/20
                                flex items-center justify-center
                                text-xl
                            "
                        >
                            🩺
                        </div>

                        <div>
                            <h3 className="font-semibold">
                                Doctor Assistant
                            </h3>

                            <p className="text-xs text-blue-100">
                                AI Appointment Assistant
                            </p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${
                                    msg.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`
                                        max-w-[80%]
                                        px-4
                                        py-2.5
                                        rounded-2xl
                                        text-sm
                                        leading-relaxed
                                        ${
                                            msg.role === "user"
                                                ? "bg-blue-600 text-white rounded-br-md"
                                                : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md"
                                        }
                                    `}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Loading */}
                        {loading && (
                            <div className="flex justify-start">
                                <div
                                    className="
                                        bg-white
                                        border
                                        border-gray-100
                                        shadow-sm
                                        px-4
                                        py-3
                                        rounded-2xl
                                        rounded-bl-md
                                    "
                                >
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t bg-white">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) =>
                                    setMessage(e.target.value)
                                }
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about appointments..."
                                disabled={loading}
                                className="
                                    flex-1
                                    px-4
                                    py-3
                                    text-sm
                                    border
                                    border-gray-200
                                    rounded-xl
                                    outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                    disabled:bg-gray-100
                                "
                            />

                            <button
                                onClick={sendMessage}
                                disabled={
                                    loading || !message.trim()
                                }
                                className="
                                    w-11 h-11
                                    rounded-xl
                                    bg-blue-600
                                    text-white
                                    flex
                                    items-center
                                    justify-center
                                    hover:bg-blue-700
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                    transition
                                "
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}