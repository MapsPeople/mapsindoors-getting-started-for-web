# Step 1: Displaying a Map with Mapbox GL JS

**Goal:** This guide will walk you through initializing the MapsIndoors SDK and displaying your first interactive indoor map using Mapbox GL JS as the map provider.

**SDK Concepts Introduced:**

* Setting the MapsIndoors API Key.
* Initializing the Mapbox map view using `mapsindoors.mapView.MapboxV3View`.
* Creating the main `mapsindoors.MapsIndoors` instance.
* Adding a `mapsindoors.FloorSelector` control.

## Prerequisites

* Completion of the [Set Up Your Environment](../../../README.md) guide.
* You will need a **Mapbox Access Token**. If you don't have one, you can create one for free on the [Mapbox website](https://www.mapbox.com/signup/).
* You will need a **MapsIndoors API Key**. For this tutorial, you can use the demo API key: `02c329e6777d431a88480a09`.

## The Code

To display the map, you'll need to update your `index.html`, `style.css`, and `script.js` files as follows.

### Update index.html

Open your `index.html` file. You need to include the Mapbox GL JS CSS and JavaScript libraries from their CDN and ensure there's a `<div>` element to contain the map.

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MapsIndoors</title>
    <link rel="stylesheet" href="style.css">
    <!-- Mapbox GL JS CSS -->
    <link href='https://api.mapbox.com/mapbox-gl-js/v3.10.0/mapbox-gl.css' rel='stylesheet' />
    <!-- MapsIndoors SDK (already included from initial setup) -->
    <script src="https://app.mapsindoors.com/mapsindoors/js/sdk/4.41.0/mapsindoors-4.41.0.js.gz"
            integrity="sha384-3lk3cwVPj5MpUyo5T605mB0PMHLLisIhNrSREQsQHjD9EXkHBjz9ETgopmTbfMDc"
            crossorigin="anonymous"></script>
    <!-- Mapbox GL JS -->
    <script src='https://api.mapbox.com/mapbox-gl-js/v3.10.0/mapbox-gl.js'></script>
</head>
<body>
    <!-- This div will hold your map -->
    <div id="map"></div>
    <script src="script.js"></script>
</body>
</html>
```

**Explanation of index.html updates:**

* The `<link href='https://api.mapbox.com/mapbox-gl-js/v3.10.0/mapbox-gl.css' rel='stylesheet' />` tag in the `<head>` includes the necessary CSS for Mapbox GL JS. This styles the map elements provided by Mapbox.
* The `<script src='https://api.mapbox.com/mapbox-gl-js/v3.10.0/mapbox-gl.js'></script>` tag in the `<head>` includes the Mapbox GL JS library. **Note**: We are using version `3.10.0` in this example; you should verify this is the currently recommended version or check the [Mapbox documentation](https://docs.mapbox.com/mapbox-gl-js/guides/) for the latest.
* The MapsIndoors SDK script (`mapsindoors-4.41.0.js.gz`) should already be present from the initial setup guide. You can always check the [MapsIndoors SDK reference documentation](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/index.html) for the latest SDK version.
* An empty `<div>` with the attribute `id="map"` was added inside the `<body>`. This `div` is crucial as it serves as the container where both the Mapbox base map and the MapsIndoors layers will be rendered.

### Update style.css

Update your `style.css` file to ensure the `#map` element fills the available space. This is necessary for the map to be visible.

```css
/* style.css */

/* Use flexbox for the main layout (from initial setup) */
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
  /* Make map fill available space within its flex parent (body) */
  flex-grow: 1;
  width: 100%; /* Make map fill width */
  margin: 0;
  padding: 0;
}
```

**Explanation of style.css updates:**

* The styles for the `#map` container are added. These styles define how the map container behaves within the flexbox layout established in the initial setup (`html, body` styles).
* `flex-grow: 1;` is a key flexbox property that allows the map container to expand and fill the available vertical space within its parent (`body`).
* `width: 100%;` ensures the map fills the full horizontal width of its container.
* `margin: 0;` and `padding: 0;` remove any default browser spacing around the map container, ensuring it fits snugly.

### Add JavaScript to script.js

Open your `script.js` file and add the following JavaScript code. This code will initialize the Mapbox map, then create the MapsIndoors view and instance, and finally add a Floor Selector.

Remember to replace `YOUR_MAPBOX_ACCESS_TOKEN` with your actual Mapbox access token if you are not using the demo one, and `YOUR_MAPSINDOORS_API_KEY` with your MapsIndoors API key if not using the demo key. For testing, the demo MapsIndoors API key `02c329e6777d431a88480a09` and the Austin office venue ID `dfea941bb3694e728df92d3d` are used.

```javascript
// script.js

// Define options for the MapsIndoors Mapbox view
const mapViewOptions = {
    accessToken: 'YOUR_MAPBOX_ACCESS_TOKEN',
    element: document.getElementById('map'),
    // Initial map center (MapsPeople - Austin Office example)
    center: { lng: -97.74204591828197, lat: 30.36022358949809 },
    zoom: 17,
    maxZoom: 22,
    mapsIndoorsTransitionLevel: 16,
};

// Set the MapsIndoors API key
mapsindoors.MapsIndoors.setMapsIndoorsApiKey('YOUR_MAPSINDOORS_API_KEY');

// Create a new instance of the MapsIndoors Mapbox view (for Mapbox GL JS v3)
const mapViewInstance = new mapsindoors.mapView.MapboxV3View(mapViewOptions);

// Create a new MapsIndoors instance, linking it to the map view.
// This is the main object for interacting with MapsIndoors functionalities.
const mapsIndoorsInstance = new mapsindoors.MapsIndoors({
    mapView: mapViewInstance,
    // Set the venue ID to load the map for a specific venue
    venue: 'YOUR_MAPSINDOORS_VENUE_ID', // Replace with your actual venue ID
});

// Create a new HTML div element to host the floor selector
const floorSelectorElement = document.createElement('div');

// Create a new FloorSelector instance, linking it to the HTML element and the main MapsIndoors instance.
// The FloorSelector control allows users to change floors on the map.
new mapsindoors.FloorSelector(floorSelectorElement, mapsIndoorsInstance);

// Get the underlying Mapbox map instance from the MapsIndoors map view
// This is needed to use Mapbox's native methods like addControl.
const mapboxInstance = mapViewInstance.getMap();

// Add the floor selector HTML element to the Mapbox map using Mapbox's addControl method
// We wrap the element in an object implementing the IControl interface expected by addControl
mapboxInstance.addControl({
    onAdd: function () { return floorSelectorElement; },
    onRemove: function () { floorSelectorElement.parentNode.removeChild(floorSelectorElement); },
}, 'top-right'); // Position the control in the top-right corner
```

