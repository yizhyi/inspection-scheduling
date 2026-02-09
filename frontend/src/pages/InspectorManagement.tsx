import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { inspectorApi } from '../services/api';

const InspectorManagement = () => {
  const [inspectors, setInspectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingInspector, setEditingInspector] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchInspectors = async () => {
    setLoading(true);
    try {
      const response = await inspectorApi.list();
      setInspectors(response.data);
    } catch (error) {
      message.error('获取验货员列表失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInspectors();
  }, []);

  const handleAdd = () => {
    setEditingInspector(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingInspector(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await inspectorApi.delete(id);
      message.success('删除成功');
      fetchInspectors();
    } catch (error: any) {
      message.error(error.response?.data?.error || '删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingInspector) {
        await inspectorApi.update(editingInspector.id, values);
        message.success('更新成功');
      } else {
        await inspectorApi.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchInspectors();
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: 'base地址', dataIndex: 'base_address', key: 'base_address' },
    { title: '联系方式', dataIndex: 'contact', key: 'contact' },
    { title: '最大周工作时长(小时)', dataIndex: 'max_work_hours_per_week', key: 'max_work_hours_per_week' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm
            title="确认删除？"
            onConfirm={() => handleDelete(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加验货员
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={inspectors}
        rowKey="id"
        loading={loading}
      />
      <Modal
        title={editingInspector ? '编辑验货员' : '添加验货员'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="baseAddress" label="base地址" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="baseLatitude" label="纬度" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="baseLongitude" label="经度" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="contact" label="联系方式">
            <Input />
          </Form.Item>
          <Form.Item name="maxWorkHoursPerWeek" label="最大周工作时长(小时)" initialValue={40}>
            <InputNumber style={{ width: '100%' }} min={1} max={168} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InspectorManagement;
