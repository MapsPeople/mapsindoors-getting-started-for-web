const mapViewOptions = {
    accessToken: 'pk.eyJ1IjoiZW5lcHBlciIsImEiOiJja2c5MzlqaDIwNTgwMnhwdWg5M2gycXQyIn0.3yzc8Se6Majxr2O09HNGiA',
    element: document.getElementById('map'),
    // MapsPeople - Austin Office
    center: { lat: 30.36026660239549, lng: -97.74223633857213 },
    zoom: 17,
    maxZoom: 22,
    mapsIndoorsTransitionLevel: 16,
};

// Set the MapsIndoors API key
mapsindoors.MapsIndoors.setMapsIndoorsApiKey('02c329e6777d431a88480a09');

// Create a new instance of the MapsIndoors Mapbox view (for Mapbox GL JS v3)
const mapViewInstance = new mapsindoors.mapView.MapboxV3View(mapViewOptions);

// Create a new MapsIndoors instance, passing the map view
const mapsIndoorsInstance = new mapsindoors.MapsIndoors({
    mapView: mapViewInstance,
    venue: 'dfea941bb3694e728df92d3d',
});

// Add MapsIndoors controls to the Mapbox map (e.g., Floor Selector)

// Create a new HTML div element to host the floor selector
const floorSelectorElement = document.createElement('div');

// Create a new FloorSelector instance, linking it to the HTML element and the main MapsIndoors instance
new mapsindoors.FloorSelector(floorSelectorElement, mapsIndoorsInstance);

// Get the underlying Mapbox map instance from the MapsIndoors map view
const mapboxInstance = mapViewInstance.getMap();

// Add the floor selector HTML element to the Mapbox map using Mapbox's addControl method
// We wrap the element in an object implementing the IControl interface expected by addControl
mapboxInstance.addControl({
    onAdd: function () {
        // This function is called when the control is added to the map.
        // It should return the control's DOM element.
        return floorSelectorElement;
    },
    onRemove: function () {
        // This function is called when the control is removed from the map.
        // Clean up any event listeners or resources here.
        floorSelectorElement.parentNode.removeChild(floorSelectorElement);
    },
}, 'top-right'); // Optional: Specify a position ('top-left', 'top-right', 'bottom-left', 'bottom-right')