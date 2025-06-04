# Step 3: Show Location Details

**Goal:** This guide will demonstrate how to display detailed information about a location when a user selects it from the search results. The details will include the location's name and description, and the map will navigate to and highlight the selected location.

**SDK Concepts Introduced:**

* Responding to user interaction (click) on a search result.
* Retrieving and displaying location properties: `location.properties.name`, `location.properties.description`.
* Using `mapsIndoorsInstance.selectLocation()` to visually select and highlight a specific location on the map.
* Using `mapsIndoorsInstance.goTo()` to pan and zoom the map to the selected location.
* Using `mapsIndoorsInstance.setFloor()` to switch the map to the floor of the selected location.
* Dynamically showing and hiding UI elements to switch between search view and details view.

## Prerequisites

* Completion of [Step 2: Create a Search Experience](../2-create-a-search-experience/readme.md).
* Your MapsIndoors API Key and Google Maps JavaScript API Key should be correctly set up. We will continue using the demo API key `02c329e6777d431a88480a09` and venue ID `dfea941bb3694e728df92d3d` for this example.

## The Code

This step involves modifications to `index.html` to add elements for displaying details, `style.css` to style these new elements, and `script.js` to handle the logic of fetching and displaying location details and interacting with the map.

### Update index.html

Open your `index.html` file. Add a new `div` within the existing `.panel` to hold the location details. This `div` will be hidden by default and shown when a location is selected.

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MapsIndoors</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://maps.googleapis.com/maps/api/js?libraries=geometry&key=YOUR_GOOGLE_MAPS_API_KEY"></script>
    <script src="https://app.mapsindoors.com/mapsindoors/js/sdk/4.41.0/mapsindoors-4.41.0.js.gz"
            integrity="sha384-3lk3cwVPj5MpUyo5T605mB0PMHLLisIhNrSREQsQHjD9EXkHBjz9ETgopmTbfMDc"
            crossorigin="anonymous"></script>
</head>

<body>
    <div id="map"></div>

    <div class="panel">
        <!-- Search UI elements from Step 2 -->
        <div id="search-ui" class="flex-column"> <!-- Wrap search elements -->
            <input type="text" id="search-input" placeholder="Search for a location...">
            <ul id="search-results"></ul>
        </div>

        <!-- New Details UI - initially hidden -->
        <div id="details-ui" class="hidden flex-column">
            <h3 id="details-name"></h3>
            <p id="details-description"></p>
            <button id="details-close" class="details-button">Close</button>
        </div>
    </div>

    <script src="script.js"></script>
</body>

</html>
```

**Explanation of index.html updates:**

* The existing search input and results list are wrapped in a `div` with `id="search-ui"` and class `flex-column`. This helps in managing the visibility of the entire search section.
* A new `div` with `id="details-ui"` is added within the `.panel`. This container will hold the location's name, description, and a close button.
  * It has the class `hidden` to be invisible by default.
  * It also has `flex-column` for layout consistency.
* Inside `#details-ui`:
  * `<h3 id="details-name"></h3>`: For displaying the location name.
  * `<p id="details-description"></p>`: For displaying the location description.
  * `<button id="details-close" class="details-button">Close</button>`: A button to close the details view and return to the search results.

### Update style.css

Modify your `style.css` file to add styles for the new location details UI elements.

