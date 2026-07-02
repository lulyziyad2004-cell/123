import React, { useState, useEffect } from 'react';
import { Role, Session, Invoice, Notification, Lawyer, Tenant, UserSession } from './types';
import { 
  INITIAL_LAWYERS, 
  INITIAL_TENANTS, 
  INITIAL_SESSIONS, 
  INITIAL_INVOICES, 
  INITIAL_NOTIFICATIONS,
  DEMO_LAWYERS,
  DEMO_TENANTS,
  DEMO_SESSIONS,
  DEMO_INVOICES,
  DEMO_NOTIFICATIONS
} from './data';
import AdminDashboard from './components/AdminDashboard';
import LawyerDashboard from './components/LawyerDashboard';
import TenantDashboard from './components/TenantDashboard';
import Login from './components/Login';
import { 
  Scale, 
  ShieldCheck, 
  User, 
  Bell, 
  Clock, 
  HelpCircle, 
  ChevronDown, 
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  LogOut
} from 'lucide-react';

export default function App() {
  // Global States loaded from LocalStorage or seed data
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('nazaha_sessions');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.filter((s: any) => {
      if (s.id === 'S1' || s.lawyerId === 'L1' || s.lawyerId === 'L2' || s.tenantId === 'T1' || s.tenantId === 'T2') return false;
      const cleanTitle = (s.caseTitle || '').replace(/\s+/g, '');
      const cleanPlaintiff = (s.plaintiff || '').replace(/\s+/g, '');
      const cleanDefendant = (s.defendant || '').replace(/\s+/g, '');
      if (cleanTitle.includes('محمداحمد') || cleanTitle.includes('محمدأحمد')) return false;
      if (cleanPlaintiff.includes('محمداحمد') || cleanPlaintiff.includes('محمدأحمد')) return false;
      if (cleanDefendant.includes('محمداحمد') || cleanDefendant.includes('محمدأحمد')) return false;
      return true;
    });
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('nazaha_invoices');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.filter((i: any) => {
      if (i.id === 'INV-4011' || i.tenantId === 'T1' || i.tenantId === 'T2') return false;
      const cleanName = (i.tenantName || '').replace(/\s+/g, '');
      if (cleanName.includes('محمداحمد') || cleanName.includes('محمدأحمد')) return false;
      return true;
    });
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('nazaha_notifications');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.filter((n: any) => n.id !== 'N1');
  });

  const [lawyers, setLawyers] = useState<Lawyer[]>(() => {
    const saved = localStorage.getItem('asal_lawyers');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.filter((l: any) => {
      if (l.id === 'L1' || l.id === 'L2') return false;
      const cleanName = (l.name || '').replace(/\s+/g, '');
      if (cleanName.includes('محمداحمد') || cleanName.includes('محمدأحمد')) return false;
      return true;
    });
  });

  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('asal_tenants');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.filter((t: any) => {
      if (t.id === 'T1' || t.id === 'T2') return false;
      const cleanName = (t.name || '').replace(/\s+/g, '');
      if (cleanName.includes('محمداحمد') || cleanName.includes('محمدأحمد')) return false;
      return true;
    });
  });

  // Logged-in user session state
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('asal_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Active role state for backward compatibility/simulators
  const [currentRole, setCurrentRole] = useState<Role>('admin');

  // Simulated active accounts for central role selection
  const [selectedSimulatedTenantId, setSelectedSimulatedTenantId] = useState<string>('');
  const [selectedSimulatedLawyerId, setSelectedSimulatedLawyerId] = useState<string>('');

  // Interactive guide visibility
  const [showGuide, setShowGuide] = useState(false);

  // Real-time Toast Notification overlay state
  const [activeToast, setActiveToast] = useState<{ id: string; title: string; message: string; type: string } | null>(null);

  // Sound effects status (simulated/visual cue)
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Save states to local storage on changes
  useEffect(() => {
    localStorage.setItem('nazaha_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('nazaha_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('nazaha_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('asal_lawyers', JSON.stringify(lawyers));
  }, [lawyers]);

  useEffect(() => {
    localStorage.setItem('asal_tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    if (userSession) {
      localStorage.setItem('asal_session', JSON.stringify(userSession));
    } else {
      localStorage.removeItem('asal_session');
    }
  }, [userSession]);

  // Handle adding a lawyer
  const handleAddLawyer = (newLawyerData: Omit<Lawyer, 'id'>) => {
    const newLawyer: Lawyer = {
      ...newLawyerData,
      id: `L-${Date.now().toString().slice(-4)}`
    };
    setLawyers(prev => [...prev, newLawyer]);
  };

  // Handle deleting a lawyer
  const handleDeleteLawyer = (id: string) => {
    setLawyers(prev => prev.filter(l => l.id !== id));
  };

  // Handle adding a tenant
  const handleAddTenant = (newTenantData: Omit<Tenant, 'id'>) => {
    const newTenant: Tenant = {
      ...newTenantData,
      id: `T-${Date.now().toString().slice(-4)}`
    };
    setTenants(prev => [...prev, newTenant]);
  };

  // Handle deleting a tenant
  const handleDeleteTenant = (id: string) => {
    setTenants(prev => prev.filter(t => t.id !== id));
  };

  // Load complete pre-configured Demo Data
  const handleLoadDemoData = () => {
    setLawyers(DEMO_LAWYERS);
    setTenants(DEMO_TENANTS);
    setSessions(DEMO_SESSIONS);
    setInvoices(DEMO_INVOICES);
    setNotifications(DEMO_NOTIFICATIONS);
  };

  // Handle adding a session
  const handleAddSession = (newSessionData: Omit<Session, 'id'>) => {
    const newSession: Session = {
      ...newSessionData,
      id: `S-${Date.now().toString().slice(-4)}`
    };
    setSessions(prev => [newSession, ...prev]);
  };

  // Handle updating session status
  const handleUpdateSessionStatus = (id: string, status: Session['status']) => {
    setSessions(prev => prev.map(s => {
      if (s.id === id) {
        // Trigger notification about status change
        const tenant = tenants.find(t => t.id === s.tenantId);
        const statusArabic = status === 'scheduled' ? 'مجدولة' : status === 'postponed' ? 'مؤجلة' : 'منتهية';
        
        handleTriggerNotification(
          'tenant',
          s.tenantId,
          'تحديث حالة الجلسة القضائية',
          `قامت الإدارة بتعديل حالة جلستك في قضية "${s.caseTitle}" إلى: (${statusArabic}).`,
          'session'
        );

        return { ...s, status };
      }
      return s;
    }));
  };

  // Handle deleting a session
  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  // Handle adding an invoice
  const handleAddInvoice = (newInvoiceData: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = {
      ...newInvoiceData,
      id: `INV-${Date.now().toString().slice(-4)}`
    };
    setInvoices(prev => [newInvoice, ...prev]);
  };

  // Handle updating invoice status
  const handleUpdateInvoiceStatus = (id: string, status: Invoice['status']) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        return { ...inv, status };
      }
      return inv;
    }));
  };

  // Handle deleting an invoice
  const handleDeleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  // Handle triggering a new notification (Simulating push/real-time)
  const handleTriggerNotification = (
    targetRole: 'lawyer' | 'tenant' | 'all',
    targetId: string,
    title: string,
    message: string,
    type: 'session' | 'invoice' | 'system'
  ) => {
    const formattedTime = new Date().toLocaleTimeString('ar-SA', { hour: 'numeric', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
    
    const newNotif: Notification = {
      id: `N-${Date.now()}`,
      targetRole,
      targetId,
      title,
      message,
      timestamp: formattedTime,
      isRead: false,
      type
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Show visual real-time Toast Alert to the simulated user
    setActiveToast({
      id: newNotif.id,
      title,
      message,
      type
    });

    // Audio beep effect simulation (using simple standard synthetic Beep if supported)
    if (soundEnabled && typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note (friendly chime)
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
      } catch (err) {
        // Safe fail if blocked by browser autoplay rules
      }
    }
  };

  // Clear or mark notification as read
  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  // Reset entire application database to initial seeds
  const handleResetDatabase = () => {
    if (confirm('هل أنت متأكد من مسح وتفريغ كافة البيانات والبدء من الصفر بالكامل؟')) {
      setSessions([]);
      setInvoices([]);
      setNotifications([]);
      setLawyers([]);
      setTenants([]);
      setUserSession(null);
      setCurrentRole('tenant');
      
      localStorage.removeItem('nazaha_sessions');
      localStorage.removeItem('nazaha_invoices');
      localStorage.removeItem('nazaha_notifications');
      localStorage.removeItem('asal_lawyers');
      localStorage.removeItem('asal_tenants');
      localStorage.removeItem('asal_session');
      alert('تم مسح وتفريغ كافة البيانات بنجاح! يمكنك الآن البدء بتسجيل وتعبئة بياناتك من الصفر.');
    }
  };

  // Unread counts across roles (used for visual indicator badges)
  const lawyerUnreadCount = notifications.filter(n => !n.isRead && (n.targetRole === 'lawyer' || n.targetRole === 'all')).length;
  const tenantUnreadCount = notifications.filter(n => !n.isRead && (n.targetRole === 'tenant' || n.targetRole === 'all')).length;

  const activeRoleToRender = (userSession && userSession.role === 'admin') ? currentRole : (userSession ? userSession.role : 'tenant');

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-200 selection:bg-emerald-500/20" dir="rtl">
      
      {/* Visual background ambient shapes */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* TOP HEADER & SHELL */}
      <header id="app-main-header" className="sticky top-0 z-40 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-emerald-500 rounded-xl flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
              <Scale className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h1 className="font-black text-sm sm:text-base tracking-tight text-emerald-400 flex items-center gap-1.5">
                منصة أصال <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded-full border border-emerald-500/20">للمحاماة والاستشارات القانونية</span>
              </h1>
              <p className="text-[9px] text-slate-400 font-medium">الربط الإلكتروني المباشر بين الإدارة، المحامي، والموكل</p>
            </div>
          </div>

          {/* Quick Session & Date & Sound Selector */}
          <div className="flex items-center gap-4 text-xs">
            {userSession && (
              <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
                <div className="hidden md:flex flex-col text-right items-end">
                  <span className="text-xs font-bold text-slate-100">{userSession.name}</span>
                  <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full mt-0.5">
                    {userSession.role === 'admin' ? 'مدير المنصة' : userSession.role === 'lawyer' ? 'مستشار ومحامي' : 'عميل موكل'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setUserSession(null);
                    // Also clear role state
                    setCurrentRole('tenant');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-400 hover:text-white hover:bg-red-600 border border-red-500/20 rounded-xl transition-all cursor-pointer"
                  title="تسجيل الخروج الآمن من الحساب"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">تسجيل الخروج</span>
                </button>
              </div>
            )}



            <div className="hidden lg:flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>{new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 cursor-pointer border border-slate-800"
                title={soundEnabled ? "كتم أصوات الإشعارات التفاعلية" : "تفعيل أصوات الإشعارات"}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative">
        {!userSession ? (
          <div className="py-6">
            <Login
              lawyers={lawyers}
              tenants={tenants}
              onRegisterLawyer={handleAddLawyer}
              onRegisterTenant={handleAddTenant}
              onLoginSuccess={(session) => {
                setUserSession(session);
                setCurrentRole(session.role);
              }}
            />
          </div>
        ) : (
          <>
            {/* INTERACTIVE WALKTHROUGH GUIDE (COLLAPSIBLE - ONLY VISIBLE WHEN SIMULATING) */}
            {userSession && userSession.role === 'admin' && showGuide && (
              <div id="simulation-guide-panel" className="bg-gradient-to-r from-emerald-950/40 to-slate-900 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden animate-fade-in border border-emerald-500/20">
                <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <button 
                  onClick={() => setShowGuide(false)}
                  className="absolute top-4 left-4 p-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-white/80"
                  title="إخفاء الدليل التعليمي"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl hidden sm:block shrink-0 border border-emerald-500/10">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-emerald-400 flex items-center gap-1.5">
                      ⚖️ لوحة المتابعة والربط الذكي - منصة أصال للمحاماة والاستشارات القانونية
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                      مرحباً بك في المنصة المتكاملة! يمكنك إدخال وتعديل بيانات المحامين والموكلين وتعيين كلمات مرورهم بالكامل. للتنقل وتجربة النظام بأكمله، استخدم شريط التبديل بالأسفل لمحاكاة أدوار المستخدمين والتحقق من سلاسة الترابط وتدفق الفواتير والجلسات:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                        <span className="font-bold text-emerald-400 text-xs block mb-1">1. قيد الموكلين والمحامين 👥</span>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          توجه لقسم "دليل المحامين والعملاء" لتسجيل حسابات نشطة وتفعيل البريد الإلكتروني لهم مباشرة.
                        </p>
                      </div>
                      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                        <span className="font-bold text-emerald-400 text-xs block mb-1">2. جدولة الجلسات والمطالبات ⚖️</span>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          قم بإنشاء جلسة قضائية أو إصدار فاتورة مطالبة أتعاب ليرتبط المستشار الموكل بالعميل تلقائياً في ثوانٍ.
                        </p>
                      </div>
                      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                        <span className="font-bold text-emerald-400 text-xs block mb-1">3. شريط المحاكاة الفوري 🔄</span>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          تنقل بين الواجهات بمرونة تامة للتحقق من التنبيهات ونظام السداد الرقمي، أو سجل الخروج لتجربة التدفق الفعلي.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ROLE BAR SELECTOR (ALWAYS VISIBLE FOR ADMIN) */}
            {userSession && userSession.role === 'admin' && (
              <div id="role-selector-container" className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-lg animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block pr-1">
                    تبديل ومحاكاة الأدوار القانونية:
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-start xl:justify-end">
                  {/* Simulated Tenant Selector */}
                  {currentRole === 'tenant' && tenants.length > 0 && (
                    <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-800 shrink-0">
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">👤 العميل المحاكي:</span>
                      <select
                        value={selectedSimulatedTenantId || (tenants[0]?.id || '')}
                        onChange={(e) => {
                          setSelectedSimulatedTenantId(e.target.value);
                        }}
                        className="text-[11px] font-bold py-1 px-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer text-right min-w-[130px]"
                      >
                        {tenants.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Simulated Lawyer Selector */}
                  {currentRole === 'lawyer' && lawyers.length > 0 && (
                    <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-800 shrink-0">
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">⚖️ المحامي المحاكي:</span>
                      <select
                        value={selectedSimulatedLawyerId || (lawyers[0]?.id || '')}
                        onChange={(e) => {
                          setSelectedSimulatedLawyerId(e.target.value);
                        }}
                        className="text-[11px] font-bold py-1 px-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer text-right min-w-[130px]"
                      >
                        {lawyers.map(l => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex bg-slate-950 p-1.5 rounded-2xl gap-1.5 border border-slate-850">
                    {/* Admin Role */}
                    <button
                      id="role-btn-admin"
                      onClick={() => setCurrentRole('admin')}
                      className={`flex-1 md:flex-none py-2 px-5 text-xs font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        currentRole === 'admin'
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      🛠️ الإدارة والمشرف
                    </button>

                    {/* Lawyer Role */}
                    <button
                      id="role-btn-lawyer"
                      onClick={() => setCurrentRole('lawyer')}
                      className={`flex-1 md:flex-none py-2 px-5 text-xs font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all relative ${
                        currentRole === 'lawyer'
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Scale className="w-4 h-4" />
                      ⚖️ مكتب المحاماة
                      {lawyerUnreadCount > 0 && (
                        <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                          {lawyerUnreadCount}
                        </span>
                      )}
                    </button>

                    {/* Tenant Role */}
                    <button
                      id="role-btn-tenant"
                      onClick={() => setCurrentRole('tenant')}
                      className={`flex-1 md:flex-none py-2 px-5 text-xs font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all relative ${
                        currentRole === 'tenant'
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      👤 بوابة الموكلين والعملاء
                      {tenantUnreadCount > 0 && (
                        <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                          {tenantUnreadCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Database Reset */}
                <div className="flex justify-end">
                  <button
                    onClick={handleResetDatabase}
                    className="text-slate-400 hover:text-red-400 text-[10px] font-bold flex items-center gap-1.5 px-3 py-2 border border-slate-800 rounded-xl hover:bg-slate-950 cursor-pointer transition-all shrink-0"
                    title="تفريغ كافة البيانات وإخلاء اللوحة بالكامل"
                  >
                    <RotateCcw className="w-3 h-3 text-red-400" />
                    تفريغ وإعادة ضبط النظام
                  </button>
                </div>
              </div>
            )}

            {/* ACTIVE DASHBOARD VIEW ROUTING */}
            <div id="active-dashboard-viewport" className="min-h-[500px]">
              {/* Render Admin dashboard if user is admin AND has administrative view active */}
              {activeRoleToRender === 'admin' && (
                <AdminDashboard
                  sessions={sessions}
                  invoices={invoices}
                  lawyers={lawyers}
                  tenants={tenants}
                  notifications={notifications}
                  onAddSession={handleAddSession}
                  onUpdateSessionStatus={handleUpdateSessionStatus}
                  onDeleteSession={handleDeleteSession}
                  onAddInvoice={handleAddInvoice}
                  onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                  onDeleteInvoice={handleDeleteInvoice}
                  onTriggerNotification={handleTriggerNotification}
                  onAddLawyer={handleAddLawyer}
                  onAddTenant={handleAddTenant}
                  onDeleteLawyer={handleDeleteLawyer}
                  onDeleteTenant={handleDeleteTenant}
                  onLoadDemoData={handleLoadDemoData}
                />
              )}

              {/* Render Lawyer dashboard if lawyer view is active */}
              {activeRoleToRender === 'lawyer' && (
                <LawyerDashboard
                  sessions={sessions}
                  lawyers={lawyers}
                  tenants={tenants}
                  notifications={notifications}
                  onMarkNotificationRead={handleMarkNotificationRead}
                  onTriggerNotification={handleTriggerNotification}
                  loggedLawyerId={userSession.role === 'lawyer' ? userSession.id : (selectedSimulatedLawyerId || lawyers[0]?.id || '')}
                />
              )}

              {/* Render Tenant dashboard if tenant view is active */}
              {activeRoleToRender === 'tenant' && (
                <TenantDashboard
                  sessions={sessions}
                  invoices={invoices}
                  lawyers={lawyers}
                  tenants={tenants}
                  notifications={notifications}
                  onMarkNotificationRead={handleMarkNotificationRead}
                  onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                  onTriggerNotification={handleTriggerNotification}
                  loggedTenantId={userSession.role === 'tenant' ? userSession.id : (selectedSimulatedTenantId || tenants[0]?.id || '')}
                />
              )}
            </div>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1">
            ⚖️ منصة أصال للمحاماة والاستشارات القانونية الموحدة لربط المحامي بالإدارة والموكلين
          </p>
          <p className="text-[10px] text-slate-400">
            تم التطوير والتشغيل التجريبي الكامل مع دعم الترابط الفوري للمدخلات الحية. جميع الحقوق محفوظة © {new Date().getFullYear()}
          </p>
        </div>
      </footer>

      {/* REAL-TIME SIMULATED PUSH NOTIFICATION TOAST OVERLAY */}
      {activeToast && (
        <div 
          className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white border border-emerald-500/20 p-4 rounded-2xl shadow-2xl max-w-sm w-[90%] md:w-[350px] flex items-start gap-3.5 animate-slide-up"
          dir="rtl"
        >
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl shrink-0 mt-0.5 animate-bounce">
            <Bell className="w-5 h-5" />
          </div>
          <div className="space-y-1 w-full">
            <div className="flex justify-between items-center">
              <h5 className="font-extrabold text-[10px] text-emerald-400 flex items-center gap-1">
                <span>🔔 تنبيه فوري جديد</span>
              </h5>
              <button 
                onClick={() => setActiveToast(null)}
                className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <h6 className="font-bold text-xs text-slate-100 leading-snug">{activeToast.title}</h6>
            <p className="text-[11px] text-slate-300 leading-normal line-clamp-2">{activeToast.message}</p>
            <span className="text-[9px] text-slate-500 block pt-1 font-medium">الآن في النظام</span>
          </div>
        </div>
      )}

    </div>
  );
}
