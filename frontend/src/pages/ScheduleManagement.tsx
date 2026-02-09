import React, { useState, useEffect } from 'react';
import { Card, Button, Form, DatePicker, Select, Slider, message, Descriptions, Table, Modal } from 'antd';
import dayjs from 'dayjs';
import { scheduleApi, statsApi } from '../services/api';
import MapView from '../components/MapView';

const ScheduleManagement = () => {
  const [loading, setLoading] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchStats = async () => {
    try {
      const response = await statsApi.getCostStats();
      setStats(response.data);
    } catch (error) {
      console.error('获取统计数据失败', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleGenerateSchedule = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const config = {
        weightTime: values.weightTime,
        weightCost: values.weightCost,
        weightWorkload: values.weightWorkload,
        transportMode: values.transportMode,
      };
      
      const scheduleData = {
        weekStart: values.weekStart.format('YYYY-MM-DD'),
        weekEnd: values.weekStart.add(6, 'day').format('YYYY-MM-DD'),
        config,
      };
      
      const response = await scheduleApi.generate(scheduleData);
      setCurrentSchedule(response.data);
      message.success('排班生成成功');
      fetchStats();
    } catch (error: any) {
      message.error(error.response?.data?.error || '生成排班失败');
    }
    setLoading(false);
  };

  const handleConfirmSchedule = async () => {
    if (!currentSchedule) return;
    
    try {
      await scheduleApi.update(currentSchedule.id, { status: 'confirmed' });
      message.success('排班已确认');
      setCurrentSchedule({ ...currentSchedule, status: 'confirmed' });
      fetchStats();
    } catch (error: any) {
      message.error(error.response?.data?.error || '确认失败');
    }
  };

  const handleShowMap = () => {
    setMapModalVisible(true);
  };

  const columns = [
    { title: '任务类型', dataIndex: 'task_type', key: 'task_type' },
    { title: '工厂', dataIndex: 'factory_name', key: 'factory_name' },
    { title: '验货员', dataIndex: 'inspector_name', key: 'inspector_name' },
    { title: '验货日期', dataIndex: 'scheduled_date', key: 'scheduled_date' },
    { title: '工厂地址', dataIndex: 'address', key: 'address' },
    { title: '预计到达时间', dataIndex: 'estimated_arrival_time', key: 'estimated_arrival_time' },
    { title: '预计离开时间', dataIndex: 'estimated_departure_time', key: 'estimated_departure_time' },
    { title: '交通时间(小时)', dataIndex: 'travel_time', key: 'travel_time' },
  ];

  return (
    <div>
      <Card title="排班配置" style={{ marginBottom: 16 }}>
        <Form layout="vertical" form={form}>
          <Form.Item
            name="weekStart"
            label="选择周"
            rules={[{ required: true }]}
            initialValue={dayjs().startOf('week')}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item name="transportMode" label="交通方式" initialValue="car">
            <Select>
              <Select.Option value="car">自驾</Select.Option>
              <Select.Option value="train">高铁</Select.Option>
              <Select.Option value="public_transport">公共交通</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="时间权重" name="weightTime" initialValue={1}>
            <Slider min={0} max={10} step={0.1} />
          </Form.Item>
          
          <Form.Item label="成本权重" name="weightCost" initialValue={1}>
            <Slider min={0} max={10} step={0.1} />
          </Form.Item>
          
          <Form.Item label="工作负荷权重" name="weightWorkload" initialValue={1}>
            <Slider min={0} max={10} step={0.1} />
          </Form.Item>
          
          <Button type="primary" onClick={handleGenerateSchedule} loading={loading}>
            生成排班
          </Button>
        </Form>
      </Card>

      {currentSchedule && (
        <Card title="排班结果" style={{ marginBottom: 16 }}>
          <Descriptions column={2}>
            <Descriptions.Item label="总成本">{currentSchedule.total_cost?.toFixed(2)} 元</Descriptions.Item>
            <Descriptions.Item label="总交通时间">{currentSchedule.total_travel_time?.toFixed(2)} 小时</Descriptions.Item>
            <Descriptions.Item label="工作负荷方差">{currentSchedule.workload_variance?.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="状态">
              {currentSchedule.status === 'draft' ? '草稿' : currentSchedule.status === 'confirmed' ? '已确认' : '已完成'}
            </Descriptions.Item>
          </Descriptions>
          
          <div style={{ marginTop: 16 }}>
            <Button onClick={handleShowMap}>查看地图</Button>
            {currentSchedule.status === 'draft' && (
              <Button type="primary" onClick={handleConfirmSchedule} style={{ marginLeft: 8 }}>
                确认排班
              </Button>
            )}
          </div>
          
          <Table
            columns={columns}
            dataSource={currentSchedule.assignments || []}
            rowKey="id"
            style={{ marginTop: 16 }}
          />
        </Card>
      )}

      {stats && stats.inspectorWorkload && (
        <Card title="验货员工作负荷">
          <Table
            columns={[
              { title: '验货员', dataIndex: 'name', key: 'name' },
              { title: '任务数', dataIndex: 'task_count', key: 'task_count' },
              { title: '总工作时长(小时)', dataIndex: 'total_hours', key: 'total_hours' },
            ]}
            dataSource={stats.inspectorWorkload}
            rowKey="id"
          />
        </Card>
      )}

      <Modal
        title="排班地图"
        open={mapModalVisible}
        onCancel={() => setMapModalVisible(false)}
        footer={null}
        width={1000}
      >
        {currentSchedule && (
          <MapView schedule={currentSchedule} />
        )}
      </Modal>
    </div>
  );
};

export default ScheduleManagement;
