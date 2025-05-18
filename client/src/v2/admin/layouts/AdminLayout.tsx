import {useSelector} from "react-redux";
import {RootState} from "../../../v1/redux/store/store.ts";
import HeaderHomepage from "../../../v1/components/header.tsx";
import {RegistrationModal} from "../../../v1/components/modal/registration-modal.tsx";
import {Outlet} from "react-router-dom";
import NotPermitted from "../../../v1/screens/error/not-permitted.tsx";
import {SideBarLayout} from "./SideBarLayout.tsx";

export const LayoutAdmin = () => {
    const isAdminRoute = window.location.pathname.startsWith(
        `${import.meta.env.VITE_BASE_URL}/admin`
    );
    const user = useSelector((state: RootState) => state.user.user);
    const userRole = user.role;
    return (
        <>
            <div className='app-container '>
                {isAdminRoute && userRole === "ADMIN" && (
                    <>
                        <HeaderHomepage/>
                        <RegistrationModal/>
                        <SideBarLayout children={<Outlet/>}/>

                    </>
                )}
                {isAdminRoute &&
                    (userRole === "USER" || userRole === "ACCOUNTANT") && (
                        <>
                            <NotPermitted/>
                        </>
                    )}
            </div>
        </>
    );
};
