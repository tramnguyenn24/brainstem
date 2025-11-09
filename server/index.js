const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
require('reflect-metadata');
const { AppDataSource, seedIfEmpty } = require('./db/data-source');

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.CLIENT_URL || 'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());

// Routes
const usersRouter = require('./routes/users');
const leadsRouter = require('./routes/leads');
const campaignsRouter = require('./routes/campaigns');
const channelsRouter = require('./routes/channels');
const staffRouter = require('./routes/staff');
const studentsRouter = require('./routes/students');
const formsRouter = require('./routes/forms');
const statisticsRouter = require('./routes/statistics');
const mediaRouter = require('./routes/media');
const coursesRouter = require('./routes/courses');
app.use('/api/users', usersRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/channels', channelsRouter);
app.use('/api/staff', staffRouter);
app.use('/api/students', studentsRouter);
app.use('/api/forms', formsRouter);
app.use('/api/statistics', statisticsRouter);
app.use('/api/media', mediaRouter);
app.use('/api/courses', coursesRouter);

app.get('/health', async (req, res) => {
  try {
    const ok = await AppDataSource.query('SELECT 1 as ok');
    const dbOk = Array.isArray(ok) && ok[0] && (ok[0].ok === 1 || ok[0].ok === '1');
    res.status(200).json({ status: 'ok', db: dbOk ? 'up' : 'down' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'down', error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Hello from Express server!');
});

async function start() {
  try {
    await AppDataSource.initialize();
    await AppDataSource.runMigrations();
    await seedIfEmpty();
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Failed to initialize data source', err);
    process.exit(1);
  }
}

start();


