import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Use the API key from your environment or fallback to the one in the example file
    const apiKey = process.env.GROQ_API_KEY || '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';

    // We'll use Groq's blazing fast LLaMA 3 model
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { 
            role: 'system', 
            content: 'You are PulseGrid AI, an intelligent medical assistant integrated into the Pulse Grid OS dashboard. Keep your answers concise, professional, and helpful. You are helping doctors and medical staff manage patient care.' 
          },
          ...messages
        ]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Groq API Error:', data);
      throw new Error(data.error?.message || 'Failed to fetch from Groq');
    }

    return NextResponse.json({ reply: data.choices[0].message.content });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { reply: 'Sorry, my AI brain is experiencing interference right now.' },
      { status: 500 }
    );
  }
}
