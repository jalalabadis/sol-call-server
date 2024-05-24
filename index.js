const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
var cors = require('cors');
const userHandelar = require('./routeHandelar/userAuth');

const sequelize = require('./database/database');
const User = require('./models/User');

  
//App initialization
const PORT = process.env.PORT || 4000;
const app = express();
dotenv.config();
app.use(cors());
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



  // Define routes
app.post('/users', async (req, res) => {
    try {
      const user = await User.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });


  app.get('/users', async (req, res) => {
    try {
      const users = await User.findAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/users/:id', async (req, res) => {
    try {
      const user = await User.findOne({ where: { email: 'hre@gmail.com' } });
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put('/users/:id', async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (user) {
        await user.update(req.body);
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  app.delete('/users/:id', async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (user) {
        await user.destroy();
        res.status(204).end();
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

//App Routes
app.use('/user', userHandelar);
app.get('*', (req, res) => {res.sendFile(path.join(__dirname, 'build', 'index.html'));});



////listen server
app.listen(PORT, ()=>{
    console.log('Server run port '+PORT);
});