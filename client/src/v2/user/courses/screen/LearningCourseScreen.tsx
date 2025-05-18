import {Breadcrumb, Layout, Menu, Typography} from 'antd';
import {useEffect, useState} from 'react';
import instance from "../../../../v1/utils/customizeAxios.ts";
import {useParams} from "react-router-dom";
import {Chapter, Lecture} from "./InsideCoursePreviewPart.tsx";
import {MenuFoldOutlined, MenuUnfoldOutlined} from '@ant-design/icons';

const {Content, Sider} = Layout;
const {Title, Paragraph} = Typography;

export default function LearningCourseScreen() {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);

    const {id} = useParams()

    useEffect(() => {
        const fetchContent = async () => {
            const response = await instance.get(`/v2/courses/${id}/content`);
            const content = response.data;

            const chapterList = content.filter((item: any) => item.type === 'CHAPTER');
            const lectureList = content.filter((item: any) => item.type === 'LECTURE');

            setChapters(chapterList);
            setLectures(lectureList);

            if (lectureList.length > 0) {
                setCurrentLecture(lectureList[0]); // Show bài đầu tiên khi load
            }
        };

        fetchContent();
    }, [id]);

    const getLecturesByChapter = (chapterId: number) => {
        return lectures.filter((lec) => lec.parent?.id === chapterId);
    };

    return (
        <Layout>
            <Layout style={{padding: '0 24px 24px'}}>
                <Breadcrumb
                    items={[{title: 'Home'}, {title: 'Courses'}, {title: 'Learning'}]}
                    style={{margin: '16px 0'}}
                />

                <Content
                    style={{
                        padding: 24,
                        margin: 0,
                        minHeight: 280,
                        background: '#fff',
                        borderRadius: 8,
                    }}
                >
                    {/* Hiện video + info bài học */}
                    {currentLecture && (
                        <div className="flex flex-col gap-6">
                            {/* Video */}
                            <div className="rounded-lg overflow-hidden shadow-md">
                                {currentLecture.videoUrl ? (
                                    <video
                                        src={currentLecture.videoUrl}
                                        controls
                                        className="w-full block"
                                    />
                                ) : (
                                    <p className="p-4 text-center text-gray-500">No video for this lecture.</p>
                                )}
                            </div>

                            {/* Title */}
                            <h3 className="text-2xl font-semibold m-0">{currentLecture.title}</h3>

                            {/* Description */}
                            <p className="text-base leading-relaxed text-gray-700 mt-2">
                                {currentLecture.description}
                            </p>
                        </div>

                    )}
                </Content>
            </Layout>

            <SidebarWithCollapse chapters={chapters} currentLecture={currentLecture}
                                 setCurrentLecture={setCurrentLecture}
                                 getLecturesByChapter={getLecturesByChapter}/>
        </Layout>
    );
}

type SidebarWithCollapseProps = {
    chapters: Chapter[];
    currentLecture: Lecture | null;
    setCurrentLecture: (lecture: Lecture) => void;
    getLecturesByChapter: (chapterId: number) => Lecture[];
};

function SidebarWithCollapse({
                                 chapters,
                                 currentLecture,
                                 setCurrentLecture,
                                 getLecturesByChapter
                             }: SidebarWithCollapseProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Sider
            width={300}
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            className="bg-white h-screen overflow-y-auto border-r"
        >
            {/* Collapse Button */}
            <div className="p-4 flex items-center justify-between border-b">
                {!collapsed && <span className="text-lg font-semibold">Course Content</span>}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    {collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                </button>
            </div>

            {/* Menu */}
            <Menu
                mode="inline"
                defaultSelectedKeys={currentLecture ? [String(currentLecture.id)] : []}
                style={{borderRight: 0}}
                className="!border-none"
            >
                {chapters.map((chapter) => (
                    <Menu.ItemGroup
                        key={`chapter-${chapter.id}`}
                        title={
                            !collapsed && (
                                <span className="text-gray-800 font-medium">{chapter.title}</span>
                            )
                        }
                    >
                        {getLecturesByChapter(chapter.id).map((lecture) => (
                            <Menu.Item
                                key={lecture.id}
                                onClick={() => setCurrentLecture(lecture)}
                                className={`
                                    !rounded 
                                    ${currentLecture?.id === lecture.id
                                    ? '!bg-blue-100 !text-blue-600 font-semibold'
                                    : 'hover:!bg-gray-100 !text-gray-700'}
                                `}
                            >
                                {!collapsed && lecture.title}
                            </Menu.Item>
                        ))}
                    </Menu.ItemGroup>
                ))}
            </Menu>
        </Sider>
    );
}
