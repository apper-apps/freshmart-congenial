import React, { useState, useEffect } from 'react';
import DealCard from '@/components/molecules/DealCard';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import { dealsService } from '@/services/api/dealsService';
import { weatherService } from '@/services/api/weatherService';

const WeatherDealsCarousel = () => {
  const [deals, setDeals] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWeatherDeals = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load weather and deals in parallel
      const [weatherData, dealsData] = await Promise.all([
        weatherService.getCurrentWeather(),
        dealsService.getActiveDeals()
      ]);
      
      setWeather(weatherData);
      
      // Filter deals based on weather condition
      const weatherRelevantDeals = dealsData.filter(deal => 
        deal.weatherCategories && deal.weatherCategories.includes(weatherData.condition)
      );
      
      setDeals(weatherRelevantDeals);
    } catch (err) {
      setError('Failed to load weather deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherDeals();
  }, []);

  const getWeatherTitle = (condition) => {
    const titleMap = {
      rainy: 'Rainy Day Specials',
      cold: 'Winter Warmth Deals',
      hot: 'Summer Cool Deals',
      sunny: 'Sunshine Specials',
      snowy: 'Snow Day Essentials'
    };
    return titleMap[condition] || 'Weather Deals';
  };

  const getWeatherIcon = (condition) => {
    const iconMap = {
      rainy: 'Umbrella',
      cold: 'Snowflake',
      hot: 'Sun',
      sunny: 'Sun',
      snowy: 'Snowflake'
    };
    return iconMap[condition] || 'Sun';
  };

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Loading type="grid" count={3} />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Error message={error} onRetry={loadWeatherDeals} />
        </div>
      </section>
    );
  }

  if (deals.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <div className="bg-white rounded-full p-3 mr-4 shadow-premium">
            <ApperIcon name={getWeatherIcon(weather?.condition)} size={24} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-display font-bold text-gray-900">
              {getWeatherTitle(weather?.condition)}
            </h2>
            <p className="text-gray-600 mt-1">
              Perfect deals for today's {weather?.condition} weather
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <DealCard key={deal.Id} deal={deal} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WeatherDealsCarousel;