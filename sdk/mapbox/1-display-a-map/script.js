const mapViewOptions = {
    accessToken: 'pk.eyJ1IjoibWFwc3Blb3BsZSIsImEiOiJjbHV0cWo2MGUwMDA2MmtyeXV0cmZpcXQ4In0.iOwpJY4KqHVQoxA1UPEvgQ',
    element: document.getElementById('map'),
    center: { lat: 30.359285384, lng: -97.7412840716576 }, // MapsPeople - Austin Office
    zoom: 17,
    maxZoom: 22
};
mapsindoors.MapsIndoors.setMapsIndoorsApiKey('d876ff0e60bb430b8fabb145');

const mapViewInstance = new mapsindoors.mapView.MapboxV3View(mapViewOptions);
const mapsIndoorsInstance = new mapsindoors.MapsIndoors({ mapView: mapViewInstance });
const mapboxInstance = mapViewInstance.getMap();

// Floor Selector
const floorSelectorElement = document.createElement('div');
new mapsindoors.FloorSelector(floorSelectorElement, mapsIndoorsInstance);
mapboxInstance.addControl({ onAdd: function () { return floorSelectorElement }, onRemove: function () { } });