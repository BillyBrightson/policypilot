/**
 * Policy Export Utilities
 * 
 * Functions to export policies as PDF and DOCX
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";

/**
 * Convert HTML to plain text (simple version)
 */
function htmlToText(html: string): string {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

/**
 * Convert HTML to plain text with basic formatting
 */
function htmlToTextFormatted(html: string): string {
  // Remove HTML tags but preserve line breaks
  let text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<h[1-6]>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Clean up multiple newlines
  text = text.replace(/\n{3,}/g, "\n\n");
  
  return text.trim();
}

/**
 * Export policy as PDF
 */
export async function exportToPDF(title: string, content: string): Promise<void> {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;

  // Add title
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  const titleLines = pdf.splitTextToSize(title, maxWidth);
  let y = margin + 10;
  pdf.text(titleLines, margin, y);
  y += titleLines.length * 10 + 10;

  // Add content
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  const text = htmlToTextFormatted(content);
  const lines = pdf.splitTextToSize(text, maxWidth);

  for (let i = 0; i < lines.length; i++) {
    if (y > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
    pdf.text(lines[i], margin, y);
    y += 7;
  }

  // Save
  pdf.save(`${title.replace(/\s+/g, "_")}.pdf`);
}

/**
 * Export policy as DOCX
 */
export async function exportToDOCX(title: string, content: string): Promise<void> {
  // Convert HTML content to DOCX paragraphs
  const paragraphs: Paragraph[] = [];

  // Add title
  paragraphs.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    })
  );

  // Parse HTML and convert to paragraphs
  const tmp = document.createElement("DIV");
  tmp.innerHTML = content;

  // Helper to process text nodes and inline formatting
  const processInlineNodes = (element: HTMLElement): TextRun[] => {
    const runs: TextRun[] = [];
    let currentText = "";

    const processNode = (node: Node, isBold = false, isItalic = false): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        currentText += node.textContent || "";
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tagName = el.tagName.toLowerCase();

        // Save current text before processing nested element
        if (currentText) {
          runs.push(new TextRun({ text: currentText, bold: isBold, italics: isItalic }));
          currentText = "";
        }

        // Process nested elements
        if (tagName === "strong" || tagName === "b") {
          Array.from(el.childNodes).forEach((child) => processNode(child, true, isItalic));
        } else if (tagName === "em" || tagName === "i") {
          Array.from(el.childNodes).forEach((child) => processNode(child, isBold, true));
        } else {
          Array.from(el.childNodes).forEach((child) => processNode(child, isBold, isItalic));
        }
      }
    };

    Array.from(element.childNodes).forEach((node) => processNode(node));
    
    // Add any remaining text
    if (currentText) {
      runs.push(new TextRun({ text: currentText }));
    }

    return runs.length > 0 ? runs : [new TextRun({ text: element.textContent || "" })];
  };

  // Process all top-level elements
  Array.from(tmp.children).forEach((element) => {
    const tagName = element.tagName.toLowerCase();

    if (tagName === "h1") {
      paragraphs.push(
        new Paragraph({
          text: element.textContent || "",
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        })
      );
    } else if (tagName === "h2") {
      paragraphs.push(
        new Paragraph({
          text: element.textContent || "",
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 150 },
        })
      );
    } else if (tagName === "h3") {
      paragraphs.push(
        new Paragraph({
          text: element.textContent || "",
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 120 },
        })
      );
    } else if (tagName === "p") {
      const runs = processInlineNodes(element as HTMLElement);
      paragraphs.push(
        new Paragraph({
          children: runs,
          spacing: { after: 100 },
        })
      );
    } else if (tagName === "ul") {
      const items = element.querySelectorAll("li");
      items.forEach((item) => {
        const runs = processInlineNodes(item as HTMLElement);
        paragraphs.push(
          new Paragraph({
            children: runs,
            bullet: { level: 0 },
            spacing: { after: 80 },
          })
        );
      });
    } else if (tagName === "ol") {
      const items = element.querySelectorAll("li");
      items.forEach((item, index) => {
        const runs = processInlineNodes(item as HTMLElement);
        // For ordered lists, just add the number manually
        const numberedText = `${index + 1}. ${item.textContent || ""}`;
        paragraphs.push(
          new Paragraph({
            text: numberedText,
            spacing: { after: 80 },
          })
        );
      });
    } else {
      // For any other element, just extract text
      const text = element.textContent?.trim();
      if (text) {
        paragraphs.push(
          new Paragraph({
            text: text,
            spacing: { after: 100 },
          })
        );
      }
    }
  });

  // If no paragraphs were created, add the plain text
  if (paragraphs.length === 1) {
    const text = htmlToTextFormatted(content);
    const lines = text.split("\n\n").filter((line) => line.trim());
    lines.forEach((line) => {
      paragraphs.push(
        new Paragraph({
          text: line.trim(),
          spacing: { after: 100 },
        })
      );
    });
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        children: paragraphs,
      },
    ],
  });

  // Generate and save
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title.replace(/\s+/g, "_")}.docx`);
}

