let map;
let vehicleMarker;
let routeCoordinates = [];
let animationSpeed = 10; // Speed of movement (higher = slower)
let stopDelay = 500; // Stop for 0.5 seconds (500 milliseconds)
let currentIndex = 0; // Index to track the vehicle's current position on the route
let vehiclePath = []; // Array to store the path of the vehicle for a trailing effect
let animationInterval; // Store the interval for the animation
let isAnimating = false; // Flag to control animation

// Initialize the Google Map
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 19.7675, lng: 74.475 },
    zoom: 12,
    styles: [
      {
        featureType: "all",
        elementType: "geometry",
        stylers: [
          { color: "#e6e6e6" },
          { visibility: "simplified" }
        ]
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#a4c8e1" }]
      },
      {
        featureType: "landscape",
        elementType: "geometry",
        stylers: [{ color: "#f0f0f0" }]
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#d9d9d9" }]
      }
    ],
  });

  vehicleMarker = new google.maps.Marker({
    position: { lat: 19.7675, lng: 74.475 },
    map: map,
    icon: {
      url: "https://img.icons8.com/color/50/000000/car.png",
      scaledSize: new google.maps.Size(50, 50),
    },
  });

  // Add event listeners to the buttons
  document.getElementById("startBtn").addEventListener("click", startAnimation);
  document.getElementById("stopBtn").addEventListener("click", stopAnimation);

  // Fetch the vehicle route data from the backend
  fetchVehicleData();
}

// Fetch vehicle movement data from the backend
function fetchVehicleData() {
  fetch("https://track-backend-theta.vercel.app/api/route")
    .then((response) => response.json())
    .then((data) => {
      routeCoordinates = data.map((location) => ({
        lat: location.latitude,
        lng: location.longitude,
      }));
      
      // Draw the route with markers for each stop
      drawRouteWithMarkers();
    })
    .catch((error) => console.error("Error fetching vehicle data:", error));
}

// Draw the full route and add numbered markers for each stop
function drawRouteWithMarkers() {
  new google.maps.Polyline({
    path: routeCoordinates,
    geodesic: true,
    strokeColor: "#FFFF00",
    strokeOpacity: 1.0,
    strokeWeight: 4,
    map: map,
  });

  routeCoordinates.forEach((position, index) => {
    new google.maps.Marker({
      position,
      map: map,
      label: {
        text: `${index + 1}`,
        color: "black",
        fontSize: "14px",
      },
    });
  });
}

// Start animating the vehicle marker along the route
function startAnimation() {
  if (!isAnimating && routeCoordinates.length > 0) {
    isAnimating = true;
    animateVehicle();
  }
}

// Stop animating the vehicle marker
function stopAnimation() {
  isAnimating = false;
  clearInterval(animationInterval); // Stop the animation
}

// Animate the vehicle marker along the route
function animateVehicle() {
  if (currentIndex < routeCoordinates.length - 1 && isAnimating) {
    const start = routeCoordinates[currentIndex];
    const end = routeCoordinates[currentIndex + 1];

    let stepCount = 130;
    let step = 0;
    let deltaLat = (end.lat - start.lat) / stepCount;
    let deltaLng = (end.lng - start.lng) / stepCount;

    animationInterval = setInterval(() => {
      step++;
      const nextLat = start.lat + deltaLat * step;
      const nextLng = start.lng + deltaLng * step;
      const nextPosition = { lat: nextLat, lng: nextLng };

      vehicleMarker.setPosition(nextPosition);
      map.panTo(nextPosition);

      vehiclePath.push(nextPosition);
      new google.maps.Polyline({
        path: vehiclePath,
        geodesic: true,
        strokeColor: "#00FF00",
        strokeOpacity: 0.6,
        strokeWeight: 2,
        strokeDasharray: "5, 5",
        map: map,
      });

      if (step === stepCount) {
        clearInterval(animationInterval);
        currentIndex++;
        setTimeout(() => {
          animateVehicle(); // Move to the next point after the stop delay
        }, stopDelay);
      }
    }, animationSpeed);
  }
}
