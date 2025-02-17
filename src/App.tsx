import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HistoryRecord from './components/HistoryRecord';
import ImageRecognition from './components/ImageRecognition';
import { Container } from '@mui/material';
import './App.css';

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
            <Route path="/Siraitia-grosvenorii-frontend/" element={<ImageRecognition />} />
            <Route path="/Siraitia-grosvenorii-frontend/history" element={<HistoryRecord />} />
          </Routes>
        </Container>
      </div>
    </BrowserRouter>
  );
}

export default App;
