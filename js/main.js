var locations = [ //Location Data
    {
        name: 'Actu-Environnement',
        lat: 47.751569,
        lng: 1.675063,
        url: 'http://www.actu-environnement.com'
    }, {
        name: 'Vallée Aspe',
        lat: 43.30779,
        lng: 0.766351,
        url: 'http://www.vallee-aspe.com/'
    }, {
        name: 'Drac Auvergne - Rhône-Alpes',
        lat: 45.764043,
        lng: 4.835659,
        url: 'http://www.culturecommunication.gouv.fr/Regions/Drac-Auvergne-Rhone-Alpes'
    }, {
        name: 'Berger y-es-tu',
        lat: 44.166445,
        lng: 2.373047,
        url: 'http://bergeryestu.unblog.fr/'
    }, {
        name: 'COPA COGECA',
        lat: 50.861444,
        lng: 4.328613,
        url: 'http://www.copa-cogeca.be'
    }, {
        name: 'COFAMI',
        lat: 51.747439,
        lng: 5.361328,
        url: 'http://www.cofami.org/'
    }, {
        name: 'LA FERME VIGNECOISE ',
        lat: 43.076913,
        lng: 1.428223,
        url: 'http://www.lavignecoise.com/'
    }, {
        name: 'PARCS NATURELS RÉGIONAUX',
        lat: 49.009051,
        lng: 2.285156,
        url: 'http://www.parcs-naturels-regionaux.fr/'
    }, {
        name: 'LALPE',
        lat: 45.186650,
        lng: 5.725286,
        url: 'http://www.lalpe.com/'
    }, {
        name: 'La Maison de la Transhumance',
        lat: 44.613329,
        lng: 6.218768,
        url: 'http://www.transhumance.org/'
    }
];
//ViewModel Begin
function viewModel() {
        var self = this;
        var Location = function(data) {
            this.name = data.name;
            this.url = data.url;
            this.latlng = data.latlng;
        };
        self.locationsList = ko.observableArray(locations);
        //Setting initial infowindow 
        var infowindow = new google.maps.InfoWindow({
            info: '',
        });
        var marker;
        self.locationsList().forEach(function(place) {
            marker = new google.maps.Marker({
                map: map,
                position: new google.maps.LatLng(place.lat,
                    place.lng),
                title: place.name,
                animation: google.maps.Animation.DROP,
                icon: 'img/alpymapicon.png',
            });
            place.marker = marker;
            place.marker.addListener('click', toggleBounce);

            function toggleBounce() {
                if (place.marker.getAnimation() !== null) {
                    place.marker.setAnimation(null);
                } else {
                    place.marker.setAnimation(google.maps.Animation
                        .BOUNCE);
                    setTimeout(function() {
                        place.marker.setAnimation(null);
                    }, 1000);
					//map.panTo(marker.getPosition()); // centres map based on marker position
                }
            }
            google.maps.event.addListener(place.marker, 'click',
                function() {
                    if (!infowindow) {
                        infowindow = new google.maps.InfoWindow();
                    }
                    //Setting wikipedia API
                    var contentInfo;
                    var infoNames = place.name;
                    var infoURL = place.url;
                    var urlNames = encodeURI(place.name);
                    var wikiUrl =
                        "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" +
                        urlNames +
                        "&limit=1&redirects=return&format=json";
                    self.wikiTimeout = setTimeout(function() {
                        alert(
                            'ERROR: Data could not be retrieved, Please Try Again Later'
                        );
                    }, 5000);
                    $.ajax({
                        url: wikiUrl,
                        dataType: "jsonp",
                        jsonpCallback: "foo", // for caching
                        cache: true
                    }).done(function(data) {
                        clearTimeout(self.wikiTimeout);
                        var infoList = data[1];
                        if (infoList.length > 0) {
                            for (var i = 0; i < infoList.length; i++) {
                                contentInfo = '<div>' +
                                    '<h4 class="title">' +
                                    infoNames + '</h4>' +
                                    '<p>' + data[2] +
                                    '</p>' + '<a href="' +
                                    infoURL +
                                    '" target="_blank">' +
                                    infoURL + '</a>' +
                                    '</div>';
                                infowindow.setContent(
                                    contentInfo);
                            }
                        } else {
                            contentInfo = '<div>' +
                                '<h4 class="title">' +
                                infoNames + '</h4>' + '<p>' +
                                " Please click the link below. " +
                                '</p>' + '<a href="' +
                                infoURL +
                                '" target="_blank">' +
                                infoURL + '</a>' + '</div>';
                            infowindow.setContent(
                                contentInfo);
                        }
                        infowindow.open(map, place.marker);
                    }).fail(function(XHR, status, error) {
                        console.log(error);
                        contentInfo = '<div>' +
                            '<h4 class="title">' +
                            infoNames + '</h4>' + '<p>' +
                            "Failed to reach Wikipedia Servers, please try again" +
                            '</p>' + '</div>';
                        infowindow.setContent(contentInfo);
                    });
                });
        }); //End ForEach
       
	    //Linking list to markers to show info
        self.list = function(place, marker) {
            google.maps.event.trigger(place.marker, 'click');
        };
       
	    // Search functionality 
        self.query = ko.observable(''); //Creates an observable for filter
        self.searchedList = ko.computed(function() {
            return ko.utils.arrayFilter(self.locationsList(), function(
                list) {
                var listFilter = list.name.toLowerCase().indexOf(
                    self.query().toLowerCase()) >= 0;
                if (listFilter) {
                    //Show only the matches
                    list.marker.setVisible(true);
                } else {
                    list.marker.setVisible(false);
                    //Hide away markers that do not match results
                }
                return listFilter;
            });
        });
    } //ViewModel End
   
    //Create map of Ghent 

function initMap() {
        var europ = {
            lat: 48.893615,
            lng: 2.329102
        };
        var mapOptions = {
            center: europ,
            zoom: 5,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById('map'), mapOptions);
		
		var center;

		function calculateCenter() {
			center = map.getCenter();
		}
		google.maps.event.addDomListener(map, 'idle', function() {
			calculateCenter();
		});
		google.maps.event.addDomListener(window, 'resize', function() {
			map.setCenter(center);
		});
        // Run viewModel 
        ko.applyBindings(new viewModel());
    }
    
	//Handling error for google map.

function googleError() {
        alert("Google Has Encountered An Error. Please Try Again Later");
    }
    
	//Functionality for mobile devices
var menuButton = document.querySelector('.menu-button');
var mapDiv = document.querySelector('.mapdiv');
var navBar = document.querySelector('nav');
menuButton.addEventListener('click', function(event) {
    navBar.classList.toggle('open');
    event.stopPropagation();
});
mapDiv.addEventListener('click', function() {
    navBar.classList.remove('open');
});