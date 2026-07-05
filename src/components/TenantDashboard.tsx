import React, { useState } from 'react';
import { Session, Invoice, Lawyer, Tenant, Notification } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Receipt, 
  Bell, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Phone,
  ArrowLeft,
  CreditCard,
  X,
  Sparkles,
  ShieldCheck,
  Scale
} from 'lucide-react';

interface TenantDashboardProps {
  sessions: Session[];
  invoices: Invoice[];
  lawyers: Lawyer[];
  tenants: Tenant[];
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  onUpdateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  onTriggerNotification: (
    targetRole: 'lawyer' | 'tenant' | 'all', 
    targetId: string, 
    title: string, 
    message: string, 
    type: 'session' | 'invoice' | 'system'
  ) => void;
  loggedTenantId?: string;
  onClearNotifications?: () => void;
}

export default function TenantDashboard({
  sessions,
  invoices,
  lawyers,
  tenants,
  notifications,
  onMarkNotificationRead,
  onUpdateInvoiceStatus,
  onTriggerNotification,
  loggedTenantId,
  onClearNotifications
}: TenantDashboardProps) {
  // Payment Modal State
  const [activePaymentInvoice, setActivePaymentInvoice] = useState<Invoice | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const activeTenant = tenants.find(t => t.id === loggedTenantId) || tenants[0];

  if (!activeTenant) {
    return (
      <div className="p-12 text-center bg-slate-900 border border-amber-500/20 rounded-3xl">
        <Scale className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-pulse" />
        <p className="text-slate-300 font-bold">لم يتم العثور على عملاء مسجلين في النظام حالياً.</p>
        <p className="text-xs text-slate-500 mt-1">يمكنك استخدام لوحة الإدارة لإضافة عملاء جدد مع قضاياهم ومستنداتهم.</p>
      </div>
    );
  }

  // Filter sessions and invoices for this active client
  const tenantSessions = sessions.filter(s => s.tenantId === activeTenant.id || s.tenantId === activeTenant.name);
  const tenantInvoices = invoices.filter(i => i.tenantId === activeTenant.id || i.tenantName === activeTenant.name);
  
  // Filter notifications for this active client sorted chronologically (Newest first, excluding system welcome)
  const tenantNotifications = [...notifications]
    .filter(n => 
      (((n.targetRole === 'tenant' && (n.targetId === activeTenant.id || n.targetId === activeTenant.name)) || n.targetRole === 'all') &&
      n.type !== 'system')
    )
    .sort((a, b) => b.id.localeCompare(a.id));
  
  const unreadCount = tenantNotifications.filter(n => !n.isRead).length;

  const handlePayClick = (invoice: Invoice) => {
    setActivePaymentInvoice(invoice);
    setCardHolder(activeTenant.name);
    setCardNumber('4000 1234 5678 9010');
    setPaymentSuccess(false);
    setPaymentLoading(false);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentInvoice) return;

    setPaymentLoading(true);
    
    // Simulate API request delay
    setTimeout(() => {
      onUpdateInvoiceStatus(activePaymentInvoice.id, 'paid');
      
      // Trigger notification for Administration & Lawyer
      onTriggerNotification(
        'all',
        '',
        'تأكيد سداد أتعاب قضائية',
        `قام الموكل والعميل "${activeTenant.name}" بسداد الفاتورة رقم ${activePaymentInvoice.id} بقيمة ${activePaymentInvoice.amount.toLocaleString()} ريال بنجاح عن طريق الدفع الإلكتروني المباشر.`,
        'invoice'
      );

      setPaymentLoading(false);
      setPaymentSuccess(true);
      
      // Keep modal open for a brief success view then auto close
      setTimeout(() => {
        setActivePaymentInvoice(null);
        setPaymentSuccess(false);
      }, 2500);

    }, 1500);
  };

  return (
    <div id="tenant-dashboard-container" className="space-y-6 animate-fade-in" dir="rtl">
      
      <div className="p-4 bg-gradient-to-r from-amber-500/10 to-slate-900 border border-amber-500/20 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl">
            <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-amber-400">بوابة العميل والموكل الأمنة</h3>
            <p className="text-xs text-slate-300">مرحباً بك الموكل الفاضل: {activeTenant.name}. يقتصر هذا القسم على متابعة قضيتك المسجلة: ({activeTenant.propertyNo})، وسداد أتعابك، ومراجعة مواعيد الجلسات.</p>
          </div>
        </div>
      </div>

      {/* Client Profile & Notifications Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Client Profile Overview */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-lg shadow-black/20">
          <div>
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-800">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-500 font-bold text-lg">
                💼
              </div>
              <div>
                <h4 className="font-extrabold text-slate-100 leading-tight">{activeTenant.name}</h4>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full inline-block mt-1.5">موكل مسجل لدينا</span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-500 block mb-1">ملف القضية / العقد الاستشاري:</span>
                <span className="font-bold text-amber-100 block text-sm bg-slate-950 p-2.5 rounded-xl border border-slate-800">{activeTenant.propertyNo}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">رقم الاتصال المعتمد:</span>
                <span className="font-semibold text-slate-200 font-mono">{activeTenant.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">البريد الإلكتروني الموثق:</span>
                <span className="font-semibold text-slate-200 font-mono">{activeTenant.email}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-2xl">
              <span className="text-red-400 text-[10px] font-bold block mb-0.5">مطالبات قيد السداد</span>
              <span className="text-lg font-black text-red-400">
                {tenantInvoices.filter(i => i.status !== 'paid').length}
              </span>
            </div>
            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
              <span className="text-amber-400 text-[10px] font-bold block mb-0.5">جلسات مرافعة قادمة</span>
              <span className="text-lg font-black text-amber-400">
                {tenantSessions.filter(s => s.status === 'scheduled').length}
              </span>
            </div>
          </div>
        </div>

        {/* Client Notifications box */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800/60 pb-3">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              مركز التنبيهات والإشعارات القضائية المباشرة
              {unreadCount > 0 && (
                <span className="animate-pulse bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} تنبيه جديد
                </span>
              )}
            </h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button 
                  onClick={() => {
                    tenantNotifications.forEach(n => onMarkNotificationRead(n.id));
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                >
                  تحديد الكل كمقروء
                </button>
              )}
              {tenantNotifications.length > 0 && onClearNotifications && (
                <button 
                  onClick={onClearNotifications}
                  className="text-xs text-slate-400 hover:text-red-400 font-bold cursor-pointer"
                >
                  مسح التنبيهات
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-[350px] overflow-y-auto pr-2 space-y-2">
            {tenantNotifications.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">لا توجد إشعارات قضائية أو تنبيهات واردة حالياً.</p>
            ) : (
              tenantNotifications.map(notif => (
                <div 
                  key={notif.id} 
                  onClick={() => !notif.isRead && onMarkNotificationRead(notif.id)}
                  className={`py-3.5 flex flex-col gap-2 cursor-pointer group transition-all rounded-xl px-3 hover:bg-slate-950/50 ${
                    !notif.isRead ? 'bg-amber-500/5 border-r-2 border-amber-500 pl-1.5 shadow-sm' : 'bg-slate-900/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${!notif.isRead ? 'bg-red-500 animate-pulse' : 'bg-transparent'}`} />
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                        notif.type === 'session' 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {notif.type === 'session' ? 'جلسة قضائية' : 'مطالبة وسداد'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{notif.timestamp}</span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-xs text-slate-200 group-hover:text-amber-400 transition-colors leading-snug">{notif.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/40 pt-2 mt-1">
                    <span className="text-[10px] text-slate-500">المرسل: {notif.sender || 'إدارة منصة أصال'}</span>
                    {!notif.isRead ? (
                      <span className="text-[9px] font-bold text-amber-400 flex items-center gap-1">
                        <span className="w-1 h-1 bg-amber-400 rounded-full inline-block"></span>
                        غير مقروء
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-500">تمت القراءة</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 1. SECTIONS / HEARINGS ("متى الجلسة؟") */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/10">
            <Calendar className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-100 text-base">جدول وتفاصيل جلسات المرافعة والمحكمة (متى جلستي؟)</h3>
            <p className="text-xs text-slate-400 mt-0.5">تفاصيل الدعوى، الدائرة القضائية المقررة، تواريخ الجلسات والتحضير الفني المطلوب منك.</p>
          </div>
        </div>

        {tenantSessions.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl p-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h4 className="font-bold text-slate-200 text-sm">الحمد لله، لا توجد جلسات قضائية مجدولة لملفك حالياً</h4>
            <p className="text-slate-500 text-xs mt-1.5">ملفك القانوني مستقر وجميع التحديثات قيد المراجعة في منصة أصال.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tenantSessions.map(session => {
              const lawyer = lawyers.find(l => l.id === session.lawyerId);

              return (
                <div 
                  key={session.id} 
                  className={`border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 ${
                    session.status === 'completed'
                      ? 'bg-slate-950/20 border-slate-800/80 opacity-60'
                      : 'bg-gradient-to-b from-slate-950 to-slate-900 border-amber-500/10 hover:border-amber-500/20 shadow-md'
                  }`}
                >
                  <div>
                    {/* Header: Case ID and Status */}
                    <div className="flex justify-between items-start gap-2 mb-3.5">
                      <div>
                        <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                          رمز الدعوى: {session.caseId}
                        </span>
                        <h4 className="font-bold text-sm text-slate-100 mt-2 leading-normal">
                          {session.caseTitle}
                        </h4>
                      </div>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-lg shrink-0 ${
                        session.status === 'scheduled' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        session.status === 'postponed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {session.status === 'scheduled' ? 'مجدولة رسمياً' : session.status === 'postponed' ? 'مؤجلة بطلب' : 'انتهت بالصلح / الحكم'}
                      </span>
                    </div>

                    {/* Court Location and Time */}
                    <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-2xl space-y-3 mb-4 text-xs text-slate-300">
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                        <div>
                          <span className="font-extrabold block text-amber-200">
                            {session.day} - {session.hijriDate || session.date}
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">التوقيت المعتمد للدخول في المنصة القضائية</span>
                        </div>
                        <span className="text-xs text-slate-950 font-black bg-amber-400 px-2.5 py-1 rounded-lg mr-auto">
                          {session.time}
                        </span>
                      </div>
                      
                      <div className="flex items-start gap-2.5 pt-2.5 border-t border-slate-800">
                        <MapPin className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold block text-slate-200">
                            {session.courtRoom}
                            {(session.city || session.circuitNo) && (
                              <span className="font-normal text-slate-400 text-[11px] block mt-1">
                                {session.city && `📍 المدينة: ${session.city}`} {session.circuitNo && ` | الدائرة: ${session.circuitNo}`}
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">موقع ومقر الدائرة والمنصة الإلكترونية للترافع</span>
                        </div>
                      </div>

                      {session.agencyNo && (
                        <div className="mt-2 pt-2.5 border-t border-slate-800/80 text-[11px] text-emerald-400 flex flex-col gap-0.5">
                          <span className="font-bold flex items-center gap-1">🔑 تفاصيل وكالتك المعتمدة بالترافع:</span>
                          <span className="text-slate-300">رقم الوكالة: {session.agencyNo}</span>
                          {session.agencyExpiryDate && <span className="text-slate-400">تاريخ انتهاء الوكالة: {session.agencyExpiryDate}</span>}
                        </div>
                      )}
                    </div>

                    {/* Parties In Dispute */}
                    <div className="space-y-2 text-xs pb-3 border-b border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-500">الطرف المدعي (طالب الحق):</span>
                        <span className="font-semibold text-slate-200">{session.plaintiff}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">الطرف المدعى عليه (المطلوب منه):</span>
                        <span className="font-semibold text-slate-200">{session.defendant}</span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Lawyer Details */}
                  {lawyer && (
                    <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                      <span className="text-[10px] text-slate-500 block mb-1.5 font-bold">المستشار والمحامي المكلّف بالمثول عنك:</span>
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-amber-500/15 text-amber-400 rounded-full flex items-center justify-center text-xs border border-amber-500/20">⚖️</div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                              <span className="font-bold text-xs text-slate-200 block">{lawyer.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{lawyer.specialty} | <span className="text-emerald-400 font-bold text-[9px]">متصل حالياً بالجلسة</span></span>
                          </div>
                        </div>
                        <a 
                          href={`tel:${lawyer.phone}`}
                          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1.5 rounded-xl transition-all shadow-md shadow-amber-500/5 cursor-pointer"
                        >
                          <Phone className="w-3 h-3" />
                          اتصال عاجل
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Lawyer's Session Instructions */}
                  {session.notes && (
                    <div className="mt-3 bg-slate-950 p-3 rounded-xl border border-amber-500/10">
                      <span className="text-amber-400 text-[10px] font-black block mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        توجيهات المحامي للتحضير قبل الجلسة:
                      </span>
                      <p className="text-xs text-slate-300 leading-normal">{session.notes}</p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. INVOICES / BILLS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/10">
            <Receipt className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-100 text-base">الفواتير المستحقة وأتعاب الخدمات القانونية</h3>
            <p className="text-xs text-slate-400 mt-0.5">متابعة الفواتير المصدرة لأتعاب الترافع والاستشارات وصياغة العقود وتفاصيل السداد الموثق.</p>
          </div>
        </div>

        {tenantInvoices.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-10">الحمد لله، لا توجد فواتير أو مطالبات مالية معلقة لملفك.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tenantInvoices.map(invoice => (
              <div 
                key={invoice.id}
                className="border border-slate-800 p-5 rounded-2xl bg-slate-950 flex flex-col justify-between shadow-md hover:border-amber-500/20 transition-all duration-300"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block">رقم الفاتورة: {invoice.id}</span>
                      <span className="text-[10px] text-slate-400 block mt-1">تاريخ الاستحقاق: {invoice.dueDate}</span>
                    </div>
                    
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border ${
                      invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      invoice.status === 'unpaid' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {invoice.status === 'paid' ? 'مدفوعة ومحصلة' : invoice.status === 'unpaid' ? 'مستحقة للدفع' : 'متأخرة السداد'}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-xs text-slate-200 mb-3.5 leading-relaxed min-h-[40px]">
                    {invoice.description}
                  </h4>

                  <div className="my-4 bg-slate-900 border border-slate-850 p-3.5 rounded-2xl flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">القيمة المطلوبة:</span>
                    <span className="text-lg font-black text-amber-400">
                      {invoice.amount.toLocaleString('en-US')} <span className="text-xs font-semibold text-slate-500">ريال</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 mt-2">
                  {invoice.status === 'paid' ? (
                    <div className="text-emerald-400 text-xs flex items-center justify-center gap-1.5 py-2 font-bold bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      تم التحصيل والتأكيد
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePayClick(invoice)}
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-amber-500/5"
                    >
                      <CreditCard className="w-4 h-4" />
                      سـداد الآن إلكترونياً
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PAYMENT MODAL (SIMULATED) */}
      {activePaymentInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative animate-scale-up">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-850 flex justify-between items-center bg-slate-950">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-slate-100 text-sm">بوابة سداد أصال الآمنة</h3>
              </div>
              <button 
                onClick={() => !paymentLoading && setActivePaymentInvoice(null)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {paymentSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce border border-emerald-500/20">
                    🎉
                  </div>
                  <h4 className="text-emerald-400 font-extrabold text-base">تمت عملية السداد المالي بنجاح!</h4>
                  <p className="text-xs text-slate-400 leading-normal max-w-xs mx-auto">
                    تم تحصيل مبلغ أتعاب قضائية وقدره <strong>{activePaymentInvoice.amount.toLocaleString()} ريال</strong> وإشعار الإدارة ووكيل قضيتك بنجاح. شكراً لك!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleProcessPayment} className="space-y-4">
                  
                  {/* Summary */}
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-2">
                    <span className="text-[10px] text-slate-500 block">تفاصيل أتعاب الخدمة المقدمة:</span>
                    <h5 className="font-extrabold text-xs text-slate-200 leading-relaxed">{activePaymentInvoice.description}</h5>
                    <div className="flex justify-between items-center pt-2.5 border-t border-slate-800">
                      <span className="text-xs text-slate-400">إجمالي الأتعاب المستحقة:</span>
                      <span className="text-base font-black text-amber-400">
                        {activePaymentInvoice.amount.toLocaleString()} ريال سعودي
                      </span>
                    </div>
                  </div>

                  {/* Card fields */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">اسم الموكل حامل البطاقة:</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        required
                        className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-950 text-slate-200 focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">رقم بطاقة مدى / فيزا / ماستركارد:</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                        placeholder="XXXX XXXX XXXX XXXX"
                        className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-950 text-slate-200 focus:border-amber-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">تاريخ الانتهاء:</label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          defaultValue="12/29"
                          className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-950 text-slate-200 focus:border-amber-500 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">الرمز السري (CVV):</label>
                        <input
                          type="password"
                          required
                          maxLength={3}
                          defaultValue="993"
                          className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-950 text-slate-200 focus:border-amber-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={paymentLoading}
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 shadow-lg shadow-amber-500/5"
                    >
                      {paymentLoading ? (
                        <span className="flex items-center gap-2 animate-pulse">
                          ⏳ جارٍ تأمين ونقل الأموال رقمياً...
                        </span>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-950 fill-amber-950" />
                          تـأكـيـد وسـداد الـمـبـلـغ
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[9px] text-slate-500 text-center leading-relaxed">
                    🔒 نظام محاكاة آمن - لن يتم استخدام أو سحب أي مبالغ حقيقية من بطاقتك الشخصية.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
