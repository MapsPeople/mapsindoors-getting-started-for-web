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
    venue: 'dfea941bb3694e728df92d3d',
});

// Get the underlying Mapbox map instance
const mapboxInstance = mapViewInstance.getMap();

// Floor Selector
// Create a new HTML div element to host the floor selector
const floorSelectorElement = document.createElement('div');
// Create a new FloorSelector instance, linking it to the HTML element and the main MapsIndoors instance
new mapsindoors.FloorSelector(floorSelectorElement, mapsIndoorsInstance);
// Add the floor selector HTML element to the Mapbox map using Mapbox's addControl method
mapboxInstance.addControl({
    onAdd: function () {
        // This function is called when the control is added to the map.
        // It should return the control's DOM element.
        return floorSelectorElement;
    },
    onRemove: function () { /* Clean up if needed */ },
}, 'top-right'); // Optional: Specify a position


/*
 * Search Functionality (Modified for dynamic content)
 */

// Get references to the search input and results list elements
const searchInputElement = document.getElementById('search-input');
const searchResultsElement = document.getElementById('search-results');
const searchContainerElement = document.getElementById('search-container'); // Get the main container

// Add an event listener to the search input for 'input' events
searchInputElement.addEventListener('input', onSearch);

// Function to perform the search and update the results list and map highlighting
function onSearch() {
    const query = searchInputElement.value;
    const currentVenue = mapsIndoorsInstance.getVenue();

    // Clear previous search results and hide the list
    searchResultsElement.innerHTML = null;
    searchResultsElement.classList.add('hidden'); // Hide results list when typing
    // Clear map highlighting and deselect location
    mapsIndoorsInstance.highlight();
    mapsIndoorsInstance.selectLocation();
    // Ensure search UI is visible and details UI is hidden
    showSearchUI();


    if (query.length < 3) {
        return; // Stop here
    }

    const searchParameters = { q: query, venue: currentVenue ? currentVenue.name : undefined };

    mapsindoors.services.LocationsService.getLocations(searchParameters).then(locations => {
        if (locations.length === 0) {
            const noResultsItem = document.createElement('li');
            noResultsItem.textContent = 'No results found';
            searchResultsElement.appendChild(noResultsItem);
            searchResultsElement.classList.remove('hidden'); // Show list to display "No results"
            return;
        }

        locations.forEach(location => {
            const listElement = document.createElement('li');
            listElement.textContent = location.properties.name; // Display location name

            // Add click event listener to show details in the same container
            listElement.addEventListener('click', () => showDetailsInSearchContainer(location));

            searchResultsElement.appendChild(listElement);
        });

        searchResultsElement.classList.remove('hidden'); // Show results list
    });
}

// --- UI State Management Functions ---
const searchUIElement = document.getElementById('search-ui');
const detailsUIElement = document.getElementById('details-ui');
const directionsUIElement = document.getElementById('directions-ui');

function showSearchUI() {
    hideDetailsUI(); // Ensure details UI is hidden
    hideDirectionsUI(); // Ensure directions UI is hidden
    searchUIElement.classList.add('flex-column');
    searchUIElement.classList.remove('hidden');
    searchInputElement.focus();
}

function showDetailsUI() {
    hideSearchUI(); // Ensure search UI is hidden
    hideDirectionsUI(); // Ensure directions UI is hidden
    detailsUIElement.classList.add('flex-column');
    detailsUIElement.classList.remove('hidden');
}

function hideSearchUI() {
    searchUIElement.classList.remove('flex-column');
    searchUIElement.classList.add('hidden');
}

function hideDetailsUI() {
    detailsUIElement.classList.remove('flex-column');
    detailsUIElement.classList.add('hidden');
}

function showDirectionsUI() {
    hideSearchUI();
    hideDetailsUI();
    directionsUIElement.classList.add('flex-column');
    directionsUIElement.classList.remove('hidden');
}

function hideDirectionsUI() {
    directionsUIElement.classList.remove('flex-column');
    directionsUIElement.classList.add('hidden');
}

/*
 * Location Details Functionality (Implemented within the search container)
 */

// Get references to the static details view elements
const detailsNameElement = document.getElementById('details-name');
const detailsDescriptionElement = document.getElementById('details-description');
const detailsCloseButton = document.getElementById('details-close');

// Variable to store the location currently shown in details
let currentDetailsLocation = null;

// Function to show the details view for a given location within the search container
function showDetailsInSearchContainer(location) {
    currentDetailsLocation = location;
    detailsNameElement.textContent = location.properties.name;
    detailsDescriptionElement.textContent = location.properties.description || 'No description available.';
    showDetailsUI();
    // Add click handler to hide details and return to search UI
    detailsCloseButton.removeEventListener('click', showSearchUI);
    detailsCloseButton.addEventListener('click', showSearchUI);
    // Select the location on the map
    mapsIndoorsInstance.selectLocation(location);
    mapsIndoorsInstance.goTo(location);
    mapsIndoorsInstance.setFloor(location.properties.floor);
}

// Initial call to set up the search UI when the page loads
showSearchUI();

