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

/*
 * Search Functionality
 */

// Get references to the search input and results list elements
const searchInputElement = document.querySelector('input');
const searchResultsElement = document.getElementById('search-results');

// Initially hide the search results list
searchResultsElement.classList.add('hidden');

// Add an event listener to the search input for 'input' events
// This calls the onSearch function every time the user types in the input field
searchInputElement.addEventListener('input', onSearch);

// Function to perform the search and update the results list and map highlighting
function onSearch() {
    // Get the current value from the search input
    const query = searchInputElement.value;
    // Get the current venue from the MapsIndoors instance
    const currentVenue = mapsIndoorsInstance.getVenue();

    // Clear previous search results
    searchResultsElement.innerHTML = null;
    // Clear map highlighting
    mapsIndoorsInstance.highlight();
    // Deselect any selected location
    mapsIndoorsInstance.selectLocation();

    // Check if the query is too short (less than 3 characters) or empty
    if (query.length < 3) {
        // Hide the results list if the query is too short or empty
        searchResultsElement.classList.add('hidden');
        return; // Stop here
    }

    // Define search parameters with the current input value
    // Include the current venue name in the search parameters
    const searchParameters = { q: query, venue: currentVenue ? currentVenue.name : undefined };

    // Call the MapsIndoors LocationsService to get locations based on the search query
    mapsindoors.services.LocationsService.getLocations(searchParameters).then(locations => {

        // If no locations are found, display a "No results found" message
        if (locations.length === 0) {
            const noResultsItem = document.createElement('li');
            noResultsItem.textContent = 'No results found';
            searchResultsElement.appendChild(noResultsItem);
            // Ensure the results list is visible to show the "No results found" message
            searchResultsElement.classList.remove('hidden');
            return; // Stop here if no results
        }

        // Append new search results to the list
        locations.forEach(location => {
            const listElement = document.createElement('li');
            // Display the location name
            listElement.innerHTML = location.properties.name;
            // Store the location ID on the list item for easy access
            listElement.dataset.locationId = location.id;

            // Add a click event listener to each list item
            listElement.addEventListener('click', function () {
                mapsIndoorsInstance.selectLocation(location);
            });

            searchResultsElement.appendChild(listElement);
        });

        // Show the results list now that it has content
        searchResultsElement.classList.remove('hidden');

        // Filter map to only display search results by highlighting them
        // The second argument 'false' means to not clear other highlights
        mapsIndoorsInstance.highlight(locations.map(location => location.id), false);
    });
}