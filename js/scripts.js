// Mapa Leaflet
var mapa = L.map('mapid').setView([9.74, -84.23], 11.5);


// Definición de capas base
var capa_cartoDB_darkMatter = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', 
    {
	  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	  subdomains: 'abcd',
	  maxZoom: 19
    }
).addTo(mapa);

var capa_osm = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?', 
  {
    maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
).addTo(mapa);	

var Stamen_Terrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 18,
	ext: 'png'
});


// Conjunto de capas base
var capas_base = {
  "Base Oscura": capa_cartoDB_darkMatter,
  "OSM": capa_osm,  
  "Relieve": Stamen_Terrain
};	    


// Control de capas
control_capas = L.control.layers(capas_base).addTo(mapa);	

// Control de escala
L.control.scale().addTo(mapa);

// Capa raster
var capa_pendientes = L.imageOverlay("https://raw.githubusercontent.com/Andre9424/Tarea-3/main/Pendientes/pendirecWGS84.png", 
	[[9.6223412691860801, -84.3418993877406109], 
	[9.8616843904909679, -84.1319159426894743]], 
	
).addTo(mapa);
control_capas.addOverlay(capa_pendientes, 'Pendientes');

function updateOpacity() {
	document.getElementById("span-opacity").innerHTML = document.getElementById("sld-opacity").value;
	capa_pendientes.setOpacity(document.getElementById("sld-opacity").value);
}
	    
// Capa vectorial de redvial en formato GeoJSON
$.getJSON("https://Andre9424.github.io/Tarea-2-Visor-Web/redvial/redvial.geojson", function(geodata) {
var capa_redv = L.geoJson(geodata, {
    style: function(feature) {
	  return {'color': "#ff0000", 'weight': 2.0, 'fillOpacity': 0.0}
    },
    onEachFeature: function(feature, layer) {
      var popupText = "<strong>Código de la vía</strong>: " + feature.properties.Código + "<br>" + "<strong>Longitud</strong>: " + feature.properties.LONGITUD;
      layer.bindPopup(popupText);
    }			
  }).addTo(mapa);

  control_capas.addOverlay(capa_redv, 'Red Vial');
});

// Capa vectorial de presentaciones en formato GeoJSON
$.getJSON("https://Andre9424.github.io/Tarea-2-Visor-Web/presactivas/presactivas.geojson", function(geodata) {
var capa_activ = L.geoJson(geodata, {
    style: function(feature) {
	  return {'color': "#00F79E", 'weight': 1.5, 'fillOpacity': 0.5}
    },
    onEachFeature: function(feature, layer) {
      var popupText = "<strong>Fecha de ingreso</strong>: " + feature.properties.Fecha_pres + "<br>" + "<strong>Finca</strong>: " + feature.properties.Finca + "<br>" + "<strong>Número de presentación</strong>: " + feature.properties.N_pres + "<br>" + "<strong>Número de Trámite</strong>: " + feature.properties.N_TRAMITE;
      layer.bindPopup(popupText);
    }			
  }).addTo(mapa);

  control_capas.addOverlay(capa_activ, 'Trámites de visado');
});


// Capa vectorial de canton en formato GeoJSON
$.getJSON("https://Andre9424.github.io/Tarea-2-Visor-Web/canton/canton.geojson", function(geodata) {
  var capa_canton = L.geoJson(geodata, {
    style: function(feature) {
	  return {'color': "#F3FF33", 'weight': 2.0, 'fillOpacity': 0.0}
    }}).addTo(mapa);

  control_capas.addOverlay(capa_canton, 'Cantón');
});	

