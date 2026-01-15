import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getWorkers } from '@/lib/data';

export async function GET() {
  const results: any = {
    currentWorkingDir: process.cwd(),
    dataFileCheck: {},
    workersCount: 0,
    workers: [],
  };

  // Check data file path
  const dataFilePath = path.join(process.cwd(), '.builds', 'data', 'workers.json');
  const dataDir = path.dirname(dataFilePath);

  results.dataFileCheck = {
    dataDir,
    dataFilePath,
    dirExists: fs.existsSync(dataDir),
    fileExists: fs.existsSync(dataFilePath),
    readable: false,
    writable: false,
    content: null,
    error: null,
  };

  // Try to read the file
  if (fs.existsSync(dataFilePath)) {
    try {
      const content = fs.readFileSync(dataFilePath, 'utf8');
      results.dataFileCheck.readable = true;
      results.dataFileCheck.content = JSON.parse(content);
      results.dataFileCheck.size = content.length;
    } catch (error: any) {
      results.dataFileCheck.error = error.message;
    }
  }

  // Try to write to the directory
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      results.dataFileCheck.dirCreated = true;
    }
    
    // Try to write a test file
    const testFilePath = path.join(dataDir, 'test-write.json');
    fs.writeFileSync(testFilePath, JSON.stringify({ test: true }), 'utf8');
    results.dataFileCheck.writable = true;
    // Clean up test file
    fs.unlinkSync(testFilePath);
  } catch (error: any) {
    results.dataFileCheck.writeError = error.message;
  }

  // Get current workers from memory
  try {
    const workers = getWorkers();
    results.workersCount = workers.length;
    results.workers = workers.map(w => ({
      id: w.id,
      name: w.name,
      email: w.email,
      hasChecklist: !!w.checklist,
      hasNotes: w.notes?.length > 0,
    }));
  } catch (error: any) {
    results.workersError = error.message;
  }

  return NextResponse.json(results, { status: 200 });
}

