import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Load from parent directory's data folder
    const listingsPath = path.join(process.cwd(), '..', 'data', 'listings.json');

    if (!fs.existsSync(listingsPath)) {
      return NextResponse.json([], { status: 200 });
    }

    const data = JSON.parse(fs.readFileSync(listingsPath, 'utf-8'));

    // Handle both array format and object with listings key
    const listings = Array.isArray(data) ? data : (data.listings || []);

    return NextResponse.json(listings);
  } catch (error) {
    console.error('Error loading listings:', error);
    return NextResponse.json([], { status: 200 });
  }
}
