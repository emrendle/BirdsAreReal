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
        let code = data[15].code;
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

  fetch(`https://api.ebird.org/v2/data/obs/${locCode}/recent?maxResults=5`, requestOptions)
    .then(response => {
        return response.json();
    })
    .then(data => {
      let lat = data[0].lat;
      let lng = data[0].lng;

      initMap(lat, lng);

      })
    .catch(error => {
        console.error(error);
    });
}

// Initialize and add the map
function initMap(lat, lng) {
  // The location of bird sighting
  const bird = { lat: lat, lng: lng };
  // The map, centered at bird sighting
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 8,
    center: bird,
  });
  // The marker, positioned at bird sighting
  const marker = new google.maps.Marker({
    position: bird,
    map: map,
  });
}

getLocCodes();