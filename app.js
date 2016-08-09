var STATE = {
  accessToken: 'pk.eyJ1IjoiaWFtdmRvIiwiYSI6IkI1NGhfYXMifQ.2FD2Px_Fh2gAZCFTxdrL7g',
  places: {
    montBlanc: [45.83, 6.86],
    everest: [27.99, 86.92],
    hverfjall: [65.60, -16.87],
    craterLake: [42.94, -122.15],
    paris: [48.85, 2.35]
  },
  styles: {
    cir4w5nu1000vclnnqashz1ts: 'Contours (mountains)',
    cir87x1cf0004h4m2mwxnisli: 'Outdoor (Mapbox)'
  },
  maxZoom: 16
};

function createMaps (styleToken, center, zoom, setForms) {

  var centerR = center.slice(0); centerR.reverse();
  zoom = zoom || 13;
  if (typeof zoom === 'function') {
    setForms = zoom;
    zoom = 13;
  }

  function createLeafletMap (id) {
    var style = styleLeaflet();
    var map_leaflet = L.map(id, style.opts);
    L.tileLayer(style.url, style.tilelayer).addTo(map_leaflet);
    return map_leaflet;
  }
  function createMapboxGLMap (id) {
    var style = styleMapboxGL(id);
    mapboxgl.accessToken = STATE.accessToken;
    return new mapboxgl.Map(style);
  }
  function styleLeaflet () {
    return {
      url: 'https://api.mapbox.com/styles/v1/iamvdo/' + styleToken + '/tiles/512/{z}/{x}/{y}@2x?access_token={accessToken}',
      tilelayer: {
        attribution: '',
        tileSize: 512,
        zoomOffset: -1,
        maxZoom: 18,
        accessToken: STATE.accessToken
      },
      opts: {
        center: center,
        zoom: zoom,
        maxZoom: STATE.maxZoom
      }
    };
  };
  function styleMapboxGL (id) {
    return {
      container: id,
      style: 'mapbox://styles/iamvdo/' + styleToken,
      center: centerR,
      zoom: zoom - 1,
      maxZoom: STATE.maxZoom - 1
    }
  }
  function syncMaps (map_leaflet, map_mapboxgl) {
    map_leaflet.on('move', leaflet2gl)
    function leaflet2gl (evt) {
      map_mapboxgl.easeTo({
        center: map_leaflet.getCenter(),
        zoom: map_leaflet.getZoom() - 1,
        bearing: 0,
        pitch: 0
      });
    }
  }

  // create Leaflet map
  if (STATE.map_leaflet) {
    STATE.map_leaflet.remove();
  }

  // store maps
  STATE.map_leaflet = createLeafletMap('map--leaflet');
  STATE.map_mapboxgl = createMapboxGLMap('map--mapboxgl');

  // sync leaflet map with mapboxgl one
  syncMaps(STATE.map_leaflet, STATE.map_mapboxgl);

  if (setForms) {
    setForms(styleToken, center)
  }

}

function setForms (styleToken, centerKey) {
  setStylesForm(styleToken);
  setPlacesForm(styleToken, centerKey);
}

function setStylesForm (styleToken) {
  // add all styles to datalist
  var styles = document.getElementById('styles');
  Object.keys(STATE.styles).map(id => {
    var opt = document.createElement('option');
    opt.value = id;
    opt.label = STATE.styles[id];
    styles.appendChild(opt);
  });
  // set first style to value
  var styleId = document.getElementById('styleId');
  styleId.value = styleToken;
  // events
  styleId.addEventListener('click', evt => {
    styleId.value = '';
  });
  styleId.addEventListener('input', evt => {
    var style = styleId.value;
    if (style !== '') {
      var center = STATE.map_leaflet.getCenter();
      var zoom = STATE.map_leaflet.getZoom();
      createMaps(style, [center.lat, center.lng], zoom);
    }
  });
}
function setPlacesForm (styleToken, center) {
  // add all places to datalist
  var places = document.getElementById('places');
  Object.keys(STATE.places).map(id => {
    var opt = document.createElement('option');
    opt.value = STATE.places[id];
    opt.label = id;
    places.appendChild(opt);
  });
  // set first style to value
  var placeId = document.getElementById('placeId');
  var styleId = document.getElementById('styleId');
  placeId.value = center;
  // events
  placeId.addEventListener('click', evt => {
    placeId.value = '';
  });
  placeId.addEventListener('input', evt => {
    var place = placeId.value;
    var style = styleId.value;
    console.log(place.split(','));
    if (place !== '') {
      //var center = STATE.map_leaflet.getCenter();
      var zoom = STATE.map_leaflet.getZoom();
      createMaps(style, place.split(','), zoom);
    }
  });
}




var center = STATE.places.montBlanc;
var style = Object.keys(STATE.styles)[0];
createMaps(style, center, setForms);

// split view vertical/horizontal
var btn = document.getElementById('switchLayout');
var mapLayout = document.getElementById('mapLayout');
btn.addEventListener('click', toggleLayout);

function toggleLayout () {
  mapLayout.classList.toggle('Maps--h');
  var evt = document.createEvent('UIEvents');
  evt.initUIEvent('resize', true, false, window, 0);
  window.dispatchEvent(evt);
}
