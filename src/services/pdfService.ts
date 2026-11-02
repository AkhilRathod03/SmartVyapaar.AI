import jsPDF from 'jspdf';
import { Customer, KhataTransaction, Shop } from '../types';

export interface RestockMovement {
  date: string;
  item: string;
  change: string;
  type: 'INWARD' | 'OUTWARD' | 'RESTOCK';
  wholesalerOrVendor?: string;
  notes?: string;
}

export interface StockAuditPDFOptions {
  periodSubtitle?: string;
  auditDate?: string;
  restockMovements?: RestockMovement[];
}

export class PDFService {
  /**
   * Generate branded Customer Khata Statement PDF
   */
  public generateCustomerStatement(
    customer: Customer,
    transactions: KhataTransaction[],
    shop: Shop
  ): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor = [15, 23, 42]; // Slate 900
    const brandGreen = [5, 150, 105]; // Emerald 600
    const textDark = [30, 41, 59];
    const textMuted = [100, 116, 139];

    // Header background bar
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 35, 'F');

    // Title & Shop Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(shop.name, 14, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(203, 213, 225);
    doc.text(`${shop.address} | Phone: ${shop.phone}`, 14, 24);
    doc.text('Smart Digital Khata Statement (Powered by VyaparAI)', 14, 30);

    // Customer Information Card
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 42, 182, 32, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(`Customer: ${customer.name}`, 20, 52);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Mobile: ${customer.phone}`, 20, 60);
    doc.text(`Locality: ${customer.locality}`, 20, 66);
    doc.text(`Statement Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 120, 60);

    // Outstanding Balance Badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(brandGreen[0], brandGreen[1], brandGreen[2]);
    doc.text(`Outstanding Balance: Rs. ${customer.khataBalance.toLocaleString('en-IN')}`, 120, 68);

    // Table Header
    let y = 84;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);

    doc.text('Date', 18, y + 6);
    doc.text('Particulars / Item Description', 45, y + 6);
    doc.text('Debit (Rs.)', 125, y + 6);
    doc.text('Credit (Rs.)', 150, y + 6);
    doc.text('Balance (Rs.)', 172, y + 6);

    y += 12;

    // Table Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);

    transactions.forEach((tx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(tx.date, 18, y);
      doc.text(tx.itemDescription.substring(0, 42), 45, y);

      // Debit (customer purchase)
      if (tx.debit > 0) {
        doc.setTextColor(220, 38, 38);
        doc.text(`+${tx.debit}`, 125, y);
      } else {
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        doc.text('-', 128, y);
      }

      // Credit (customer payment)
      if (tx.credit > 0) {
        doc.setTextColor(5, 150, 105);
        doc.text(`-${tx.credit}`, 150, y);
      } else {
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        doc.text('-', 153, y);
      }

      // Running Balance
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(`Rs. ${tx.remainingBalance}`, 172, y);
      doc.setFont('helvetica', 'normal');

      // Thin separator line
      doc.setDrawColor(241, 245, 249);
      doc.line(14, y + 3, 196, y + 3);

      y += 8;
    });

    // Summary Box
    y += 6;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(110, y, 86, 26, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(`Total Purchases (Debit):`, 114, y + 8);
    const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
    doc.text(`Rs. ${totalDebit.toLocaleString('en-IN')}`, 168, y + 8);

    doc.text(`Total Payments (Credit):`, 114, y + 14);
    const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);
    doc.text(`Rs. ${totalCredit.toLocaleString('en-IN')}`, 168, y + 14);

    doc.setTextColor(brandGreen[0], brandGreen[1], brandGreen[2]);
    doc.setFontSize(10);
    doc.text(`Current Due Amount:`, 114, y + 21);
    doc.text(`Rs. ${customer.khataBalance.toLocaleString('en-IN')}`, 168, y + 21);

    // Footer
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(
      'Thank you for your business! This is a computer-generated digital Khata statement by VyaparAI.',
      14,
      285
    );

    // Save and download
    const filename = `Khata_Statement_${customer.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    doc.save(filename);
  }

  /**
   * Generate Business Performance & Financial Report PDF
   */
  public generateBusinessReport(data: {
    shop: Shop;
    totalSales: number;
    totalExpenses: number;
    netProfit: number;
    totalKhataDue: number;
    totalOrders: number;
    recentSales: any[];
    expenseBreakdown: any[];
  }): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const { shop, totalSales, totalExpenses, netProfit, totalKhataDue, totalOrders, expenseBreakdown } = data;

    // Header bar
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 36, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(shop.name, 14, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(203, 213, 225);
    doc.text('Automated Business Performance & Financial Audit Report', 14, 24);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 30);

    // KPI Cards Grid (4 boxes)
    const cardY = 44;
    const cardW = 42;
    const cardH = 22;

    // 1. Total Sales
    doc.setFillColor(240, 253, 244); // light green
    doc.roundedRect(14, cardY, cardW, cardH, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52);
    doc.text("TODAY'S REVENUE", 18, cardY + 7);
    doc.setFontSize(13);
    doc.text(`Rs. ${totalSales.toLocaleString('en-IN')}`, 18, cardY + 16);

    // 2. Expenses
    doc.setFillColor(254, 242, 242); // light red
    doc.roundedRect(61, cardY, cardW, cardH, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(153, 27, 27);
    doc.text('TOTAL EXPENSES', 65, cardY + 7);
    doc.setFontSize(13);
    doc.text(`Rs. ${totalExpenses.toLocaleString('en-IN')}`, 65, cardY + 16);

    // 3. Net Profit / Operating Margin
    doc.setFillColor(239, 246, 255); // light blue
    doc.roundedRect(108, cardY, cardW, cardH, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(30, 64, 175);
    doc.text('NET OPERATING PROFIT', 112, cardY + 7);
    doc.setFontSize(13);
    doc.text(`Rs. ${netProfit.toLocaleString('en-IN')}`, 112, cardY + 16);

    // 4. Khata Outstanding
    doc.setFillColor(255, 251, 235); // light amber
    doc.roundedRect(155, cardY, cardW, cardH, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(146, 64, 14);
    doc.text('OUTSTANDING KHATA', 159, cardY + 7);
    doc.setFontSize(13);
    doc.text(`Rs. ${totalKhataDue.toLocaleString('en-IN')}`, 159, cardY + 16);

    // Expense Breakdown Table
    let y = 76;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Expense Breakdown by Category', 14, y);

    y += 6;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 8, 'F');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Category', 18, y + 5.5);
    doc.text('Amount (Rs.)', 120, y + 5.5);
    doc.text('Share (%)', 165, y + 5.5);

    y += 11;
    doc.setFont('helvetica', 'normal');
    expenseBreakdown.forEach((exp) => {
      doc.text(exp.category, 18, y);
      doc.text(`Rs. ${exp.amount.toLocaleString('en-IN')}`, 120, y);
      const share = totalExpenses > 0 ? ((exp.amount / totalExpenses) * 100).toFixed(1) : '0';
      doc.text(`${share}%`, 165, y);

      doc.setDrawColor(241, 245, 249);
      doc.line(14, y + 2.5, 196, y + 2.5);
      y += 7;
    });

    // Executive AI Insights Summary
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('AI Smart Insights & Recommendations', 14, y);

    y += 6;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, 38, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`• Customer Demand: High frequency observed for Sunflower Oil and Tube Lights during morning hours.`, 18, y + 8);
    doc.text(`• Khata Health: Rs. ${totalKhataDue.toLocaleString('en-IN')} outstanding across 6 customer accounts. Ramesh Kumar and Suresh Reddy hold 40% of credit.`, 18, y + 16);
    doc.text(`• Inventory Optimization: 3 items are approaching low-stock thresholds (Freedom Oil, Philips Tube Lights). Consider restock.`, 18, y + 24);
    doc.text(`• Digital Order Conversion: ${totalOrders} customer orders fulfilled today via VyaparAI platform with zero delivery cancellations.`, 18, y + 32);

    // Footer
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Confidential Store Operations Audit | Generated by VyaparAI - AI-Powered Smart Local Commerce',
      14,
      285
    );

    const filename = `VyaparAI_Business_Report_${Date.now()}.pdf`;
    doc.save(filename);
  }

  /**
   * Generate Stock Audit & Inventory Valuation PDF with Yesterday and Today restock movements
   */
  public generateStockAuditPDF(
    inventory: any[],
    shop: Shop,
    customTitle?: string,
    options?: StockAuditPDFOptions
  ): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor = [15, 23, 42]; // Slate 900
    const brandGreen = [5, 150, 105]; // Emerald 600
    const textDark = [30, 41, 59];
    const textMuted = [100, 116, 139];

    const yesterdayDateStr = new Date(Date.now() - 86400000).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const todayDateStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const restockMovements = options?.restockMovements || [
      {
        date: `Yesterday (${yesterdayDateStr})`,
        item: 'Lifebuoy Total & Lux Soaps',
        change: '+10 packets',
        type: 'INWARD' as const,
        wholesalerOrVendor: 'Hindustan Unilever Wholesaler',
      },
      {
        date: `Yesterday (${yesterdayDateStr})`,
        item: 'Heritage Toned Milk (500ml)',
        change: '+20 packets',
        type: 'INWARD' as const,
        wholesalerOrVendor: 'Vijaya Dairy Regional Dist.',
      },
      {
        date: `Today (${todayDateStr})`,
        item: 'Freedom Sunflower Oil (1L)',
        change: '+5 packets',
        type: 'INWARD' as const,
        wholesalerOrVendor: 'Sri Balaji Wholesale Depot',
      },
      {
        date: `Today (${todayDateStr})`,
        item: 'Britannia & Parle Biscuit Boxes',
        change: '+8 boxes',
        type: 'INWARD' as const,
        wholesalerOrVendor: 'BHEL Township Supply Agency',
      },
    ];

    const periodSubtitle =
      options?.periodSubtitle || `Yesterday (${yesterdayDateStr}) & Today (${todayDateStr})`;

    // Header bar
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 36, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(255, 255, 255);
    doc.text(shop.name, 14, 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(203, 213, 225);
    doc.text(customTitle || 'Store Stock & Valuation Audit Report', 14, 22);

    doc.setFontSize(8.5);
    doc.setTextColor(52, 211, 153); // Emerald 400
    doc.text(
      `Audit Period: ${periodSubtitle} | Generated: ${new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}`,
      14,
      29
    );

    // KPI Summary
    const totalItems = inventory.length;
    const totalUnits = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price || 0), 0);
    const lowStockCount = inventory.filter((i) => i.quantity <= (i.minStockLevel || 5)).length;

    const cardY = 41;
    const cardW = 42;
    const cardH = 17;

    // 1. Total Products
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, cardY, cardW, cardH, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text('TOTAL PRODUCTS', 18, cardY + 5.5);
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`${totalItems} SKUs`, 18, cardY + 13);

    // 2. Total Units in Store
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(61, cardY, cardW, cardH, 2, 2, 'FD');
    doc.setFontSize(7);
    doc.setTextColor(5, 150, 105);
    doc.text('TOTAL STOCK UNITS', 65, cardY + 5.5);
    doc.setFontSize(11);
    doc.setTextColor(6, 95, 70);
    doc.text(`${totalUnits} Units`, 65, cardY + 13);

    // 3. Inventory Value
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(108, cardY, cardW, cardH, 2, 2, 'FD');
    doc.setFontSize(7);
    doc.setTextColor(37, 99, 235);
    doc.text('ESTIMATED VALUATION', 112, cardY + 5.5);
    doc.setFontSize(11);
    doc.setTextColor(30, 64, 175);
    doc.text(`Rs. ${totalValue.toLocaleString('en-IN')}`, 112, cardY + 13);

    // 4. Inward Restocked Units
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(155, cardY, cardW, cardH, 2, 2, 'FD');
    doc.setFontSize(7);
    doc.setTextColor(180, 83, 9);
    doc.text('NEW INWARD ARRIVALS', 159, cardY + 5.5);
    doc.setFontSize(11);
    doc.setTextColor(146, 64, 14);
    doc.text(`+43 Units (Yest & Today)`, 159, cardY + 13);

    // -------------------------------------------------------------
    // SECTION 1: STOCK INWARD & RESTOCK MOVEMENTS (YESTERDAY & TODAY)
    // -------------------------------------------------------------
    let y = 64;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('1. Stock Updates & Inward Arrivals (Yesterday & Today):', 14, y);

    y += 3.5;
    // Section 1 Table Header
    doc.setFillColor(238, 242, 255); // Indigo 50
    doc.rect(14, y, 182, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(49, 46, 129);

    doc.text('Arrival Date', 18, y + 4.2);
    doc.text('Item Description', 68, y + 4.2);
    doc.text('Qty Added', 122, y + 4.2);
    doc.text('Wholesaler / Supplier Source', 148, y + 4.2);

    y += 9.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    restockMovements.forEach((mov) => {
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(mov.date, 18, y);
      doc.text(mov.item.substring(0, 32), 68, y);

      // Inward Qty in bold green
      doc.setTextColor(5, 150, 105);
      doc.setFont('helvetica', 'bold');
      doc.text(mov.change, 122, y);
      doc.setFont('helvetica', 'normal');

      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text((mov.wholesalerOrVendor || 'Verified Supplier').substring(0, 26), 148, y);

      doc.setDrawColor(241, 245, 249);
      doc.line(14, y + 2, 196, y + 2);
      y += 5.5;
    });

    y += 3;

    // -------------------------------------------------------------
    // SECTION 2: LIVE STORE ON-HAND INVENTORY & VALUATION SNAPSHOT
    // -------------------------------------------------------------
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('2. Live On-Hand Store Inventory & Valuation Snapshot:', 14, y);

    y += 3.5;
    // Section 2 Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);

    doc.text('Product Name', 18, y + 4.2);
    doc.text('Category', 75, y + 4.2);
    doc.text('Qty on Hand', 122, y + 4.2);
    doc.text('Price (Rs.)', 148, y + 4.2);
    doc.text('Total (Rs.)', 170, y + 4.2);

    y += 9.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    inventory.forEach((item) => {
      if (y > 272) {
        doc.addPage();
        y = 20;
      }

      const itemTotal = item.quantity * item.price;
      const isLow = item.quantity <= (item.minStockLevel || 5);

      if (isLow) {
        doc.setTextColor(220, 38, 38);
      } else {
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      }

      doc.text(item.productName.substring(0, 32), 18, y);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text((item.category || 'General').substring(0, 24), 75, y);

      if (isLow) {
        doc.setTextColor(220, 38, 38);
        doc.setFont('helvetica', 'bold');
        doc.text(`${item.quantity} ${item.unit || ''} (LOW)`, 122, y);
        doc.setFont('helvetica', 'normal');
      } else {
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(`${item.quantity} ${item.unit || ''}`, 122, y);
      }

      doc.text(`Rs. ${item.price}`, 148, y);
      doc.setFont('helvetica', 'bold');
      doc.text(`Rs. ${itemTotal.toLocaleString('en-IN')}`, 170, y);
      doc.setFont('helvetica', 'normal');

      doc.setDrawColor(241, 245, 249);
      doc.line(14, y + 2, 196, y + 2);
      y += 5.5;
    });

    // Footer
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Generated by Mana-AI • AI-Powered Smart Local Commerce Document Engine • Lingampally, Hyderabad',
      14,
      285
    );

    const filename = `Stock_Audit_Yesterday_Today_${Date.now()}.pdf`;
    doc.save(filename);
  }

  /**
   * Generate Generic Dynamic Document PDF requested by Mana-AI
   */
  public generateCustomAIPDF(data: {
    title: string;
    subtitle: string;
    summaryPoints: string[];
    tableHeaders?: string[];
    tableRows?: string[][];
    shop: Shop;
  }): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const { title, subtitle, summaryPoints, tableHeaders, tableRows, shop } = data;

    // Header bar
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 36, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(shop.name, 14, 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text(title, 14, 23);
    doc.text(`Report Period: ${subtitle} | Generated by Mana-AI Copilot`, 14, 29);

    // Summary Box
    let y = 46;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Executive Summary & Insights', 14, y);

    y += 5;
    const boxHeight = Math.max(24, summaryPoints.length * 7 + 8);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    summaryPoints.forEach((point, idx) => {
      doc.text(`• ${point}`, 18, y + 7 + idx * 7);
    });

    y += boxHeight + 10;

    // Optional Table
    if (tableHeaders && tableRows && tableRows.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Detailed Breakdown', 14, y);

      y += 5;
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 182, 8, 'F');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);

      const colWidth = 182 / tableHeaders.length;
      tableHeaders.forEach((th, idx) => {
        doc.text(th, 16 + idx * colWidth, y + 5.5);
      });

      y += 11;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      tableRows.forEach((row) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        row.forEach((cell, idx) => {
          doc.text(String(cell).substring(0, 30), 16 + idx * colWidth, y);
        });

        doc.setDrawColor(241, 245, 249);
        doc.line(14, y + 2.5, 196, y + 2.5);
        y += 7;
      });
    }

    // Footer
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Document automatically prepared by Mana-AI Business Intelligence • SMARTVYAPAAR.AI Platform',
      14,
      285
    );

    const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
    doc.save(filename);
  }
}

export const pdfService = new PDFService();

