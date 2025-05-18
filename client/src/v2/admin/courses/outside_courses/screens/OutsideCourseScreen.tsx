import {useEffect, useState} from "react";
import {Image, Input, Popconfirm, Space, Table, Tag} from 'antd';
import {toast} from "sonner";
import instance from "../../../../../v1/utils/customizeAxios.ts";
import {CourseType} from "../../../../../v1/screens/user/detail-of-course.tsx";
import {useNavigate} from "react-router-dom";
import ModalEditOrDeleteCourse from "../../../../../v1/components/modal/modal-edit-or-delete-course.tsx";

const {Search} = Input;
const {Column} = Table;


export function OutsideCourseScreen() {
    const [courses, setCourses] = useState<CourseType[]>([]);
    const [searchKey, setSearchKey] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Partial<CourseType> | undefined>(undefined);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            const response = await instance.get(`/v2/courses`);
            setCourses(response.data);
        }
        fetchCourses()
    }, [modalOpen]);

    const showCourses = () => {
        return courses.filter(course =>
            course.name?.toUpperCase().includes(searchKey.toUpperCase()) ||
            course.platform?.toUpperCase().includes(searchKey.toUpperCase()) ||
            course.teacherName?.toUpperCase().includes(searchKey.toUpperCase()) ||
            course.level?.toUpperCase().includes(searchKey.toUpperCase()) ||
            course.status?.toUpperCase().includes(searchKey.toUpperCase())
        )
    }

    const handleEdit = (course: CourseType) => {
        setEditingCourse(course);
        setModalOpen(true);
    }

    const handleDelete = async (courseId: string | undefined) => {
        const resp = await instance.delete(`/v2/courses/${courseId}`);

        if (resp.status !== 204 && resp.status !== 200) {
            toast.error("Error while deleting a course", {
                style: {
                    color: "red"
                },
                description: "Please check whether existing any registration that was created base this course"
            });

            return;
        }

        const response = await instance.get(`/v2/courses`);

        setCourses(response.data);

        toast.success("Delete course successfully", {
            style: {
                color: "green",
                fontWeight: "bold",
                textAlign: "center",
            },
        });

    }

    const handleAddCourse = () => {
        navigate('/admin/outside-courses/create');
    };

    return (
        <div className={"p-10 gap-2.5 h-full"}>
            <ModalEditOrDeleteCourse
                courseData={editingCourse}
                open={modalOpen}
                onOpenChange={setModalOpen} children={undefined}            >
            </ModalEditOrDeleteCourse>

            <div className="flex-col justify-between items-center mb-5 ">
                <button
                    onClick={handleAddCourse}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded h-10"
                >
                    Add Course
                </button>

                <Search
                    placeholder="Search course name, platform, teacher, level, status..."
                    enterButton
                    onSearch={(value) => setSearchKey(value.trim())}
                    allowClear
                    className="h-10 pt-2"
                />
            </div>

            <div>
                <Table<CourseType> dataSource={showCourses()} rowKey="id" pagination={{pageSize: 10}}>
                    <Column
                        title="Thumbnail"
                        key="thumbnail"
                        render={(_, record: CourseType) => (
                            <Image width={80} src={record.thumbnailUrl}/>
                        )}
                    />
                    <Column
                        title="Name"
                        dataIndex="name"
                        key="name"
                        render={(text: string, record: CourseType) => (
                            <a href={record.link} target="_blank" rel="noopener noreferrer">{text}</a>
                        )}
                    />
                    <Column title="Platform" dataIndex="platform" key="platform"/>
                    <Column title="Teacher" dataIndex="teacherName" key="teacherName"/>
                    <Column title="Level" dataIndex="level" key="level"/>
                    <Column
                        title="Categories"
                        key="categories"
                        render={(_, record: CourseType) => (
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
                        render={(_, record: CourseType) => {
                            const color = record.status === 'active' ? 'green' : 'volcano';
                            return <Tag color={color}>{record.status.toUpperCase()}</Tag>;
                        }}
                    />
                    <Column title="Enrollees" dataIndex="totalEnrollees" key="totalEnrollees"/>
                    <Column title="Created Date" dataIndex="createdDate" key="createdDate"/>
                    <Column
                        title="Action"
                        key="action"
                        render={(_, record: CourseType) => (
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
                            </Space>
                        )}
                    />
                </Table>
            </div>
        </div>
    )
}
