import { CourseType } from "../../../../App.tsx";
import CourseCardComponent, { SkeletonLoader } from "./course-card.tsx";

type PropsType = {
    ListCourse: CourseType[];
    isLoading: boolean;
    length: number;
};

export default function ListCourseCardComponent({
    ListCourse,
    isLoading,
    length = 6,
}: PropsType) {
    if (isLoading) {
        return (
            <div className='grid gap-4 text-black xl:gap-2 xl:grid-cols-3 md:grid-cols-2 auto-rows-auto'>
                {Array.from({ length: length }).map((_, index) => (
                    <SkeletonLoader key={index} />
                ))}
            </div>
        );
    }
    return (
        <div className='grid gap-4 text-black xl:gap-2 xl:grid-cols-3 md:grid-cols-2 auto-rows-auto'>
            {ListCourse.map((course) => {
                return <CourseCardComponent course={course} key={course.id} />;
            })}
        </div>
    );
}
