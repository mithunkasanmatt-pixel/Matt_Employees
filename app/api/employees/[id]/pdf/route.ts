import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import PDFDocument from 'pdfkit';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verify admin session
    const session = await getSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Fetch employee details
    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return new NextResponse('Employee not found', { status: 404 });
    }

    // 3. Generate PDF using PDFKit
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Employee Profile - ${employee.name}`,
          Author: 'Matt Engineering Solutions',
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // --- PDF DESIGN ---

      // Header branding
      const logoPath = path.join(process.cwd(), 'public', 'logo.png');
      try {
        doc.image(logoPath, 50, 45, { width: 35, height: 35 });
        doc.fillColor('#1e3a8a').fontSize(22).font('Helvetica-Bold').text('MATT ENGINEERING SOLUTIONS', 95, 48);
        doc.fillColor('#64748b').fontSize(9).font('Helvetica').text('INTERNAL EMPLOYEE MANAGEMENT SYSTEM', 95, 72);
      } catch (logoErr) {
        console.error('Error rendering logo in PDF:', logoErr);
        // Fallback
        doc.fillColor('#1e3a8a').fontSize(24).font('Helvetica-Bold').text('MATT ENGINEERING SOLUTIONS', 50, 50);
        doc.fillColor('#64748b').fontSize(10).font('Helvetica').text('INTERNAL EMPLOYEE MANAGEMENT SYSTEM', 50, 78);
      }

      // Decorative header line
      doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 95).lineTo(545, 95).stroke();

      // Title
      doc.fillColor('#0f172a').fontSize(16).font('Helvetica-Bold').text('EMPLOYEE PROFILE CARD', 50, 115);

      // Photo and Info Layout
      const infoStartY = 160;

      // Photo Section (Right Hand Side)
      const photoX = 410;
      const photoY = infoStartY;
      const photoWidth = 130;
      const photoHeight = 130;

      if (employee.image) {
        try {
          const base64Data = employee.image.split(',')[1];
          const imageBuffer = Buffer.from(base64Data, 'base64');
          doc.image(imageBuffer, photoX, photoY, {
            fit: [photoWidth, photoHeight],
            align: 'center',
            valign: 'center',
          });
          // Draw thin border around photo
          doc.rect(photoX, photoY, photoWidth, photoHeight).strokeColor('#cbd5e1').lineWidth(1).stroke();
        } catch (imageErr) {
          console.error('Error rendering image in PDF:', imageErr);
          // Fallback box on failure
          doc.rect(photoX, photoY, photoWidth, photoHeight).fillAndStroke('#f1f5f9', '#cbd5e1');
          doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text('No Photo Available', photoX + 20, photoY + 55);
        }
      } else {
        // Fallback placeholder box
        doc.rect(photoX, photoY, photoWidth, photoHeight).fillAndStroke('#f1f5f9', '#cbd5e1');
        doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text('No Photo Available', photoX + 25, photoY + 55);
      }

      // Details Section (Left Hand Side)
      let currentY = infoStartY;
      const labelX = 50;
      const valueX = 180;
      const labelWidth = 120;
      const rowHeight = 25;

      const details = [
        { label: 'Employee ID', value: employee.employeeId },
        { label: 'Full Name', value: employee.name },
        { label: 'Email Address', value: employee.email },
        { label: 'Mobile Number', value: employee.mobileNo },
        { label: 'Designation / Role', value: employee.role },
        { label: 'Employee Type', value: employee.employeeType === 'EMPLOYEE' ? 'Employee' : 'Intern' },
        {
          label: 'Date of Joining',
          value: new Date(employee.joiningDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        },
      ];

      details.forEach((row) => {
        // Draw background zebra striping
        doc.rect(labelX, currentY - 4, 340, rowHeight).fill('#f8fafc');

        doc.fillColor('#475569').fontSize(10).font('Helvetica-Bold').text(row.label, labelX + 8, currentY);
        doc.fillColor('#0f172a').fontSize(10).font('Helvetica').text(row.value, valueX, currentY);

        currentY += rowHeight;
      });

      // Horizontal separator line before footer
      currentY += 20;
      doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, currentY).lineTo(545, currentY).stroke();

      // Footer branding
      currentY += 15;
      doc.fillColor('#64748b').fontSize(8).font('Helvetica').text('This document contains confidential information. Unauthorized distribution is prohibited.', 50, currentY, {
        width: 495,
        align: 'center',
      });
      doc.text(`Generated on ${new Date().toLocaleDateString()} | Matt Engineering Solutions`, 50, currentY + 12, {
        width: 495,
        align: 'center',
      });

      doc.end();
    });

    // 4. Return PDF response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="employee-${employee.employeeId}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
