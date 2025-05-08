// script.js

// Get a reference to the MapsIndoors Google Maps component element
const miMapElement = document.querySelector('mi-map-googlemaps');

// Add an event listener for the 'mapsIndoorsReady' event.
// This event fires when the component has finished loading the base map and MapsIndoors data.
miMapElement.addEventListener('mapsIndoorsReady', () => {
  // Get the underlying MapsIndoors map instance from the component
  // getMapInstance() returns a Promise, so we use .then() to wait for it
  miMapElement.getMapInstance().then((mapInstance) => {
    // Example: Set the map center to the MapsPeople Austin Office location
    mapInstance.setCenter({ lat: 30.36026660239549, lng: -97.74223633857213 });
  })
  .catch((error) => {
      console.error('Error getting map instance:', error);
  });
});