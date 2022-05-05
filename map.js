const countriesURL = "./assets/countries.js"; // GeoJSON of the Globe
const airportsURL = "./assets/airports.js"; // Airports Data Set

// Import Data sets countries and airports
$.when(
  $.getScript(countriesURL),
  $.getScript(airportsURL),
  $.Deferred(function (deferred) {
    $(deferred.resolve);
  })
).done(function () {
  /**
   * My Data Map with Leaflet
   */
  const map = L.map("map").setView([45, 0], 2);
  let geoJson;

  /* Get airport counts per country */
  let airportCount = {};

  for (let i = 0; i < airports.length; i++) {
    const curAirport = airports[i].Country;
    if (!airportCount.hasOwnProperty(curAirport)) {
      airportCount[curAirport] = 1;
    } else {
      airportCount[curAirport]++;
    }
  }

  /**
   * Return the color to fill a region with based on weight
   * @param {int} weight - weight to determine color
   */
  function getColor(weight) {
    return weight > 1000
      ? "#08306b"
      : weight > 500
      ? "#08519c"
      : weight > 200
      ? "#2171b5"
      : weight > 100
      ? "#4292c6"
      : weight > 50
      ? "#6baed6"
      : weight > 20
      ? "#9ecae1"
      : weight > 10
      ? "#c6dbef"
      : "#deebf7";
  }

  /**
   * Map Style
   * @param {*} feature - region from GeoJSON
   */
  function style(feature) {
    return {
      fillColor: getColor(airportCount[feature.properties.name]),
      weight: 2,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.7,
    };
  }

  /**
   * Apply Event Listeners to Map Layers
   */
  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
    });
  }

  /**
   * Mouse-In Event
   * @param {*} e - event
   */
  function highlightFeature(e) {
    let layer = e.target;

    layer.setStyle({
      weight: 5,
      color: "#666",
      dashArray: "",
      fillOpacity: 0.7,
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }

    info.update(layer.feature.properties);
  }

  /**
   * Mouse-Out Event
   * @param {*} e - event
   */
  function resetHighlight(e) {
    geoJson.resetStyle(e.target);
    info.update();
  }

  // Information Bubble
  const info = L.control();

  // create a div with a class "info"
  info.onAdd = function (map) {
    this._div = L.DomUtil.create("div", "info");
    this.update();
    return this._div;
  };

  // method that we will use to update the control based on feature properties passed
  info.update = function (props) {
    this._div.innerHTML = props
      ? "<b>" +
        props.name +
        "</b><br />" +
        airportCount[props.name] +
        " airports"
      : "Hover over a country for more information";
  };

  // Map Legend
  const legend = L.control({ position: "bottomright" });

  legend.onAdd = function (map) {
    let div = L.DomUtil.create("div", "info legend"),
      grades = [0, 10, 20, 50, 100, 200, 500, 1000],
      labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (let i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' +
        getColor(grades[i] + 1) +
        '"></i> ' +
        grades[i] +
        (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }

    return div;
  };

  // Init Map
  L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox/light-v11",
      tileSize: 512,
      zoomOffset: -1,
      accessToken:
        "pk.eyJ1IjoiaGNzaGlyZXMiLCJhIjoiY2wycWx4c3ZuMDB4aTNqbDd6MGMzMWdkMSJ9.XBV2-35xRf4THAvlcFMOcQ",
    }
  ).addTo(map);

  // Apply UI elements
  info.addTo(map);
  legend.addTo(map);

  // Apply map data
  geoJson = L.geoJson(globeData, {
    style: style,
    onEachFeature: onEachFeature,
  }).addTo(map);
});
