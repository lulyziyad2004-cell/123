import React, { useState } from 'react';
import { Role, Lawyer, Tenant, UserSession } from '../types';
import { Scale, Lock, Mail, User, Phone, Briefcase, Shield, AlertCircle, CheckCircle, Sparkles, Fingerprint } from 'lucide-react';

interface LoginProps {
  lawyers: Lawyer[];
  tenants: Tenant[];
  onRegisterLawyer: (lawyer: Omit<Lawyer, 'id'>) => void;
  onRegisterTenant: (tenant: Omit<Tenant, 'id'>) => void;
  onLoginSuccess: (session: UserSession) => void;
}

export default function Login({
  lawyers,
  tenants,
  onRegisterLawyer,
  onRegisterTenant,
  onLoginSuccess
}: LoginProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Registration Form States
  const [regRole, setRegRole] = useState<'lawyer' | 'tenant'>('tenant');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSpecialty, setRegSpecialty] = useState('');
  const [regPropertyNo, setRegPropertyNo] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regError, setRegError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    const emailLower = loginEmail.trim().toLowerCase();

    // 1. Check Admin
    if (emailLower === 'admin@asal.com' && loginPassword === 'admin123') {
      onLoginSuccess({
        id: 'ADMIN',
        name: 'إدارة أصال للنظم القانونية',
        email: 'admin@asal.com',
        role: 'admin'
      });
      return;
    }

    // 2. Check Lawyers
    const foundLawyer = lawyers.find(l => l.email.trim().toLowerCase() === emailLower);
    if (foundLawyer) {
      const storedPassword = foundLawyer.password || '123';
      if (loginPassword === storedPassword) {
        onLoginSuccess({
          id: foundLawyer.id,
          name: foundLawyer.name,
          email: foundLawyer.email,
          role: 'lawyer'
        });
        return;
      } else {
        setLoginError('كلمة المرور غير صحيحة للمستشار القانوني.');
        return;
      }
    }

    // 3. Check Clients (Tenants)
    const foundTenant = tenants.find(t => t.email.trim().toLowerCase() === emailLower);
    if (foundTenant) {
      const storedPassword = foundTenant.password || '123';
      if (loginPassword === storedPassword) {
        onLoginSuccess({
          id: foundTenant.id,
          name: foundTenant.name,
          email: foundTenant.email,
          role: 'tenant'
        });
        return;
      } else {
        setLoginError('كلمة المرور غير صحيحة للعميل.');
        return;
      }
    }

    setLoginError('لم يتم العثور على حساب مسجل بهذا البريد الإلكتروني. يرجى إنشاء حساب جديد أولاً.');
  };

  const handleQuickAdminLogin = () => {
    onLoginSuccess({
      id: 'ADMIN',
      name: 'إدارة أصال للنظم القانونية',
      email: 'admin@asal.com',
      role: 'admin'
    });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName || !regEmail || !regPassword || !regPhone) {
      setRegError('يرجى ملء جميع الحقول الأساسية.');
      return;
    }

    const emailLower = regEmail.trim().toLowerCase();

    // Check duplication
    const emailExistsInLawyers = lawyers.some(l => l.email.trim().toLowerCase() === emailLower);
    const emailExistsInTenants = tenants.some(t => t.email.trim().toLowerCase() === emailLower);
    if (emailExistsInLawyers || emailExistsInTenants || emailLower === 'admin@asal.com') {
      setRegError('هذا البريد الإلكتروني مسجل بالفعل في النظام.');
      return;
    }

    if (regRole === 'lawyer') {
      if (!regSpecialty) {
        setRegError('يرجى تحديد تخصصك القانوني.');
        return;
      }
      onRegisterLawyer({
        name: regName.trim(),
        email: emailLower,
        phone: regPhone.trim(),
        password: regPassword,
        specialty: regSpecialty.trim()
      });
    } else {
      if (!regPropertyNo) {
        setRegError('يرجى كتابة موضوع القضية أو رقم عقد الاستشارة.');
        return;
      }
      onRegisterTenant({
        name: regName.trim(),
        email: emailLower,
        phone: regPhone.trim(),
        password: regPassword,
        propertyNo: regPropertyNo.trim()
      });
    }

    setRegSuccess('تم إنشاء الحساب بنجاح! يمكنك الآن الانتقال لتبويب تسجيل الدخول ودخول بوابتك الخاصة.');
    
    // Clear registration fields
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegPassword('');
    setRegSpecialty('');
    setRegPropertyNo('');

    // Switch to login tab after 3s
    setTimeout(() => {
      setActiveTab('login');
      setLoginEmail(emailLower);
      setRegSuccess('');
    }, 3000);
  };

  return (
    <div className="max-w-md mx-auto my-6 bg-slate-900 border border-amber-500/20 rounded-3xl shadow-2xl shadow-amber-500/5 overflow-hidden animate-fade-in" dir="rtl">
      
      {/* Branding Header with Luxury Antique Gold theme */}
      <div className="p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-slate-100 text-center relative border-b border-amber-500/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Outer Premium Gold Ring Icon */}
        <div className="w-16 h-16 bg-gradient-to-tr from-amber-600 to-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/10 border border-amber-400/30">
          <Scale className="w-8 h-8 text-slate-950 stroke-[1.5]" />
        </div>
        
        <h2 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300">
          مـنـصـة أَصـال الـقـانـونـيـة
        </h2>
        <p className="text-xs text-amber-500/80 mt-1.5 font-medium tracking-wide">
          بوابة المحاماة والاستشارات القانونية والربط القضائي التفاعلي
        </p>
      </div>

      {/* QUICK ADMIN TAB (DEDICATED ADMIN SECTION ACCESS) */}
      <div className="px-6 pt-4 pb-1 bg-slate-950/40">
        <div 
          onClick={handleQuickAdminLogin}
          className="group cursor-pointer p-3 bg-gradient-to-r from-amber-500/10 to-amber-600/5 hover:from-amber-500/20 hover:to-amber-600/10 border border-amber-500/30 rounded-2xl flex items-center justify-between transition-all duration-300 shadow-md hover:shadow-lg shadow-amber-500/5"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div className="text-right">
              <h4 className="text-xs font-black text-amber-300">خانة الإدارة والتحكم العام 🛠️</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">الدخول الفوري كمدير النظام لإدارة القضايا والفواتير وجدولة الجلسات</p>
            </div>
          </div>
          <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-lg shadow-sm group-hover:bg-amber-400 transition-colors">
            دخول فوري
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/20">
        <button
          onClick={() => {
            setActiveTab('login');
            setLoginError('');
          }}
          className={`flex-1 py-4 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 ${
            activeTab === 'login'
              ? 'border-amber-500 text-amber-400 bg-slate-950/40'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          تسجيل الدخول الآمن
        </button>
        <button
          onClick={() => {
            setActiveTab('register');
            setRegError('');
          }}
          className={`flex-1 py-4 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 ${
            activeTab === 'register'
              ? 'border-amber-500 text-amber-400 bg-slate-950/40'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          إنشاء ملف مستخدم جديد
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        
        {/* LOGIN TAB */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3.5 bg-red-950/30 text-red-400 border border-red-900/40 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">البريد الإلكتروني المسجل:</label>
              <div className="relative">
                <Mail className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="mail@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full text-xs p-3 pr-10 border border-slate-800 rounded-xl bg-slate-950 text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">كلمة المرور:</label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full text-xs p-3 pr-10 border border-slate-800 rounded-xl bg-slate-950 text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5"
            >
              <Fingerprint className="w-4 h-4" />
              دخول البوابة القانونية الآمنة
            </button>

            {/* Quick credentials helper for demonstration */}
            <div className="pt-4 border-t border-slate-800/60 text-[10px] text-slate-400 space-y-2">
              <span className="font-bold block text-slate-500">💡 الحساب الإداري الموحد لتعبئة وإدارة المنصة:</span>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">المدير (الإدارة):</span>
                  <span className="font-mono text-amber-400">admin@asal.com (رقم سري: admin123)</span>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* REGISTRATION TAB */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {regError && (
              <div className="p-3 bg-red-950/30 text-red-400 border border-red-900/40 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3 bg-emerald-950/30 text-emerald-400 border border-emerald-900/40 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            {/* Role Select in Signup */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">نوع الحساب والصفة:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRegRole('tenant')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    regRole === 'tenant'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <User className="w-4 h-4" />
                  عميل وموكل جديد
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('lawyer')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    regRole === 'lawyer'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  مستشار قانوني
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">الاسم الكامل:</label>
              <div className="relative">
                <User className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="الاسم الثلاثي للتسجيل في اللائحة"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full text-xs p-3 pr-10 border border-slate-800 rounded-xl bg-slate-950 text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">البريد الإلكتروني:</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="mail@asal.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full text-xs p-2.5 pr-9 border border-slate-800 rounded-xl bg-slate-950 text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">رقم الجوال:</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    placeholder="05xxxxxxxx"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full text-xs p-2.5 pr-9 border border-slate-800 rounded-xl bg-slate-950 text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">كلمة المرور للدخول:</label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="اختر كلمة مرور آمنة للدخول"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full text-xs p-3 pr-10 border border-slate-800 rounded-xl bg-slate-950 text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Dynamic fields based on role */}
            {regRole === 'lawyer' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">التخصص القانوني ومجال الاستشارات:</label>
                <div className="relative">
                  <Briefcase className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="مثال: القضايا العقارية، العقود التجارية والاندماج"
                    value={regSpecialty}
                    onChange={(e) => setRegSpecialty(e.target.value)}
                    className="w-full text-xs p-3 pr-10 border border-slate-800 rounded-xl bg-slate-950 text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">تفاصيل القضية أو رقم وموضوع العقد الاستشاري:</label>
                <div className="relative">
                  <Shield className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="مثال: قضية تعويضات مالية رقم 1024 / صياغة عقد الشركاء"
                    value={regPropertyNo}
                    onChange={(e) => setRegPropertyNo(e.target.value)}
                    className="w-full text-xs p-3 pr-10 border border-slate-800 rounded-xl bg-slate-950 text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              تسجيل الحساب وتفعيل البوابة
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
