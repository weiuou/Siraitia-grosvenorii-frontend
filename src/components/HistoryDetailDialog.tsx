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
    category = '',
    confidence = 0,
    details = {
      growthStage: '',
      estimatedHarvestTime: '',
      healthStatus: ''
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
              <Typography variant="h5" color="primary" gutterBottom>
                {category || '未知类别'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                置信度：{confidence ? `${(confidence * 100).toFixed(2)}%` : '未知'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>详细信息：</Typography>
              <Typography>生长阶段：{details?.growthStage || '未知'}</Typography>
              <Typography>预计采摘时间：{details?.estimatedHarvestTime || '未知'}</Typography>
              <Typography>健康状况：{details?.healthStatus || '未知'}</Typography>
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
