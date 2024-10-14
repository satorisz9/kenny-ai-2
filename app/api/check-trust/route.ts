import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('Received request in /api/check-trust');
  let accountName;
  try {
    const text = await request.text();
    console.log('Raw request body:', text);
    const body = JSON.parse(text);
    accountName = body.accountName;
    console.log('Parsed request body:', body);
    
    if (!accountName) {
      throw new Error('accountName is missing');
    }
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json({ error: `Invalid request body: ${error.message}` }, { status: 400 });
  }

  const apiKey = process.env.DIFY_API_KEY;
  const apiUrl = process.env.DIFY_API_URL;

  console.log('API Key exists:', !!apiKey);
  console.log('API URL:', apiUrl);

  if (!apiKey || !apiUrl) {
    console.error('API configuration is missing');
    return NextResponse.json({ error: 'API configuration is missing' }, { status: 500 });
  }

  try {
    console.log(`Calling Dify API for account: ${accountName}`);
    const difyResponse = await fetch(`${apiUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: {},
        query: `Check the trust score for X account: ${accountName}`,
        response_mode: 'blocking',
      }),
    });

    console.log('Dify API response status:', difyResponse.status);
    console.log('Dify API response headers:', Object.fromEntries(difyResponse.headers.entries()));

    const responseText = await difyResponse.text();
    console.log('Dify API raw response:', responseText);

    if (!difyResponse.ok) {
      console.error(`Dify API responded with status ${difyResponse.status}: ${responseText}`);
      return NextResponse.json({ error: `Dify API error: ${difyResponse.status} ${responseText}` }, { status: difyResponse.status });
    }

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Dify API parsed response:', data);
    } catch (parseError) {
      console.error('Error parsing Dify API response:', parseError);
      return NextResponse.json({ error: `Invalid response from Dify API: ${responseText}` }, { status: 500 });
    }

    if (!data.answer) {
      console.error('Dify API response is missing the answer field');
      return NextResponse.json({ error: `Invalid response from Dify API: missing answer. Full response: ${JSON.stringify(data)}` }, { status: 500 });
    }

    console.log('Sending successful response');
    return NextResponse.json({ answer: data.answer });
  } catch (error) {
    console.error('Error calling Dify API:', error);
    return NextResponse.json({ error: `Failed to check trust score: ${error.message}` }, { status: 500 });
  }
}