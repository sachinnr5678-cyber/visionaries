import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { processRealDocument, PipelineProgressEvent } from '@/lib/server/aiPipelineService';

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
        return new Response(
          JSON.stringify({ error: 'File size exceeds 50MB limit.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
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
        return new Response(
          JSON.stringify({ error: `Sample document not found: ${samplePath}` }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'No file or samplePath provided.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        // Heartbeat interval to keep connection alive
        const heartbeatInterval = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(': heartbeat\n\n'));
          } catch (e) {
            clearInterval(heartbeatInterval);
          }
        }, 3000);

        try {
          await processRealDocument(targetFilePath, originalName, (event: PipelineProgressEvent) => {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          });
        } catch (err: any) {
          const errData = `data: ${JSON.stringify({
            stage: 'error',
            error: err.message || 'Error occurred while processing document.',
          })}\n\n`;
          controller.enqueue(encoder.encode(errData));
        } finally {
          clearInterval(heartbeatInterval);
          if (tempFilePath) {
            fs.unlink(tempFilePath).catch(() => {});
          }
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    if (tempFilePath) {
      fs.unlink(tempFilePath).catch(() => {});
    }
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
