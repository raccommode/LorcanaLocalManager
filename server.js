const express = require('express');
const path = require('path');

const app = express();
const PORT = 1923;

// Serve static files
app.use(express.static('public'));

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🃏 LorcanaLocalManager running on port ${PORT}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
});