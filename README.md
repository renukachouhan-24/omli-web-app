# 🐰 Bunni Kids AI

## A Magical, Voice-First AI Companion for Kids

Bunni Kids AI is an interactive web application designed to provide a safe, engaging, and magical conversational experience for children. Powered by advanced AI and synchronized video animations, Bunni isn't just a chatbot—she's a friend who listens, talks, and reacts in real-time.

🚀 **Live Demo:** https://omli-web-app.onrender.com/

---

## ✨ Features

- 🎙️ **Voice-First Interaction**: Uses high-performance Speech-to-Text (STT) to let kids talk naturally without needing to type.

- 🎬 **Real-Time Video Sync**: Bunni's animations are perfectly synced with the AI's speech. When she speaks, the video plays; when she pauses, she stays still.

- 🧠 **Intelligent Brain**: Powered by NVIDIA Llama 3.1 for safe, educational, and friendly responses.

- 🌟 **Magical UI**:
  - **Click Sparkles**: Interactive star particles follow every touch.
  - **Floating Bubbles**: A dreamlike, animated background.
  - **Glassmorphism**: A modern, soft "frosted glass" interface designed for kids.

- 🔐 **Secure Login**: Integrated with NextAuth and Google Provider to keep chat histories safe.

- 📜 **Memory & History**: Bunni remembers your conversation during the session, and users can view their "Chat Logs" anytime.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **AI Model**: NVIDIA Llama 3.1 (via Streaming API)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Authentication**: NextAuth.js
- **Voice**: Custom STT/TTS Logic via speech-to-speech
- **Deployment**: Render

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Google Cloud Console project (for OAuth)
- NVIDIA API Key

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/renukachouhan-24/omli-web-app.git
cd omli-web-app
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Environment Variables**

Create a `.env.local` file in the root directory:

```env
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
NEXTAUTH_SECRET=your_random_secret
NVIDIA_API_KEY=your_key
```

4. **Run locally**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

---

## 📂 Project Structure

```
omli-web-app/
├── app/              # Main Next.js App Router logic
├── public/           # Static assets (rabbit_video.mp4, images)
├── api/              # Backend routes for AI streaming and authentication
└── globals.css       # Custom magical animations, bubble effects, and star particles
```

---

## 🎨 UI Preview

- **Font**: Lexend (Soft & Accessible)
- **Design**: Candy-land theme with moving gradients
- **Interactive**: Every click generates a `motion.div` star particle

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Renuka Chouhan**
- GitHub: [@renukachouhan-24](https://github.com/renukachouhan-24)

---

## 🌟 Show your support

Give a ⭐️ if this project helped you or you find it interesting!

---

**Made with ❤️ for kids everywhere**
