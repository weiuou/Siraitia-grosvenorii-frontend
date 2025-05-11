import React, { useState, useCallback, useEffect } from 'react';
import { TOKEN_KEY } from '../utils/auth';
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
import { AnalysisResult, analyzeFlowers, FlowerDetection } from '../services/flowerAnalysis';
import { FlowerInfo } from './FlowerAnalysisResult';

const ImageRecognition: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
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
    result: AnalysisResult | null;
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

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    throw new Error('用户未登录，请先登录');
  }

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
      const result = await analyzeFlowers(processedFile, token!);
      console.log('分析结果:', result);
      
      // 为每朵花裁剪图片
      const flowersWithCrops = await Promise.all(result.flowers.map(async (flower: FlowerDetection) => {
        const img = new Image();
        img.src = currentUrl;
        await new Promise((resolve) => { img.onload = resolve; });
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const { x1, y1, x2, y2 } = flower.bbox;
        const width = x2 - x1;
        const height = y2 - y1;
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, x1, y1, width, height, 0, 0, width, height);
        
        return new Promise<FlowerDetection>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve({
                ...flower,
                crop_image: URL.createObjectURL(blob)
              });
            }
          }, 'image/jpeg');
        });
      }));
      
      // 更新结果中的花朵信息，添加裁剪图片（仅用于显示）
      const resultWithCrops = {
        ...result,
        flowers: flowersWithCrops
      };
      
      // 添加到处理结果列表
      setProcessedResults(prev => [...prev, {
        file: currentFile,
        result: resultWithCrops
      }]);

      setResult(resultWithCrops);

      // 保存到历史记录（使用原始分析结果）
      saveHistory({
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        result: resultWithCrops,  // 使用原始结果，不包含裁剪图片
        imageUrl: currentUrl
      });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                <Typography variant="h6" gutterBottom>
                  检测到 {result.flowers.length} 朵花
                </Typography>
                {result.flowers.map((flower: FlowerDetection, index: number) => (
                  <Paper key={index} variant="outlined" sx={{ p: 2, mt: 2 }}>
                    <Typography variant="subtitle1">
                      花朵 {index + 1}: 类别 {flower.final_class.class_name}
                    </Typography>
                    <Typography>
                      置信度: {flower.bbox.confidence ? (flower.bbox.confidence * 100).toFixed(2) + '%' : 'N/A'}
                    </Typography>
                    <Typography>
                      模型投票: {flower.final_class.class_name}({flower.votes.filter(vote => vote.class_name=== flower.final_class.class_name).length}/{flower.votes.length})
                    </Typography>
                  </Paper>
                ))}
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
                      <TableCell>裁剪图片</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {processedResults.flatMap((item, index) => 
                    item.result?.flowers?.map((flower: FlowerInfo, idx: number) => (
                      <TableRow key={`${index}-${idx}`}>
                        <TableCell>
                          <img
                            src={URL.createObjectURL(item.file)}
                            alt={`原图 ${index + 1}`}
                            style={{ width: 50, height: 50, objectFit: 'cover' }}
                          />
                        </TableCell>
                        <TableCell> {flower.final_class.class_name}</TableCell>
                        <TableCell>
                          {flower.bbox.confidence ? (flower.bbox.confidence * 100).toFixed(2) + '%' : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <img
                            src={flower.crop_image}
                            alt={`花朵 ${index + 1}-${idx + 1}`}
                            style={{ width: 50, height: 50, objectFit: 'cover' }}
                          />
                        </TableCell>
                      </TableRow>
                    )) || (
                      <TableRow key={index}>
                        <TableCell>
                          <img
                            src={URL.createObjectURL(item.file)}
                            alt={`结果 ${index + 1}`}
                            style={{ width: 50, height: 50, objectFit: 'cover' }}
                          />
                        </TableCell>
                        <TableCell>处理中...</TableCell>
                        <TableCell>处理中...</TableCell>
                        <TableCell>处理中...</TableCell>
                        <TableCell>处理中...</TableCell>
                      </TableRow>
                    )
                  )}
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