**Explanation of script.js:**

* `const mapViewOptions = { ... };`: This object defines essential configuration options for the MapsIndoors Mapbox view.
  * `accessToken`: Your Mapbox access token, required by Mapbox GL JS.
  * `element`: The HTML DOM element (our `<div id="map">`) where the map will be rendered.
  * `center`, `zoom`, `maxZoom`: Standard map parameters to set the initial view.
  * `mapsIndoorsTransitionLevel`: The zoom level at which MapsIndoors will start showing indoor details.
  * For more details on all available options, see the [mapsindoors.mapView.MapboxV3View class documentation](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.mapView.MapboxV3View.html) for a complete overview.
* `mapsindoors.MapsIndoors.setMapsIndoorsApiKey('YOUR_MAPSINDOORS_API_KEY');`: This static method sets your MapsIndoors API key globally for the SDK. This key authenticates your requests to MapsIndoors services. To explore more about the main MapsIndoors class and its static methods, see the [mapsindoors.MapsIndoors class reference](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/MapsIndoors.html).
* `const mapViewInstance = new mapsindoors.mapView.MapboxV3View(mapViewOptions);`: This line creates an instance of `MapboxV3View`, which is responsible for integrating MapsIndoors data and rendering with a Mapbox GL JS v3 map. It takes the `mapViewOptions` we defined. The `MapboxV3View` class is key to this integration. For more details on `MapboxV3View`, see its [class reference](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.mapView.MapboxV3View.html).
* `const mapsIndoorsInstance = new mapsindoors.MapsIndoors({ mapView: mapViewInstance, venue: 'YOUR_MAPSINDOORS_VENUE_ID' });`: This creates the main `MapsIndoors` instance. This object is your primary interface for interacting with MapsIndoors functionalities like displaying locations, getting directions, etc.
  * `mapView`: Links this `MapsIndoors` instance to the `mapViewInstance` we created.
  * `venue`: Specifies the ID of the MapsIndoors venue you want to load. Here, we use the demo venue ID for the Austin office.
  * To explore all available options for the constructor, check out the [mapsindoors.MapsIndoors class documentation](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/MapsIndoors.html)).

* **Floor Selector Integration:**
  * `const floorSelectorElement = document.createElement('div');`: A new HTML `div` element is dynamically created. This element will serve as the container for the Floor Selector UI.
  * `new mapsindoors.FloorSelector(floorSelectorElement, mapsIndoorsInstance);`: This instantiates the `FloorSelector` control. It takes the HTML element to render into and the `mapsIndoorsInstance` to interact with (e.g., to know available floors and change the current floor). The `FloorSelector` is responsible for allowing users to change floors. For more details on `FloorSelector`, see its [class reference](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.FloorSelector.html).
  * `const mapboxInstance = mapViewInstance.getMap();`: The `getMap()` method on our `mapViewInstance` returns the underlying native Mapbox `Map` object. This is necessary to use Mapbox-specific functionalities.
  * `mapboxInstance.addControl({ ... }, 'top-right');`: This uses the native Mapbox `addControl` method to add our `floorSelectorElement` to the Mapbox map interface. The first argument is an object that implements Mapbox\'s `IControl` interface, and the second argument specifies the position of the control on the map. For more details on custom controls in Mapbox, refer to the [Mapbox GL JS documentation on IControl](https://docs.mapbox.com/mapbox-gl-js/api/markers/#icontrol).

## Expected Outcome

After completing these steps and opening your `index.html` file in a web browser, you should see:

* An interactive map centered on the MapsPeople Austin Office.
* A Floor Selector control visible in the top-right corner of the map, allowing you to switch between different floors of the venue.

<!-- Placeholder for a screenshot: <img src="path/to/screenshot.png" alt="Map with Floor Selector" width="600"/> -->

## Troubleshooting

* **Map doesn't load / blank page:**
  * Check your browser's developer console (usually F12) for any error messages.
  * Ensure you have replaced `YOUR_MAPBOX_ACCESS_TOKEN` with a valid token in `script.js` (or are using the provided demo token correctly).
  * Verify that `YOUR_MAPSINDOORS_API_KEY` is correctly set (or the demo key is used).
  * Double-check all CDN links in `index.html` are correct and accessible.
* **Floor selector doesn't appear:**
  * Verify the JavaScript code for creating and adding the floor selector has no typos.
  * Check the console for errors related to `FloorSelector` or `addControl`.

## Next Steps

You have successfully displayed a MapsIndoors map with Mapbox GL JS and added a floor selector! This is the foundational step for building more complex indoor mapping applications.

Next, you will learn how to add search functionality to your map:

* [Step 2: Create a Search Experience](../2-create-a-search-experience/readme.md)
