// Initialiseer de kaart en stel het midden en zoomniveau in
var map = L.map("map").setView([51.31292546476911, 4.395210236419795], 15);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let markers = []; // Array om alle markers op te slaan

// Functie om de huidige locatie op basis van GPS te verkrijgen
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        addCurrentLocationMarker(latitude, longitude);
        map.setView([latitude, longitude], 15); // Zet de kaart op de huidige locatie
      },
      (error) => {
        console.error("Fout bij het verkrijgen van GPS-locatie:", error);
        alert("Kan je locatie niet verkrijgen. Zorg ervoor dat je GPS is ingeschakeld en dat je toestemming hebt gegeven.");
      },
      {
        enableHighAccuracy: true, // Vraag om hoge nauwkeurigheid
        timeout: 10000, // Tijdslimiet voor het verkrijgen van de locatie
        maximumAge: 0 // Geen cache gebruiken
      }
    );
  } else {
    alert("Geolocatie wordt niet ondersteund door deze browser.");
  }
}

// Functie om een marker voor de huidige locatie toe te voegen
function addCurrentLocationMarker(latitude, longitude) {
  var currentLocationMarker = L.marker([latitude, longitude], {
    icon: L.icon({
      iconUrl: './images/dot.png', // Voeg hier een URL naar een bol-icoon toe
      iconSize: [25, 25], // Pas de grootte aan indien nodig
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
  }).addTo(map).bindPopup("Je huidige locatie").openPopup();
}

// Verkrijg de huidige locatie bij het laden van de pagina
getCurrentLocation();

fetch("./antenne.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then((data) => {
    console.log(data); // Log the data to check its structure

    // Voeg markers toe voor alle locaties
    ["Hoevenen", "Antwerpen", "Antwerpen2"].forEach((location) => {
      if (data[location] && data[location].length > 0) {
        data[location].forEach((antenna, index) => {
          addMarker(antenna, location, index);
        });
      } else {
        console.error(`No ${location} data found`);
      }
    });

    // Functie om een marker toe te voegen
    function addMarker(antenna, type, index) {
      var marker = L.marker([antenna.coord.latitude, antenna.coord.longitude]).addTo(map);
      markers.push(marker); // Voeg de marker toe aan de markers array
      console.log(`Marker added for ${type}: ${antenna.adress}`); // Log marker addition

      // Create a dropdown for selecting other elements
      var dropdown = createDropdown(type, index, data);
      marker.bindPopup(
        `<div>
          ${dropdown}
          <div id="marker-info-${type}">${getMarkerInfo(antenna)}</div>
        </div>`
      );
    }

    // Functie om een dropdown te maken
    function createDropdown(type, index, data) {
      var dropdown = `<select onchange="updateMarker(this.value, '${type}')">
                        <option value="${index}">${data[type][index].adress} (ID: ${index})</option>`;
      for (let i = 0; i < data[type].length; i++) {
        if (i !== index) { // Voorkom duplicaten
          dropdown += `<option value="${i}">${data[type][i].adress} (ID: ${i})</option>`;
        }
      }
      dropdown += `</select>`;
      return dropdown;
    }

    // Functie om de marker-informatie op te halen
    function getMarkerInfo(antenna) {
      return `
        Antenne Type: ${antenna.antenna.Zendantenne_type}<br>
        Frequentie: ${antenna.antenna.Frequentie_MHz} MHz<br>
        Hoogte: ${antenna.antenna.Hoogte_midden_m} meter<br>
        Vermogen: ${antenna.antenna.Vermogen_W} Watt<br>
        Winst: ${antenna.antenna.Winst_dBi} dBi<br>
        Datasheet: <a href=${antenna.datasheet}>download</a><br>
      `;
    }

    // Functie om de marker-informatie bij te werken op basis van de geselecteerde waarde
    window.updateMarker = function(index, type) {
      var antenna = data[type][index];
      document.getElementById(`marker-info-${type}`).innerHTML = getMarkerInfo(antenna);
    };

    // Zoekfunctionaliteit
    document.getElementById("searchInput").addEventListener("input", function() {
      const searchTerm = this.value.toLowerCase();
      markers.forEach((marker, index) => {
        const antenna = data.Hoevenen.concat(data.Antwerpen, data.Antwerpen2)[index]; // Combineer alle data
        const isVisible = antenna.adress.toLowerCase().includes(searchTerm);
        if (isVisible) {
          marker.addTo(map); // Voeg marker toe aan de kaart als het overeenkomt
        } else {
          map.removeLayer(marker); // Verwijder marker van de kaart als het niet overeenkomt
        }
      });
    });

  })
  .catch((error) => console.error("Fout bij het laden van JSON:", error));
  