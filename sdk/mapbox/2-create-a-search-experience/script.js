// script.js

// Define options for the MapsIndoors Mapbox view
const mapViewOptions = {
    accessToken: 'pk.eyJ1IjoiZW5lcHBlciIsImEiOiJjbGdxamhnMzYxYTg1M2VtbXJuNnR3bHZ3In0.QNxvh2UcVhk6mG26d9R8Ww',
    element: document.getElementById('map'),
    // Initial map center (MapsPeople - Austin Office example)
    center: { lng: -97.74204591828197, lat: 30.36022358949809 },
    // Initial zoom level
    zoom: 17,
    // Maximum zoom level
    maxZoom: 22,
    // The zoom level at which MapsIndoors transitions
    mapsIndoorsTransitionLevel: 16,
};

// Set the MapsIndoors API key
mapsindoors.MapsIndoors.setMapsIndoorsApiKey('02c329e6777d431a88480a09');

// Create a new instance of the MapsIndoors Mapbox view (for Mapbox GL JS v3)
const mapViewInstance = new mapsindoors.mapView.MapboxV3View(mapViewOptions);

// Create a new MapsIndoors instance, passing the map view
const mapsIndoorsInstance = new mapsindoors.MapsIndoors({
    mapView: mapViewInstance,
    // Set the venue ID to load the map for a specific venue
    venue: 'dfea941bb3694e728df92d3d', // Replace with your actual venue ID
});

/** Floor Selector **/

// Create a new HTML div element to host the floor selector
const floorSelectorElement = document.createElement('div');

// Create a new FloorSelector instance, linking it to the HTML element and the main MapsIndoors instance.
new mapsindoors.FloorSelector(floorSelectorElement, mapsIndoorsInstance);

// Get the underlying Mapbox map instance
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

/** Handle Location Clicks **/

// Function to handle clicks on MapsIndoors locations
function handleLocationClick(location) {
    if (location && location.id) {
        // Move the map to the selected location
        mapsIndoorsInstance.goTo(location);
        // Ensure that the map shows the correct floor
        mapsIndoorsInstance.setFloor(location.properties.floor);
        // Select the location on the map
        mapsIndoorsInstance.selectLocation(location);
    }
}

// Add an event listener to the MapsIndoors instance for click events on locations
mapsIndoorsInstance.on('click', handleLocationClick);

/** Search Functionality **/

// Get references to the search input and results list elements
const searchInputElement = document.getElementById('search-input');
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
        // Clear previous search results
        searchResultsElement.innerHTML = null;

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
                // Call the handleLocationClick function when a location in the search results is clicked.
                handleLocationClick(location);
            });

            searchResultsElement.appendChild(listElement);
        });

        // Show the results list now that it has content
        searchResultsElement.classList.remove('hidden');

        // Filter map to only display search results by highlighting them
        mapsIndoorsInstance.highlight(locations.map(location => location.id));
    })
        .catch(error => {
            console.error("Error fetching locations:", error);
            const errorItem = document.createElement('li');
            errorItem.textContent = 'Error performing search.';
            searchResultsElement.appendChild(errorItem);
            searchResultsElement.classList.remove('hidden');
        });
}
