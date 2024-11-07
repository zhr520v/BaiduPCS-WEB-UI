import axios from 'axios';

const api = axios.create();

export const listFiles = async (path) => {
  const formData = new FormData();
  formData.append('pcspath', path);
  
  const response = await api.post('/api/ls', formData);
  return response.data;
};

export const downloadFile = async (paths) => {
  const response = await api.post('/api/download', {
    paths: Array.isArray(paths) ? paths : [paths],
    save: true
  });
  return response.data;
};

export const deleteFile = async (paths) => {
  const response = await api.post('/api/rm', {
    target_paths: Array.isArray(paths) ? paths : [paths]
  });
  return response.data;
};

export const createFolder = async (path) => {
  const response = await api.post('/api/mkdir', {
    target_path: path
  });
  return response.data;
};

export const moveFile = async (fromPaths, toPath) => {
  const response = await api.post('/api/mv', {
    from_paths: Array.isArray(fromPaths) ? fromPaths : [fromPaths],
    to_path: toPath
  });
  return response.data;
};

export const copyFile = async (fromPaths, toPath) => {
  const response = await api.post('/api/cp', {
    from_paths: Array.isArray(fromPaths) ? fromPaths : [fromPaths],
    to_path: toPath
  });
  return response.data;
}; 