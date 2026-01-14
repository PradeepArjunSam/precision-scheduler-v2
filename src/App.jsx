import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Search,
  Plus,
  X,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AnimatePresence, motion } from 'framer-motion';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const useStore = () => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('precision_scheduler_v2');
    return saved ? JSON.parse(saved) : {
      lecturers: [],
      sessions: [],
      rooms: ['Room 101', 'Room 102', 'Room 103'],
      subjects: ['Software Engineering', 'Algorithms', 'Database Management', 'Networking'],
      groups: ['MCA', 'BCA', 'BCS', 'MSc Data Science']
    };
  });

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    localStorage.setItem('precision_scheduler_v2', JSON.stringify(data));
  }, [data]);

  // Admin Actions
  const addProgram = (name) => setData(prev => ({ ...prev, groups: [...prev.groups, name] }));
  const removeProgram = (name) => setData(prev => ({
    ...prev,
    groups: prev.groups.filter(g => g !== name),
    sessions: prev.sessions.filter(s => s.class !== name)
  }));

  const addRoom = (name) => setData(prev => ({ ...prev, rooms: [...prev.rooms, name] }));
  const removeRoom = (name) => setData(prev => ({
    ...prev,
    rooms: prev.rooms.filter(r => r !== name),
    sessions: prev.sessions.filter(s => s.room !== name)
  }));

  const addSubject = (name) => setData(prev => ({ ...prev, subjects: [...prev.subjects, name] }));
  const removeSubject = (name) => setData(prev => ({
    ...prev,
    subjects: prev.subjects.filter(s => s !== name),
    sessions: prev.sessions.filter(s => s.subject !== name)
  }));

  const removeLecturer = (id) => setData(prev => ({
    ...prev,
    lecturers: prev.lecturers.filter(l => l.id !== id),
    sessions: prev.sessions.filter(s => s.lecturerId !== id)
  }));

  const addLecturer = (lec) => setData(prev => ({
    ...prev,
    lecturers: [...prev.lecturers, { ...lec, id: Date.now().toString() }]
  }));

  const addSession = (sess) => {
    // Conflict Detection with Time Ranges
    const conflict = data.sessions.find(s =>
      s.day === sess.day && (
        // Time Overlap Logic: (start1 < end2) AND (start2 < end1)
        (sess.startTime < s.endTime && s.startTime < sess.endTime) && (
          s.lecturerId === sess.lecturerId ||
          s.room === sess.room ||
          s.class === sess.class
        )
      )
    );

    if (conflict) {
      if (conflict.lecturerId === sess.lecturerId) throw new Error(`Lecturer already has a class: ${conflict.startTime}-${conflict.endTime}`);
      if (conflict.room === sess.room) throw new Error(`Room is occupied by ${conflict.class}: ${conflict.startTime}-${conflict.endTime}`);
      if (conflict.class === sess.class) throw new Error(`This program already has a session: ${conflict.startTime}-${conflict.endTime}`);
    }

    setData(prev => ({
      ...prev,
      sessions: [...prev.sessions, { ...sess, id: Date.now().toString() }]
    }));
  };

  const removeSession = (id) => setData(prev => ({
    ...prev,
    sessions: prev.sessions.filter(s => s.id !== id)
  }));

  const authenticate = (pass) => {
    if (pass === 'admin123') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsAdmin(false);

  return {
    data,
    isAdmin,
    authenticate,
    logout,
    addLecturer,
    removeLecturer,
    addSession,
    removeSession,
    addProgram,
    removeProgram,
    addRoom,
    removeRoom,
    addSubject,
    removeSubject
  };
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const store = useStore();

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.remove('light');
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'lecturers', label: 'Lecturers', icon: Users },
    { id: 'sessions', label: 'Schedules', icon: Calendar },
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
  ];

  return (
    <div className="flex h-screen bg-antigravity-bg text-antigravity-text overflow-hidden">
      <aside className="w-64 glass flex flex-col p-4 border-r border-antigravity-border shrink-0">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 bg-antigravity-accent rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-antigravity-accent/40 transition-transform hover:scale-110 cursor-pointer">P</div>
          <span className="text-xl font-bold tracking-tight">PRECISION</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                activeTab === item.id
                  ? "bg-antigravity-accent text-white shadow-xl shadow-antigravity-accent/20"
                  : "text-antigravity-muted hover:text-antigravity-text hover:bg-antigravity-border/50"
              )}
            >
              <item.icon size={20} />
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-antigravity-border/50 px-2 space-y-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-antigravity-muted hover:text-antigravity-text hover:bg-antigravity-border/50 transition-all"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-semibold text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-antigravity-muted hover:text-antigravity-text hover:bg-antigravity-border/50 transition-all group">
            <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="font-medium text-sm">Settings</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 border-b border-antigravity-border flex items-center justify-between px-8 bg-antigravity-bg/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 bg-antigravity-border/30 px-4 py-2 rounded-xl border border-antigravity-border/50 w-96 backdrop-blur-sm">
            <Search size={18} className="text-antigravity-muted" />
            <input
              type="text"
              placeholder="Search schedules, teachers..."
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-antigravity-muted/50"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {['BS', 'VJ', 'SH'].map(init => (
                <div key={init} className="w-8 h-8 rounded-full border-2 border-antigravity-bg bg-antigravity-border flex items-center justify-center text-[10px] font-bold text-antigravity-accent">
                  {init}
                </div>
              ))}
            </div>
            <button className="btn-primary flex items-center gap-2 group">
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              <span className="text-sm font-bold">New Task</span>
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {activeTab === 'dashboard' && <Dashboard store={store} setActiveTab={setActiveTab} />}
            {activeTab === 'lecturers' && <LecturersView store={store} />}
            {activeTab === 'sessions' && <SessionsView store={store} />}
            {activeTab === 'admin' && <AdminView store={store} />}
          </div>
        </section>
      </main>
    </div>
  );
}

