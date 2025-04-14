import React from 'react';
import { format, isFuture, parseISO } from 'date-fns';
import { Calendar, MapPin, Loader2 } from 'lucide-react';
import { Shift, checkShiftOverlap } from '../lib/mockData';

interface ShiftListProps {
  shifts: Shift[];
  onBook: (shiftId: string) => void;
  onCancel: (shiftId: string) => void;
  isBooked?: boolean;
  loadingShiftId?: string | null;
  bookedShifts?: Shift[];
}

export function ShiftList({ 
  shifts, 
  onBook, 
  onCancel, 
  isBooked = false,
  loadingShiftId = null,
  bookedShifts = []
}: ShiftListProps) {
  const futureShifts = shifts.filter(shift => isFuture(parseISO(shift.date)));
  
  const groupedShifts = futureShifts.reduce((acc, shift) => {
    const date = shift.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(shift);
    return acc;
  }, {} as Record<string, Shift[]>);

  const isOverlapping = (shift: Shift): boolean => {
    return bookedShifts.some(bookedShift => checkShiftOverlap(shift, bookedShift));
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedShifts).map(([date, dateShifts]) => (
        <div key={date} className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#CBD2E1]">
          <div className="bg-[#F1F4F8] px-4 py-3 border-b border-[#CBD2E1] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#4F6C92]" />
            <h3 className="font-medium text-[#4F6C92]">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </h3>
          </div>
          <div className="divide-y divide-[#CBD2E1]">
            {dateShifts.map((shift) => {
              const isDisabled = !isBooked && isOverlapping(shift);
              const isLoading = loadingShiftId === shift.id;

              return (
                <div 
                  key={shift.id} 
                  className={`p-4 flex items-center justify-between transition-colors ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#F7F8FB]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 text-sm text-[#A4B8D3] mb-1">
                      <MapPin className="w-4 h-4" />
                      <span>{shift.city.name}</span>
                    </div>
                    <div className="font-medium text-[#4F6C92]">
                      {format(new Date(`2000-01-01T${shift.startTime}`), 'h:mm a')} - 
                      {format(new Date(`2000-01-01T${shift.endTime}`), 'h:mm a')}
                    </div>
                  </div>
                  <div>
                    {isBooked ? (
                      <button
                        onClick={() => onCancel(shift.id)}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-[#FE93B3] hover:text-white bg-[#EED2DF] hover:bg-[#FE93B3] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          'Cancel Shift'
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => onBook(shift.id)}
                        disabled={isDisabled || isLoading}
                        className="px-4 py-2 text-sm font-medium text-[#16A64D] hover:text-white bg-[#CAEFD8] hover:bg-[#55CB82] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Booking...
                          </>
                        ) : (
                          'Book Shift'
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
    </div>
  );
}