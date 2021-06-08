// tiny slider options/controls
let slider = tns({
  container: '.my-slider',
  items: 1,
  slideBy: 'page',
  mouseDrag: 'mouseDrag',
  gutter: 60,
  edgePadding: 10,
  nav: false,
  autoplay: false,
  // autoplayButton: '.auto',
  // autoplayText: ['Start', 'Stop'],
  controlsContainer: '#controls',
  prevButton: '.previous',
  nextButton: '.next',
  responsive: {
      800: {
        items: 2
      },
      1000: {
        items: 3
      }
    }
});

// returns location codes (ie, county names/codes) for Illinois (subnational2 is)
const getLocCodes = () => {
  let myHeaders = new Headers();
  myHeaders.append("X-eBirdApiToken", "6fh7ke4gee7v");

  let requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  fetch("https://api.ebird.org/v2/ref/region/list/subnational2/US-IL", requestOptions)
    .then(response => {
        return response.json();
    })
    .then(data => {
      // need to add a dropdown option in HTML for the IL county, then search the data for a match and call getBirds with that location code
      // hard coded w/ cook county for now
        let code = data[5].code;
        getBirds(code);
      })
    .catch(error => {
        console.error(error);
    });
}

// takes in location code from above, returns recent sightings for that code (ie, for that IL county)
const getBirds = (locCode) => {
  let myHeaders = new Headers();
  myHeaders.append("X-eBirdApiToken", "6fh7ke4gee7v");

  let requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  fetch(`https://api.ebird.org/v2/data/obs/${locCode}/recent?maxResults=100`, requestOptions)
    .then(response => {
        return response.json();
    })
    .then(data => {
      // empty arrays for storing the desired info from ebird
      let locations = [];

      // consider destructuring your object here like this?
      // const { name, role, age, forcePoints } = data;

      for (i = 0; i < data.length; i++) {
        let dataLat = data[i].lat;
        let dataLng = data[i].lng
        let commonName = data[i].comName;
        let sciName = data[i].sciName;

        let locObj = { 
          lat: dataLat, 
          lng: dataLng, 
          // can change this to be HTML formatted per the google maps api example
          info: `Spotted at this location: ${commonName} (${sciName}).`
        };

        locations.push(locObj);
      }

      // calling the map generation function with all the info gathered from ebird
      initMap(locations);
      })
    .catch(error => {
        console.error(error);
    });
}

function initMap(locations) {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
    center: locations[0],
  });
  const iw = new google.maps.InfoWindow();
  const oms = new OverlappingMarkerSpiderfier(map, {
    markersWontMove: true,
    markersWontHide: true,
    basicFormatEvents: true
  });

  for (i = 0; i < locations.length; i ++) {
    (function() {  // make a closure over the marker and marker data
      var markerData = locations[i];  // e.g. { lat: 50.123, lng: 0.123, text: 'XYZ' }
      var marker = new google.maps.Marker({ position: markerData });  // markerData works here as a LatLngLiteral
      google.maps.event.addListener(marker, 'spider_click', function(e) {  // 'spider_click', not plain 'click'
        iw.setContent(markerData.info);
        iw.open(map, marker);
      });
      oms.addMarker(marker);  // adds the marker to the spiderfier _and_ the map
    })();
  }
}

// getLocCodes();