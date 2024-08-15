import dotenv from "dotenv";
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  latitude: number;
  longitude: number;
}

// TODO: Define a class for the Weather object
class Weather {
  constructor(
    public city: string,
    public date: string,
    public icon: string,
    public iconDescription: string,
    public tempF: string,
    public windSpeed: string,
    public humidity: string
  ) { }
}

// TODO: Complete the WeatherService class
class WeatherService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL!;
    this.apiKey = process.env.API_KEY!;
  }

  // TODO: Create fetchLocationData method
  private async fetchLocationData(city: string): Promise<Coordinates|null> {
    const query = this.buildGeocodeQuery(city);
    const response = await fetch(query);
    const data = await response.json();

    if (data.length === 0) {
      return null;
    }

    const coordinates: Coordinates = {
      latitude: data[0].lat,
      longitude: data[0].lon,
    };

    return coordinates;
  }

  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(city: string): string {
    const query = `${this.baseURL}/geo/1.0/direct?q=${city}&limit=1&appid=${this.apiKey}`;
    return query;
  }

  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): {
    forecastQuery: string;
    currentWeatherQuery: string;
  } {
    const currentWeatherQuery = `${this.baseURL}/data/2.5/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&units=imperial&appid=${this.apiKey}`;
    const forecastQuery = `${this.baseURL}/data/2.5/forecast?lat=${coordinates.latitude}&lon=${coordinates.longitude}&units=imperial&appid=${this.apiKey}`;
    return { forecastQuery, currentWeatherQuery };
  }

  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(
    coordinates: Coordinates
  ): Promise<{ currentWeatherData: any; forecastData: any }> {
    const { currentWeatherQuery, forecastQuery } =
      this.buildWeatherQuery(coordinates);

    const currentWeatherResponse = await fetch(currentWeatherQuery);
    const forecastResponse = await fetch(forecastQuery);

    const currentWeatherData = await currentWeatherResponse.json();
    const forecastData = await forecastResponse.json();

    if (currentWeatherResponse.status !== 200) {
      throw new Error(
        `Failed to fetch weather data: ${currentWeatherData.message}`
      );
    }

    return { currentWeatherData, forecastData };
  }

  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    const tempF = response.main.temp;
    const humidity = response.main.humidity;
    const iconDescription = response.weather[0].description;
    const icon = response.weather[0].icon; // Added to include icon
    const city = response.name;
    //    const city = response.name; // Added city name
    const date = new Date(response.dt * 1000).toLocaleDateString(); // Added date
    const windSpeed = response.wind.speed; // Added wind speed

    return new Weather(
      city,
      date,
      icon,
      iconDescription,
      tempF.toString(),
      windSpeed.toString(),
      humidity.toString()
    );
  }

  // TODO: Complete buildForecastArray method
  private buildForecastArray(
    weatherData: any[]
  ): Weather[] {
    const forecast: Weather[] = [];
    for (const data of weatherData) {
      const date = new Date(data.dt * 1000).toLocaleDateString();

      if (forecast.length >= 5) break;
      if (forecast.find((weather) => weather.date === date)) continue;

      const tempF = data.main.temp;
      const humidity = data.main.humidity;
      const iconDescription = data.weather[0].description;
      const icon = data.weather[0].icon;
      const city = data.name;
      const windSpeed = data.wind.speed;

      const weather = new Weather(
        city,
        date,
        icon,
        iconDescription,
        tempF.toString(),
        windSpeed.toString(),
        humidity.toString()
      );
      forecast.push(weather);
    }
    return forecast;
  }

  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string): Promise<Weather[]> {
    const coordinates = await this.fetchLocationData(city);
    if (!coordinates) {
      return [];
    }
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData.currentWeatherData); // Assuming list[0] is current weather
    const forecast = this.buildForecastArray(
      weatherData.forecastData.list.slice(1) // Skip the first element
    );

    return [currentWeather, ...forecast];
  }
}

// Correct export statement
export default new WeatherService();
