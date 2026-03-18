const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// ── Call Google Gemini AI ──
const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing in .env file');

  console.log('🤖 Calling Gemini AI...');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error('❌ Gemini Error:', JSON.stringify(data));
    throw new Error(data.error?.message || 'Gemini request failed');
  }

  if (!data.candidates?.length) throw new Error('Gemini returned empty response');
  console.log('✅ Gemini responded successfully');
  return data.candidates[0].content.parts[0].text;
};

// ── Extract full text from note file ──
const getNoteFullContent = async (note) => {
  let fileText = '';

  try {
    if (note.extracted_text && note.extracted_text.trim().length > 50) {
      fileText = note.extracted_text.substring(0, 4000);
    } else if (note.file_path) {
      const filePath = path.resolve(note.file_path);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(note.file_name || '').toLowerCase();
        if (ext === '.pdf') {
          const pdfParse = require('pdf-parse');
          const buffer = fs.readFileSync(filePath);
          const parsed = await pdfParse(buffer);
          fileText = parsed.text?.substring(0, 4000) || '';
        } else if (ext === '.docx' || ext === '.doc') {
          const mammoth = require('mammoth');
          const result = await mammoth.extractRawText({ path: filePath });
          fileText = result.value?.substring(0, 4000) || '';
        } else if (ext === '.txt') {
          fileText = fs.readFileSync(filePath, 'utf8').substring(0, 4000);
        }
      }
    }
  } catch (e) {
    console.log('File read error (non-critical):', e.message);
  }

  const context = `
Title: ${note.title}
Subject: ${note.subject || 'General'}
Description: ${note.description || 'No description'}
Tags: ${note.unit_tags || 'None'}
${fileText ? `\nFile Content:\n${fileText}` : '\n[File content not extractable - PDF/PPT binary format]'}
  `.trim();

  return context;
};

// ── Summarize Note ──
exports.summarizeNote = async (req, res, next) => {
  try {
    const [notes] = await db.query('SELECT * FROM notes WHERE id = ? AND is_deleted = 0', [req.params.id]);
    if (notes.length === 0) return res.status(404).json({ success: false, message: 'Note not found.' });

    const note = notes[0];

    // Check cache
    const [cached] = await db.query('SELECT * FROM ai_cache WHERE note_id = ? AND type = "summary"', [note.id]);
    if (cached.length > 0) {
      return res.json({ success: true, summary: cached[0].content, cached: true });
    }

    const content = await getNoteFullContent(note);

    const prompt = `You are a helpful educational assistant for students.

Analyze and summarize the following study material. Structure your response as:

📌 **Topic:** (one line topic)

📝 **Summary:** (2-3 sentences overview)

🔑 **Key Points:**
• Point 1
• Point 2
• Point 3
• Point 4
• Point 5

❓ **Important Questions:**
1. Question 1?
2. Question 2?
3. Question 3?

Keep it clear, simple and student-friendly.

Study Material:
${content}`;

    const summary = await callGemini(prompt);

    try {
      await db.query(
        'INSERT INTO ai_cache (note_id, type, content) VALUES (?, "summary", ?) ON DUPLICATE KEY UPDATE content = VALUES(content), created_at = NOW()',
        [note.id, summary]
      );
    } catch (e) { console.log('Cache save skipped'); }

    res.json({ success: true, summary });
  } catch (err) {
    console.error('❌ summarizeNote:', err.message);
    res.status(500).json({ success: false, message: err.message || 'AI failed. Check GEMINI_API_KEY in .env' });
  }
};

// ── Ask Question ──
exports.askQuestion = async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question?.trim()) return res.status(400).json({ success: false, message: 'Question required.' });

    const [notes] = await db.query('SELECT * FROM notes WHERE id = ? AND is_deleted = 0', [req.params.id]);
    if (notes.length === 0) return res.status(404).json({ success: false, message: 'Note not found.' });

    const content = await getNoteFullContent(notes[0]);

    const prompt = `You are a helpful study assistant for students.

Answer the student's question based on the note content below.
Be clear, simple and educational. Use bullet points or steps if helpful.
If the answer is not in the notes, give a helpful general answer and mention it.

Note Content:
${content}

Student Question: ${question.trim()}

Your Answer:`;

    const answer = await callGemini(prompt);

    try {
      await db.query(
        'INSERT INTO ai_chats (user_id, note_id, question, answer) VALUES (?, ?, ?, ?)',
        [req.user.id, req.params.id, question.trim(), answer]
      );
    } catch (e) { console.log('Chat history save skipped'); }

    res.json({ success: true, answer });
  } catch (err) {
    console.error('❌ askQuestion:', err.message);
    res.status(500).json({ success: false, message: err.message || 'AI failed. Check GEMINI_API_KEY in .env' });
  }
};

// ── Get Chat History ──
exports.getChatHistory = async (req, res, next) => {
  try {
    const [chats] = await db.query(
      'SELECT * FROM ai_chats WHERE note_id = ? AND user_id = ? ORDER BY created_at ASC',
      [req.params.id, req.user.id]
    );
    res.json({ success: true, chats });
  } catch (err) { next(err); }
};

// ── General Doubt Clarification ──
exports.clarifyDoubt = async (req, res, next) => {
  try {
    const { question, subject, noteContext } = req.body;
    if (!question) return res.status(400).json({ success: false, message: 'Question required.' });

    const prompt = `You are a helpful educational assistant${subject ? ` specializing in ${subject}` : ''}.

${noteContext ? `Current Note Context:\n${noteContext}\n\n` : ''}
Student Question: ${question}

Provide a clear, simple, well-structured answer with examples where helpful:`;

    const answer = await callGemini(prompt);

    try {
      await db.query(
        'INSERT INTO ai_chats (user_id, note_id, question, answer) VALUES (?, NULL, ?, ?)',
        [req.user.id, question, answer]
      );
    } catch (e) {}

    res.json({ success: true, answer });
  } catch (err) {
    console.error('❌ clarifyDoubt:', err.message);
    res.status(500).json({ success: false, message: err.message || 'AI failed. Check GEMINI_API_KEY in .env' });
  }
};
