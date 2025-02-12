const express = require("express");
const cors = require("cors");
const connectDB = require("./configs/mongodb");
const { clerkWebhooks, stripeWebhooks } = require("./controllers/webhookes");
const router = require("./routes/educatorRoutes");
const courseRouter = require('./routes/CourseRoutes.js');  // Corrected
const userRouter = require('./routes/userRoutes.js')
const { clerkMiddleware } = require('@clerk/express');
const connectCloudinary = require("./configs/cloudinary");
require('dotenv').config();

//initialize express
const app = express();

//connect to database
connectDB();
connectCloudinary();

//middlewares
app.use(cors());
app.use(clerkMiddleware());

//routes
app.get('/', (req, res) => {
    res.send('API Is working');
});
app.post('/clerk', express.json(), clerkWebhooks);
app.use('/api/educator', express.json(), router);
app.use('/api/course', express.json(), courseRouter);  // Corrected
app.use('/api/user',express.json(),userRouter)
app.post('/stripe',express.raw({type:'application/json'}),stripeWebhooks)
//port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
