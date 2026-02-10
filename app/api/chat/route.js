import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

export async function POST(req) {
  try {
    const { chatHistory } = await req.json();

    const formattedMessages = chatHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    }));

    const response = await openai.chat.completions.create({
      model: "meta/llama-3.1-8b-instruct",
      messages: [
        {
          role: "system",
          content: "You are Bunni, a friendly cartoon helper for kids. Keep replies very short (1-3 sentences). Always end with a cute question.",
        },
        ...formattedMessages,
      ],
      temperature: 0.8,
      stream: true, 
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error("Nvidia API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch AI" }), { status: 500 });
  }
}