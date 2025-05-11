import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box
} from '@mui/material';
import { HistoryItem } from '../types/history';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Props {
  open: boolean;
  records: HistoryItem[];
  onClose: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const StatisticsDialog: React.FC<Props> = ({ open, records, onClose }) => {
  // 计算平均置信度
  const calculateAverageConfidence = () => {
    let totalConfidence = 0;
    let count = 0;
    records.forEach(record => {
      record.result?.flowers?.forEach(flower => {
        if (flower.bbox.confidence) {
          totalConfidence += flower.bbox.confidence;
          count++;
        }
      });
    });
    return count > 0 ? (totalConfidence / count * 100).toFixed(2) : 0;
  };

  // 计算置信度分布
  const calculateConfidenceDistribution = () => {
    const distribution = [
      { range: '0-20%', count: 0 },
      { range: '20-40%', count: 0 },
      { range: '40-60%', count: 0 },
      { range: '60-80%', count: 0 },
      { range: '80-100%', count: 0 }
    ];

    records.forEach(record => {
      record.result?.flowers?.forEach(flower => {
        if (flower.bbox.confidence) {
          const confidence = flower.bbox.confidence * 100;
          const index = Math.min(Math.floor(confidence / 20), 4);
          distribution[index].count++;
        }
      });
    });

    return distribution;
  };

  // 计算类别分布
  const calculateClassDistribution = () => {
    const distribution = new Map<string, number>();
    records.forEach(record => {
      record.result?.flowers?.forEach(flower => {
        const className = flower.final_class.class_name;
        distribution.set(className, (distribution.get(className) || 0) + 1);
      });
    });

    return Array.from(distribution.entries()).map(([name, value]) => ({
      name,
      value
    }));
  };

  const confidenceDistribution = calculateConfidenceDistribution();
  const classDistribution = calculateClassDistribution();
  const averageConfidence = calculateAverageConfidence();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>统计分析</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>平均置信度</Typography>
            <Typography variant="h4" color="primary">{averageConfidence}%</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>置信度分布</Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confidenceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>类别分布</Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {classDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatisticsDialog;