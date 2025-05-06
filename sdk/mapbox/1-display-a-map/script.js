const mapViewOptions = {
    accessToken: 'pk.eyJ1IjoiZW5lcHBlciIsImEiOiJja2c5MzlqaDIwNTgwMnhwdWg5M2gycXQyIn0.3yzc8Se6Majxr2O09HNGiA',
    element: document.getElementById('map'),
    center: { lng: -97.74204591828197, lat: 30.36022358949809 }, // MapsPeople - Austin Office
    zoom: 17,
    maxZoom: 22,
    mapsIndoorsTransitionLevel: 16,
};

mapsindoors.MapsIndoors.setMapsIndoorsApiKey('02c329e6777d431a88480a09');

const mapViewInstance = new mapsindoors.mapView.MapboxV3View(mapViewOptions);
const mapsIndoorsInstance = new mapsindoors.MapsIndoors({
    mapView: mapViewInstance,
});

const mapboxInstance = mapViewInstance.getMap();

// Floor Selector
const floorSelectorElement = document.createElement('div');
new mapsindoors.FloorSelector(floorSelectorElement, mapsIndoorsInstance);
mapboxInstance.addControl({
    onAdd: function () {
        return floorSelectorElement;
    },
    onRemove: function () { },
});
