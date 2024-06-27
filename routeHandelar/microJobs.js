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
int: ["noLand", "Andorra","United Arab Emirates","Afghanistan","Antigua and Barbuda","Anguilla","Albania","Armenia","Angola","Antarctica","Argentina","American Samoa","Austria","Australia","Aruba","Aland Islands","Azerbaijan","Bosnia and Herzegovina","Barbados","Bangladesh","Belgium","Burkina Faso","Bulgaria","Bahrain","Burundi","Benin","Saint Barthelemy","Bermuda","Brunei","Bolivia","Bonaire, Saint Eustatius and Saba ","Brazil","Bahamas","Bhutan","Bouvet Island","Botswana","Belarus","Belize","Canada","Cocos Islands","Democratic Republic of the Congo","Central African Republic","Republic of the Congo","Switzerland","Ivory Coast","Cook Islands","Chile","Cameroon","China","Colombia","Costa Rica","Cuba","Cabo Verde","Curacao","Christmas Island","Cyprus","Czechia","Germany","Djibouti","Denmark","Dominica","Dominican Republic","Algeria","Ecuador","Estonia","Egypt","Western Sahara","Eritrea","Spain","Ethiopia","Finland","Fiji","Falkland Islands","Micronesia","Faroe Islands","France","Gabon","United Kingdom","Grenada","Georgia","French Guiana","Guernsey","Ghana","Gibraltar","Greenland","Gambia","Guinea","Guadeloupe","Equatorial Guinea","Greece","South Georgia and the South Sandwich Islands","Guatemala","Guam","Guinea-Bissau","Guyana","Hong Kong","Heard Island and McDonald Islands","Honduras","Croatia","Haiti","Hungary","Indonesia","Ireland","Israel","Isle of Man","India","British Indian Ocean Territory","Iraq","Iran","Iceland","Italy","Jersey","Jamaica","Jordan","Japan","Kenya","Kyrgyzstan","Cambodia","Kiribati","Comoros","Saint Kitts and Nevis","North Korea","South Korea","Kosovo","Kuwait","Cayman Islands","Kazakhstan","Laos","Lebanon","Saint Lucia","Liechtenstein","Sri Lanka","Liberia","Lesotho","Lithuania","Luxembourg","Latvia","Libya","Morocco","Monaco","Moldova","Montenegro","Saint Martin","Madagascar","Marshall Islands","North Macedonia","Mali","Myanmar","Mongolia","Macao","Northern Mariana Islands","Martinique","Mauritania","Montserrat","Malta","Mauritius","Maldives","Malawi","Mexico","Malaysia","Mozambique","Namibia","New Caledonia","Niger","Norfolk Island","Nigeria","Nicaragua","The Netherlands","Norway","Nepal","Nauru","Niue","New Zealand","Oman","Panama","Peru","French Polynesia","Papua New Guinea","Philippines","Pakistan","Poland","Saint Pierre and Miquelon","Pitcairn","Puerto Rico","Palestinian Territory","Portugal","Palau","Paraguay","Qatar","Reunion","Romania","Serbia","Russia","Rwanda","Saudi Arabia","Solomon Islands","Seychelles","Sudan","South Sudan","Sweden","Singapore","Saint Helena","Slovenia","Svalbard and Jan Mayen","Slovakia","Sierra Leone","San Marino","Senegal","Somalia","Suriname","Sao Tome and Principe","El Salvador","Sint Maarten","Syria","Eswatini","Turks and Caicos Islands","Chad","French Southern Territories","Togo","Thailand","Tajikistan","Tokelau","Timor Leste","Turkmenistan","Tunisia","Tonga","Turkey","Trinidad and Tobago","Tuvalu","Taiwan","Tanzania","Ukraine","Uganda","United States Minor Outlying Islands","United States","Uruguay","Uzbekistan","Vatican","Saint Vincent and the Grenadines","Venezuela","British Virgin Islands","U.S. Virgin Islands","Vietnam","Vanuatu","Wallis and Futuna","Samoa","Yemen","Mayotte","South Africa","Zambia","Zimbabwe","Serbia and Montenegro","Netherlands Antilles"],
    
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