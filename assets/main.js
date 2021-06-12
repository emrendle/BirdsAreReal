// DOM elements
const stateDropdown = document.getElementById('state-dropdwn');
const countyDropdown = document.getElementById('county-dropdwn');
const goButton = document.getElementById('go-btn');
// tiny slider options/controls
const slider = tns({
  container: '.my-slider',
  items: 1,
  slideBy: 'page',
  mouseDrag: 'mouseDrag',
  gutter: 80,
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

const states = [ 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY' ];

const generateCards = (locations) => {
  // here is where an image fetch would go whenever you find that API
  slider.destroy();

  locations.forEach(location => {
    const sliderEl = document.getElementById("js-slider");

    const cardWrapperEl = document.createElement("div");

    const cardContainerEl = document.createElement("div");
    cardContainerEl.setAttribute("class", "card");
    cardContainerEl.setAttribute("style", "width: 18rem;");
  
    const cardImgEl = document.createElement("img");
    cardImgEl.setAttribute("class","card-img-top");
  
    const cardBodyEl = document.createElement("div");
    cardBodyEl.setAttribute("class", "card-body");
  
    const cardTitleEl = document.createElement("h5");
    cardTitleEl.textContent = `${location.comName}`;
  
    const cardTextEl = document.createElement("p");
    cardTextEl.setAttribute("class", "card-text");
    cardTextEl.textContent = "Some quick example text to build on the card title and make up the bulk of the card's content.";
  
    const cardLinkEl = document.createElement("a");
    cardLinkEl.setAttribute("class", "btn btn-primary");
    cardLinkEl.textContent = "Go somewhere";
  
    cardBodyEl.appendChild(cardTitleEl);
    cardBodyEl.appendChild(cardTextEl);
    cardBodyEl.appendChild(cardLinkEl);
  
    cardContainerEl.append(cardImgEl);
    cardContainerEl.append(cardBodyEl);
  
    cardWrapperEl.appendChild(cardContainerEl)

    sliderEl.appendChild(cardWrapperEl);
  });

  slider.rebuild();

}

const initMap = (locations) => {
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

// takes in location code from above, returns recent sightings for that code (ie, for that IL county)
const getBirds = (locCode) => {
  let myHeaders = new Headers();
  myHeaders.append("X-eBirdApiToken", "6fh7ke4gee7v");

  let requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  fetch(`https://api.ebird.org/v2/data/obs/${locCode}/recent?maxResults=50`, requestOptions)
    .then(response => {
        return response.json();
    })
    .then(data => {
      // empty arrays for storing the desired info from ebird
      let locations = [];

      for (i = 0; i < data.length; i++) {
        let commonName = data[i].comName;
        let sciName = data[i].sciName;
        let locObj = { 
          lat: data[i].lat, 
          lng: data[i].lng, 
          comName: commonName,
          sciName: sciName,
          // can change this to be HTML formatted per the google maps api example
          info: `${commonName} (${sciName})`
        };
        locations.push(locObj);
      }
      // calling the map generation function with all the info gathered from ebird
      initMap(locations);

      generateCards(locations);

      })
    .catch(error => {
        console.error(error);
    });
}

// returns location codes (ie, county names/codes) for state (subnational2 is county)
const displayCounties = (stateChoice) => {
  // will remove previously generated county options if user selects a second state in one session
  document.getElementById('county-dropdwn').options.length = 1;

  let myHeaders = new Headers();
  myHeaders.append("X-eBirdApiToken", "6fh7ke4gee7v");

  let requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  fetch(`https://api.ebird.org/v2/ref/region/list/subnational2/US-${stateChoice}`, requestOptions)
    .then(response => {
        return response.json();
    })
    .then(data => {
      // populating county dropdown from state api query
      data.forEach(entry => {
        const newCounty = document.createElement('option');
        newCounty.setAttribute("class", "county-option")
        newCounty.textContent = entry.name;
        countyDropdown.appendChild(newCounty);
      });

      // adds event listener to go button
      goButton.addEventListener("click", function getCountyCode () {
        let userCountyChoice = countyDropdown.options[countyDropdown.selectedIndex].value
        // matches user selected county with county code from api data, calls getbirds with that code
        if (userCountyChoice === "Select a county") {
          alert("Please select a county.");
        }
        for (i = 0; i < data.length; i++) {
          if (userCountyChoice === data[i].name) {
            locCode = data[i].code;
          } 
        }

        getBirds(locCode);

      });
      })
    .catch(error => {
        console.error(error);
    });
}

// when user selects from dropdown this function is called by onchange event within HTML
const getUserInputState = () => {
  let userStateChoice = stateDropdown.options[stateDropdown.selectedIndex].value
  displayCounties(userStateChoice);
}

const init = () => {
  states.forEach(state => {
    const newState = document.createElement('option');
    newState.textContent = state;
    stateDropdown.appendChild(newState);
  });
}

init();