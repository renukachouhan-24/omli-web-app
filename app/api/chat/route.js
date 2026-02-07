// import { NextResponse } from 'next/server';
// import OpenAI from 'openai';

// const openai = new OpenAI({
//   apiKey: process.env.NVIDIA_API_KEY,
//   baseURL: 'https://integrate.api.nvidia.com/v1',
// });

// export async function POST(req) {
//   const { prompt } = await req.json();

//   const completion = await openai.chat.completions.create({
//     model: "meta/llama-3.1-8b-instruct",
//     messages: [
//       {
//         role: "system",
//         content:
//         "You are Omli, a friendly cartoon helper for kids. Remember the user's name and previous topics. Keep replies short (1-3 sentences) and cheerful. Always finish your response with a cute follow-up question to keep the child engaged, like 'Do you want to hear more?' or 'What do you think about that?'",
//       },
//       { role: "user", content: prompt },
//     ],
//     temperature: 0.8,
//     top_p: 0.7,
//     max_tokens: 120,
//   });

//   const responseText = completion.choices[0].message.content;
//   return NextResponse.json({ text: responseText });
// }


import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

export async function POST(req) {
  // Frontend se history mangwayein
  const { chatHistory } = await req.json();

  // History ko AI ke format mein map karein
  const formattedMessages = chatHistory.map((msg) => ({
    role: msg.role === "user" ? "user" : "assistant",
    content: msg.content,
  }));

  const completion = await openai.chat.completions.create({
    model: "meta/llama-3.1-8b-instruct",
    messages: [
      {
        role: "system",
        content:
          "You are Omli, a friendly cartoon helper for kids. Remember the user's name and previous topics. Keep replies very short (1-3 sentences) and cheerful. Always finish your response with a cute follow-up question to keep the child engaged, like 'Do you want to hear more?' or 'What do you think about that?'",
      },
      ...formattedMessages, // AI ko purani baatein yaad dilane ke liye
    ],
    temperature: 0.8,
    top_p: 0.7,
    max_tokens: 120,
  });

  const responseText = completion.choices[0].message.content;
  return NextResponse.json({ text: responseText });
}