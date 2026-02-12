🐰 Bunni Kids AI
A Magical, Voice-First AI Companion for Kids
Bunni Kids AI is an interactive web application designed to provide a safe, engaging, and magical conversational experience for children. Powered by advanced AI and synchronized video animations, Bunni isn't just a chatbot—she's a friend who listens, talks, and reacts in real-time.

🚀 Live Demo: https://omli-web-app.onrender.com/

✨ Features
🎙️ Voice-First Interaction: Uses high-performance Speech-to-Text (STT) to let kids talk naturally without needing to type.
🎬 Real-Time Video Sync: Bunni's animations are perfectly synced with the AI's speech. When she speaks, the video plays; when she pauses, she stays still.
🧠 Intelligent Brain: Powered by NVIDIA Llama 3.1 for safe, educational, and friendly responses.
🌟 Magical UI:
Click Sparkles: Interactive star particles follow every touch.
Floating Bubbles: A dreamlike, animated background.
Glassmorphism: A modern, soft "frosted glass" interface designed for kids.
🔐 Secure Login: Integrated with NextAuth and Google Provider to keep chat histories safe.
📜 Memory & History: Bunni remembers your conversation during the session, and users can view their "Chat Logs" anytime.

🛠️ Tech Stack
Framework: Next.js 15+ (App Router)
AI Model: NVIDIA Llama 3.1 (via Streaming API)
Styling: Tailwind CSS v4
Animations: Framer Motion
Authentication: NextAuth.js
Voice: Custom STT/TTS Logic via speech-to-speech
Deployment: Render

🚀 Getting Started
Prerequisites
Node.js 18+
A Google Cloud Console project (for OAuth)
NVIDIA API Key

Installation
Clone the repository
git clone https://github.com/your-username/omli-web-app.git
cd omli-web-app

Install dependencies
npm install

Set up Environment Variables Create a .env.local file in the root directory:
Code snippet
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
NEXTAUTH_SECRET=your_random_secret
NVIDIA_API_KEY=your_key

Run locally
Bash
npm run dev

📂 Project Structure
/app: Main Next.js App Router logic.
/public: Static assets like the rabbit_video.mp4 and images.
/api: Backend routes for AI streaming and authentication.
globals.css: Custom magical animations, bubble effects, and star particles.

🎨 UI Preview
Font: Lexend (Soft & Accessible)
Design: Candy-land theme with moving gradients.
Interactive: Every click generates a motion.div star particle.
