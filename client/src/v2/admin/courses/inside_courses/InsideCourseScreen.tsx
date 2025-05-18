import {useEffect, useState} from "react";
import {Image, Input, Popconfirm, Space, Table, Tag} from 'antd';
import {toast} from "sonner";
import {useNavigate, useParams} from "react-router-dom";
import instance from "../../../../v1/utils/customizeAxios.ts";

const {Search} = Input;
const {Column} = Table;

interface InsideCourseType {
    id: string | undefined;
    name: string;
    thumbnailUrl: string;
    createdDate: string;
    level: string;
    categories: {
        id: string;
        value: string;
        name?: string | undefined;
        label?: string | undefined;
    }[];
    status: string;
    totalChapter: number;
}

export function InsideCourseScreen() {
    const [courses, setCourses] = useState<InsideCourseType[]>([]);
    const [searchKey, setSearchKey] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Partial<InsideCourseType> | undefined>(undefined);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            const response = await instance.get(`/v2/courses/inside-courses`);
            setCourses(response.data);
        };
        fetchCourses();
    }, [modalOpen]);

    const showCourses = () => {
        return courses.filter(course =>
            course.name?.toUpperCase().includes(searchKey.toUpperCase()) ||
            course.level?.toUpperCase().includes(searchKey.toUpperCase()) ||
            course.status?.toUpperCase().includes(searchKey.toUpperCase())
        );
    };

    const handleEdit = (course: InsideCourseType) => {
        setEditingCourse(course);
        setModalOpen(true);
    };

    const handleDelete = async (courseId: string | undefined) => {
        const resp = await instance.delete(`/v2/inside-courses/${courseId}`);

        if (resp.status !== 204 && resp.status !== 200) {
            toast.error("Error while deleting a course", {
                style: {
                    color: "red"
                },
                description: "Please check if any dependencies exist for this course"
            });
            return;
        }

        const response = await instance.get(`/v2/inside-courses`);
        setCourses(response.data);

        toast.success("Delete course successfully", {
            style: {
                color: "green",
                fontWeight: "bold",
                textAlign: "center",
            },
        });
    };

    const handleAddCourse = () => {
        navigate(`/admin/inside-courses/`);
    };

    const handleEditLearningContent = (id: number) => {
        navigate(`/admin/inside-courses/${id}/content`);

    }

    return (
        <div className="p-10 gap-2.5 h-full">
            <div className="flex-col justify-between items-center mb-5 ">
                <button
                    onClick={handleAddCourse}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded h-10"
                >
                    Add Course
                </button>

                <Search
                    placeholder="Search by name, level, or status..."
                    enterButton
                    onSearch={(value) => setSearchKey(value.trim())}
                    allowClear
                    className="h-10 pt-2"
                />
            </div>

            <div>
                <Table<InsideCourseType> dataSource={showCourses()} rowKey="id" pagination={{pageSize: 10}}>
                    <Column
                        title="Thumbnail"
                        key="thumbnail"
                        render={(_, record: InsideCourseType) => (
                            <Image width={80} src={record.thumbnailUrl}/>
                        )}
                    />
                    <Column
                        title="Name"
                        dataIndex="name"
                        key="name"
                    />
                    <Column
                        title="Level"
                        dataIndex="level"
                        key="level"
                    />
                    <Column
                        title="Categories"
                        key="categories"
                        render={(_, record: InsideCourseType) => (
                            <>
                                {record.categories.map(cat => (
                                    <Tag color="blue" key={cat.id}>
                                        {cat.label || cat.name || cat.value}
                                    </Tag>
                                ))}
                            </>
                        )}
                    />
                    <Column
                        title="Status"
                        key="status"
                        render={(_, record: InsideCourseType) => {
                            const color = record.status === 'active' ? 'green' : 'volcano';
                            return <Tag color={color}>{record.status.toUpperCase()}</Tag>;
                        }}
                    />
                    <Column
                        title="Total Chapters"
                        dataIndex="totalChapter"
                        key="totalChapter"
                    />
                    <Column
                        title="Created Date"
                        dataIndex="createdDate"
                        key="createdDate"
                    />
                    <Column
                        title="Action"
                        key="action"
                        render={(_, record: InsideCourseType) => (
                            <Space size="middle">
                                <a onClick={() => handleEdit(record)}>Edit</a>
                                <Popconfirm
                                    title="Are you sure you want to delete this course?"
                                    onConfirm={() => handleDelete(record.id)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <a>Delete</a>
                                </Popconfirm>
                                <a onClick={() => handleEditLearningContent(record.id)}>Edit learning content</a>
                            </Space>
                        )}
                    />
                </Table>
            </div>
        </div>
    );
}
