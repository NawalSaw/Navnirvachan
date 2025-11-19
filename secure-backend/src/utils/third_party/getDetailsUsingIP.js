import fetch from "node-fetch";


export async function getDetailsUsingIP(ip) {
    const response = await fetch(`https://ipapi.co/${ip}/json/`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.then((response) => response.json())
    .then((data) => {
      return {
        ip,
        country: data.country_name,
        region: data.region,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
      };
    });
}