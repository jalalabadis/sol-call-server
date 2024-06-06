const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
var cors = require('cors');
const authHandelar = require('./routeHandelar/userAuth');
const adminHandelar = require('./routeHandelar/adminAuth');
const profileHandelar = require('./routeHandelar/profile');
const depositPayHandelar = require('./routeHandelar/deposit-pay');
const withdrawPayHandelar = require('./routeHandelar/withdraw-pay');
const depositRequestHandelar = require('./routeHandelar/deposit-request');
const withdrawRequestHandelar = require('./routeHandelar/withdraw-request');
const notifyHandelar = require('./routeHandelar/notify');
const jobHandelar = require('./routeHandelar/jobs');
const taskHandelar = require('./routeHandelar/task');
const sequelize = require('./database/database');

  
//App initialization
const PORT = process.env.PORT || 4000;
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
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
app.use('/profile', profileHandelar);
app.use('/deposit-pay', depositPayHandelar);
app.use('/withdraw-pay', withdrawPayHandelar);
app.use('/deposit-request', depositRequestHandelar);
app.use('/withdraw-request', withdrawRequestHandelar);
app.use('/notify', notifyHandelar);
app.use('/job', jobHandelar);
app.use('/task', taskHandelar);
app.get('*', (req, res) => {res.sendFile(path.join(__dirname, 'build', 'index.html'));});



////listen server
app.listen(PORT, ()=>{
    console.log('Server run port '+PORT);
});