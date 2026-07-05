import React, { useState } from 'react';
import { Session, Lawyer, Tenant, Notification } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Briefcase, 
  Bell, 
  MessageSquare, 
  ChevronRight, 
  AlertCircle,
  Search,
  CheckCircle2,
  FileText,
  Scale,
  Phone,
  X
} from 'lucide-react';

interface LawyerDashboardProps {
  sessions: Session[];
  lawyers: Lawyer[];
  tenants: Tenant[];
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  onTriggerNotification: (
    targetRole: 'lawyer' | 'tenant' | 'all', 
    targetId: string, 
    title: string, 
    message: string, 
    type: 'session' | 'invoice' | 'system'
  ) => void;
  loggedLawyerId?: string;
  onClearNotifications?: () => void;
}

export default function LawyerDashboard({
  sessions,
  lawyers,
  tenants,
  notifications,
  onMarkNotificationRead,
  onTriggerNotification,
  loggedLawyerId,
  onClearNotifications
}: LawyerDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // State for adding a lawyer note on a session
  const [selectedSessionForNote, setSelectedSessionForNote] = useState<string | null>(null);
  const [lawyerNoteInput, setLawyerNoteInput] = useState('');
  const [postponeRequestSuccess, setPostponeRequestSuccess] = useState<string | null>(null);

  const activeLawyer = lawyers.find(l => l.id === loggedLawyerId) || lawyers[0];

  if (!activeLawyer) {
    return (
      <div className="p-12 text-center bg-slate-900 border border-amber-500/20 rounded-3xl">
        <Scale className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-pulse" />
        <p className="text-slate-300 font-bold">لم يتم العثور على محامين مسجلين في النظام.</p>
        <p className="text-xs text-slate-500 mt-1">يرجى تسجيل حساب محامي جديد من لوحة التحكم العامة أولاً.</p>
      </div>
    );
  }

  // Filter sessions assigned to this specific lawyer
  const lawyerSessions = sessions.filter(s => s.lawyerId === activeLawyer.id || s.lawyerId === activeLawyer.name);

  // Apply search & status filters
  const filteredSessions = lawyerSessions.filter(s => {
    const matchesSearch = s.caseTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.plaintiff.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.defendant.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter notifications for this lawyer sorted chronologically (Newest first, excluding system welcome)
  const lawyerNotifications = [...notifications]
    .filter(n => 
      (((n.targetRole === 'lawyer' && (n.targetId === activeLawyer.id || n.targetId === activeLawyer.name)) || n.targetRole === 'all') &&
      n.type !== 'system')
    )
    .sort((a, b) => b.id.localeCompare(a.id));
  
  const unreadNotificationsCount = lawyerNotifications.filter(n => !n.isRead).length;

  const handleSendPostponeRequest = (session: Session) => {
    // Simulate sending postponement request to administration / tenant
    onTriggerNotification(
      'tenant',
      session.tenantId,
      'طلب تأجيل الجلسة بطلب من المحامي',
      `قدم المحامي والمستشار الموكل "${activeLawyer.name}" طلباً للإدارة لتأجيل الجلسة المجدولة بتاريخ ${session.date} للقضية "${session.caseTitle}". يرجى ترقب الموعد البديل المعتمد قريباً.`,
      'session'
    );
    
    setPostponeRequestSuccess(session.id);
    setTimeout(() => {
      setPostponeRequestSuccess(null);
    }, 4000);
  };

  const handleAddNoteToSession = (sessionId: string) => {
    if (!lawyerNoteInput.trim()) return;
    
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      // Simulate saving a note using state trigger notification
      onTriggerNotification(
        'tenant',
        session.tenantId,
        'تعليمات وتحضيرات هامة من محاميك الموكل',
        `توجيه قضائي من الأستاذ ${activeLawyer.name}: "${lawyerNoteInput}"`,
        'session'
      );
      
      // We directly update the local session note for immediate UI visibility in this turn
      session.notes = lawyerNoteInput;

      alert('تم إرسال التوجيه والتحضير القضائي إلى الموكل بنجاح وتحديث ملفه!');
      setLawyerNoteInput('');
      setSelectedSessionForNote(null);
    }
  };

  return (
    <div id="lawyer-dashboard-container" className="space-y-6 animate-fade-in text-slate-200" dir="rtl">
      
      <div className="p-4 bg-gradient-to-r from-amber-500/10 to-slate-900 border border-amber-500/20 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl">
            <Briefcase className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-amber-400">بوابة المستشار القانوني المعتمد</h3>
            <p className="text-xs text-slate-300">مرحباً بك يا مستشار {activeLawyer.name}. يقتصر هذا القسم على جلساتك المجدولة، وتكليفات الترافع الصادرة لك من الإدارة.</p>
          </div>
        </div>
      </div>

      {/* Lawyer Profile Card & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lawyer Profile Overview */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-lg shadow-black/20">
          <div>
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-800">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-500 font-bold text-lg">
                ⚖️
              </div>
              <div>
                <h4 className="font-extrabold text-slate-100 leading-tight">{activeLawyer.name}</h4>
                <span className="text-[11px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full inline-block mt-1.5">{activeLawyer.specialty}</span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">البريد المهني المشفر:</span>
                <span className="font-semibold text-slate-200 font-mono">{activeLawyer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">رقم جوال التواصل المعتمد:</span>
                <span className="font-semibold text-slate-200 font-mono">{activeLawyer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">حالة تصريح الترافع:</span>
                <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">مرخص ونشط</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-850">
              <span className="text-slate-400 text-[9px] block mb-0.5 font-bold">القضايا الكلية</span>
              <span className="text-lg font-black text-slate-200">{lawyerSessions.length}</span>
            </div>
            <div className="p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
              <span className="text-amber-400 text-[9px] block mb-0.5 font-bold">جلسات قادمة</span>
              <span className="text-lg font-black text-amber-400">
                {lawyerSessions.filter(s => s.status === 'scheduled').length}
              </span>
            </div>
            <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
              <span className="text-emerald-400 text-[9px] block mb-0.5 font-bold">جلسات منتهية</span>
              <span className="text-lg font-black text-emerald-400">
                {lawyerSessions.filter(s => s.status === 'completed').length}
              </span>
            </div>
          </div>
        </div>

        {/* Lawyer-Specific Real-Time Notifications */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800/60 pb-3">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              صندوق التنبيهات المهنية والاستدعاءات القضائية
              {unreadNotificationsCount > 0 && (
                <span className="animate-pulse bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  {unreadNotificationsCount} جديد
                </span>
              )}
            </h3>
            <div className="flex items-center gap-3">
              {unreadNotificationsCount > 0 && (
                <button 
                  onClick={() => {
                    lawyerNotifications.forEach(n => onMarkNotificationRead(n.id));
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                >
                  تحديد الكل كمقروء
                </button>
              )}
              {lawyerNotifications.length > 0 && onClearNotifications && (
                <button 
                  onClick={onClearNotifications}
                  className="text-xs text-slate-400 hover:text-red-400 font-bold cursor-pointer"
                >
                  مسح التنبيهات
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-800 max-h-[190px] overflow-y-auto pr-2">
            {lawyerNotifications.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">لا توجد تنبيهات قضائية جديدة مسندة إليك حالياً.</p>
            ) : (
              lawyerNotifications.map(notif => (
                <div 
                  key={notif.id} 
                  onClick={() => !notif.isRead && onMarkNotificationRead(notif.id)}
                  className={`py-3 flex items-start justify-between gap-3 cursor-pointer group transition-all rounded-lg px-2 hover:bg-slate-950/40 ${
                    !notif.isRead ? 'bg-amber-500/5 border-r-2 border-amber-500 pl-1' : ''
                  }`}
                >
                  <div className="flex gap-2.5">
                    <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!notif.isRead ? 'bg-red-500' : 'bg-transparent'}`} />
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-200 group-hover:text-amber-400 transition-colors">{notif.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-slate-500 block mt-1.5">{notif.timestamp}</span>
                    </div>
                  </div>
                  {!notif.isRead && (
                    <button className="text-[10px] bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-md shrink-0 border border-slate-800 transition-colors">
                      قراءة التنبيه
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Main Hearings List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg shadow-black/20">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-extrabold text-slate-100 text-base">أجندة القضايا وجلسات الترافع المسندة إليك</h3>
            <p className="text-xs text-slate-400 mt-0.5">تفاصيل القضايا والمحاكم المكلف بها، ومعلومات الموكلين، مع أدوات إرسال التوجيهات فورياً.</p>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث برقم القضية أو الأطراف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs pr-9 pl-3 py-2 border border-slate-800 rounded-xl bg-slate-950 text-slate-200 focus:border-amber-500 focus:outline-none w-full sm:w-[200px]"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-2 border border-slate-800 rounded-xl bg-slate-950 text-slate-300 focus:outline-none"
            >
              <option value="all">كل الحالات القضائية</option>
              <option value="scheduled">جلسات مجدولة</option>
              <option value="postponed">جلسات مؤجلة</option>
              <option value="completed">جلسات منتهية</option>
            </select>
          </div>
        </div>

        {/* Sessions Grid */}
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-xs">لا توجد قضايا أو جلسات تطابق خيارات التصفية المحددة في مكتب أصال.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSessions.map(session => {
              const tenant = tenants.find(t => t.id === session.tenantId);
              const isNoteOpen = selectedSessionForNote === session.id;

              return (
                <div 
                  key={session.id} 
                  className={`border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 ${
                    session.status === 'completed' 
                      ? 'bg-slate-950/20 border-slate-800/80 opacity-60' 
                      : 'bg-slate-950 border-amber-500/10 hover:border-amber-500/20 shadow-md'
                  }`}
                >
                  <div>
                     {/* Header: Case ID and Status */}
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div>
                        <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                          رمز الدعوى: {session.caseId}
                        </span>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <h4 className="font-bold text-sm text-slate-100 leading-normal">
                            {session.caseTitle}
                          </h4>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold block mt-1.5">● أنت متصل ومثبّت بهذه الجلسة القضائية</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg shrink-0 ${
                        session.status === 'scheduled' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        session.status === 'postponed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {session.status === 'scheduled' ? 'مجدولة' : session.status === 'postponed' ? 'مؤجلة' : 'منتهية رسمياً'}
                      </span>
                    </div>

                    {/* Court Location and Time */}
                    <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-2xl space-y-2.5 mb-4 text-xs text-slate-300">
                      <div className="flex items-center gap-2 text-amber-400 font-bold">
                        <Clock className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                        <span>{session.day} - {session.hijriDate || session.date}</span>
                        <span className="text-amber-400 font-extrabold mr-auto bg-amber-500/10 px-2 py-0.5 rounded-lg">{session.time}</span>
                      </div>

                      <div className="flex flex-col gap-1 pt-2 border-t border-slate-800/60">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                          <span className="text-slate-200 font-medium">{session.courtRoom}</span>
                        </div>
                        {(session.city || session.circuitNo) && (
                          <div className="text-[10px] text-slate-400 mr-6">
                            {session.city && `📍 المدينة: ${session.city}`}
                            {session.circuitNo && ` | الدائرة: ${session.circuitNo}`}
                          </div>
                        )}
                      </div>

                      {session.agencyNo && (
                        <div className="text-[11px] text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl flex flex-col gap-0.5 mt-1.5">
                          <span className="font-bold">🔑 تفاصيل الوكالة المعتمدة:</span>
                          <span className="text-[10px] text-slate-300">رقم الوكالة: {session.agencyNo}</span>
                          {session.agencyExpiryDate && <span className="text-[10px] text-slate-400">تاريخ الانتهاء: {session.agencyExpiryDate}</span>}
                        </div>
                      )}
                    </div>

                    {/* Parties In Dispute */}
                    <div className="space-y-2 border-b border-slate-800 pb-3 mb-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">الطرف المدعي (طالب الحق):</span>
                        <span className="font-semibold text-slate-200">{session.plaintiff}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">الطرف المدعى عليه (المطلوب منه):</span>
                        <span className="font-semibold text-slate-200">{session.defendant}</span>
                      </div>
                      {tenant && (
                        <div className="flex justify-between items-center bg-amber-500/5 border border-amber-500/10 p-2 rounded-xl mt-2">
                          <span className="text-amber-400 font-bold text-[10px]">العميل والموكل المرتبط:</span>
                          <span className="font-extrabold text-slate-200 text-xs">{tenant.name} ({tenant.propertyNo})</span>
                        </div>
                      )}
                    </div>

                    {/* Admin/Lawyer Notes */}
                    {session.notes && (
                      <div className="mb-4 text-xs bg-slate-900 border border-slate-850 p-3 rounded-xl">
                        <span className="text-amber-400 font-bold block mb-1">الملاحظات والتوجيهات المرفقة للجلسة:</span>
                        <p className="text-slate-300 leading-normal">{session.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Area */}
                  {session.status !== 'completed' && (
                    <div className="pt-2 border-t border-slate-800 mt-2 space-y-3">
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedSessionForNote(isNoteOpen ? null : session.id);
                            setLawyerNoteInput('');
                          }}
                          className="w-1/2 bg-slate-900 hover:bg-slate-850 text-slate-200 text-xs font-bold py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-800"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                          {isNoteOpen ? 'إغلاق التوجيه' : 'إرسال توجيه فوري للموكل'}
                        </button>
                        
                        <button
                          onClick={() => handleSendPostponeRequest(session)}
                          disabled={postponeRequestSuccess === session.id}
                          className={`w-1/2 text-xs font-bold py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            postponeRequestSuccess === session.id
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'border border-slate-800 hover:bg-slate-900 text-slate-300'
                          }`}
                        >
                          {postponeRequestSuccess === session.id ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              طلب تأجيل مرسل
                            </>
                          ) : (
                            <>
                              <Calendar className="w-3.5 h-3.5" />
                              طلب تأجيل الجلسة
                            </>
                          )}
                        </button>
                      </div>

                      {isNoteOpen && (
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 animate-slide-up">
                          <label className="block text-[10px] font-bold text-slate-400 mb-1.5">اكتب التوجيهات أو المستندات المطلوبة لتحضير الموكل:</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={lawyerNoteInput}
                              onChange={(e) => setLawyerNoteInput(e.target.value)}
                              placeholder="مثال: يرجى تسليم وكالة الاعتراض قبل السبت..."
                              className="w-full text-xs p-2 border border-slate-800 rounded-lg bg-slate-950 text-slate-200 focus:border-amber-500 focus:outline-none"
                            />
                            <button
                              onClick={() => handleAddNoteToSession(session.id)}
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3 py-1.5 rounded-lg shrink-0 cursor-pointer"
                            >
                              إرسال وتحديث
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
