// Install dependencies before running:
// npm init -y
// npm install express body-parser jsonwebtoken dotenv

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'mysecret';

app.use(bodyParser.json());

// ---- TOKEN GENERATION ENDPOINT ----
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Dummy auth check
    if (username === 'admin' && password === 'password') {
        const token = jwt.sign({ user: username }, SECRET_KEY, { expiresIn: '1h' });
        return res.json({ token });
    }
    res.status(401).json({ message: 'Invalid credentials' });
});

// ---- TOKEN VERIFICATION MIDDLEWARE ----
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = decoded;
        next();
    });
}

// ---- GET ENDPOINT ----
app.get('/api/data', verifyToken, (req, res) => {
    res.json({
        message: 'Data fetched successfully',
        user: req.user.user,
        data: [
            { id: 1, name: 'Product A' },
            { id: 2, name: 'Product B' }
        ]
    });
});

// ---- POST ENDPOINT ----
app.post('/api/data', verifyToken, (req, res) => {
    const newData = req.body;
    res.json({
        message: 'Data received successfully',
        received: newData
    });
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
