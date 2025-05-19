// script.js

// Define options for the Google Maps view
const mapViewOptions = {
    element: document.getElementById('map'),
    // MapsPeople - Austin Office
    center: { lat: 30.36026660239549, lng: -97.74223633857213 },
    zoom: 17,
    maxZoom: 22,
};

//Set the MapsIndoors API key
mapsindoors.MapsIndoors.setMapsIndoorsApiKey('02c329e6777d431a88480a09');

// Create a new instance of the Google Maps view
const mapViewInstance = new mapsindoors.mapView.GoogleMapsView(mapViewOptions);

// Create a new MapsIndoors instance, passing the map view
const mapsIndoorsInstance = new mapsindoors.MapsIndoors({
    mapView: mapViewInstance,
    // Set the venue ID to load the map for a specific venue
    venue: 'dfea941bb3694e728df92d3d',
});

// Create a new element to host the floor selector.
const floorSelectorElement = document.createElement('div');

// Create a new FloorSelector instance, linking it to the HTML element and the main MapsIndoors instance
new mapsindoors.FloorSelector(floorSelectorElement, mapsIndoorsInstance);

// Get the underlying Google Maps map instance from the MapsIndoors map view
const googleMapsInstance = mapViewInstance.getMap();

// Add the floor selector to the Google Maps controls
googleMapsInstance.controls[google.maps.ControlPosition.RIGHT_TOP].push(floorSelectorElement);