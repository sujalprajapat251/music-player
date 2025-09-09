require('dotenv').config();
const express = require('express');
const connectDb = require('./db/db');
const cors = require('cors')
const path = require('path')
const indexRoutes = require('./routes/index.routes');
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 4000

app.use(express.json())
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

require('./helper/cronJob');
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/api', indexRoutes);

// Define a root route
app.get('/', (req, res) => {
    res.send('Hello Music Player ! 🎵🎹');
});

app.listen(port, () => {
    connectDb();
    console.log(`Server is running on port ${port}`);
})
