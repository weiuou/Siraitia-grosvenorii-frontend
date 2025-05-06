import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Paper,
  Grid,
  Box
} from '@mui/material';
import { HistoryItem } from '../types/history';

interface Props {
  open: boolean;
  record: HistoryItem | null;
  onClose: () => void;
}

const HistoryDetailDialog: React.FC<Props> = ({ open, record, onClose }) => {
  if (!record) return null;

  // 添加数据验证和默认值
  const {
    date = '',
    imageUrl = '',
    result = {
      flowers: [],
      image_size: [0, 0]
    }
  } = record;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>识别详情</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>识别图片</Typography>
            {imageUrl ? (
              <Box sx={{ border: '1px solid #eee', borderRadius: 1, overflow: 'hidden' }}>
                <img 
                  src={imageUrl} 
                  alt="识别图片" 
                  style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain' }} 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.png';
                  }}
                />
              </Box>
            ) : (
              <Typography color="text.secondary">暂无图片</Typography>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>识别结果</Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body1" gutterBottom>
                识别时间：{date || '未知'}
              </Typography>
              {result.flowers.length > 0 ? (
                <>
                  <Typography variant="body1" gutterBottom>
                    检测到 {result.flowers.length} 朵花
                  </Typography>
                  {result.flowers.map((flower, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">
                        花朵 {index + 1}: 类别 {flower.final_class.class_id}
                      </Typography>
                      <Typography>
                        置信度: {(flower.final_class.confidence * 100).toFixed(2)}%
                      </Typography>
                      <Typography>
                        模型投票: {flower.final_class.vote_count}/{flower.votes.length}
                      </Typography>
                    </Box>
                  ))}
                </>
              ) : (
                <Typography color="text.secondary">无检测结果</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>
    </Dialog>
  );
};

export default HistoryDetailDialog;
