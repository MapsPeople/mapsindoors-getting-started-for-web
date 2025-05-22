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
* Your MapsIndoors API Key and Mapbox Access Token should be correctly set up. We will continue using the demo API key `02c329e6777d431a88480a09` and venue ID `dfea941bb3694e728df92d3d` for this example.

## The Code

This step involves modifications to `index.html` to add elements for displaying details, `style.css` to style these new elements, and `script.js` to handle the logic of fetching and displaying location details and interacting with the map.

### Update index.html

Open your `index.html` file. We will add a new `div` within the existing `.panel` to hold the location details. This `div` will be hidden by default and shown when a location is selected.

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
/* ... (existing styles from Step 2 remain unchanged) ... */

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

/* Class to apply flex display and column direction (already exists) */
.flex-column {
    display: flex;
    flex-direction: column;
    gap: 10px; /* Space between elements */
}

/* Class to hide elements (already exists) */
.hidden {
    display: none !important; /* Use !important to ensure override if needed */
}

/* ... (styles for #search-input, #search-results, etc. remain) ... */

/* --- New Styles for Location Details UI elements --- */

/* Styles for the UI wrappers within the panel */
#search-ui,
#details-ui {
    width: 100%; /* Ensure they fill the panel's width */
    /* display: flex and flex-direction are handled by .flex-column */
}

/* Style for the location name in details */
#details-name {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 1.2rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
    color: #333;
}

/* Style for the location description in details */
#details-description {
    margin-bottom: 15px;
    font-size: 0.9rem;
    color: #555;
    white-space: pre-wrap; /* Preserve line breaks in description */
    max-height: 200px; /* Limit description height */
    overflow-y: auto; /* Scroll for long descriptions */
}

/* Style for general buttons within details */
.details-button {
     padding: 10px 15px;
     border: none;
     border-radius: 4px;
     font-size: 0.9rem;
     cursor: pointer;
     margin-bottom: 8px;
     transition: background-color 0.2s ease-in-out;
     width: 100%; /* Make buttons full width of their container */
     box-sizing: border-box; /* Include padding and border in the element's total width and height */
}

 .details-button:last-child {
     margin-bottom: 0;
 }

/* Specific style for the Close button */
#details-close {
    background-color: #6c757d; /* Bootstrap secondary-like grey */
    color: white;
}
 #details-close:hover {
     background-color: #5a6268;
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
const mapboxInstance = mapViewInstance.getMap();

// Floor Selector (from Step 1)
const floorSelectorElement = document.createElement('div');
new mapsindoors.FloorSelector(floorSelectorElement, mapsIndoorsInstance);
mapboxInstance.addControl({
    onAdd: function () {
        return floorSelectorElement;
    },
    onRemove: function () { /* Clean up if needed */ },
}, 'top-right');

/*
 * UI Element References
 */
const searchInputElement = document.getElementById('search-input');
const searchResultsElement = document.getElementById('search-results');
const detailsNameElement = document.getElementById('details-name');
const detailsDescriptionElement = document.getElementById('details-description');
const detailsCloseButton = document.getElementById('details-close');

let currentDetailsLocation = null;

/*
 * Event Listeners
 */
searchInputElement.addEventListener('input', onSearch);
// The close button listener is added dynamically in showDetailsInSearchContainer

/*
 * Search Functionality
 */
function onSearch() {
    const query = searchInputElement.value;
    const currentVenue = mapsIndoorsInstance.getVenue();

    searchResultsElement.innerHTML = null;
    searchResultsElement.classList.add('hidden'); // Hide results list initially or when query is short
    mapsIndoorsInstance.highlight(); // Clear previous general highlights from search
    mapsIndoorsInstance.selectLocation(); // Deselect any specifically selected location
    
    showSearchUI(); // Ensure search UI is visible and details UI is hidden when typing a new search

    if (query.length < 3) {
        return;
    }

    // Prepare search parameters. Note: using currentVenue.name here.
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
            listElement.textContent = location.properties.name;
            // Add click event listener to show details for this location
            listElement.addEventListener('click', () => showDetailsInSearchContainer(location));
            searchResultsElement.appendChild(listElement);
        });

        searchResultsElement.classList.remove('hidden'); // Show results list
        // Note: Unlike Step 2, this step does not re-highlight all search results on the map here.
        // Highlighting is handled when a specific location is selected in showDetailsInSearchContainer.
    });
}

/*
 * UI State Management Functions
 */

// --- UI State Management Functions ---
const searchUIElement = document.getElementById('search-ui');
const detailsUIElement = document.getElementById('details-ui');
const directionsUIElement = document.getElementById('directions-ui');

function showSearchUI() {
    hideDetailsUI();
    searchUIElement.classList.add('flex-column');
    searchUIElement.classList.remove('hidden');
    searchInputElement.focus();
    currentDetailsLocation = null;
}

function showDetailsUI() {
    hideSearchUI();
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

// Initial setup: Ensure the search UI is visible when the page loads
showSearchUI();
```

**Explanation of script.js updates:**

* **API Keys & Venue ID**: Remember to replace the placeholders `YOUR_MAPBOX_ACCESS_TOKEN`, `YOUR_MAPSINDOORS_API_KEY`, and `YOUR_MAPSINDOORS_VENUE_ID` with your actual credentials when implementing this guide.
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
