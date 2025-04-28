import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import { Code as CodeIcon, Security as SecurityIcon, Speed as SpeedIcon } from '@mui/icons-material';

const ApiDocumentation: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2, mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          API 密钥使用文档
        </Typography>
        <Typography color="text.secondary" paragraph>
          本文档将指导您如何正确使用和管理API密钥，以便安全地访问我们的服务。
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          请妥善保管您的API密钥，不要与他人分享或在公共场合泄露。
        </Alert>
      </Paper>

      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<CodeIcon />} label="快速开始" />
        <Tab icon={<SecurityIcon />} label="安全指南" />
        <Tab icon={<SpeedIcon />} label="使用限制" />
      </Tabs>

      <Box hidden={tabValue !== 0}>
        <Typography variant="h5" gutterBottom>
          快速开始
        </Typography>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              1. 获取API密钥
            </Typography>
            <Box
              sx={{
                bgcolor: 'grey.50',
                p: 2,
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                mb: 2
              }}
            >
              {`curl -X POST "https://api.example.com/v1/chat/completions" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [{"role": "user", "content": "Hello"}]
  }'`}
            </Box>
          </CardContent>
        </Card>

        <Typography variant="h6" gutterBottom>
          API 端点说明
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>端点</TableCell>
                <TableCell>方法</TableCell>
                <TableCell>描述</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>/chat/completions</TableCell>
                <TableCell>POST</TableCell>
                <TableCell>创建对话完成</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>/images/recognize</TableCell>
                <TableCell>POST</TableCell>
                <TableCell>图像识别分析</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box hidden={tabValue !== 1}>
        <Typography variant="h5" gutterBottom>
          安全指南
        </Typography>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="error">
              注意事项
            </Typography>
            <Typography component="div">
              <ul>
                <li>永远不要在客户端代码中暴露API密钥</li>
                <li>定期轮换您的API密钥</li>
                <li>使用环境变量存储API密钥</li>
                <li>限制API密钥的权限范围</li>
              </ul>
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box hidden={tabValue !== 2}>
        <Typography variant="h5" gutterBottom>
          使用限制
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>限制类型</TableCell>
                <TableCell>免费版</TableCell>
                <TableCell>专业版</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>请求频率</TableCell>
                <TableCell>60次/分钟</TableCell>
                <TableCell>600次/分钟</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>并发请求数</TableCell>
                <TableCell>5</TableCell>
                <TableCell>50</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default ApiDocumentation;
