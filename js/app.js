const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const message = document.getElementById("message");
const weatherResult = document.getElementById("weatherResult");
searchButton.addEventListener("click", async () => {
  const city = cityInput.value.trim();

  if (!city) {
    message.textContent = "Please enter a city";
    weatherResult.textContent = "";
    return;
  }

  message.textContent = "Loading...";
  weatherResult.textContent = "";

  try {
    const coordinates = await fetchCoordinates(city);

    const weatherData = await fetchWeather(
      coordinates.latitude,
      coordinates.longitude
    );

    const description = getWeatherDescription(
      weatherData.weathercode
    );

    weatherResult.innerHTML = `
      <h2>${coordinates.name}, ${coordinates.country}</h2>
      <p>${weatherData.temperature} °C - ${description}</p>
      <p>Wind: ${weatherData.windspeed} km/h</p>
    `;
  } catch (error) {
    if (error.message === "CITY_NOT_FOUND") {
      message.textContent = "City not found";
    } else {
      message.textContent = "Something went wrong";
    }
  } finally {
    if (
      message.textContent === "Loading..."
    ) {
      message.textContent = "";
    }
  }
});

async function fetchCoordinates(city) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
  );

  if (!response.ok) {
    throw new Error("NETWORK_ERROR");
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("CITY_NOT_FOUND");
  }

  const firstResult = data.results[0];

  return {
    name: firstResult.name,
    country: firstResult.country,
    latitude: firstResult.latitude,
    longitude: firstResult.longitude
  };
}

async function fetchWeather(latitude, longitude) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
  );

  if (!response.ok) {
    throw new Error("NETWORK_ERROR");
  }

  const data = await response.json();

  return data.current_weather;
}

function getWeatherDescription(code) {
  const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy rain showers",
    95: "Thunderstorm"
  };

  return weatherCodes[code] || "Unknown weather";
}