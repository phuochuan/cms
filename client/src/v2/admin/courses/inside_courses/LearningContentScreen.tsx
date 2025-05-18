import instance from "../../../../v1/utils/customizeAxios.ts";
import {useEffect, useState} from "react";
import {Button, Input, Modal, Popconfirm, Select, Space, Table} from "antd";
import {toast} from "sonner";
import {Upload} from "antd";
import {UploadOutlined} from "@ant-design/icons";
import type {UploadChangeParam} from "antd/es/upload";
import {useParams} from "react-router-dom";

const {Column} = Table;
const {Option} = Select;

export interface CourseContent {
    id: number;
    title: string;
    description: string;
    type: 'CHAPTER' | 'LECTURE';
    videoUrl: string | null;
    createdDate: string | null;
    parent: null | Chapter;
}

export interface Chapter {
    id: number;
    title: string;
    description: string;
    type: 'CHAPTER';
    videoUrl: null;
    createdDate: string | null;
    parent: null;
}

export interface Lecture {
    id: number;
    title: string;
    description: string;
    type: 'LECTURE';
    videoUrl: string;
    createdDate: string | null;
    parent: Chapter;
}

export function LearningContentManagementScreen() {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingContent, setEditingContent] = useState<Partial<CourseContent>>({});
    const [searchKey, setSearchKey] = useState('');
    const {id}=useParams()


    // Fetch data
    useEffect(() => {
        const fetchContent = async () => {
            const response = await instance.get(`/v2/courses/${id}/content`);
            const allContents: CourseContent[] = response.data;

            // Phân chia Chapter và Lecture
            setChapters(allContents.filter(item => item.type === 'CHAPTER') as Chapter[]);
            setLectures(allContents.filter(item => item.type === 'LECTURE') as Lecture[]);
        };
        fetchContent();
    }, []);

    // Filter lectures by chapter
    const getLecturesByChapter = (chapterId: number) => {
        return lectures.filter(lec => lec.parent?.id === chapterId);
    };

    // Save function
    const handleSave = async (content: CourseContent) => {
        const updatedContent = {...editingContent, ...content};

        if (!updatedContent.id) {
            await instance.post(`/v2/courses/${id}/content`, updatedContent);
        } else {
            await instance.put(`/v2/courses/${id}/content/${updatedContent.id}`, updatedContent);
        }

        const response = await instance.get(`/v2/courses/${id}/content`);
        const allContents: CourseContent[] = response.data;
        setChapters(allContents.filter(item => item.type === 'CHAPTER') as Chapter[]);
        setLectures(allContents.filter(item => item.type === 'LECTURE') as Lecture[]);

        setModalOpen(false);
        toast.success("Content saved successfully!");
    };

    const handleDelete = async (contentId: number) => {
        await instance.delete(`/v2/courses/${id}/content/${contentId}`);
        const response = await instance.get(`/v2/courses/${id}/content`);
        const allContents: CourseContent[] = response.data;
        setChapters(allContents.filter(item => item.type === 'CHAPTER') as Chapter[]);
        setLectures(allContents.filter(item => item.type === 'LECTURE') as Lecture[]);
    };

    const handleEdit = (content: CourseContent) => {
        setEditingContent(content);
        setModalOpen(true);
    };

    const handleAddContent = (type: 'CHAPTER' | 'LECTURE', parentChapterId?: number) => {
        if (type === 'LECTURE' && parentChapterId) {
            setEditingContent({type, parent: chapters.find(ch => ch.id === parentChapterId) || null});
        } else {
            setEditingContent({type});
        }
        setModalOpen(true);
    };

    return (
        <div className="p-10 gap-2.5 h-full">
            {/* Modal */}
            <Modal
                title={editingContent.id ? 'Edit Content' : 'Add Content'}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={null}
            >
                <Select
                    value={editingContent.type}
                    onChange={(val) => setEditingContent({...editingContent, type: val as 'CHAPTER' | 'LECTURE'})}
                    style={{width: '100%', marginBottom: 10}}
                >
                    <Option value="CHAPTER">Chapter</Option>
                    <Option value="LECTURE">Lecture</Option>
                </Select>

                <Input
                    placeholder="Title"
                    value={editingContent.title}
                    onChange={(e) => setEditingContent({...editingContent, title: e.target.value})}
                    style={{marginBottom: 10}}
                />
                <Input
                    placeholder="Description"
                    value={editingContent.description}
                    onChange={(e) => setEditingContent({...editingContent, description: e.target.value})}
                    style={{marginBottom: 10}}
                />

                {editingContent.type === 'LECTURE' && (
                    <>
                        <Input
                            placeholder="Video URL"
                            value={editingContent.videoUrl || ''}
                            onChange={(e) => setEditingContent({...editingContent, videoUrl: e.target.value})}
                            style={{marginBottom: 10}}
                        />

                        {/* Upload Video */}
                        <Upload
                            name="video"
                            action="http://localhost:8080/api/v2/courses/content/videos"  // Gọi vào server backend 8080
                            showUploadList={false}
                            onChange={(info: UploadChangeParam) => {
                                if (info.file.status === 'done') {
                                    const videoUrl = info.file.response; // server trả URL video về
                                    setEditingContent({...editingContent, videoUrl});
                                    toast.success('Uploaded successfully!');
                                } else if (info.file.status === 'error') {
                                    toast.error('Upload failed');
                                }
                            }}
                        >
                            <Button icon={<UploadOutlined/>}>Upload Video</Button>
                        </Upload>


                        <Select
                            placeholder="Select Chapter"
                            value={editingContent.parent?.id}
                            onChange={(val) => {
                                const selectedChapter = chapters.find(ch => ch.id === val) || null;
                                setEditingContent({...editingContent, parent: selectedChapter});
                            }}
                            style={{width: '100%', marginTop: 10}}
                        >
                            {chapters.map(ch => (
                                <Option key={ch.id} value={ch.id}>{ch.title}</Option>
                            ))}
                        </Select>
                    </>
                )}


                <Button type="primary" onClick={() => handleSave(editingContent as CourseContent)}
                        style={{width: '100%'}}>
                    Save
                </Button>
            </Modal>

            {/* Search */}
            <div className="flex justify-between mb-5">
                <Button type="primary" onClick={() => handleAddContent('CHAPTER')}>Add Chapter</Button>
                <Input
                    placeholder="Search"
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    style={{width: '300px'}}
                />
            </div>

            {/* Table for Chapter */}
            <Table<Chapter>
                dataSource={chapters.filter(ch => ch.title?.toUpperCase().includes(searchKey.toUpperCase()))}
                rowKey="id"
                expandable={{
                    expandedRowRender: (record) => {
                        const lectureList = getLecturesByChapter(record.id);
                        return (
                            <Table<Lecture>
                                dataSource={lectureList}
                                rowKey="id"
                                pagination={false}
                                size="small"
                            >
                                <Column title="Title" dataIndex="title" key="title"/>
                                <Column title="Description" dataIndex="description" key="description"/>
                                <Column
                                    title="Action"
                                    key="action"
                                    render={(_, record: Lecture) => (
                                        <Space size="middle">
                                            <a onClick={() => handleEdit(record)}>Edit</a>
                                            <Popconfirm
                                                title="Sure to delete?"
                                                onConfirm={() => handleDelete(record.id)}
                                            >
                                                <a>Delete</a>
                                            </Popconfirm>
                                        </Space>
                                    )}
                                />
                            </Table>
                        );
                    }
                }}
                pagination={{pageSize: 5}}
            >
                <Column title="Title" dataIndex="title" key="title"/>
                <Column title="Description" dataIndex="description" key="description"/>
                <Column
                    title="Action"
                    key="action"
                    render={(_, record: Chapter) => (
                        <Space size="middle">
                            <a onClick={() => handleEdit(record)}>Edit</a>
                            <Popconfirm
                                title="Sure to delete chapter?"
                                onConfirm={() => handleDelete(record.id)}
                            >
                                <a>Delete</a>
                            </Popconfirm>
                            <a onClick={() => handleAddContent('LECTURE', record.id)}>Add Lecture</a>
                        </Space>
                    )}
                />
            </Table>
        </div>
    );
}

