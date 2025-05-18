import React from "react";
import { Button, Result } from "antd";
import "../../assets/css/not-permitted.css";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../redux/store/store.ts";
import { useSelector } from "react-redux";
const NotFound: React.FC = () => {
    const navigate = useNavigate();
    const userRole = useSelector((state: RootState) => state.user.user.role);
    return (
        <Result
            status='404'
            title='404'
            subTitle='Sorry, the page you visited does not exist.'
            extra={
                <Button
                    type='primary'
                    onClick={() => {
                        if (userRole === "USER") {
                            navigate("/");
                        } else if (userRole === "ADMIN") {
                            navigate("/admin");
                        } else if (userRole === "ACCOUNTANT") {
                            navigate("/accountant");
                        }
                    }}
                    style={{ backgroundColor: "#861fa2" }}
                >
                    Back Home
                </Button>
            }
            className='custom-result'
        />
    );
};
export default NotFound;
