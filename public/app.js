// author: J.Stec ; Final project 

// datepicker
$(function() {
	$("#dateID").datepicker();
});

// 	controller
angular.module('SearchForm', []).controller('resultController', function ($scope, $http) {
	var artistField = document.getElementById("artist"); // get data in artist field
	
	// getJSON function --> sends artist field data to server, receives songkick data and passes back to HTML for parsing
	$scope.getJSON = function() {
		var url = 'http://localhost:8081/searchArtist/';
		if (artistField.checkValidity() == false) { // don't show results if nothing in artist field 
			$scope.showResults = false; 
		} 
		else { 	
			$http.get(url, {params: { artist: $scope.artistMod.replace(/ /g, '').replace(/the/g, '').replace(/and/g, '').replace(/of/g, '')}})
            .success(function(data){ // pass artist data to server side for API search
                $scope.showStatus = true;
                var loopData = data.event;
				if (loopData == null) { // no data found for artist
					$scope.showResults = false;
					alert("No upcoming concerts found."); 
				}
				else { // data found for artist
					var indexCopy = []; 
					var toRemove = [];
					// start filtering
					if (($scope.eventMod != null) && ($scope.eventMod != '')) { // filter by event
						for (i in loopData) { 
							var eventString = JSON.stringify($scope.eventMod);
							if (JSON.stringify(loopData[i].type) != eventString) { // if concert doesn't match the requested event
								toRemove.push(loopData[i].id); // add to toRemove list
							}
						}
					}
					if (($scope.venueMod != null) && ($scope.venueMod != '')) { // filter by venue
						for (i in loopData) { 
							var venueString = JSON.stringify($scope.venueMod);
							if (JSON.stringify(loopData[i].venue.displayName) != venueString) { 
								toRemove.push(loopData[i].id); 
							}						
						}
					}
					if (($scope.locationMod != null) && ($scope.locationMod != '')) { // filter by location
						for (i in loopData) { 
							var locationString = JSON.stringify($scope.locationMod);
							if (JSON.stringify(loopData[i].location.city) != locationString) { 
								toRemove.push(loopData[i].id); 
							}						
						}
					}
					var dateString = document.forms["concertForm"]["dateID"].value; // filter by date
					if ((dateString != null) && (dateString != '')) {
						var splitDate = dateString.split('/'); 
						dateString = splitDate[2] + "-" + splitDate[0] + "-" + splitDate[1]; // have to restructure date format 
						var dateString_02 = JSON.stringify(dateString);
						for (i in loopData) { 
							if (JSON.stringify(loopData[i].start.date) != dateString_02) { 
								toRemove.push(loopData[i].id); 
							}						
						}						
					}		
					if (($scope.ageMod != null) && ($scope.ageMod != '')) { // filter by age
						if ($scope.ageMod == "All ages") { // all ages permitted 
							for (i in loopData) { 
								if ((loopData[i].ageRestriction != null)) { // if there is a restriction 
									toRemove.push(loopData[i].id); // remove
								}
							}						
						}
						else if ($scope.ageMod == "All") { } // display all concerts, regardless of age restrictions
						else { // for 18+ and 21+
							var ageVal = parseInt($scope.ageMod.slice(0, 2));
							for (i in loopData) { 
								var indexAgeVal = parseInt(JSON.stringify(loopData[i].ageRestriction).slice(5, 8));
								if ((loopData[i].ageRestriction == null) || (indexAgeVal < ageVal)) { 
									toRemove.push(loopData[i].id);
								}
							}
						}						
					}
					for (i in loopData) { // remove toRemove
						if (toRemove.indexOf(loopData[i].id) <= -1) {
							indexCopy.push(loopData[i]);
						}
					}
					$scope.songkickData = indexCopy;
					if ($scope.songkickData.length == 0) { // filter criteria returns nothing 
						$scope.showResults = false;
						alert("No upcoming concerts of matching criteria found.");
					}
					else { // return something
						$scope.showResults = true;
						alert("Search Finished.\nPlease scroll down.");
					}
				}
            })
            .error(function(){ // catch non-artists
                alert("ERROR RETRIEVING ARTIST");
            });
		}	
	};
});
