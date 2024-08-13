
import dotenv from "dotenv";
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  latitude: number;
  longitude: number;
}

// TODO: Define a class for the Weather object
class Weather {
  temperature: number;
  humidity: number;
  conditions: string;

  constructor(temperature: number, humidity: number, conditions: string) {
    this.temperature = temperature;
    this.humidity = humidity;
    this.conditions = conditions;
  }
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
  private async fetchLocationData(city: string): Promise<Coordinates> {
    const query = this.buildGeocodeQuery(city);
    const response = await fetch(query);
    const data = await response.json();

    if (data.length === 0) {
      throw new Error('City not found');
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
  private buildWeatherQuery(coordinates: Coordinates): string {
    const query = `${this.baseURL}/data/2.5/forecast?lat=${coordinates.latitude}&lon=${coordinates.longitude}&units=metric&appid=${this.apiKey}`;
    return query;
  }

  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const query = this.buildWeatherQuery(coordinates);
    const response = await fetch(query);
    const data = await response.json();

    if (response.status !== 200) {
      throw new Error(`Failed to fetch weather data: ${data.message}`);
    }

    return data;
  }

  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    const temperature = response.main.temp;
    const humidity = response.main.humidity;
    const conditions = response.weather[0].description;
    return new Weather(temperature, humidity, conditions);
  }

  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] {
    const forecast = weatherData.map((data: any) => {
      return new Weather(data.main.temp, data.main.humidity, data.weather[0].description);
    });
    return [currentWeather, ...forecast];
  }

  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string): Promise<Weather[]> {
    const coordinates = await this.fetchLocationData(city);
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData.list[0]); // Assuming list[0] is current weather
    const forecast = this.buildForecastArray(currentWeather, weatherData.list.slice(1)); // Skip the first element

    return forecast;
  }
}

// Correct export statement
export default new WeatherService();
