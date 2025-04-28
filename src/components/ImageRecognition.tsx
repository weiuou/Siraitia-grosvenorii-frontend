import React, { useState, useCallback, useEffect } from 'react';
import {
  Paper,
  Button,
  Card,
  CardContent,
  Grid,
  Box,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Typography,
  ImageList,
  ImageListItem,
  Slider,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { CloudUpload, Assessment } from '@mui/icons-material';
import { saveHistory } from '../utils/storage';
import { HistoryItem } from '../types/history';
import { analyzeFlowers, getAnalysisResult } from '../services/flowerAnalysis';

const ImageRecognition: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [autoProcess, setAutoProcess] = useState(true);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [imageQueue, setImageQueue] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [processedResults, setProcessedResults] = useState<Array<{
    file: File;
    result: any;
  }>>([]);

  const steps = ['上传图片', '智能识别', '查看结果'];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleMultipleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setImageQueue(files);
    setImages(files);
    
    // 重置状态
    setCurrentIndex(0);
    setProcessedResults([]);
    setProcessing(false);
    
    // 显示第一张图片预览
    setSelectedImage(files[0]);
    setPreviewUrl(URL.createObjectURL(files[0]));
  };

  // 添加函数：将处理后的图片转换为 Blob
  const getProcessedImageBlob = useCallback(async (
    imageUrl: string,
    imageParams: {
      brightness: number;
      contrast: number;
      grayscale: number;
    }
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // 应用滤镜效果
          ctx.filter = `brightness(${imageParams.brightness}%) contrast(${imageParams.contrast}%) grayscale(${imageParams.grayscale}%)`;
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          }, 'image/jpeg', 0.95);
        }
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  }, []); // 现在不需要任何依赖

  const processNextImage = useCallback(async () => {
    if (!imageQueue[currentIndex]) {
      setProcessing(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const currentFile = imageQueue[currentIndex];
      const currentUrl = URL.createObjectURL(currentFile);

      // 获取处理后的图片 Blob，传入当前的图片处理参数
      const processedBlob = await getProcessedImageBlob(currentUrl, {
        brightness,
        contrast,
        grayscale
      });

      // 创建处理后的文件对象
      const processedFile = new File([processedBlob], currentFile.name, { type: 'image/jpeg' });
      
      // 调用分析API并等待完整结果
      const result = await analyzeFlowers(processedFile, 'your-token-here');

      // 添加默认的生长阶段、预计采摘时间和健康状况信息
      const enhancedResult = {
        ...(result as unknown as object),
        details: {
          growthStage: '花期',
          estimatedHarvestTime: '约4-6周',
          healthStatus: '良好'
        }
      };

      // 添加到处理结果列表
      setProcessedResults(prev => [...prev, {
        file: currentFile,
        result: enhancedResult
      }]);

      setResult(enhancedResult);

      setResult(result);

      // 更新预览为下一张图片
      const nextFile = imageQueue[currentIndex + 1];
      if (nextFile) {
        setSelectedImage(nextFile);
        setPreviewUrl(URL.createObjectURL(nextFile));
      }

      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('处理图片时出错:', error);
      setProcessedResults(prev => [...prev, {
        file: imageQueue[currentIndex],
        result: null
      }]);
    } finally {
      setLoading(false);
    }
  }, [currentIndex, imageQueue, brightness, contrast, grayscale, getProcessedImageBlob]);

  // 批量处理启动函数
  const handleBatchProcess = useCallback(async () => {
    if (imageQueue.length === 0 || processing) return;
    
    setProcessing(true);
    setCurrentIndex(0);
    setProcessedResults([]);
    
    // 设置第一张图片
    const firstFile = imageQueue[0];
    setSelectedImage(firstFile);
    setPreviewUrl(URL.createObjectURL(firstFile));
    
    await processNextImage();
  }, [imageQueue, processing, processNextImage]);

  // 监听currentIndex变化，处理下一张图片
  useEffect(() => {
    if (processing && currentIndex < imageQueue.length && !loading) {
      processNextImage();
    } else if (currentIndex >= imageQueue.length) {
      setProcessing(false);
    }
  }, [currentIndex, processing, imageQueue, loading, processNextImage]);

  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // 添加轮询效果
  useEffect(() => {
    const pendingResults = processedResults.filter(r => 
      r.result?.status === 'pending' || r.result?.status === 'processing'
    );
    
    if (pendingResults.length > 0 && !pollingInterval) {
      const interval = setInterval(async () => {
        let allCompleted = true;
        
        for (const result of pendingResults) {
          if (result.result?.taskId) {
            try {
              const response = await getAnalysisResult(result.result?.taskId, 'your-token-here');
              
              if (response.status === 'completed' && response.result) {
                setProcessedResults(prev => prev.map(r => 
                  r.result?.taskId === result.result?.taskId ? {
                    ...r,
                    status: 'completed',
                    result: response.result
                  } : r
                ));
                
                // 保存到历史记录
                const historyItem: HistoryItem = {
                  id: Date.now().toString(),
                  date: new Date().toLocaleString(),
                  imageUrl: URL.createObjectURL(result.file),
                  ...response.result
                };
                saveHistory(historyItem);
              } else if (response.status === 'failed') {
                setProcessedResults(prev => prev.map(r => 
                  r.result?.taskId === result.result?.taskId ? {
                    ...r,
                    status: 'failed',
                    error: response.error || '分析失败'
                  } : r
                ));
              } else {
                allCompleted = false;
              }
            } catch (error) {
              console.error('获取分析结果时出错:', error);
              setProcessedResults(prev => prev.map(r => 
                r.result?.taskId === result.result?.taskId ? {
                  ...r,
                  status: 'failed',
                  error: error instanceof Error ? error.message : '未知错误'
                } : r
              ));
            }
          }
        }
        
        // 如果所有任务都完成或失败，清除轮询
        if (allCompleted) {
          clearInterval(interval);
          setPollingInterval(null);
        }
      }, 3000);
      
      setPollingInterval(interval);
    } else if (pendingResults.length === 0 && pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [processedResults]);

  // 添加图片样式处理函数
  const getImageStyle = () => ({
    filter: `
      brightness(${brightness}%) 
      contrast(${contrast}%) 
      grayscale(${grayscale}%)
    `,
    transition: 'filter 0.3s'
  });

  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      <Grid item xs={12}>
        <Paper sx={{ 
          p: 3, 
          border: '1px solid #e1e4e8',
          borderRadius: '6px',
          boxShadow: '0 1px 0 rgba(27, 31, 35, 0.04)',
          '&:hover': {
            boxShadow: '0 1px 3px rgba(27, 31, 35, 0.1)'
          }
        }}>
          <Stepper activeStep={result ? 2 : selectedImage ? 1 : 0}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ 
          border: '1px solid #e1e4e8',
          borderRadius: '6px',
          boxShadow: '0 1px 0 rgba(27, 31, 35, 0.04)',
          '&:hover': {
            boxShadow: '0 1px 3px rgba(27, 31, 35, 0.1)'
          }
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              批量上传区域
            </Typography>
            <Box className="upload-zone" sx={{
              border: '1px dashed #e1e4e8',
              borderRadius: '6px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: '#fafbfc',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#2ea44f',
                backgroundColor: '#f6f8fa'
              },
              position: 'relative',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="预览" 
                  className="preview-image"
                  style={{
                    ...getImageStyle(),
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '4px',
                    boxShadow: '0 1px 3px rgba(27, 31, 35, 0.1)'
                  }} 
                />
              ) : (
                <Box className="upload-placeholder">
                  <CloudUpload sx={{ fontSize: 60, color: '#2ea44f', mb: 1 }} />
                  <Typography sx={{ color: '#586069', fontSize: '0.9rem' }}>点击或拖拽上传图片</Typography>
                </Box>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden-input"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleMultipleUpload}
                className="hidden-input"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={handleBatchProcess}
              disabled={imageQueue.length === 0 || processing}
              fullWidth
              sx={{ 
                mt: 2,
                backgroundColor: '#2ea44f',
                border: '1px solid rgba(27, 31, 35, 0.15)',
                '&:hover': {
                  backgroundColor: '#2c974b'
                },
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: '6px',
                boxShadow: 'none'
              }}
            >
              {processing ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1, color: '#ffffff' }} />
                  正在处理 ({currentIndex + 1}/{imageQueue.length})
                </>
              ) : (
                '开始批量处理'
              )}
            </Button>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ 
          border: '1px solid #e1e4e8',
          borderRadius: '6px',
          boxShadow: '0 1px 0 rgba(27, 31, 35, 0.04)',
          '&:hover': {
            boxShadow: '0 1px 3px rgba(27, 31, 35, 0.1)'
          }
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              识别结果
            </Typography>
            {result ? (
              <Box>
                <Typography variant="h4" color="primary" gutterBottom>
                  {result.category}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                   置信度：{(result.confidence * 100).toFixed(2)}%
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                  <Typography variant="subtitle2">详细信息：</Typography>
                  {/* <Typography>生长阶段：{result.details.growthStage}</Typography> */}
                  {/* <Typography>预计采摘时间：{result.details.estimatedHarvestTime}</Typography> */}
                  {/* <Typography>健康状况：{result.details.healthStatus}</Typography> */}
                </Paper>
              </Box>
            ) : (
              <Box className="result-placeholder">
                <Assessment sx={{ fontSize: 40, color: 'text.secondary' }} />
                <Typography color="text.secondary">
                  上传图片后开始识别
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6">图片处理选项</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={autoProcess}
                  onChange={(e) => setAutoProcess(e.target.checked)}
                />
              }
              label="自动优化"
            />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography>亮度调节</Typography>
                <Slider
                  value={brightness}
                  onChange={(_, value) => setBrightness(value as number)}
                  min={0}
                  max={200}
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography>对比度</Typography>
                <Slider
                  value={contrast}
                  onChange={(_, value) => setContrast(value as number)}
                  min={0}
                  max={200}
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography>灰度</Typography>
                <Slider
                  value={grayscale}
                  onChange={(_, value) => setGrayscale(value as number)}
                  min={0}
                  max={100}
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setBrightness(100);
                    setContrast(100);
                    setGrayscale(0);
                  }}
                  sx={{ 
                    backgroundColor: '#fafbfc',
                    border: '1px solid rgba(27, 31, 35, 0.15)',
                    color: '#24292e',
                    '&:hover': { 
                      backgroundColor: '#f3f4f6',
                      borderColor: 'rgba(27, 31, 35, 0.15)'
                    },
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: '6px'
                  }}
                >
                  重置调整
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      
      {images.length > 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">批量上传预览</Typography>
              <ImageList sx={{ height: 200 }} cols={4}>
                {images.map((file, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`预览 ${index + 1}`}
                      loading="lazy"
                      style={getImageStyle()}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </CardContent>
          </Card>
        </Grid>
      )}

      {processedResults.length > 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                批量处理结果
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>图片</TableCell>
                      <TableCell>类别</TableCell>
                      <TableCell>置信度</TableCell>
                      <TableCell>生长阶段</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {processedResults.filter(item => item.result?.status === 'completed').map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <img
                            src={URL.createObjectURL(item.file)}
                            alt={`结果 ${index + 1}`}
                            style={{ width: 50, height: 50, objectFit: 'cover' }}
                          />
                        </TableCell>
                        <TableCell>{item.result?.category || '处理中...'}</TableCell>
                        <TableCell>
                          {item.result ? `${(item.result.confidence * 100).toFixed(2)}%` : '处理中...'}
                        </TableCell>
                        <TableCell>{item.result?.details.growthStage || '处理中...'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

export default ImageRecognition;
