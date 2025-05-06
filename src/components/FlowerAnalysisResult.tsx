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
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  confidence?: number;
}

export interface FlowerInfo {
  bbox: BoundingBox;
  votes: Array<{
    model_name: string;
    class_id: number;
    class_name?: string;
    confidence: number;
  }>;
  final_class: {
    class_name: string;
    class_id: number;
    confidence: number;
    vote_count: number;
  };
  crop_image?: string;
}

interface AnalysisResultProps {
  taskId: number;
  status: string;
  flowers: FlowerInfo[];
  originalImage: string;
  image_size: [number, number];
}

const FlowerAnalysisResult: React.FC<AnalysisResultProps> = ({
  taskId,
  status,
  flowers,
  originalImage,
  image_size,
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
        const { x1, y1, x2, y2 } = flower.bbox;
        const width = x2 - x1;
        const height = y2 - y1;
        const color = `hsl(${(index * 360) / flowers.length}, 70%, 50%)`;

        // 绘制边界框
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x1, y1, width, height);

        // 绘制标签背景
        ctx.fillStyle = color;
        ctx.fillRect(x1, y1 - 20, 120, 20);

        // 绘制标签文字
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(
          `Class ${flower.final_class.class_id} (${(flower.final_class.confidence * 100).toFixed(1)}%)`,
          x1 + 5,
          y1 - 5
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
                识别到的花朵数量: {flowers.length}
              </Typography>
            </CardContent>
          </Card>

          <Paper sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
            <List>
              {flowers.map((flower, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => handleFlowerClick(flower)}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography variant="body1">
                          花朵 #{index + 1}
                        </Typography>
                        <Chip
                          label={`Class ${flower.final_class.class_id}`}
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    secondary={
                      `置信度: ${(flower.final_class.confidence * 100).toFixed(1)}% (${flower.votes.length} models)`
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
                src={selectedFlower.crop_image || ''}
                alt={`花朵 #${flowers.indexOf(selectedFlower) + 1}`}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              <Typography variant="h6" sx={{ mt: 2 }}>
                花朵详情
              </Typography>
              <Typography variant="body1">
                花朵 #{flowers.indexOf(selectedFlower) + 1}
              </Typography>
              <Typography variant="body1">
                类别ID: {selectedFlower.final_class.class_id}
              </Typography>
              <Typography variant="body1">
                置信度: {(selectedFlower.final_class.confidence * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body1">
                投票数: {selectedFlower.final_class.vote_count}/{selectedFlower.votes.length}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FlowerAnalysisResult;
