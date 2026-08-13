const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 1710;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data if not existing
const initialData = {
  profiles: [
    {
      id: "p1",
      name: "Bé Bon",
      gender: "boy", // "boy" or "girl"
      birthYear: 2018,
      avatar: "🏎️",
      balance: 0,
      rewards: [
        { id: "r1", title: "Đi học đúng giờ", amount: 2000, icon: "🎒" },
        { id: "r2", title: "Tự giác làm bài tập", amount: 5000, icon: "✍️" },
        { id: "r3", title: "Giúp mẹ dọn bàn ăn", amount: 3000, icon: "🧹" },
        { id: "r4", title: "Đạt điểm 9 hoặc 10", amount: 10000, icon: "💯" },
        { id: "r5", title: "Ăn cơm ngoan không ngậm", amount: 2000, icon: "🍚" },
        { id: "r6", title: "Tự cất đồ chơi gọn gàng", amount: 2000, icon: "🏎️" }
      ],
      fines: [
        { id: "f1", title: "Không làm bài tập", amount: 5000, icon: "❌" },
        { id: "f2", title: "Xem TV / iPad quá giờ", amount: 3000, icon: "📺" },
        { id: "f3", title: "Cãi lời bố mẹ", amount: 10000, icon: "🗣️" },
        { id: "f4", title: "Vứt đồ đạc bừa bãi", amount: 3000, icon: "🚫" },
        { id: "f5", title: "Lười ăn / Ngậm cơm", amount: 2000, icon: "🥣" }
      ],
      wishlist: [
        { id: "w1", title: "Xe Ô Tô Đồ Chơi Điều Khiển", targetAmount: 100000, icon: "🚗" },
        { id: "w2", title: "Bộ Lego Siêu Nhân", targetAmount: 200000, icon: "🧩" }
      ],
      history: []
    },
    {
      id: "p2",
      name: "Bé Sam",
      gender: "girl",
      birthYear: 2021,
      avatar: "👑",
      balance: 0,
      rewards: [
        { id: "r1", title: "Đi học đúng giờ", amount: 2000, icon: "🎒" },
        { id: "r2", title: "Chăm chỉ tập vẽ / học bài", amount: 5000, icon: "🎨" },
        { id: "r3", title: "Giúp mẹ gấp quần áo", amount: 3000, icon: "👗" },
        { id: "r4", title: "Ăn ngoan hết suất", amount: 2000, icon: "🍲" },
        { id: "r5", title: "Tự cất búp bê ngăn nắp", amount: 2000, icon: "🪆" }
      ],
      fines: [
        { id: "f1", title: "Không chịu học bài", amount: 5000, icon: "❌" },
        { id: "f2", title: "Xem Youtube quá giờ", amount: 3000, icon: "📱" },
        { id: "f3", title: "Khóc nhè / Nhè nheo", amount: 3000, icon: "😭" },
        { id: "f4", title: "Bày đồ chơi không dọn", amount: 3000, icon: "🧸" }
      ],
      wishlist: [
        { id: "w1", title: "Búp Bê Công Chúa Elsa", targetAmount: 120000, icon: "👑" },
        { id: "w2", title: "Bộ Đồ Chơi Nấu Ăn Pinky", targetAmount: 180000, icon: "🍳" }
      ],
      history: []
    }
  ],
  activeProfileId: "p1",
  pinCode: "1234"
};

// Ensure data store exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
}

// API Routes
app.get('/api/data', (req, res) => {
  try {
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(rawData));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

app.post('/api/data', (req, res) => {
  try {
    const newData = req.body;
    fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2), 'utf8');
    res.json({ success: true, message: 'Data saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Serve Static Assets
app.use(express.static(path.join(__dirname, 'public')));

// Mobile Web Route
app.get(['/m', '/m/*'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fallback to /m for root
app.get('/', (req, res) => {
  res.redirect('/m');
});

app.listen(PORT, () => {
  console.log(`🚀 Bon Sam Rewards Server is running on http://localhost:${PORT}/m`);
});
