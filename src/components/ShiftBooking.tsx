import React, { useEffect, useState } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { Calendar, User, MapPin, Clock, Briefcase, ChevronRight, Building2 } from 'lucide-react';

interface Shift {
  id: string;
  area: string;
  booked: boolean;
  startTime: number;
  endTime: number;
  position: string;
  department: string;
}

interface GroupedShifts {
  [key: string]: Shift[];
}

const ShiftBooking: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'booked'>('available');
  const [loadingShiftId, setLoadingShiftId] = useState<string | null>(null);

  const fetchShifts = async () => {
    try {
      const response = await fetch('http://localhost:8000/shifts');
      if (!response.ok) {
        throw new Error('Failed to fetch shifts');
      }
      const data = await response.json();
      setShifts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBookShift = async (shiftId: string) => {
    setLoadingShiftId(shiftId);
    try {
      const response = await fetch(`http://localhost:8000/shifts/${shiftId}/book`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to book shift');
      }
      await fetchShifts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book shift');
    } finally {
      setLoadingShiftId(null);
    }
  };

  const handleCancelShift = async (shiftId: string) => {
    setLoadingShiftId(shiftId);
    try {
      const response = await fetch(`http://localhost:8000/shifts/${shiftId}/cancel`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to cancel shift');
      }
      await fetchShifts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel shift');
    } finally {
      setLoadingShiftId(null);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  // Filter shifts based on selected city and tab
  const filteredShifts = shifts.filter(shift => {
    const matchesCity = !selectedCity || shift.area === selectedCity;
    const isAvailable = !shift.booked;
    const isBooked = shift.booked;
    const isFuture = shift.startTime > Date.now();
    
    if (activeTab === 'available') {
      return matchesCity && isAvailable && isFuture;
    } else {
      return matchesCity && isBooked;
    }
  });

  // Group shifts by date
  const groupedShifts = filteredShifts.reduce((acc: GroupedShifts, shift) => {
    const date = format(new Date(shift.startTime), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(shift);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedShifts).sort();

  // Get unique cities and their shift counts
  const cities = Array.from(new Set(shifts.map(shift => shift.area)));
  const cityCounts = cities.reduce((acc, city) => {
    acc[city] = shifts.filter(shift => 
      shift.area === city && 
      !shift.booked && 
      shift.startTime > Date.now()
    ).length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shift Management</h1>
        <p className="text-gray-600">View and manage your shifts</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('available')}
          className={`pb-3 px-4 relative transition-colors ${
            activeTab === 'available'
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Available Shifts
            {activeTab === 'available' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </div>
        </button>
        <button
          onClick={() => setActiveTab('booked')}
          className={`pb-3 px-4 relative transition-colors ${
            activeTab === 'booked'
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            My Shifts
            {activeTab === 'booked' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </div>
        </button>
      </div>

      {/* City Filter */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Filter by City</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCity(null)}
            className={`px-4 py-2 rounded-full transition-all duration-200 ${
              !selectedCity
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              All Cities
            </div>
          </button>
          {cities.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 rounded-full transition-all duration-200 ${
                selectedCity === city
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {city}
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                  {cityCounts[city]}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Shifts by Date */}
      {sortedDates.map(date => (
        <div key={date} className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </h2>
            <span className="text-sm text-gray-500">
              ({groupedShifts[date].length} {groupedShifts[date].length === 1 ? 'shift' : 'shifts'})
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedShifts[date].map((shift) => {
              const isOverlapping = shifts.some(s => 
                s.booked && 
                s.id !== shift.id && 
                ((shift.startTime <= s.startTime && shift.endTime > s.startTime) ||
                 (shift.startTime < s.endTime && shift.endTime >= s.endTime))
              );

              return (
                <div
                  key={shift.id}
                  className={`p-6 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md ${
                    shift.booked ? 'bg-green-50 border border-green-100' : 'bg-white border border-gray-100'
                  } ${isOverlapping && !shift.booked ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                        <Briefcase className="w-5 h-5 text-blue-500" />
                        {shift.position}
                      </h3>
                      <p className="text-gray-600 mt-1">{shift.department}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      shift.booked ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {shift.booked ? 'Booked' : 'Available'}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{shift.area}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>
                        {format(new Date(shift.startTime), 'h:mm a')} - {format(new Date(shift.endTime), 'h:mm a')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    {shift.booked ? (
                      <button
                        onClick={() => handleCancelShift(shift.id)}
                        disabled={loadingShiftId === shift.id}
                        className="w-full bg-red-500 text-white px-4 py-2.5 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        {loadingShiftId === shift.id ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                          </div>
                        ) : (
                          <>
                            Cancel Shift
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBookShift(shift.id)}
                        disabled={isOverlapping || loadingShiftId === shift.id}
                        className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        {loadingShiftId === shift.id ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                          </div>
                        ) : (
                          <>
                            Book Shift
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {sortedDates.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No shifts available
            </h3>
            <p className="text-gray-600">
              {activeTab === 'available'
                ? 'There are no available shifts for the selected filters.'
                : 'You have no booked shifts.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftBooking; 