import React, {useState, useRef, useEffect} from "react";
import {List, Input, Button, Avatar, Spin, Typography} from "antd";
import {UserOutlined, RobotOutlined} from "@ant-design/icons";
import instance from "../../v1/utils/customizeAxios.ts";
import {ArrowRightOutlined} from "@ant-design/icons";

const { TextArea } = Input;
const { Text } = Typography;

type CourseRecommendationRequestion = {
    userMessage: string,
    threadId: any
}

const ChatUI = ({ idThread, setMessageId }) => {
    const [messages, setMessages] = useState([
        { role: "ai", content: "Hello! How can I assist you today?" },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        async function getThreadContent() {
            if (!idThread) {
                // Nếu không có idThread thì dùng dữ liệu mẫu
                return;
            }

            try {
                const response = await instance.get(
                    `/v2/ai/courses/recommendation/threads/${idThread}/messages`
                );

                const formatted = response.data.map((msg) => ({
                    id: msg.id,
                    role: msg.role === "assistant" ? "assistant" : "user",
                    content: msg.message,
                }));

                setMessages(formatted);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        }

        getThreadContent();
    }, [idThread]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessage = { role: "user", content: input.trim() };

        setMessages((prev) => [...prev, newMessage]);

        setInput("");

        setIsTyping(true);

        const aiRequest = {
            userMessage: input.trim(),
            aiThreadId: idThread
        };

        const response = await instance.post(`/v2/ai/courses/recommendation`, aiRequest);

        setTimeout(() => {
            const aiResponse = {
                role: "assistant",
                content: response?.data.message,
                ...response?.data
            };
            setMessages((prev) => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div
            style={{
                maxWidth: 1000,
                margin: "0 auto",
                padding: 24,
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <List
                size="small"
                dataSource={messages}
                style={{ overflow: "auto", maxHeight: "75vh", flexGrow: 1 }}
                renderItem={(msg) => {
                    const isUser = msg.role === "user";
                    return (
                        <List.Item
                            style={{
                                justifyContent: isUser ? "flex-end" : "flex-start",
                                display: "flex",
                            }}
                        >
                            <List.Item.Meta
                                avatar={
                                    isUser ? (
                                        <Avatar icon={<UserOutlined/>}/>
                                    ) : (
                                        <Avatar
                                            style={{ backgroundColor: "#87d068" }}
                                            icon={<RobotOutlined/>}
                                        />
                                    )
                                }
                                title={<Text strong>{isUser ? "You" : "AI"}</Text>}
                                description={msg.content}
                                style={{
                                    maxWidth: "75%",
                                    textAlign: isUser ? "right" : "left",
                                    background: "#f5f5f5",
                                    borderRadius: 8,
                                    padding: 8,
                                }}
                            />
                            {msg.role === "assistant" && (
                                <Button
                                    type="link"
                                    icon={<ArrowRightOutlined/>}
                                    onClick={() => {
                                        setMessageId(msg.id)
                                    }}
                                >
                                    Recommended Courses
                                </Button>
                            )}
                        </List.Item>

                    );
                }}
            />
            <div ref={messagesEndRef}/>

            {isTyping && (
                <div style={{ margin: "12px 0", textAlign: "left" }}>
                    <Spin size="small"/> <Text type="secondary">AI is typing...</Text>
                </div>
            )}

            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                <TextArea
                    rows={2}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onPressEnter={(e) => {
                        if (!e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                    placeholder="Type your message..."
                />
                <Button type="primary" onClick={sendMessage}>
                    Send
                </Button>
            </div>
        </div>
    );
};

export default ChatUI;
