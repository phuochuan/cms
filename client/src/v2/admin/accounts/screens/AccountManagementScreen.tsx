import {useEffect, useState} from "react";
import instance from "../../../../v1/utils/customizeAxios.ts";
import {Avatar, Popconfirm, Space, Table, Tag} from 'antd';
import {Input} from 'antd';
import AccountFormModal from "../components/AccountForm.tsx";
import {toast} from "sonner";

const {Search} = Input;
const {Column} = Table;

export interface Account {
    id: number;
    username: string;
    password: string;
    fullName: string | null;
    email: string;
    telephone: string | null;
    avatarUrl: string;
    dateOfBirth: string;
    role: 'USER' | 'ADMIN' | 'ACCOUNTANT';
    gender: 'MALE' | 'FEMALE' | 'OTHER';
}

export function AccountManagementScreen() {
    const [accounts, setAccounts] = useState<Account[]>([]);

    useEffect(() => {
        const fetchAccounts = async () => {
            const response = await instance.get(`/v2/accounts`);

            setAccounts(response.data);
        }
        fetchAccounts()
    }, []);

    const [searchKey, setSearchKey] = useState('');

    const showAccounts = () => {
        return accounts.filter(account => account.fullName?.toUpperCase().includes(searchKey.toUpperCase()) ||
            account.username?.toUpperCase().includes(searchKey.toUpperCase()) ||
            account.email?.toUpperCase().includes(searchKey.toUpperCase()) ||
            account.role?.toUpperCase().includes(searchKey.toUpperCase()) ||
            account.gender?.toUpperCase().includes(searchKey.toUpperCase()) ||
            account.dateOfBirth?.toUpperCase().includes(searchKey.toUpperCase()) ||
            account.telephone?.toUpperCase().includes(searchKey.toUpperCase()))
    }


    const [modalOpen, setModalOpen] = useState(false);

    const [editingAccount, setEditingAccount] = useState<Partial<Account> | undefined>(undefined);

    const onSave = async (account: Account) => {

        account = {...editingAccount, ...account}

        if (!account.id) {
            if (accounts.map(acc => acc.username.toUpperCase()).includes(account.username.toUpperCase().trim())
                || accounts.map(acc => acc.email.toUpperCase()).includes(account.email.toUpperCase().trim())) {
                toast.error("Failed to create new account", {
                    style: {
                        color: "red",
                    },
                    description: "Please check username or email again",
                });

                return;
            } else {
                await instance.post(`/v2/accounts`, account);
            }
        } else {
            await instance.put(`/v2/accounts`, account);
        }

        const response = await instance.get(`/v2/accounts`);

        setAccounts(response.data);

        setModalOpen(false);

        toast.success("Create a new account successfully", {
            description: "",
            style: {
                color: "green",
                fontWeight: "bold",
                textAlign: "center",
            },
        });

    }

    const handleEdit = (account: Account) => {
        setEditingAccount(account);

        console.log('account ', account)

        setModalOpen(true);
    }
    const handleDelete = async (accountId: number) => {
        await instance.delete(`/v2/accounts/${accountId}`);

        const response = await instance.get(`/v2/accounts`);

        setAccounts(response.data);
    }

    const handleAddAccount = () => {
        setModalOpen(true)

        setEditingAccount({});
    };

    return (
        <div className={"p-10 gap-2.5 h-full"}>
            <AccountFormModal
                open={modalOpen}
                initialValues={editingAccount}
                onCancel={() => setModalOpen(false)}
                onFinish={onSave}
            />

            <div className="flex-col justify-between items-center mb-5 ">
                <button
                    onClick={handleAddAccount} // Hàm này bạn tự định nghĩa
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded h-10"
                >
                    Add Account
                </button>

                <Search
                    placeholder="Search username, email, telephone, fullname, ...."
                    enterButton
                    onSearch={(value) => setSearchKey(value.trim())}
                    allowClear
                    className="h-10 pt-2"
                />
            </div>


            <div>
                <Table<Account> dataSource={showAccounts()} rowKey="id" pagination={{pageSize: 10}}>

                    <Column title="Avatar" key="avatar"
                            render={(_, record: Account) => (
                                <Avatar src={record.avatarUrl}/>
                            )}
                    />

                    <Column title="Username" dataIndex="username" key="username"/>

                    <Column title="Full Name" dataIndex="fullName" key="fullName"/>

                    <Column title="Email" dataIndex="email" key="email"/>

                    <Column title="Telephone" dataIndex="telephone" key="telephone"
                            render={(telephone) => telephone || 'N/A'}
                    />

                    <Column title="Date of Birth" dataIndex="dateOfBirth" key="dateOfBirth"/>

                    <Column title="Role" key="role"
                            render={(_, record: Account) => (
                                <Tag color={record.role === 'ADMIN' ? 'red' : 'blue'}>
                                    {record.role}
                                </Tag>
                            )}
                    />

                    <Column title="Gender" key="gender"
                            render={(_, record: Account) => {
                                const color = record.gender === 'MALE' ? 'geekblue' :
                                    record.gender === 'FEMALE' ? 'pink' : 'green';
                                return <Tag color={color}>{record.gender}</Tag>;
                            }}
                    />

                    <Column
                        title="Action"
                        key="action"
                        render={(_, record: Account) => (
                            <Space size="middle">
                                <a onClick={() => handleEdit(record)}>Edit</a>
                                <Popconfirm
                                    title="Are you sure you want to delete this account?"
                                    onConfirm={() => handleDelete(record.id)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <a>Delete</a>
                                </Popconfirm>
                            </Space>

                        )}
                    />
                </Table>

            </div>
        </div>
    )
}
