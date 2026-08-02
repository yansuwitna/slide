import { NextResponse } from 'next/server';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';

export async function GET(request: Request, { params }: { params: { filename: string } }) {
  const filename = params.filename;
  
  // Ambil file dari public/uploads
  const filePath = join(process.cwd(), 'public', 'uploads', filename);

  if (!existsSync(filePath)) {
    return new NextResponse('File not found', { status: 404 });
  }

  try {
    const fileBuffer = readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    return new NextResponse('Error reading file', { status: 500 });
  }
}
