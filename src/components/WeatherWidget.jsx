import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, CloudSun, Cloud, Wind, Droplets, CloudRain, CloudSnow, Zap, MapPin } from 'lucide-react';

function getWeatherInfo(code) {
  if (code === 0 || code === 1) return { label: 'Clear', Icon: Sun };
  if (code === 2) return { label: 'Partly Cloudy', Icon: CloudSun };
  if (code === 3) return { label: 'Overcast', Icon: Cloud };
  if (code === 45 || code === 48) return { label: 'Foggy', Icon: Wind };
  if (code === 51 || code === 53 || code === 55) return { label: 'Drizzle', Icon: Droplets };
  if (code === 61 || code === 63 || code === 65) return { label: 'Rain', Icon: CloudRain };
  if (code === 71 || code === 73 || code === 75) return { label: 'Snow', Icon: CloudSnow };
  if (code === 80 || code === 81 || code === 82) return { label: 'Showers', Icon: CloudRain };
  if (code === 95 || code === 96 || code === 99) return { label: 'Thunderstorm', Icon: Zap };
  return { label: 'Cloudy', Icon: Cloud };
}

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null); // array of {day, max, min, code}
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) { setVisible(false); return; }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;
      try {
        const [weatherRes, geoRes] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=6`),
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`),
        ]);

        if (!weatherRes.ok) { setVisible(false); return; }

        const wd = await weatherRes.json();
        const gd = geoRes.ok ? await geoRes.json() : {};

        const temp = Math.round(wd.current?.temperature_2m ?? 0);
        const code = wd.current?.weathercode ?? 0;
        const addr = gd.address ?? {};
        const city = addr.city || addr.town || addr.village || addr.county || '';

        setWeather({ temp, code, city });

        // Build 5-day forecast (skip today at index 0)
        if (wd.daily?.time) {
          const days = wd.daily.time.slice(1, 6).map((t, i) => ({
            day: DAY_NAMES[new Date(t).getDay()],
            max: Math.round(wd.daily.temperature_2m_max[i + 1]),
            min: Math.round(wd.daily.temperature_2m_min[i + 1]),
            code: wd.daily.weathercode[i + 1],
          }));
          setForecast(days);
        }
      } catch { setVisible(false); }
    }, () => setVisible(false), { timeout: 8000 });
  }, []);

  if (!visible || !weather) return null;

  const { label, Icon } = getWeatherInfo(weather.code);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="glass rounded-xl overflow-hidden cursor-default"
      style={{ minWidth: '152px' }}
    >
      {/* Always-visible current conditions */}
      <div className="px-3 py-2.5 flex items-center gap-2.5">
        <Icon className="w-5 h-5 text-white/60 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-light text-white leading-none">{weather.temp}°</span>
            <span className="text-xs text-white/40">{label}</span>
          </div>
          {weather.city && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-white/30 flex-shrink-0" />
              <span className="text-[10px] text-white/40 truncate">{weather.city}</span>
            </div>
          )}
        </div>
      </div>

      {/* Expandable forecast section */}
      <AnimatePresence>
        {hovered && forecast && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/8 px-3 py-2 space-y-1.5">
              {forecast.map((day) => {
                const { Icon: DayIcon } = getWeatherInfo(day.code);
                return (
                  <div key={day.day} className="flex items-center gap-2">
                    <span className="text-[10px] text-white/40 w-7 flex-shrink-0 font-medium">{day.day}</span>
                    <DayIcon className="w-3 h-3 text-white/40 flex-shrink-0" />
                    <span className="text-[10px] text-white/70 flex-1 text-right">{day.max}°</span>
                    <span className="text-[10px] text-white/35">/</span>
                    <span className="text-[10px] text-white/40 w-6 text-right">{day.min}°</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
