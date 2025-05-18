import React, { useEffect, useState } from "react";
import Card_LeaderBoard from "../../components/user/mgmies/card-leader-board.tsx";
import { Table, Select, Empty } from "antd";
import type { TableProps } from "antd";
import "../../assets/css/leader-board.css";

import { handleAvatarUrl } from "../../utils/handleAvatarUrl.ts";
import { getAllYearsLeadBoard, getDataLeaderBoard } from "../../service/score.ts";

interface DataType {
    key: string;
    rank: number;
    userInfor: {
        avatarUrl: string;
        username: string;
        fullname: string;
        email: string;
    };
    time: number;
    score: number;
    mine: boolean;
}
interface IDataResponse {
    avatarUrl: string;
    email: string;
    fullName: string;
    learningTime: number;
    mine: boolean;
    score: number;
    userId: number;
    username: string;
}

interface IYear {
    value: string;
    label: string;
}

const LeaderBoard: React.FC = () => {
    const [valueYear, setValueYear] = useState<string>("2024");
    const [dataCardLeaderBoard, setDataCardLeaderBoard] = useState<DataType[]>(
        []
    );
    const [dataLeaderBoardTable, setDataLeaderBoardTable] = useState<
        DataType[]
    >([]);
    const [dataYears, setDataYears] = useState<IYear[]>([]);

    const columns: TableProps<DataType>["columns"] = [
        {
            title: "Rank",
            dataIndex: "rank",
            key: "rank",
            width: 100,
            render: (text) => <p className='font-medium'>{text}</p>,
        },
        {
            title: "Fullname",
            dataIndex: "userInfor",
            key: "userInfor",
            render: (data: {
                avatarUrl: string;
                username: string;
                fullname: string | null;
                mine: boolean;
            }) => {
                const displayName = data.fullname ? data.fullname : "Anonymous";
                const isCurrentUser = data.mine;
                return (
                    <div className='flex items-center gap-2.5'>
                        <div className='relative w-8 h-8 rounded-full'>
                            <img
                                src={handleAvatarUrl(data.avatarUrl)}
                                alt=''
                                className='absolute object-cover object-center w-full h-full rounded-full'
                            />
                        </div>
                        <div className='font-normal'>
                            {isCurrentUser
                                ? `${displayName} (You)`
                                : displayName}
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Time",
            dataIndex: "time",
            key: "time",
            render: (text) => <p className='text-[16px]'>{text}</p>,
        },
        {
            title: "Score",
            dataIndex: "score",
            key: "score",
            render: (text) => <p className='text-[16px]'>{text}</p>,
        },
    ];

    const handleChange = (value: string) => {
        setValueYear(value);
    };

    const fetchDataLeaderBoard = async (valueYear: string) => {
        const result = await getDataLeaderBoard(valueYear);
        if (result && result.leaderboardUserDTOs) {
            const dataTmp: DataType[] = result.leaderboardUserDTOs.map(
                (item: IDataResponse, index: number) => ({
                    key: index.toString(),
                    rank: index + 1,
                    userInfor: {
                        avatarUrl: item.avatarUrl,
                        username: item.username,
                        email: item.email,
                        fullname: item.fullName,
                        mine: item.mine,
                    },
                    time: item.learningTime,
                    score: item.score,
                    mine: item.mine,
                })
            );

            let reorderedData: DataType[] = [];
            if (dataTmp.length >= 3) {
                reorderedData = [dataTmp[1], dataTmp[0], dataTmp[2]];
            } else if (dataTmp.length === 2) {
                reorderedData = [dataTmp[1], dataTmp[0]];
            } else if (dataTmp.length === 1) {
                reorderedData = [dataTmp[0]];
            }

            setDataCardLeaderBoard(reorderedData);

            if (dataTmp.length > 3) {
                setDataLeaderBoardTable(dataTmp.slice(3));
            } else {
                setDataLeaderBoardTable([]);
            }
        }
    };

    const fetchAllYears = async () => {
        const result = await getAllYearsLeadBoard();
        if (result && result.data) {
            const dataTmp: IYear[] = result.data.map((item: string) => ({
                value: item,
                label: item,
            }));
            setDataYears(dataTmp);
        }
    };

    const rowClassName = (record: DataType) => {
        return record.mine ? "colorText" : "";
    };

    useEffect(() => {
        fetchDataLeaderBoard(valueYear);
    }, [valueYear]);

    useEffect(() => {
        fetchAllYears();
    }, []);

    return (
        <div className='pb-12 bg-[#f9fafb] '>
            <div className='px-5 pt-6 mx-auto max-w-screen-2xl'>
                <div className='flex items-center justify-between px-2.5'>
                    <span className='text-4xl font-semibold'>Ranking</span>
                    <div className='flex items-center justify-center gap-6'>
                        <div className='text-lg text-gray-600'>Year</div>
                        <Select
                            defaultValue={valueYear}
                            style={{ width: 120 }}
                            onChange={handleChange}
                            options={dataYears}
                        />
                    </div>
                </div>
                {dataCardLeaderBoard &&
                dataCardLeaderBoard.length === 0 &&
                dataLeaderBoardTable &&
                dataLeaderBoardTable.length === 0 ? (
                    <Empty />
                ) : (
                    <>
                        <div className='flex items-end justify-center gap-8 mt-10'>
                            {dataCardLeaderBoard &&
                                dataCardLeaderBoard.length > 0 &&
                                dataCardLeaderBoard.map(
                                    (item: DataType, index: number) => (
                                        <Card_LeaderBoard
                                            key={index}
                                            fullname={item.userInfor.fullname}
                                            email={item.userInfor.email}
                                            ranking={item.rank}
                                            avatarUrl={item.userInfor.avatarUrl}
                                            score={item.score}
                                            learningTime={item.time}
                                        />
                                    )
                                )}
                            {dataCardLeaderBoard &&
                                dataCardLeaderBoard.length === 2 && (
                                    <div className='card w-1/4 rounded-lg p-4 flex flex-col justify-between gap-5 pb-5'></div>
                                )}
                        </div>
                        <div className='mt-12'>
                            <Table
                                columns={columns}
                                dataSource={dataLeaderBoardTable}
                                pagination={false}
                                rowClassName={rowClassName}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LeaderBoard;
