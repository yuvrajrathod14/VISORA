import * as fs from 'fs';
import * as path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // In Next.js, process.cwd() is the root of the app (e.g. apps/demo-next)
    const queueDir = path.resolve(process.cwd(), '.visora');
    const queuePath = path.resolve(queueDir, 'queue.json');

    if (!fs.existsSync(queueDir)) {
      fs.mkdirSync(queueDir, { recursive: true });
    }

    let queue: any[] = [];
    if (fs.existsSync(queuePath)) {
      try {
        queue = JSON.parse(fs.readFileSync(queuePath, 'utf-8'));
      } catch (e) {
        queue = [];
      }
    }

    queue.push({
      id: Date.now().toString(),
      status: 'pending',
      ...body,
    });

    fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2), 'utf-8');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Visora API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
