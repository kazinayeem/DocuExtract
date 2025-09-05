import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  WidthType,
} from "docx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "@/utils/SolaimanLipi_20-04-07-normal.js";

// JSON extractor
export function extractJSON(raw: string): any | null {
  try {
    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("JSON parse failed:", err);
    return null;
  }
}

// Helper: build rows from cash memo
function buildMemoRows(memo: any): any[][] {
  return [
    ["Shop Name:", memo.shop?.name || ""],
    ["Tagline:", memo.shop?.tagline || ""],
    ["Address:", memo.shop?.address || ""],
    ["Phone:", memo.shop?.phone || "", "Cell:", memo.shop?.cell || ""],
    [],
    ["Cash Memo No:", memo.number || "", "Date:", memo.date || ""],
    [],
    ["Customer Name:", memo.customer?.name || ""],
    ["Customer Address:", memo.customer?.address || ""],
    ["Customer Number:", memo.customer?.number || ""],
    [],
    ["Products:"],
    ["Sl No", "Description", "Size", "Quantity", "Rate", "Amount"],
    ...(memo.products?.map((p: any) => [
      p.slNo,
      p.description,
      p.size,
      p.quantity,
      p.rate,
      p.amount,
    ]) || []),
    [],
    ["Total:", memo.totals?.total || ""],
    ["Advance:", memo.totals?.advance || ""],
    ["Balance:", memo.totals?.balance || ""],
    ["In Words:", memo.inWords || ""],
    [],
    ["Delivery:", memo.footer?.delivery || ""],
    ["Note:", memo.footer?.note || ""],
    ["Received By:", memo.footer?.receivedBy || ""],
  ];
}

// XLSX Export
export function exportCashMemoToExcel(data: any) {
  if (!data?.cashMemo) return;
  const memo = data.cashMemo;
  const rows = buildMemoRows(memo);
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const colWidths = rows[0].map((_: any, i: number) => ({
    wch: Math.max(...rows.map((r) => (r[i] ? r[i].toString().length : 10))),
  }));
  sheet["!cols"] = colWidths;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Cash Memo");
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([excelBuffer], { type: "application/octet-stream" }),
    `cash_memo_${memo.number || "data"}.xlsx`
  );
}

// CSV Export
export function exportCashMemoToCSV(data: any) {
  if (!data?.cashMemo) return;
  const rows = buildMemoRows(data.cashMemo);
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(sheet);
  saveAs(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    `cash_memo_${data.cashMemo.number || "data"}.csv`
  );
}

// JSON Export
export function exportCashMemoToJSON(data: any) {
  if (!data?.cashMemo) return;
  const jsonStr = JSON.stringify(data.cashMemo, null, 2);
  saveAs(
    new Blob([jsonStr], { type: "application/json;charset=utf-8" }),
    `cash_memo_${data.cashMemo.number || "data"}.json`
  );
}

// PDF Export

// Helper to check for Bangla characters
function containsBangla(text: string) {
  return /[\u0980-\u09FF]/.test(text); // Check for Bangla Unicode range
}

