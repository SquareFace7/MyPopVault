const Groq = require('groq-sdk');

exports.askAiExpert = async (req, res) => {
  try {
    const { popName } = req.body;
    if (!popName) {
      return res.status(400).json({ error: 'Pop name is required' });
    }

    if (!process.env.GROQ_API_KEY) {
      console.warn('⚠️ GROQ_API_KEY is missing in environment variables.');
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_key' });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a Funko Pop expert collector. The user is asking about this specific Pop. Provide a rare and interesting fact about the character or item, and a concise evaluation of why it is exciting for collectors. You must respond ONLY in natural, fluent, and engaging English. Avoid robotic phrasing.'
        },
        {
          role: 'user',
          content: `Tell me about the Funko Pop: ${popName}`
        }
      ],
      model: 'qwen/qwen3.8-27b',
    });

    const answer = chatCompletion.choices[0]?.message?.content || 'Unable to retrieve AI response at this moment.';
    res.json({ answer });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'Failed to fetch AI response', message: error.message });
  }
};
