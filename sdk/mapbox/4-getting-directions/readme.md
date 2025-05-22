# Step 4: Getting Directions

**Goal:** This guide will show you how to add directions functionality to your application. Users will be able to select an origin and destination, get a route between them, and step through the directions on the map. This step builds on the search and details UI from Step 3, introducing a new directions panel and integrating the MapsIndoors DirectionsService and DirectionsRenderer.

**SDK Concepts Introduced:**

- Using the [DirectionsService](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.services.DirectionsService.html) to calculate routes between locations.
- Using the [DirectionsRenderer](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.directions.DirectionsRenderer.html) to display and step through routes on the map.
- Extending UI state management to support a new, mutually exclusive directions panel.

## Prerequisites

- Completion of [Step 3: Show Location Details](../3-show-the-details/readme.md). Your app should already support searching for locations and viewing details.
- MapsIndoors API Key and Mapbox Access Token set up as in previous steps (demo keys are used in the sample code below).

## Update index.html

Open your `index.html` file. Add a new directions panel inside the existing `.panel` container:

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MapsIndoors</title>
    <link rel="stylesheet" href="style.css">
    <link href='https://api.mapbox.com/mapbox-gl-js/v3.10.0/mapbox-gl.css' rel='stylesheet' />
    <script src="https://app.mapsindoors.com/mapsindoors/js/sdk/4.40.2/mapsindoors-4.40.2.js.gz"
            integrity="sha384-tFHttWqE6qOoX8etJurRBBXpH6puWNTgC8Ilq477ltu4EcpHk9ZwFPJDIli9wAS7"
            crossorigin="anonymous"></script>
    <script src='https://api.mapbox.com/mapbox-gl-js/v3.10.0/mapbox-gl.js'></script>
</head>
<body>
    <div id="map"></div>
    <div class="panel">
        <div id="search-ui" class="flex-column">
            <input type="text" id="search-input" placeholder="Search for a location...">
            <ul id="search-results"></ul>
        </div>
        <div id="details-ui" class="hidden">
            <h3 id="details-name"></h3>
            <p id="details-description"></p>
            <button id="details-directions" class="details-button details-action-button">Get Directions</button>
            <button id="details-close" class="details-button">Close</button>
        </div>
        <div id="directions-ui" class="hidden flex-column">
            <h3>Directions</h3>
            <div class="directions-inputs">
                <input type="text" id="origin-input" placeholder="Choose origin...">
                <ul id="origin-results" class="directions-results-list"></ul>
                <input type="text" id="destination-input" placeholder="Choose destination..." disabled>
            </div>
            <button id="get-directions" class="details-button details-action-button">Show Route</button>
            <div class="directions-step-nav">
                <span id="step-indicator"></span>
                <button id="prev-step" class="details-button">Previous</button>
                <button id="next-step" class="details-button">Next</button>
            </div>
            <button id="directions-close" class="details-button">Close Directions</button>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>
```

### Explanation of index.html updates

- The `#details-ui` panel now includes a "Get Directions" button, allowing users to open the directions panel for the selected location.
- The `#directions-ui` panel is added to the `.panel` container. This new panel contains:
  - Input fields for origin and destination.
  - A button to get directions.
  - Step navigation controls (step indicator, previous/next buttons).
  - A close button for the directions panel.
- All panels (`#search-ui`, `#details-ui`, `#directions-ui`) use consistent class and ID naming, and only one is visible at a time, managed by the show/hide functions in the JavaScript.

## Update style.css

Add styles for the new directions UI elements:

```css
/* style.css */
html, body {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
#map {
    flex-grow: 1;
    width: 100%;
    margin: 0;
    padding: 0;
}
.panel {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
    background-color: white;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    max-height: 50%;
    overflow-y: auto;
    border: 1px solid #ccc;
    width: 300px;
}
.flex-column {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.hidden {
    display: none;
}
#search-input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
}
#search-results {
    list-style: none;
    padding: 0;
    margin: 0;
}
#search-results li {
    padding: 8px 0;
    cursor: pointer;
    border-bottom: 1px solid #eee;
}
#search-results li:last-child {
    border-bottom: none;
}
#search-results li:hover {
    background-color: #f0f0f0;
}
#search-ui,
#details-ui {
    width: 100%;
}
#details-name {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 1.2rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
}
#details-description {
    margin-bottom: 15px;
    font-size: 0.9rem;
    color: #555;
}
.details-button {
    padding: 8px;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
}
#details-close {
    background-color: #ccc;
    color: #333;
}
#details-close:hover {
    background-color: #bbb;
}
#directions-ui {
    width: 100%;
}
.directions-inputs {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 8px;
}
.directions-results-list {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 120px;
    overflow-y: auto;
}
.directions-results-list li {
    padding: 8px 0;
    cursor: pointer;
    border-bottom: 1px solid #eee;
}
.directions-results-list li:last-child {
    border-bottom: none;
}
.directions-results-list li:hover {
    background-color: #f0f0f0;
}
.directions-step-nav {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}
#step-indicator {
    grid-column: span 2;
}
```

