// Define options for the MapsIndoors Google Maps view
const mapViewOptions = {
    element: document.getElementById('map'),
    center: { lng: -97.74204591828197, lat: 30.36022358949809 },
    zoom: 17,
    maxZoom: 22,
};

// Set the MapsIndoors API key
mapsindoors.MapsIndoors.setMapsIndoorsApiKey('02c329e6777d431a88480a09');

// Create a new instance of the MapsIndoors Google Maps view
const mapViewInstance = new mapsindoors.mapView.GoogleMapsView(mapViewOptions);

// Create a new MapsIndoors instance, linking it to the map view
const mapsIndoorsInstance = new mapsindoors.MapsIndoors({
    mapView: mapViewInstance,
    venue: 'dfea941bb3694e728df92d3d', // Replace with your actual venue ID
});

// Add MapsIndoors controls to the Google map (e.g., Floor Selector)
const floorSelectorElement = document.createElement('div');
new mapsindoors.FloorSelector(floorSelectorElement, mapsIndoorsInstance);
const googleMapInstance = mapViewInstance.getMap();
googleMapInstance.controls[google.maps.ControlPosition.TOP_RIGHT].push(floorSelectorElement);
