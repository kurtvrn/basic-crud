const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('./firebase-config');

const app = express();
const publicDir = path.join(__dirname, 'public');
const PORT = 3000;

// Create public directory if it doesn't exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
  console.log(`📁 Created public directory: ${publicDir}`);
  
  // Create a basic index.html if none exists
  const indexPath = path.join(publicDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student Management System</title>
      </head>
      <body>
        <h1>Welcome to Student Management System</h1>
        <p>Place your frontend files in the public directory</p>
      </body>
      </html>
    `);
  }
}

// Test Firestore connection
(async () => {
  try {
    const snapshot = await db.listCollections();
    console.log('✅ Firestore connection successful');
  } catch (err) {
    console.error('❌ Firestore connection error:', err);
    process.exit(1);
  }
})();

// Middleware
app.use(express.json());
app.use(express.static(publicDir));

// API endpoints
app.get('/api/students', async (req, res) => {
  try {
    const studentsRef = db.collection('students');
    const snapshot = await studentsRef.get();
    
    const students = [];
    snapshot.forEach(doc => {
      students.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const { studentNumber, password, yearLevel, section } = req.body;
    
    if (!studentNumber || !password || !yearLevel || !section) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const docRef = await db.collection('students').add({
      studentNumber,
      password,
      yearLevel,
      section,
      createdAt: new Date()
    });
    
    res.status(201).json({ id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentNumber, password, yearLevel, section } = req.body;
    
    if (!studentNumber || !password || !yearLevel || !section) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const docRef = db.collection('students').doc(id);
    await docRef.update({
      studentNumber,
      password,
      yearLevel,
      section,
      updatedAt: new Date()
    });
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('students').doc(id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Server running at http://localhost:${PORT}`);
  console.log(`📂 Serving static files from: ${publicDir}`);
  console.log(`🔌 Firestore connection established`);
  console.log(`🚀 API Endpoints:`);
  console.log(`   GET    /api/students     - List all students`);
  console.log(`   POST   /api/students     - Create a student`);
  console.log(`   PUT    /api/students/:id - Update a student`);
  console.log(`   DELETE /api/students/:id - Delete a student`);
});