# Step 2: Create a Search Experience

**Goal:** This guide will show you how to add a search input field to your map application, allowing users to find locations within your venue. Search results will be displayed in a list and highlighted on the map.

**SDK Concepts Introduced:**

* Using `mapsindoors.services.LocationsService.getLocations()` to fetch locations based on a query.
* Interacting with the map based on search results:
  * Highlighting multiple locations: `mapsIndoorsInstance.highlight()`.
  * Navigating to a location: `mapsIndoorsInstance.goTo()`.
  * Setting the floor: `mapsIndoorsInstance.setFloor()`.
  * Selecting a specific location: `mapsIndoorsInstance.selectLocation()`.
* Clearing previous highlights and selections: `mapsIndoorsInstance.highlight()` (with no arguments) and `mapsIndoorsInstance.selectLocation()` (with no arguments).
* Getting current venue information: `mapsIndoorsInstance.getVenue()`.

## Prerequisites

* Completion of [Step 1: Displaying a Map with Google Maps](../1-display-a-map/readme.md).
* Your MapsIndoors API Key and Google Maps JavaScript API Key should be correctly set up as per Step 1. We will continue using the demo API key `02c329e6777d431a88480a09` and venue ID `dfea941bb3694e728df92d3d` for this example.

## The Code

This guide details the modifications to HTML, CSS, and JavaScript needed to add a search input field, display search results, and dynamically interact with the map based on user searches.

### Update index.html

Open your `index.html` file. Add a dedicated search panel containing an input field for queries and an unordered list for search results.

```html
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
        <div id="search-ui" class="flex-column">
            <input type="text" id="search-input" placeholder="Search for a location...">
            <ul id="search-results"></ul>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>
```

**Explanation of index.html updates:**

* A new `div` with the class `panel` is added to contain the search UI.
* Inside, a `div` with id `search-ui` and class `flex-column` arranges the input and results vertically.
* The `<input>` with `id="search-input"` is for user queries.
* The `<ul>` with `id="search-results"` will display results dynamically.

### Update style.css

Add styles for the search panel and its contents to ensure a user-friendly and visually appealing interface.

```css
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
    max-height: 80%;
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
```

**Explanation of style.css updates:**

* `.panel`: Styles the search panel to float over the map in the top-left corner, with a white background, padding, rounded corners, and a shadow.
* `.flex-column`: Stacks child elements vertically with a gap.
* `.hidden`: Utility class to hide elements.
* `#search-input`: Styles the search input field.
* `#search-results`: Styles the results list.
* `#search-results li`: Styles individual result items, including hover effects.

### Add JavaScript to script.js

Open your `script.js` file and add the following JavaScript code. This code will initialize the Google Map, then create the MapsIndoors view and instance, and finally add a Floor Selector and search functionality.

**Note:**

* Replace the demo MapsIndoors API key and venue ID in `script.js` with your own values if you have them.
* For quick testing, you can use the demo MapsIndoors API key `02c329e6777d431a88480a09` and the Austin office venue ID `dfea941bb3694e728df92d3d` as shown below.

```javascript
// Define options for the MapsIndoors Google Maps view
const mapViewOptions = {
    element: document.getElementById('map'),
    center: { lng: -97.74204591828197, lat: 30.36022358949809 },
    zoom: 17,
    maxZoom: 22,
};

// Set the MapsIndoors API key
mapsindoors.MapsIndoors.setMapsIndoorsApiKey('YOUR_MAPSINDOORS_API_KEY');

// Create a new instance of the MapsIndoors Google Maps view
const mapViewInstance = new mapsindoors.mapView.GoogleMapsView(mapViewOptions);

// Create a new MapsIndoors instance, linking it to the map view
const mapsIndoorsInstance = new mapsindoors.MapsIndoors({
    mapView: mapViewInstance,
    venue: 'YOUR_MAPSINDOORS_VENUE_ID', // Replace with your actual venue ID
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
```

**Explanation of script.js updates:**

* `searchInputElement` and `searchResultsElement` reference the search input and results list.
* The results list is hidden by default.
* An `input` event listener on the search field triggers the `onSearch` function.
* `onSearch()`:
  * Gets the query and current venue.
  * Clears previous results and highlights.
  * Hides the results if the query is too short.
  * Calls `mapsindoors.services.LocationsService.getLocations()` to fetch matching locations.
  * Populates the results list and highlights locations on the map.
  * Clicking a result pans/zooms to the location, sets the floor, and selects the location.
* For more details, see the [LocationsService.getLocations() documentation](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.services.LocationsService.html#.getLocations) and [MapsIndoors API reference](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/MapsIndoors.html).

## Expected Outcome

After implementing these changes:

* A search panel will be visible in the top-left corner of your map.
* Typing 3 or more characters into the search input will trigger a search.
* Matching locations will appear as a clickable list below the search input.
* All matching locations will be highlighted on the map.
* Clicking a location in the list will:
  * Pan and zoom the map to that location.
  * Switch to the correct floor if necessary.
  * Select and distinctively highlight that specific location on the map.

## Troubleshooting

* **Search not working / No results:**
  * Check the browser's developer console (F12) for errors.
  * Ensure your MapsIndoors API Key (`02c329e6777d431a88480a09` for demo) is correct and the MapsIndoors SDK is loaded.
  * Verify your Google Maps API key is correct.
  * Confirm the `venue` ID (`dfea941bb3694e728df92d3d` for demo) is valid and the venue has searchable locations.
  * Make sure the `onSearch` function is being called (e.g., add a `console.log` at the beginning of `onSearch`).
* **Results list doesn't appear or looks wrong:**
  * Check CSS for the `.panel`, `#search-results`, and `li` elements. Ensure the `.hidden` class is being correctly added/removed.
* **Map interactions (goTo, highlight, selectLocation) not working:**
  * Verify `mapsIndoorsInstance` is correctly initialized.
  * Ensure the `location` objects passed to these methods are valid objects conforming to the `Location` interface.
  * Check for console errors when clicking a search result.

## Next Steps

You've now successfully added a powerful search feature to your indoor map! Users can easily find their way to specific points of interest.

Next, learn how to display detailed information about a selected location:

* [Step 3: Show the Details](../3-show-the-details/readme.md)
