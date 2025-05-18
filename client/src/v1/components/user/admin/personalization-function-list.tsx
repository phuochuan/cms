import React from "react";

import functionList from "../../../utils/functionList.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store/store.ts";
import { useNavigate } from "react-router-dom";

import functionMapping from "../../../utils/functionMapping.ts";
import {refreshAdmin} from "../../../redux/slice/admin-registration.slice.ts";
import {refreshAccountant} from "../../../redux/slice/accountant-registration.slice.ts";

const PersonalizationFunctionList = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const userRole = useSelector((state: RootState) => state.user.user.role);

    const handleFunctionMapping = (e: React.MouseEvent, itemAlt: string) => {
        functionMapping(e, navigate, dispatch, itemAlt, userRole);
    };

    const handleGap = (alt: string) => {
        return alt == "sign_out" ? "[5px]" : "2.5";
    };

    const handleRefresh = (userRole: string) => {
        if (userRole === 'ADMIN') {
            dispatch(refreshAdmin());
        } else {
            dispatch(refreshAccountant());
        }
    };

    return (
        <div
            className='function_list flex-col pl-3 text-lg'
            style={{ justifyItems: "space-between", gap: "100px" }}
        >
            {functionList.map((item, index) =>
                index === 1 && userRole === "ACCOUNTANT" ? null : (
                    <div
                        className={`
                function flex align-center justify-start pb-2 cursor-pointer
                gap-${handleGap(item.alt)}
            `}
                        key={item.key}
                        onClick={(e) => {
                            handleFunctionMapping(e, item.alt);
                            handleRefresh(userRole);
                        }}
                    >
                        <div className='icon flex items-center'>
                            <img
                                className='h-[70%]'
                                src={item.imgSrc}
                                alt={item.alt}
                            />
                        </div>
                        <span>{item.message}</span>
                    </div>
                )
            )}
        </div>
    );
};

export default PersonalizationFunctionList;
