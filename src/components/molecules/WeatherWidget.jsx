import React, { useState, useEffect } from 'react';
import ApperIcon from '@/components/ApperIcon';
import { weatherService } from '@/services/api/weatherService';

const WeatherWidget = ({ className = '' }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWeather = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await weatherService.getCurrentWeather();
      setWeather(data);
    } catch (err) {
      setError('Failed to load weather');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, []);

  const getWeatherIcon = (condition) => {
    const iconMap = {
      sunny: 'Sun',
      cloudy: 'Cloud',
      rainy: 'CloudRain',
      snowy: 'Snowflake',
      stormy: 'Zap'
    };
    return iconMap[condition] || 'Sun';
  };

  const getWeatherGradient = (condition) => {
    const gradientMap = {
      sunny: 'from-yellow-400 to-orange-500',
      cloudy: 'from-gray-400 to-gray-600',
      rainy: 'from-blue-400 to-blue-600',
      snowy: 'from-blue-200 to-gray-400',
      stormy: 'from-purple-500 to-gray-700'
    };
    return gradientMap[condition] || 'from-blue-400 to-blue-600';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-premium p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-premium p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <ApperIcon name="CloudOff" size={24} className="mx-auto mb-2 text-gray-400" />
          <p className="text-sm">Weather unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r ${getWeatherGradient(weather.condition)} rounded-lg shadow-premium p-4 text-white ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 rounded-full p-2">
            <ApperIcon name={getWeatherIcon(weather.condition)} size={24} />
          </div>
          <div>
            <p className="font-semibold text-lg">{weather.temperature}°C</p>
            <p className="text-sm opacity-90 capitalize">{weather.condition}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-90">{weather.location}</p>
          <p className="text-xs opacity-75">Now</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;