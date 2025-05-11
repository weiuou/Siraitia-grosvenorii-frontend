import { HistoryItem } from '../types/history';
import * as XLSX from 'xlsx-js-style';
import JSZip from 'jszip';

// 创建一个函数用于剪裁图片
const cropImage = async (imageUrl: string, bbox: { x: number; y: number; width: number; height: number }) => {
  return new Promise<Blob>(async (resolve, reject) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = bbox.width;
        canvas.height = bbox.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法获取canvas上下文'));
          return;
        }
        ctx.drawImage(img, bbox.x, bbox.y, bbox.width, bbox.height, 0, 0, bbox.width, bbox.height);
        canvas.toBlob(blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('无法创建Blob对象'));
          }
        }, 'image/png');
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = imageUrl;
    } catch (error) {
      reject(error);
    }
  });
};

const calculateStatistics = (records: HistoryItem[]) => {
  // 计算平均置信度
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
  const averageConfidence = count > 0 ? (totalConfidence / count * 100).toFixed(2) : 0;

  // 计算置信度分布
  const confidenceDistribution = [
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
        confidenceDistribution[index].count++;
      }
    });
  });

  // 计算类别分布
  const classDistribution = new Map<string, number>();
  records.forEach(record => {
    record.result?.flowers?.forEach(flower => {
      const className = flower.final_class.class_name;
      classDistribution.set(className, (classDistribution.get(className) || 0) + 1);
    });
  });

  return {
    averageConfidence,
    confidenceDistribution,
    classDistribution: Array.from(classDistribution.entries()).map(([name, value]) => ({
      name,
      value
    }))
  };
};

export const exportToExcel = async (records: HistoryItem[], filename: string, includeStats: boolean = true) => {
  try {
    const zip = new JSZip();
    const imagesFolder = zip.folder("images");
    
    // 准备数据和保存图片
    const data = await Promise.all(records.flatMap(async (record, index) => {
      try {
        console.log(record)
        if (!record.result?.flowers?.length) {
          const response = await fetch(record.imageUrl);
          const blob = await response.blob();
          const imageFilename = `image_${index + 1}.png`;
          imagesFolder?.file(imageFilename, blob);
        } else {
          await Promise.all(record.result.flowers.map(async (flower, flowerIndex) => {
            try {
              const imageFilename = `image_${index + 1}_flower_${flowerIndex + 1}.png`;
              // 将{x1,y1,x2,y2}格式转换为{x,y,width,height}格式
              const convertedBbox = {
                x: flower.bbox.x1,
                y: flower.bbox.y1,
                width: flower.bbox.x2 - flower.bbox.x1,
                height: flower.bbox.y2 - flower.bbox.y1
              };
              const croppedBlob = await cropImage(record.imageUrl, convertedBbox);
              imagesFolder?.file(imageFilename, croppedBlob);
            } catch (error) {
              console.error(`剪裁花朵图片失败: ${error}`);
            }
          }));
        }

        if (!record.result?.flowers?.length) {
          console.log('无识别结果');
          return [{
            日期: record.date || '',
            图片ID: record.id || '',
            花朵序号: 'N/A',
            类别: '无识别结果',
            置信度: 'N/A',
            图片文件名: {
              v: `image_${index + 1}.png`,
              l: { Target: `images/image_${index + 1}.png` },
              s: {
                alignment: { horizontal: 'center' },
                font: { color: { rgb: "0000FF" }, underline: true }
              }
            }
          }];
        }
        console.log(record.result.flowers)
        return record.result.flowers.map((flower, flowerIndex) => ({

          日期: record.date || '',
          图片ID: record.id || '',
          花朵序号: `${flowerIndex + 1}`,
          类别: flower.final_class.class_name || '',
          置信度: flower.bbox.confidence 
            ? `${(flower.bbox.confidence * 100).toFixed(2)}%` 
            : 'N/A',
          图片文件名: {
            v: `image_${index + 1}_flower_${flowerIndex + 1}.png`,
            l: { Target: `images/image_${index + 1}_flower_${flowerIndex + 1}.png` },
            s: {
              alignment: { horizontal: 'center' },
              font: { color: { rgb: "0000FF" }, underline: true }
            }
          }
        }));

      } catch (error) {
        console.error('处理图片失败:', error);
        return null;
      }
    }));
    // 处理数据并展开Promise.all的结果
    const processedData = (await Promise.all(data)).flat().filter(Boolean);
    console.log('处理后的数据:', processedData);

    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(
      processedData,
      { header: ['日期', '图片ID', '花朵序号', '类别', '置信度', '图片文件名'] }
    );

    // 设置单元格样式
    ws['!cols'] = [
      { width: 20 }, // 日期
      { width: 25 }, // 图片ID
      { width: 10 }, // 花朵序号
      { width: 15 }, // 类别
      { width: 10 }, // 置信度
      { width: 20 }  // 图片文件名
    ];

    // 为每个单元格添加样式
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: 5 }); // 图片文件名列（第6列，从0开始）
      if (ws[cellRef] && !ws[cellRef].l) { // 如果单元格存在且没有链接属性
        ws[cellRef].s = {
          alignment: { horizontal: 'center' },
          font: { color: { rgb: "000000" } }
        };
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "识别记录");

    // 添加统计数据
    if (includeStats) {
      const stats = calculateStatistics(records);
      
      // 创建统计数据工作表
      const statsData = [
        ['统计分析数据'],
        [],
        ['平均置信度', `${stats.averageConfidence}%`],
        [],
        ['置信度分布'],
        ['范围', '数量'],
        ...stats.confidenceDistribution.map(item => [item.range, item.count]),
        [],
        ['类别分布'],
        ['类别', '数量'],
        ...stats.classDistribution.map(item => [item.name, item.value])
      ];

      const wsStats = XLSX.utils.aoa_to_sheet(statsData);

      // 设置单元格样式
      wsStats['A1'] = { v: '统计分析数据', s: { font: { bold: true, sz: 14 } } };
      wsStats['A3'] = { v: '平均置信度', s: { font: { bold: true } } };
      wsStats['A5'] = { v: '置信度分布', s: { font: { bold: true } } };
      wsStats['A6'] = { v: '范围', s: { font: { bold: true } } };
      wsStats['B6'] = { v: '数量', s: { font: { bold: true } } };
      wsStats['A9'] = { v: '类别分布', s: { font: { bold: true } } };
      wsStats['A10'] = { v: '类别', s: { font: { bold: true } } };
      wsStats['B10'] = { v: '数量', s: { font: { bold: true } } };

      // 设置列宽
      wsStats['!cols'] = [{ width: 20 }, { width: 15 }];

      XLSX.utils.book_append_sheet(wb, wsStats, "统计分析");
    }
    
    const excelBuffer = XLSX.write(wb, { 
      bookType: 'xlsx', 
      type: 'array',
      cellStyles: true 
    });
    
    zip.file(`${filename}.xlsx`, excelBuffer);

    // 生成ZIP文件
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_with_images.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('导出过程出错:', error);
    throw error;
  }
};

export const exportToJSON = (records: HistoryItem[], filename: string, includeStats: boolean = true) => {
  try {
    const exportData = includeStats
      ? { records, statistics: calculateStatistics(records) }
      : records;
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('JSON导出失败:', error);
    throw new Error('JSON文件导出失败');
  }
};
