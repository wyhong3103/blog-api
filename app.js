const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors')
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config();

const RateLimit = require('express-rate-limit');
const limiter = RateLimit({
    windowMs : 1 * 60 * 1000,
    max : 30,
})


const apiRouter = require('./routes/api');

mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGODB_URI;

main().catch(err => console.log(err));
async function main(){
    await mongoose.connect(mongoDB);
}

const app = express();

app.use(limiter);
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRouter);

module.exports = app;
