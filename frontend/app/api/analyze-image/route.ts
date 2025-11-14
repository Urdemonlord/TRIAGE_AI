import { NextRequest, NextResponse } from 'next/server';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image_base64, complaint } = body;

    if (!image_base64) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Call AI service vision endpoint
    const response = await fetch(`${AI_SERVICE_URL}/api/v1/analyze-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_base64,
        complaint: complaint || ''
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Vision API failed');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Image analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
