import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [bduss, setBduss] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // 这里需要配合后端API验证BDUSS
      const response = await axios.post('/api/login', { bduss });
      if (response.data.success) {
        localStorage.setItem('bduss', bduss);
        message.success('登录成功');
        navigate('/files');
      }
    } catch (error) {
      message.error('登录失败，请检查BDUSS是否有效');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
      <h2>百度网盘登录</h2>
      <Input.TextArea
        value={bduss}
        onChange={(e) => setBduss(e.target.value)}
        placeholder="请输入BDUSS"
        style={{ marginBottom: '20px' }}
      />
      <Button type="primary" onClick={handleLogin} block>
        登录
      </Button>
    </div>
  );
};

export default Login; 