**Explanation of style.css updates:**

- Styles for the new `#directions-ui` panel and its child elements are added:
  - `.directions-inputs` styles the input fields and results list for selecting origin and destination.
  - `.directions-results-list` styles the list of search results for the origin input.
  - `.directions-step-nav` and `#step-indicator` style the step navigation controls.

## Update script.js

Add the following logic for directions and UI state management:

```javascript
// script.js

// Define options for the MapsIndoors Mapbox view
const mapViewOptions = {
    accessToken: 'YOUR_MAPBOX_ACCESS_TOKEN', // Replace with your Mapbox token
    element: document.getElementById('map'),
    center: { lng: -97.74204591828197, lat: 30.36022358949809 }, // Example: MapsPeople Austin Office
    zoom: 17,
    maxZoom: 22,
    mapsIndoorsTransitionLevel: 16,
};

// Set the MapsIndoors API key
mapsindoors.MapsIndoors.setMapsIndoorsApiKey('YOUR_MAPSINDOORS_API_KEY'); // Replace with your MapsIndoors API key

const mapViewInstance = new mapsindoors.mapView.MapboxV3View(mapViewOptions);
const mapsIndoorsInstance = new mapsindoors.MapsIndoors({
    mapView: mapViewInstance,
    venue: 'YOUR_MAPSINDOORS_VENUE_ID', // Replace with your venue ID
});

const searchUIElement = document.getElementById('search-ui');
const detailsUIElement = document.getElementById('details-ui');
const directionsUIElement = document.getElementById('directions-ui');
const searchInputElement = document.getElementById('search-input');
const searchResultsElement = document.getElementById('search-results');
const detailsNameElement = document.getElementById('details-name');
const detailsDescriptionElement = document.getElementById('details-description');
const detailsCloseButton = document.getElementById('details-close');
const detailsDirectionsButton = document.getElementById('details-directions');
const directionsCloseButton = document.getElementById('directions-close');
const originInputElement = document.getElementById('origin-input');
const destinationInputElement = document.getElementById('destination-input');
const getDirectionsButton = document.getElementById('get-directions');
const stepIndicator = document.getElementById('step-indicator');
const prevStepButton = document.getElementById('prev-step');
const nextStepButton = document.getElementById('next-step');
let currentDetailsLocation = null;
let selectedOrigin = null;
let selectedDestination = null;
let currentRoute = null;
let directionsRenderer = null;

// --- UI State Management Functions ---
function showSearchUI() {
    hideDetailsUI();
    hideDirectionsUI();
    searchUIElement.classList.add('flex-column');
    searchUIElement.classList.remove('hidden');
    searchInputElement.focus();
}
function hideSearchUI() {
    searchUIElement.classList.add('hidden');
    searchUIElement.classList.remove('flex-column');
}
function showDetailsUI() {
    hideSearchUI();
    hideDirectionsUI();
    detailsUIElement.classList.add('flex-column');
    detailsUIElement.classList.remove('hidden');
}
function hideDetailsUI() {
    detailsUIElement.classList.add('hidden');
    detailsUIElement.classList.remove('flex-column');
}
function showDirectionsUI() {
    hideSearchUI();
    hideDetailsUI();
    directionsUIElement.classList.add('flex-column');
    directionsUIElement.classList.remove('hidden');
}
function hideDirectionsUI() {
    directionsUIElement.classList.add('hidden');
    directionsUIElement.classList.remove('flex-column');
}

// --- Event Listeners ---
searchInputElement.addEventListener('input', onSearch);
function onSearch() {
    const query = searchInputElement.value;
    const currentVenue = mapsIndoorsInstance.getVenue();
    searchResultsElement.innerHTML = '';
    if (query.length < 3) return;
    const searchParameters = { q: query, venue: currentVenue ? currentVenue.name : undefined };
    mapsindoors.services.LocationsService.getLocations(searchParameters).then(locations => {
        if (locations.length === 0) {
            const noResultsItem = document.createElement('li');
            noResultsItem.textContent = 'No results found';
            searchResultsElement.appendChild(noResultsItem);
            return;
        }
        locations.forEach(location => {
            const listElement = document.createElement('li');
            listElement.textContent = location.properties.name;
            listElement.addEventListener('click', () => {
                selectLocation(location);
            });
            searchResultsElement.appendChild(listElement);
        });
    });
}
function selectLocation(location) {
    currentDetailsLocation = location;
    detailsNameElement.textContent = location.properties.name;
    detailsDescriptionElement.textContent = location.properties.description || 'No description available.';
    showDetailsUI();
    hideSearchUI();
    hideDirectionsUI();
    mapViewInstance.setCenter(location.properties.anchor.coordinates);
    mapViewInstance.setZoom(17);
}
detailsCloseButton.addEventListener('click', () => {
    hideDetailsUI();
});
directionsCloseButton.addEventListener('click', () => {
    hideDirectionsUI();
});
const detailsDirectionsButton = document.getElementById('details-directions');
detailsDirectionsButton.addEventListener('click', () => {
    showDirectionsPanel(currentDetailsLocation);
});
function showDirectionsPanel(destinationLocation) {
    selectedOrigin = null;
    selectedDestination = destinationLocation;
    currentRoute = null;
    destinationInputElement.value = destinationLocation.properties.name;
    originInputElement.value = '';
    originResultsElement.innerHTML = '';
    showDirectionsUI();
    stepIndicator.textContent = '';
}
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
getDirectionsButton.addEventListener('click', async () => {
    if (!selectedOrigin || !selectedDestination) {
        stepIndicator.textContent = 'Please select both origin and destination.';
        return;
    }
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
    if (directionsRenderer) directionsRenderer.setVisible(false);
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
prevStepButton.addEventListener('click', () => {
    if (!directionsRenderer) return;
    directionsRenderer.previousStep();
    showCurrentStep();
});
nextStepButton.addEventListener('click', () => {
    if (!directionsRenderer) return;
    directionsRenderer.nextStep();
    showCurrentStep();
});
```

