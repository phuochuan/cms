import {useEffect, useState} from "react";
import {Button, Collapse, List, Modal, Typography} from "antd";
import instance from "../../../../v1/utils/customizeAxios.ts";

const {Panel} = Collapse;
const {Title, Text} = Typography;

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

export type CourseContent = Chapter | Lecture;

export function InsideCoursePreviewPart({courseId}: { courseId: number }) {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [lectures, setLectures] = useState<Lecture[]>([]);

    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            const response = await instance.get(`/v2/courses/${courseId}/content`);
            const content: CourseContent[] = response.data;

            const chapterList = content.filter(item => item.type === 'CHAPTER') as Chapter[];
            const lectureList = content.filter(item => item.type === 'LECTURE') as Lecture[];

            setChapters(chapterList);
            setLectures(lectureList);
        };

        fetchContent();
    }, [courseId]);

    const getLecturesByChapter = (chapterId: number) => {
        return lectures.filter(lec => lec.parent?.id === chapterId);
    }

    const getLectureIndex = (lectureId: number) => {
        return lectures.findIndex(lec => lec.id === lectureId);
    }

    const handlePreview = (videoUrl: string) => {
        setPreviewVideoUrl(videoUrl);
        setPreviewVisible(true);
    }

    return (
        <div className="p-5">
            {/* Title lớn */}
            <Title level={3}>Course Content</Title>
            <Text type="secondary">
                {chapters.length} chapters • {lectures.length} lectures
            </Text>
            <Collapse accordion>
                {chapters.map((chapter) => {
                    const chapterLectures = getLecturesByChapter(chapter.id);

                    return (
                        <Panel
                            header={
                                <div className="flex flex-col">
                                    <Text strong>{chapter.title}</Text>
                                    <Text type="secondary">
                                        CHAPTER • {chapterLectures.length} lectures
                                    </Text>
                                </div>
                            }
                            key={chapter.id}
                        >
                            <Text type="secondary">{chapter.description}</Text>

                            <List
                                size="small"
                                dataSource={chapterLectures}
                                renderItem={(lecture) => (
                                    <List.Item>
                                        <div className="flex justify-between items-center w-full">
                                            <div>
                                                <Text>{lecture.title}</Text>
                                            </div>
                                            {getLectureIndex(lecture.id) < 3 && lecture.videoUrl && (
                                                <Button type="link" onClick={() => handlePreview(lecture.videoUrl)}>
                                                    Preview
                                                </Button>
                                            )}
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </Panel>
                    )
                })}
            </Collapse>

            {/* Modal Preview */}
            <Modal
                title="Lecture Preview"
                visible={previewVisible}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
                width={800}
            >
                {previewVideoUrl && (
                    <video
                        src={previewVideoUrl}
                        controls
                        style={{width: '100%'}}
                    />
                )}
            </Modal>
        </div>
    )
}
