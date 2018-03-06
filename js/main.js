//List of jubail landmarks
var locations = [{
        title: "Abu Ali Airport",
        location: {
            lat: 27.318258,
            lng: 49.587549
        }
    },
    {
        title: "Hadeed",
        location: {
            lat: 27.019351,
            lng: 49.576358
        }
    },
    {
        title: "Jubail Airport",
        location: {
            lat: 27.039100,
            lng: 49.405099
        }
    },
    {
        title: "Jubail Church",
        location: {
            lat: 26.937427,
            lng: 49.656494
        }
    },
    {
        title: "Jubail Industrial College",
        location: {
            lat: 27.107817,
            lng: 49.569693
        }
    },
    {
        title: "Jubail Technical Institute",
        location: {
            lat: 27.078130,
            lng: 49.545184
        }
    },
    {
        title: "King Abdulaziz Naval Base",
        location: {
            lat: 26.962676,
            lng: 49.679319
        }
    },
    {
        title: "SABIC",
        location: {
            lat: 27.090403,
            lng: 49.555206
        }
    },
    {
        title: "University College of Jubail ",
        location: {
            lat: 27.138775,
            lng: 49.560941
        }
    }
];

// declaring global variables
var map, largeInfoWindow;
var marker = [];

//Starting the map function 
function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 27.177625,
            lng: 49.562425
        },
        zoom: 10,
    });
    //binding must be applied with map init or won't work
    ko.applyBindings(new ViewModel());
    largeInfoWindow = new google.maps.InfoWindow();
}

/** _myLocation_ function will allow the list to be accessible in the 
filtration of location while using knockout function**/
var myLocation = function(data) {
    //by doing this, we make sure that the locations list will bind easily while filtering
    var self = this;
    self.title = ko.observable(data.title);
    self.lat = ko.observable(data.location.lat);
    self.lng = ko.observable(data.location.lng);
    self.marker = ko.observable();
    //self.content = ko.observable("");

};

// Orgnize data using Knockout and binding data via HTML page 
var ViewModel = function() {
    var self = this;

    // saving locations data on view model to be accessible
    this.locations = ko.observableArray([]);

    //creating a loop for locations list, to save it in the above observableArray
    locations.forEach(function(listOfLocation) {
        self.locations.push(new myLocation(listOfLocation));
    });


    // markers loop
    self.locations().forEach(function(listOfLocation) {
        // matching varibles with data so we can use it in marker creating
        position = {
            lat: listOfLocation.lat(),
            lng: listOfLocation.lng()
        };
        title = listOfLocation.title();

        //style of the markers, will come in handy later
        var blueMarker = "img/BlueMarker.png";
        var redMarker = "img/RedMarker.png";
        // creating new marker
        marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            wikiPage: '',
            icon: "img/BlueMarker.png",
            animation: google.maps.Animation.DROP
        });

        // marker for each location
        listOfLocation.marker = marker;

        // Get data from Wiki API
        var URL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + listOfLocation.title() + '&format=json&callback=wikiCallback';
        //var URL = "https://en.wikipedia.org/w/api.php?action=opensearch&search="+ listOfLocation.title() + "&limit=1&format=json"
        // WikiPedia API 
        $.ajax({
            url: URL,
            dataType: "jsonp",
            jsonp: "callback",

            success: function(data) {
                console.log(data);
                // make it readable
                listOfLocation.wikiPage = data[3][0];
                // create the content for the infowindo, will be easier to assign on the content window argument
                listOfLocation.content = '<div id="infoWindow" class="titleHead">' + listOfLocation.title() +
                    '</div> <div> <a href="' + listOfLocation.wikiPage + '"> More Information about ' + listOfLocation.title() + ' </a> </div>';

                /*var wikiRequestTimeout = setTimeout(function() {
                    alert("Ops, WikiPedia failed to load your request");
                }, 7000);*/

                //  info window and bouncing marker functions
                listOfLocation.marker.addListener("click", function() {
                    largeInfoWindow.open(map, listOfLocation.marker);
                    self.toggleBounce(listOfLocation);
                    largeInfoWindow.setContent(listOfLocation.content);
                });

                //allow the markers to change colors while mouse over or out
                listOfLocation.marker.addListener('mouseover', function() {
                    this.setIcon(redMarker);
                });
                listOfLocation.marker.addListener('mouseout', function() {
                    this.setIcon(blueMarker);
                });

                //this function acts as if marker got clicked 
                //using it for data pairing, so when item clicked infowindow open and marker bounce
                self.clickingTrigger = function(listOfLocation) {
                    google.maps.event.trigger(this.marker, 'click');
                };

            },
            //message will show up if there is issue loading wiki api
            error: function(e) {
                clearTimeout(wikiRequestTimeout);
                var wikiRequestTimeout = setTimeout(function() {
                    alert("Ops, WikiPedia failed to load your request");
                }, 7000);
            }

        });
    });

    // Bounce marker function
    this.toggleBounce = function(location) {
        if (location.marker.getAnimation() !== null) {
            location.marker.setAnimation(null);
        } else {
            location.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                location.marker.setAnimation(null);
            }, 1993);
        }
    };

    // starting the filter function
    this.filter = ko.observable(""); //Taking value from user
    this.filteredList = ko.computed(function() {
        self.locations().forEach(function(location) {
            location.marker.setVisible(false);
        });
        return self.locations().filter(function(location) {
            if (!self.filter() || location.title().toLowerCase().indexOf(self.filter().toLowerCase()) !== -1) {
                location.marker.setVisible(true);
                return location;
            }
        });
    }, this);

};

//map error function, user get an alert when map can't load
function errorMsgGoogle() {
    console.log("Error Loading Google Maps");
    alert("Mpa Faild Loading, Check Your Connection.");
}