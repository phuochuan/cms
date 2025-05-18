import {DatePicker, Form, Input, Modal, Select} from 'antd';
import {useEffect} from 'react';
import dayjs from 'dayjs';
import {Account} from "../screens/AccountManagementScreen.tsx";

const {Option} = Select;

export default function AccountFormModal({
                                             open,
                                             initialValues,
                                             onCancel,
                                             onFinish
                                         }: {
    open: boolean;
    initialValues?: Partial<Account>;
    onCancel: () => void;
    onFinish: (values: Account) => void;
}) {
    const [form] = Form.useForm();

    // Nạp sẵn dữ liệu khi edit
    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
                dateOfBirth: initialValues.dateOfBirth ? dayjs(initialValues.dateOfBirth) : undefined,
            });
        } else {
            form.resetFields();
        }
    }, [initialValues, form, open]);

    return (
        <Modal
            open={open}
            title={initialValues ? "Edit Account" : "Add Account"}
            onCancel={onCancel}
            onOk={() => {
                form.submit();
            }}
            okText="Save"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={(values) => {
                    onFinish({
                        ...values,
                        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : undefined,
                    });
                }}
            >
                {/* Username */}
                <Form.Item label="Username" name="username" rules={[{required: true, message: 'Username is required'}]}>
                    <Input/>
                </Form.Item>

                {/* Password */}
                <Form.Item label="Password" name="password" rules={[{required: true, message: 'Password is required'}]}>
                    <Input.Password/>
                </Form.Item>

                {/* Full Name */}
                <Form.Item label="Full Name" name="fullName">
                    <Input/>
                </Form.Item>

                {/* Email */}
                <Form.Item label="Email" name="email"
                           rules={[{required: true, type: 'email', message: 'Valid email required'}]}>
                    <Input/>
                </Form.Item>

                {/* Telephone */}
                <Form.Item label="Telephone" name="telephone">
                    <Input/>
                </Form.Item>

                {/* Date of Birth */}
                <Form.Item label="Date of Birth" name="dateOfBirth">
                    <DatePicker style={{width: '100%'}}/>
                </Form.Item>

                {/* Role */}
                <Form.Item label="Role" name="role" rules={[{required: true, message: 'Role is required'}]}>
                    <Select>
                        <Option value="USER">USER</Option>
                        <Option value="ADMIN">ADMIN</Option>
                        <Option value="ACCOUNTANT">ACCOUNTANT</Option>
                    </Select>
                </Form.Item>

                {/* Gender */}
                <Form.Item label="Gender" name="gender" rules={[{required: true, message: 'Gender is required'}]}>
                    <Select>
                        <Option value="MALE">MALE</Option>
                        <Option value="FEMALE">FEMALE</Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
}
