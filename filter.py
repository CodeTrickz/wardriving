import requests
import json

# Endpoint URL
url = "https://mercator.vlaanderen.be/raadpleegdienstenmercatorpubliek/ogc/features/v1/collections/us%3Aus_zndant_pnt/items?f=application%2Fgeo%2Bjson&limit=4860"

# Voer de GET-aanroep uit
response = requests.get(url)

# Controleer de statuscode
if response.status_code == 200:
    try:
        # Verkrijg de gegevens in JSON-formaat
        data = response.json()
        
        # Print de ontvangen data om de structuur te controleren
        print("Ontvangen data:", json.dumps(data, indent=4))  # Print de JSON-structuur
        
        # Controleer of 'features' aanwezig is in de data
        if 'features' in data:
            # Filter de gegevens voor de regio Antwerpen
            antwerpen_data = [item for item in data['features'] if 'Slachthuislaan' in item['properties']['locatiebeschrijving']]
            
            # Sla de gefilterde gegevens op in een JSON-bestand
            with open('zendmasten_MICHIEL.json', 'w') as json_file:
                json.dump(antwerpen_data, json_file, indent=4)
            
            print("Gegevens over zendmasten in Antwerpen zijn opgeslagen in 'zendmasten_stabroek.json'.")
        else:
            print("Geen 'features' gevonden in de ontvangen data.")
    except json.JSONDecodeError:
        print("Fout bij het decoderen van de JSON. Ontvangen inhoud:")
        print(response.text)  # Print de inhoud van de response
else:
    print(f"Fout bij het ophalen van gegevens: {response.status_code}")
    print("Ontvangen inhoud:")
    print(response.text)  # Print de inhoud van de response
