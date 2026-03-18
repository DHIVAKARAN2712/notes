const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

exports.createGroup = async (req, res, next) => {
  try {
    const { name, description, subject } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Group name is required.' });
    const invite_code = uuidv4().substring(0, 8).toUpperCase();
    const [result] = await db.query(
      'INSERT INTO groups_table (name, description, subject, invite_code, created_by) VALUES (?, ?, ?, ?, ?)',
      [name, description || '', subject || '', invite_code, req.user.id]
    );
    await db.query('INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, "admin")', [result.insertId, req.user.id]);
    res.status(201).json({ success: true, message: 'Group created.', groupId: result.insertId, invite_code });
  } catch (err) { next(err); }
};

exports.joinGroup = async (req, res, next) => {
  try {
    const { invite_code } = req.body;
    if (!invite_code) return res.status(400).json({ success: false, message: 'Invite code required.' });
    const [groups] = await db.query('SELECT * FROM groups_table WHERE invite_code = ? AND is_active = 1', [invite_code]);
    if (groups.length === 0) return res.status(404).json({ success: false, message: 'Invalid invite code.' });
    const group = groups[0];
    const [existing] = await db.query('SELECT id FROM group_members WHERE group_id = ? AND user_id = ?', [group.id, req.user.id]);
    if (existing.length > 0) return res.status(409).json({ success: false, message: 'Already a member.' });
    await db.query('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)', [group.id, req.user.id]);
    res.json({ success: true, message: `Joined group "${group.name}" successfully.`, group });
  } catch (err) { next(err); }
};

exports.getGroups = async (req, res, next) => {
  try {
    let query, params;
    if (req.user.role === 'admin') {
      query = `SELECT g.*, u.name as creator_name, (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count, (SELECT COUNT(*) FROM notes WHERE group_id = g.id AND is_deleted = 0) as notes_count FROM groups_table g JOIN users u ON g.created_by = u.id WHERE g.is_active = 1 ORDER BY g.created_at DESC`;
      params = [];
    } else {
      query = `SELECT g.*, u.name as creator_name, gm.role as my_role, (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count, (SELECT COUNT(*) FROM notes WHERE group_id = g.id AND is_deleted = 0) as notes_count FROM groups_table g JOIN users u ON g.created_by = u.id JOIN group_members gm ON g.id = gm.group_id WHERE gm.user_id = ? AND g.is_active = 1 ORDER BY g.created_at DESC`;
      params = [req.user.id];
    }
    const [groups] = await db.query(query, params);
    res.json({ success: true, groups });
  } catch (err) { next(err); }
};

exports.getGroupById = async (req, res, next) => {
  try {
    const [groups] = await db.query('SELECT g.*, u.name as creator_name FROM groups_table g JOIN users u ON g.created_by = u.id WHERE g.id = ?', [req.params.id]);
    if (groups.length === 0) return res.status(404).json({ success: false, message: 'Group not found.' });
    const [members] = await db.query('SELECT u.id, u.name, u.email, u.avatar, gm.role, gm.joined_at FROM group_members gm JOIN users u ON gm.user_id = u.id WHERE gm.group_id = ?', [req.params.id]);
    res.json({ success: true, group: groups[0], members });
  } catch (err) { next(err); }
};

exports.deleteGroup = async (req, res, next) => {
  try {
    await db.query('UPDATE groups_table SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Group deleted.' });
  } catch (err) { next(err); }
};

exports.removeUserFromGroup = async (req, res, next) => {
  try {
    const { group_id, user_id } = req.params;
    await db.query('DELETE FROM group_members WHERE group_id = ? AND user_id = ?', [group_id, user_id]);
    res.json({ success: true, message: 'User removed from group.' });
  } catch (err) { next(err); }
};
