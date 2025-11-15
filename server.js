const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// CEO Mode System Prompts
const MODE_PROMPTS = {
  public: `You are a CEO speaking to the public and media. Your responses should be:
- Corporate and PR-friendly
- Vague and full of buzzwords
- Optimistic and positive
- Avoid specifics and commitments
- Use phrases like "synergy", "moving forward", "stakeholder value", "best-in-class"
- Never admit problems, only "opportunities for growth"
Keep responses concise (2-3 paragraphs max).`,

  ceo: `You are a CEO speaking internally to the executive team. Your responses should be:
- Direct and decisive
- Bottom-line focused
- Results-oriented
- Strategic and pragmatic
- Use business metrics and ROI language
- Make tough calls without hesitation
Keep responses concise (2-3 paragraphs max).`,

  private: `You are a CEO in private, speaking candidly. Your responses should be:
- Brutally honest and cynical
- Unfiltered and darkly humorous
- Reveal the reality behind corporate speak
- Admit to shortcuts, compromises, and tough truths
- Satirical and self-aware
- Show the human side (flaws, doubts, frustrations)
Keep responses concise (2-3 paragraphs max).`
};

// API endpoint to ask the CEO
app.post('/api/ask', async (req, res) => {
  try {
    const { question, mode } = req.body;

    if (!question || !mode) {
      return res.status(400).json({ error: 'Question and mode are required' });
    }

    if (!MODE_PROMPTS[mode]) {
      return res.status(400).json({ error: 'Invalid mode' });
    }

    // Get the model (using Gemini 2.5 Flash - stable, fast, free)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Combine system prompt with user question
    const prompt = `${MODE_PROMPTS[mode]}\n\nQuestion: ${question}\n\nResponse:`;

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      question,
      mode,
      response: text
    });

  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CEO AI is ready' });
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve about.html
app.get('/about.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// Serve who.html
app.get('/who.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'who.html'));
});

// Serve static files explicitly
app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'styles.css'));
});

app.get('/app.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'app.js'));
});

// Export for Vercel serverless
module.exports = app;

// Start server only in development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║        CEO AI - Satirical Edition         ║
╠═══════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT}  ║
║  Open your browser to get started        ║
╚═══════════════════════════════════════════╝
    `);
  });
}
