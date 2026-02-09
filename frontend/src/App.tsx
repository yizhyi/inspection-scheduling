import React, { useState } from 'react';
import { Layout, Tabs, theme } from 'antd';
import InspectorManagement from './pages/InspectorManagement';
import FactoryManagement from './pages/FactoryManagement';
import TaskManagement from './pages/TaskManagement';
import ScheduleManagement from './pages/ScheduleManagement';
import './App.css';

const { Header, Content } = Layout;

function App() {
  const { token } = theme.useToken();
  const [activeTab, setActiveTab] = useState('schedule');

  const items = [
    {
      key: 'schedule',
      label: '排班管理',
      children: <ScheduleManagement />,
    },
    {
      key: 'inspectors',
      label: '验货员管理',
      children: <InspectorManagement />,
    },
    {
      key: 'factories',
      label: '工厂管理',
      children: <FactoryManagement />,
    },
    {
      key: 'tasks',
      label: '任务管理',
      children: <TaskManagement />,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', padding: '0 50px' }}>
        <h1 style={{ color: 'white', margin: 0 }}>验货排班系统</h1>
      </Header>
      <Content style={{ padding: '50px' }}>
        <div
          style={{
            background: token.colorBgContainer,
            padding: 24,
            borderRadius: token.borderRadiusLG,
          }}
        >
          <Tabs
            activeKey={activeTab}
            items={items}
            onChange={setActiveTab}
          />
        </div>
      </Content>
    </Layout>
  );
}

export default App;
