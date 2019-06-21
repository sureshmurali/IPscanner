(function () {
  
  /** GLOBAL VARIABLES - STARTS */

  /* globals google */
  /* globals snazzyMapStyle */
  
  // Move these to .env files before production
  const ipAddressApiUrl = 'https://api.ipdata.co/?api-key=test';
  const GoogleMapsApiKey = 'AIzaSyDU8bDnzS0dg75w8H6Y6j_y7ssaoEJDvLA';
  
  // Animation controls (in milliseconds)
  const initialMapRevealDelay = 2000;
  const gridDominoesAnimDelay = 0.075;
  const domionesFallRate = 100;
  const dominoAnimationRandomness = 100;
  
  const plusAnimationRandomness = 500;
  const plusFlickerAnimationDuration = 400;
  const initialPlusRevealDelay = 1000;
  
  const gridCell = [];

  /** GLOBAL VARIABLES - ENDS */


  /** GENERIC HELPER FUNCTIONS - STARTS */
  
  const random = (min,max) => Math.floor(Math.random() * (max - min) + min); // random number generator
  
  function eleID (id) { return document.getElementById(id) }
  
  const httpGetAsync = (theUrl, callback) => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
  }

  /** GENERIC HELPER FUNCTIONS - ENDS */



  const setFullScreenHeight = () => {
      const { clientHeight } = window.document.documentElement;
      eleID("fullScreenContainer").style.height = `${clientHeight}px`;
      // console.log(`Client Hieght: ${clientHeight}`);
  }
  
   const initializeMap = (mapDomElementID, Latitude, Longitude) => {
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
    google.maps.event.addListenerOnce(map, 'idle', function(){
      //console.log('Map loaded, now reveal map');
      revealMap();
    });
  }


  const showIP = (ApiResponse) => {
    // console.log(ipAddress);
    const ipAddress = JSON.parse(ApiResponse).ip;
    eleID("ipAddress").innerHTML = ipAddress;
    
    // Render Google map's location based on the API response 
    initializeMap("map", 35.6762, 139.6503);
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
  
  const revealMap = () => {
    let delay = 0.5;
    for(let i=0;i<150;i++)
    {
      gridCell[i].style.animation = "black2Transparent";
      gridCell[i].style.animationDuration = "100ms";
      gridCell[i].style.animationFillMode = "forwards";
      gridCell[i].style.animationDelay = (initialMapRevealDelay + random(0,dominoAnimationRandomness) + (domionesFallRate * delay)) + "ms";
      delay += gridDominoesAnimDelay;
    }
  }

  
  // INITIAL TRIGGER ON LOAD
  
  const triggerOnLoad = () => {
    
    // 1. Set Full screen height for the parent container - No scrolling allowed
    setFullScreenHeight();
    
    // 2. Get IP address and location from API
    httpGetAsync(ipAddressApiUrl,showIP);
    
    // 3. Draw grid
    drawGrid("gridOverlayContainer");
    
  }
  
  
  /** EVENT LISTENERS - STARTS */

  window.onload = triggerOnLoad();
  window.onresize = function(){ location.reload(); }
  
  /** EVENT LISTENERS - ENDS */
  
  
  
})();


