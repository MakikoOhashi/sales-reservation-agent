import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message, history = [] } = await request.json();

    if (!message) {
      return NextResponse.json({
        success: false,
        message: 'Message is required'
      }, { status: 400 });
    }

    // Get Gemini API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: 'Gemini API key not configured'
      }, { status: 500 });
    }

    // Prepare the prompt for Gemini
    const prompt = `
      Extract the following information from the user's message and return as JSON:
      {
        "category": "string",  // category of product/service
        "product": "string",   // specific product name
        "quantity": number,    // quantity needed
        "date": "string",      // date in ISO format or descriptive
        "notes": "string"      // additional notes
      }

      If any required field is missing, ask the user for the missing information.
      User message: "${message}"

      Previous conversation context: ${JSON.stringify(history)}
    `;

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
      next: { revalidate: 0 }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      return NextResponse.json({
        success: false,
        message: 'Gemini API error',
        error: data.error || 'Unknown error'
      }, { status: response.status });
    }

    // Extract the response text
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Clean up the response by removing markdown code blocks if present
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json') && cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.slice(7, -3).trim();
    } else if (cleanedResponse.startsWith('```') && cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.slice(3, -3).trim();
    }

    // Try to parse as JSON if it looks like JSON
    try {
      const jsonResponse = JSON.parse(cleanedResponse);
      return NextResponse.json({
        success: true,
        data: jsonResponse,
        rawResponse: responseText
      });
    } catch (e) {
      // If not JSON, return as regular message
      return NextResponse.json({
        success: true,
        message: cleanedResponse,
        rawResponse: responseText
      });
    }

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json({
      success: false,
      message: 'Error calling Gemini API',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