**Explanation of script.js updates:**

The code added to `script.js` enables your application to provide interactive directions between two locations using the MapsIndoors SDK. Here’s what each part accomplishes:

- **Directions Panel State Management:** Functions like `showDirectionsUI()` and `hideDirectionsUI()` ensure that only one panel (search, details, or directions) is visible at a time, providing a clear and focused user experience.
- **Origin and Destination Selection:** The code allows users to search for and select both an origin and a destination. The destination is pre-filled when the user clicks "Get Directions" from a location's details, while the origin can be searched and selected interactively.
- **Route Calculation:** When both locations are set, clicking "Show Route" uses the [DirectionsService](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.services.DirectionsService.html) to calculate a route between them. The `getRoute()` method returns a route object containing all the steps and legs of the journey. See the [getRoute() documentation](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.services.DirectionsService.html#getRoute) for details on available options and response structure.
- **Route Display and Navigation:** The [DirectionsRenderer](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.directions.DirectionsRenderer.html) is used to visually display the calculated route on the map. The `setRoute()` method loads the route, and `setStepIndex()` allows the user to step through each part of the route. For more, see the [setRoute()](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.directions.DirectionsRenderer.html#setRoute) and [setStepIndex()](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.directions.DirectionsRenderer.html#setStepIndex) references.
- **Step Navigation:** The "Previous" and "Next" buttons let users move through the route instructions, updating the map and the step indicator accordingly. This is managed by the `showCurrentStep()` function, which keeps the UI in sync with the current step of the route.

By combining these elements, the code provides a seamless way for users to get and follow directions within your venue. For a deeper understanding of each SDK method or class, refer to the MapsIndoors [JavaScript SDK Reference Guide](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/).

## Expected Outcome

- Users can search for a location, view its details, and click "Get Directions" to open the directions panel.
- The destination is pre-filled; the user can search for an origin.
- After selecting both, clicking "Show Route" displays the route and enables step-by-step navigation.
- The map updates to show the route and highlight the current step.
- Only one panel (search, details, or directions) is visible at a time.

## Troubleshooting

- If the route is not shown, ensure both origin and destination are selected and that the locations have valid anchor coordinates.
- If the map does not update, check for errors in the browser console and verify your API keys and venue ID.
- If the UI panels do not switch as expected, ensure the show/hide functions are called correctly and that the correct classes are applied.