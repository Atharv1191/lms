const express = require("express");
const cors = require("cors");
const connectDB = require("./configs/mongodb");
const { clerkWebhooks, stripeWebhooks } = require("./controllers/webhookes");
const router = require("./routes/educatorRoutes");
const courseRouter = require('./routes/CourseRoutes.js');
const userRouter = require('./routes/userRoutes.js');
const { clerkMiddleware } = require('@clerk/express');
const connectCloudinary = require("./configs/cloudinary");
require('dotenv').config();

const app = express();

// Connect to DBs
connectDB();
connectCloudinary();

// Basic middleware
app.use(cors());
app.use(clerkMiddleware());

// Stripe webhook route FIRST (must receive raw body)
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// Now enable JSON parser for the rest
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('API Is working'));
app.post('/clerk', clerkWebhooks);
app.use('/api/educator', router);
app.use('/api/course', courseRouter);
app.use('/api/user', userRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
