let lat = 0;
let lon = 0;
let defaultZoomLevel = 15;
let map; // Leaflet map object loaded on initPosition()
let currentRegionPolygon; // A ser implementado: objeto que guarda polígono convexo com a área que o usuário já passou no mapa, para guardar locais já solicitados do servidor em um buffer interno
let materialsDict; // Dicionário onde <coordenadas>: <objeto "Material Reciclável">
let boundToLocation = false;

async function initPosition(){
  
  // TODO: should ask for the user permition first
  materialsDict = {};
  let position = await getPosition();
  lat = position.coords.latitude;
  lon = position.coords.longitude;
  map = L.map('map', {center: [lat, lon], zoom: defaultZoomLevel, zoomControl:false});
  map.addLayer(
    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
    })
  );
  document.querySelectorAll(".leaflet-attribution-flag").forEach(elem => elem.remove()); // Tira a bandeirinha
  map.on("moveend", moveEnd);
  map.on("locationfound", locationFound)

  L.Control.CustomZoom = L.Control.Zoom.extend({

    _recenter: function (e) {
      this._map.locate({setView: true, enableHighAccuracy: true, maxZoom: defaultZoomLevel});
    },

    options: {
      position: 'bottomleft',

      // @option zoomInText: String = '<span aria-hidden="true">+</span>'
      // The text set on the 'zoom in' button.
      zoomInText: '<span aria-hidden="true">+</span>',

      // @option zoomInTitle: String = 'Zoom in'
      // The title set on the 'zoom in' button.
      zoomInTitle: 'Zoom in',

      // @option zoomOutText: String = '<span aria-hidden="true">&#x2212;</span>'
      // The text set on the 'zoom out' button.
      zoomOutText: '<span aria-hidden="true">&#x2212;</span>',

      // @option zoomOutTitle: String = 'Zoom out'
      // The title set on the 'zoom out' button.
      zoomOutTitle: 'Zoom out',

      // @option zoomOutText: String = '<span aria-hidden="true">&#x2212;</span>'
      // The text set on the 'zoom out' button.
      recenterText: '<img src="static/target.svg" style="max-height:70%; line-height: 0px;">',

      // @option zoomOutTitle: String = 'Zoom out'
      // The title set on the 'zoom out' button.
      recenterTitle: 'Recenter'
    },

    onAdd: function (map) {
      let zoomName = 'leaflet-control-zoom';
      let options = this.options;
      let container;

      // The next arrow function was copied from leaflet-src.js (version 1.9.4) function <create$1>
      // I don't have any clue why this works lol
      container = ((tagName, className, container) => {
        let el = document.createElement(tagName);
        el.className = className || '';

        if (container) {
          container.appendChild(el);
        }
        return el;
      
      })('div', zoomName + ' leaflet-bar');

      this._zoomInButton  = this._createButton(options.zoomInText, options.zoomInTitle,
              zoomName + '-in',  container, this._zoomIn);
      this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
              zoomName + '-out', container, this._zoomOut);
      this._recenterButton = this._createButton(options.recenterText, options.recenterTitle,
              zoomName + '-recenter', container, this._recenter);

      this._updateDisabled();
      map.on('zoomend zoomlevelschange', this._updateDisabled, this);

      return container;
    }
  });
  L.control.customZoom = function(opts){
    return new L.Control.CustomZoom(opts);
  }
  L.control.customZoom().addTo(map);
  
}

function getPosition() {
  return new Promise((res, rej) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(res, rej, {enableHighAccuracy: true, timeout: 10_000, maximumAge: 0});
    } else {
      showError("Your browser does not support Geolocation!");
    }
  });
}

function res(pos) {
  // SUCCESS
}

function rej(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

function locationFound(){
  boundToLocation = true;
}

function moveEnd(){
  
  zoomLevel = map.getZoom();
  boundToLocation = false;
  if (zoomLevel >= 12){
    for (marker in materialsDict){
      materialsDict[marker].remove();
      delete materialsDict[marker]; 
    }
    for (let i = 0; i<5; i++){
      simulate_material_point(map.unproject(map.getPixelBounds().getTopLeft()), map.unproject(map.getPixelBounds().getBottomRight()), i+1);
    }
  } else {

  } 
  //console.log(`Top Left: ${map.unproject(map.getPixelBounds().getTopLeft())}, Bottom Right: ${map.unproject(map.getPixelBounds().getBottomRight())}, Zoom: ${zoomLevel}`);
}

function simulate_material_point(pointA, pointB, reciclableIndex){
  let reciclableObj;
  let newPointLat = Math.min(pointA.lat, pointB.lat) + Math.random() * Math.abs(pointB.lat - pointA.lat) ; 
  let newPointLng = Math.min(pointA.lng, pointB.lng) + Math.random() * Math.abs(pointB.lng - pointA.lng);
  let newLatLng = L.latLng(newPointLat, newPointLng);
  materialsDict[newLatLng] = L.marker(newLatLng);
  materialsDict[newLatLng].addTo(map);
    fetch('/static/materialsTest.json')
    .then(response => {
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }

        return response.json();
    })
    .then(json => {
      reciclableObj = json.materialList[reciclableIndex]; // do something
      materialsDict[newLatLng].bindPopup(JSON.stringify(reciclableObj));
    })
    .catch(console.error);
}
