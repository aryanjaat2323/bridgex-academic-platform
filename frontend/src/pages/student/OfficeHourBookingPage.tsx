import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User, OfficeHourSlot, Appointment } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCheck
} from 'lucide-react';

export const OfficeHourBookingPage: React.FC = () => {
  const [facultyList, setFacultyList] = useState<User[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | ''>('');
  const [slots, setSlots] = useState<OfficeHourSlot[]>([]);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking modal
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [targetSlot, setTargetSlot] = useState<OfficeHourSlot | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const loadData = async () => {
    try {
      const [fac, appts] = await Promise.all([
        api.getFacultyDirectory(),
        api.getAppointments(),
      ]);
      setFacultyList(fac);
      setMyAppointments(appts);
      if (fac.length > 0) {
        setSelectedFacultyId(fac[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedFacultyId) return;
      try {
        const data = await api.getSlots(Number(selectedFacultyId));
        setSlots(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSlots();
  }, [selectedFacultyId]);

  const handleOpenBooking = (slot: OfficeHourSlot) => {
    setTargetSlot(slot);
    setStartTime(slot.start_time);
    
    // Default end time + 20 minutes
    const [h, m] = slot.start_time.split(':').map(Number);
    const endMinutes = m + slot.slot_duration_minutes;
    const endH = h + Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const endStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    setEndTime(endStr);

    // Default next day
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setAppointmentDate(tomorrow.toISOString().split('T')[0]);

    setBookingError(null);
    setIsBookingOpen(true);
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSlot) return;
    setBookingError(null);
    setSubmittingBooking(true);

    try {
      await api.bookAppointment({
        faculty_id: targetSlot.faculty_id,
        slot_id: targetSlot.id,
        appointment_date: appointmentDate,
        start_time: startTime,
        end_time: endTime,
        notes,
      });
      setIsBookingOpen(false);
      setNotes('');
      await loadData();
    } catch (err: any) {
      setBookingError(err.response?.data?.detail || 'Failed to book slot.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleCancelAppointment = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this consultation?')) return;
    try {
      await api.cancelAppointment(id, 'Student cancelled');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const selectedFaculty = facultyList.find((f) => f.id === Number(selectedFacultyId));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Faculty Consultation Slots</h1>
        <p className="text-xs text-brand-muted mt-1">
          Book dedicated 1-on-1 office hours for in-depth conceptual doubt discussion.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Faculty Directory & Availability */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
            <label className="block text-xs font-bold text-brand-navy mb-2">
              Select Professor / Instructor
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              {facultyList.map((faculty) => (
                <div
                  key={faculty.id}
                  onClick={() => setSelectedFacultyId(faculty.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    selectedFacultyId === faculty.id
                      ? 'border-brand-blue bg-brand-blue-light/50 ring-1 ring-brand-blue'
                      : 'border-brand-border hover:bg-brand-bg'
                  }`}
                >
                  <img
                    src={faculty.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=F'}
                    alt={faculty.full_name}
                    className="w-10 h-10 rounded-full border border-brand-border bg-white"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-brand-navy">{faculty.full_name}</h4>
                    <p className="text-[11px] text-brand-muted">{faculty.department_name}</p>
                    <div className="flex items-center gap-1 text-[10px] text-brand-blue mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{faculty.office_room || 'Faculty Block'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slots Available */}
          <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-brand-navy flex items-center justify-between">
              <span>Weekly Availability: {selectedFaculty?.full_name}</span>
              <span className="text-xs text-brand-blue font-normal">
                {slots.length} recurring slot{slots.length === 1 ? '' : 's'}
              </span>
            </h3>

            {slots.length === 0 ? (
              <div className="p-8 text-center text-xs text-brand-muted">
                No active consultation slots configured for this faculty member yet.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-4 rounded-xl border border-brand-border hover:border-brand-blue transition-all bg-brand-bg flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-brand-navy">
                        <span>{slot.day_of_week}</span>
                        <span className="text-brand-blue text-[11px]">
                          {slot.slot_duration_minutes} min slots
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-brand-text font-medium">
                        <Clock className="w-3.5 h-3.5 text-brand-muted" />
                        <span>{slot.start_time} - {slot.end_time}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenBooking(slot)}
                      className="mt-4 w-full py-2 rounded-lg bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors shadow-sm"
                    >
                      Book Consultation
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Student's Booked Appointments */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
            <h3 className="text-sm font-bold text-brand-navy mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-blue" />
              <span>My Scheduled Consultations</span>
            </h3>

            {myAppointments.length === 0 ? (
              <div className="p-6 text-center text-xs text-brand-muted">
                You have no upcoming office hour appointments.
              </div>
            ) : (
              <div className="space-y-3">
                {myAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-3.5 rounded-xl border border-brand-border bg-brand-bg text-left space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-navy">
                        {appt.faculty_name}
                      </span>
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

                    <div className="text-xs text-brand-muted flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-brand-blue" />
                      <span>{appt.appointment_date}</span>
                      <span>•</span>
                      <span>{appt.start_time} - {appt.end_time}</span>
                    </div>

                    {appt.faculty_office && (
                      <div className="text-[11px] text-brand-muted flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-brand-muted" />
                        <span>{appt.faculty_office}</span>
                      </div>
                    )}

                    {appt.notes && (
                      <p className="text-[11px] text-brand-text italic bg-white p-2 rounded border border-gray-100">
                        "{appt.notes}"
                      </p>
                    )}

                    {appt.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelAppointment(appt.id)}
                        className="text-[11px] text-red-600 font-semibold hover:underline mt-1"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingOpen && targetSlot && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-border space-y-4">
            <h3 className="text-base font-bold text-brand-navy">
              Book Office Hour with {selectedFaculty?.full_name}
            </h3>
            <p className="text-xs text-brand-muted">
              Select date and consultation time window. The server prevents double bookings automatically.
            </p>

            {bookingError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-navy mb-1">
                  Appointment Date
                </label>
                <input
                  type="date"
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue"
                />
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
                  Topic & Notes for Professor
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Reviewing AVL tree double rotation proof..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBooking}
                  className="px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 disabled:opacity-50"
                >
                  {submittingBooking ? 'Confirming...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
