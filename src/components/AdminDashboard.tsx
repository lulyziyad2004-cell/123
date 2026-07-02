import React, { useState } from 'react';
import { Session, Invoice, Lawyer, Tenant, Notification } from '../types';
import { 
  Calendar, 
  Receipt, 
  Users, 
  PlusCircle, 
  Bell, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UserPlus, 
  DollarSign, 
  ShieldAlert,
  Send,
  Sliders,
  Check,
  ChevronDown,
  Scale,
  Briefcase,
  FileText,
  BadgeAlert,
  UserCheck
} from 'lucide-react';

interface AdminDashboardProps {
  sessions: Session[];
  invoices: Invoice[];
  lawyers: Lawyer[];
  tenants: Tenant[];
  notifications: Notification[];
  onAddSession: (session: Omit<Session, 'id'>) => void;
  onUpdateSessionStatus: (id: string, status: Session['status']) => void;
  onDeleteSession: (id: string) => void;
  onAddInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  onUpdateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  onDeleteInvoice: (id: string) => void;
  onTriggerNotification: (
    targetRole: 'lawyer' | 'tenant' | 'all', 
    targetId: string, 
    title: string, 
    message: string, 
    type: 'session' | 'invoice' | 'system'
  ) => void;
  onAddLawyer: (lawyer: Omit<Lawyer, 'id'>) => void;
  onAddTenant: (tenant: Omit<Tenant, 'id'>) => void;
  onDeleteLawyer: (id: string) => void;
  onDeleteTenant: (id: string) => void;
  onLoadDemoData?: () => void;
}

