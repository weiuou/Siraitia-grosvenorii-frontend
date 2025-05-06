import { HistoryItem } from '../types/history';
import * as XLSX from 'xlsx-js-style';
import JSZip from 'jszip';

export const exportToExcel = async (records: HistoryItem[], filename: string) => {
  try {
    const zip = new JSZip();
    const imagesFolder = zip.folder("images");
    
    // 准备数据和保存图片
    const data = await Promise.all(records.map(async (record, index) => {
      try {
        const response = await fetch(record.imageUrl);
        const blob = await response.blob();
        const imageFilename = `image_${index + 1}.png`;
        imagesFolder?.file(imageFilename, blob);

        return {
          日期: record.date || '',
          花朵数量: record.result?.flowers?.length || 0,
          主要类别: record.result?.flowers?.[0]?.final_class?.class_id || '',
          置信度: record.result?.flowers?.[0]?.final_class?.confidence 
            ? `${(record.result.flowers[0].final_class.confidence * 100).toFixed(2)}%` 
            : '',
          图片文件名: {
            v: imageFilename,
            l: { Target: `images/${imageFilename}` },
            s: {
              alignment: { horizontal: 'center' },
              font: { color: { rgb: "0000FF" }, underline: true }
            }
          }
        };
      } catch (error) {
        console.error('处理图片失败:', error);
        return null;
      }
    }));

    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(
      data.filter(Boolean),
      { header: ['日期', '类别', '置信度', '生长阶段', '预计采摘时间', '健康状况', '图片文件名'] }
    );

    // 设置单元格样式
    ws['!cols'] = [
      { width: 20 }, // 日期
      { width: 15 }, // 类别
      { width: 10 }, // 置信度
      { width: 15 }, // 生长阶段
      { width: 15 }, // 预计采摘时间
      { width: 15 }, // 健康状况
      { width: 20 }, // 图片文件名
    ];

    // 为每个单元格添加样式
    for (let i = 0; i < data.length; i++) {
      const row = i + 2; // 跳过表头
      const range = XLSX.utils.encode_cell({ r: row - 1, c: 6 }); // 图片文件名列
      if (!ws[range].l) { // 如果没有链接属性，添加默认样式
        ws[range].s = {
          alignment: { horizontal: 'center' },
          font: { color: { rgb: "000000" } }
        };
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "识别记录");
    
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

export const exportToJSON = (records: HistoryItem[], filename: string) => {
  try {
    const dataStr = JSON.stringify(records, null, 2);
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
