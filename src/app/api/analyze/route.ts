import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { processRealDocument } from '@/lib/server/aiPipelineService';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const samplePath = formData.get('samplePath') as string | null;

    let targetFilePath = '';
    let originalName = 'Uploaded Document';

    if (file && typeof file === 'object' && 'arrayBuffer' in file) {
      originalName = file.name;
      const buffer = Buffer.from(await file.arrayBuffer());

      if (buffer.length > 50 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size exceeds 50MB limit.' },
          { status: 400 }
        );
      }

      const ext = path.extname(file.name).toLowerCase() || '.pdf';
      const safeRandomName = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
      tempFilePath = path.join(os.tmpdir(), safeRandomName);
      await fs.writeFile(tempFilePath, buffer);
      targetFilePath = tempFilePath;
    } else if (samplePath) {
      targetFilePath = path.join(process.cwd(), 'public', samplePath);
      originalName = path.basename(samplePath);
      if (!(await fs.stat(targetFilePath).catch(() => null))) {
        return NextResponse.json(
          { error: `Sample document not found: ${samplePath}` },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'No file or samplePath provided.' },
        { status: 400 }
      );
    }

    const graph = await processRealDocument(targetFilePath, originalName, () => {});

    return NextResponse.json({
      success: true,
      document: {
        name: originalName,
      },
      graph,
    });
  } catch (err: any) {
    console.error('API /api/analyze error:', err);
    return NextResponse.json(
      { error: err.message || 'Error occurred while processing document.' },
      { status: 500 }
    );
  } finally {
    if (tempFilePath) {
      fs.unlink(tempFilePath).catch(() => {});
    }
  }
}
