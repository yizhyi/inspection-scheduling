import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { factoryApi } from '../services/api';

const FactoryManagement = () => {
  const [factories, setFactories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFactory, setEditingFactory] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchFactories = async () => {
    setLoading(true);
    try {
      const response = await factoryApi.list();
      setFactories(response.data);
    } catch (error) {
      message.error('获取工厂列表失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFactories();
  }, []);

  const handleAdd = () => {
    setEditingFactory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingFactory(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await factoryApi.delete(id);
      message.success('删除成功');
      fetchFactories();
    } catch (error: any) {
      message.error(error.response?.data?.error || '删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingFactory) {
        await factoryApi.update(editingFactory.id, values);
        message.success('更新成功');
      } else {
        await factoryApi.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchFactories();
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const columns = [
    { title: '工厂名称', dataIndex: 'name', key: 'name' },
    { title: '地址', dataIndex: 'address', key: 'address' },
    { title: '联系方式', dataIndex: 'contact', key: 'contact' },
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
          添加工厂
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={factories}
        rowKey="id"
        loading={loading}
      />
      <Modal
        title={editingFactory ? '编辑工厂' : '添加工厂'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="工厂名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="地址" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="latitude" label="纬度" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="longitude" label="经度" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="contact" label="联系方式">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FactoryManagement;
