'use client'
import { useEffect, useState } from 'react';

interface Day {
  date: string;
  avgtempC: string;
}

export default function WeatherPage() {
  const [days, setDays] = useState<Day[]>([]);

  useEffect(() => {
    fetch('https://wttr.in/?format=j1')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.weather)) {
          setDays(data.weather.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-xl mb-4">Pr\u00e9visions 3 jours</h1>
      <ul className="list-disc pl-4 space-y-1">
        {days.map((d) => (
          <li key={d.date}>
            {d.date} : {d.avgtempC}°C
          </li>
        ))}
      </ul>
    </div>
  );
}
