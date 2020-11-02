var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: 'S&S PHCC'
}),
	esriWorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'S&S PHCC'
	}),
	hereMaps = L.tileLayer('https://1.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/512/png8?apiKey=k_aL4JuFPk5E_CXCfLGwOI1T_Fi-pP0YdmdIKzkHnJ8', {
		attribution: 'S&S PHCC',
		minZoom: 1,
		maxZoom: 19
	});


// Create a new Leaflet map centered on the continental US
var map = L.map("map", {
	zoomControl: false,
	layers: [esriWorldImagery]
});

var baseLayers = {
	"Here": hereMaps,
	"ESRI": esriWorldImagery,
	"OSM": osm
};

/// legend ////
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {

	var typesArraySecond = [];

	var div = L.DomUtil.create('div', 'info legend');
	var labels = [];

	$.getJSON('https://sheets.googleapis.com/v4/spreadsheets/1VP-uzrnMsYiYCoEnMtdxqnaJEjmS1tAF0fP4H6QeSnw/values/Sheet2!A2:F1000?majorDimension=ROWS&key=AIzaSyCJ67Rth2nDM0_0hkqDi219qDOtZrtC4gA', function (response) {
		response.values.forEach(getMarkerColor);
		function getMarkerColor(element) {
			if (!typesArraySecond.includes(element[3])) {
				typesArraySecond.push(element[3])
			}
		}
		for (var i = 0; i < typesArraySecond.length; i++) {
			labels.push(
				'<img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-' + typesArraySecond[i] + '.png"><b>' + typesArraySecond[i] + '</b>');
		}

		div.innerHTML = labels.join('<br>');
	});


	return div;
};

legend.addTo(map);
////////////

var datalayer;

L.control.layers(baseLayers).addTo(map);
// L.control.layers(baseLayers, overlayLayers).addTo(map);
////////////////

// add north arrow
var rose = L.control.rose('rose', { position: 'topright', icon: 'nautical', iSize: 'medium' });
rose.addTo(map)
////////////

// add scale
L.control.betterscale({ metric: true }).addTo(map);
//

// added initial zoom
var zoomHome = L.Control.zoomHome();
zoomHome.setHomeCoordinates([17.156244, 42.670087]);
zoomHome.setHomeZoom(14)
zoomHome.addTo(map);

var attribution = map.attributionControl;
attribution.setPrefix('S&S PHCC');


// here we declare an array just for the polygons from the Google Sheets table
var googleSheetsPolygonsArray = [];

// var googleSheetsAttributesNamesArray = [];
var googleSheetsAttributesArray = [];

// http request to Google Sheets API
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function () {
	if (xhttp.readyState == 4 && xhttp.status == 200) {
		googleSheetsData = JSON.parse(xhttp.responseText);

		// here we take all polygons from the Google Sheets table
		googleSheetsData["values"][1].forEach(element => {
			googleSheetsPolygonsArray.push(element);
		});

		// here we take all the names ot attribute data from the Google Sheets table
		googleSheetsData["values"].forEach(element => {
			googleSheetsAttributesArray.push(element);
		});

		(function addPolygons(googleSheetsData) {

			// The polygons are styled slightly differently on mouse hovers
			var poylygonStyle = { "color": "yellow", "weight": 1, fillOpacity: 0.6 };
			// var polygonHoverStyle = { "color": "#e6250b", "fillColor": "#969393", "weight": 3 };
			var polygonHoverStyle = { "color": "yellow", "weight": 3, fillOpacity: 0.8 };

			$.getJSON("data/saudi-arabia-polygons.geojson", function (data) {
				// add GeoJSON layer to the map once the file is loaded
				datalayer = L.geoJson(data, {
					style: function (feature) {
						// fill color
						var filledColor;
						for (var i = 1; i < googleSheetsAttributesArray[5].length; i++) {
							if (feature.properties.Name == googleSheetsAttributesArray[2][i]) {
								filledColor = googleSheetsAttributesArray[5][i];
							}
						}
						/////////////

						// transparency color
						var transparency;
						for (var i = 1; i < googleSheetsAttributesArray[6].length; i++) {
							if (feature.properties.Name == googleSheetsAttributesArray[2][i]) {
								transparency = googleSheetsAttributesArray[6][i];
							}
						}
						//////////////

						// border color
						var borderColor;
						for (var i = 1; i < googleSheetsAttributesArray[7].length; i++) {
							if (feature.properties.Name == googleSheetsAttributesArray[2][i]) {
								borderColor = googleSheetsAttributesArray[7][i];
							}
						}
						//////////////
						return {
							fillColor: filledColor,
							color: borderColor,
							weight: 1,
							fillOpacity: transparency
						}
					},
					onEachFeature: function (feature, layer) {
						layer.on({
							mouseout: function (e) {
								// fill color
								var filledColorOne;
								for (var i = 1; i < googleSheetsAttributesArray[5].length; i++) {
									if (feature.properties.Name == googleSheetsAttributesArray[2][i]) {
										filledColorOne = googleSheetsAttributesArray[5][i];
									}
								}
								poylygonStyle.fillColor = filledColorOne;
								/////////////

								// transparency color
								var transparencyOne;
								for (var i = 1; i < googleSheetsAttributesArray[6].length; i++) {
									if (feature.properties.Name == googleSheetsAttributesArray[2][i]) {
										transparencyOne = googleSheetsAttributesArray[6][i];
									}
								}
								poylygonStyle.fillOpacity = transparencyOne;
								//////////////

								// border color
								var borderColorOne;
								for (var i = 1; i < googleSheetsAttributesArray[7].length; i++) {
									if (feature.properties.Name == googleSheetsAttributesArray[2][i]) {
										borderColorOne = googleSheetsAttributesArray[7][i];
									}
								}
								poylygonStyle.color = borderColorOne;
								//////////////

								e.target.setStyle(poylygonStyle);
							},
							mouseover: function (e) {
								// fill color
								var filledColorTwo;
								for (var i = 1; i < googleSheetsAttributesArray[8].length; i++) {
									if (feature.properties.Name == googleSheetsAttributesArray[2][i]) {
										filledColorTwo = googleSheetsAttributesArray[8][i];
									}
								}
								polygonHoverStyle.fillColor = filledColorTwo;
								/////////////

								// transparency color
								var transparencyTwo;
								for (var i = 1; i < googleSheetsAttributesArray[9].length; i++) {
									if (feature.properties.Name == googleSheetsAttributesArray[2][i]) {
										transparencyTwo = googleSheetsAttributesArray[9][i];
									}
								}
								polygonHoverStyle.fillOpacity = transparencyTwo;
								//////////////

								// border color
								var borderColorTwo;
								for (var i = 1; i < googleSheetsAttributesArray[10].length; i++) {
									if (feature.properties.Name == googleSheetsAttributesArray[2][i]) {
										borderColorTwo = googleSheetsAttributesArray[10][i];
									}
								}
								polygonHoverStyle.color = borderColorTwo;
								//////////////

								e.target.setStyle(polygonHoverStyle);
							},
							click: function (e) {
								// This zooms the map to the clicked polygon
								map.fitBounds(e.target.getBounds());

								var currentNameDataIndex;
								for (var i = 0; i < googleSheetsPolygonsArray.length; i++) {
									if (googleSheetsPolygonsArray[i] == feature.properties["Name"]) {
										currentNameDataIndex = i;
									}
								}

								var popupContent = "<b><u>" + feature.properties["Name"] + "</u></b>";

								for (i = 3; i < googleSheetsAttributesArray.length; i++) {
									if (googleSheetsAttributesArray[i][currentNameDataIndex]) {
										popupContent += "</br>" + "<b><i>" + googleSheetsAttributesArray[i][0] + "</i></b>" + ":" + googleSheetsAttributesArray[i][currentNameDataIndex];
									}
								}

								layer.bindPopup(popupContent).openPopup();
							}
						});
					}
				}).addTo(map);
				map.fitBounds(datalayer.getBounds());
			});
		})();
	}
};

