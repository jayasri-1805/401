const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'in.html'));
});
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});
app.get('/dashboard', (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
  } else {
    res.redirect('/login');
  }
});
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'test' && password === 'password123') {
    req.session.loggedIn = true;  
    req.session.username = username; 
    return res.redirect('/dashboard');
  } else {
    return res.send('Invalid credentials. Please try again.');
  }
});
app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  if (username && email && password) {
    return res.redirect('/login'); 
  } else {
    return res.send('Please provide all fields.');
  }
});
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send('Error logging out.');
    }
    res.redirect('/login');
  });
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});