import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, DatePicker, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { taskApi, factoryApi } from '../services/api';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [factories, setFactories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskApi.list();
      setTasks(response.data);
    } catch (error) {
      message.error('获取任务列表失败');
    }
    setLoading(false);
  };

  const fetchFactories = async () => {
    try {
      const response = await factoryApi.list();
      setFactories(response.data);
    } catch (error) {
      message.error('获取工厂列表失败');
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchFactories();
  }, []);

  const handleAdd = () => {
    setEditingTask(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingTask(record);
    form.setFieldsValue({
      ...record,
      scheduledDate: record.scheduled_date ? dayjs(record.scheduled_date) : null,
      deadline: record.deadline ? dayjs(record.deadline) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await taskApi.delete(id);
      message.success('删除成功');
      fetchTasks();
    } catch (error: any) {
      message.error(error.response?.data?.error || '删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        scheduledDate: values.scheduledDate ? values.scheduledDate.format('YYYY-MM-DD') : null,
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : null,
      };
      
      if (editingTask) {
        await taskApi.update(editingTask.id, data);
        message.success('更新成功');
      } else {
        await taskApi.create(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchTasks();
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const columns = [
    { title: '任务类型', dataIndex: 'task_type', key: 'task_type' },
    { title: '工厂', dataIndex: 'factory_name', key: 'factory_name' },
    { title: '计划日期', dataIndex: 'scheduled_date', key: 'scheduled_date' },
    { title: '预计时长(小时)', dataIndex: 'estimated_duration', key: 'estimated_duration' },
    { title: '截止日期', dataIndex: 'deadline', key: 'deadline' },
    { title: '优先级', dataIndex: 'priority', key: 'priority' },
    {
      title: '状态',
      key: 'status',
      render: (_: any, record: any) => {
        const statusMap: any = { pending: '待分配', assigned: '已分配', completed: '已完成' };
        return statusMap[record.status] || record.status;
      },
    },
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
          添加任务
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        loading={loading}
      />
      <Modal
        title={editingTask ? '编辑任务' : '添加任务'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="factoryId" label="工厂" rules={[{ required: true }]}>
            <Select>
              {factories.map((factory: any) => (
                <Select.Option key={factory.id} value={factory.id}>
                  {factory.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="taskType" label="任务类型" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="scheduledDate" label="计划日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="estimatedDuration" label="预计时长(小时)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0.5} step={0.5} />
          </Form.Item>
          <Form.Item name="deadline" label="截止日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="priority" label="优先级" initialValue={0}>
            <InputNumber style={{ width: '100%' }} min={0} max={10} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskManagement;
