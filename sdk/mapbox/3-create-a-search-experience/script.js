
// script.js

const mapViewOptions = {
    accessToken: 'YOUR_MAPBOX_ACCESS_TOKEN',
    element: document.getElementById('map'),
    center: { lng: -97.74204591828197, lat: 30.36022358949809 }, // MapsPeople - Austin Office
    zoom: 17,
    maxZoom: 22,
    mapsIndoorsTransitionLevel: 16,
};

//Set the MapsIndoors API key
mapsindoors.MapsIndoors.setMapsIndoorsApiKey('02c329e6777d431a88480a09');

const mapViewInstance = new mapsindoors.mapView.MapboxV3View(mapViewOptions);
const mapsIndoorsInstance = new mapsindoors.MapsIndoors({
    mapView: mapViewInstance,
});

const mapboxInstance = mapViewInstance.getMap();

// Floor Selector
const floorSelectorElement = document.createElement('div');
new mapsindoors.FloorSelector(floorSelectorElement, mapsIndoorsInstance);
mapboxInstance.addControl({
    onAdd: function () {
        return floorSelectorElement;
    },
    onRemove: function () { },
});

function onSearch() {
    const searchInputElement = document.querySelector('input');
    // Get list element reference
    const searchResultsElement = document.getElementById('search-results');

    const searchParameters = { q: searchInputElement.value };
    mapsindoors.services.LocationsService.getLocations(searchParameters).then(locations => {
        // Reset search results list
        searchResultsElement.innerHTML = null;

        // Append new search results
        locations.forEach(location => {
            const listElement = document.createElement('li');
            listElement.innerHTML = location.properties.name;
            searchResultsElement.appendChild(listElement);
        });

        // Filter map to only display search results
        mapsIndoorsInstance.filter(locations.map(location => location.id), false);
    });
}