xhttp.open("GET", "https://sheets.googleapis.com/v4/spreadsheets/1VP-uzrnMsYiYCoEnMtdxqnaJEjmS1tAF0fP4H6QeSnw/values/Sheet1?majorDimension=ROWS&key=AIzaSyCJ67Rth2nDM0_0hkqDi219qDOtZrtC4gA", true);



xhttp.send()

// loading points from GoogleSheets
var point;

var typesArray = [];

var lyrMarkerCluster = L.markerClusterGroup({ showCoverageOnHover: false }).addTo(map);

function drawPoints() {
	$.getJSON('https://sheets.googleapis.com/v4/spreadsheets/1VP-uzrnMsYiYCoEnMtdxqnaJEjmS1tAF0fP4H6QeSnw/values/Sheet2!A2:I1000?majorDimension=ROWS&key=AIzaSyCJ67Rth2nDM0_0hkqDi219qDOtZrtC4gA', function (response) {
		lyrMarkerCluster.clearLayers();
		response.values.forEach(drawMarker);

		function drawMarker(element) {
			var pointNumber = element[0];
			var description = element[1];
			var lastVisit = element[2];
			var type = element[3];
			var geoStamp = element[4];
			var latitude = element[5].split(",")[0];
			var longitude = element[5].split(",")[1];
			var geoAddress = element[6];


			if (!typesArray.includes(type)) {
				typesArray.push(type)
			}

			var markerIcon = new L.Icon({
				iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-' + type + '.png',
				shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
				iconSize: [25, 41],
				iconAnchor: [12, 41],
				popupAnchor: [1, -34],
				shadowSize: [41, 41]
			});

			point = L.marker([latitude, longitude], { icon: markerIcon }).bindPopup("<b>Point Number: </b>" + pointNumber + "<br>" + "<b>Description: </b>" + description + "<br>" + "<b>Last Visit: </b>" + lastVisit + "<br>"  + "<b>Geo Stamp: </b>" + geoStamp + "<br>" + "<b>Geo Address: </b>" + geoAddress + "<br>");
			point.setLatLng([latitude, longitude]).update();
			lyrMarkerCluster.addLayer(point);

			return typesArray;



		}
	});
}

drawPoints();
/////////////////

// toggle button//
var ctlEasybutton;
var controls = $(".leaflet-control");
var detailsContainer = $("#detailsContainer");
var titleContainer = $("#titleContainer");

ctlEasybutton = L.easyButton('fa-exchange', function () {
	controls.toggle();
	detailsContainer.toggle();
	titleContainer.toggle();
}).addTo(map);
//fa-exchange
// end toggle button//

// second toggle button//
var secondCtlEasybutton = L.easyButton('fa-map', function () {
	controls.toggle();
	detailsContainer.toggle();
	titleContainer.toggle();

	if (!map.hasLayer(datalayer)) {
		map.addLayer(datalayer)
	} else {
		map.removeLayer(datalayer)
	}

	if (!map.hasLayer(lyrMarkerCluster)) {
		map.addLayer(lyrMarkerCluster)
	} else {
		map.removeLayer(lyrMarkerCluster)
	}
}).addTo(map)
///end second toggle button/////