function Dashboard({ store, setActiveTab }) {
  const { data } = store;
  const stats = [
    { label: 'Active Teachers', value: data.lecturers.length, icon: Users, color: 'text-blue-500' },
    { label: 'Classes Today', value: data.sessions.filter(s => s.day === 'Mon').length, icon: Calendar, color: 'text-indigo-500' },
    { label: 'Conflicts Caught', value: 0, icon: ShieldCheck, color: 'text-emerald-500' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Welcome Back</h1>
        <p className="text-antigravity-muted font-medium">Department of Computer Science Scheduling Hub</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="card group hover:scale-[1.02] cursor-default bg-antigravity-card">
            <div className="flex items-center gap-4">
              <div className={cn("w-14 h-14 rounded-2xl bg-antigravity-accent/10 flex items-center justify-center transition-colors group-hover:bg-antigravity-accent/20", stat.color)}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-sm text-antigravity-muted font-bold tracking-wide uppercase">{stat.label}</p>
                <p className="text-3xl font-extrabold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card glass relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-antigravity-accent/10 blur-3xl -mr-16 -mt-16 group-hover:bg-antigravity-accent/20 transition-all duration-700" />
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-antigravity-accent animate-pulse" />
            Live Class Aggregates
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {data.groups.map(g => (
              <button
                key={g}
                onClick={() => setActiveTab('sessions')}
                className="card flex flex-col items-center gap-2 p-4 hover:border-antigravity-accent group/btn bg-antigravity-card/50"
              >
                <span className="text-xl font-bold group-hover/btn:text-antigravity-accent transition-colors">{g}</span>
                <span className="text-[8px] uppercase tracking-widest text-antigravity-muted font-bold">
                  {data.sessions.filter(s => s.class === g).length} Sessions
                </span>
              </button>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-antigravity-bg/50 border border-antigravity-border text-sm text-antigravity-muted leading-relaxed font-medium">
            Click a program to view the automatically aggregated timetable across all teachers.
          </div>
        </div>

        <div className="card bg-antigravity-card">
          <h3 className="text-xl font-bold mb-6">Recent Records</h3>
          <div className="space-y-4">
            {data.lecturers.slice(-3).reverse().map((lec, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-antigravity-bg/50 transition-colors border border-transparent hover:border-antigravity-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-antigravity-border flex items-center justify-center font-bold text-antigravity-muted">
                    {lec.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm tracking-tight">{lec.name}</p>
                    <p className="text-[10px] text-antigravity-muted font-bold uppercase tracking-wider">{lec.classes.join(', ')}</p>
                  </div>
                </div>
                <div className="px-2 py-1 rounded-md bg-green-500/10 text-green-500 text-[10px] font-bold">ENROLLED</div>
              </div>
            ))}
            {data.lecturers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-antigravity-muted/40">
                <Users size={48} strokeWidth={1} />
                <p className="mt-4 text-sm font-medium">No lecturer profiles found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function LecturersView({ store }) {
  const { data, addLecturer, removeLecturer, isAdmin } = store;
  const [name, setName] = useState('');
  const [classes, setClasses] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !classes) return;
    addLecturer({ name, classes: classes.split(',').map(c => c.trim()) });
    setName('');
    setClasses('');
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this lecturer and all their schedules?")) {
      removeLecturer(id);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
      <div className="flex items-end justify-between">
        <h2 className="text-4xl font-extrabold tracking-tight">Lecturers Hub</h2>
        <div className="text-antigravity-muted text-sm font-bold uppercase tracking-widest">Total: {data.lecturers.length}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 sticky top-8">
          <form onSubmit={handleSubmit} className="card glass space-y-5 p-6 shadow-2xl shadow-antigravity-accent/10">
            <h3 className="text-xl font-bold mb-2">Quick Enroll</h3>
            <div className="space-y-4">
              <div className="group">
                <label className="block text-xs font-bold text-antigravity-muted uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-antigravity-bg border border-antigravity-border rounded-xl px-4 py-3 focus:border-antigravity-accent outline-none transition-all placeholder:text-antigravity-muted/30 text-antigravity-text"
                  placeholder="Dr. Shaila..."
                />
              </div>
              <div className="group">
                <label className="block text-xs font-bold text-antigravity-muted uppercase tracking-widest mb-1.5 ml-1">Assigned Programs</label>
                <input
                  value={classes}
                  onChange={e => setClasses(e.target.value)}
                  className="w-full bg-antigravity-bg border border-antigravity-border rounded-xl px-4 py-3 focus:border-antigravity-accent outline-none transition-all placeholder:text-antigravity-muted/30 text-antigravity-text"
                  placeholder="MCA, BCA, BCS"
                />
              </div>
            </div>
            <button className="btn-primary w-full py-4 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-antigravity-accent/20 active:scale-95">
              <Plus size={18} />
              Add Lecturer
            </button>
          </form>
        </div>

        <div className="lg:col-span-8 overflow-hidden rounded-2xl border border-antigravity-border bg-antigravity-card">
          <div className="p-4 flex items-center justify-between px-6 border-b border-antigravity-border bg-antigravity-bg/50">
            <span className="text-xs font-bold uppercase tracking-widest text-antigravity-muted">Active Staff Records</span>
            <Search size={14} className="text-antigravity-muted" />
          </div>
          <div className="overflow-x-auto min-h-[500px]">
            <table className="w-full text-left">
              <thead>
                <tr className="text-antigravity-muted/60 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-antigravity-border/30">
                  <th className="p-6">Lecturer Profile</th>
                  <th className="p-6">Program Assignment</th>
                  <th className="p-6">Status</th>
                  {isAdmin && <th className="p-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-antigravity-border/30">
                {data.lecturers.map((lec) => (
                  <tr key={lec.id} className="hover:bg-antigravity-bg/50 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-antigravity-accent/10 flex items-center justify-center font-bold text-antigravity-accent border border-antigravity-accent/20 group-hover:scale-110 transition-transform">
                          {lec.name[0]}
                        </div>
                        <span className="font-bold tracking-tight">{lec.name}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-wrap gap-2">
                        {lec.classes.map(c => (
                          <span key={c} className="bg-antigravity-bg border border-antigravity-border px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider text-antigravity-text/80">{c}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="px-3 py-1.5 rounded-full inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        READY
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="p-6 text-right">
                        <button
                          onClick={() => handleDelete(lec.id)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AdminView({ store }) {
  const {
    data, isAdmin, authenticate, logout,
    addProgram, removeProgram,
    addRoom, removeRoom,
    addSubject, removeSubject
  } = store;

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [inputValue, setInputValue] = useState({ type: '', value: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    if (authenticate(password)) {
      setError('');
    } else {
      setError('Invalid Admin Credentials');
    }
  };

  const handleAdd = (type, value) => {
    if (!value) return;
    if (type === 'program') addProgram(value);
    if (type === 'room') addRoom(value);
    if (type === 'subject') addSubject(value);
    setInputValue({ type: '', value: '' });
  };

  if (!isAdmin) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card glass w-full max-w-sm p-8 text-center"
        >
          <div className="w-20 h-20 bg-antigravity-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-antigravity-accent">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Admin Access</h2>
          <p className="text-antigravity-muted text-sm mb-6 font-medium">Please enter the security pass to continue</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-antigravity-bg border border-antigravity-border rounded-xl px-4 py-3 outline-none focus:border-antigravity-accent transition-all text-center tracking-[0.5em] font-bold text-antigravity-text"
              placeholder="••••••••"
            />
            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
            <button className="btn-primary w-full py-4">Authenticate</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-extrabold tracking-tight">Admin Control</h2>
        <button onClick={logout} className="text-antigravity-muted hover:text-red-500 transition-colors text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          Logout Session <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: 'Programs', data: data.groups, type: 'program', icon: LayoutDashboard },
          { title: 'Rooms', data: data.rooms, type: 'room', icon: ShieldCheck },
          { title: 'Subjects', data: data.subjects, type: 'subject', icon: Settings },
        ].map((sect) => (
          <div key={sect.title} className="card bg-antigravity-card flex flex-col min-h-[400px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-antigravity-accent/10 text-antigravity-accent flex items-center justify-center">
                <sect.icon size={20} />
              </div>
              <h3 className="font-bold text-xl">{sect.title}</h3>
            </div>

            <div className="flex-1 space-y-2 mb-6 overflow-y-auto pr-2">
              {sect.data.map((item) => (
                <div key={item} className="flex items-center justify-between p-3 rounded-xl bg-antigravity-bg/50 border border-antigravity-border group/item">
                  <span className="font-bold text-sm">{item}</span>
                  <button
                    onClick={() => {
                      if (sect.type === 'program') removeProgram(item);
                      if (sect.type === 'room') removeRoom(item);
                      if (sect.type === 'subject') removeSubject(item);
                    }}
                    className="opacity-0 group-hover/item:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-auto space-y-2">
              <input
                value={inputValue.type === sect.type ? inputValue.value : ''}
                onChange={(e) => setInputValue({ type: sect.type, value: e.target.value })}
                className="w-full bg-antigravity-bg border border-antigravity-border rounded-xl px-4 py-2 text-sm focus:border-antigravity-accent outline-none text-antigravity-text"
                placeholder={`New ${sect.title.slice(0, -1)}...`}
              />
              <button
                onClick={() => handleAdd(sect.type, inputValue.type === sect.type ? inputValue.value : '')}
                className="w-full py-2 bg-antigravity-border hover:bg-antigravity-accent hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
              >
                Add {sect.title.slice(0, -1)}
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SessionsView({ store }) {
  const { data, addSession, removeSession, isAdmin } = store;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [filter, setFilter] = useState('All Programs');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    lecturerId: '',
    class: 'MCA',
    subject: data.subjects[0],
    room: data.rooms[0],
    startTime: '09:00',
    endTime: '10:00'
  });

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const times = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleSlotClick = (day, time) => {
    const nextHour = (parseInt(time.split(':')[0]) + 1).toString().padStart(2, '0') + ':00';
    setSelectedSlot({ day });
    setFormData(prev => ({ ...prev, startTime: time, endTime: nextHour }));
    setIsModalOpen(true);
    setError('');
  };

  const handleAdd = (e) => {
    e.preventDefault();
    try {
      if (!formData.lecturerId) throw new Error("Please select a lecturer");
      addSession({
        ...formData,
        day: selectedSlot.day,
        time: selectedSlot.time
      });
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-extrabold tracking-tight">Schedule Hub</h2>
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-antigravity-card border border-antigravity-border rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-antigravity-accent text-antigravity-text"
          >
            <option>All Programs</option>
            {data.groups.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-0 glass overflow-hidden border-antigravity-border shadow-2xl bg-antigravity-card/20">
        <div className="grid grid-cols-6 border-b border-antigravity-border bg-antigravity-border/20">
          <div className="p-6 border-r border-antigravity-border font-bold text-[10px] uppercase tracking-[0.2em] text-antigravity-muted text-center">Time</div>
          {days.map(day => (
            <div key={day} className="p-6 border-r border-antigravity-border font-extrabold text-sm tracking-widest text-center last:border-0">{day}</div>
          ))}
        </div>

        {times.slice(0, -1).map((time, idx) => (
          <div key={time} className="grid grid-cols-6 border-b border-antigravity-border last:border-0 group/row">
            <div className="p-6 border-r border-antigravity-border text-xs font-mono font-bold text-antigravity-muted flex items-center justify-center bg-antigravity-border/10">
              {time}
            </div>
            {days.map(day => {
              // Aggregate logic: filter by program OR show all if "All Programs"
              const sessions = data.sessions.filter(s =>
                s.day === day &&
                s.startTime === time &&
                (filter === 'All Programs' || s.class === filter)
              );

              return (
                <div
                  key={day}
                  onClick={() => sessions.length === 0 && handleSlotClick(day, time)}
                  className={cn(
                    "p-2 border-r border-antigravity-border last:border-0 min-h-[140px] transition-all relative group flex flex-col gap-2",
                    sessions.length === 0 && "hover:bg-antigravity-accent/[0.04] cursor-pointer"
                  )}
                >
                  {sessions.map(session => {
                    const lec = data.lecturers.find(l => l.id === session.lecturerId);
                    const durationInHours = parseInt(session.endTime.split(':')[0]) - parseInt(session.startTime.split(':')[0]);

                    return (
                      <motion.div
                        key={session.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={cn(
                          "bg-antigravity-bg border border-antigravity-border rounded-xl p-3 shadow-lg relative group/item z-10",
                          durationInHours > 1 && "absolute left-2 right-2 top-2",
                          "hover:border-antigravity-accent/50 transition-colors"
                        )}
                        style={{
                          height: durationInHours > 1 ? `calc(${durationInHours * 100}% + ${(durationInHours - 1) * 1}px)` : '100%',
                          minHeight: '120px'
                        }}
                      >
                        {isAdmin && (
                          <button
                            onClick={(e) => { e.stopPropagation(); removeSession(session.id); }}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity active:scale-90 z-20"
                          >
                            <X size={12} />
                          </button>
                        )}
                        <div className="text-[10px] font-bold text-antigravity-accent mb-1 flex justify-between items-center capitalize">
                          <span>{session.class}</span>
                          <span className="opacity-50">{session.room}</span>
                        </div>
                        <div className="text-xs font-bold leading-tight mb-2 line-clamp-2">{session.subject}</div>
                        <div className="mt-auto flex justify-between items-end">
                          <div className="text-[9px] text-antigravity-muted font-extrabold truncate uppercase tracking-tighter">DR. {lec?.name.toUpperCase()}</div>
                          <div className="text-[8px] font-mono opacity-40">{session.startTime}-{session.endTime}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                  {sessions.length === 0 && (
                    <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-antigravity-accent flex items-center justify-center shadow-2xl shadow-antigravity-accent/50 group-active:scale-90 transition-transform">
                        <Plus size={16} className="text-white" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="card glass w-full max-w-md p-8 relative z-10 shadow-[0_0_50px_rgba(0,102,255,0.2)] bg-antigravity-card"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold tracking-tight">New Session</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-antigravity-muted">{selectedSlot?.day}</span>
              </div>

              <form onSubmit={handleAdd} className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-bold">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-antigravity-muted uppercase tracking-widest mb-1.5">Start Time</label>
                      <select
                        className="w-full bg-antigravity-bg border border-antigravity-border rounded-xl px-4 py-3 outline-none focus:border-antigravity-accent text-antigravity-text"
                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                        value={formData.startTime}
                      >
                        {times.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-antigravity-muted uppercase tracking-widest mb-1.5">End Time</label>
                      <select
                        className="w-full bg-antigravity-bg border border-antigravity-border rounded-xl px-4 py-3 outline-none focus:border-antigravity-accent text-antigravity-text"
                        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                        value={formData.endTime}
                      >
                        {times.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-antigravity-muted uppercase tracking-widest mb-1.5">Lecturer</label>
                    <select
                      className="w-full bg-antigravity-bg border border-antigravity-border rounded-xl px-4 py-3 outline-none focus:border-antigravity-accent text-antigravity-text"
                      onChange={e => setFormData({ ...formData, lecturerId: e.target.value })}
                      value={formData.lecturerId}
                    >
                      <option value="">Select a Teacher</option>
                      {data.lecturers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-antigravity-muted uppercase tracking-widest mb-1.5">Program</label>
                      <select
                        className="w-full bg-antigravity-bg border border-antigravity-border rounded-xl px-4 py-3 outline-none focus:border-antigravity-accent text-antigravity-text"
                        onChange={e => setFormData({ ...formData, class: e.target.value })}
                        value={formData.class}
                      >
                        {data.groups.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-antigravity-muted uppercase tracking-widest mb-1.5">Subject</label>
                      <select
                        className="w-full bg-antigravity-bg border border-antigravity-border rounded-xl px-4 py-3 outline-none focus:border-antigravity-accent text-antigravity-text"
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        value={formData.subject}
                      >
                        {data.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-antigravity-muted uppercase tracking-widest mb-1.5">Room Assignment</label>
                    <select
                      className="w-full bg-antigravity-bg border border-antigravity-border rounded-xl px-4 py-3 outline-none focus:border-antigravity-accent text-antigravity-text"
                      onChange={e => setFormData({ ...formData, room: e.target.value })}
                      value={formData.room}
                    >
                      {data.rooms.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-antigravity-border hover:bg-antigravity-muted/20 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 btn-primary py-4 font-bold uppercase tracking-widest text-xs">Save Session</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
