import React from 'react';
import { MapPin } from 'lucide-react';
import { City } from '../lib/mockData';

interface CityFilterProps {
  cities: City[];
  selectedCity: string | null;
  onCityChange: (cityId: string | null) => void;
  shiftsCount: Record<string, number>;
}

export function CityFilter({ cities, selectedCity, onCityChange, shiftsCount }: CityFilterProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <MapPin className="w-5 h-5 text-[#A4B8D3]" />
      <select
        value={selectedCity || ''}
        onChange={(e) => onCityChange(e.target.value || null)}
        className="block w-full max-w-xs rounded-lg border-[#CBD2E1] bg-white shadow-sm focus:border-[#16A64D] focus:ring focus:ring-[#CAEFD8] focus:ring-opacity-50 text-[#4F6C92]"
      >
        <option value="">All Cities ({Object.values(shiftsCount).reduce((a, b) => a + b, 0)})</option>
        {cities.map((city) => (
          <option key={city.id} value={city.id}>
            {city.name} ({shiftsCount[city.id] || 0})
          </option>
        ))}
      </select>
    </div>
  );
}