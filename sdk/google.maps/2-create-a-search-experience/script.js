// script.js

// Define options for the Google Maps view
const mapViewOptions = {
    element: document.getElementById('map'),
    center: { lat: 30.36026660239549, lng: -97.74223633857213 },
    zoom: 17,
    maxZoom: 22,
};

// Set the MapsIndoors API key
mapsindoors.MapsIndoors.setMapsIndoorsApiKey('02c329e6777d431a88480a09'); // Replace with your key or demo key

// Create a new instance of the Google Maps view
const mapViewInstance = new mapsindoors.mapView.GoogleMapsView(mapViewOptions);

// Create a new MapsIndoors instance, passing the map view
const mapsIndoorsInstance = new mapsindoors.MapsIndoors({
    mapView: mapViewInstance
});

// Create a new element to host the floor selector.
const floorSelectorElement = document.createElement('div');

// Create a new FloorSelector instance, linking it to the HTML element and the main MapsIndoors instance
new mapsindoors.FloorSelector(floorSelectorElement, mapsIndoorsInstance);

// Get the underlying Google Maps map instance from the MapsIndoors map view
const googleMapsInstance = mapViewInstance.getMap();

// Add the floor selector to the Google Maps controls
// Using a setTimeout to wait briefly for the Google Maps API to be ready if needed
// A more robust solution would use the Google Maps API's callback parameter
setTimeout(() => {
    if (googleMapsInstance && google.maps && google.maps.ControlPosition) {
        googleMapsInstance.controls[google.maps.ControlPosition.RIGHT_TOP].push(floorSelectorElement);
    } else {
        console.error('Google Maps instance or ControlPosition not available to add Floor Selector.');
    }
}, 0);


// --- Search Functionality (New Code for this guide) ---

// Get references to the search elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchResultsElement = document.getElementById('search-results');

// Add event listener to the search button
if (searchButton) { // Check if button element exists
    searchButton.addEventListener('click', onSearch);
} else {
    console.error('Search button element not found!');
}

// Implement the search function
function onSearch() {
    const query = searchInput.value;

    if (query.trim() === '') {
        // Clear results and remove highlight if search query is empty
        displaySearchResults([]); // Call with empty array to clear list
        mapsIndoorsInstance.highlight(null); // Removes any highlights
        return; // Exit the function
    }

    // Define search parameters
    const searchParameters = { q: query };

    // Call MapsIndoors LocationsService to get locations
    mapsindoors.services.LocationsService.getLocations(searchParameters)
        .then(locations => {
            // Process and display search results
            displaySearchResults(locations);

            // Highlight search results on the map
            highlightLocationsOnMap(locations);
        })
        .catch(error => {
            console.error('Error during search:', error);
            searchResultsElement.innerHTML = '<li>Error performing search.</li>'; // Display a simple error message in the list
            mapsIndoorsInstance.highlight(null); // Removes any highlights
        });
}

// Function to display search results in the list
function displaySearchResults(locations) {
    // Clear previous results
    searchResultsElement.innerHTML = null;

    if (!locations || locations.length === 0) {
        searchResultsElement.innerHTML = '<li>No results found.</li>';
        mapsIndoorsInstance.highlight(null); // Removes any highlight
        return; // Exit the function
    }

    // Append new search results
    locations.forEach(location => {
        const listElement = document.createElement('li');
        // Display location name (and potentially other properties)
        listElement.innerHTML = location.properties.name;
        // Optional: Add data attribute for location ID to the list item
        listElement.dataset.locationId = location.id;
        searchResultsElement.appendChild(listElement);
    });
}

// Function to highlight search results on the map
function highlightLocationsOnMap(locations) {
    const locationIds = locations.map(location => location.id);
    // Highlight locations based on their IDs
    mapsIndoorsInstance.highlight(locationIds);
}