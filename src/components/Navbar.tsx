import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box
} from '@mui/material';
import { Science, History, Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <Science sx={{ mr: 2 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          罗汉果花智能识别系统
        </Typography>
        <Box>
          <Button 
            color="inherit" 
            startIcon={<Home />}
            onClick={() => navigate('/Siraitia-grosvenorii-frontend/')}
          >
            首页
          </Button>
          <Button 
            color="inherit" 
            startIcon={<History />}
            onClick={() => navigate('/Siraitia-grosvenorii-frontend/history')}
          >
            历史记录
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
