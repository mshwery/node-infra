var express = require('express');
var router = express.Router();

var api = require('../api-adapter')('/Demand/v1');

/* GET surveys listing. */
router.get('/', function(req, res, next) {
  api.request('/Surveys/BySurveyStatus/01', function(response) {
    var data = '';

    response.on('data', function(chunk) {
      data += chunk;
    }).on('end', function() {
      var json = JSON.parse(data);

      res.render('layout', { page: 'surveys/index', surveys: json.Surveys });
    }).on('error', function(e) {
      console.log('Problem with request: ' + e.message);
      res.send('We are having trouble making the request right now');
    });
  });
});

module.exports = router;
