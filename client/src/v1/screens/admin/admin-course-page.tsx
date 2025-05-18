import Sidebar from "../../components/course/filter/sidebar.tsx";
import MainContent from "../../components/user/main-content.tsx";

export default function AdminCoursePageScreen() {
    return (
        <div className='flex items-start gap-1 px-3 py-8 mx-auto max-w-screen-2xl'>
            <Sidebar />
            <MainContent />
        </div>
    );
}
