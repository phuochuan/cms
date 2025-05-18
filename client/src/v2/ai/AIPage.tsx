import React, {useEffect, useState} from "react";
import type {MenuProps} from 'antd';
import {Button, Layout, Menu, theme} from 'antd';
import AIPageLayout from "./AIPageLayout.tsx";
import ChatUI from "./ChatUI.tsx";
import CourseList from "./CourseCard.tsx";
import instance from "../../v1/utils/customizeAxios.ts";
import {PlusOutlined} from '@ant-design/icons';

const { Content, Sider } = Layout;

const siderStyle: React.CSSProperties = {
    height: '85vh',
    position: 'sticky',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: 'thin',
    scrollbarGutter: 'stable',
    background: "white",
};

function AIPage() {
    const [threads, setThreads] = useState<any[]>([]);
    const [selectedThreadKey, setSelectedThreadKey] = useState<string | null>(null);
    const [messageId, setMessageId] = useState(null);
    const [courses, setCourses] = useState<any[] | undefined>();
    const [showCourses, setShowCourses] = useState(false);
    

    // Fetch threads on mount
    useEffect(() => {
        async function getThreads() {
            try {
                const response = await instance.get("/v2/ai/courses/recommendation/threads");
                const data = response.data || [];
                setThreads(data);

                // Auto-select first thread if available
                if (data.length > 0) {
                    const firstThread = data[0];
                    setSelectedThreadKey(`${firstThread.id}`);
                }
            } catch (err) {
                console.error("Failed to fetch threads", err);
            }
        }

        getThreads();
    }, []);

    // Fetch courses when messageId changes
    useEffect(() => {
        async function getRecommendedCourses() {
            if (!messageId) return;
            try {
                const response = await instance.get(
                    `/v2/ai/courses/recommendation/threads/messages/${messageId}/fake-registration`
                );
                setCourses(response.data);

                setShowCourses(true)
            } catch (err) {
                console.error("Failed to fetch recommended courses", err);
            }
        }

        getRecommendedCourses();
    }, [messageId]);

    // Menu items
    const threadMenuItems: MenuProps['items'] = threads.map((thread) => ({
        key: `${thread.id}`,
        label: thread.content,
    }));

    function createNewThread() {
        const newId = Math.floor(Math.random() * (100000 - threads.length + 1)) + threads.length;

        if (threads.some(value => value.content === 'new conversation')) {
            const selectedThread = threads.filter(value => value.content === 'new conversation')[0];

            setSelectedThreadKey(selectedThread.id + '');

            return;
        }

        setSelectedThreadKey(newId + '');

        setThreads([{
            id: newId,
            content: 'new conversation'
        }, ...threads])
    }

    async function setSelectedNewhread(id: React.SetStateAction<string | null | number>) {
        const response = await instance.get("/v2/ai/courses/recommendation/threads");
        const data = response.data || [];
        setThreads(data);

        setSelectedThreadKey(id)
    }

    return (
        <AIPageLayout>
            <Layout style={{ maxHeight: "90vh" }}>
                <Sider width={250} style={siderStyle}>
                    <div style={{
                        padding: '16px',
                        background: 'white',
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h2 style={{ margin: 0 }}>History</h2>
                        <Button
                            type="primary"
                            icon={<PlusOutlined/>}
                            onClick={() => createNewThread()}
                        >
                            Add
                        </Button>
                    </div>
                    <Menu
                        mode="inline"
                        selectedKeys={selectedThreadKey ? [selectedThreadKey] : []}
                        style={{ height: '100%', borderRight: 0, overflow: 'auto', }}
                        items={threadMenuItems}
                        onClick={({ key }) => {
                            setSelectedThreadKey(key);
                            setMessageId(null);
                        }}
                    />
                </Sider>

                <Layout style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'row' }}>
                    <Content
                        style={{
                            padding: 24,
                            margin: 0,
                            minHeight: 280,
                            background: '#fff',
                            borderRadius: '8px',
                            display: 'flex',
                            flex: 1,
                            gap: '16px',
                            position: 'relative',
                        }}
                    >
                        {/* Left: Chat UI */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <ChatUI idThread={selectedThreadKey} setMessageId={setMessageId}
                                    setSelectedNewhread={setSelectedNewhread}/>
                        </div>

                        {/* Right: Course Panel */}
                        {showCourses ? (
                            <div
                                style={{
                                    width: '500px',
                                    borderLeft: '1px solid #e8e8e8',
                                    paddingLeft: '16px',
                                    overflowY: 'auto',
                                }}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Courses</h3>
                                    <Button size="small" onClick={() => setShowCourses(false)}>
                                        Hide
                                    </Button>
                                </div>
                                <CourseList courses={courses || []}/>
                            </div>
                        ) : (
                            null
                        )}
                    </Content>
                </Layout>
            </Layout>
        </AIPageLayout>
    );
}

export default AIPage;
