import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Stack,
  Snackbar,
  Alert
} from '@mui/material';
import { Delete, Visibility, GetApp, Timeline } from '@mui/icons-material';
import { getHistory, deleteHistoryItem } from '../utils/storage';
import { HistoryItem } from '../types/history';
import HistoryDetailDialog from './HistoryDetailDialog';
import ExportDialog from './ExportDialog';
import { exportToExcel, exportToJSON } from '../utils/exportUtils';

const HistoryRecord: React.FC = () => {
  const [records, setRecords] = useState<HistoryItem[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<HistoryItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    setRecords(getHistory());
  }, []);

  const handleDelete = (id: string) => {
    const newRecords = deleteHistoryItem(id);
    setRecords(newRecords);
  };

  const handleView = (record: HistoryItem) => {
    setSelectedRecord(record);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRecord(null);
  };

  const handleExport = async (format: string, filename: string) => {
    try {
      switch (format) {
        case 'excel':
          await exportToExcel(records, filename);
          break;
        case 'json':
          exportToJSON(records, filename);
          break;
      }
      setSnackbar({
        open: true,
        message: '导出成功！',
        severity: 'success'
      });
    } catch (error) {
      console.error('导出失败:', error);
      setSnackbar({
        open: true,
        message: '导出失败，请重试',
        severity: 'error'
      });
    }
  };

  return (
    <>
      <Paper sx={{ p: 3, mt: 3, border: '1px solid #e1e4e8', borderRadius: '6px', boxShadow: '0 1px 0 rgba(27, 31, 35, 0.04)' }}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#24292e', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }}>历史记录</Typography>
          <Stack direction="row" spacing={2}>
            <Button 
              startIcon={<Timeline />}
              onClick={() => console.log('显示统计分析')}
              sx={{ 
                backgroundColor: '#fafbfc', 
                border: '1px solid rgba(27, 31, 35, 0.15)', 
                color: '#24292e',
                '&:hover': { backgroundColor: '#f3f4f6' },
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: '6px'
              }}
            >
              统计分析
            </Button>
            <Button 
              startIcon={<GetApp />}
              variant="contained"
              onClick={() => setExportDialogOpen(true)}
              sx={{ 
                backgroundColor: '#2ea44f', 
                '&:hover': { backgroundColor: '#2c974b' },
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: '6px'
              }}
            >
              导出记录
            </Button>
          </Stack>
        </Stack>
        <TableContainer>
          <Table className="github-table">
            <TableHead sx={{ backgroundColor: '#f6f8fa' }}>
              <TableRow sx={{ '& th': { fontWeight: 600, color: '#24292e' } }}>
                <TableCell>日期</TableCell>
                <TableCell>类别</TableCell>
                <TableCell>置信度</TableCell>
                <TableCell>生长阶段</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.category}</TableCell>
                  <TableCell>{(record.confidence * 100).toFixed(2)}%</TableCell>
                  <TableCell>{record.details.growthStage}</TableCell>
                  <TableCell>
                    <Tooltip title="查看详情">
                      <IconButton onClick={() => handleView(record)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="删除记录">
                      <IconButton onClick={() => handleDelete(record.id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <ExportDialog
        open={exportDialogOpen}
        records={records}
        onClose={() => setExportDialogOpen(false)}
        onExport={handleExport}
      />
      <HistoryDetailDialog 
        open={dialogOpen}
        record={selectedRecord}
        onClose={handleCloseDialog}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default HistoryRecord;
