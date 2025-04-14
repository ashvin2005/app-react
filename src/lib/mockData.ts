import { addDays, isFuture, startOfToday } from 'date-fns';

export interface City {
  id: string;
  name: string;
}

export interface Shift {
  id: string;
  cityId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked';
  bookedBy?: string;
  city: {
    name: string;
  };
}

export const cities: City[] = [
  { id: '1', name: 'New York' },
  { id: '2', name: 'Los Angeles' },
  { id: '3', name: 'Chicago' },
  { id: '4', name: 'Houston' },
];

const today = startOfToday();
const tomorrow = addDays(today, 1);
const dayAfterTomorrow = addDays(today, 2);

export const initialShifts: Shift[] = [
  {
    id: '1',
    cityId: '1',
    date: today.toISOString().split('T')[0],
    startTime: '09:00:00',
    endTime: '17:00:00',
    status: 'available',
    city: { name: 'New York' }
  },
  {
    id: '2',
    cityId: '2',
    date: tomorrow.toISOString().split('T')[0],
    startTime: '10:00:00',
    endTime: '18:00:00',
    status: 'available',
    city: { name: 'Los Angeles' }
  },
  {
    id: '3',
    cityId: '3',
    date: tomorrow.toISOString().split('T')[0],
    startTime: '08:00:00',
    endTime: '16:00:00',
    status: 'available',
    city: { name: 'Chicago' }
  },
  {
    id: '4',
    cityId: '4',
    date: dayAfterTomorrow.toISOString().split('T')[0],
    startTime: '11:00:00',
    endTime: '19:00:00',
    status: 'available',
    city: { name: 'Houston' }
  },
];

export function checkShiftOverlap(shift1: Shift, shift2: Shift): boolean {
  if (shift1.date !== shift2.date) return false;
  
  const start1 = new Date(`2000-01-01T${shift1.startTime}`);
  const end1 = new Date(`2000-01-01T${shift1.endTime}`);
  const start2 = new Date(`2000-01-01T${shift2.startTime}`);
  const end2 = new Date(`2000-01-01T${shift2.endTime}`);

  return start1 < end2 && end1 > start2;
}