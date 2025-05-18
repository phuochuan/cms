import {createBrowserRouter, Outlet, RouterProvider} from "react-router-dom";
import HeaderHomepage from "./v1/components/header.tsx";
import HomepageScreen from "./v1/screens/user/homepage.tsx";
import Login from "./v1/screens/auth/login.tsx";
import Detail_Of_Course from "./v1/screens/user/detail-of-course.tsx";
import {ReactElement, useEffect} from "react";
import {ProtectedRoute} from "./v1/components/auth/protected-route-auth.tsx";
import AccountSettingScreen from "./v1/screens/user/personal/account-setting.tsx";
import Navigation from "./v1/components/user/navigation.tsx";
import MyRegistrationsScreen from "./v1/screens/user/personal/my-registration.tsx";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "./v1/redux/store/store.ts";
import {fetchUserDetails} from "./v1/redux/slice/user.slice.ts";
import NotPermitted from "./v1/screens/error/not-permitted.tsx";
import NotFound from "./v1/screens/error/not-found.tsx";
import AdminHomePage from "./v1/screens/admin/admin-home.tsx";

import SignUp from "./v1/screens/auth/sign-up.tsx";
import AdminCoursePageScreen from "./v1/screens/admin/admin-course-page.tsx";
import {ProtectedRouteLogin} from "./v1/components/auth/protected-route-login.tsx";
import {isTokenExpired} from "./v1/utils/validateToken.ts";
import {RegistrationModal} from "./v1/components/modal/registration-modal.tsx";
import LeaderBoard from "./v1/screens/user/leader-board.tsx";
import MyScore from "./v1/screens/user/personal/my-score.tsx";
import AccountantHomePage from "./v1/screens/accountant/accountant-home.tsx";

import "./App.css";
import {LayoutAdmin} from "./v2/admin/layouts/AdminLayout.tsx";
import {AccountManagementScreen} from "./v2/admin/accounts/screens/AccountManagementScreen.tsx";
import {OutsideCourseScreen} from "./v2/admin/courses/outside_courses/screens/OutsideCourseScreen.tsx";
import CreateCoursesScreen from "./v1/screens/admin/create-courses.tsx";
import {InsideCourseScreen} from "./v2/admin/courses/inside_courses/InsideCourseScreen.tsx";
import {
    LearningContentManagementScreen,
} from "./v2/admin/courses/inside_courses/LearningContentScreen.tsx";
import LearningCourseScreen from "./v2/user/courses/screen/LearningCourseScreen.tsx";
import AIPage from "./v2/ai/AIPage.tsx";

export type CourseType = {
    id: string | undefined;
    name: string;
    thumbnailUrl?: string;
    assignee?: {
        id?: string;
        name?: string;
        avatarUrl?: string;
        role?: string;
        status?: string;
    };
    platform?: string;
    createdDate?: string;
    period?: {
        startDay?: Date;
        endDay?: Date;
    };
    rating?: number;
    enrollmentCount?: number;
    level?: string;
};

export type RegistrationType = {
    id?: string;
    startDate?: Date;
    endDate?: Date;
    registerDate?: Date;
    lastUpdated?: Date;
    courseId?: string;
    courseName?: string;
    courseThumbnailUrl?: string;
    coursePlatform?: string;
    userId?: string;
    userName?: string;
    userFullname?: string;
    userAvatarUrl?: string;
    duration?: number;
    durationUnit?: string;
    status?: string;
};

const LayoutUser = ({children}: { children?: ReactElement }) => {
    const isUserRoute = window.location.pathname.startsWith(
        `${import.meta.env.VITE_BASE_URL}`
    );
    const user = useSelector((state: RootState) => state.user.user);
    const userRole = user.role;
    return (
        <div className='app-container bg-gray-50'>
            {isUserRoute && userRole === "USER" && (
                <>
                    <HeaderHomepage/>
                    <RegistrationModal/>
                    {children}
                    <Outlet/>
                </>
            )}

            {isUserRoute &&
                (userRole === "ADMIN" || userRole === "ACCOUNTANT") && (
                    <>
                        <NotPermitted/>
                    </>
                )}
        </div>
    );
};


