import React, {useState} from 'react';
import {Button, Layout, Menu, MenuProps, theme, Typography} from 'antd';
import {
    BookOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ReconciliationOutlined,
    UserOutlined,
    VerifiedOutlined
} from '@ant-design/icons';

import 'tailwindcss/tailwind.css';
import {useNavigate} from "react-router-dom";

// Định nghĩa kiểu cho props
interface SideBarLayoutProps {
    children: React.ReactNode;
}

const {Sider, Content} = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
    {key: '1', icon: <VerifiedOutlined/>, label: 'Registrations'},
    {
        key: '2', icon: <BookOutlined/>, label: 'Courses', children: [
            {label: 'Outside Courses', key: '2.1'},
            {label: 'Inside Courses', key: '2.2'},
        ],
    },
    {key: '3', icon: <UserOutlined/>, label: 'Account'},
    {key: '4', icon: <ReconciliationOutlined/>, label: 'Statistics'},
];

export const SideBarLayout: React.FC<SideBarLayoutProps> = ({children}) => {
    const navigate = useNavigate();

    const [collapsed, setCollapsed] = useState(false);

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const {
        token: {colorBgContainer},
    } = theme.useToken();

    const handleMenuClick = (e: { key: string; }) => {
        if (e.key === '1') {
            navigate('/admin')
        } else if (e.key === '2') {
            navigate('/admin/courses');
        } else if (
            e.key === '3'
        ) {
            navigate('/admin/accounts');
        } else if (
            e.key === '4'
        ) {
            navigate('/admin/statistics');

        }else if(e.key==='2.1'){
            navigate('/admin/outside-courses');
        }else if(e.key==='2.2'){
            navigate('/admin/inside-courses');
        }
    };


    return (
        <Layout>
            <Sider
                width={!collapsed ? 256 : 100}
                style={{background: colorBgContainer}}
                className="items-center justify-between"
            >
                <div className="flex items-center justify-between p-4">
                    {!collapsed && (
                        <Typography.Title level={3} className="m-0">
                            Administrator
                        </Typography.Title>
                    )}
                    <Button
                        onClick={toggleCollapsed}
                        style={{
                            marginBottom: 16,
                            marginLeft: collapsed ? 10 : 0
                        }}
                    >
                        {collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                    </Button>
                </div>

                <Menu
                    defaultSelectedKeys={['1']}
                    defaultOpenKeys={['sub1']}
                    mode="inline"
                    inlineCollapsed={collapsed}
                    items={items}
                    onClick={handleMenuClick}
                />
            </Sider>

            <Layout>
                <Content
                    className={"w-full justify-center content-center"}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>


    );
};
