import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CodeIcon from '@mui/icons-material/Code';

const AlgorithmIntroduction: React.FC = () => {
  return (
    <Box sx={{ mb: 6 }}>
      <Paper sx={{ 
        p: 3, 
        border: '1px solid #e1e4e8',
        borderRadius: '6px',
        boxShadow: '0 1px 0 rgba(27, 31, 35, 0.04)',
        mb: 4
      }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 600 }}>
          图像识别与分类算法介绍
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: '#586069' }}>
          本页面介绍了用于罗汉果花识别与分类的主要算法，包括传统机器学习方法和深度学习方法，以及它们在农业领域的应用。
        </Typography>
      </Paper>

      {/* 算法概述部分 */}
      <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
        1. 算法概述
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', border: '1px solid #e1e4e8', boxShadow: 'none' }}>
            <CardContent>
              <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                传统机器学习方法
              </Typography>
              <Typography variant="body2" paragraph>
                传统机器学习方法通常基于手工设计的特征提取和分类器，适用于数据量较小或计算资源有限的场景。
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CodeIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="支持向量机 (SVM)" 
                    secondary="通过寻找最优超平面来分离不同类别的数据点，适合处理高维特征空间"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CodeIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="K近邻算法 (KNN)" 
                    secondary="基于相似度度量，将未知样本分类到与其最相似的已知样本所属的类别"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CodeIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="随机森林 (Random Forest)" 
                    secondary="集成多个决策树的结果，提高分类准确率和鲁棒性"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', border: '1px solid #e1e4e8', boxShadow: 'none' }}>
            <CardContent>
              <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                深度学习方法
              </Typography>
              <Typography variant="body2" paragraph>
                深度学习方法能够自动学习特征表示，在大规模数据集上表现优异，特别适合复杂的图像识别任务。
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CodeIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="卷积神经网络 (CNN)" 
                    secondary="利用卷积层提取图像特征，是图像识别的基础架构"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CodeIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="残差网络 (ResNet)" 
                    secondary="通过残差连接解决深层网络的梯度消失问题，提高训练效果"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CodeIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="YOLO (You Only Look Once)" 
                    secondary="实时目标检测算法，可同时进行定位和分类，适合实时应用场景"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 工作原理部分 */}
      <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
        2. 算法工作原理
      </Typography>
      <Accordion sx={{ mb: 2, border: '1px solid #e1e4e8', boxShadow: 'none' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            卷积神经网络 (CNN) 工作原理
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" paragraph>
                卷积神经网络是深度学习中最常用的图像处理架构，其核心组件包括：
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  主要层级结构：
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="卷积层 (Convolutional Layer)" 
                      secondary="使用卷积核在图像上滑动，提取局部特征，如边缘、纹理等"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="池化层 (Pooling Layer)" 
                      secondary="降低特征图尺寸，减少计算量，同时提高模型对位置变化的鲁棒性"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="全连接层 (Fully Connected Layer)" 
                      secondary="将特征映射到最终的分类空间，完成分类任务"
                    />
                  </ListItem>
                </List>
              </Box>
              <Typography variant="body2" paragraph>
                CNN的优势在于能够自动学习图像的层次化特征，从低级特征（如边缘、颜色）到高级特征（如形状、物体部分），最终实现对整个物体的识别。
              </Typography>
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f6f8fa', 
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                mb: 2
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  CNN伪代码示例：
                </Typography>
                <pre style={{ margin: 0, overflow: 'auto' }}>
{`# 定义一个简单的CNN模型
def create_cnn_model(input_shape, num_classes):
    model = Sequential()
    
    # 第一个卷积块
    model.add(Conv2D(32, (3, 3), padding='same', input_shape=input_shape))
    model.add(Activation('relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))
    
    # 第二个卷积块
    model.add(Conv2D(64, (3, 3), padding='same'))
    model.add(Activation('relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))
    
    # 分类器部分
    model.add(Flatten())
    model.add(Dense(512))
    model.add(Activation('relu'))
    model.add(Dense(num_classes))
    model.add(Activation('softmax'))
    
    return model`}
                </pre>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mb: 2, border: '1px solid #e1e4e8', boxShadow: 'none' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            支持向量机 (SVM) 工作原理
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            支持向量机是一种强大的分类算法，特别适合处理高维特征空间中的分类问题。
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              核心概念：
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="最大间隔超平面" 
                  secondary="SVM寻找能够以最大间隔分离不同类别的超平面，增强模型泛化能力"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="支持向量" 
                  secondary="位于决策边界附近的数据点，它们决定了超平面的位置和方向"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="核技巧" 
                  secondary="通过核函数将数据映射到高维空间，解决线性不可分问题"
                />
              </ListItem>
            </List>
          </Box>
          <Typography variant="body2" paragraph>
            在图像识别中，SVM通常与手工设计的特征提取器（如SIFT、HOG）结合使用，对于中小规模数据集仍有较好表现。
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mb: 2, border: '1px solid #e1e4e8', boxShadow: 'none' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            支持向量机 (SVM) 工作原理
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            支持向量机是一种强大的分类算法，特别适合处理高维特征空间中的分类问题。
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              核心概念：
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="最大间隔超平面" 
                  secondary="SVM寻找能够以最大间隔分离不同类别的超平面，增强模型泛化能力"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="支持向量" 
                  secondary="位于决策边界附近的数据点，它们决定了超平面的位置和方向"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="核技巧" 
                  secondary="通过核函数将数据映射到高维空间，解决线性不可分问题"
                />
              </ListItem>
            </List>
          </Box>
          <Typography variant="body2" paragraph>
            在图像识别中，SVM通常与手工设计的特征提取器（如SIFT、HOG）结合使用，对于中小规模数据集仍有较好表现。
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* 算法比较部分 */}
      <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
        3. 算法优缺点比较
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4, border: '1px solid #e1e4e8', boxShadow: 'none' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f6f8fa' }}>
              <TableCell><strong>算法</strong></TableCell>
              <TableCell><strong>优点</strong></TableCell>
              <TableCell><strong>缺点</strong></TableCell>
              <TableCell><strong>适用场景</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>SVM</TableCell>
              <TableCell>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary="小样本学习能力强" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary="泛化能力好" />
                  </ListItem>
                </List>
              </TableCell>
              <TableCell>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CancelOutlinedIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="计算复杂度高" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CancelOutlinedIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="特征工程依赖性强" />
                  </ListItem>
                </List>
              </TableCell>
              <TableCell>数据量小、特征维度高的分类问题</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>CNN</TableCell>
              <TableCell>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary="自动特征提取" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary="高精度识别能力" />
                  </ListItem>
                </List>
              </TableCell>
              <TableCell>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CancelOutlinedIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="需要大量训练数据" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CancelOutlinedIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="计算资源需求高" />
                  </ListItem>
                </List>
              </TableCell>
              <TableCell>大规模图像分类、复杂特征提取</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>YOLO</TableCell>
              <TableCell>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary="实时检测能力" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary="同时进行定位和分类" />
                  </ListItem>
                </List>
              </TableCell>
              <TableCell>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CancelOutlinedIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="小目标检测精度较低" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CancelOutlinedIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="密集目标场景表现不佳" />
                  </ListItem>
                </List>
              </TableCell>
              <TableCell>实时目标检测、移动设备应用</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* 农业领域应用案例 */}
      <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
        4. 在农业领域的应用案例
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', border: '1px solid #e1e4e8', boxShadow: 'none' }}>
            <CardContent>
              <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                罗汉果花期识别
              </Typography>
              <Typography variant="body2" paragraph>
                利用深度学习模型对罗汉果花的不同生长阶段进行识别和分类，帮助农户确定最佳授粉和采收时间。
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  应用价值：
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary="提高授粉成功率，增加产量" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary="优化人力资源配置，降低生产成本" />
                  </ListItem>
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', border: '1px solid #e1e4e8', boxShadow: 'none' }}>
            <CardContent>
              <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                病虫害早期检测
              </Typography>
              <Typography variant="body2" paragraph>
                结合图像识别技术，对罗汉果植株的病虫害进行早期检测和诊断，实现精准防治。
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  应用价值：
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary="减少农药使用，降低环境污染" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary="提高作物健康水平，保障产量质量" />
                  </ListItem>
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 总结部分 */}
      <Paper sx={{ 
        p: 3, 
        border: '1px solid #e1e4e8',
        borderRadius: '6px',
        boxShadow: '0 1px 0 rgba(27, 31, 35, 0.04)',
        mt: 2
      }}>
        <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
          总结与展望
        </Typography>
        <Typography variant="body2" paragraph>
          图像识别和分类算法在农业领域具有广阔的应用前景，特别是在罗汉果种植过程中，可以帮助农户实现精准化、智能化管理。随着算法的不断优化和硬件设备的普及，这些技术将更加贴近农业生产实际，为农业现代化提供有力支持。
        </Typography>
        <Typography variant="body2">
          未来，我们将继续优化算法性能，提高识别准确率，并探索更多应用场景，为罗汉果产业的可持续发展贡献力量。
        </Typography>
      </Paper>

      {/* 深度学习分类模型对比 */}
      <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
        5. 深度学习分类模型对比
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4, border: '1px solid #e1e4e8', boxShadow: 'none' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f6f8fa' }}>
              <TableCell><strong>模型</strong></TableCell>
              <TableCell><strong>特点</strong></TableCell>
              <TableCell><strong>优势</strong></TableCell>
              <TableCell><strong>局限性</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>ResNet</TableCell>
              <TableCell>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <ListItemText primary="采用残差连接" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText primary="深层网络架构" />
                  </ListItem>
                </List>
              </TableCell>
              <TableCell>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary="精度高" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary="特征提取能力强" />
                  </ListItem>
                </List>
              </TableCell>
              <TableCell>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CancelOutlinedIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="计算量大" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CancelOutlinedIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="部署成本高" />
                  </ListItem>
                </List>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>MobileNet</TableCell>
              <TableCell>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <ListItemText primary="深度可分离卷积" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText primary="轻量级设计" />
                  </ListItem>
                </List>
              </TableCell>
              <TableCell>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary="运行速度快" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary="模型体积小" />
                  </ListItem>
                </List>
              </TableCell>
              <TableCell>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CancelOutlinedIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="精度略低" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CancelOutlinedIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="复杂场景表现欠佳" />
                  </ListItem>
                </List>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>EfficientNet</TableCell>
              <TableCell>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <ListItemText primary="复合缩放方法" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText primary="自动架构搜索" />
                  </ListItem>
                </List>
              </TableCell>
              <TableCell>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary="精度与效率平衡" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText primary="资源利用率高" />
                  </ListItem>
                </List>
              </TableCell>
              <TableCell>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CancelOutlinedIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="训练时间长" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CancelOutlinedIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="超参数调优复杂" />
                  </ListItem>
                </List>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* 模型投票策略 */}
      <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
        6. 模型投票策略
      </Typography>
      <Paper sx={{ p: 3, border: '1px solid #e1e4e8', borderRadius: '6px', boxShadow: 'none', mb: 4 }}>
        <Typography variant="body1" paragraph>
          在本项目中，我们采用了模型投票策略来提高分类的准确性和鲁棒性。具体实现如下：
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            投票机制：
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="多模型集成" 
                secondary="同时使用ResNet、MobileNet和EfficientNet进行预测，综合多个模型的优势"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="加权投票" 
                secondary="根据各个模型的置信度进行加权，提高准确率较高的模型的影响力"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="阈值筛选" 
                secondary="设置置信度阈值，过滤掉低置信度的预测结果，提高系统可靠性"
              />
            </ListItem>
          </List>
        </Box>
        <Typography variant="body1" paragraph>
          通过模型投票策略，我们成功将分类准确率提高了约5%，同时显著减少了误分类的情况。这种方法特别适合农业场景，因为在实际应用中，准确性和稳定性都是至关重要的。
        </Typography>
      </Paper>
    </Box>
    );
};

export default AlgorithmIntroduction;