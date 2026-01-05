const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const initDb = require('./utils/initDb');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/', apiRoutes);

// Start server
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await initDb();
        console.log('Database initialized');
    } catch (e) {
        console.error('Failed to initialize DB', e);
    }
});
