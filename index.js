const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
var cors = require('cors');
const authHandelar = require('./routeHandelar/userAuth');
const adminHandelar = require('./routeHandelar/adminAuth');
const gameHandelar = require('./routeHandelar/game');
const withdrawRequestHandelar = require('./routeHandelar/withdraw-request');
const sequelize = require('./database/database');

//////////Cross
const allowedDomains = ['http://localhost:4000', 'http://localhost:3000', 'https://bettercallsolgoodman.fun'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedDomains.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

//App initialization
const PORT = process.env.PORT || 4000;
const app = express();
app.use(cors(corsOptions));
dotenv.config();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));





// Sync all models
sequelize.sync(/*{ alter: true }*/)
  .then(() => {
    console.log('Database schema updated!');
  })
  .catch(error => {
    console.error('Error syncing database:', error);
  });


 

//App Routes
app.use('/auth', authHandelar);
app.use('/admin', adminHandelar);
app.use('/game', gameHandelar);
app.use('/withdraw', withdrawRequestHandelar);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});




////listen server
app.listen(PORT, ()=>{
    console.log('Server run port '+PORT);
});