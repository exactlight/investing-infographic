// File: netlify/functions/get-strategy.js

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { scenario } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY; // Securely access the API key

    if (!apiKey) {
      throw new Error('API key is not configured on the server.');
    }

    // The prompt logic is now securely on the server
    const prompt = `
      You are an expert creative real estate investing advisor. You are advising a user based on these common strategies: Wholesaling, Subject-To (Sub2), BRRRR Method, Lease Option, House Hacking, and Seller Financing.

      Based on the user's scenario described below, recommend the most suitable creative real estate strategy. Also recommend a good alternative strategy.

      For each recommendation, explain *why* it is a good fit, outlining the pros and cons in the context of their situation. Also, mention one or two key risks they should be aware of. Structure your response in clean HTML using headings (h4), paragraphs (p), bold tags (b), and unordered lists (ul/li) for readability.

      User's Scenario: "${scenario}"
    `;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API Error:', errorBody);
      return { statusCode: response.status, body: JSON.stringify({ error: 'Failed to get response from AI.' }) };
    }

    const result = await response.json();
    const text = result.candidates[0].content.parts[0].text;

    return {
      statusCode: 200,
      body: JSON.stringify({ recommendation: text }),
    };

  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An error occurred processing your request.' }),
    };
  }
};
