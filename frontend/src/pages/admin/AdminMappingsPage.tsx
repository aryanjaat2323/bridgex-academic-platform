import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Subject, User } from '../../types';
import { Layers, UserCheck, PlusCircle, CheckCircle2 } from 'lucide-react';

export const AdminMappingsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [facultyList, setFacultyList] = useState<User[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | ''>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | ''>('');
  const [section, setSection] = useState('A');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [subs, fac] = await Promise.all([
        api.getSubjects(),
        api.getFacultyDirectory(),
      ]);
      setSubjects(subs);
      setFacultyList(fac);
      if (fac.length > 0) setSelectedFacultyId(fac[0].id);
      if (subs.length > 0) setSelectedSubjectId(subs[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacultyId || !selectedSubjectId) return;
    try {
      const res = await api.assignFacultySubject(Number(selectedFacultyId), Number(selectedSubjectId), section);
      setMessage(res.message);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Academic Course & Faculty Mappings</h1>
        <p className="text-xs text-brand-muted mt-1">
          Define routing rules mapping academic subjects to responsible faculty members by section.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mapping Form */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-brand-blue" />
            <span>Map Faculty to Course Subject</span>
          </h3>

          {message && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-navy mb-1">
                Faculty Member
              </label>
              <select
                value={selectedFacultyId}
                onChange={(e) => setSelectedFacultyId(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue bg-white font-medium"
              >
                {facultyList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.full_name} ({f.employee_id || 'Faculty'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-navy mb-1">
                Academic Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue bg-white font-medium"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-navy mb-1">
                Class Section
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="A"
                className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors shadow-sm"
            >
              Assign Faculty Routing
            </button>
          </form>
        </div>

        {/* Current Active Mappings */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-brand-border shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-blue" />
            <span>Active Course Mappings</span>
          </h3>

          <div className="divide-y divide-brand-border text-xs">
            {subjects.map((sub) => (
              <div key={sub.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-brand-navy">
                    {sub.code} — {sub.name}
                  </div>
                  <div className="text-[11px] text-brand-muted mt-0.5">
                    {sub.course_name} • Semester {sub.semester}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-brand-blue">
                    {sub.assigned_faculty_name || 'Unassigned'}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium">Auto-Routing Enabled</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
