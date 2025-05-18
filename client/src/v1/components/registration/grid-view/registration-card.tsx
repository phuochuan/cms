import { RegistrationType } from "../../../../App.tsx";
import { Skeleton } from "../../ui/skeleton.tsx";

import { useRegistrationModal } from "../../../hooks/use-registration-modal.ts";
import { handleAvatarUrl } from "../../../utils/handleAvatarUrl.ts";
import handleThumbnailUrl from "../../../utils/handleThumbnailUrl.ts";
import {
    convertStatus,
    convertPeriod,
} from "../../../utils/registration-utils/registration-overview-converters.ts";

type PropsType = {
    registration: RegistrationType;
};

function RegistrationCardComponent({ registration }: PropsType) {
    const { open } = useRegistrationModal();
    const handlePopup = () => {
        open(true, +registration.id!);
    };

    const courseThumbnailUrl = handleThumbnailUrl(
        registration.courseThumbnailUrl
    );

    const displayedFullname: string = registration.userFullname
        ? registration.userFullname
        : "Anonymous";

    const status: string = convertStatus(
        registration.status ? registration.status : ""
    );

    const period: string = convertPeriod(
        registration.startDate,
        registration.endDate
    );

    const userAvatar: string = handleAvatarUrl(registration.userAvatarUrl);

    return (
        <>
            <div
                className='w-full overflow-hidden text-sm rounded-xl leading-normal transition-shadow bg-white border border-gray-200 border-solid shadow cursor-pointer duration-250 hover:shadow-lg grow'
                onClick={handlePopup}
            >
                <div className='course-information rounded-3xl'>
                    <img
                        className='object-cover w-full h-52 rounded-xl'
                        src={courseThumbnailUrl}
                        alt={registration.courseName}
                    />
                </div>
                <div className='informations px-3 py-3'>
                    <div className='flex flex-col gap-2 text-left'>
                        <h3 className='text-sm font-medium text-left line-clamp-2 h-11 overflow-ellipsis'>
                            {registration.courseName}
                        </h3>
                    </div>
                    <div className='user_information flex justify-between'>
                        <div className='flex gap-1 align-center'>
                            <div className='my-auto'>
                                <img
                                    className='object-cover w-10 h-10 rounded-full border-2 border-purple'
                                    src={userAvatar}
                                    alt='user-avatar'
                                />
                            </div>
                            <div className='username flex flex-col'>
                                <span
                                    className={`text-[14px] text-left truncate pt-[2px]
                                    ${
                                        registration.status ===
                                        "DOCUMENT_DECLINED"
                                            ? "max-w-[40px]"
                                            : "max-w-[70px]"
                                    }
                                `}
                                >
                                    {displayedFullname}
                                </span>
                                <span className='text-xs'>User</span>
                            </div>
                        </div>
                        <div
                            className={`status my-auto text-[11px] font-normal 
                                        ${
                                            registration.status ===
                                            "DOCUMENT_DECLINED"
                                                ? "py-0.5 px-1.5 leading-6"
                                                : "py-1.5 px-4"
                                        }
                                        rounded-lg min-h-[30px] min-w-[90px] font-semibold text-center ${registration.status?.toLowerCase()}
                            `}
                        >
                            {status.toUpperCase()}
                        </div>
                    </div>
                    <div className='platform mt-3 text-xs'>
                        {registration.coursePlatform}
                    </div>
                    <div className='period text-xs'>{period}</div>
                </div>
            </div>
        </>
    );
}

export default RegistrationCardComponent;

const SkeletonLoader = () => {
    return (
        <div className='w-full overflow-hidden text-sm leading-normal transition-shadow bg-white rounded-md shadow cursor-pointer duration-250'>
            <div>
                <Skeleton className='object-cover w-full bg-gray-300 h-52 animate-pulse'></Skeleton>
                <div className='flex flex-col gap-2 px-2 pt-2 text-left'>
                    <Skeleton className='h-6 bg-gray-300 animate-pulse'></Skeleton>
                    <Skeleton className='w-1/2 h-4 bg-gray-300 animate-pulse'></Skeleton>
                    <div className='flex items-center gap-2'>
                        <Skeleton className='object-cover bg-gray-300 rounded-full w-11 h-11 animate-pulse'></Skeleton>
                        <div>
                            <Skeleton className='w-24 h-4 bg-gray-300 animate-pulse'></Skeleton>
                            <Skeleton className='w-16 h-3 mt-2 bg-gray-300 animate-pulse'></Skeleton>
                        </div>
                    </div>

                    <div className='flex justify-between p-2 border-t-2'>
                        <div className='flex items-center gap-1'>
                            <Skeleton className='w-5 h-5 bg-gray-300 animate-pulse'></Skeleton>
                            <Skeleton className='w-10 h-4 bg-gray-300 animate-pulse'></Skeleton>
                        </div>
                        <div className='flex items-center gap-1'>
                            <Skeleton className='w-5 h-5 bg-gray-300 animate-pulse'></Skeleton>
                            <Skeleton className='w-10 h-4 bg-gray-300 animate-pulse'></Skeleton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { SkeletonLoader };
