const express = require('express');
const cors = require('cors');
const { connect } = require('mongoose');
require('dotenv').config();
const upload = require('express-fileupload')

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = ["https://blog-app-shubham.vercel.app"];

app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200, // for legacy browsers that choke on 204
  maxAge: 600 // cache the preflight response for 10 minutes
}));

// Handle preflight requests explicitly
app.options('*', cors({
  credentials: true,
  origin: allowedOrigins
}));


app.use(upload())
app.use('/uploads', express.static(__dirname + '/uploads'))

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.use(notFound);
app.use(errorHandler);

const MONGO_URI = 'mongodb+srv://dwivedishubham545:Shubham%40545@cluster0.phi1z.mongodb.net/Blog';
const PORT = process.env.PORT || 5000;

connect(MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log('MongoDB connected successfully');
        });
    })
    .catch(error => {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit the process if the connection fails
    });
