import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
} from 'docx';
import { CaseGuide, LawFirmIdentity, GuideStep } from '../types';

export const createDocxFromGuide = async (guide: CaseGuide, identity: LawFirmIdentity): Promise<Blob> => {
  const sections = [];

  // 1. Law Firm Identity / Header
  if (identity.firmName || identity.address || identity.phone || identity.email) {
    if (identity.firmName) {
      sections.push(new Paragraph({
        children: [new TextRun({ text: identity.firmName.toUpperCase(), bold: true, size: 28 })],
        alignment: AlignmentType.CENTER,
      }));
    }
    if (identity.address) {
      sections.push(new Paragraph({
        children: [new TextRun({ text: identity.address, size: 22 })],
        alignment: AlignmentType.CENTER,
      }));
    }
    const phoneAndEmail = [identity.phone, identity.email].filter(Boolean).join(' | ');
    if (phoneAndEmail) {
       sections.push(new Paragraph({
        children: [new TextRun({ text: phoneAndEmail, size: 22 })],
        alignment: AlignmentType.CENTER,
      }));
    }
    // Add a border as a separator
     sections.push(new Paragraph({
        text: "",
        border: { bottom: { color: "auto", space: 1, value: "single", size: 6 } },
        spacing: { after: 400 },
     }));
  }
  
  // 2. Main Guide Title
  sections.push(new Paragraph({
      text: guide.judulPanduan.toUpperCase(),
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 500 },
  }));

  // 3. Guide Steps
  guide.tahapan.forEach((step: GuideStep) => {
    // Step Title
    sections.push(new Paragraph({
      children: [
        new TextRun({ text: step.tahap.toUpperCase(), bold: true, size: 24 }),
      ],
      spacing: { before: 400, after: 200 },
    }));

    // Description
    sections.push(new Paragraph({
      children: [new TextRun({ text: step.deskripsi, size: 22 })],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 },
    }));

    // Important Documents
    sections.push(new Paragraph({
      children: [new TextRun({ text: 'Dokumen Penting:', bold: true, size: 22 })],
      spacing: { before: 200, after: 100 },
    }));
    step.dokumenPenting.forEach((doc: string) => {
      sections.push(new Paragraph({
        text: doc,
        bullet: { level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        indent: { left: 720 }, // 0.5 inch indent
      }));
    });

    // Strategic Tips
    sections.push(new Paragraph({
      children: [new TextRun({ text: 'Tips Strategis:', bold: true, size: 22 })],
      spacing: { before: 200, after: 100 },
    }));
    sections.push(new Paragraph({
      children: [new TextRun({ text: step.tips, italics: true, size: 22 })],
      alignment: AlignmentType.JUSTIFIED,
    }));
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Arial",
            size: 22, // 11pt
          },
        },
      },
    },
    sections: [{
      properties: {},
      children: sections,
    }],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
};