```css
/* style.css */

/* Use flexbox for the main layout */
html, body {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden; /* Prevent scrollbars if map is full size */
    display: flex;
    flex-direction: column; /* Stack children vertically if needed later */
}

/* Style for the map container */
#map {
  /* Make map fill available space */
  flex-grow: 1;
  width: 100%; /* Make map fill width */
  margin: 0;
  padding: 0;
}

/* Style for the information panel container */
.panel {
    position: absolute; /* Position over the map */
    top: 10px; /* Distance from the top */
    left: 10px; /* Distance from the left */
    z-index: 10; /* Ensure it's above the map and other elements */
    background-color: white; /* White background for readability */
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2); /* Add a subtle shadow */
    max-height: 80%; /* Limits max-height to prevent overflow with details */
    overflow-y: auto; /* Add scroll if content exceeds max-height */
    border: 1px solid #ccc; /* Add border for clarity */
    width: 300px;
}

/* Class to apply flex display and column direction */
.flex-column {
    display: flex;
    flex-direction: column;
    gap: 10px; /* Space between elements */
}

/* Class to hide elements */
.hidden {
    display: none;
}

/* Style for the search input field */
#search-input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
}

/* Style for the search results list */
#search-results {
    list-style: none; /* Remove default list bullets */
    padding: 0;
    margin: 0;
}

/* Style for individual search result items */
#search-results li {
    padding: 8px 0;
    cursor: pointer; /* Indicate clickable items */
    border-bottom: 1px solid #eee; /* Separator line */
}

/* Style for the last search result item (no bottom border) */
#search-results li:last-child {
    border-bottom: none;
}

/* Hover effect for search result items */
#search-results li:hover {
    background-color: #f0f0f0; /* Highlight on hover */
}

/* --- New Styles for Location Details UI elements --- */

/* Styles for the new UI wrappers within #search-container */
#search-ui,
#details-ui {
    width: 100%; /* Ensure they fill the container's width */
    /* display: flex and flex-direction are controlled by .flex-column-container class via JS */
}

/* Style for the location name in details */
#details-name {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 1.2rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
}

/* Style for the location description in details */
#details-description {
    margin-bottom: 15px;
    font-size: 0.9rem;
    color: #555;
}

/* Style for general buttons within details */
.details-button {
     padding: 8px;
     border: none;
     border-radius: 4px;
     font-size: 0.9rem;
     cursor: pointer;
     margin-bottom: 8px; /* Space between buttons */
     transition: background-color 0.3s ease;
}

 .details-button:last-child {
     margin-bottom: 0;
 }

/* Specific style for the Close button */
#details-close {
    background-color: #ccc; /* Grey */
    color: #333;
}
 #details-close:hover {
     background-color: #bbb;
 }
```

**Explanation of style.css updates:**

* `#search-ui`, `#details-ui`: Basic styling to ensure they take full width. The `flex-column` class will handle their internal layout.
* `#details-name`: Styles for the location name heading (font size, margin, border).
* `#details-description`: Styles for the description text (font size, color, `white-space: pre-wrap` to respect newlines from the data, `max-height` and `overflow-y` for scrollability).
* `.details-button`: General styling for buttons in the details view (padding, border-radius, full width).
* `#details-close`: Specific styling for the "Close" button (background color, text color, hover effect).

### Update script.js

The `script.js` file will be updated to handle showing/hiding the details panel, populating it with location data, and interacting with the map.

```javascript
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

/** Floor Selector **/

// Create a new HTML div element to host the floor selector
const floorSelectorElement = document.createElement('div');

// Create a new FloorSelector instance, linking it to the HTML element and the main MapsIndoors instance.
new mapsindoors.FloorSelector(floorSelectorElement, mapsIndoorsInstance);

// Get the underlying Google Maps instance
const googleMapInstance = mapViewInstance.getMap();

// Add the floor selector HTML element to the Google Maps controls.
googleMapInstance.controls[google.maps.ControlPosition.TOP_RIGHT].push(floorSelectorElement);

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

/** UI State Management Functions **/

const searchUIElement = document.getElementById('search-ui');
const detailsUIElement = document.getElementById('details-ui');
const directionsUIElement = document.getElementById('directions-ui');

function showSearchUI() {
    hideDetailsUI(); // Ensure details UI is hidden
    searchUIElement.classList.add('flex-column');
    searchUIElement.classList.remove('hidden');
    searchInputElement.focus();
}

function showDetailsUI() {
    hideSearchUI(); // Ensure search UI is hidden
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


/** Location Details Functionality (Implemented within the search container) **/

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
    // Use new UI state functions
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
```

**Explanation of script.js updates:**

* **UI Element References**: The script references the search UI (`#search-ui`), details UI (`#details-ui`), and their child elements for displaying the location name (`#details-name`), description (`#details-description`), and the close button (`#details-close`).
* **Event Listeners**:
  * An `input` event listener on `searchInputElement` triggers the `onSearch` function whenever the user types.
  * The click listener for the `detailsCloseButton` is managed so it is not duplicated, and always calls `showSearchUI` to revert to the search view.
