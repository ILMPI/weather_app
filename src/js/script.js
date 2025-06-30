const body = document.querySelector('body');

const apiKey = process.env.OPENWEATHER_API_KEY;

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const langSelect = document.getElementById('langSelect');

const LABELS = {
	en: {
		forecastTitle: '3-Day Forecast',
		city: '',
		temp: 'Temperature',
		humidity: 'Humidity',
		pressure: 'Pressure',
		desc: 'Description',
		feelsLike: 'Feels Like',
		wind: 'Wind Speed',
	},
	ua: {
		forecastTitle: 'Прогноз на 3 дні',
		city: '',
		temp: 'Температура',
		humidity: 'Вологість',
		pressure: 'Тиск',
		desc: 'Опис',
		feelsLike: 'Відчувається як',
		wind: 'Швидкість вітру',
	},
	es: {
		forecastTitle: 'Pronóstico de 3 días',
		city: 'Ciudad',
		temp: 'Temperatura',
		humidity: 'Humedad',
		pressure: 'Presión',
		desc: 'Descripción',
		feelsLike: 'Sensación térmica',
		wind: 'Velocidad del viento',
	},
	ru: {
		forecastTitle: 'Прогноз на 3 дня',
		city: '',
		temp: 'Температура',
		humidity: 'Влажность',
		pressure: 'Давление',
		desc: 'Описание',
		feelsLike: 'Ощущается как',
		wind: 'Скорость ветра',
	},
};

function updateLabels(lang) {
	// document.getElementById('labelCity').textContent = LABELS[lang].city;
	document.getElementById('labelTemp').textContent = LABELS[lang].temp;
	document.getElementById('labelHumidity').textContent = LABELS[lang].humidity;
	document.getElementById('labelPressure').textContent = LABELS[lang].pressure;
	document.getElementById('labelDesc').textContent = LABELS[lang].desc;
	document.getElementById('labelFeelsLike').textContent = LABELS[lang].feelsLike;
	document.getElementById('labelWind').textContent = LABELS[lang].wind;
	document.getElementById('forecastTitle').textContent = LABELS[lang].forecastTitle;
}

function setWeatherIcon(iconCode, description = '') {
	const iconElem = document.getElementById('weatherIcon');
	iconElem.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
	iconElem.alt = description;
}

let currentCity = 'Vitoria-Gasteiz';
let currentLang = getDefaultLang();
langSelect.value = currentLang;

function fetchAndRender(city, lang) {
	updateLabels(lang);

	const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=${lang}`;
	const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=${lang}`;

	Promise.all([
		fetch(currentUrl).then(r => {
			if (!r.ok) throw new Error('API error or city not found');
			return r.json();
		}),
		fetch(forecastUrl).then(r => {
			if (!r.ok) throw new Error('API error or city not found');
			return r.json();
		}),
	])
		.then(([currentData, forecastData]) => {
			clearError();
			toggleWeatherCard(true);

			// --- Current weather ---
			document.getElementById('valueCity').textContent = currentData.name;
			document.getElementById('valueTemp').textContent = `${currentData.main.temp} °C`;
			document.getElementById('valueHumidity').textContent = `${currentData.main.humidity} %`;
			document.getElementById('valuePressure').textContent = `${currentData.main.pressure} гПа`;
			document.getElementById('valueDesc').textContent = currentData.weather[0].description;
			document.getElementById('valueFeelsLike').textContent = `${currentData.main.feels_like} °C`;
			document.getElementById('valueWind').textContent = `${currentData.wind.speed} м/с`;
			setWeatherIcon(currentData.weather[0].icon, currentData.weather[0].description);

			// --- Forecast cards ---
			const forecastList = forecastData.list;
			const days = {};
			const today = new Date().toISOString().slice(0, 10);

			forecastList.forEach(item => {
				const date = item.dt_txt.slice(0, 10);
				if (date === today) return;
				if (!days[date]) days[date] = [];
				days[date].push(item);
			});

			const forecastCards = [];
			Object.entries(days)
				.slice(0, 3)
				.forEach(([date, values]) => {
					let minTemp = Math.min(...values.map(x => x.main.temp_min));
					let maxTemp = Math.max(...values.map(x => x.main.temp_max));
					let descCount = {};
					let iconCount = {};
					values.forEach(v => {
						const desc = v.weather[0].description;
						const icon = v.weather[0].icon;
						descCount[desc] = (descCount[desc] || 0) + 1;
						iconCount[icon] = (iconCount[icon] || 0) + 1;
					});
					const mainDesc = Object.entries(descCount).sort((a, b) => b[1] - a[1])[0][0];
					const mainIcon = Object.entries(iconCount).sort((a, b) => b[1] - a[1])[0][0];

					forecastCards.push({
						date,
						minTemp,
						maxTemp,
						mainDesc,
						mainIcon,
					});
				});

			// Fill each forecast card by BEM classes
			forecastCards.forEach((card, i) => {
				if (i >= 3) return;
				const cardDiv = document.getElementById('forecastCard' + (i + 1));
				if (!cardDiv) return;

				const dayDiv = cardDiv.querySelector('.forecast__day');
				const iconImg = cardDiv.querySelector('.forecast__icon');
				const descDiv = cardDiv.querySelector('.forecast__desc');
				const tempDiv = cardDiv.querySelector('.forecast__temp');

				const d = new Date(card.date);
				const dayName = d.toLocaleDateString(lang, { weekday: 'long', month: 'short', day: 'numeric' });

				dayDiv.textContent = dayName;
				iconImg.src = `https://openweathermap.org/img/wn/${card.mainIcon}@2x.png`;
				iconImg.alt = card.mainDesc;
				descDiv.textContent = card.mainDesc;
				tempDiv.textContent = `${Math.round(card.minTemp)}°C ~ ${Math.round(card.maxTemp)}°C`;
			});

			document.getElementById('forecastSection').style.display = 'block';
		})
		.catch(err => {
			showError('Error: ' + err.message);
			document.getElementById('forecastSection').style.display = 'none';
		});
}

window.addEventListener('DOMContentLoaded', () => {
	cityInput.value = currentCity;
	currentLang = getDefaultLang();
	langSelect.value = currentLang;
	fetchAndRender(currentCity, currentLang);
});

// searchBtn.addEventListener('click', () => {
// 	if (cityInput.value.trim()) {
// 		currentCity = cityInput.value.trim();
// 		fetchAndRender(currentCity, currentLang);
// 	}
// });

const weatherForm = document.getElementById('weatherForm');
weatherForm.addEventListener('submit', e => {
	e.preventDefault();
	const newCity = cityInput.value.trim();
	if (newCity) {
		currentCity = newCity;
		fetchAndRender(currentCity, currentLang);
	}
});

// cityInput.addEventListener('keyup', e => {
// 	if (e.key === 'Enter') {
// 		searchBtn.click();
// 	}
// });

function getDefaultLang() {
	const browserLang = navigator.language.slice(0, 2).toLowerCase();
	return LABELS.hasOwnProperty(browserLang) ? browserLang : 'en';
}

langSelect.addEventListener('change', () => {
	currentLang = langSelect.value;
	fetchAndRender(currentCity, currentLang);
});

function toggleWeatherCard(isVisible) {
	const card = document.getElementById('weatherCard');
	card.style.display = isVisible ? 'block' : 'none';
}

function showError(msg) {
	document.getElementById('errorMsg').textContent = msg;
	toggleWeatherCard(false);
}
function clearError() {
	document.getElementById('errorMsg').textContent = '';
}
