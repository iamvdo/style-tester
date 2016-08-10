mapboxgl.ZoomDisplay = ControlZoomDisplay;

function ControlZoomDisplay () {

}

ControlZoomDisplay.prototype = mapboxgl.util.inherit(mapboxgl.Control, {
    options: {
        position: 'top-right'
    },

    onAdd: function(map) {
        var className = 'mapboxgl-zoom-display',
            container = this._container = document.createElement('div');
        this._updateContainer(className);
        map.on('zoomend', this._zoomend.bind(this));
        return container;
    },

    _updateContainer: function (className) {
        this._container.className = className;
        this._container.innerHTML = this._zoomString();
    },

    _zoomString: function () {
        var zoomString = '';
        var zoom = this._map.getZoom();
        var zoomRound = parseInt(zoom, 10);
        var zoomDecimals = zoom - zoomRound;
        zoomString += zoomRound;
        if (zoomDecimals) {
            zoomDecimals = ('' + zoomDecimals.toFixed(2)).replace('0', '');
            zoomString += '<small>' + zoomDecimals + '</small>';
        }
        return zoomString;
    },

    _zoomend: function () {
        this._updateMapZoom(this._zoomString())
    },

    _updateMapZoom: function (zoom) {
        this._container.innerHTML = zoom
    }

});