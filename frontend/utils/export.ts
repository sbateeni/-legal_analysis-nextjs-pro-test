import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';

export interface ExportStageItem {
  title: string;
  content: string;
}

export interface ExportOptions {
  caseName: string;
  partyRole?: string;
  createdAt?: string;
}

function buildHeaderText(options: ExportOptions): string {
  const parts = [
    `القضية: ${options.caseName || 'غير مسمّاة'}`,
    options.partyRole ? `الصفة: ${options.partyRole}` : undefined,
    `التاريخ: ${new Date(options.createdAt || Date.now()).toLocaleDateString('ar-EG')}`,
  ].filter(Boolean);
  return parts.join(' | ');
}

export function exportResultsToPDF(stages: ExportStageItem[], options: ExportOptions) {
  if (typeof window === 'undefined') return;
  const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('ملخص التحليل القانوني', margin, 64, { align: 'left' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(buildHeaderText(options), margin, 84, { maxWidth });

  let y = 120;
  stages.forEach((s, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const titleText = `${idx + 1}. ${s.title}`;
    doc.text(titleText, margin, y);
    y += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(s.content || '-', maxWidth);
    lines.forEach((line: string) => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 16;
    });

    y += 8;
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  });

  const safeCase = (options.caseName || 'case').replace(/[^\p{L}\p{N}_\- ]/gu, '').slice(0, 50).trim().replace(/\s+/g, '-');
  const dateStr = new Date(options.createdAt || Date.now()).toISOString().slice(0,10);
  const filename = `${safeCase || 'case'}-analysis-${dateStr}.pdf`;
  doc.save(filename);

  // سجل تصدير محلي
  try {
    const logs = JSON.parse(localStorage.getItem('export_logs') || '[]');
    logs.push({ type: 'pdf', caseName: options.caseName, partyRole: options.partyRole, date: new Date().toISOString(), filename });
    if (logs.length > 100) logs.splice(0, logs.length - 100);
    localStorage.setItem('export_logs', JSON.stringify(logs));
  } catch {}
}

export async function exportResultsToDocx(stages: ExportStageItem[], options: ExportOptions) {
  if (typeof window === 'undefined') return;
  const header = buildHeaderText(options);

  const children: Paragraph[] = [
    new Paragraph({
      text: 'ملخص التحليل القانوني',
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({ text: header }),
  ];

  stages.forEach((s, idx) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${idx + 1}. ${s.title}`, bold: true }),
        ],
        spacing: { before: 200, after: 50 },
      }),
    );
    const contentLines = (s.content || '-').split('\n');
    contentLines.forEach((line) => {
      children.push(new Paragraph({ text: line }));
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeCase = (options.caseName || 'case').replace(/[^\p{L}\p{N}_\- ]/gu, '').slice(0, 50).trim().replace(/\s+/g, '-');
  const dateStr = new Date(options.createdAt || Date.now()).toISOString().slice(0,10);
  a.download = `${safeCase || 'case'}-analysis-${dateStr}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  // سجل تصدير محلي
  try {
    const logs = JSON.parse(localStorage.getItem('export_logs') || '[]');
    logs.push({ type: 'docx', caseName: options.caseName, partyRole: options.partyRole, date: new Date().toISOString(), filename: a.download });
    if (logs.length > 100) logs.splice(0, logs.length - 100);
    localStorage.setItem('export_logs', JSON.stringify(logs));
  } catch {}
}


