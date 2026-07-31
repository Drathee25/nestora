require('dotenv').config();
const express = require('express');
const cors = require('cors');

const propertiesRouter = require('./routes/properties');
const authRouter = require('./routes/auth');
const uploadRouter = require('./routes/upload');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/properties', propertiesRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