* **UI State Management Functions:**
  * `showSearchUI()`: Hides the details panel and shows the search panel. Also focuses the search input for user convenience. Ensures only the search UI is visible.
  * `showDetailsUI()`: Hides the search panel and shows the details panel. Ensures only the details UI is visible.
  * `hideSearchUI()`: Hides the search panel. Used internally by `showDetailsUI()`.
  * `hideDetailsUI()`: Hides the details panel. Used internally by `showSearchUI()`.
* **`onSearch()` Function**:
  * Clears previous search results from the list, clears any general map highlights, and deselects any specifically selected location.
  * Calls `showSearchUI()` to ensure the interface is in the correct state (search view visible, details view hidden) when a new search is initiated.
  * If the search query is less than 3 characters, it ensures the results list is hidden and exits.
  * Prepares `searchParameters` using the query and the name of the current venue (`currentVenue.name`).
  * Calls `mapsindoors.services.LocationsService.getLocations()` to fetch matching locations. For detailed information on this service, see the [LocationsService API documentation](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.services.LocationsService.html#.getLocations).
  * Dynamically creates list items for each found location. Clicking a list item calls `showDetailsInSearchContainer(location)`.
* **`showDetailsInSearchContainer(location)` Function**:
  * Stores the selected `location` object (which conforms to the [Location interface](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.Location.html)).
  * Populates the `#details-name` and `#details-description` elements with the location's properties, such as `name` and `description`. The `properties` object on an object conforming to the `Location` interface contains these and other details. For a comprehensive list, see the [Location documentation](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.Location.html).
  * Switches the view from the search UI to the details UI using the new UI state management functions.
  * Attaches (or re-attaches) the event listener to the `detailsCloseButton`. The previous event listener is always removed before adding a new one to avoid duplicate handlers, which could cause the function to be called multiple times.
  * **Map Interactions**: It then interacts with the map to focus on the selected location:
    * `mapsIndoorsInstance.selectLocation(location)`: Selects and highlights the location on the map. More details can be found in the [`selectLocation()` reference](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/MapsIndoors.html#selectLocation).
    * `mapsIndoorsInstance.goTo(location)`: Pans and zooms the map to the location. See the [`goTo()` documentation](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/MapsIndoors.html#goTo) for more.
    * `mapsIndoorsInstance.setFloor(location.properties.floor)`: Changes the map to the location's floor. The `location.properties.floor` provides the necessary floor index. Consult the [`setFloor()` API documentation](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/MapsIndoors.html#setFloor) for further details.
* **Initial Setup**: `showSearchUI()` is called once at the end of the script to ensure the application starts with the search interface visible.

### Notice: Change in Click Handler Logic

In Step 2, clicking a search result only highlighted and selected the location on the map. In this step, the click handler has been updated:

* Now, clicking a search result calls `showDetailsInSearchContainer(location)`, which not only highlights and selects the location, but also opens a details panel with more information and manages the UI transition.

This change makes the user experience more interactive and informative, and is reflected in the updated code and explanations above.

## Expected Outcome

After implementing these changes:

* When you search for locations and click on a result in the list:
  * The search input and results list will be hidden.
  * A details panel will appear showing the selected location's name and description.
  * The map will pan and zoom to the selected location.
  * The selected location will be highlighted on the map.
  * The map will switch to the correct floor of the selected location.
* Clicking the "Close" button in the details panel will hide the details and show the search input and results list again.

## Troubleshooting

* **Details panel doesn't show or shows incorrect data:**
  * Check browser console for errors.
  * Verify IDs in `index.html` match those used in `script.js` for `getElementById`.
  * Ensure `location.properties.name` and `location.properties.description` exist for the selected location or that default text is handled.
  * Confirm CSS for `.hidden`, `#search-ui`, and `#details-ui` is correctly applied and toggled.
* **Map doesn't navigate or select location:**
  * Ensure `mapsIndoorsInstance` is correctly initialized.
  * Verify the `location` object passed to `showDetailsInSearchContainer` is a valid object conforming to the `Location` interface.
  * Check for console errors when `selectLocation`, `goTo`, or `setFloor` are called.
* **"Close" button doesn't work:**
  * Ensure the event listener is correctly attached to `detailsCloseButton` and that `showSearchUI` is called.

## Next Steps

You've now enhanced your application to display detailed information about locations. Users can not only find locations but also learn more about them.

Next, you will learn how to get and display directions between locations:

* [Step 4: Getting Directions](../4-getting-directions/readme.md)
