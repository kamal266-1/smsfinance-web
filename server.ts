import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI Client lazily
  let aiClient: GoogleGenAI | null = null;
  function getGenAIClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not defined in environment variables');
      }
      aiClient = new GoogleGenAI({ apiKey });
    }
    return aiClient;
  }

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'SmsFinance' });
  });

  // 2. AI SMS Fallback Parser Route
  app.post('/api/parse-sms', async (req, res) => {
    try {
      const { smsText, sender } = req.body;
      if (!smsText) {
        return res.status(400).json({ error: 'smsText is required' });
      }

      const prompt = `You are a financial SMS parser specialized in Iranian bank messages (in Persian & English).
Parse the following SMS message and return ONLY a clean JSON object with these fields:
- "amount": number (in Rials, e.g. 5000000 for 5 میلیون ریال)
- "type": "expense" or "income"
- "counterparty": string (store name, person name, or bank name)
- "category": string (e.g. "خرید روزمره & سوپرمارکت", "حمل و نقل & بنزین", "رستوران & کافه", "قبوض & خدمات", "حقوق & درآمد", "متفرقه")
- "bankName": string (e.g. "بانک ملت", "بانک سامان", "بلو بانک")
- "cardLast4": string optional
- "balanceAfter": number optional (in Rials)

SMS text: "${smsText}"
Sender: "${sender || ''}"

Return JSON only. No extra text or markdown code blocks.`;

      const ai = getGenAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const responseText = response.text || '';
      // Clean possible json code block wrappers
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return res.json(parsed);
    } catch (err: any) {
      console.error('Error in /api/parse-sms:', err);
      return res.status(500).json({ error: err?.message || 'Failed to parse SMS with AI' });
    }
  });

  // 3. Google Drive Backup proxy route
  app.post('/api/drive/backup', async (req, res) => {
    try {
      const { accessToken, backupData } = req.body;
      if (!accessToken) {
        return res.status(400).json({ error: 'accessToken is required for Google Drive backup' });
      }

      const fileName = 'SmsFinance_Backup.json';
      const fileContent = JSON.stringify(backupData, null, 2);

      // Search if file already exists
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and trashed=false`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const searchData = await searchRes.json();
      const existingFile = searchData.files && searchData.files[0];

      if (existingFile) {
        // Update existing file
        const updateRes = await fetch(
          `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: fileContent,
          }
        );
        if (!updateRes.ok) throw new Error('Failed to update Google Drive file');
        return res.json({ success: true, fileId: existingFile.id, action: 'updated' });
      } else {
        // Create new file with multipart upload
        const metadata = {
          name: fileName,
          mimeType: 'application/json',
        };
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([fileContent], { type: 'application/json' }));

        const createRes = await fetch(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: form,
          }
        );
        const createData = await createRes.json();
        if (!createRes.ok) throw new Error(createData.error?.message || 'Failed to create Google Drive file');
        return res.json({ success: true, fileId: createData.id, action: 'created' });
      }
    } catch (err: any) {
      console.error('Error in /api/drive/backup:', err);
      return res.status(500).json({ error: err?.message || 'Google Drive backup failed' });
    }
  });

  // 4. Google Drive Restore proxy route
  app.post('/api/drive/restore', async (req, res) => {
    try {
      const { accessToken } = req.body;
      if (!accessToken) {
        return res.status(400).json({ error: 'accessToken is required for Google Drive restore' });
      }

      const fileName = 'SmsFinance_Backup.json';
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and trashed=false`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const searchData = await searchRes.json();
      const existingFile = searchData.files && searchData.files[0];

      if (!existingFile) {
        return res.status(404).json({ error: 'No SmsFinance_Backup.json file found in your Google Drive' });
      }

      const downloadRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!downloadRes.ok) throw new Error('Failed to download backup content from Google Drive');
      const backupData = await downloadRes.json();

      return res.json({ success: true, data: backupData });
    } catch (err: any) {
      console.error('Error in /api/drive/restore:', err);
      return res.status(500).json({ error: err?.message || 'Google Drive restore failed' });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmsFinance Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
