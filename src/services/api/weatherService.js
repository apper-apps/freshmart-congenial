// Mock weather data for development
const mockWeatherData = {
  temperature: 22,
  condition: 'rainy', // rainy, sunny, cloudy, cold, hot, snowy
  location: 'New York, NY',
  humidity: 65,
  windSpeed: 12,
  timestamp: new Date().toISOString()
};

// Weather conditions that can be used for deal filtering
const weatherConditions = {
  RAINY: 'rainy',
  SUNNY: 'sunny', 
  CLOUDY: 'cloudy',
  COLD: 'cold',
  HOT: 'hot',
  SNOWY: 'snowy'
};

class WeatherService {
  async getCurrentWeather() {
    try {
      // In a real application, this would call a weather API
      // For now, return mock data with slight randomization
      const conditions = Object.values(weatherConditions);
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      return {
        ...mockWeatherData,
        condition: randomCondition,
        temperature: Math.floor(Math.random() * 20) + 15, // 15-35°C
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Weather service error:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  getWeatherConditions() {
    return weatherConditions;
  }

  // Helper method to determine if weather matches category
  isWeatherMatch(currentCondition, dealWeatherCategories) {
    if (!dealWeatherCategories || !Array.isArray(dealWeatherCategories)) {
      return false;
    }
    return dealWeatherCategories.includes(currentCondition);
  }
}

export const weatherService = new WeatherService();
export { weatherConditions };