const LayoutAccountant = () => {
    const isAccountRoute = window.location.pathname.startsWith(
        `${import.meta.env.VITE_BASE_URL}/accountant`
    );
    const user = useSelector((state: RootState) => state.user.user);
    const userRole = user.role;
    return (
        <>
            <div className='app-container'>
                {isAccountRoute && userRole === "ACCOUNTANT" && (
                    <>
                        <HeaderHomepage/>
                        <RegistrationModal/>
                        <Outlet/>
                    </>
                )}
                {isAccountRoute &&
                    (userRole === "USER" || userRole === "ADMIN") && (
                        <>
                            <NotPermitted/>
                        </>
                    )}
            </div>
        </>
    );
};

const router = createBrowserRouter(
    [
        {
            path: "/",
            element: (
                <ProtectedRoute>
                    <LayoutUser/>
                </ProtectedRoute>
            ),
            errorElement: <NotFound/>,
            children: [
                {
                    index: true,
                    element: <HomepageScreen/>,
                },
                {
                    path: "courses/:id",
                    element: <Detail_Of_Course/>,
                },{
                    path: "courses/learning/:id",
                    element: <LearningCourseScreen/>,
                },
                {
                    path: "leaderboard",
                    element: <LeaderBoard/>,
                },
                {
                    path: "ai",
                    element: <AIPage/>,
                },
            ],
        },
        {
            path: "personal",
            element: (
                <ProtectedRoute>
                    <LayoutUser>
                        <Navigation/>
                    </LayoutUser>
                </ProtectedRoute>
            ),
            errorElement: <NotFound/>,
            children: [
                {
                    index: true,
                    path: "account",
                    element: <AccountSettingScreen/>,
                },
                {
                    path: "registration",
                    element: <MyRegistrationsScreen/>,
                },
                {
                    path: "score",
                    element: <MyScore/>,
                },
            ],
        },
        {
            path: "/admin",
            element: (
                <ProtectedRoute>
                    <LayoutAdmin/>
                </ProtectedRoute>
            ),
            errorElement: <NotFound/>,
            children: [
                {
                    index: true,
                    element: <AdminHomePage/>,
                },
                {
                    path: "courses",
                    element: <AdminCoursePageScreen/>,
                },
                {
                    path: "outside-courses",
                    element: <OutsideCourseScreen/>,
                }, {
                    path: "outside-courses/create",
                    element: <CreateCoursesScreen/>,
                }, {
                    path: "inside-courses",
                    element: <InsideCourseScreen/>,
                },
                {
                    path: "inside-courses/:id/content",
                    element: <LearningContentManagementScreen/>,
                },
                {
                    path: "courses/:id",
                    element: <Detail_Of_Course/>,
                },
                {
                    path: "profile",
                    element: <AccountSettingScreen/>,
                },
                {
                    path: "accounts",
                    element: <AccountManagementScreen/>,
                },
            ],
        },
        {
            path: "/accountant",
            element: (
                <ProtectedRoute>
                    <LayoutAccountant/>
                </ProtectedRoute>
            ),
            errorElement: <NotFound/>,
            children: [
                {
                    index: true,
                    element: <AccountantHomePage/>,
                },
                {
                    path: "profile",
                    element: <AccountSettingScreen/>,
                },
            ],
        },
        {
            path: "login",
            element: (
                <ProtectedRouteLogin>
                    <Login/>
                </ProtectedRouteLogin>
            ),
        },
        {
            path: "signup",
            element: (
                <ProtectedRouteLogin>
                    <SignUp/>
                </ProtectedRouteLogin>
            ),
        },
    ],
    {
        basename: import.meta.env.VITE_BASE_URL,
    }
);

function App() {
    const dispatch = useDispatch<AppDispatch>();
    const getAccount = async () => {
        const access_token: string | null =
            localStorage.getItem("access_token");
        if (access_token && !isTokenExpired(access_token)) {
            const userData = await dispatch(fetchUserDetails());
            if (userData.payload.status === 403) {
                localStorage.removeItem("access_token");
                window.location.href = `${import.meta.env.VITE_BASE_URL}/login`;
            }
        }
    };
    useEffect(() => {
        getAccount();
    }, []);
    return <>{<RouterProvider router={router}/>}</>;
}

export default App;