/*
 * Directions Functionality
 */
// Handles origin/destination selection, route calculation, and step navigation

const originInputElement = document.getElementById('origin-input');
const originResultsElement = document.getElementById('origin-results');
const destinationInputElement = document.getElementById('destination-input');
const getDirectionsButton = document.getElementById('get-directions');
const prevStepButton = document.getElementById('prev-step');
const nextStepButton = document.getElementById('next-step');
const stepIndicator = document.getElementById('step-indicator');
const directionsCloseButton = document.getElementById('directions-close');



let selectedOrigin = null;
let selectedDestination = null;
let currentRoute = null;
let directionsRenderer = null;

// Reference the details-directions button defined in the HTML
const detailsDirectionsButton = document.getElementById('details-directions');

detailsDirectionsButton.addEventListener('click', () => {
    showDirectionsPanel(currentDetailsLocation);
});

detailsCloseButton.addEventListener('click', showSearchUI);

directionsCloseButton.addEventListener('click', () => {
    hideDirectionsUI();
    showDetailsUI();
    if (directionsRenderer) directionsRenderer.setVisible(false);
});

// Show the directions panel and reset state for a new route
function showDirectionsPanel(destinationLocation) {
    selectedOrigin = null;
    selectedDestination = destinationLocation;
    currentRoute = null;
    destinationInputElement.value = destinationLocation.properties.name;
    originInputElement.value = '';
    originResultsElement.innerHTML = '';
    hideSearchUI();
    hideDetailsUI();
    showDirectionsUI();
    stepIndicator.textContent = '';
}

// Search for origin locations as the user types
originInputElement.addEventListener('input', onOriginSearch);
function onOriginSearch() {
    const query = originInputElement.value;
    const currentVenue = mapsIndoorsInstance.getVenue();
    originResultsElement.innerHTML = '';
    if (query.length < 3) return;
    const searchParameters = { q: query, venue: currentVenue ? currentVenue.name : undefined };
    mapsindoors.services.LocationsService.getLocations(searchParameters).then(locations => {
        if (locations.length === 0) {
            const noResultsItem = document.createElement('li');
            noResultsItem.textContent = 'No results found';
            originResultsElement.appendChild(noResultsItem);
            return;
        }
        locations.forEach(location => {
            const listElement = document.createElement('li');
            listElement.textContent = location.properties.name;
            listElement.addEventListener('click', () => {
                selectedOrigin = location;
                originInputElement.value = location.properties.name;
                originResultsElement.innerHTML = '';
            });
            originResultsElement.appendChild(listElement);
        });
    });
}

// Calculate and display the route when both origin and destination are selected
getDirectionsButton.addEventListener('click', async () => {
    if (!selectedOrigin || !selectedDestination) {
        // Optionally, show an alert or update stepIndicator instead
        stepIndicator.textContent = 'Please select both origin and destination.';
        return;
    }
    // Use anchor property for LatLngLiteral (anchor is always a point)
    const origin = {
        lat: selectedOrigin.properties.anchor.coordinates[1],
        lng: selectedOrigin.properties.anchor.coordinates[0],
        floor: selectedOrigin.properties.floor
    };
    const destination = {
        lat: selectedDestination.properties.anchor.coordinates[1],
        lng: selectedDestination.properties.anchor.coordinates[0],
        floor: selectedDestination.properties.floor
    };
    const directionsService = new mapsindoors.services.DirectionsService();
    const route = await directionsService.getRoute({ origin, destination });
    currentRoute = route;
    if (directionsRenderer) {
        directionsRenderer.setVisible(false);
    }

    directionsRenderer = new mapsindoors.directions.DirectionsRenderer({
        mapsIndoors: mapsIndoorsInstance,
        fitBounds: true,
        strokeColor: '#4285f4',
        strokeWeight: 5
    });
    
    await directionsRenderer.setRoute(route);
    directionsRenderer.setStepIndex(0, 0);
    showCurrentStep();
});

// Update the step indicator and enable/disable navigation buttons
function showCurrentStep() {
    if (currentRoute?.legs?.length < 1) return;
    const currentLegIndex = directionsRenderer.getLegIndex();
    const currentStepIndex = directionsRenderer.getStepIndex();
    const legs = currentRoute.legs;
    const steps = legs[currentLegIndex].steps;
    if (steps.length === 0) {
        stepIndicator.textContent = '';
        return;
    }
    stepIndicator.textContent = `Leg ${currentLegIndex + 1} of ${legs.length}, Step ${currentStepIndex + 1} of ${steps.length}`;
    prevStepButton.disabled = currentLegIndex === 0 && currentStepIndex === 0;
    nextStepButton.disabled = currentLegIndex === legs.length - 1 && currentStepIndex === steps.length - 1;
}

// Step navigation event listeners
prevStepButton.addEventListener('click', () => {
    if (!directionsRenderer) {
        return;
    }
    directionsRenderer.previousStep();
    showCurrentStep();

});
nextStepButton.addEventListener('click', () => {
    if (!directionsRenderer) {
        return;
    }
    directionsRenderer.nextStep();
    showCurrentStep();
});