export default function AdminDashboard({
  sessions,
  invoices,
  lawyers,
  tenants,
  notifications,
  onAddSession,
  onUpdateSessionStatus,
  onDeleteSession,
  onAddInvoice,
  onUpdateInvoiceStatus,
  onDeleteInvoice,
  onTriggerNotification,
  onAddLawyer,
  onAddTenant,
  onDeleteLawyer,
  onDeleteTenant,
  onLoadDemoData
}: AdminDashboardProps) {
  // Tabs: 'stats' | 'sessions' | 'invoices' | 'people'
  const [activeTab, setActiveTab] = useState<'stats' | 'sessions' | 'invoices' | 'people'>('stats');

  // New Lawyer Form State
  const [showLawyerForm, setShowLawyerForm] = useState(false);
  const [newLawyer, setNewLawyer] = useState({
    name: '',
    specialty: '',
    email: '',
    phone: '',
    password: ''
  });

  // New Client Form State
  const [showTenantForm, setShowTenantForm] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: '',
    propertyNo: '',
    email: '',
    phone: '',
    password: ''
  });

  // New Session Form State
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [newSession, setNewSession] = useState({
    caseId: '',
    caseTitle: '',
    date: '',
    day: 'الأحد',
    time: '',
    plaintiff: '',
    defendant: '',
    lawyerId: '',
    tenantId: '',
    courtRoom: '',
    status: 'scheduled' as Session['status'],
    notes: ''
  });

  // New Invoice Form State
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    tenantId: '',
    amount: '',
    issueDate: '',
    dueDate: '',
    status: 'unpaid' as Invoice['status'],
    description: ''
  });

  // Custom Notification Form State
  const [notifyTargetRole, setNotifyTargetRole] = useState<'lawyer' | 'tenant' | 'all'>('tenant');
  const [notifyTargetId, setNotifyTargetId] = useState('');
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notifyType, setNotifyType] = useState<'session' | 'invoice' | 'system'>('system');
  const [notificationSuccess, setNotificationSuccess] = useState(false);

  // Stats Calculations
  const totalInvoicesAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidInvoicesAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const unpaidInvoicesAmount = invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const activeSessionsCount = sessions.filter(s => s.status === 'scheduled').length;

  const handleAddSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSession.caseTitle || !newSession.date || !newSession.time || !newSession.plaintiff || !newSession.defendant || !newSession.lawyerId) {
      alert('الرجاء تعبئة الحقول الأساسية للجلسة القضائية');
      return;
    }

    // Auto-calculate day of week from date
    const dateObj = new Date(newSession.date);
    const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayName = daysOfWeek[dateObj.getDay()] || 'الأحد';

    const assignedLawyer = lawyers.find(l => l.id === newSession.lawyerId || l.name === newSession.lawyerId);
    const assignedTenant = tenants.find(t => t.id === newSession.tenantId || t.name === newSession.tenantId);

    const lawyerId = assignedLawyer ? assignedLawyer.id : newSession.lawyerId;
    const tenantId = assignedTenant ? assignedTenant.id : newSession.tenantId;

    onAddSession({
      ...newSession,
      lawyerId: lawyerId,
      tenantId: tenantId,
      day: dayName
    });

    // Auto trigger notification for Lawyer & Client if registered
    if (assignedLawyer) {
      onTriggerNotification(
        'lawyer',
        assignedLawyer.id,
        'جلسة قضائية جديدة مسندة إليك',
        `تم إسناد قضية "${newSession.caseTitle}" بخصوص المدعي: ${newSession.plaintiff} والمدعي عليه: ${newSession.defendant}. الجلسة بتاريخ ${newSession.date} الساعة ${newSession.time}.`,
        'session'
      );
    }

    if (assignedTenant) {
      onTriggerNotification(
        'tenant',
        assignedTenant.id,
        'تحديد موعد جلسة قضائية جديدة',
        `تنبيه: تم تحديد موعد جلسة قضائية لك في قضية "${newSession.caseTitle}". التاريخ: ${newSession.date} (${dayName}) الساعة ${newSession.time} في ${newSession.courtRoom || 'منصة الترافع المعتمدة'}.`,
        'session'
      );
    }

    // Reset Form
    setNewSession({
      caseId: '',
      caseTitle: '',
      date: '',
      day: 'الأحد',
      time: '',
      plaintiff: '',
      defendant: '',
      lawyerId: '',
      tenantId: '',
      courtRoom: '',
      status: 'scheduled',
      notes: ''
    });
    setShowSessionForm(false);
  };

  const handleAddInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.tenantId || !newInvoice.amount || !newInvoice.issueDate || !newInvoice.dueDate) {
      alert('الرجاء تعبئة جميع حقول الفاتورة');
      return;
    }

    const selectedTenant = tenants.find(t => t.id === newInvoice.tenantId || t.name === newInvoice.tenantId);
    const tenantId = selectedTenant ? selectedTenant.id : newInvoice.tenantId;
    const tenantName = selectedTenant ? selectedTenant.name : newInvoice.tenantId;

    onAddInvoice({
      tenantId: tenantId,
      tenantName: tenantName,
      amount: parseFloat(newInvoice.amount),
      issueDate: newInvoice.issueDate,
      dueDate: newInvoice.dueDate,
      status: newInvoice.status,
      description: newInvoice.description || `فاتورة أتعاب خدمات قانونية مستحقة على ${tenantName}`
    });

    // Trigger Notification for the client if registered
    if (selectedTenant) {
      onTriggerNotification(
        'tenant',
        tenantId,
        'إصدار مطالبة مالية وفاتورة أتعاب جديدة',
        `تم إصدار مطالبة مالية مستحقة بقيمة ${parseFloat(newInvoice.amount).toLocaleString('en-US')} ريال سعودي مقابل خدمات قانونية. تاريخ الاستحقاق: ${newInvoice.dueDate}.`,
        'invoice'
      );
    }

    // Reset Form
    setNewInvoice({
      tenantId: '',
      amount: '',
      issueDate: '',
      dueDate: '',
      status: 'unpaid',
      description: ''
    });
    setShowInvoiceForm(false);
  };

  const handleAddLawyerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLawyer.name || !newLawyer.email || !newLawyer.phone || !newLawyer.specialty) {
      alert('يرجى تعبئة كافة حقول المحامي الأساسية');
      return;
    }
    onAddLawyer({
      name: newLawyer.name,
      specialty: newLawyer.specialty,
      email: newLawyer.email.trim().toLowerCase(),
      phone: newLawyer.phone,
      password: newLawyer.password || '123'
    });
    setNewLawyer({ name: '', specialty: '', email: '', phone: '', password: '' });
    setShowLawyerForm(false);
    alert('تم إضافة المستشار والمحامي بنجاح وتفعيل حسابه للدخول!');
  };

  const handleAddTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenant.name || !newTenant.email || !newTenant.phone || !newTenant.propertyNo) {
      alert('يرجى تعبئة كافة حقول العميل الأساسية');
      return;
    }
    onAddTenant({
      name: newTenant.name,
      propertyNo: newTenant.propertyNo,
      email: newTenant.email.trim().toLowerCase(),
      phone: newTenant.phone,
      password: newTenant.password || '123'
    });
    setNewTenant({ name: '', propertyNo: '', email: '', phone: '', password: '' });
    setShowTenantForm(false);
    alert('تم إضافة العميل والموكل بنجاح وتفعيل حسابه للدخول الآمن!');
  };

  const handleQuickNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyTitle || !notifyMessage) {
      alert('يرجى كتابة عنوان ونص الإشعار');
      return;
    }

    onTriggerNotification(
      notifyTargetRole,
      notifyTargetId,
      notifyTitle,
      notifyMessage,
      notifyType
    );

    setNotificationSuccess(true);
    setNotifyTitle('');
    setNotifyMessage('');
    setTimeout(() => {
      setNotificationSuccess(false);
    }, 4000);
  };

  const sendCaseStatusNotification = (session: Session) => {
    const tenant = tenants.find(t => t.id === session.tenantId);
    const lawyer = lawyers.find(l => l.id === session.lawyerId);

    if (tenant) {
      onTriggerNotification(
        'tenant',
        tenant.id,
        'تحديث هام بشأن موعد جلستكم القضائية',
        `تذكير الإدارة: يرجى الالتزام بموعد الجلسة المجدولة بتاريخ ${session.date} الساعة ${session.time} في "${session.courtRoom}". يرجى إعداد مستنداتكم مسبقاً.`,
        'session'
      );
    }

    if (lawyer) {
      onTriggerNotification(
        'lawyer',
        lawyer.id,
        'إشعار تذكيري بموعد الجلسة المسندة',
        `تذكير الإدارة للمحامي: يرجى مراجعة ملف القضية وتوجيهات الموكل ${tenant?.name || 'العميل'} لجلسة ${session.date}.`,
        'session'
      );
    }

    alert(`تم إرسال إشعار فوري وتنبيه للمحامي (${lawyer?.name}) والعميل الموكل (${tenant?.name || 'العميل'}) بنجاح!`);
  };

  const sendInvoiceReminderNotification = (invoice: Invoice) => {
    onTriggerNotification(
      'tenant',
      invoice.tenantId,
      'تنبيه سداد أتعاب قانونية عاجل',
      `نذكركم بضرورة سداد فاتورة الأتعاب المستحقة رقم ${invoice.id} بقيمة ${invoice.amount.toLocaleString()} ريال والتي استحق سدادها في ${invoice.dueDate}. شاكرين تعاونكم.`,
      'invoice'
    );
    alert(`تم إرسال إشعار سداد وتنبيه للعميل (${invoice.tenantName}) بنجاح!`);
  };

  return (
    <div id="admin-dashboard-container" className="space-y-6 animate-fade-in text-slate-200" dir="rtl">
      
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-amber-500/10 p-6 rounded-3xl flex items-center justify-between flex-wrap gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <Scale className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <h2 className="font-black text-lg text-amber-400">منصة أصال للمحاماة والاستشارات القانونية</h2>
            <p className="text-xs text-slate-400 mt-1">لوحة الإدارة الشاملة لإدارة القضايا، الفواتير، وجدولة جلسات الترافع والعملاء.</p>
          </div>
        </div>
        

      </div>

      {/* Tab Selector */}
      <div className="flex border-b border-slate-800 overflow-x-auto gap-1">
        <button 
          id="tab-btn-stats"
          onClick={() => setActiveTab('stats')}
          className={`py-3 px-5 font-bold text-xs flex items-center gap-2 transition-all shrink-0 border-b-2 rounded-t-xl ${
            activeTab === 'stats' 
              ? 'border-amber-500 text-amber-400 bg-amber-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          الإحصائيات العامة والتحكم
        </button>
        <button 
          id="tab-btn-sessions"
          onClick={() => setActiveTab('sessions')}
          className={`py-3 px-5 font-bold text-xs flex items-center gap-2 transition-all shrink-0 border-b-2 rounded-t-xl ${
            activeTab === 'sessions' 
              ? 'border-amber-500 text-amber-400 bg-amber-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          مواعيد وجلسات المحاكم ({sessions.length})
        </button>
        <button 
          id="tab-btn-invoices"
          onClick={() => setActiveTab('invoices')}
          className={`py-3 px-5 font-bold text-xs flex items-center gap-2 transition-all shrink-0 border-b-2 rounded-t-xl ${
            activeTab === 'invoices' 
              ? 'border-amber-500 text-amber-400 bg-amber-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4" />
          فواتير ومطالبات الأتعاب ({invoices.length})
        </button>
        <button 
          id="tab-btn-people"
          onClick={() => setActiveTab('people')}
          className={`py-3 px-5 font-bold text-xs flex items-center gap-2 transition-all shrink-0 border-b-2 rounded-t-xl ${
            activeTab === 'people' 
              ? 'border-amber-500 text-amber-400 bg-amber-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          دليل المحامين والعملاء ({lawyers.length + tenants.length})
        </button>
      </div>

      {/* 1. OVERVIEW STATS TAB */}
      {activeTab === 'stats' && (
        <div id="stats-tab-content" className="space-y-6 animate-fade-in">
          {/* Top Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between shadow-md">
              <div>
                <span className="text-slate-400 text-[11px] block mb-1">جلسات الترافع القادمة</span>
                <span className="text-2xl font-black text-amber-400">{activeSessionsCount}</span>
              </div>
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/10">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between shadow-md">
              <div>
                <span className="text-slate-400 text-[11px] block mb-1">الأتعاب المعلقة قيد التحصيل</span>
                <span className="text-2xl font-black text-red-400">
                  {unpaidInvoicesAmount.toLocaleString()} <span className="text-xs font-normal text-slate-500">ريال</span>
                </span>
              </div>
              <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/10">
                <Receipt className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between shadow-md">
              <div>
                <span className="text-slate-400 text-[11px] block mb-1">إجمالي الأتعاب المحصلة بنجاح</span>
                <span className="text-2xl font-black text-emerald-400">
                  {paidInvoicesAmount.toLocaleString()} <span className="text-xs font-normal text-slate-500">ريال</span>
                </span>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/10">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between shadow-md">
              <div>
                <span className="text-slate-400 text-[11px] block mb-1">إجمالي المقيدين بالمنصة</span>
                <span className="text-2xl font-black text-slate-100">
                  {lawyers.length + tenants.length} <span className="text-xs font-normal text-slate-500">({lawyers.length} محامين / {tenants.length} عملاء)</span>
                </span>
              </div>
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/10">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Custom Notification Box */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/15">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">بث إشعار فوري للأطراف</h3>
                  <p className="text-xs text-slate-400">إرسال تنبيه أو إرشاد فوري لمستشار معين، أو موكل محدد، أو تعميم للجميع يظهر في لوحاتهم.</p>
                </div>
              </div>

              <form onSubmit={handleQuickNotify} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">توجيه التنبيه إلى فئة:</label>
                    <select
                      value={notifyTargetRole}
                      onChange={(e) => {
                        setNotifyTargetRole(e.target.value as any);
                        setNotifyTargetId('');
                      }}
                      className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-950 focus:border-amber-500 focus:outline-none text-slate-200"
                    >
                      <option value="tenant">عميل / موكل محدد</option>
                      <option value="lawyer">محامي ومستشار محدد</option>
                      <option value="all">الجميع (محامين وعملاء)</option>
                    </select>
                  </div>

                  {notifyTargetRole !== 'all' && (
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">اختر الشخص المستهدف أو اكتب اسمه:</label>
                      <input
                        type="text"
                        placeholder={notifyTargetRole === 'tenant' ? "اكتب اسم العميل أو الموكل" : "اكتب اسم المحامي المستهدف"}
                        value={notifyTargetId}
                        onChange={(e) => setNotifyTargetId(e.target.value)}
                        required
                        list="notify-target-list"
                        className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-950 text-slate-200 focus:border-amber-500 focus:outline-none"
                      />
                      <datalist id="notify-target-list">
                        {notifyTargetRole === 'tenant' && tenants.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                        {notifyTargetRole === 'lawyer' && lawyers.map(l => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </datalist>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">تصنيف الإشعار:</label>
                    <select
                      value={notifyType}
                      onChange={(e) => setNotifyType(e.target.value as any)}
                      className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-950 focus:border-amber-500 focus:outline-none text-slate-200"
                    >
                      <option value="system">تنبيه إداري عام</option>
                      <option value="session">مواعيد وتحديثات الجلسات</option>
                      <option value="invoice">الفواتير والأتعاب</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">عنوان الإشعار:</label>
                    <input
                      type="text"
                      placeholder="مثال: يرجى تسليم مستندات الوكالة المعدلة"
                      value={notifyTitle}
                      onChange={(e) => setNotifyTitle(e.target.value)}
                      required
                      className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-950 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">نص ومضمون الرسالة الموجهة:</label>
                  <textarea
                    rows={2}
                    placeholder="اكتب هنا الإرشاد أو التفاصيل القانونية والخطوات المطلوبة من المستلم بدقة..."
                    value={notifyMessage}
                    onChange={(e) => setNotifyMessage(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-950 text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  {notificationSuccess ? (
                    <div className="text-emerald-400 text-xs flex items-center gap-1.5 font-bold animate-pulse">
                      <CheckCircle2 className="w-4 h-4" />
                      تم بث الإشعار بنجاح! سيتم تنبيه المستخدم فوراً في لوحته.
                    </div>
                  ) : <span></span>}

                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs py-2 px-5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors shadow-md shadow-amber-500/5"
                  >
                    <Send className="w-4 h-4" />
                    إرسال الإشعار الآن
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-inner">
              <div>
                <h3 className="font-extrabold text-sm mb-2 text-amber-400 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-amber-500" />
                  أدوات المحاكاة والتحكم والترابط
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  تتميز منصة أصال بدعمها الكامل لمدخلات الإدارة الحية وقدرتها على البدء فارغة. عند إضافة جلسة أو مطالبة أو مستشار، يتم الترابط تلقائياً.
                </p>
                
                <div className="space-y-3">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-start gap-2">
                    <span className="text-amber-500 font-bold text-xs">💡 تذكير:</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      عند إضافة جلسة جديدة وتعيين محامي أو موكل، تظهر الجلسة والتعليمات في بواباتهم الخاصة فورياً.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-start gap-2">
                    <span className="text-amber-500 font-bold text-xs">🔑 دخول:</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      يمكنك معرفة كلمات المرور والبريد الإلكتروني للجميع في تبويب "دليل المحامين والعملاء" للولوج بها.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button 
                  onClick={() => { setActiveTab('sessions'); setShowSessionForm(true); }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  جدولة جلسة
                </button>
                <button 
                  onClick={() => { setActiveTab('invoices'); setShowInvoiceForm(true); }}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 text-[11px] font-black py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-amber-500" />
                  إصدار مطالبة
                </button>
              </div>
            </div>

          </div>

          {/* Quick Logs Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="font-bold text-sm text-slate-100 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              سجل آخر التنبيهات المرسلة من نظام المحاماة
            </h3>
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">لا توجد إشعارات مرسلة حالياً.</p>
            ) : (
              <div className="divide-y divide-slate-800 max-h-[220px] overflow-y-auto pr-2">
                {notifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className="py-3 flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        notif.type === 'session' ? 'bg-amber-500/10 text-amber-400' :
                        notif.type === 'invoice' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-200">{notif.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-normal">{notif.message}</p>
                        <span className="text-[10px] text-slate-500 block mt-1.5">
                          موجه إلى: {notif.targetRole === 'all' ? 'الجميع' : notif.targetRole === 'lawyer' ? 'المحامي' : 'العميل الموكل'} | {notif.timestamp}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 h-fit ${
                      notif.isRead ? 'bg-slate-800 text-slate-400' : 'bg-red-500/10 text-red-400 border border-red-500/10'
                    }`}>
                      {notif.isRead ? 'تلقاه وقرأه' : 'قيد الانتظار'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SESSIONS MANAGEMENT TAB */}
      {activeTab === 'sessions' && (
        <div id="sessions-tab-content" className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-base text-slate-100">جدول ومواعيد الجلسات القضائية</h3>
              <p className="text-xs text-slate-400">جدولة مواعيد المحاكم والترافع الإلكتروني، وتكليف السادة المحامين وتحديث الحالات فورياً.</p>
            </div>
            <button
              onClick={() => setShowSessionForm(!showSessionForm)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              {showSessionForm ? 'إغلاق النموذج' : 'جدولة جلسة قضائية جديدة'}
            </button>
          </div>

          {/* Add Session Form */}
          {showSessionForm && (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 transition-all">
              <h4 className="font-bold text-sm text-amber-400 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                تعبئة صحيفة وموعد الجلسة القضائية الجديدة
              </h4>
              <form onSubmit={handleAddSessionSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">رقم القضية في المحكمة:</label>
                    <input
                      type="text"
                      placeholder="مثال: CASE-7049"
                      value={newSession.caseId}
                      onChange={(e) => setNewSession({...newSession, caseId: e.target.value})}
                      required
                      className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">موضوع أو عنوان القضية:</label>
                    <input
                      type="text"
                      placeholder="مثال: دعوى المطالبة بالتعويض أو مستحقات مالية"
                      value={newSession.caseTitle}
                      onChange={(e) => setNewSession({...newSession, caseTitle: e.target.value})}
                      required
                      className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">المدعي (طالب الحق):</label>
                    <input
                      type="text"
                      placeholder="الشخص أو الكيان المشتكي"
                      value={newSession.plaintiff}
                      onChange={(e) => setNewSession({...newSession, plaintiff: e.target.value})}
                      required
                      className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">المدعي عليه:</label>
                    <input
                      type="text"
                      placeholder="الخصم المطلوب للمثول"
                      value={newSession.defendant}
                      onChange={(e) => setNewSession({...newSession, defendant: e.target.value})}
                      required
                      className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">المحكمة وقاعة الجلسة:</label>
                    <input
                      type="text"
                      placeholder="مثال: المحكمة التجارية - قاعة 5 أو منصة ناجز"
                      value={newSession.courtRoom}
                      onChange={(e) => setNewSession({...newSession, courtRoom: e.target.value})}
                      required
                      className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">تاريخ الجلسة:</label>
                    <input
                      type="date"
                      value={newSession.date}
                      onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                      required
                      className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">موعد الجلسة:</label>
                    <input
                      type="text"
                      placeholder="مثال: 09:30 ص"
                      value={newSession.time}
                      onChange={(e) => setNewSession({...newSession, time: e.target.value})}
                      required
                      className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">المحامي المسؤول المكلف أو اكتب اسمه:</label>
                    <input
                      type="text"
                      placeholder="اكتب اسم المحامي أو اختره"
                      value={newSession.lawyerId}
                      onChange={(e) => setNewSession({...newSession, lawyerId: e.target.value})}
                      required
                      list="session-lawyers-datalist"
                      className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                    <datalist id="session-lawyers-datalist">
                      {lawyers.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">العميل والموكل ذو العلاقة أو اكتب اسمه:</label>
                    <input
                      type="text"
                      placeholder="اكتب اسم العميل أو اختره"
                      value={newSession.tenantId}
                      onChange={(e) => setNewSession({...newSession, tenantId: e.target.value})}
                      required
                      list="session-tenants-datalist"
                      className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                    <datalist id="session-tenants-datalist">
                      {tenants.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">ملاحظات التحضير الفني والطلبات:</label>
                  <input
                    type="text"
                    placeholder="مثال: إحضار شهادة الشهود الأصلية والوكالة سارية المفعول"
                    value={newSession.notes}
                    onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                    className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSessionForm(false)}
                    className="border border-slate-800 hover:bg-slate-900 text-slate-300 py-2 px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 py-2 px-6 rounded-xl text-xs font-black transition-colors cursor-pointer shadow-md shadow-amber-500/5"
                  >
                    حفظ وجدولة الجلسة فورياً
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sessions Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-300 text-[10px] uppercase border-b border-slate-800/80">
                  <tr>
                    <th className="py-4 px-4 font-bold">موضوع القضية</th>
                    <th className="py-4 px-4 font-bold">تاريخ وموعد الجلسة</th>
                    <th className="py-4 px-4 font-bold">أطراف النزاع والدعوى</th>
                    <th className="py-4 px-4 font-bold">المحامي المسؤول</th>
                    <th className="py-4 px-4 font-bold">العميل الموكل</th>
                    <th className="py-4 px-4 font-bold">موقع ومقر الدائرة</th>
                    <th className="py-4 px-4 font-bold">الحالة</th>
                    <th className="py-4 px-4 font-bold text-center">الإجراءات والتحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sessions.map((session) => {
                    const lawyer = lawyers.find(l => l.id === session.lawyerId);
                    const tenant = tenants.find(t => t.id === session.tenantId);

                    return (
                      <tr key={session.id} className="hover:bg-slate-950/40 transition-colors">
                        <td className="py-4 px-4">
                          <span className="font-bold block text-slate-100">{session.caseTitle}</span>
                          <span className="text-[10px] text-amber-500 font-mono block mt-1">رمز الدعوى: {session.caseId}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 text-slate-200 font-bold">
                            <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                            <span>{session.day} - {session.date}</span>
                          </div>
                          <span className="text-[11px] text-amber-400 font-black block mt-1">{session.time}</span>
                        </td>
                        <td className="py-4 px-4 space-y-1">
                          <div><span className="text-slate-500">المدعي:</span> <span className="font-semibold text-slate-200">{session.plaintiff}</span></div>
                          <div><span className="text-slate-500">المدعي عليه:</span> <span className="font-semibold text-slate-200">{session.defendant}</span></div>
                        </td>
                        <td className="py-4 px-4 text-slate-300">
                          {lawyer ? (
                            <div>
                              <span className="font-bold block text-slate-100">{lawyer.name}</span>
                              <span className="text-[10px] text-slate-400">{lawyer.specialty}</span>
                            </div>
                          ) : (
                            <span className="font-bold block text-slate-100">{session.lawyerId || 'غير مكلف بعد'}</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-slate-300">
                          {tenant ? (
                            <div>
                              <span className="font-bold block text-slate-100">{tenant.name}</span>
                              <span className="text-[10px] text-slate-500">عقد/ملف: {tenant.propertyNo}</span>
                            </div>
                          ) : (
                            <span className="font-bold block text-slate-100">{session.tenantId || 'لا يوجد موكل مرتبط'}</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-slate-400 max-w-[150px] truncate" title={session.courtRoom}>
                          {session.courtRoom}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-lg ${
                            session.status === 'scheduled' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            session.status === 'postponed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {session.status === 'scheduled' ? 'مجدولة' : session.status === 'postponed' ? 'مؤجلة' : 'منتهية'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <select
                              value={session.status}
                              onChange={(e) => onUpdateSessionStatus(session.id, e.target.value as any)}
                              className="text-[11px] p-1.5 border border-slate-800 rounded-lg bg-slate-950 text-slate-300 focus:outline-none"
                            >
                              <option value="scheduled">مجدولة</option>
                              <option value="postponed">مؤجلة</option>
                              <option value="completed">منتهية</option>
                            </select>

                            <button
                              onClick={() => sendCaseStatusNotification(session)}
                              title="بث تنبيه وإشعار فوري للطرفين"
                              className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors cursor-pointer border border-amber-500/10"
                            >
                              <Bell className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm('هل أنت متأكد من حذف موعد هذه الجلسة؟')) {
                                  onDeleteSession(session.id);
                                }
                              }}
                              title="حذف الجلسة"
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer border border-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {sessions.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs">لا توجد جلسات مجدولة حالياً.</div>
            )}
          </div>
        </div>
      )}

      {/* 3. INVOICES MANAGEMENT TAB */}
      {activeTab === 'invoices' && (
        <div id="invoices-tab-content" className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-base text-slate-100">فواتير ومطالبات أتعاب الخدمات القانونية</h3>
              <p className="text-xs text-slate-400">تحصيل الأتعاب، إصدار الفواتير القضائية والاستشارية الجديدة، وتنبيه الموكلين بالسداد الرقمي.</p>
            </div>
            <button
              onClick={() => setShowInvoiceForm(!showInvoiceForm)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              {showInvoiceForm ? 'إغلاق النموذج' : 'إصدار مطالبة مالية جديدة'}
            </button>
          </div>

          {/* Add Invoice Form */}
          {showInvoiceForm && (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 transition-all">
              <h4 className="font-bold text-sm text-amber-400 mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-500" />
                بيانات المطالبة القانونية وفاتورة الأتعاب الجديدة
              </h4>
              <form onSubmit={handleAddInvoiceSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">العميل والموكل المستهدف أو اكتب اسمه:</label>
                    <input
                      type="text"
                      placeholder="اكتب اسم الموكل المستهدف"
                      value={newInvoice.tenantId}
                      onChange={(e) => setNewInvoice({...newInvoice, tenantId: e.target.value})}
                      required
                      list="invoice-tenants-datalist"
                      className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500/50 focus:outline-none"
                    />
                    <datalist id="invoice-tenants-datalist">
                      {tenants.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">المبلغ المطلوب (ريال سعودي):</label>
                    <input
                      type="number"
                      placeholder="مثال: 12500"
                      value={newInvoice.amount}
                      onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                      required
                      className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">حالة الدفع للبدء:</label>
                    <select
                      value={newInvoice.status}
                      onChange={(e) => setNewInvoice({...newInvoice, status: e.target.value as any})}
                      className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="unpaid">مستحقة (غير مدفوعة)</option>
                      <option value="paid">مدفوعة ومحصلة</option>
                      <option value="overdue">متأخرة السداد</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">تاريخ إصدار الفاتورة:</label>
                    <input
                      type="date"
                      value={newInvoice.issueDate}
                      onChange={(e) => setNewInvoice({...newInvoice, issueDate: e.target.value})}
                      required
                      className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">تاريخ الاستحقاق النهائي:</label>
                    <input
                      type="date"
                      value={newInvoice.dueDate}
                      onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                      required
                      className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">وصف الفاتورة (موجب أتعاب الخدمة):</label>
                  <input
                    type="text"
                    placeholder="مثال: أتعاب صياغة لوائح الاعتراض أو القسط الثاني للمرافعات"
                    value={newInvoice.description}
                    onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                    required
                    className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInvoiceForm(false)}
                    className="border border-slate-800 hover:bg-slate-900 text-slate-300 py-2 px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 py-2 px-6 rounded-xl text-xs font-black transition-colors cursor-pointer shadow-md shadow-amber-500/5"
                  >
                    إصدار الفاتورة والمطالبة فوراً
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Invoices Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-300 text-[10px] uppercase border-b border-slate-800/80">
                  <tr>
                    <th className="py-4 px-4 font-bold">رقم الفاتورة</th>
                    <th className="py-4 px-4 font-bold">الموكل المستهدف</th>
                    <th className="py-4 px-4 font-bold">الوصف وبند الخدمة القضائية</th>
                    <th className="py-4 px-4 font-bold">قيمة الأتعاب</th>
                    <th className="py-4 px-4 font-bold">تاريخ الإصدار</th>
                    <th className="py-4 px-4 font-bold">موعد الاستحقاق</th>
                    <th className="py-4 px-4 font-bold">الحالة</th>
                    <th className="py-4 px-4 font-bold text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {invoices.map((invoice) => {
                    const tenant = tenants.find(t => t.id === invoice.tenantId);
                    return (
                      <tr key={invoice.id} className="hover:bg-slate-950/40 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-amber-400">
                          {invoice.id}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-bold block text-slate-100">{invoice.tenantName}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">ملف القضية: {tenant?.propertyNo || 'لا يوجد ملف'}</span>
                        </td>
                        <td className="py-4 px-4 text-slate-300 max-w-[220px] truncate" title={invoice.description}>
                          {invoice.description}
                        </td>
                        <td className="py-4 px-4 font-black text-slate-100">
                          {invoice.amount.toLocaleString('en-US')} ريال
                        </td>
                        <td className="py-4 px-4 text-slate-400 text-[10px]">{invoice.issueDate}</td>
                        <td className="py-4 px-4 text-slate-200 font-bold">{invoice.dueDate}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-lg border ${
                            invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            invoice.status === 'unpaid' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {invoice.status === 'paid' ? 'مسددة بالكامل' : invoice.status === 'unpaid' ? 'مستحقة للدفع' : 'متأخرة السداد'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onUpdateInvoiceStatus(invoice.id, invoice.status === 'paid' ? 'unpaid' : 'paid')}
                              className={`text-[10px] px-2.5 py-1.5 rounded-xl font-bold cursor-pointer transition-all border ${
                                invoice.status === 'paid'
                                  ? 'border-slate-800 text-slate-300 hover:bg-slate-950'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 border-transparent font-black'
                              }`}
                            >
                              {invoice.status === 'paid' ? 'تعديل لـ مستحقة' : 'تحديد كـ مدفوعة'}
                            </button>

                            {invoice.status !== 'paid' && (
                              <button
                                onClick={() => sendInvoiceReminderNotification(invoice)}
                                title="إرسال تذكير سداد عاجل"
                                className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors cursor-pointer border border-amber-500/10"
                              >
                                <Bell className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
                                  onDeleteInvoice(invoice.id);
                                }
                              }}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer border border-red-500/10"
                              title="حذف الفاتورة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {invoices.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs">لا توجد فواتير مسجلة حالياً.</div>
            )}
          </div>
        </div>
      )}

      {/* 4. PEOPLE/USERS TAB */}
      {activeTab === 'people' && (
        <div id="people-tab-content" className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Lawyers List */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <h3 className="font-extrabold text-sm text-slate-100">
                    قائمة المستشارين والمحامين بالمكتب
                  </h3>
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold px-2.5 py-1 rounded-full">
                    {lawyers.length} مستشار ومحامي
                  </span>
                  <button
                    onClick={() => setShowLawyerForm(!showLawyerForm)}
                    className="text-xs font-black text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    {showLawyerForm ? 'إلغاء' : '+ إضافة محامي'}
                  </button>
                </div>
              </div>

              {showLawyerForm && (
                <form onSubmit={handleAddLawyerSubmit} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-extrabold text-amber-400">إضافة حساب محامي جديد</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="الاسم الكامل"
                      required
                      value={newLawyer.name}
                      onChange={e => setNewLawyer({...newLawyer, name: e.target.value})}
                      className="text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="التخصص (مثال: تجاري، أحوال شخصية)"
                      required
                      value={newLawyer.specialty}
                      onChange={e => setNewLawyer({...newLawyer, specialty: e.target.value})}
                      className="text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="email"
                      placeholder="البريد الإلكتروني"
                      required
                      value={newLawyer.email}
                      onChange={e => setNewLawyer({...newLawyer, email: e.target.value})}
                      className="text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="رقم الجوال"
                      required
                      value={newLawyer.phone}
                      onChange={e => setNewLawyer({...newLawyer, phone: e.target.value})}
                      className="text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="كلمة المرور الافتراضية للدخول"
                      required
                      value={newLawyer.password}
                      onChange={e => setNewLawyer({...newLawyer, password: e.target.value})}
                      className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    تأكيد الإضافة وتفعيل الحساب
                  </button>
                </form>
              )}
              
              <div className="divide-y divide-slate-800 max-h-[400px] overflow-y-auto pr-1">
                {lawyers.map(l => (
                  <div key={l.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-100">{l.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">التخصص الاستشاري: <span className="text-amber-400 font-bold">{l.specialty}</span></p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        <span className="text-[10px] text-slate-500">📧 {l.email}</span>
                        <span className="text-[10px] text-slate-500">📞 {l.phone}</span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">🔑 كلمة المرور: {l.password || '123'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-[9px] font-mono bg-slate-950 text-slate-500 px-2 py-0.5 rounded-lg border border-slate-800">
                        ID: {l.id}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من إلغاء حساب المحامي (${l.name})؟`)) {
                            onDeleteLawyer(l.id);
                          }
                        }}
                        className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        إلغاء الترخيص والحساب
                      </button>
                    </div>
                  </div>
                ))}
                {lawyers.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">لا يوجد محامين مسجلين حالياً.</p>
                )}
              </div>
            </div>

            {/* Clients List */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  <h3 className="font-extrabold text-sm text-slate-100">
                    دليل السادة العملاء والموكلين المقيدين
                  </h3>
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold px-2.5 py-1 rounded-full">
                    {tenants.length} عملاء موكلين
                  </span>
                  <button
                    onClick={() => setShowTenantForm(!showTenantForm)}
                    className="text-xs font-black text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    {showTenantForm ? 'إلغاء' : '+ إضافة عميل'}
                  </button>
                </div>
              </div>

              {showTenantForm && (
                <form onSubmit={handleAddTenantSubmit} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-extrabold text-amber-400">إضافة ملف عميل وموكل جديد</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="الاسم الكامل للموكل"
                      required
                      value={newTenant.name}
                      onChange={e => setNewTenant({...newTenant, name: e.target.value})}
                      className="text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="عنوان الدعوى أو رقم العقد"
                      required
                      value={newTenant.propertyNo}
                      onChange={e => setNewTenant({...newTenant, propertyNo: e.target.value})}
                      className="text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="email"
                      placeholder="البريد الإلكتروني للموكل"
                      required
                      value={newTenant.email}
                      onChange={e => setNewTenant({...newTenant, email: e.target.value})}
                      className="text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="رقم الجوال المعتمد"
                      required
                      value={newTenant.phone}
                      onChange={e => setNewTenant({...newTenant, phone: e.target.value})}
                      className="text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="كلمة المرور الافتراضية المخصصة للموكل للدخول"
                      required
                      value={newTenant.password}
                      onChange={e => setNewTenant({...newTenant, password: e.target.value})}
                      className="w-full text-xs p-2.5 border border-slate-800 rounded-xl bg-slate-900 text-slate-200 focus:border-amber-500 focus:outline-none font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    تأكيد قيد الموكل وتنشيط الملف
                  </button>
                </form>
              )}

              <div className="divide-y divide-slate-800 max-h-[400px] overflow-y-auto pr-1">
                {tenants.map(t => (
                  <div key={t.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-100">{t.name}</h4>
                      <p className="text-[11px] text-amber-400 font-bold mt-1">ملف القضية/العقد: {t.propertyNo}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        <span className="text-[10px] text-slate-500">📧 {t.email}</span>
                        <span className="text-[10px] text-slate-500">📞 {t.phone}</span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">🔑 كلمة المرور: {t.password || '123'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-[9px] font-mono bg-slate-950 text-slate-500 px-2 py-0.5 rounded-lg border border-slate-800">
                        ID: {t.id}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف العميل والموكل (${t.name}) وملفه؟`)) {
                            onDeleteTenant(t.id);
                          }
                        }}
                        className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        شطب وإلغاء الملف
                      </button>
                    </div>
                  </div>
                ))}
                {tenants.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">لا يوجد عملاء مقيدين بالمنصة حالياً.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
