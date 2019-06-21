(function () {
  
  /** GLOBAL VARIABLES - STARTS */

  /* globals google */
  /* globals snazzyMapStyle */
  
  // Move these to .env files before production
  const ipAddressApiUrl = 'https://bmh54xvwva.execute-api.us-east-1.amazonaws.com/dev/getIpInfo';
  const GoogleMapsApiKey = 'AIzaSyDU8bDnzS0dg75w8H6Y6j_y7ssaoEJDvLA';
  
  // Animation controls (in milliseconds)
  const initialMapRevealDelay = 2000;
  const gridDominoesAnimDelay = 0.075;
  const domionesFallRate = 100;
  const dominoAnimationRandomness = 100;
  
  const plusAnimationRandomness = 500;
  const plusFlickerAnimationDuration = 400;
  const initialPlusRevealDelay = 1000;
  
  const mapRevealAnimationWaitingTime = 3000;
  
  const gridCell = [];

  /** GLOBAL VARIABLES - ENDS */


  /** GENERIC HELPER FUNCTIONS - STARTS */
  
  const random = (min,max) => Math.floor(Math.random() * (max - min) + min); // random number generator
  
  function eleID (id) { return document.getElementById(id) }
  
  const httpGetAsync = (theUrl, callback) => {
    console.log(theUrl);
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        console.log(xmlHttp);
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
          if(xmlHttp.response)
            callback({response: JSON.parse(xmlHttp.responseText), status: 'success'});
          else
            callback({status: 'error'});
        }
            
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
  }

  /** GENERIC HELPER FUNCTIONS - ENDS */

  // Flicker Animation for given DOM element
  const flicker = (domElement, duration, delay) => {
    duration = duration ? duration: 250;
    delay = delay ? delay: 0;
    domElement.style.animation = "flicker";
    domElement.style.animationDuration = duration+"ms";
    domElement.style.animationDelay = delay+"ms";
    domElement.style.animationIterationCount = "1";
    domElement.style.animationFillMode = "forwards";
  }

  // setFullScreenHeight for the web app. NO more scrolling.
  const setFullScreenHeight = () => {
      const { clientHeight } = window.document.documentElement;
      eleID("fullScreenContainer").style.height = `${clientHeight}px`;
      // console.log(`Client Hieght: ${clientHeight}`);
  }
  
  // Render Google map on given DOM element
  const initializeMap = (mapDomElementID, Latitude, Longitude, city, country) => {
  // For more options see: https://developers.google.com/maps/documentation/javascript/reference#MapOptions
    const mapOptions = {
      zoom: 14,
      center: new google.maps.LatLng(Latitude, Longitude),
      styles: snazzyMapStyle,
      disableDefaultUI: true,
      disableDoubleClickZoom: true,
      draggable: false,
      draggableCursor: false,
      draggingCursor: false,
      clickableIcons: false,
    };
    const map = new google.maps.Map(eleID(mapDomElementID), mapOptions);
    google.maps.event.addListenerOnce(map, 'tilesloaded', function(){
      //console.log('Map loaded, now reveal map');
      revealMap(city, country);
    });
  }
  
  const displayAboutUs = () => {
    flicker(eleID("AboutUs"), 350, mapRevealAnimationWaitingTime + 800);
  }
  
  const displayIP = (ipAddress) => {
    eleID("caption").innerHTML = "YOUR IP ADDRESS";
    eleID("ipAddress").innerHTML = ipAddress;
    
    flicker(eleID("caption"));
    flicker(eleID("ipAddress"));
    setTimeout(()=>{flicker(eleID("copyButton"))}, 1000);
  }
  
  const displayLocation = (city, country) => {
    if(city && country && city.length + country.length <20)
    {
      eleID("locationContainer").innerHTML = city+ " // "+ country;
      flicker(eleID("locationContainer"),350, mapRevealAnimationWaitingTime);
    }
    displayAboutUs();
  }

  // Display IP address and map location
  const renderAPIresult = (ApiResponse) => {
    console.log("API response:");
    console.log(ApiResponse);
    if(ApiResponse.response && ApiResponse.status === 'success') // API response is 200
    {
      const response = ApiResponse.response;
      console.log(response);
      const {
        geobytesipaddress,
        geobytescountry,
        geobytescity,
        geobyteslatitude,
        geobyteslongitude
      } = response;
      // show IP
      displayIP(geobytesipaddress);
      // Render Google map's location based on the API response 
      initializeMap(
        "map",
        parseFloat(geobyteslatitude),
        parseFloat(geobyteslongitude),
        geobytescity,
        geobytescountry
      );
    }
    else{
      eleID("caption").className = "captionError";
      eleID("caption").innerHTML = "ERROR";
      eleID("ipAddressOverlayContainer").style.backgroundColor= "rgba(46, 0, 0, 0.49)";
    }
    
  }
  
  const drawGrid = (gridContainerDomID) => {
    const container = eleID(gridContainerDomID);
    for(let i=0;i<150;i++)
    {
      const cell = document.createElement('div');
      cell.className += "gridCell";
      const plus = document.createElement('span');
      plus.innerHTML = "+";
      plus.className = "plusSymbol";
      plus.style.animation = "flicker";
      plus.style.animationDuration = plusFlickerAnimationDuration+"ms";
      plus.style.animationDelay = initialPlusRevealDelay + random(0,plusAnimationRandomness)+"ms";
      plus.style.animationFillMode = "forwards";
      cell.appendChild(plus);
      container.appendChild(cell);
      gridCell.push(cell);
    }
  }
  
  const revealMap = (city, country) => {
    let delay = 0.5;
    for(let i=0;i<150;i++)
    {
      gridCell[i].style.animation = "black2Transparent";
      gridCell[i].style.animationDuration = "100ms";
      gridCell[i].style.animationFillMode = "forwards";
      gridCell[i].style.animationDelay = (initialMapRevealDelay + random(0,dominoAnimationRandomness) + (domionesFallRate * delay)) + "ms";
      delay += gridDominoesAnimDelay;
    }
    // showLocation
    displayLocation(city, country);
      
  }

  
  // INITIAL TRIGGER ON LOAD
  const triggerOnLoad = () => {
    // 1. Set Full screen height for the parent container - No scrolling allowed
    setFullScreenHeight();
    // 2. Get IP address and location from API
    httpGetAsync(ipAddressApiUrl, renderAPIresult);
    // 3. Draw grid
    drawGrid("gridOverlayContainer");
    
  }
  
  
  /** EVENT LISTENERS - STARTS */

  window.onload = triggerOnLoad();
  window.onresize = function(){ location.reload(); }
  
  /** EVENT LISTENERS - ENDS */
  
  
  
})();


