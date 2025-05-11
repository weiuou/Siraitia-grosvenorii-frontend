import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Checkbox,
  Typography,
  Box
} from '@mui/material';
import { HistoryItem } from '../types/history';

interface Props {
  open: boolean;
  records: HistoryItem[];
  onClose: () => void;
  onExport: (format: string, filename: string, includeStats: boolean) => void;
}

const ExportDialog: React.FC<Props> = ({ open, records, onClose, onExport }) => {
  const [format, setFormat] = useState('excel');
  const [filename, setFilename] = useState('识别记录');
  const [includeStats, setIncludeStats] = useState(true);

  const handleExport = () => {
    onExport(format, filename, includeStats);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>导出记录</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <TextField
            label="文件名"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
          />
        </FormControl>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>导出格式</Typography>
          <RadioGroup
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <FormControlLabel 
              value="excel" 
              control={<Radio />} 
              label="Excel (包含图片文件夹)" 
            />
            <FormControlLabel value="json" control={<Radio />} label="JSON" />
          </RadioGroup>
        </FormControl>
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeStats}
                onChange={(e) => setIncludeStats(e.target.checked)}
              />
            }
            label="包含统计分析数据"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={handleExport} variant="contained">
          导出
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;
