import React, { useState } from 'react';
import { ShiftList } from './components/ShiftList';
import { CityFilter } from './components/CityFilter';
import { Briefcase, Calendar, User } from 'lucide-react';
import { cities, initialShifts, Shift } from './lib/mockData';
import ShiftBooking from './components/ShiftBooking'

const MOCK_USER_ID = 'user-1';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Hospital Shift Management System</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <ShiftBooking />
        </div>
      </main>
    </div>
  )
}

export default App;