// Capa de coropletas del valor fiscal por zonas homogeneas
$.getJSON('https://raw.githubusercontent.com/Andre9424/Tarea-3/main/Zonas%20Homogeneas/zhacosta.geojson', function (geojson) {
  var zh_coropletas = L.choropleth(geojson, {
	  valueProperty: 'VALOR',
	  scale: ['yellow', 'blue'],
	  steps: 7,
	  mode: 'q',
	  style: {
	    color: '#fff',
	    weight: 2,
	    fillOpacity: 0.65
	  },
	  onEachFeature: function (feature, layer) {
	    layer.bindPopup('Cantón: ' + feature.properties.CODIGO_CAN + '<br>' + 'Distrito: ' + feature.properties.CODIGO_DIS + '<br>' + 'Nombre de la zona: ' + feature.properties.NOMBRE_ZON + '<br>'+'Valor fiscal: ' + feature.properties.VALOR + ' colones'+ '<br>'+ 'Tipo de Zona: ' + feature.properties.Categoriza)
	  }
  }).addTo(mapa);
  control_capas.addOverlay(zh_coropletas, 'Valor fiscal por zonas homogeneas');	

  // Leyenda de la capa de coropletas
  var leyenda = L.control({ position: 'bottomright' })
  leyenda.onAdd = function (mapa) {
    var div = L.DomUtil.create('div', 'info legend')
    var limits = zh_coropletas.options.limits
    var colors = zh_coropletas.options.colors
    var labels = []

    // Add min & max
    div.innerHTML = '<div class="labels"><div class="min">' + limits[0] + '</div> \
			<div class="max">' + limits[limits.length - 1] + '</div></div>'

    limits.forEach(function (limit, index) {
      labels.push('<li style="background-color: ' + colors[index] + '"></li>')
    })

    div.innerHTML += '<ul>' + labels.join('') + '</ul>'
    return div
  }
  leyenda.addTo(mapa)
});

// Agregar capa WMS
var capa_RN = L.tileLayer.wms('https://geos.snitcr.go.cr/be/IGN_25/wms?', {
  layers: 'ec140101_25k',
  format: 'image/png',
  transparent: true
}).addTo(mapa);

// Se agrega al control de capas como de tipo "overlay"
control_capas.addOverlay(capa_RN, 'Construcciones');

// Ícono personalizado para nacientes
const iconoNaciente = L.divIcon({
  html: '<i class="fas fa-hand-holding-water fa-2x"></i>',
  className: 'estiloIconos'
});

// Capa vectorial de registros agrupados de nacientes
$.getJSON("https://andre9424.github.io/Tarea-4/Nacientes/NacientesWGS84.geojson", function(geodata) {
  // Registros individuales
  var capa_nacientes = L.geoJson(geodata, {
    style: function(feature) {
	  return {'color': "#00ECF7", 'weight': 3}
    },
    onEachFeature: function(feature, layer) {
      var popupText = "<strong>Descripción</strong>: " + feature.properties.Decripcion + "<br>" + 
                      "<strong>Radio</strong>: " + feature.properties.Radio;
      layer.bindPopup(popupText);
    },
    pointToLayer: function(getJsonPoint, latlng) {
        return L.marker(latlng, {icon: iconoNaciente});
    }
  });
  
    // Capa de calor (heatmap) 
	coordenadas = geodata.features.map(feat => feat.geometry.coordinates.reverse());
	var capa_nacientes_calor = L.heatLayer(coordenadas, {radius: 30, blur: 1});

  // Capa de puntos agrupados
  var capa_nacientes_agrupados = L.markerClusterGroup({showCoverageOnHover: false, spiderfyOnMaxZoom: true});
  capa_nacientes_agrupados.addLayer(capa_nacientes);

  // Se añade la capa al mapa y al control de capas
	capa_nacientes_calor.addTo(mapa); 
	capa_nacientes_agrupados.addTo(mapa);
	
	control_capas.addOverlay(capa_nacientes_calor, 'Mapa de calor'); 
	control_capas.addOverlay(capa_nacientes_agrupados, 'Registros agrupados de nacientes');
	control_capas.addOverlay(capa_nacientes, 'Registros individuales de nacientes');
});
