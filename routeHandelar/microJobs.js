const express = require('express');
const router = express.Router();
const path = require('path');
const Job = require('../models/Job');
const User = require('../models/User');
const Notify = require('../models/Notify');
const authCheck = require('../middlewares/authCheck');
const Task = require('../models/Task');
const { Sequelize, Op, DataTypes } = require('sequelize');
const adminCheck = require('../middlewares/adminCheck');
const Admin = require('../models/Admin');
const AdminNotify = require('../models/AdminNotify');

////////////=============Job For Worker================//////////

const zoneCountry = {
int: ['Albania',
    'Algeria',
    'Australia',
    'Bangladesh',
    'Brazil',
    'Cambodia',
    'Canada',
    'China',
    'Egypt',
    'Ethiopia',
    'Finland',
    'France',
    'Germany',
    'Ghana',
    'India',
    'Indonesia',
    'Iran',
    'Italy',
    'Kenya',
    'Lithuania',
    'Madagascar',
    'Malaysia',
    'Morocco',
    'Nepal',
    'Nigeria',
    'Pakistan',
    'Philippines',
    'Poland',
    'Romania',
    'Saudi Arabia',
    'Slovenia',
    'Spain',
    'Sri Lanka',
    'Tunisia',
    'Turkey',
    'United Kingdom',
    'United States',
    'Venezuela',
    'Vietnam',
    'Zimbabwe'],
    
usa:[
    'Australia',
    'Canada',
    'New Zealand',
    'United Kingdom',
    'United States'],
    
west:[
    'Austria',
    'Belgium',
    'Denmark',
    'Finland',
    'France',
    'Germany',
    'Iceland',
    'Ireland',
    'Italy',
    'Luxembourg',
    'Monaco',
    'Norway',
    'Portugal',
    'San Marino',
    'Spain',
    'Sweden',
    'Switzerland',
    'United Kingdom'
    ],
    
east:[
        'Albania',
        'Armenia',
        'Belarus',
        'Bosnia and Herzegovina',
        'Bulgaria',
        'Croatia',
        'Cyprus',
        'Czech Republic',
        'Estonia',
        'Greece',
        'Hungary',
        'Lithuania',
        'Macedonia',
        'Malta',
        'Poland',
        'Romania',
        'Russian Federation',
        'Serbia',
        'Slovakia',
        'Slovenia',
        'Turkey',
        'Ukraine',
    ],
    
africa:[
    'Angola',
    'Botswana',
    'Congo - Brazzaville',
    'Congo - Kinshasa',
    'Egypt',
    'Ethiopia',
    'Ghana',
    'Kenya',
    'Libya',
    'Morocco',
    'Mozambique',
    'Nigeria',
    'Rwanda',
    'South Africa',
    'Tanzania',
    'Uganda',
    'Zimbabwe',
    ],
    
asia:[
        'Bangladesh',
        'China',
        'India',
        'Indonesia',
        'Japan',
        'Korea',
        'Malaysia',
        'Pakistan',
        'Philippines',
        'Singapore',
        'Sri Lanka',
        'Thailand',
        'Vietnam'
    ],
    
 muslim:[
    'Algeria',
    'Bangladesh',
    'Egypt',
    'India',
    'Indonesia',
    'Iran',
    'Morocco',
    'Nigeria',
    'Pakistan',
    'Turkey',
    ],
    
latin:[
    'Argentina',
    'Bolivia',
    'Brazil',
    'Chile',
    'Colombia',
    'Ecuador',
    'Falkland',
    'French Guiana',
    'Guyana',
    'Mexico',
    'Paraguay',
    'Peru',
    'Suriname',
    'Uruguay',
    'Venezuela'
    ]
};

router.post('/', authCheck, async (req, res) => {
  try {
    if (req.userData?.userName) {
      const user = await User.findOne({ where: { userName: req.userData?.userName } });
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const completedTasks = await Task.findAll({ where: { userName: req.userData?.userName } });
      const completedTaskIds = completedTasks.map(task => task.jobID);
      const userCountry = user.country;  // Assuming user's country is stored in 'country' field

      // Dynamically generate the targetZone condition based on the user's country
      let targetZoneCondition = {
        [Op.or]: [{ [Op.eq]: null }]  // Default condition if no target zones match
      };

      Object.keys(zoneCountry).forEach(zone => {
        if (zoneCountry[zone].includes(userCountry)) {
          targetZoneCondition[Op.or].push({ [Op.like]: `%${zone}%` });
        }
      });

      // Find jobs that are not completed by this user and are approved
      const JobData = await Job.findAll({
        where: {
          id: { [Op.notIn]: completedTaskIds },  // Job ID should not be in the list of completed task IDs
          status: "approved",  // Job status should be "approved"
          targetZone: targetZoneCondition,  // User's country should be included in targetZone
          excludeCountry: {
            [Op.or]: [
              { [Op.notLike]: `%${userCountry}%` },  // User's country should not be included in excludeCountry
              { [Op.eq]: null }  // Or excludeCountry can be null (no countries excluded)
            ]
          }
        }
      });

      res.status(200).json(JobData);
    } else {
      res.status(500).send('Internal server error');
    }
  } catch (error) {
    console.error('Failed to retrieve job data:', error);
    res.status(500).send('Internal server error');
  }
});


 ////Job Request Single by Task Submit page Worker
 router.post('/single-job', authCheck, async (req, res) => {
  try {
    if (req.userData?.userName) {
      const completedTasks = await Task.findAll({ where: { userName: req.userData.userName } });
      const completedTaskIds = completedTasks.map(task => task.jobID);

      if (completedTaskIds.includes(parseFloat(req.body.jobID))) {
        res.status(400).json('Already Done');
      } else {
        // Find tasks that are not completed by this user
        const jobData = await Job.findOne({ where: { id: req.body.jobID, status: "approved" } });
         if(jobData){
          res.status(200).json(jobData);
         }
         else{
          res.status(500).send('Internal server error');
            }
      }
    } else {
      res.status(500).send('Internal server error');
    }
  } catch (error) {
    console.error('Failed to retrieve job data:', error);
    res.status(500).send('Internal server error');
  }
});

  



//Export
module.exports = router;