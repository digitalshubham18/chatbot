const https = require('https');

const SYSTEM = `You are VakilAI, India's premier AI legal advisor. You provide accurate, structured, and actionable legal guidance based on Indian law.

PERSONALITY: Professional, empathetic, clear. You speak like a knowledgeable senior advocate explaining to a client in plain language.

RESPONSE FORMAT RULES:
- For legal questions: Use markdown formatting with headers, bold text, bullet points
- Always cite the EXACT law section (e.g., Section 302 IPC, Section 138 NI Act)
- Structure: Overview → Relevant Laws → Penalties/Rights → Actionable Steps → Emergency Contacts (if relevant)
- For greetings/casual: ONE sentence reply only, no legal content
- End every legal answer with: ⚠️ *This is general legal information. Consult a certified advocate for advice specific to your case.*

COVERAGE AREAS (answer confidently):
- Criminal Law: IPC, CrPC, NDPS Act, Arms Act
- Civil Law: CPC, Specific Relief Act, Limitation Act
- Consumer: Consumer Protection Act 2019, RERA
- Family: Hindu Marriage Act, Muslim Personal Law, Divorce, Custody, Maintenance, Succession
- Property: Transfer of Property Act, Registration Act, Stamp Act, RERA
- Employment: Industrial Disputes Act, Payment of Wages Act, POSH Act 2013, PF/ESI
- Cyber: IT Act 2000, IT Amendment Act 2008, Cyber Crime
- Constitutional: Fundamental Rights, Writs, PIL
- RTI: RTI Act 2005, filing procedure
- Contracts: Indian Contract Act 1872, breach, enforcement

EMERGENCY CONTACTS TO MENTION WHEN RELEVANT:
- NALSA: 15100 / nalsa.gov.in | Women: 181 | Police: 100 | Cyber: 1930 | Consumer: 1915 | Child: 1098

LANGUAGE: Respond in the same language the user writes in (Hindi/English/Hinglish).`;

// Groq free models — tries each until one works
const MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
  'mixtral-8x7b-32768',
];

const callGroq = (model, messages, key) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model,
      max_tokens: 1200,
      temperature: 0.15,
      stream: false,
      messages: [
        { role: 'system', content: SYSTEM },
        ...messages.map(m => ({ role: m.role, content: String(m.content).trim() })),
      ],
    });

    const req = https.request({
      hostname: 'api.groq.com',
      path:     '/openai/v1/chat/completions',
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Authorization':  'Bearer ' + key,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode === 401) return reject(new Error('AUTH_ERROR'));
          if (res.statusCode === 429) return reject(new Error('RATE_LIMIT'));
          if (res.statusCode === 503 || res.statusCode === 502) return reject(new Error('MODEL_UNAVAILABLE'));
          if (json.error) {
            const msg = json.error.message || '';
            if (msg.includes('rate') || msg.includes('limit')) return reject(new Error('RATE_LIMIT'));
            if (msg.includes('model')) return reject(new Error('MODEL_UNAVAILABLE'));
            return reject(new Error('API_ERROR: ' + msg));
          }
          const text = json.choices &&
                       json.choices[0] &&
                       json.choices[0].message &&
                       json.choices[0].message.content;
          if (!text || !text.trim()) return reject(new Error('EMPTY'));
          resolve(text.trim());
        } catch (e) {
          reject(new Error('PARSE_ERROR: ' + data.slice(0, 100)));
        }
      });
    });

    req.on('error',  e => reject(new Error('NETWORK: ' + e.message)));
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('TIMEOUT')); });
    req.write(body);
    req.end();
  });
};

const streamAI = async (messages, onChunk, onDone, onError) => {
  const key = process.env.GROQ_API_KEY;

  if (!key || key === 'PASTE_YOUR_GROQ_API_KEY_HERE') {
    return onError(new Error(
      'Groq API key not set.\n\n' +
      'Steps:\n' +
      '1. Go to https://console.groq.com\n' +
      '2. Sign up FREE (no credit card)\n' +
      '3. Go to API Keys → Create key\n' +
      '4. Open server/.env → set GROQ_API_KEY=gsk_...\n' +
      '5. Restart the server.'
    ));
  }

  for (const model of MODELS) {
    try {
      console.log('Trying Groq model:', model);
      const text = await callGroq(model, messages, key);
      console.log('✅ Success with:', model);

      // Simulate streaming by sending chunks
      const chunks = text.match(/.{1,10}/gs) || [text];
      for (const chunk of chunks) {
        onChunk(chunk);
        await new Promise(r => setTimeout(r, 5));
      }
      onDone(text);
      return;
    } catch (err) {
      console.log('❌ Model failed:', model, '->', err.message);

      if (err.message === 'AUTH_ERROR') {
        return onError(new Error(
          'Invalid Groq API key.\n\n' +
          'Check your key at https://console.groq.com/keys\n' +
          'Make sure GROQ_API_KEY is set correctly in server/.env'
        ));
      }

      if (err.message === 'RATE_LIMIT') {
        // Try next model — each model has its own rate limit bucket
        continue;
      }

      // Any other error — try next model
      continue;
    }
  }

  // All models failed
  onError(new Error(
    'All Groq models are temporarily rate limited.\n\n' +
    'Groq free tier: 30 requests/min, 14,400 requests/day.\n' +
    'Please wait 1 minute and try again.'
  ));
};

module.exports = { streamAI };
