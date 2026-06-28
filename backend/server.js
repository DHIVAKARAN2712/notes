require('dotenv').config()
console.log(process.env.GEMINI_API_KEY)
console.log("GEMINI KEY:", process.env.GEMINI_API_KEY); // add this line
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

// Auto-create uploads folder
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ uploads folder created');
}

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/notes',    require('./routes/notesRoutes'));
app.use('/api/groups',   require('./routes/groupRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/ai',       require('./routes/aiRoutes'));

app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', message: 'EduWallet v3 API running ✅' })
);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 EduWallet Server running on http://localhost:${PORT}`);
});

module.exports = app;
