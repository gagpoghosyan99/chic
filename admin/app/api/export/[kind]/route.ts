import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import ExcelJS from 'exceljs';
import { getSubmissionType } from '@/lib/content-types';
import { SESSION_COOKIE, isValidSession } from '@/lib/session';
import { panel } from '@/lib/strapi';
import { getUiLang } from '@/lib/ui-lang';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ kind: string }> }) {
  if (!(await isValidSession((await cookies()).get(SESSION_COOKIE)?.value))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const type = getSubmissionType((await params).kind);
  if (!type) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const lang = await getUiLang();

  const entries = (await panel.list(type.key)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(type.label.en.slice(0, 31));
  sheet.columns = [
    { header: { hy: 'Ամսաթիվ', en: 'Date', ru: 'Дата' }[lang], key: '_date', width: 20, style: { numFmt: 'yyyy-mm-dd hh:mm' } },
    ...type.columns.map((c) => ({ header: c.label[lang], key: c.name, width: 28 })),
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  for (const e of entries) {
    // Leading =, +, -, @ would make Excel treat visitor-submitted text as a formula.
    const safe = (v: unknown) => {
      const s = v == null ? '' : String(v);
      return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    };
    sheet.addRow({ _date: new Date(e.createdAt), ...Object.fromEntries(type.columns.map((c) => [c.name, safe(e[c.name])])) });
  }
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: type.columns.length + 1 } };

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `chic-${type.key}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
