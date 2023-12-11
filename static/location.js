let lat = 0;
let lon = 0;
let zoomLevel = 15;
let map; // Leaflet map object loaded on initPosition()
let currentRegionPolygon; // A ser implementado: objeto que guarda polígono convexo com a área que o usuário já passou no mapa, para guardar locais já solicitados do servidor em um buffer interno
let materialsDict; // Dicionário onde <coordenadas>: <objeto "Material Reciclável">

async function initPosition(){
  
  // TODO: should ask for the user permition first
  materialsDict = {};
  let position = await getPosition();
  lat = position.coords.latitude;
  lon = position.coords.longitude;
  map = L.map('map').setView([lat, lon], zoomLevel);
  map.addLayer(
    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
    })
  );
  document.querySelectorAll(".leaflet-attribution-flag").forEach(elem => elem.remove()); // Tira a bandeirinha
  map.on("moveend", mapMoved);
}

function getPosition() {
  return new Promise((res, rej) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(res, rej, {enableHighAccuracy: true, timeout: 5000, maximumAge: 0});
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

function mapMoved(){
  zoomLevel = map.getZoom();
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

  console.log(`Top Left: ${pointA}, Bottom Right: ${pointB}, Zoom: ${zoomLevel}`);
  let newPointLat = Math.min(pointA.lat, pointB.lat) + Math.random() * Math.abs(pointB.lat - pointA.lat) ; 
  let newPointLng = Math.min(pointA.lng, pointB.lng) + Math.random() * Math.abs(pointB.lng - pointA.lng);
  console.log(`${newPointLat}`);
  console.log(`${newPointLng}`);
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
