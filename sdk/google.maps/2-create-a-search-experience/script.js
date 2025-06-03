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

// --- Search Functionality ---

const searchInputElement = document.getElementById('search-input');
const searchResultsElement = document.getElementById('search-results');
searchResultsElement.classList.add('hidden');

searchInputElement.addEventListener('input', onSearch);

function onSearch() {
    const query = searchInputElement.value;
    const currentVenue = mapsIndoorsInstance.getVenue();

    searchResultsElement.innerHTML = null;
    mapsIndoorsInstance.highlight();
    mapsIndoorsInstance.selectLocation();

    if (query.length < 3) {
        searchResultsElement.classList.add('hidden');
        return;
    }

    const searchParameters = {
        q: query,
        venue: currentVenue ? currentVenue.name : undefined
    };

    mapsindoors.services.LocationsService.getLocations(searchParameters)
        .then(locations => {
            if (locations.length === 0) {
                const noResultsItem = document.createElement('li');
                noResultsItem.textContent = 'No results found';
                searchResultsElement.appendChild(noResultsItem);
                searchResultsElement.classList.remove('hidden');
                return;
            }

            const locationIdsToHighlight = [];

            locations.forEach(location => {
                const listElement = document.createElement('li');
                listElement.innerHTML = location.properties.name;
                listElement.dataset.locationId = location.id;

                listElement.addEventListener('click', function () {
                    mapsIndoorsInstance.goTo(location);
                    mapsIndoorsInstance.setFloor(location.properties.floor);
                    mapsIndoorsInstance.selectLocation(location);
                });

                searchResultsElement.appendChild(listElement);
                locationIdsToHighlight.push(location.id);
            });

            searchResultsElement.classList.remove('hidden');
            mapsIndoorsInstance.highlight(locationIdsToHighlight);
        })
        .catch(error => {
            console.error("Error fetching locations:", error);
            const errorItem = document.createElement('li');
            errorItem.textContent = 'Error performing search.';
            searchResultsElement.appendChild(errorItem);
            searchResultsElement.classList.remove('hidden');
        });
}
