// author: J.Stec ; Final project

var express = require("express");
var app = express();
var path = require("path");

// allow communication between AngularJS and Express
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}
app.use(allowCrossDomain);

app.use("/required", express.static('required')); 
app.use(express.static('public'));

// get artist input in artist field, search, return songkick data 
app.get('/searchArtist/', function(req, res) { 
	console.log("Search artist request received");
	var http = require('http');
	var artist = req.query["artist"]; // get artist string
	
	console.log("Artist: ", artist);
	// get artistId by artist string
	http.request({host: 'api.songkick.com', path: '/api/3.0/search/artists.json?query=' + artist + '&apikey=oPeBvxh0Jz93CdtR'}, function(response) {
		console.log("In artist request function");
		var responseVar = '';
		var artistId = ''; 
		
		// responseVar set to API data
		response.on("data", function(chunk) { 
			responseVar += chunk;
		});
		
		// when data received
		response.on('end', function() { 
			if (Object.keys(JSON.parse(responseVar).resultsPage.results).length == 0) { // no data found for artist
				console.log("Invalid artist: " + artist);
				res.send(null); // send AngularJS no data
			}
			else {
				artistId = JSON.parse(responseVar).resultsPage.results.artist[0].id; // set artistId to artist's ID
				console.log("Artist ID: ", artistId);
				
				// search for artist information by ID (songkick does not permit searching for concerts by artist name... need ID)
				http.request({host: 'api.songkick.com', path: '/api/3.0/artists/' + artistId + '/calendar.json?apikey=oPeBvxh0Jz93CdtR'}, function (result) { // another API request... this time by artist ID
					console.log("In search by artistId function"); 
					var responseVar_02 = ''; 
				
					// responseVar_02 set to API data of artist ID
					result.on("data", function(chunk_02) { 
						responseVar_02 += chunk_02;
					});			
					
					// send back data to AngularJS
					result.on('end', function() { 
						var sendBack = JSON.parse(responseVar_02).resultsPage.results;
						console.log("Got JSON info");
						res.send(sendBack);
					});
				}).end();
			}
		});
	}).end();
});

// port
var server = app.listen(8081, function () { 
	var port = server.address().port;
	console.log("myApp listening on port %s", port);
});