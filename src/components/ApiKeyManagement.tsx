import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Tab,
  Tabs,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { format} from 'date-fns';
import { getCurrentUser} from '../utils/auth';
import {
  getAllApiKeys,
  createApiKey,
  deleteApiKey,
  regenerateApiKey
} from '../utils/apikey';
import { ApiKey } from '../types/apikey';

const ApiKeyManagement: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openRegenerateDialog, setOpenRegenerateDialog] = useState(false);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({open: false, message: '', severity: 'success'});
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // 加载API密钥列表
  const loadApiKeys = async () => {
    setLoading(true);
    setError(null);
    try {
      const keys = await getAllApiKeys();
      setApiKeys(keys);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载API密钥失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApiKeys();
  }, []);

  // 处理创建新密钥
  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      setSnackbar({open: true, message: '请输入密钥名称', severity: 'error'});
      return;
    }

    try {
      const currentUser = getCurrentUser();
      if (!currentUser || !currentUser.id || !currentUser.username) {
        setSnackbar({open: true, message: '用户信息不完整，请重新登录', severity: 'error'});
        return;
      }
      
      const apiKeyData = {
        name: newKeyName.trim(),
        description: newKeyDescription.trim(),
        permissions: ['read', 'write'] // 默认权限
      };
      
      const newKey = await createApiKey({
        api_key_data: apiKeyData,
        current_user: {
          id: Number(currentUser.id),
          username: currentUser.username
        }
      });
      
      setApiKeys([...apiKeys, newKey]);
      setOpenCreateDialog(false);
      setNewKeyName('');
      setNewKeyDescription('');
      setSnackbar({open: true, message: '密钥创建成功', severity: 'success'});
    } catch (err) {
      setSnackbar({open: true, message: err instanceof Error ? err.message : '创建密钥失败', severity: 'error'});
    }
  };

  // 处理删除密钥
  const handleDeleteKey = async () => {
    if (!selectedKeyId) return;

    try {
      await deleteApiKey(selectedKeyId);
      setApiKeys(apiKeys.filter(key => key.id !== selectedKeyId));
      setOpenDeleteDialog(false);
      setSelectedKeyId(null);
      setSnackbar({open: true, message: '密钥删除成功', severity: 'success'});
    } catch (err) {
      setSnackbar({open: true, message: err instanceof Error ? err.message : '删除密钥失败', severity: 'error'});
    }
  };

  // 处理重新生成密钥
  const handleRegenerateKey = async () => {
    if (!selectedKeyId) return;

    try {
      const regeneratedKey = await regenerateApiKey(selectedKeyId);
      setApiKeys(apiKeys.map(key => key.id === selectedKeyId ? regeneratedKey : key));
      setOpenRegenerateDialog(false);
      setSelectedKeyId(null);
      setSnackbar({open: true, message: '密钥重新生成成功', severity: 'success'});
    } catch (err) {
      setSnackbar({open: true, message: err instanceof Error ? err.message : '重新生成密钥失败', severity: 'error'});
    }
  };

  // 复制密钥到剪贴板
  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedKeyId(keyId);
        setTimeout(() => setCopiedKeyId(null), 2000);
        setSnackbar({open: true, message: '密钥已复制到剪贴板', severity: 'success'});
      },
      () => {
        setSnackbar({open: true, message: '复制失败，请手动复制', severity: 'error'});
      }
    );
  };

  // 格式化日期
  const formatDate = (date: Date | undefined) => {
    if (!date) return '从未使用';
    return format(new Date(date), 'yyyy-MM-dd HH:mm:ss', );
  };

  // 关闭提示框
  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="API密钥管理" />
        <Tab label="API使用文档" />
      </Tabs>

      {/* API密钥管理面板 */}
      <Box hidden={tabValue !== 0}>
        {/* 原有的密钥管理内容 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            API密钥管理
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
            sx={{
              backgroundColor: '#2ea44f',
              '&:hover': { backgroundColor: '#2c974b' },
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            创建新密钥
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={1} sx={{ width: '100%', overflow: 'hidden', border: '1px solid #e1e4e8', borderRadius: '6px' }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="API密钥表格">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>描述</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>密钥</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>用户ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>创建时间</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={24} />
                      <Typography variant="body2" sx={{ ml: 1, display: 'inline' }}>
                        加载中...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : apiKeys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      暂无API密钥
                    </TableCell>
                  </TableRow>
                ) : (
                  apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>{key.description}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {key.key}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(key.key, key.id)}
                            sx={{ ml: 1 }}
                          >
                            {copiedKeyId === key.id ? <CheckIcon /> : <CopyIcon />}
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>{key.userId}</TableCell>
                      <TableCell>{formatDate(key.createdAt)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => {
                            setSelectedKeyId(key.id);
                            setOpenDeleteDialog(true);
                          }}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* API文档面板 */}
      <Box hidden={tabValue !== 1}>
        <Paper sx={{ p: 4, borderRadius: 2, mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            API 使用文档
          </Typography>
          <Typography color="text.secondary" paragraph>
            本文档将指导您如何正确使用和管理API密钥，以便安全地访问我们的服务。
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            请妥善保管您的API密钥，不要与他人分享或在公共场合泄露。
          </Alert>
        </Paper>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              快速开始
            </Typography>
            <Box
              sx={{
                bgcolor: 'grey.50',
                p: 2,
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                mb: 2,
                whiteSpace: 'pre-wrap'
              }}
            >
{`curl -X POST "http://127.0.0.1:8000/flower/analyze_all" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: multipart/form-data" \\
  -F "image=@your_image.jpg"`}
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              API端点说明
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>端点</TableCell>
                    <TableCell>方法</TableCell>
                    <TableCell>描述</TableCell>
                    <TableCell>参数</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>/flower/analyze_all</TableCell>
                    <TableCell>POST</TableCell>
                    <TableCell>罗汉果花识别分析</TableCell>
                    <TableCell>image: 图片文件</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>/flower/tasks/{'{task_id}'}</TableCell>
                    <TableCell>GET</TableCell>
                    <TableCell>获取分析任务结果</TableCell>
                    <TableCell>task_id: 任务ID</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              使用限制说明
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="请求频率限制" 
                  secondary="每个API密钥每分钟最多60次请求"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="文件大小限制" 
                  secondary="上传图片大小不超过5MB"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="支持的图片格式" 
                  secondary="JPG、PNG、JPEG"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Box>

      {/* 创建密钥对话框 */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
        <DialogTitle>创建新API密钥</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            请输入API密钥的名称，用于标识此密钥的用途。
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="密钥名称"
            type="text"
            fullWidth
            variant="outlined"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="密钥描述"
            type="text"
            fullWidth
            variant="outlined"
            value={newKeyDescription}
            onChange={(e) => setNewKeyDescription(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenCreateDialog(false)}>取消</Button>
          <Button
            onClick={handleCreateKey}
            variant="contained"
            sx={{
              backgroundColor: '#2ea44f',
              '&:hover': { backgroundColor: '#2c974b' },
              textTransform: 'none'
            }}
          >
            创建
          </Button>
        </DialogActions>
      </Dialog>

      {/* 删除密钥确认对话框 */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            您确定要删除此API密钥吗？此操作无法撤销，使用此密钥的应用将无法继续访问API。
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)}>取消</Button>
          <Button onClick={handleDeleteKey} color="error">
            删除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 重新生成密钥确认对话框 */}
      <Dialog open={openRegenerateDialog} onClose={() => setOpenRegenerateDialog(false)}>
        <DialogTitle>确认重新生成</DialogTitle>
        <DialogContent>
          <DialogContentText>
            您确定要重新生成此API密钥吗？此操作将使当前密钥失效，使用此密钥的应用需要更新为新密钥。
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenRegenerateDialog(false)}>取消</Button>
          <Button
            onClick={handleRegenerateKey}
            variant="contained"
            color="warning"
            sx={{ textTransform: 'none' }}
          >
            重新生成
          </Button>
        </DialogActions>
      </Dialog>

      {/* 提示消息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApiKeyManagement;