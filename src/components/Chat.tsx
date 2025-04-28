import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Container,
  CircularProgress,
  Avatar,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Send as SendIcon, SmartToy as BotIcon, Person as PersonIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
// 移除不需要的身份验证导入
// import { getCurrentUser, isAuthenticated } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

// 定义消息类型
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// 定义对话类型
interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 初始化一个新对话
  useEffect(() => {
    createNewConversation();
  }, []);

  // 滚动到最新消息
  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 创建新对话
  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: `新对话 ${conversations.length + 1}`,
      messages: [
        {
          id: '1',
          content: '罗汉果花的最佳授粉时期是什么时候？',
          role: 'user',
          timestamp: new Date()
        },
        {
          id: '2',
          content: '罗汉果花的最佳授粉时期是在花朵完全开放后的上午9点至11点之间。这个时段有以下几个特点：\n\n1. 温度适中：此时气温适宜（20-25℃），花粉活力最强\n2. 湿度合适：早晨露水已经消散，但空气湿度仍然适中\n3. 雌花最敏感：雌花柱头在这个时间段最容易接受花粉\n4. 雄花花粉量大：雄花在这个时间段花粉释放量最大\n\n要注意的是，如果当天下雨或者湿度过大，建议等待合适的天气再进行授粉。同时，花朵开放后48小时内进行授粉的效果最好。',
          role: 'assistant',
          timestamp: new Date()
        },
        {
          id: '3',
          content: '如何区分罗汉果的雌花和雄花？',
          role: 'user',
          timestamp: new Date()
        },
        {
          id: '4',
          content: '罗汉果的雌花和雄花有几个明显的区别特征：\n\n雌花特征：\n1. 花朵下方有明显的子房，呈圆球形\n2. 花瓣较大，通常4-5片\n3. 单朵生长\n4. 花柱明显，顶端有柱头\n\n雄花特征：\n1. 花朵下方无子房\n2. 花瓣较小\n3. 常3-7朵簇生\n4. 有明显的雄蕊，花药呈黄色\n\n识别技巧：\n- 最简单的方法是看花朵下方是否有圆球形的子房\n- 观察花朵的数量：单朵的很可能是雌花\n- 雌花整体较为粗壮，雄花较为纤细\n\n准确区分雌雄花对于授粉和产量都很重要，建议在花期多加观察和实践。',
          role: 'assistant',
          timestamp: new Date()
        }
      ],
      createdAt: new Date()
    };
    setConversations([...conversations, newConversation]);
    setCurrentConversation(newConversation);
    setInput('');
  };

  // 选择对话
  const selectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
  };

  // 删除对话
  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedConversations = conversations.filter(conv => conv.id !== id);
    setConversations(updatedConversations);
    
    if (currentConversation?.id === id) {
      setCurrentConversation(updatedConversations.length > 0 ? updatedConversations[0] : null);
      if (updatedConversations.length === 0) {
        createNewConversation();
      }
    }
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // 处理发送消息
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!input.trim() || !currentConversation) return;
    
    // 创建用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };
    
    // 更新当前对话
    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, userMessage]
    };
    
    // 更新状态
    setCurrentConversation(updatedConversation);
    setConversations(conversations.map(conv => 
      conv.id === currentConversation.id ? updatedConversation : conv
    ));
    setInput('');
    setLoading(true);
    setError(null);
    
    try {
      // 这里应该调用后端API获取AI回复
      // 模拟API调用
      const API_BASE_URL = 'http://127.0.0.1:8000';
      const response = await axios.post(
        `${API_BASE_URL}/chat/completions`,
        {
          messages: updatedConversation.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          model: 'gpt-3.5-turbo' // 或其他模型
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );
      
      // 检查响应数据格式
      if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
        throw new Error('API返回的数据格式不正确');
      }
      
      // 创建AI回复消息
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.choices[0].message.content,
        role: 'assistant',
        timestamp: new Date()
      };
      
      // 更新对话
      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage]
      };
      
      // 更新状态
      setCurrentConversation(finalConversation);
      setConversations(conversations.map(conv => 
        conv.id === currentConversation.id ? finalConversation : conv
      ));
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // 提供更具体的错误信息
      let errorMessage = '获取AI回复时出错，请重试';
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // 服务器返回了错误状态码
          if (error.response.status === 401) {
            errorMessage = '认证失败，请重新登录';
          } else if (error.response.status === 404) {
            errorMessage = 'API端点不存在，请检查服务器配置';
          } else if (error.response.status >= 500) {
            errorMessage = '服务器内部错误，请稍后再试';
          } else {
            errorMessage = `请求错误: ${error.response.status} - ${error.response.data?.detail || '未知错误'}`;
          }
        } else if (error.request) {
          // 请求已发送但没有收到响应
          errorMessage = '无法连接到服务器，请检查网络连接或服务器状态';
        } else {
          // 请求配置出错
          errorMessage = `请求配置错误: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // 模拟AI回复（实际项目中应删除此部分）
      const mockAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '我是AI助手，很高兴为您服务。由于当前是演示模式，我的回复是预设的。在实际项目中，这里会连接到真实的AI服务。',
        role: 'assistant',
        timestamp: new Date()
      };
      
      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, mockAssistantMessage]
      };
      
      setCurrentConversation(finalConversation);
      setConversations(conversations.map(conv => 
        conv.id === currentConversation.id ? finalConversation : conv
      ));
    } finally {
      setLoading(false);
    }
  };

  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Container maxWidth="xl" sx={{ height: 'calc(100vh - 64px)', display: 'flex', p: 2 }}>
      {/* 左侧对话列表 */}
      {!isMobile && (
        <Paper 
          elevation={0} 
          sx={{ 
            width: '260px', 
            mr: 2, 
            borderRadius: '8px',
            border: '1px solid #e1e4e8',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #e1e4e8' }}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={createNewConversation}
              sx={{ 
                backgroundColor: '#2ea44f', 
                '&:hover': { backgroundColor: '#2c974b' },
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: '6px'
              }}
            >
              新对话
            </Button>
          </Box>
          
          <List sx={{ overflow: 'auto', flexGrow: 1 }}>
            {conversations.map((conv) => (
              <ListItem 
                key={conv.id} 
                button 
                selected={currentConversation?.id === conv.id}
                onClick={() => selectConversation(conv)}
                sx={{ 
                  borderRadius: '4px', 
                  m: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(46, 164, 79, 0.1)',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'rgba(46, 164, 79, 0.2)',
                  }
                }}
              >
                <ListItemText 
                  primary={conv.title} 
                  secondary={new Date(conv.createdAt).toLocaleDateString()}
                  primaryTypographyProps={{ noWrap: true }}
                  sx={{ overflow: 'hidden' }}
                />
                <IconButton 
                  size="small" 
                  onClick={(e) => deleteConversation(conv.id, e)}
                  sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
      
      {/* 右侧聊天区域 */}
      <Paper 
        elevation={0} 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: '8px',
          border: '1px solid #e1e4e8',
          overflow: 'hidden',
          height: '100%'
        }}
      >
        {/* 聊天消息区域 */}
        <Box 
          sx={{ 
            flexGrow: 1, 
            overflow: 'auto', 
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#f6f8fa'
          }}
        >
          {currentConversation?.messages.length === 0 ? (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                opacity: 0.7
              }}
            >
              <BotIcon sx={{ fontSize: 60, mb: 2, color: '#2ea44f' }} />
              <Typography variant="h5" sx={{ fontWeight: 500, mb: 1 }}>
                AI助手
              </Typography>
              <Typography variant="body1" color="textSecondary" align="center">
                有任何问题都可以向我提问
              </Typography>
            </Box>
          ) : (
            currentConversation?.messages.map((message) => (
              <Box 
                key={message.id} 
                sx={{ 
                  display: 'flex',
                  mb: 3,
                  alignItems: 'flex-start'
                }}
              >
                <Avatar 
                  sx={{ 
                    mr: 2, 
                    bgcolor: message.role === 'assistant' ? '#2ea44f' : '#0969da',
                    width: 36,
                    height: 36
                  }}
                >
                  {message.role === 'assistant' ? <BotIcon /> : <PersonIcon />}
                </Avatar>
                <Box sx={{ maxWidth: '80%' }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      backgroundColor: message.role === 'assistant' ? 'white' : 'rgba(9, 105, 218, 0.1)',
                      p: 2,
                      borderRadius: '8px',
                      boxShadow: message.role === 'assistant' ? 1 : 'none',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {message.content}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ mr: 2, bgcolor: '#2ea44f', width: 36, height: 36 }}>
                <BotIcon />
              </Avatar>
              <CircularProgress size={24} sx={{ color: '#2ea44f' }} />
            </Box>
          )}
          {error && (
            <Typography color="error" sx={{ mt: 1, mb: 2 }}>
              {error}
            </Typography>
          )}
          <div ref={messagesEndRef} />
        </Box>
        
        {/* 输入区域 */}
        <Box 
          component="form" 
          onSubmit={handleSendMessage}
          sx={{ 
            p: 2, 
            borderTop: '1px solid #e1e4e8',
            backgroundColor: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="输入消息..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: '#f6f8fa'
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !input.trim()}
              sx={{ 
                ml: 1, 
                height: 54, 
                width: 54, 
                minWidth: 54,
                borderRadius: '8px',
                backgroundColor: '#2ea44f', 
                '&:hover': { backgroundColor: '#2c974b' }
              }}
            >
              <SendIcon />
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Chat;