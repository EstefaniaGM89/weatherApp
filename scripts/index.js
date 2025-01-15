const API_KEY = "84ea0f8e94msh8cdefdfbd8691e5p1c14c4jsn8d0d1d5aafc5";
const BASE_URL = "https://weatherapi-com.p.rapidapi.com";
const HEADERS = {
	"x-rapidapi-key": API_KEY,
	"x-rapidapi-host": "weatherapi-com.p.rapidapi.com",
};

document.addEventListener("DOMContentLoaded", () => {
	const searchButton = document.getElementById("search_button");
	const cityInput = document.getElementById("city_input");
	const weatherInfo = document.getElementById("weather_info");
	const forecast = document.getElementById("forecast");

	// Weather info elements
	const weather_messages = document.getElementById("weather_messages");
	const city_name = document.getElementById("city_name");
	const temperature = document.getElementById("temperature");
	const weather_description = document.getElementById("weather_description");
	const humidity = document.getElementById("humidity");
	const wind_speed = document.getElementById("wind_speed");

	// Forecast elements
	const forecast_messages = document.getElementById("forecast_messages");
	const forecastCards = document.getElementById("forecast_cards");

	// Funcions per mostrar i amagar missatges d'error i informació
	const showWeatherMessages = (message) => {
		weatherInfo.classList.add("hidden");
		weather_messages.innerHTML = message;
		weather_messages.classList.remove("hidden");
	}

	const hideWeatherMessages = () => {
		weather_messages.classList.add("hidden");
	}

	const showWeatherInfo = (weatherData) => {
		weather_messages.classList.add("hidden");
		city_name.innerHTML = weatherData.location.name;
		temperature.innerHTML = weatherData.current.temp_c + "ºC";
		weather_description.innerHTML = weatherData.current.condition.text;
		humidity.innerHTML = weatherData.current.humidity;
		wind_speed.innerHTML = weatherData.current.wind_kph;
		weatherInfo.classList.remove("hidden");
	}

	const showForecastMessages = (message) => {
		forecast.classList.add("hidden");
		forecast_messages.innerHTML = message;
		forecast_messages.classList.remove("hidden");
	}

	const hideForecastMessages = () => {
		forecast_messages.classList.add("hidden");
	}

	const showForecastInfo = (forecastData) => {
		forecast_messages.classList.add("hidden");
		forecastCards.innerHTML = "";
		forecastData.forecast.forecastday.forEach(day => {
			const date = new Date(day.date_epoch * 1000);
			const options = { weekday: 'long' };
			const dayOfWeek = new Intl.DateTimeFormat('es-ES', options).format(date);

			let div = document.createElement("div");
			div.classList.add("card");
			// Afegeix la classe "capitalize" per a que el dia de la setmana es mostri amb la primera lletra en majúscula
			div.innerHTML = `<p class="capitalize">${dayOfWeek}</p>
			<p>${day.day.avgtemp_c}ºC</p>
			<span><img src="${day.day.condition.icon}" alt="icon"></span>`;
			forecastCards.appendChild(div);
		});
		forecast.classList.remove("hidden");
	}

	// Activitat 1.2: Recerca amb la tecla "Enter":
	cityInput.addEventListener("keyup", (event) => {
		if (event.key === "Enter") {
			searchButton.click();
		}
	});

	searchButton.addEventListener("click", async () => { // Funció asincrona
		console.log("Search button clicked");

		// TO DO: Cerca informació del temps actual i previsió de 3 dies
		const city = cityInput.value.trim(); // Elimina espais en blanc al principi i al final

		// Activitat 1.1: Mostra un missatge d'error si no s'ha introduït cap ciutat
		if (!city) {
			showWeatherMessages("El nom de la ciutat és obligatori.");
			showForecastMessages("El nom de la ciutat és obligatori.");
			return;
		}

		try {
			// Si s'ha introduït una ciutat, realitza la recerca
			const [weatherData, forecastData] = await Promise.all([
				fetchWeatherData(city),
				fetchForecastData(city)
			]);

			if (weatherData.error) {

				// Activitat 1.3: En cas d'altres errors
				let error = "Hi ha hagut un problema amb la cerca. Torna-ho a intentar.";

				// Activitat 1.3: Si no es troba la ciutat
				if (weatherData.error.code === 1006) {
					error = "No s’ha trobat la ciutat.";
				}

				showWeatherMessages(error);
			}
			else if (!weatherData.current) {
				showWeatherMessages("Hi ha hagut un problema amb la cerca. Torna-ho a intentar.");
			}
			else {
				// Activitat 1.4: Ocultar quan la recerca s’hagi completat.
				showWeatherInfo(weatherData);
				cityInput.value = ''; //Esborra el contingut de l'input després de la recerca
			}

			if (forecastData.forecast) {
				showForecastInfo(forecastData);
			}
			// Error en la recerca de la previsió
			else {
				showForecastMessages("No s’ha pogut obtenir la previsió meteorològica.");
			}
		}
		catch (error) {
			console.log('Error:', error.message);
		}
	});

	const fetchWeatherData = async (city) => {
		const url = `${BASE_URL}/current.json?q=${city}&lang=es`;
		const options = {
			method: "GET",
			headers: HEADERS,
		};

		try {
			// Realitza la petició HTTP amb fetch
			console.log("Fetching weather data...");
			showWeatherMessages("Carregant...");
			const response = await fetch(url, options);
			const result = await response.json();
			hideWeatherMessages();
			console.log('Fetched weather data:', result);
			return result;
		} catch (error) {
			throw new Error(`Weather error: ${error.message}`);
		}
	};

	const fetchForecastData = async (city, days = 3) => {
		const url = `${BASE_URL}/forecast.json?q=${city}&days=${days}&lang=es`;
		const options = {
			method: "GET",
			headers: HEADERS,
		};

		try {
			// Realitza la petició HTTP amb fetch
			console.log("Fetching forecast data...");
			showForecastMessages("Carregant...");
			const response = await fetch(url, options);
			const result = await response.json();
			hideForecastMessages();
			console.log('Fetched forecast data:', result);
			return result;
		} catch (error) {
			forecast.classList.add("hidden");
			throw new Error(`Forecast error: ${error.message}`);
		}
	};
});
