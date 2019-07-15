(function () {
  
  /** GLOBAL VARIABLES - STARTS */

  /* globals google */
  /* globals snazzyMapStyle */
  /* globals ClipboardJS */
  
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
  
  const mapRevealAnimationDelay = 3500;
  const aboutUsRevealDelay = 0;
  const badgeRevealDelay = 0;
  const copyButtonRevealDelay = 0;
  
  
  const flashDuration = 500;
  
  const gridCellCount = 200;
  const gridCells = [];
  const plusSymbolsInGrid = [];
  let referchCopyButtonTimeout = null;
  

  /** GLOBAL VARIABLES - ENDS */


  /** GENERIC HELPER FUNCTIONS - STARTS */
  
  const random = (min,max) => Math.floor(Math.random() * (max - min) + min); // random number generator
  
  function eleID (id) { return document.getElementById(id) }
  
  const httpGetAsync = (apiURL, callback) => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        // console.log(xmlHttp);
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
          if(xmlHttp.response)
            callback({response: JSON.parse(xmlHttp.responseText), status: 'success'});
          else
            callback({status: 'error'});
        }
      else if(xmlHttp.readyState == 4 && (xmlHttp.status == 0 || xmlHttp.status == 404)){
         callback({status: 'error'});
      }
            
    }
    xmlHttp.open("GET", apiURL, true);
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
    const defaultZoomLevel = 14, indiaMapZoomLevel = 12;
    const mapOptions = {
      zoom: country == "India" ? indiaMapZoomLevel : defaultZoomLevel,
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
    eleID(mapDomElementID).removeAttribute('tabindex');
    google.maps.event.addListenerOnce(map, 'tilesloaded', function(){
      //console.log('Map loaded, now reveal map');
      revealMap(city, country);
    });
  }
  
  const displayPlusymbols = () => {
    for(let i=0;i<gridCellCount;i++)
    {
      plusSymbolsInGrid[i].style.animation = "flicker";
      plusSymbolsInGrid[i].style.animationDuration = plusFlickerAnimationDuration+"ms";
      plusSymbolsInGrid[i].style.animationDelay = initialPlusRevealDelay + random(0,plusAnimationRandomness)+"ms";
      plusSymbolsInGrid[i].style.animationFillMode = "forwards";
    }
  }
  
  
  const displayAboutUs = () => {
    flicker(eleID("AboutUs"), 350, mapRevealAnimationDelay + aboutUsRevealDelay);
  }
  
  const displayPHBadge = () => {
    flicker(eleID("productHuntBadge"), 350, mapRevealAnimationDelay + aboutUsRevealDelay + badgeRevealDelay);
  }
  
  // Display IP address AND copy button
  const displayIP = (ipAddress) => {
    eleID("ipAddressContainer").style.animationIterationCount = "1";
    eleID("ipAddressContainer").style.animationName = "none"; // Fkin iOS
    eleID("caption").innerHTML = "YOUR IP ADDRESS";
    eleID("ipAddress").innerHTML = ipAddress;
    
    flicker(eleID("caption"), 350, 0);
    flicker(eleID("ipAddress"),350, 0);
    setTimeout(()=>{flicker(eleID("copyButton", 350, 0))}, copyButtonRevealDelay);
  }
  
  // Display Location after rendering map
  const displayLocation = (city, country) => {
    if(city && country && country === city && country.length <40)
    {
      eleID("locationContainer").innerHTML = country;
      flicker(eleID("locationContainer"),350, mapRevealAnimationDelay);
    }
    else if(city && country && city.length + country.length <40)
    {
      eleID("locationContainer").innerHTML = city+ " // "+ country;
      flicker(eleID("locationContainer"),350, mapRevealAnimationDelay);
    }
    else if(!city && country && country.length <40)
    {
      eleID("locationContainer").innerHTML = country;
      flicker(eleID("locationContainer"),350, mapRevealAnimationDelay);
    }
    else if(city && !country && city.length <40)
    {
      eleID("locationContainer").innerHTML = city;
      flicker(eleID("locationContainer"),350, mapRevealAnimationDelay);
    }
    displayAboutUs();
    displayPHBadge();
  }

  // Display IP address and Render map location
  const renderAPIresult = (ApiResponse) => {
    // API response is 200
    if(ApiResponse.response && ApiResponse.status === 'success') //&& ApiResponse.geobytesipaddress) 
    {
      const response = ApiResponse.response;
      //console.log(response);
      const {
        ip,
        country,
        city,
        lat,
        long
      } = response;
      
      // show IP
      displayIP(ip);
      
      // Render Google map's location based on the API response 
      initializeMap(
        "map",
        parseFloat(lat),
        parseFloat(long),
        city,
        country
      );
    }
    // UI error handler
    else{
      displayPlusymbols();
      eleID("caption").className = "captionError";
      eleID("caption").innerHTML = "ERRRRRRROR";
      eleID("ipAddressContainer").style.animationDuration = "50ms";
    }
    
  }
  
  const drawGrid = (gridContainerDomID) => {
    const container = eleID(gridContainerDomID);
    for(let i=0;i<gridCellCount;i++)
    {
      const cell = document.createElement('div');
      cell.className += "gridCell";
      const plus = document.createElement('span');
      plus.innerHTML = "+";
      plus.className = "plusSymbol";
      plusSymbolsInGrid.push(plus);
      cell.appendChild(plus);
      container.appendChild(cell);
      gridCells.push(cell);
    }
  }
  
  const revealMap = (city, country) => {
    if(country !== "South Korea") //  Snazzy map doensn't work for South Korea
    {
      displayPlusymbols();
      let delay = 0.5;
      for(let i=0;i<gridCellCount;i++)
      {
        gridCells[i].style.animation = "black2Transparent";
        gridCells[i].style.animationDuration = "100ms";
        gridCells[i].style.animationFillMode = "forwards";
        gridCells[i].style.animationDelay = (initialMapRevealDelay + random(0,dominoAnimationRandomness) + (domionesFallRate * delay)) + "ms";
        delay += gridDominoesAnimDelay;
      }
    }
    // showLocation
    displayLocation(city, country);
      
  }
  
  const flashIpAddress = () => {
    if(referchCopyButtonTimeout){
      clearTimeout(referchCopyButtonTimeout);
    }
    eleID("ipAddress").style.animation = "flash";
    eleID("ipAddress").style.animationDuration = flashDuration+ "ms";
    eleID("ipAddress").style.animationFillMode = "forwards";
    setTimeout(() => { eleID("ipAddress").style.animation = "none"; }, 450);
    referchCopyButtonTimeout = setTimeout(refreshCopyButton, 6000);
  }
  
  const refreshCopyButton = () => {
    eleID("copyButton").innerHTML = "COPY";
    eleID("copyButton").style.backgroundColor = "transparent";
    eleID("copyButton").style.color = "#FFF";
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

  window.onload = triggerOnLoad;
  window.onresize = function(){ location.reload(); }
  
  eleID("copyButton").onclick = flashIpAddress;
  
  const clipboard = new ClipboardJS('#copyButton');
  clipboard.on('success', function(e) {
    // console.info('Action:', e.action);
    // console.info('Text:', e.text);
    // console.info('Trigger:', e.trigger);
    eleID("copyButton").innerHTML = "COPIED";
    eleID("copyButton").style.backgroundColor = "white";
    eleID("copyButton").style.color = "#333333"
    e.clearSelection();
  });

  clipboard.on('error', function(e) {
    // console.error('Action:', e.action);
    // console.error('Trigger:', e.trigger);
  });
  
  /** EVENT LISTENERS - ENDS */
  
  
  
})();


