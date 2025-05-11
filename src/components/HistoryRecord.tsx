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
import StatisticsDialog from './StatisticsDialog';
import { exportToExcel, exportToJSON } from '../utils/exportUtils';

const HistoryRecord: React.FC = () => {
  const [records, setRecords] = useState<HistoryItem[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<HistoryItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [statisticsDialogOpen, setStatisticsDialogOpen] = useState(false);
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

  const handleExport = async (format: string, filename: string, includeStats: boolean = true) => {
    try {
      switch (format) {
        case 'excel':
          await exportToExcel(records, filename, includeStats);
          break;
        case 'json':
          exportToJSON(records, filename, includeStats);
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
              onClick={() => setStatisticsDialogOpen(true)}
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
                <TableCell>图片</TableCell>
                <TableCell>类别</TableCell>
                <TableCell>置信度</TableCell>
                <TableCell>裁剪图片</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.flatMap((record) => 
                record.result?.flowers?.map((flower, flowerIndex) => (
                  <TableRow key={`${record.id}-${flowerIndex}`}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>
                      <img
                        src={record.imageUrl}
                        alt={`原图 ${flowerIndex + 1}`}
                        style={{ width: 50, height: 50, objectFit: 'cover' }}
                      />
                    </TableCell>
                    <TableCell>
                      {flower.final_class.class_name}
                    </TableCell>
                    <TableCell>
                      {flower.bbox.confidence 
                        ? `${(flower.bbox.confidence * 100).toFixed(2)}%`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {flower.bbox && (
                        <div style={{ width: 50, height: 50, overflow: 'hidden', position: 'relative' }}>
                          <img
                            src={flower.crop_image}
                            alt={`花朵 ${flowerIndex + 1}`}
                            style={{
                              width: '50px',
                              height: '50px',
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                          />
                        </div>
                      )}
                    </TableCell>
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
                )) || (
                  <TableRow key={record.id}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>
                      <img
                        src={record.imageUrl}
                        alt="原图"
                        style={{ width: 50, height: 50, objectFit: 'cover' }}
                      />
                    </TableCell>
                    <TableCell>处理中...</TableCell>
                    <TableCell>处理中...</TableCell>
                    <TableCell>处理中...</TableCell>
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
                )
              )}
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
      <StatisticsDialog
        open={statisticsDialogOpen}
        records={records}
        onClose={() => setStatisticsDialogOpen(false)}
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
