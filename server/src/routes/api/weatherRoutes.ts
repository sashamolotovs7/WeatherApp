//server/src/routes/api/weatherRoutes.ts
import { Router } from "express";

const router = Router();

import HistoryService from "../../service/historyService.js";
import WeatherService from "../../service/weatherService.js";

// TODO: POST Request with city name to retrieve weather data
router.post("/", async (req, res) => {
  try {
    const { cityName } = req.body;

    if (!cityName) {
      return res.status(400).json({ error: "City name is required" });
    }

    // TODO: GET weather data from city name
    const weatherData = await WeatherService.getWeatherForCity(cityName);

    // TODO: save city to search history
    await HistoryService.addCity(cityName);
    return res.json(weatherData);
  } catch (error) {
    console.error("Error retrieving weather data:", error); // Log any errors
    return res.status(500).json({ error: "Failed to retrieve weather data" });
  }
});

// TODO: GET search history
router.get("/history", async (_req, res) => {
  try {
    const history = await HistoryService.getCities();
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve search history" });
  }
});

// * BONUS TODO: DELETE city from search history
router.delete("/history/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    await HistoryService.deleteCity(id);
    return res.status(204).send(); // No content
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete search history" });
  }
});

export default router;
