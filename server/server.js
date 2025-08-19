require('module-alias/register')
const path = require('path');
const express = require("express")
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser')
const { createServer } = require("http");
const cors = require("cors")
dotenv.config();
const app = express();
const https = createServer(app);

const apiRoute = require('@/routes')

const PORT = process.env.PORT ?? 8000

mongoose
  .connect(`${process.env.MongoDB}`)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error))

  const corsOptions = {
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173', 
        'https://scrap-sathi.vercel.app', 
        'https://scrap-sathi-amankum2004s-projects.vercel.app', 
        'https://scrap-sathi-git-main-amankum2004s-projects.vercel.app'
        ];
  
      // Allow requests with no origin (e.g., mobile apps or same-origin requests)
      if (!origin) {
        return callback(null, true);
      }
  
      // Allow all origins in development
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
  
      // Check if the request origin is in the allowedOrigins list
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };


app.options('*', cors(corsOptions)); // Handle preflight requests

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.json());

app.use((req, _, next) => {
  if (!req.url.match(/(assets|images|index\.html|.*\.(svg|png|jpg|jpeg))$/)) {
    console.log(`${req.method} ${req.url}`)
  }
  next()
})


app.use('/api', apiRoute)

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/dist', 'index.html'))
})

https.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })