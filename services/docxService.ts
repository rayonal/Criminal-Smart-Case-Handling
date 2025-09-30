import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Header,
  AlignmentType,
  BorderStyle,
  WidthType,
  Table,
  TableRow,
  TableCell,
  VerticalAlign,
} from 'docx';
import saveAs from 'file-saver';
import { CaseGuide, LawFirmIdentity, ClientIdentity, GuideStep } from '../types';

const createHeader = (identity: LawFirmIdentity): Header => {
    return new Header({
        children: [
            new Table({
                width: {
                    size: 100,
                    type: WidthType.PERCENTAGE,
                },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({ text: identity.firmName, bold: true, size: 28, font: "Arial" }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({ text: identity.address, font: "Arial", size: 24 }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({ text: `Telp: ${identity.phone} | Email: ${identity.email}`, font: "Arial", size: 24 }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                ],
                                verticalAlign: VerticalAlign.CENTER,
                                borders: {
                                    bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                                    top: { style: BorderStyle.NONE },
                                    left: { style: BorderStyle.NONE },
                                    right: { style: BorderStyle.NONE },
                                },
                            }),
                        ],
                    }),
                ],
            }),
            new Paragraph(" "), // Spacer
        ],
    });
};

const createClientInfo = (clientIdentity?: Partial<ClientIdentity>): Paragraph[] => {
    if (!clientIdentity || Object.values(clientIdentity).every(v => !v)) return [];

    const info: Paragraph[] = [
        new Paragraph({
            text: "INFORMASI KLIEN",
            heading: HeadingLevel.HEADING_2,
            style: "Heading2",
        })
    ];
    
    const addInfo = (label: string, value?: string) => {
        if (value) {
            info.push(new Paragraph({
                children: [
                    new TextRun({ text: `${label}\t: `, bold: true }),
                    new TextRun(value)
                ]
            }));
        }
    };
    
    addInfo("Nama Lengkap", clientIdentity.nama);
    addInfo("NIK", clientIdentity.nik);
    const tglLahir = [clientIdentity.tempatLahir, clientIdentity.tanggalLahir].filter(Boolean).join(', ');
    addInfo("Tempat/Tgl Lahir", tglLahir);
    addInfo("Jenis Kelamin", clientIdentity.jenisKelamin);
    addInfo("Agama", clientIdentity.agama);
    addInfo("Kewarganegaraan", clientIdentity.kewarganegaraan);
    addInfo("Pekerjaan", clientIdentity.pekerjaan);
    addInfo("Alamat", clientIdentity.alamat);
    addInfo("Pendidikan", clientIdentity.pendidikan);
    
    info.push(new Paragraph(" ")); // Spacer
    return info;
};

const createStepContent = (step: GuideStep): Paragraph[] => {
    const content: Paragraph[] = [
        new Paragraph({
            text: step.tahap,
            heading: HeadingLevel.HEADING_2,
            style: "Heading2",
        }),
        new Paragraph({ text: step.deskripsi }),
        new Paragraph(" "), // Spacer
        new Paragraph({
            children: [new TextRun({ text: "Dokumen Penting:", bold: true, underline: {} })],
        }),
    ];
    
    step.dokumenPenting.forEach(doc => {
        content.push(new Paragraph({
            text: doc,
            bullet: { level: 0 },
        }));
    });

    content.push(new Paragraph(" ")); // Spacer
    content.push(new Paragraph({
        children: [new TextRun({ text: "Tips Strategis:", bold: true, underline: {} })],
    }));
    content.push(new Paragraph({ text: step.tips }));
    content.push(new Paragraph(" ")); // Extra spacer

    return content;
};


export const downloadDocx = (guide: CaseGuide, identity: LawFirmIdentity, clientIdentity?: Partial<ClientIdentity>): void => {
  const doc = new Document({
    sections: [{
      headers: {
        default: createHeader(identity),
      },
      children: [
        new Paragraph({
            text: guide.judulPanduan,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph(" "), // Spacer after title
        ...createClientInfo(clientIdentity),
        ...guide.tahapan.flatMap((step) => createStepContent(step)),
      ],
    }],
     styles: {
        default: {
            document: {
                run: {
                    font: "Arial",
                    size: 24, // 12pt
                },
            },
            paragraph: {
                alignment: AlignmentType.JUSTIFIED,
            },
        },
        paragraphStyles: [
            {
                id: "Heading2",
                name: "Heading 2",
                basedOn: "Normal",
                next: "Normal",
                run: {
                    size: 28, // 14pt
                    bold: true,
                    color: "2E74B5",
                },
                paragraph: {
                    alignment: AlignmentType.LEFT,
                    spacing: { after: 120, before: 240 },
                },
            },
        ],
    },
  });

  Packer.toBlob(doc).then(blob => {
    const clientName = guide.clientName || 'Klien';
    // Sanitize invalid filename characters but allow spaces
    const sanitizedClientName = clientName.replace(/[/\\?%*:|"<>]/g, '_');
    const filename = `Panduan Pendampingan Pidana - ${sanitizedClientName}.docx`;
    saveAs(blob, filename);
  });
};

export const downloadEksepsiDocx = (
  draftContent: string, 
  identity: LawFirmIdentity, 
  clientName?: string
): void => {
  const doc = new Document({
    styles: {
        default: {
            document: {
                run: {
                    font: "Arial",
                    size: 24, // 12pt
                },
            },
            paragraph: {
                alignment: AlignmentType.JUSTIFIED,
            },
        },
    },
    sections: [{
      headers: {
        default: createHeader(identity),
      },
      children: [
        new Paragraph(" "), // Spacer
        ...draftContent.split('\n').map(line => {
          // Simple logic to make lines that look like headings bold and centered
          if (line.trim().length > 0 && line.trim().length < 50 && line.trim() === line.trim().toUpperCase() && !line.trim().includes(':')) {
            return new Paragraph({
              children: [new TextRun({ text: line, bold: true })],
              spacing: { before: 240, after: 120 },
              alignment: AlignmentType.CENTER,
            });
          }
          // All other paragraphs will inherit the default styles (Arial, 12pt, Justified)
          return new Paragraph({
              text: line,
          });
        }),
      ],
    }],
  });

  Packer.toBlob(doc).then(blob => {
    const filename = `Eksepsi ${clientName || 'Klien'}.docx`;
    saveAs(blob, filename.replace(/[ /\\?%*:|"<>]/g, '_'));
  });
};