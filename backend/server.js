require('dotenv').config();
const express = require('express');
const connectDb = require('./db/db');
const cors = require('cors')
const path = require('path')
const indexRoutes = require('./routes/index.routes');

const app = express();
const port = process.env.PORT || 4000

app.use(express.json())
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
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
