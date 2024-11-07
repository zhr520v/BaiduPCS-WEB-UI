import React, { useState, useEffect } from 'react';
import { Table, message, Menu, Modal, Button, Input, Space, Breadcrumb } from 'antd';
import { 
  FolderOutlined, 
  FileOutlined, 
  DownloadOutlined,
  DeleteOutlined,
  FolderAddOutlined,
  CopyOutlined,
  ScissorOutlined
} from '@ant-design/icons';
import * as api from '../services/api';

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, file: null });
  const [loading, setLoading] = useState(false);
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [moveToPath, setMoveToPath] = useState('');
  const [moveModal, setMoveModal] = useState(false);
  const [operation, setOperation] = useState(''); // 'move' or 'copy'

  const fetchFiles = async (path) => {
    try {
      setLoading(true);
      const response = await api.listFiles(path);
      console.log('API Response:', response);
      if (!response || !response.fileCount || !response.files) {
        throw new Error('Invalid response format');
      }
      const fileList = response.files.map(item => ({
        name: item.Filename,
        path: item.Path,
        isdir: item.Isdir,
        size: item.Size,
        ctime: item.Ctime,
        mtime: item.Mtime,
        md5: item.MD5
      }));
      setFiles(fileList);
    } catch (error) {
      console.error('Error fetching files:', error);
      message.error('获取文件列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  const handleFolderClick = (path) => {
    setCurrentPath(path);
  };

  const handleContextMenu = (event, file) => {
    event.preventDefault();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      file
    });
  };

  const handleDownload = async (file) => {
    try {
      await api.downloadFile(file.path);
      message.success('开始下载');
    } catch (error) {
      message.error('下载失败');
    }
  };

  const handleDelete = async (file) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除 ${file.name} 吗？`,
      onOk: async () => {
        try {
          await api.deleteFile(file.path);
          message.success('删除成功');
          fetchFiles(currentPath);
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  const handleCreateFolder = async () => {
    if (!newFolderName) {
      message.error('请输入文件夹名称');
      return;
    }
    try {
      const newPath = `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${newFolderName}`;
      await api.createFolder(newPath);
      message.success('创建成功');
      setNewFolderModal(false);
      setNewFolderName('');
      fetchFiles(currentPath);
    } catch (error) {
      message.error('创建失败');
    }
  };

  const handleMoveOrCopy = async () => {
    if (!moveToPath) {
      message.error('请输入目标路径');
      return;
    }
    try {
      if (operation === 'move') {
        await api.moveFile(selectedFiles.map(f => f.path), moveToPath);
      } else {
        await api.copyFile(selectedFiles.map(f => f.path), moveToPath);
      }
      message.success(`${operation === 'move' ? '移动' : '复制'}成功`);
      setMoveModal(false);
      setMoveToPath('');
      setSelectedFiles([]);
      fetchFiles(currentPath);
    } catch (error) {
      message.error(`${operation === 'move' ? '移动' : '复制'}失败`);
    }
  };

  const columns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div
          onClick={() => record.isdir && handleFolderClick(record.path)}
          onContextMenu={(e) => handleContextMenu(e, record)}
          style={{ cursor: record.isdir ? 'pointer' : 'default' }}
        >
          {record.isdir ? <FolderOutlined /> : <FileOutlined />} {text}
        </div>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size, record) => {
        if (record.isdir) return '-';
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let sizeNum = size;
        let unitIndex = 0;
        while (sizeNum >= 1024 && unitIndex < units.length - 1) {
          sizeNum /= 1024;
          unitIndex++;
        }
        return `${sizeNum.toFixed(2)} ${units[unitIndex]}`;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={() => handleDownload(record)}
          />
          <Button 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record)}
            danger
          />
        </Space>
      ),
    },
  ];

  const pathParts = currentPath.split('/').filter(Boolean);

  return (
    <div style={{ padding: '20px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space>
          <Button 
            icon={<FolderAddOutlined />} 
            onClick={() => setNewFolderModal(true)}
          >
            新建文件夹
          </Button>
          <Button 
            icon={<ScissorOutlined />}
            onClick={() => {
              setOperation('move');
              setMoveModal(true);
            }}
            disabled={selectedFiles.length === 0}
          >
            移动到
          </Button>
          <Button 
            icon={<CopyOutlined />}
            onClick={() => {
              setOperation('copy');
              setMoveModal(true);
            }}
            disabled={selectedFiles.length === 0}
          >
            复制到
          </Button>
        </Space>

        <Breadcrumb>
          <Breadcrumb.Item onClick={() => setCurrentPath('/')} style={{ cursor: 'pointer' }}>
            根目录
          </Breadcrumb.Item>
          {pathParts.map((part, index) => (
            <Breadcrumb.Item 
              key={index}
              onClick={() => setCurrentPath('/' + pathParts.slice(0, index + 1).join('/'))}
              style={{ cursor: 'pointer' }}
            >
              {part}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>

        <Table 
          columns={columns} 
          dataSource={files} 
          rowKey="path"
          loading={loading}
          rowSelection={{
            onChange: (_, selectedRows) => setSelectedFiles(selectedRows)
          }}
        />
      </Space>

      <Modal
        title="新建文件夹"
        open={newFolderModal}
        onOk={handleCreateFolder}
        onCancel={() => {
          setNewFolderModal(false);
          setNewFolderName('');
        }}
      >
        <Input
          placeholder="请输入文件夹名称"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
        />
      </Modal>

      <Modal
        title={`${operation === 'move' ? '移动' : '复制'}到`}
        open={moveModal}
        onOk={handleMoveOrCopy}
        onCancel={() => {
          setMoveModal(false);
          setMoveToPath('');
        }}
      >
        <Input
          placeholder="请输入目标路径"
          value={moveToPath}
          onChange={(e) => setMoveToPath(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default FileList; 