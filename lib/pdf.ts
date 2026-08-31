"use client";

import { jsPDF } from "jspdf";
import { ADDRESS_LINE, BUSINESS_NAME, EMAIL, PHONE_DISPLAY } from "@/lib/site";

export type DocKind = "quote" | "invoice";

export type DocLine = {
  item: string;
  qty: number;
  price: number;
};

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

function thanksImage() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  canvas.width = 600;
  canvas.height = 120;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "italic 28px 'Brush Script MT', 'Segoe Script', cursive";
  ctx.fillStyle = "#8B5CF6";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ["Thank you", "- Lisa", "(Lisa's Cleaning)"].forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, 8 + i * 34);
  });
  return canvas.toDataURL("image/png");
}

export function downloadLisaPdf(opts: {
  kind: DocKind;
  number: string;
  customer: string;
  address?: string;
  date: string;
  lines: DocLine[];
  includeThanks?: boolean;
}) {
  const doc = new jsPDF();
  const title = opts.kind === "quote" ? "Quote" : "Invoice";
  const total = opts.lines.reduce((sum, line) => sum + line.qty * line.price, 0);

  doc.setFontSize(16);
  doc.text(BUSINESS_NAME, 14, 18);
  doc.setFontSize(11);
  doc.text(ADDRESS_LINE, 14, 26);
  doc.text(`${PHONE_DISPLAY}  ${EMAIL}`, 14, 32);

  doc.setFontSize(18);
  doc.text(title, 196, 18, { align: "right" });
  doc.setFontSize(11);
  doc.text(`${title} ${opts.number}`, 196, 26, { align: "right" });
  doc.text(opts.date, 196, 32, { align: "right" });

  doc.text(`Customer: ${opts.customer}`, 14, 48);
  if (opts.address) doc.text(`Address: ${opts.address}`, 14, 54);

  let y = 70;
  doc.text("Item", 14, y);
  doc.text("Qty", 120, y);
  doc.text("Price", 145, y);
  doc.text("Amount", 175, y);
  y += 8;
  opts.lines.forEach((line) => {
    const amount = line.qty * line.price;
    doc.text(line.item.slice(0, 50), 14, y);
    doc.text(String(line.qty), 120, y);
    doc.text(money(line.price), 145, y);
    doc.text(money(amount), 175, y);
    y += 8;
  });

  y += 6;
  doc.setFontSize(13);
  doc.text(`Total ${money(total)}`, 196, y, { align: "right" });

  if (opts.kind === "quote") {
    doc.setFontSize(10);
    doc.text("This is a quote, not an invoice and not a booking.", 14, y + 16);
    y += 10;
  }

  if (opts.includeThanks) {
    const image = thanksImage();
    if (image) doc.addImage(image, "PNG", 45, y + 22, 120, 28);
  }

  doc.save(`${opts.kind}-${opts.number}.pdf`);
}