export function exportCashMemoToPDF(data: { cashMemo?: any }) {
  const memo = data.cashMemo;
  if (!memo) return;

  const doc = new jsPDF("p", "mm", "a4"); // The font is already added globally by the import, // so we just need to set it.

  doc.setFont("SolaimanLipi"); // Helper to select font based on content

  const chooseFont = (text: string) =>
    containsBangla(text) ? "SolaimanLipi" : "helvetica"; // --- Header --- // Use the chooseFont helper for all potentially Bangla text

  doc.setFont(chooseFont(memo.shop?.name || ""), "bold");
  doc.setFontSize(16);
  doc.text(memo.shop?.name || "Shop Name", 105, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont(chooseFont(memo.shop?.tagline || ""), "normal");
  if (memo.shop?.tagline)
    doc.text(memo.shop.tagline, 105, 26, { align: "center" });

  doc.setFont(chooseFont(memo.shop?.address || ""), "normal");
  if (memo.shop?.address)
    doc.text(`Address: ${memo.shop.address}`, 105, 32, { align: "center" }); // --- Memo Info ---

  doc.setFont("helvetica", "bold");
  doc.text(`Cash Memo No: ${memo.number || ""}`, 14, 50);
  doc.text(`Date: ${memo.date || ""}`, 150, 50); // --- Customer Info ---

  doc.setFont(chooseFont(memo.customer?.name || ""), "normal");
  doc.text(`Customer: ${memo.customer?.name || ""}`, 14, 58);

  doc.setFont(chooseFont(memo.customer?.address || ""), "normal");
  if (memo.customer?.address)
    doc.text(`Address: ${memo.customer.address}`, 14, 64); // --- Products Table ---

  const tableColumns = [
    "Sl No",
    "Description",
    "Size",
    "Quantity",
    "Rate",
    "Amount",
  ];

  interface TableRow {
    slNo: number | string;
    description: string;
    size?: string;
    quantity: number;
    rate: number;
    amount: number;
  }

  const tableRows: (string | number)[][] = (
    (memo.products as TableRow[]) || []
  ).map((p: TableRow) => [
    p.slNo,
    p.description,
    p.size || "-",
    String(p.quantity || 0),
    String((+p.rate || 0).toFixed(2)),
    String((+p.amount || 0).toFixed(2)),
  ]);

  let finalY = 75;
  if (tableRows.length > 0) {
    autoTable(doc, {
      startY: finalY,
      head: [tableColumns],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [30, 144, 255],
        textColor: 255,
        fontStyle: "bold", // Setting the font here is good, but you also need to set it for the body
        font: "SolaimanLipi",
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: {
        // ⭐ This is the crucial fix!
        font: "SolaimanLipi",
        fontSize: 10,
        cellPadding: 3,
      },
      margin: { left: 14, right: 14 },
    });
    const lastAutoTable = (
      doc as typeof doc & { lastAutoTable?: { finalY: number } }
    ).lastAutoTable;
    finalY = lastAutoTable ? lastAutoTable.finalY + 10 : finalY;
  } // --- Totals ---

  const total = +memo.totals?.total || 0;
  const advance = +memo.totals?.advance || 0;
  const balance = +memo.totals?.balance || 0;

  doc.text(`Total: ${total.toFixed(2)}`, 150, finalY);
  finalY += 6;
  doc.text(`Advance: ${advance.toFixed(2)}`, 150, finalY);
  finalY += 6;
  doc.text(`Balance: ${balance.toFixed(2)}`, 150, finalY); // --- Footer ---

  finalY += 10; // Use the chooseFont helper here as well
  doc.setFont(chooseFont(memo.footer?.note || ""), "normal");
  if (memo.footer?.note) doc.text(`Note: ${memo.footer.note}`, 14, finalY); // Use the chooseFont helper here as well

  doc.setFont(chooseFont(memo.footer?.receivedBy || ""), "normal");
  if (memo.footer?.receivedBy)
    doc.text(`Received By: ${memo.footer.receivedBy}`, 150, finalY);

  doc.save(`cash_memo_${memo.number || "data"}.pdf`);
}

// XML Export
export function exportCashMemoToXML(data: any) {
  if (!data?.cashMemo) return;
  const memo = data.cashMemo;

  function objToXml(obj: any, tagName = "memo") {
    let xml = `<${tagName}>`;
    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        xml += obj[key].map((item: any) => objToXml(item, key)).join("");
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        xml += objToXml(obj[key], key);
      } else {
        xml += `<${key}>${obj[key]}</${key}>`;
      }
    }
    xml += `</${tagName}>`;
    return xml;
  }

  const xmlStr = objToXml(memo);
  saveAs(
    new Blob([xmlStr], { type: "application/xml;charset=utf-8" }),
    `cash_memo_${memo.number || "data"}.xml`
  );
}

// Word Export (DOCX)

