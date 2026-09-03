const Groq = require('groq-sdk');

exports.generateRecommendationInsight = async (req, res) => {
  try {
    const { topSeries, recommendedPops } = req.body;

    const seriesStr = Array.isArray(topSeries) && topSeries.length > 0
      ? topSeries.join(', ')
      : 'popular categories';

    const popsStr = Array.isArray(recommendedPops) && recommendedPops.length > 0
      ? recommendedPops.map(p => (typeof p === 'string' ? p : p.name || p.title || 'featured item')).join(', ')
      : 'featured catalog items';

    if (!process.env.GROQ_API_KEY) {
      return res.json({
        insight: `Adding these highly-demanded items from ${seriesStr} is the perfect move to complete your collection!`
      });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `The user's top collected series are ${seriesStr}. We are recommending ${popsStr}. Write a single, engaging sentence in English explaining why adding these highly-demanded items is the perfect move to complete their collection. DO NOT make financial predictions or promise future ROI.`
        },
        {
          role: 'user',
          content: 'Generate a single dynamic collection insight sentence.'
        }
      ],
      model: 'qwen/qwen3.8-27b',
    });

    const insight = chatCompletion.choices[0]?.message?.content?.trim() ||
      `Adding these highly-demanded items is the perfect move to complete your collection!`;

    res.json({ insight });
  } catch (error) {
    console.error('AI Recommendation Insight Error:', error);
    res.json({
      insight: 'Adding these highly-demanded items is the perfect move to complete your collection!'
    });
  }
};

exports.askAiExpert = exports.generateRecommendationInsight;
