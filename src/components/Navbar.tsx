import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import { Science, History, Home, Login as LoginIcon, Logout as LogoutIcon, Chat as ChatIcon, Key as KeyIcon, Description as DocIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout, isAuthenticated } from '../utils/auth';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // 检查用户是否已登录
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      setAuthenticated(isAuth);
      
      if (isAuth) {
        const user = getCurrentUser();
        if (user) {
          setUsername(user.name);
        }
      }
    };
    
    checkAuth();
    // 监听存储变化，以便在其他标签页登录/登出时更新状态
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    logout();
    // 触发storage事件以通知其他标签页
    window.dispatchEvent(new Event('storage'));
    setAuthenticated(false);
    setUsername('');
    setAnchorEl(null);
    navigate('/');
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" sx={{ 
      backgroundColor: '#24292e', 
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
      color: '#ffffff'
    }}>
      <Toolbar>
        <Science sx={{ mr: 2, color: '#ffffff' }} />
        <Typography variant="h6" sx={{ 
          flexGrow: 1, 
          fontWeight: 600,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
        }}>
          罗汉果花智能识别系统
        </Typography>
        <Box>
          <Button 
            color="inherit" 
            startIcon={<Home />}
            onClick={() => navigate('/')}
            sx={{ 
              mx: 1, 
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.1)' 
              },
              borderRadius: '3px',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            首页
          </Button>
          <Button 
            color="inherit" 
            startIcon={<History />}
            onClick={() => navigate('/history')}
            sx={{ 
              mx: 1, 
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.1)' 
              },
              borderRadius: '3px',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            历史记录
          </Button>
          <Button 
            color="inherit" 
            startIcon={<ChatIcon />}
            onClick={() => navigate('/chat')}
            sx={{ 
              mx: 1, 
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.1)' 
              },
              borderRadius: '3px',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            AI聊天
          </Button>
          <Button 
            color="inherit" 
            startIcon={<KeyIcon />}
            onClick={() => navigate('/apikeys')}
            sx={{ 
              mx: 1, 
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.1)' 
              },
              borderRadius: '3px',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            API密钥
          </Button>
          <Button 
            color="inherit" 
            startIcon={<Science />}
            onClick={() => navigate('/algorithm')}
            sx={{ 
              mx: 1, 
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.1)' 
              },
              borderRadius: '3px',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            算法介绍
          </Button>
          {authenticated ? (
            <>
              <Button
                color="inherit"
                onClick={handleMenu}
                sx={{ 
                  ml: 1,
                  '&:hover': { 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                  },
                  borderRadius: '3px',
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                <Avatar sx={{ width: 24, height: 24, fontSize: 14, bgcolor: '#2ea44f', mr: 1 }}>
                  {username.charAt(0).toUpperCase()}
                </Avatar>
                {username}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                  退出登录
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              color="inherit"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/login')}
              sx={{ 
                ml: 1, 
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                },
                borderRadius: '3px',
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              登录
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
