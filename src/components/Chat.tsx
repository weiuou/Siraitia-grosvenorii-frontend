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
  IconButton,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Send as SendIcon, SmartToy as BotIcon, Person as PersonIcon, Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css';
// 移除不需要的身份验证导入
// import { getCurrentUser, isAuthenticated } from '../utils/auth';

// 定义消息类型
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
    // 创建新对话
    const createNewConversation = React.useCallback(() => {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: `新对话 ${conversations.length + 1}`,
        messages: [
          {
            id: '0',
            content: '你是一位专业的罗汉果种植农业专家，拥有丰富的罗汉果种植、培育和管理经验。你只回答与罗汉果（Siraitia grosvenorii）相关的问题，包括但不限于罗汉果的种植技术、病虫害防治、授粉技巧、采收加工、品种选择等方面的专业知识。如果用户询问与罗汉果无关的问题，请礼貌地告知用户你只能回答罗汉果相关的问题，并建议用户提出罗汉果相关的问题。请用专业、清晰、易懂的语言回答问题，必要时可以提供具体的操作步骤和注意事项。',
            role: 'system',
            timestamp: new Date()
          },
          {
            id: '1',
            content: '您好！我是罗汉果种植专家，可以为您提供罗汉果种植、培育和管理方面的专业建议。请问您有什么关于罗汉果的问题需要咨询吗？',
            role: 'assistant',
            timestamp: new Date()
          }
        ],
        createdAt: new Date()
      };
      setConversations([...conversations, newConversation]);
      setCurrentConversation(newConversation);
      setInput('');
    }, [conversations]);
  
  // 初始化一个新对话
  useEffect(() => {
    createNewConversation();
  });

  // 滚动到最新消息
  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      // 调用DeepSeek API获取AI回复
      const API_BASE_URL = 'https://api.deepseek.com';
      const response = await axios.post(
        `${API_BASE_URL}/chat/completions`,
        {
          messages: updatedConversation.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          model: 'deepseek-chat', // 使用DeepSeek模型
          temperature: 0.7, // 控制创造性
          top_p: 0.9, // 控制多样性
          max_tokens: 1000 // 限制回复长度
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_DEEPSEEK_API_KEY}`
          }
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
            errorMessage = 'DeepSeek认证服务暂时不可用，请稍后再试';
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
      console.error('DeepSeek API调用失败:', errorMessage);
      
      // 创建一个友好的错误提示消息
      const errorAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '很抱歉，我暂时无法回答您的问题。请稍后再试，或者尝试提出另一个关于罗汉果的问题。',
        role: 'assistant',
        timestamp: new Date()
      };
      
      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, errorAssistantMessage]
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

  // 导出对话
  const exportConversation = () => {
    if (!currentConversation) return;
    
    // 过滤掉系统消息，只保留用户和助手的对话
    const messages = currentConversation.messages
      .filter(message => message.role !== 'system')
      .map(message => ({
        role: message.role === 'assistant' ? '助手' : '用户',
        content: message.content,
        time: new Date(message.timestamp).toLocaleString()
      }));
    
    // 生成导出文本
    const exportText = messages
      .map(msg => `${msg.time}\n${msg.role}：${msg.content}\n`)
      .join('\n');
    
    // 创建Blob对象
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${currentConversation.title}-${new Date().toLocaleDateString()}.txt`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 释放URL对象
    URL.revokeObjectURL(link.href);
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
            <Box sx={{ display: 'flex', gap: 1 }}>
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
              <Button
                variant="outlined"
                onClick={exportConversation}
                disabled={!currentConversation}
                sx={{
                  borderColor: '#2ea44f',
                  color: '#2ea44f',
                  '&:hover': {
                    borderColor: '#2c974b',
                    backgroundColor: 'rgba(46, 164, 79, 0.04)'
                  },
                  minWidth: 'auto',
                  px: 1
                }}
              >
                <DownloadIcon />
              </Button>
            </Box>
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
            display: 'flex-start',
            flexDirection: 'column',
            bgcolor: '#f6f8fa'
          }}
        >
          {currentConversation?.messages.length === 0 ? (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'left', 
                justifyContent: 'left',
                height: '100%',
                opacity: 0.7
              }}
            >
              <BotIcon sx={{ fontSize: 60, mb: 2, color: '#2ea44f' }} />
              <Typography variant="h5" sx={{ fontWeight: 500, mb: 1 }}>
                罗汉果农业专家
              </Typography>
              <Typography variant="body1" color="textSecondary" align="left">
                您好！我是罗汉果种植专家，可以回答关于罗汉果种植、培育和管理的专业问题。
              </Typography>
            </Box>
          ) : (
            currentConversation?.messages
              .filter(message => message.role !== 'system')
              .map((message) => (
                <Box 
                  key={message.id} 
                  sx={{ 
                    display: 'flex',
                    mb: 3,
                    alignItems: 'flex-start',
                    flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                    alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <Avatar 
                    sx={{ 
                      ml: message.role === 'user' ? 2 : 0,
                      mr: message.role === 'assistant' ? 2 : 0,
                      bgcolor: message.role === 'assistant' ? '#2ea44f' : '#0969da',
                      width: 36,
                      height: 36
                    }}
                  >
                    {message.role === 'assistant' ? <BotIcon /> : <PersonIcon />}
                  </Avatar>
                  <Box sx={{ maxWidth: '80%' }}>
                    <Box 
                      sx={{ 
                        backgroundColor: message.role === 'assistant' ? 'white' : 'rgba(9, 105, 218, 0.1)',
                        p: 2,
                        borderRadius: '8px',
                        boxShadow: message.role === 'assistant' ? 1 : 'none',
                        '& .markdown-body': {
                          backgroundColor: 'transparent',
                          fontFamily: 'inherit',
                        },
                        '& pre': {
                          margin: '16px 0',
                          padding: '16px',
                          backgroundColor: '#1e1e1e',
                          borderRadius: '6px',
                          overflow: 'auto',
                        },
                        '& code': {
                          fontFamily: 'monospace',
                          fontSize: '0.9em',
                        },
                        '& p': {
                          marginBottom: '16px',
                          '&:last-child': {
                            marginBottom: 0,
                          },
                        },
                        '& table': {
                          borderCollapse: 'collapse',
                          width: '100%',
                          marginBottom: '16px',
                        },
                        '& th, & td': {
                          border: '1px solid #dfe2e5',
                          padding: '6px 13px',
                        },
                        '& blockquote': {
                          borderLeft: '4px solid #dfe2e5',
                          color: '#6a737d',
                          marginLeft: 0,
                          paddingLeft: '16px',
                        },
                      }}
                    >
                      <ReactMarkdown>
                        {message.content}
                      </ReactMarkdown>
                    </Box>
                    <Typography 
                      variant="caption" 
                      color="textSecondary" 
                      sx={{ 
                        mt: 0.5, 
                        display: 'block',
                        textAlign: message.role === 'user' ? 'right' : 'left'
                      }}
                    >
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