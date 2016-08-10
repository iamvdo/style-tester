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
    var el = document.getElementById(id);
    if (!el.classList.contains('Map--0')) {
      var style = styleLeaflet();
      var map_leaflet = L.map(id, style.opts);
      L.tileLayer(style.url, style.tilelayer).addTo(map_leaflet);
      return map_leaflet;
    } else {
      return {getContainer: el => el};
    }
  }
  function createMapboxGLMap (id) {
    var el = document.getElementById(id);
    if (!el.classList.contains('Map--0')) {
      var style = styleMapboxGL(id);
      mapboxgl.accessToken = STATE.accessToken;
      return new mapboxgl.Map(style);
    } else {
      return {getContainer: _ => el};
    }
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
        maxZoom: STATE.maxZoom,
        attributionControl: false
      }
    };
  };
  function styleMapboxGL (id) {
    return {
      container: id,
      style: 'mapbox://styles/iamvdo/' + styleToken,
      center: centerR,
      zoom: zoom - 1,
      maxZoom: STATE.maxZoom - 1,
      attributionControl : false
    }
  }
  function syncMaps (map_leaflet, map_mapboxgl) {

    off(); on();
    function on() {
      map_leaflet.on('move', leaflet2gl);
      map_mapboxgl.on('move', gl2leaflet);
    }
    function off() {
      map_leaflet.off('move', leaflet2gl);
      map_mapboxgl.off('move', gl2leaflet);
    }
    function leaflet2gl() {
      off();
      copyPosition('leaflet', map_leaflet, map_mapboxgl);
      on();
    }
    function gl2leaflet() {
      off();
      copyPosition('mapboxgl', map_mapboxgl, map_leaflet);
      on();
    }
  }
  function copyPosition(type, a, b) {
      var center = a.getCenter();
      var zoom = Math.round(a.getZoom());
      if (type === 'leaflet') {
        b.jumpTo({
          center: center,
          zoom: zoom - 1,
          bearing: 0,
          pitch: 0
        });
      } else {
        b.setView(center, zoom + 1, {animate: false});
      }
    }

  // create Leaflet map
  if (STATE.map_leaflet) {
    STATE.map_leaflet.remove();
  }
  if (STATE.map_mapboxgl) {
    STATE.map_mapboxgl.remove();
  }
  // store maps
  STATE.map_leaflet = createLeafletMap('map--leaflet');
  STATE.map_mapboxgl = createMapboxGLMap('map--mapboxgl');

  STATE.actualStyle = styleToken;

  // sync leaflet map with mapboxgl one
  syncMaps(STATE.map_leaflet, STATE.map_mapboxgl);

  if (setForms) {
    setForms(styleToken, center)
  }

}

function setForms (styleToken, centerKey) {
  setStylesForm();
  setPlacesForm(styleToken, centerKey);
}

function setStylesForm () {
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
  styleId.value = STATE.actualStyle;
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
var btn = document.getElementById('toggleLayout');
var mapLayout = document.getElementById('mapLayout');
btn.addEventListener('click', toggleLayout);

function toggleLayout () {
  mapLayout.classList.toggle('Maps--h');
  redrawMaps();
}

function redrawMaps () {
  var evt = document.createEvent('UIEvents');
  evt.initUIEvent('resize', true, false, window, 0);
  window.dispatchEvent(evt);
}

var toggles = document.getElementById('toggles');
toggles.addEventListener('click', toggleMap);

function toggleMap (evt) {
  var btn = evt.target;
  if (btn.id === 'toggleLayout') {
    return
  }
  var btns = btn.parentNode.children;
  for (var i = 0; i < btns.length; i++) {
    if (btns[i] !== btn && btns[i].classList.contains('off')) {
      return
    }
  }
  btn.classList.toggle('off');
  if (btn.classList.contains('off')) {
    btn.innerHTML = btn.innerHTML.replace('Hide', 'Show');
  } else {
    btn.innerHTML = btn.innerHTML.replace('Show', 'Hide');
  }
  var btn_map = STATE[btn.dataset.map];
  var btn_map2 = STATE[btn.dataset.map2];
  var el = btn_map.getContainer();
  el.classList.toggle('Map--0');
  if (!el.classList.contains('Map--0')) {
    var center = btn_map2.getCenter();
    var zoom = btn_map2.getZoom();
    if (btn.dataset.map === 'map_mapboxgl') {
      zoom = Math.round(zoom + 1);
    }
    createMaps(STATE.actualStyle, [center.lat, center.lng], zoom);
  } else {
    btn_map.remove();
  }
  redrawMaps();
}