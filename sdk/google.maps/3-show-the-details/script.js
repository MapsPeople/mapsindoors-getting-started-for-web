// script.js

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
    // Set the venue ID to load the map for a specific venue
    venue: 'dfea941bb3694e728df92d3d', // Replace with your actual venue ID
});


// Add MapsIndoors controls to the Google map (e.g., Floor Selector)
const floorSelectorElement = document.createElement('div');
new mapsindoors.FloorSelector(floorSelectorElement, mapsIndoorsInstance);
const googleMapInstance = mapViewInstance.getMap();
googleMapInstance.controls[google.maps.ControlPosition.TOP_RIGHT].push(floorSelectorElement);

/** Search Functionality **/

// Get references to the search input and results list elements
const searchInputElement = document.getElementById('search-input');
const searchResultsElement = document.getElementById('search-results');

// Add an event listener to the search input for 'input' events
searchInputElement.addEventListener('input', onSearch);

// --- UI State Management Functions ---
const searchUIElement = document.getElementById('search-ui');
const detailsUIElement = document.getElementById('details-ui');
const detailsNameElement = document.getElementById('details-name');
const detailsDescriptionElement = document.getElementById('details-description');
const detailsCloseButton = document.getElementById('details-close');

function showSearchUI() {
    detailsUIElement.classList.add('hidden');
    searchUIElement.classList.remove('hidden');
    searchInputElement.focus();
}

function showDetailsUI() {
    searchUIElement.classList.add('hidden');
    detailsUIElement.classList.remove('hidden');
}

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
            
            // In Step 3, clicking a search result now shows the details panel and manages map/UI state.
            // Add click event listener to show details in the same container
            listElement.addEventListener('click', () => showDetailsInSearchContainer(location));

            searchResultsElement.appendChild(listElement);
        });

        // Show the results list now that it has content
        searchResultsElement.classList.remove('hidden');

        // Filter map to only display search results by highlighting them
        mapsIndoorsInstance.highlight(locations.map(location => location.id));
    })
    .catch(error => {
        // Clear previous search results
        searchResultsElement.innerHTML = null;
        console.error("Error fetching locations:", error);
        const errorItem = document.createElement('li');
        errorItem.textContent = 'Error performing search.';
        searchResultsElement.appendChild(errorItem);
        searchResultsElement.classList.remove('hidden');
    });
}

detailsCloseButton.addEventListener('click', showSearchUI);

function showDetailsInSearchContainer(location) {
    detailsNameElement.textContent = location.properties.name;
    detailsDescriptionElement.textContent = location.properties.description || 'No description available.';
    showDetailsUI();
    mapsIndoorsInstance.selectLocation(location);
    mapsIndoorsInstance.goTo(location);
    mapsIndoorsInstance.setFloor(location.properties.floor);
}

// Initial call to set up the search UI when the page loads
showSearchUI();
