import React, { useState, useEffect } from 'react';

function getGreeting(hour) {
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const mm = String(minutes).padStart(2, '0');
  return { hours: String(hours), minutes: mm, ampm };
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { hours, minutes, ampm } = formatTime(now);
  const greeting = getGreeting(now.getHours());
  const dateStr = formatDate(now);

  return (
    <div className="flex flex-col items-center select-none">
      <p className="text-xs text-white/40 font-light tracking-widest uppercase mb-3">
        {greeting}
      </p>
      <div className="flex items-end gap-1">
        <span className="text-7xl font-thin tracking-tight text-white leading-none">
          {hours}:{minutes}
        </span>
        <span className="text-2xl font-light text-white/50 mb-1 ml-1">{ampm}</span>
      </div>
      <p className="text-sm text-white/50 mt-2 tracking-wide">{dateStr}</p>
    </div>
  );
}
