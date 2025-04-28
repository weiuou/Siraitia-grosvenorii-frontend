import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Container,
  Tabs,
  Tab
} from '@mui/material';
import { Login as LoginIcon, PersonAdd as RegisterIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../utils/auth';
import { LoginCredentials } from '../types/user';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await login(credentials);
      } else {
        if (credentials.password !== confirmPassword) {
          throw new Error('两次输入的密码不一致');
        }
        await register(credentials);
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : `${isLogin ? '登录' : '注册'}失败，请重试`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mt: 8,
          borderRadius: '6px',
          border: '1px solid #e1e4e8'
        }}
      >
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 3 
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            {isLogin ? (
              <LoginIcon sx={{ fontSize: 40, color: '#24292e', mb: 1 }} />
            ) : (
              <RegisterIcon sx={{ fontSize: 40, color: '#24292e', mb: 1 }} />
            )}
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontWeight: 600, 
                color: '#24292e',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
              }}
            >
              {isLogin ? '登录' : '注册'}到罗汉果花智能识别系统
            </Typography>
          </Box>

          <Tabs
            value={isLogin ? 0 : 1}
            onChange={(_, newValue) => {
              setIsLogin(newValue === 0);
              setError(null);
            }}
            variant="fullWidth"
            sx={{ mb: 2 }}
          >
            <Tab label="登录" />
            <Tab label="注册" />
          </Tabs>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="用户名"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
          />

          <TextField
            label="密码"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
          />

          {!isLogin && (
            <TextField
              label="确认密码"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
              variant="outlined"
            />
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ 
              py: 1.5, 
              backgroundColor: '#2ea44f', 
              '&:hover': { backgroundColor: '#2c974b' },
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '16px',
              borderRadius: '6px'
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : (isLogin ? '登录' : '注册')}
          </Button>

          {isLogin && (
            <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, color: '#586069' }}>

            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;