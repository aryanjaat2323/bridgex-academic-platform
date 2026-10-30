import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { OfficeHourSlot, Appointment } from '../../types';
import {
  Calendar,
  Clock,
  PlusCircle,
  CheckCircle2,
  XCircle,
  User,
  AlertCircle
} from 'lucide-react';

export const FacultyOfficeHoursPage: React.FC = () => {
  const [slots, setSlots] = useState<OfficeHourSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Slot creation form
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState('Wednesday');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('16:00');
  const [duration, setDuration] = useState(20);
  const [submittingSlot, setSubmittingSlot] = useState(false);

  const loadData = async () => {
    try {
      const [slotList, apptList] = await Promise.all([
        api.getSlots(),
        api.getAppointments(),
      ]);
      setSlots(slotList);
      setAppointments(apptList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSlot(true);
    try {
      await api.createSlot({
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        slot_duration_minutes: Number(duration),
      });
      setIsAddSlotOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingSlot(false);
    }
  };

  const handleCancelAppointment = async (id: number) => {
    if (!window.confirm('Cancel this consultation slot?')) return;
    try {
      await api.cancelAppointment(id, 'Faculty schedule conflict');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Office Hours & Consultation Slots</h1>
          <p className="text-xs text-brand-muted mt-1">
            Configure recurring availability for student 1-on-1 consultations and manage bookings.
          </p>
        </div>

        <button
          onClick={() => setIsAddSlotOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Availability Window</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Availability Windows Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
            <h3 className="text-sm font-bold text-brand-navy mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-blue" />
              <span>Configured Recurring Slots</span>
            </h3>

            {slots.length === 0 ? (
              <div className="p-6 text-center text-xs text-brand-muted">
                No active availability windows created yet.
              </div>
            ) : (
              <div className="space-y-3">
                {slots.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl border border-brand-border bg-brand-bg flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-brand-navy">{s.day_of_week}</div>
                      <div className="text-xs text-brand-muted mt-0.5">
                        {s.start_time} - {s.end_time}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-brand-blue bg-blue-100/60 px-2 py-0.5 rounded-full">
                      {s.slot_duration_minutes}m slots
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scheduled Appointments Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
            <h3 className="text-sm font-bold text-brand-navy mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-blue" />
              <span>Upcoming Student Bookings ({appointments.length})</span>
            </h3>

            {appointments.length === 0 ? (
              <div className="p-8 text-center text-xs text-brand-muted">
                No students have booked consultation appointments yet.
              </div>
            ) : (
              <div className="divide-y divide-brand-border">
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-navy">{appt.student_name}</span>
                        <span className="text-[10px] text-brand-muted">Roll: {appt.student_roll || 'N/A'}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            appt.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {appt.status}
                        </span>
                      </div>
                      <div className="text-brand-muted mt-1 flex items-center gap-2">
                        <span>{appt.appointment_date}</span>
                        <span>•</span>
                        <span>{appt.start_time} - {appt.end_time}</span>
                      </div>
                      {appt.notes && (
                        <p className="text-[11px] text-brand-text italic mt-1 bg-brand-bg p-2 rounded border border-gray-100">
                          Topic: "{appt.notes}"
                        </p>
                      )}
                    </div>

                    {appt.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelAppointment(appt.id)}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold self-start sm:self-auto"
                      >
                        Cancel Slot
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Slot Modal */}
      {isAddSlotOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-border space-y-4">
            <h3 className="text-base font-bold text-brand-navy">Add Consultation Window</h3>
            <p className="text-xs text-brand-muted">
              Define a weekly recurring time window during which students can book consultation slots.
            </p>

            <form onSubmit={handleCreateSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-navy mb-1">
                  Day of the Week
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue bg-white"
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-navy mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-navy mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-navy mb-1">
                  Slot Duration (Minutes)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue bg-white"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={20}>20 Minutes (Recommended)</option>
                  <option value={30}>30 Minutes</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSlotOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSlot}
                  className="px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 disabled:opacity-50"
                >
                  {submittingSlot ? 'Saving...' : 'Save Availability'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
