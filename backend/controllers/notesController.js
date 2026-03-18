const db = require('../config/database');
const path = require('path');
const fs = require('fs');

// Extract text from uploaded files
const extractTextFromFile = async (filePath, fileName) => {
  const ext = path.extname(fileName).toLowerCase();
  let extractedText = '';

  try {
    if (ext === '.pdf') {
      const pdfParse = require('pdf-parse');
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      extractedText = data.text?.substring(0, 5000) || '';
    } else if (ext === '.docx' || ext === '.doc') {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value?.substring(0, 5000) || '';
    } else if (ext === '.txt') {
      extractedText = fs.readFileSync(filePath, 'utf8').substring(0, 5000);
    } else if (ext === '.pptx' || ext === '.ppt') {
      // Basic PPTX text extraction
      extractedText = `[PowerPoint file: ${fileName}]`;
    }
  } catch (e) {
    console.log('Text extraction note:', e.message);
    extractedText = '';
  }

  return extractedText;
};

exports.uploadNote = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    const { title, description, subject, unit_tags, group_id } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required.' });

    // Extract text from file for AI
    const extractedText = await extractTextFromFile(req.file.path, req.file.originalname);

    const [result] = await db.query(
      'INSERT INTO notes (title, description, subject, unit_tags, file_path, file_name, file_type, file_size, uploaded_by, group_id, extracted_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description || '', subject || '', unit_tags || '', req.file.path, req.file.originalname, req.file.mimetype, req.file.size, req.user.id, group_id || null, extractedText]
    );

    if (group_id) {
      const [members] = await db.query('SELECT user_id FROM group_members WHERE group_id = ? AND user_id != ?', [group_id, req.user.id]);
      for (const member of members) {
        await db.query('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
          [member.user_id, 'New Note Added', `${req.user.name} uploaded "${title}"`, 'note']);
      }
    }

    res.status(201).json({ success: true, message: 'Note uploaded successfully.', noteId: result.insertId });
  } catch (err) { next(err); }
};

