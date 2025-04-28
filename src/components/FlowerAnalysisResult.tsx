import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
} from '@mui/material';
import { ZoomIn, ZoomOut } from '@mui/icons-material';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FlowerInfo {
  id: number;
  cropped_image: string;
  gender: string;
  confidence: number;
  bounding_box: BoundingBox;
  created_at: string;
}

interface AnalysisResultProps {
  taskId: number;
  status: string;
  totalFlowers: number;
  flowers: FlowerInfo[];
  originalImage: string;
}

const FlowerAnalysisResult: React.FC<AnalysisResultProps> = ({
  taskId,
  status,
  totalFlowers,
  flowers,
  originalImage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedFlower, setSelectedFlower] = useState<FlowerInfo | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

  // 绘制标注框和标签
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = new Image();
    image.src = originalImage;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      // 为每朵花绘制边界框和标签
      flowers.forEach((flower, index) => {
        const { x, y, width, height } = flower.bounding_box;
        const color = `hsl(${(index * 360) / flowers.length}, 70%, 50%)`;

        // 绘制边界框
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // 绘制标签背景
        ctx.fillStyle = color;
        ctx.fillRect(x, y - 20, 120, 20);

        // 绘制标签文字
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(
          `${flower.gender} (${(flower.confidence * 100).toFixed(1)}%)`,
          x + 5,
          y - 5
        );
      });
    };
  }, [originalImage, flowers]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleFlowerClick = (flower: FlowerInfo) => {
    setSelectedFlower(flower);
    setShowPreview(true);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* 左侧统计信息和列表 */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                分析结果统计
              </Typography>
              <Typography variant="body1" color="text.secondary">
                任务ID: {taskId}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                状态: {status}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                识别到的花朵数量: {totalFlowers}
              </Typography>
            </CardContent>
          </Card>

          <Paper sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
            <List>
              {flowers.map((flower) => (
                <ListItem
                  key={flower.id}
                  button
                  onClick={() => handleFlowerClick(flower)}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography variant="body1">
                          花朵 #{flower.id}
                        </Typography>
                        <Chip
                          label={`${flower.gender}`}
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    secondary={
                      `置信度: ${(flower.confidence * 100).toFixed(1)}%`
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* 右侧图片预览区域 */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 2,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 1,
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 1,
                p: 0.5,
              }}
            >
              <IconButton onClick={handleZoomIn} size="small">
                <ZoomIn />
              </IconButton>
              <IconButton onClick={handleZoomOut} size="small">
                <ZoomOut />
              </IconButton>
            </Box>

            <Box
              sx={{
                overflow: 'auto',
                maxHeight: 600,
              }}
            >
              <Box
                sx={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top left',
                }}
              >
                <canvas
                  ref={canvasRef}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 花朵详情预览对话框 */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="md"
      >
        <DialogContent>
          {selectedFlower && (
            <Box>
              <img
                src={selectedFlower.cropped_image}
                alt={`花朵 #${selectedFlower.id}`}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              <Typography variant="h6" sx={{ mt: 2 }}>
                花朵详情
              </Typography>
              <Typography variant="body1">
                ID: {selectedFlower.id}
              </Typography>
              <Typography variant="body1">
                性别: {selectedFlower.gender}
              </Typography>
              <Typography variant="body1">
                置信度: {(selectedFlower.confidence * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body1">
                创建时间: {new Date(selectedFlower.created_at).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FlowerAnalysisResult;