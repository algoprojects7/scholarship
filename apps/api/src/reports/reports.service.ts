import { Injectable } from '@nestjs/common';
import { ApplicationStatus } from '@scholarship/shared';
import { Prisma } from '@scholarship/database';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { FEE_YEARS } from '../common/constants/application.constants';
import { extractDistrict } from '../common/helpers/extract-district';
import { PrismaService } from '../prisma/prisma.service';
import {
  ReportFormat,
  ReportQueryDto,
  ReportType,
} from './dto/report-query.dto';

export interface ReportExportResult {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}

type RowValue = string | number | null | undefined;
type ReportRow = Record<string, RowValue>;

const REPORT_TITLES: Record<ReportType, string> = {
  [ReportType.APPLICATIONS]: 'Applications Summary',
  [ReportType.ALLOCATIONS]: 'Allocation Report',
  [ReportType.DISTRICT]: 'District-wise Summary',
  [ReportType.STATUS]: 'Status-wise Summary',
};

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async export(query: ReportQueryDto): Promise<ReportExportResult> {
    const { headers, rows, title } = await this.buildReportData(query);
    const filterSummary = this.buildFilterSummary(query);

    if (query.format === ReportFormat.PDF) {
      const buffer = await this.generatePdf(title, headers, rows, filterSummary, query.type);
      return {
        buffer,
        filename: `${query.type}-report.pdf`,
        mimeType: 'application/pdf',
      };
    }

    const buffer = await this.generateExcel(title, headers, rows);
    return {
      buffer,
      filename: `${query.type}-report.xlsx`,
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  private async buildReportData(query: ReportQueryDto): Promise<{
    title: string;
    headers: string[];
    rows: ReportRow[];
  }> {
    switch (query.type) {
      case ReportType.APPLICATIONS:
        return this.buildApplicationsReport(query);
      case ReportType.ALLOCATIONS:
        return this.buildAllocationsReport(query);
      case ReportType.DISTRICT:
        return this.buildDistrictReport(query);
      case ReportType.STATUS:
        return this.buildStatusReport(query);
    }
  }

  private async buildApplicationsReport(query: ReportQueryDto) {
    const where = this.buildApplicationWhere(query);
    const applications = await this.prisma.application.findMany({
      where,
      orderBy: { submittedAt: { sort: 'desc', nulls: 'last' } },
      include: {
        student: {
          select: {
            fullName: true,
            mobile: true,
            gender: true,
            countryCode: true,
            user: { select: { email: true } },
          },
        },
        feePayments: { orderBy: { year: 'asc' } },
      },
    });

    const rows = applications.map((application) => {
      const row: ReportRow = {
        applicationNumber: application.applicationNumber,
        status: application.status,
        academicYear: application.academicYear,
        submittedAt: this.formatDate(application.submittedAt),
        reviewedAt: this.formatDate(application.reviewedAt),
        studentFullName: application.student.fullName,
        email: application.student.user.email,
        mobile: `${application.student.countryCode}${application.student.mobile}`,
        gender: application.student.gender,
        ...this.flattenJsonSection('personal', application.personalDetails),
        ...this.flattenJsonSection('educational', application.educationalDetails),
        ...this.flattenJsonSection('contact', application.contactAddress),
        ...this.flattenJsonSection('bank', application.bankDetails),
        ...this.flattenJsonSection('fee', application.feeDetails),
      };

      for (const year of FEE_YEARS) {
        const payment = application.feePayments.find((item) => item.year === year);
        row[`feePaidYear${year}`] = payment ? Number(payment.amountPaid) : null;
      }

      return row;
    });

    const headers = rows.length > 0 ? Object.keys(rows[0]) : this.applicationHeaders();

    return {
      title: REPORT_TITLES[ReportType.APPLICATIONS],
      headers,
      rows,
    };
  }

  private async buildAllocationsReport(query: ReportQueryDto) {
    const where = this.buildAllocationWhere(query);
    const allocations = await this.prisma.scholarshipAllocation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        application: {
          select: {
            applicationNumber: true,
            status: true,
            academicYear: true,
            contactAddress: true,
            student: {
              select: {
                fullName: true,
                mobile: true,
                countryCode: true,
                user: { select: { email: true } },
              },
            },
          },
        },
        allocatedBy: {
          select: {
            fullName: true,
            employeeId: true,
          },
        },
      },
    });

    const rows: ReportRow[] = allocations.map((allocation) => ({
      applicationNumber: allocation.application.applicationNumber,
      applicationStatus: allocation.application.status,
      studentName: allocation.application.student.fullName,
      email: allocation.application.student.user.email,
      mobile: `${allocation.application.student.countryCode}${allocation.application.student.mobile}`,
      district: extractDistrict(allocation.application.contactAddress),
      allocationType: allocation.type,
      amount: Number(allocation.amount),
      academicYear: allocation.academicYear,
      paymentStatus: allocation.paymentStatus,
      paymentDate: this.formatDate(allocation.paymentDate),
      allocatedBy: allocation.allocatedBy.fullName,
      allocatedByEmployeeId: allocation.allocatedBy.employeeId,
      notes: allocation.notes,
      createdAt: this.formatDate(allocation.createdAt),
    }));

    const headers =
      rows.length > 0
        ? Object.keys(rows[0])
        : [
            'applicationNumber',
            'applicationStatus',
            'studentName',
            'email',
            'mobile',
            'district',
            'allocationType',
            'amount',
            'academicYear',
            'paymentStatus',
            'paymentDate',
            'allocatedBy',
            'allocatedByEmployeeId',
            'notes',
            'createdAt',
          ];

    return {
      title: REPORT_TITLES[ReportType.ALLOCATIONS],
      headers,
      rows,
    };
  }

  private async buildDistrictReport(query: ReportQueryDto) {
    const where = this.buildApplicationWhere(query);
    const applications = await this.prisma.application.findMany({
      where,
      select: { contactAddress: true },
    });

    const counts = new Map<string, number>();
    for (const application of applications) {
      const district = extractDistrict(application.contactAddress) ?? 'Unknown';
      counts.set(district, (counts.get(district) ?? 0) + 1);
    }

    const rows: ReportRow[] = [...counts.entries()]
      .map(([district, count]) => ({ district, count }))
      .sort((a, b) => Number(b.count) - Number(a.count));

    return {
      title: REPORT_TITLES[ReportType.DISTRICT],
      headers: ['district', 'count'],
      rows,
    };
  }

  private async buildStatusReport(query: ReportQueryDto) {
    const where = this.buildApplicationWhere(query);
    if (query.status) {
      delete (where as { status?: ApplicationStatus }).status;
    }

    const grouped = await this.prisma.application.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    });

    const rows: ReportRow[] = grouped
      .map((item) => ({
        status: item.status,
        count: item._count.status,
      }))
      .sort((a, b) => Number(b.count) - Number(a.count));

    return {
      title: REPORT_TITLES[ReportType.STATUS],
      headers: ['status', 'count'],
      rows,
    };
  }

  private buildApplicationWhere(
    query: ReportQueryDto,
  ): Prisma.ApplicationWhereInput {
    const where: Prisma.ApplicationWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.academicYear) {
      where.academicYear = query.academicYear;
    }

    if (query.district) {
      where.contactAddress = {
        path: ['district'],
        equals: query.district,
      };
    }

    const dateFilter = this.buildDateRangeFilter(query);
    if (dateFilter) {
      where.submittedAt = dateFilter;
    }

    return where;
  }

  private buildAllocationWhere(
    query: ReportQueryDto,
  ): Prisma.ScholarshipAllocationWhereInput {
    const where: Prisma.ScholarshipAllocationWhereInput = {};

    if (query.academicYear) {
      where.academicYear = query.academicYear;
    }

    const applicationWhere: Prisma.ApplicationWhereInput = {};

    if (query.status) {
      applicationWhere.status = query.status;
    }

    if (query.district) {
      applicationWhere.contactAddress = {
        path: ['district'],
        equals: query.district,
      };
    }

    if (Object.keys(applicationWhere).length > 0) {
      where.application = applicationWhere;
    }

    const dateFilter = this.buildDateRangeFilter(query);
    if (dateFilter) {
      where.createdAt = dateFilter;
    }

    return where;
  }

  private buildDateRangeFilter(
    query: ReportQueryDto,
  ): Prisma.DateTimeFilter | undefined {
    if (!query.dateFrom && !query.dateTo) {
      return undefined;
    }

    const filter: Prisma.DateTimeFilter = {};

    if (query.dateFrom) {
      filter.gte = new Date(`${query.dateFrom}T00:00:00.000Z`);
    }

    if (query.dateTo) {
      filter.lte = new Date(`${query.dateTo}T23:59:59.999Z`);
    }

    return filter;
  }

  private buildFilterSummary(query: ReportQueryDto): string {
    const parts: string[] = [];

    if (query.dateFrom || query.dateTo) {
      parts.push(
        `Date: ${query.dateFrom ?? '…'} to ${query.dateTo ?? '…'}`,
      );
    }

    if (query.status) {
      parts.push(`Status: ${query.status}`);
    }

    if (query.district) {
      parts.push(`District: ${query.district}`);
    }

    if (query.academicYear) {
      parts.push(`Academic Year: ${query.academicYear}`);
    }

    return parts.length > 0 ? parts.join(' | ') : 'None';
  }

  private flattenJsonSection(
    prefix: string,
    value: Prisma.JsonValue | null,
  ): Record<string, RowValue> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    const result: Record<string, RowValue> = {};
    for (const [key, fieldValue] of Object.entries(
      value as Record<string, unknown>,
    )) {
      result[`${prefix}_${key}`] = this.stringifyCellValue(fieldValue);
    }

    return result;
  }

  private stringifyCellValue(value: unknown): RowValue {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  private formatDate(value: Date | null | undefined): string | null {
    if (!value) {
      return null;
    }

    return value.toISOString();
  }

  private applicationHeaders(): string[] {
    return [
      'applicationNumber',
      'status',
      'academicYear',
      'submittedAt',
      'reviewedAt',
      'studentFullName',
      'email',
      'mobile',
      'gender',
      ...FEE_YEARS.map((year) => `feePaidYear${year}`),
    ];
  }

  private async generateExcel(
    sheetName: string,
    headers: string[],
    rows: ReportRow[],
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName.slice(0, 31));

    worksheet.addRow(headers);
    worksheet.getRow(1).font = { bold: true };

    for (const row of rows) {
      worksheet.addRow(headers.map((header) => row[header] ?? ''));
    }

    worksheet.columns.forEach((column) => {
      column.width = 18;
    });

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  private generatePdf(
    title: string,
    headers: string[],
    rows: ReportRow[],
    filterSummary: string,
    reportType: ReportType,
  ): Promise<Buffer> {
    const pageLayout =
      reportType === ReportType.APPLICATIONS
        ? { size: 'A3' as const, layout: 'landscape' as const }
        : { size: 'A4' as const, layout: 'landscape' as const };

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 40,
        ...pageLayout,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(18).text(title, { align: 'center' });
      doc.moveDown(0.5);
      doc
        .fontSize(10)
        .text(`Generated: ${new Date().toISOString().split('T')[0]}`);
      doc.text(`Filters: ${filterSummary}`);
      doc.moveDown();

      if (rows.length === 0) {
        doc.fontSize(11).text('No records found for the selected filters.');
        doc.end();
        return;
      }

      const tableRows = rows.map((row) =>
        headers.map((header) => String(this.stringifyCellValue(row[header]) ?? '')),
      );

      this.renderPdfTable(doc, headers, tableRows);
      this.renderPdfFooter(doc);
      doc.end();
    });
  }

  private renderPdfTable(
    doc: PDFKit.PDFDocument,
    headers: string[],
    rows: string[][],
  ): void {
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const columnWidth = Math.max(40, pageWidth / headers.length);
    const fontSize = headers.length > 12 ? 6 : 8;
    const rowHeight = fontSize + 6;
    const startX = doc.page.margins.left;
    let y = doc.y;

    const drawRow = (cells: string[], isHeader: boolean) => {
      if (y + rowHeight > doc.page.height - doc.page.margins.bottom - 30) {
        doc.addPage();
        y = doc.page.margins.top;
      }

      let x = startX;
      doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(fontSize);

      for (const cell of cells) {
        doc.text(String(cell), x, y, {
          width: columnWidth - 4,
          height: rowHeight,
          ellipsis: true,
          lineBreak: false,
        });
        x += columnWidth;
      }

      y += rowHeight;
    };

    drawRow(headers, true);

    for (const row of rows) {
      drawRow(row, false);
    }

    doc.y = y;
  }

  private renderPdfFooter(doc: PDFKit.PDFDocument): void {
    const range = doc.bufferedPageRange();
    for (let index = range.start; index < range.start + range.count; index += 1) {
      doc.switchToPage(index);
      doc
        .fontSize(8)
        .text(
          `Page ${index + 1} of ${range.count}`,
          doc.page.margins.left,
          doc.page.height - doc.page.margins.bottom + 10,
          { align: 'center', width: doc.page.width - doc.page.margins.left - doc.page.margins.right },
        );
    }
  }
}