exports.getNotes = async (req, res, next) => {
  try {
    const { search, subject, group_id, page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT n.id, n.title, n.description, n.subject, n.unit_tags,
      n.file_path, n.file_name, n.file_type, n.file_size, n.download_count,
      n.group_id, n.created_at,
      u.name as publisher_name, u.avatar as publisher_avatar,
      (SELECT COUNT(*) FROM saved_notes WHERE note_id = n.id AND user_id = ?) as is_saved,
      (SELECT COUNT(*) FROM comments WHERE note_id = n.id) as comment_count
      FROM notes n JOIN users u ON n.uploaded_by = u.id WHERE n.is_deleted = 0`;

    const params = [req.user.id];

    if (search) {
      query += ' AND (n.title LIKE ? OR n.description LIKE ? OR n.subject LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (subject) { query += ' AND n.subject = ?'; params.push(subject); }
    if (group_id) {
      query += ' AND n.group_id = ?'; params.push(group_id);
    } else if (req.user.role !== 'admin') {
      query += ` AND (n.group_id IS NULL OR n.group_id IN (SELECT group_id FROM group_members WHERE user_id = ?))`;
      params.push(req.user.id);
    }

    // Count query
    const countQuery = `SELECT COUNT(*) as total FROM notes n JOIN users u ON n.uploaded_by = u.id WHERE n.is_deleted = 0${search ? ' AND (n.title LIKE ? OR n.description LIKE ? OR n.subject LIKE ?)' : ''}${subject ? ' AND n.subject = ?' : ''}${group_id ? ' AND n.group_id = ?' : (req.user.role !== 'admin' ? ' AND (n.group_id IS NULL OR n.group_id IN (SELECT group_id FROM group_members WHERE user_id = ?))' : '')}`;

    const countParams = params.slice(1);
    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [notes] = await db.query(query, params);
    res.json({ success: true, notes, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
};

exports.getNoteById = async (req, res, next) => {
  try {
    const [notes] = await db.query(
      `SELECT n.*, u.name as publisher_name, u.avatar as publisher_avatar
       FROM notes n JOIN users u ON n.uploaded_by = u.id
       WHERE n.id = ? AND n.is_deleted = 0`,
      [req.params.id]
    );
    if (notes.length === 0) return res.status(404).json({ success: false, message: 'Note not found.' });

    const [comments] = await db.query(
      `SELECT c.*, u.name as user_name, u.avatar, u.role as user_role
       FROM comments c JOIN users u ON c.user_id = u.id
       WHERE c.note_id = ? ORDER BY c.created_at ASC`,
      [req.params.id]
    );
    res.json({ success: true, note: notes[0], comments });
  } catch (err) { next(err); }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const [notes] = await db.query('SELECT * FROM notes WHERE id = ?', [req.params.id]);
    if (notes.length === 0) return res.status(404).json({ success: false, message: 'Note not found.' });
    const note = notes[0];
    if (req.user.role !== 'admin' && note.uploaded_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    await db.query('UPDATE notes SET is_deleted = 1, deleted_at = NOW() WHERE id = ?', [req.params.id]);
    // Clear AI cache
    await db.query('DELETE FROM ai_cache WHERE note_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Note moved to trash.' });
  } catch (err) { next(err); }
};

exports.restoreNote = async (req, res, next) => {
  try {
    await db.query('UPDATE notes SET is_deleted = 0, deleted_at = NULL WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Note restored.' });
  } catch (err) { next(err); }
};

exports.getTrashedNotes = async (req, res, next) => {
  try {
    const [notes] = await db.query(
      'SELECT n.*, u.name as publisher_name FROM notes n JOIN users u ON n.uploaded_by = u.id WHERE n.is_deleted = 1 ORDER BY n.deleted_at DESC'
    );
    res.json({ success: true, notes });
  } catch (err) { next(err); }
};

exports.saveNote = async (req, res, next) => {
  try {
    const { note_id } = req.body;
    const [existing] = await db.query('SELECT id FROM saved_notes WHERE user_id = ? AND note_id = ?', [req.user.id, note_id]);
    if (existing.length > 0) {
      await db.query('DELETE FROM saved_notes WHERE user_id = ? AND note_id = ?', [req.user.id, note_id]);
      return res.json({ success: true, message: 'Note unsaved.', saved: false });
    }
    await db.query('INSERT INTO saved_notes (user_id, note_id) VALUES (?, ?)', [req.user.id, note_id]);
    res.json({ success: true, message: 'Note saved.', saved: true });
  } catch (err) { next(err); }
};

exports.getSavedNotes = async (req, res, next) => {
  try {
    const [notes] = await db.query(
      `SELECT n.*, u.name as publisher_name, u.avatar as publisher_avatar, sn.saved_at
       FROM saved_notes sn JOIN notes n ON sn.note_id = n.id
       JOIN users u ON n.uploaded_by = u.id
       WHERE sn.user_id = ? AND n.is_deleted = 0 ORDER BY sn.saved_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, notes });
  } catch (err) { next(err); }
};

exports.addComment = async (req, res, next) => {
  try {
    const { note_id, content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ success: false, message: 'Comment content required.' });
    const [result] = await db.query(
      'INSERT INTO comments (note_id, user_id, content) VALUES (?, ?, ?)',
      [note_id, req.user.id, content.trim()]
    );
    const [comment] = await db.query(
      `SELECT c.*, u.name as user_name, u.avatar, u.role as user_role
       FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?`,
      [result.insertId]
    );
    res.status(201).json({ success: true, comment: comment[0] });
  } catch (err) { next(err); }
};

exports.downloadNote = async (req, res, next) => {
  try {
    const [notes] = await db.query('SELECT * FROM notes WHERE id = ? AND is_deleted = 0', [req.params.id]);
    if (notes.length === 0) return res.status(404).json({ success: false, message: 'Note not found.' });
    await db.query('UPDATE notes SET download_count = download_count + 1 WHERE id = ?', [req.params.id]);
    const note = notes[0];
    const filePath = path.resolve(note.file_path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found on server.' });
    res.download(filePath, note.file_name);
  } catch (err) { next(err); }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const [notifications] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json({ success: true, notifications });
  } catch (err) { next(err); }
};

exports.markNotificationsRead = async (req, res, next) => {
  try {
    await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};
