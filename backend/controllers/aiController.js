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
          content: 'אתה מומחה לאספנות Funko Pop. המשתמש שואל על הפופ הספציפי הזה. ספק עובדה מעניינת ונדירה על הדמות, והערכה קצרה מדוע הפריט הזה מעניין לאספנים. היה תמציתי וענה בעברית.'
        },
        {
          role: 'user',
          content: `ספר לי על הפופ: ${popName}`
        }
      ],
      model: 'qwen/qwen3.8-27b',
    });

    const answer = chatCompletion.choices[0]?.message?.content || 'לא ניתן לקבל תשובה כעת.';
    res.json({ answer });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'Failed to fetch AI response', message: error.message });
  }
};
