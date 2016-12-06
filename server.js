var http = require("http");
var port = process.env.PORT || 8080;
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.urlencoded({extended: true}));
var req = require('request');
    var Client = require('node-rest-client').Client;
 
var client = new Client();
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
var db = require('./core/db.js');

app.post('/card', function(request, finalResponse){
        console.log("Server.js invoked with card url");
		console.log("from request",request.body);
        var img     = request.body.imageURL;
            
            console.log('image from url',img);
            
            // set content-type header and data as json in args parameter 
            var args = 
            {
            data: { cardImage: img },
            headers: { "Content-Type": "application/json"}
            };
 
            client.post("http://demo4808326.mockable.io/cardNumber", args, function (data, response) 
            {
            // parsed response body as js object 
            console.log("data from mockable.io",data);
            request.body.cardNumber = data.cardNumber;
                console.log("request body before invoking retrieve card details",request.body);
            db.retrieveCardDetails(request.body, function(err, rows, fields) {
            if(!err)
            {
                    console.log('retrieveCardDetails invoked');
                    var partyId = request.body.partyId;
                    console.log(rows);
                    if(partyId == rows[0].Party_Id && rows[0].Notification_Status == 'Not Sent'
                    && rows[0].Card_Activation_Status == 'Ready' && rows[0].Card_Dispatch_Status == 'Dispatched')
                    {
                    //TODO Integrate activate card service
                   
                    db.updateCardActivationStatus(rows[0].Card_No,img, function(err, data)
                    {
                        if(err) throw err;
                        finalResponse.send('Card Activation Successful'); 
                    });
                }
                else
                {
                    finalResponse.send('Card Already Activated');
                }
            }
    
        });
            });
});

app.post('/cards', function(request, response){
console.log("Server.js invoked with cards url");
		  db.updateCardActivationStatus(request.query.cno, function(err, data)
          {
              if(err) throw err;
             response.send('Card Activation Successful'); 
          });
    
});

app.listen(port, function(){
    console.log('Listening on port number'+port);
});