const db = require('../config/database');

// Get all conversations for current user
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [convos] = await db.query(`
      SELECT
        m.*,
        sender.name   as sender_name,
        sender.avatar as sender_avatar,
        sender.role   as sender_role,
        receiver.name   as receiver_name,
        receiver.avatar as receiver_avatar,
        receiver.role   as receiver_role,
        n.title as note_title,
        (SELECT COUNT(*) FROM messages m2
         WHERE m2.conversation_id = m.conversation_id
         AND m2.receiver_id = ? AND m2.is_read = 0) as unread_count
      FROM messages m
      JOIN users sender   ON m.sender_id   = sender.id
      JOIN users receiver ON m.receiver_id = receiver.id
      LEFT JOIN notes n   ON m.note_id     = n.id
      WHERE m.id IN (
        SELECT MAX(id) FROM messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY conversation_id
      )
      ORDER BY m.created_at DESC
    `, [userId, userId, userId]);

    res.json({ success: true, conversations: convos });
  } catch (err) { next(err); }
};

// Get messages in a conversation
exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const [messages] = await db.query(`
      SELECT m.*,
        sender.name   as sender_name,
        sender.avatar as sender_avatar,
        sender.role   as sender_role
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      WHERE m.conversation_id = ?
        AND (m.sender_id = ? OR m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `, [conversationId, userId, userId]);

    // Mark as read
    await db.query(
      'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND receiver_id = ?',
      [conversationId, userId]
    );

    res.json({ success: true, messages });
  } catch (err) { next(err); }
};

// Send a message
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiver_id, content, note_id, conversation_id } = req.body;
    const sender_id = req.user.id;

    if (!receiver_id || !content?.trim()) {
      return res.status(400).json({ success: false, message: 'Receiver and message content required.' });
    }
    if (receiver_id === sender_id) {
      return res.status(400).json({ success: false, message: 'Cannot message yourself.' });
    }

    // Verify receiver exists
    const [receiver] = await db.query('SELECT id, name FROM users WHERE id = ?', [receiver_id]);
    if (receiver.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

    // Generate or use conversation_id
    let convoId = conversation_id;
    if (!convoId) {
      // Check existing conversation between these two users
      const [existing] = await db.query(`
        SELECT conversation_id FROM messages
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
        LIMIT 1
      `, [sender_id, receiver_id, receiver_id, sender_id]);

      convoId = existing.length > 0
        ? existing[0].conversation_id
        : `conv_${Math.min(sender_id, receiver_id)}_${Math.max(sender_id, receiver_id)}`;
    }

    const [result] = await db.query(
      'INSERT INTO messages (sender_id, receiver_id, content, note_id, conversation_id) VALUES (?, ?, ?, ?, ?)',
      [sender_id, receiver_id, content.trim(), note_id || null, convoId]
    );

    // Notification
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [receiver_id, 'New Message', `${req.user.name}: ${content.trim().substring(0, 50)}`, 'message']
    );

    const [msg] = await db.query(`
      SELECT m.*, u.name as sender_name, u.avatar as sender_avatar, u.role as sender_role
      FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = ?
    `, [result.insertId]);

    res.status(201).json({ success: true, message: msg[0], conversation_id: convoId });
  } catch (err) { next(err); }
};

// Get users that current user can message
exports.getContacts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let users;

    if (req.user.role === 'admin') {
      // Admin can see all students
      const [rows] = await db.query(
        'SELECT id, name, email, role, avatar FROM users WHERE id != ? AND is_active = 1 ORDER BY name',
        [userId]
      );
      users = rows;
    } else {
      // Students can message note uploaders (admins) and users they've messaged before
      const [rows] = await db.query(`
        SELECT DISTINCT u.id, u.name, u.email, u.role, u.avatar
        FROM users u
        WHERE u.id != ? AND u.is_active = 1
        AND (u.role = 'admin'
          OR u.id IN (SELECT DISTINCT uploaded_by FROM notes WHERE is_deleted = 0)
          OR u.id IN (SELECT DISTINCT sender_id FROM messages WHERE receiver_id = ?)
          OR u.id IN (SELECT DISTINCT receiver_id FROM messages WHERE sender_id = ?))
        ORDER BY u.role DESC, u.name ASC
      `, [userId, userId, userId]);
      users = rows;
    }

    res.json({ success: true, users });
  } catch (err) { next(err); }
};

// Get unread count
exports.getUnreadCount = async (req, res, next) => {
  try {
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0',
      [req.user.id]
    );
    res.json({ success: true, count: result[0].count });
  } catch (err) { next(err); }
};
