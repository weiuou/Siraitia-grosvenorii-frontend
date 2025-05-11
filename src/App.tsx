import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HistoryRecord from './components/HistoryRecord';
import ImageRecognition from './components/ImageRecognition';
import Login from './components/Login';
import Chat from './components/Chat';
import AlgorithmIntroduction from './components/AlgorithmIntroduction';
import ApiKeyManagement from './components/ApiKeyManagement';
import ApiDocumentation from './components/ApiDocumentation';
import { Container } from '@mui/material';
import './App.css';

// 路由守卫组件


function App() {
  const basename = process.env.NODE_ENV === 'production' 
    ? '/Siraitia-grosvenorii-frontend'  // 替换为你的仓库名
    : '/';

  return (
    <BrowserRouter basename={basename}>
      <div className="App">
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<ImageRecognition />} />
            <Route path="/history" element={<HistoryRecord />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/algorithm" element={<AlgorithmIntroduction />} />
            <Route path="/apikeys" element={<ApiKeyManagement />} />
            <Route path="/api-docs" element={<ApiDocumentation />} />
          </Routes>
        </Container>
      </div>
    </BrowserRouter>
  );
}

export default App;
