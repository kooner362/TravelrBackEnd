$(document).ready(function(){
	// Application starts off on landing page, so all other views are hidden.
	$('#country').hide();
	$('.search-results').hide();
	$('.city-info').hide();
	$('#fave-city-review').hide();

	// Clicking the logo takes you to the landing page.
	$('#logo').click(function() {
		$('#gallery').empty();
		$('.search-results').hide();

		$('#city-info-container').empty();
		$('.city-info').hide();

		$('.landing-page').show();
	});

	// Once a continent is selected, the Country dropdown list appears with the countries in the selected continent.
	$.ajax({
		type:'GET',
		url: 'https://api.teleport.org/api/continents/',
		success:function(data) {
			$.each(data['_links']['continent:items'], function(i,item) {
				$('<option>')
				.text(item.name)
				.val(item.href.substr(item.href.length - 3, item.href.length - 1))
				.appendTo('#continent')
			})
		}
	});

  messagesListener();
	function messagesListener(){
	  var on = true;
	  var messagesArr = [];
	  $.ajax({
	    type:'GET',
	    url: '/api/messages/',
	    success:function(data) {
	      data.forEach(function(message){
	        messagesArr.push(message.message);
	      });
				$("#message").empty();
				$("#message").append('<ul id="messages"></ul>');
				for (var i=messagesArr.length - 1; i > -1; i--){
					$('#messages').append('<li>'+messagesArr[i]+'</li>');
				}
				setTimeout(messagesListener, 1000);
	    }
	  });
	}
	// Whenever the continent selection is changed, the country dropdown list is updated.
	$('#continent').change(function() {
		var selection = $('#continent option:selected');
		if (selection.text() != 'Continent') {
			$('#country').empty();
			$('#country').append('<option value="country">Country</option>');
			$.ajax({
				type:'GET',
				url: 'https://api.teleport.org/api/continents/geonames:' + selection.val() + 'countries/',
				success:function(data) {
					$.each(data['_links']['country:items'], function(i,item) {
						$('<option>')
						.text(item.name)
						.val(item.href.substr(item.href.length - 3, item.href.length - 1))
						.appendTo('#country')
					})
				}
			});
			$('#country').show();
		} else {
			$('#country').hide();
		}
	});

	// This function is used to populate the categories in the category dropdown lists.
	function popCategoryList(element) {
		$.ajax({
			type:'GET',
			url: 'https://api.teleport.org/api/urban_areas/teleport:9q8yy/scores/',
			success:function(data) {
				$.each(data.categories, function(i,item) {
					$('<option>')
					.text(item.name)
					.appendTo(element)
				})
			}
		});
	}

	popCategoryList($('#sel1'));
	popCategoryList($('#sel2'));
	popCategoryList($('#sel3'));

	// Helps the user search for existing urban areas with a search prediction.
	$('#searchinput').keyup(
	function searchPrediction(event){
		if (event.which != 13 || event.keyCode != 13){
			$('#searchlist').empty();
			var searchInput = $('#searchinput').val().toLowerCase();
			var allUrban = [];
			var results = [];
			$.ajax({
				type:'GET',
				url: 'https://api.teleport.org/api/urban_areas/',
				success:function(data) {
					data._links['ua:item'].forEach(function(item){
						allUrban.push(item.name.toLowerCase());
					});
					var found = false;
					var position = -1;
					for(let i=0; i < allUrban.length; i++){
						var size = searchInput.length;
						if(allUrban[i].substring(0, size) == searchInput){
							$('#searchlist').append('<option>' + allUrban[i] + '</option>')
						}
					}
				}
			});
		}
		else{
			$('#search-bar-btn').click();
		}
	});

	function removeDashes(s) {
		return s.replace(/-/g, ' ');
	}

	// Formatting of urban area names for displaying names to the user cleanly.
	function formatString(s) {
		var str = removeDashes(s);
		return str.toLowerCase().split(' ')
			.map(function(w) {
				return w[0].toUpperCase() + w.substr(1);
			})
			.join(' ');
	}

	// Creates an image view of a given city in the city info page.
	function createCityImageView(city, categoryNum, score, parentID) {
		$.ajax({
			type:'GET',
			url: 'https://api.teleport.org/api/urban_areas/slug:' + city + '/images/',
			success:function(data) {
				$.each(data.photos, function(i,item) {
					$('#' + parentID)
					.append('<div class="col-md-4" id=' + city + categoryNum + '></div>')
					$('#' + city + categoryNum).click(function() {
						$('.landing-page').hide();
						$('.search-results').hide();
						$('.city-info').show();
						$('#city-info-container')
						.append('<img src=' + item.image['web'] + ' alt=' + city + categoryNum +' style="width:100%">')
						.append("<h2 id='city-name'>" + formatString(city) + '</h2>')
						displayCityInfo(city, categoryNum,'#city-info-container')

					})
					$('#' + city + categoryNum)
					.append('<div class="thumbnail" id=thumb-nail-' + city + categoryNum + '></div>')
					$('#thumb-nail-' + city + categoryNum)
					.append('<img src=' + item.image['web'] + ' alt=' + city + ' style="width:100%">')
					.append('<div class="caption" id=caption-'+ city + categoryNum + '><b>' + formatString(city) + '</b><br/></div>')
					$('#caption-'+ city + categoryNum)
					.append('<b>' + score + ' / 10</b><br/>')
					addStars(score, '#caption-'+ city + categoryNum)
				})
			}
		});
	}

		// Creates an image view of a given city in the city info page.
	function createFavouriteCityImageView(city, categoryNum, parentID) {
		$.ajax({
			type:'GET',
			url: 'https://api.teleport.org/api/urban_areas/slug:' + city + '/images/',
			success:function(data) {
				$.each(data.photos, function(i,item) {
					$('#' + parentID)
					.append('<div class="col-md-4" id=' + city + categoryNum + '></div>')
					$('#' + city + categoryNum).click(function() {
						$('#fave-cities').hide();
						$('#fave-city-info-container')
						.append('<img src=' + item.image['web'] + ' alt=' + city + categoryNum +' style="width:100%">')
						.append("<h2 id='saved-city-name'>" + formatString(city) + '</h2>')
						displayFaveCityInfo(city, categoryNum,'#fave-city-info-container')

					})
					$('#' + city + categoryNum)
					.append('<div class="thumbnail" id=thumb-nail-' + city + categoryNum + '></div>')
					$('#thumb-nail-' + city + categoryNum)
					.append('<img src=' + item.image['web'] + ' alt=' + city + ' style="width:100%">')
					.append('<div class="caption" id=caption-'+ city + categoryNum + '><b>' + formatString(city) + '</b><br/></div>')
					$('#caption-'+ city + categoryNum)
				})
			}
		});
	}

		// A breif description of the city is retrieved from the Teleport api and displayed in the city info page.
	function displayFaveCityInfo(city, categoryNum, parentID) {
		$.ajax({
			type:'GET',
			url: 'https://api.teleport.org/api/urban_areas/slug:' + city + '/scores/',
			success:function(data) {
				$(parentID)
				.append(data['summary'])
				.append('<div class="row" id="fave-city-info-container-row"></div>')
				$('#fave-city-info-container-row')
				.append('<div class="col-md-6" id="fave-city-info-container-col1"></div>')
				.append('<div class="col-md-6" id="fave-city-info-container-col2"></div>')
				//$(parentID).append(data['summary'])
				$.each(data['categories'], function(i,item) {
					if(i >= 0 && i <= 8) {
						$("#fave-city-info-container-col1")
						.append('<p class="star-wrapper" id=' + city + categoryNum + i + '></p>')
						addStars(item.score_out_of_10, '#' + city + categoryNum + i)
						$('#' + city + categoryNum + i)
						.append('<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + item.name + '</span>')
					}
					else {
						$("#fave-city-info-container-col2")
						.append('<p class="star-wrapper" id=' + city + categoryNum + i + '></p>')
						addStars(item.score_out_of_10, '#' + city + categoryNum + i)
						$('#' + city + categoryNum + i)
						.append('<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + item.name + '</span>')
					}
				})
				displaySavedCityReview(city);
			}
		});
	}

	function displaySavedCityReview(savedCity) {
		$.ajax({
			type:'GET',
			url:'/city/saved',
			success:function(data) {
				var exists = false;
				for (var i = 0; i < data.length; i++) {
					var city = data[i]['city'];
					city = city.replace(/\s+/g, '-').toLowerCase();
					savedCity = savedCity.replace(/\s+/g, '-').toLowerCase();
					if (city == savedCity) {
						exists = true;
						$('#saved-comment').val(data[i]['comments']);
						$('#fave-city-review').show();
						$('#comment').val(data[i]['comments']);
					}
				}
				if (!exists) {
						$('#saved-comment').val("");
						$('#fave-city-review').show();
						$('#comment').val("");
				}
			}
		});
	}

	$('#save-review').click(function(){
		var name = $('#saved-city-name').text();
		if (name.length == 0) {
			name = $('#city-name').text();
		}
		var comment = $('#saved-comment').val();
		if (comment == null) {
			comment = $('#comment').val();
		}
		var cityObj = {city: name, comments: comment};
		$.ajax({
			type:'PUT',
			url: '/city/saved',
			data: cityObj
		});
		$('#fave-city-info').hide();
		//$('#city-info-container').hide();
		window.location.reload(true);
		$('#fave-cities').show();
	});


	function setSaveRemoveButton(city) {
		$.ajax({
			type:'GET',
			url: '/city/saved',
			success:function(data) {
				var isSaved = false;
				for (var i = 0; i < data.length; i++) {
					var savedCity = data[i]['city'];
					if (city == savedCity) {
						isSaved = true;
					}
					//createCityImageView(city, i, 10, 'saved-cities');
				}
				if (isSaved) {
					$("#save-review").show();
					$("#remove-city").show();
					$("#save-city").hide();
				} else {
					$("#save-review").hide();
					$("#remove-city").hide();
					$("#save-city").show();
				}
			}
		});
	}

	// A breif description of the city is retrieved from the Teleport api and displayed in the city info page.
	function displayCityInfo(city, categoryNum, parentID) {
		$.ajax({
			type:'GET',
			url: 'https://api.teleport.org/api/urban_areas/slug:' + city + '/scores/',
			success:function(data) {
				$(parentID)
				.append(data['summary'])
				.append('<div class="row" id="city-info-container-row"></div>')
				$('#city-info-container-row')
				.append('<div class="col-md-6" id="city-info-container-col1"></div>')
				.append('<div class="col-md-6" id="city-info-container-col2"></div>')
				//$(parentID).append(data['summary'])
				$.each(data['categories'], function(i,item) {
					if(i >= 0 && i <= 8) {
						$("#city-info-container-col1")
						.append('<p class="star-wrapper" id=' + city + categoryNum + i + '></p>')
						addStars(item.score_out_of_10, '#' + city + categoryNum + i)
						$('#' + city + categoryNum + i)
						.append('<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + item.name + '</span>')
					}
					else {
						$("#city-info-container-col2")
						.append('<p class="star-wrapper" id=' + city + categoryNum + i + '></p>')
						addStars(item.score_out_of_10, '#' + city + categoryNum + i)
						$('#' + city + categoryNum + i)
						.append('<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + item.name + '</span>')
					}
				})
				setSaveRemoveButton(formatString(city));
				displaySavedCityReview(city);
			}
		});
	}

	// Scores for each cotegory of a city is displayed in stars, out of ten.
	function addStars(score, parentID) {
		for (var i = 0; i < 10; i++) {
			if (score >= i + 1) {
				$(parentID)
				.append('<span class="fa fa-star checked"></span>')
			}
			else {
				$(parentID)
				.append('<span class="fa fa-star"></span>')
			}
		}
	}

	// The following functions: getRegion, getCities, cityInUrban, urbanCityInCountry are used to filter urban areas by continent and country.
	function getRegion(callback){
		var country = $('#country').val();
		var subregionID = [];
		$.ajax({
			type:'GET',
			url: 'https://api.teleport.org/api/countries/iso_alpha2:'+ country +'/admin1_divisions/',
			success:function(data) {
				data._links['a1:items'].forEach(function(region){
					var delimiter = region.href.indexOf('es:');
					subregionID.push(region.href.substring(delimiter+3));
				});
				return callback(null, subregionID);
				}
		});
	}

	function getCities(subregionID, callback){
		var citiesArr = [];
		var country = $('#country').val();
		var count = subregionID.length;
		if (count == 0) {
			return callback(null, citiesArr);
		}
		for (var i=0; i < subregionID.length; i++){
			$.ajax({
				type:'GET',
				url: 'https://api.teleport.org/api/countries/iso_alpha2:' + country + 'admin1_divisions/geonames:' + subregionID[i] + 'cities/',
				success:function(data) {
					data._links['city:items'].forEach(function(cities){
						citiesArr.push(cities.name);
					});
					count--;
					if(count == 0){
						return callback(null, citiesArr);
					}
				}
			});
		}
	}

	function cityInUrban(citiesArr, callback){
		var inUrbanArr = [];
		var selection = $('#continent option:selected');
		$.ajax({
			type:'GET',
			url: 'https://api.teleport.org/api/continents/geonames:' + selection.val() +'urban_areas/',
			success:function(data) {
				data._links['ua:items'].forEach(function(ua){
					if(citiesArr.indexOf(ua.name) != -1){
						if (ua.name.indexOf(' ') != -1){
							inUrbanArr.push(formatCityName(ua.name));
						}
						else{
							inUrbanArr.push(ua.name.toLowerCase());
						}
					}
				});
				return callback(null, inUrbanArr);
			}
		});
	}

	function urbanCityInCountry(inUrbanArr, cID, callback){
		var urbanCityArr = [];
		var exception = {'US/': ['toronto', 'vancouver']};
		var count = inUrbanArr.length;
		if (count == 0) {
			return callback(null, urbanCityArr);
		}
		for(let i=0; i < inUrbanArr.length; i++){
			$.ajax({
				type:'GET',
				url: 'https://api.teleport.org/api/urban_areas/slug:' + inUrbanArr[i] + '/',
				success:function(data) {
					data._links['ua:countries'].forEach(function(country){
						var countryID = country.href.substring(country.href.length - 3);
						if (countryID == cID){
							var failed = false;
							if (exception[cID] != undefined){
								for(let j=0; j < exception[cID].length; j++){
									if (!failed && j == exception[cID].length - 1 && exception[cID][j] != inUrbanArr[i]){
										urbanCityArr.push(inUrbanArr[i]);
									}
									else if (exception[cID][j] == inUrbanArr[i]){
										failed = true;
									}
									else if (j == exception[cID].length - 1){
										failed = false;
									}
								}
							}
							else{
								urbanCityArr.push(inUrbanArr[i]);
							}
						}
					});
					count--;
					if (count == 0){
						return callback(null, urbanCityArr);
					}
				}
			});
		}
	}

	// Gets images for a given city.
	function getImages(cityName, callback){
		var link = '';
		$.ajax({
			type:'GET',
			url: 'https://api.teleport.org/api/urban_areas/slug:' + cityName + '/images/',
			success:function(data) {
				data.photos.forEach(function(image){
					link = image.image.web;
				});
				return callback(null, link);
			}
		});
	}

	function fixScore(score){
		return parseFloat(score).toPrecision(3).toString();
	}

	// Gets the 3 top scoring urban areas for each given category.
	function getTopScore(cat, inUrbanArr, callback){
		var scores = {};
		var count = inUrbanArr.length;
		if (count == 0) {
			return callback(null, {});
		}
		for (let i=0; i < inUrbanArr.length; i++){
			$.ajax({
				type:'GET',
				url: 'https://api.teleport.org/api/urban_areas/slug:' + inUrbanArr[i] + '/scores',
				success:function(data) {
					data['categories'].forEach(function(category){
						if (category.name == cat){
							if (scores[category.score_out_of_10] == undefined){
								scores[category.score_out_of_10] = [inUrbanArr[i]];
							}
							else{
								scores[category.score_out_of_10].push(inUrbanArr[i])
							}
						}
					});
					count--;
					if (count == 0){
						var max = 0;
						var second = 0;
						var third = 0;
						var keys = Object.keys(scores);
						for(let i=0; i < keys.length; i++){
							if (parseFloat(keys[i]) > max){
								second = max;
								max = keys[i];
							}
							else if(parseFloat(keys[i]) > second){
								third = second;
								second = keys[i];
							}
							else if(parseFloat(keys[i]) > third){
								third = keys[i];
							}
						}

						var result = {};
						if (keys.length == 1 && scores[max].length > 1){
							result[scores[max][0]] = max;
							result[scores[max][1]] = max;
							result[scores[max][2]] = max;
						}
						else{
							if(max != 0){
								result[scores[max][0]] = max;
							}
							if (second != 0){
								result[scores[second][0]] = second;
							}
							if (third != 0){
								result[scores[third][0]] = third;
							}
						}
						return callback(null, result);
					}
				}
			});
		}
	}

	// Formatting the selected urban area is necessary for using it with the api.
	function formatCityName(city){
		var newStr = city.toLowerCase();
		while (newStr.indexOf(' ') != -1){
			newStr = newStr.substring(0, newStr.indexOf(' ')) + '-' + newStr.substring(newStr.indexOf(' ') + 1);
		}
		while (newStr.indexOf('.') != -1){
			newStr = newStr.substring(0, newStr.indexOf('.')) + newStr.substring(newStr.indexOf('.') + 1);
		}
		while (newStr.indexOf(',') != -1){
			newStr = newStr.substring(0, newStr.indexOf(',')) + newStr.substring(newStr.indexOf(',') + 1);
		}
		return newStr;
	}

	//
	$('#search-bar-btn').click(function(){
		var searchInput = $('#searchinput');
		var city = formatCityName(searchInput.val());
		$('.landing-page').hide();
		$('.search-results').hide();
		$('#city-info-container').empty();
		$('.city-info').show();

		getImages(city, function(err, res){
			$('#city-info-container')
			.append('<img src=' + res + ' alt=' + city + 0 +' style="width:100%">')
			.append('<h2 id="city-name">' + formatString(city) + '</h2>')
			displayCityInfo(city, 0,'#city-info-container')
		});
	});

	$('#save-city').click(function(){
		var name = $('#city-name').text();
		var comment = $('#comment').val();
		var cityObj = {city: name, comments: comment};
		$.ajax({
			type:'POST',
			url: '/city/save',
			data: cityObj
		});
		$('.city-info').hide();
		$('.landing-page').show();
	});

	$('#remove-city').click(function() {
		var name = $('#saved-city-name').text();
		if (name.length == 0) {
			name = $('#city-name').text();
		}
		var cityObj = {city: name};
		$.ajax({
			type:'DELETE',
			url: '/city/saved',
			data: cityObj
		});
		$('#fave-city-info').hide();
		window.location.reload(true);
		$('#fave-cities').show();
	});

	$('#searchinput').click(function(){
		$('#searchinput').val('');
	});

	// The following initiates a search givem the selections the user has made.
	$('#search-btn').click(function(){
		$('.landing-page').hide();

		$('#city-info-container').empty();
		$('.city-info').hide();

		$('#gallery1').empty();
		$('#gallery2').empty();
		$('#gallery3').empty();
		$('#city-info-container').empty();

		// Notifies the user why a search may not have occured.
		if ($('#continent').val() == 'continent') {
			$('#search-results-container').append('<h4 id="message">Select A Continent</h4>');
		} else if ($('#country').val() == 'country') {
			$('#search-results-container').append('<h4 id="message">Select A Country</h4>');
		} else if ($('#sel1').val() == 'Category 1' && $('#sel2').val() == 'Category 2' && $('#sel3').val() == 'Category 3') {
			$('#search-results-container').append('<h4 id="message">Select A Category</h4>');
		}

		// The querying of the data through the api and the creation of the search results view.
		getRegion(function(err, data){
			getCities(data, function(err, cities){
				cityInUrban(cities, function(err, urban){
					urbanCityInCountry(urban, $('#country').val(), function(err, cityIn){
						getTopScore($('#sel1').val(), cityIn, function(err, topScore1){
							getTopScore($('#sel2').val(), cityIn, function(err, topScore2){
								getTopScore($('#sel3').val(), cityIn, function(err, topScore3){
									var elems = [topScore1, topScore2, topScore3];
										for(let i=1; i < 4; i++){
											if ($('#sel' + i).val() != 'Category ' + i) {
												$('#gallery' + i).append('<div class="h2 row-header">' + $('#sel' + i).val() + '</div>');
												var cities = Object.keys(elems[i-1]);
												var scores = Object.values(elems[i-1]);
												if (cities.length == 0) {
													$('#gallery' + i).append('<h4>No Results</h4>');
												}
												for (let j=0; j < cities.length; j++){
													createCityImageView(cities[j], i, fixScore(scores[j]), 'gallery' + i);
												}
											}
										}
									$('city-info').show();
								});
							});
						});
					});
				});
			});
		});
		$('.search-results').show();
	});

	// Button to return to landing page from the search results.
	$('#return-to-landing-page-btn1').click(function() {
		$('#message').remove();
		$('#gallery').empty();
		$('.search-results').hide();

		$('#city-info-container').empty();
		$('.city-info').hide();

		$('.landing-page').show();
	})

	// Button to return to landing page from a city info view.
	$('#return-to-landing-page-btn2').click(function() {
		$('#gallery').empty();
		$('.search-results').hide();

		$('#city-info-container').empty();
		$('.city-info').hide();

		$('.landing-page').show();
	})

	function getSavedCities() {
		$.ajax({
			type:'GET',
			url: '/city/saved',
			success:function(data) {
				for (let i = 0; i < data.length; i++) {
					var city = data[i]['city'];
					city = city.replace(/\s+/g, '-').toLowerCase();
					createFavouriteCityImageView(city, i, 'saved-cities')
					//createCityImageView(city, i, 10, 'saved-cities');
				}
			}
		});
	}

	getSavedCities()

});
