const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
var cors = require('cors');
const cron = require('node-cron');
const authHandelar = require('./routeHandelar/userAuth');
const adminHandelar = require('./routeHandelar/adminAuth');
const profileHandelar = require('./routeHandelar/profile');
const depositPayHandelar = require('./routeHandelar/deposit-pay');
const withdrawPayHandelar = require('./routeHandelar/withdraw-pay');
const depositRequestHandelar = require('./routeHandelar/deposit-request');
const withdrawRequestHandelar = require('./routeHandelar/withdraw-request');
const notifyHandelar = require('./routeHandelar/notify');
const jobHandelar = require('./routeHandelar/jobs');
const microJobsHandelar = require('./routeHandelar/microJobs');
const taskHandelar = require('./routeHandelar/task');
const supportHandelar = require('./routeHandelar/support');
const affiliateHandelar = require('./routeHandelar/affiliate');
const sequelize = require('./database/database');
const checkTasks = require('./AutoMotion/checkTasks');

  
//////////Cross
const allowedDomains = ['http://localhost:3000', 'http://localhost:3001'];

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


  //AutoMotion
cron.schedule('0 */6 * * *', () => {
  checkTasks();
  
  
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
app.use('/micro-jobs', microJobsHandelar);
app.use('/task', taskHandelar);
app.use('/support', supportHandelar);
app.use('/affiliate', affiliateHandelar);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


////listen server
app.listen(PORT, ()=>{
    console.log('Server run port '+PORT);
});