export async function exportCashMemoToWord(data: any) {
  if (!data?.cashMemo) return;
  const memo = data.cashMemo;

  // Function to create a table row for products
  interface Product {
    slNo: number | string;
    description: string;
    size?: string;
    quantity: number;
    rate: number;
    amount: number;
  }

  const productRows: TableRow[] = ((memo.products as Product[]) || []).map(
    (p: Product) => {
      return new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph(String(p.slNo))],
          }),
          new TableCell({
            children: [new Paragraph(p.description)],
          }),
          new TableCell({
            children: [new Paragraph(p.size || "-")],
          }),
          new TableCell({
            children: [new Paragraph(String(p.quantity))],
          }),
          new TableCell({
            children: [new Paragraph(String((+p.rate).toFixed(2)))],
          }),
          new TableCell({
            children: [new Paragraph(String((+p.amount).toFixed(2)))],
          }),
        ],
      });
    }
  );

  const doc = new Document({
    sections: [
      {
        children: [
          // Shop Name
          new Paragraph({
            children: [
              new TextRun({
                text: memo.shop?.name || "Shop Name",
                bold: true,
                size: 32, // Adjust font size as needed
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),

          // Tagline and Address
          new Paragraph({
            children: [
              new TextRun({
                text: memo.shop?.tagline || "",
                size: 20,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Address: ${memo.shop?.address || ""}`,
                size: 20,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),

          // Empty line for spacing
          new Paragraph({ text: "" }),

          // Cash Memo No and Date using a table for alignment
          new Table({
            width: {
              size: 100,
              type: WidthType.DXA,
            },
            columnWidths: [4500, 4500],
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph(`Cash Memo No: ${memo.number || ""}`),
                    ],
                  }),
                  new TableCell({
                    children: [new Paragraph(`Date: ${memo.date || ""}`)],
                  }),
                ],
              }),
            ],
          }),

          // Empty line for spacing
          new Paragraph({ text: "" }),

          // Customer Information
          new Paragraph(`Customer: ${memo.customer?.name || ""}`),
          new Paragraph(`Address: ${memo.customer?.address || ""}`),

          // Empty line for spacing
          new Paragraph({ text: "" }),

          // Products Table
          new Table({
            width: {
              size: 100,
              type: WidthType.DXA,
            },
            // Set table widths for better layout
            columnWidths: [1000, 3000, 1000, 1000, 1500, 1500],
            rows: [
              // Table Header Row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Sl No", bold: true })],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Description", bold: true }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Size", bold: true })],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Quantity", bold: true }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Rate", bold: true })],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Amount", bold: true })],
                      }),
                    ],
                  }),
                ],
              }),
              // Table Body Rows
              ...productRows,
            ],
          }),

          // Totals and footer
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Total: ${(+memo.totals?.total || 0).toFixed(2)}`,
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Advance: ${(+memo.totals?.advance || 0).toFixed(2)}`,
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Balance: ${(+memo.totals?.balance || 0).toFixed(2)}`,
                bold: true,
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),

          new Paragraph({ text: "" }),
          new Paragraph(`In Words: ${memo.inWords || ""}`),
          new Paragraph({ text: "" }),

          // Footer notes
          new Table({
            columnWidths: [4500, 4500],
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph(`Note: ${memo.footer?.note || ""}`),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph(
                        `Received By: ${memo.footer?.receivedBy || ""}`
                      ),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `cash_memo_${memo.number || "data"}.docx`);
}

// Google Sheets (simplified link export via CSV upload)
export function exportCashMemoToGoogleSheets(data: any) {
  if (!data?.cashMemo) return;
  // Google Sheets can import CSV easily
  exportCashMemoToCSV(data);
  alert("CSV exported. Upload this CSV to Google Sheets manually or via API.");
}

// Universal export
export async function exportCashMemo(data: any, format: string = "xlsx") {
  switch (format.toLowerCase()) {
    case "xlsx":
      exportCashMemoToExcel(data);
      break;
    case "csv":
      exportCashMemoToCSV(data);
      break;
    case "json":
      exportCashMemoToJSON(data);
      break;
    case "pdf":
      exportCashMemoToPDF(data);
      break;
    case "xml":
      exportCashMemoToXML(data);
      break;
    case "docx":
    case "word":
      await exportCashMemoToWord(data);
      break;
    case "gsheet":
      exportCashMemoToGoogleSheets(data);
      break;
    default:
      console.warn("Unsupported format. Defaulting to Excel.");
      exportCashMemoToExcel(data);
  }
}
