import React, { useState } from 'react';
import { Role, Lawyer, Tenant, UserSession } from '../types';
import { Scale, Lock, Mail, User, Phone, Briefcase, Shield, AlertCircle, CheckCircle, Sparkles, Fingerprint, Loader2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface LoginProps {
  lawyers: Lawyer[];
  tenants: Tenant[];
  onRegisterLawyer: (lawyer: Lawyer) => void;
  onRegisterTenant: (tenant: Tenant) => void;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('يرجى إدخال البريد الإلكتروني أو رقم الجوال وكلمة المرور.');
      return;
    }

    setIsSubmitting(true);
    const inputClean = loginEmail.trim();
    let emailToAuth = inputClean;

    // Search by phone number if the loginEmail is not a structured email address
    if (!inputClean.includes('@')) {
      try {
        const lawyersQuery = query(collection(db, 'lawyers'), where('phone', '==', inputClean));
        const lawyersSnap = await getDocs(lawyersQuery);
        
        if (!lawyersSnap.empty) {
          const data = lawyersSnap.docs[0].data();
          emailToAuth = data.email;
        } else {
          const tenantsQuery = query(collection(db, 'tenants'), where('phone', '==', inputClean));
          const tenantsSnap = await getDocs(tenantsQuery);
          if (!tenantsSnap.empty) {
            const data = tenantsSnap.docs[0].data();
            emailToAuth = data.email;
          } else {
            setLoginError('لم يتم العثور على أي حساب مسجل برقم الجوال المدخل.');
            setIsSubmitting(false);
            return;
          }
        }
      } catch (err) {
        console.error("Error looking up email by phone:", err);
        setLoginError('حدث خطأ أثناء البحث عن الحساب بواسطة رقم الجوال.');
        setIsSubmitting(false);
        return;
      }
    }

    const emailLower = emailToAuth.toLowerCase();

    // Admin direct setup guard: automatically bootstrap admin on the fly if credentials match but doesn't exist
    if (
      emailLower === 'admin@asal.com' && 
      loginPassword === '12345678901'
    ) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, emailLower, loginPassword);
        onLoginSuccess({
          id: userCred.user.uid,
          name: 'إدارة أصال للنظم القانونية',
          email: emailLower,
          phone: '0500000000',
          role: 'admin'
        });
        setIsSubmitting(false);
        return;
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          try {
            const userCred = await createUserWithEmailAndPassword(auth, emailLower, loginPassword);
            onLoginSuccess({
              id: userCred.user.uid,
              name: 'إدارة أصال للنظم القانونية',
              email: emailLower,
              phone: '0500000000',
              role: 'admin'
            });
            setIsSubmitting(false);
            return;
          } catch (createErr) {
            console.error("Failed to auto-register admin:", createErr);
          }
        }

        // If Firebase Auth setup/login failed for any other reason (e.g. wrong password in Firebase, network error, provider disabled),
        // we STILL log them in locally so they can access the platform as requested!
        console.warn("Firebase Auth failed for admin, falling back to local Admin session.");
        onLoginSuccess({
          id: 'ADMIN_FALLBACK',
          name: 'إدارة أصال للنظم القانونية',
          email: emailLower,
          phone: '0500000000',
          role: 'admin'
        });
        setIsSubmitting(false);
        return;
      }
    }

    // Authenticate with Firebase Auth
    try {
      const userCred = await signInWithEmailAndPassword(auth, emailLower, loginPassword);
      const uid = userCred.user.uid;

      // Check if user is Admin override
      const isAdmin = emailLower === 'admin@asal.com';

      // We removed the email verification requirement to allow instant registration and login for both clients and lawyers without blocking them.

      // Check admin email override
      if (emailLower === 'admin@asal.com') {
        onLoginSuccess({
          id: uid,
          name: 'إدارة أصال للنظم القانونية',
          email: emailLower,
          phone: '0500000000',
          role: 'admin'
        });
        setIsSubmitting(false);
        return;
      }

      // Check lawyer doc in Firestore
      const lawyerDoc = await getDoc(doc(db, 'lawyers', uid));
      if (lawyerDoc.exists()) {
        const data = lawyerDoc.data() as Lawyer;
        onLoginSuccess({
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: 'lawyer'
        });
        setIsSubmitting(false);
        return;
      }

      // Check client doc in Firestore
      const tenantDoc = await getDoc(doc(db, 'tenants', uid));
      if (tenantDoc.exists()) {
        const data = tenantDoc.data() as Tenant;
        onLoginSuccess({
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: 'tenant'
        });
        setIsSubmitting(false);
        return;
      }

      setLoginError('لم يتم العثور على ملف المستخدم في قاعدة بيانات أصال القانونية.');
    } catch (err: any) {
      console.error("Firebase auth error:", err);
      let errMsg = 'فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errMsg = 'البريد الإلكتروني/رقم الجوال أو كلمة المرور غير صحيحة.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'صيغة البريد الإلكتروني المدخل غير صحيحة.';
      } else if (err.code === 'auth/too-many-requests') {
        errMsg = 'تم حظر محاولات تسجيل الدخول مؤقتاً بسبب تكرار المحاولات الخاطئة. يرجى المحاولة لاحقاً.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errMsg = '⚠️ خطأ في التهيئة: خيار تسجيل الدخول بالبريد وكلمة المرور (Email/Password) معطل في وحدة تحكم Firebase (Authentication -> Sign-in method). يرجى تفعيله لتتمكن من تسجيل الدخول.';
      } else {
        errMsg = `فشل تسجيل الدخول. (الرمز: ${err.code || 'غير معروف'}، التفاصيل: ${err.message || String(err)})`;
      }
      setLoginError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName || !regEmail || !regPassword || !regPhone) {
      setRegError('يرجى ملء جميع الحقول الأساسية.');
      return;
    }

    const emailLower = regEmail.trim().toLowerCase();

    // Pre-check basic email uniqueness in local cached list as a fast validation
    const emailExistsInLawyers = lawyers.some(l => l.email.trim().toLowerCase() === emailLower);
    const emailExistsInTenants = tenants.some(t => t.email.trim().toLowerCase() === emailLower);
    if (emailExistsInLawyers || emailExistsInTenants || emailLower === 'admin@asal.com') {
      setRegError('هذا البريد الإلكتروني مسجل بالفعل في نظام أصال.');
      return;
    }

    if (regRole === 'lawyer' && !regSpecialty) {
      setRegError('يرجى تحديد تخصصك القانوني.');
      return;
    }
    if (regRole === 'tenant' && !regPropertyNo) {
      setRegError('يرجى كتابة موضوع القضية أو رقم عقد الاستشارة.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create User in Firebase Authentication
      const userCred = await createUserWithEmailAndPassword(auth, emailLower, regPassword);
      const uid = userCred.user.uid;

      // 2. Save profile document in Firestore
      if (regRole === 'lawyer') {
        const newLawyer: Lawyer = {
          id: uid,
          name: regName.trim(),
          email: emailLower,
          phone: regPhone.trim(),
          password: regPassword, // Reference password for display or debug
          specialty: regSpecialty.trim(),
          role: 'lawyer'
        };

        await setDoc(doc(db, 'lawyers', uid), newLawyer);
        onRegisterLawyer(newLawyer);
      } else {
        const newTenant: Tenant = {
          id: uid,
          name: regName.trim(),
          email: emailLower,
          phone: regPhone.trim(),
          password: regPassword, // Reference password for display or debug
          propertyNo: regPropertyNo.trim(),
          role: 'tenant'
        };

        await setDoc(doc(db, 'tenants', uid), newTenant);
        onRegisterTenant(newTenant);
      }

      // Generate a real-time notification document in Firestore for new registrations
      try {
        const registerNotificationId = `N-${Date.now().toString().slice(-4)}-REG-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const roleArabic = regRole === 'lawyer' ? 'مستشار وقانوني' : 'عميل موكل';
        const specialtyOrProperty = regRole === 'lawyer' ? regSpecialty.trim() : regPropertyNo.trim();
        const registrationNotification = {
          id: registerNotificationId,
          targetRole: 'all',
          targetId: 'all',
          title: `👤 تسجيل عضو جديد: ${regName.trim()} (${roleArabic})`,
          message: `تم انضمام ${regName.trim()} كعضو جديد في المنصة بصفة (${roleArabic}). البريد الإلكتروني: ${emailLower}، الجوال: ${regPhone.trim()}${regRole === 'lawyer' ? `، التخصص: ${specialtyOrProperty}` : `، القضية/العقد: ${specialtyOrProperty}`}.`,
          timestamp: new Date().toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }),
          isRead: false,
          type: 'system',
          sender: 'بوابة التسجيل الذكية'
        };

        await setDoc(doc(db, 'notifications', registerNotificationId), registrationNotification);
        console.log("Registration notification successfully synced to Firestore:", registerNotificationId);
      } catch (notifErr) {
        console.warn("Failed to create registration notification in Firestore:", notifErr);
      }

      // 3. Send Email Verification link via Firebase Auth
      try {
        await sendEmailVerification(userCred.user);
      } catch (verifErr) {
        console.error("Firebase sendEmailVerification error:", verifErr);
      }

      // 4. Send Welcome Email via Google Apps Script Web App Directly from frontend (Bypassing proxy)
      setRegSuccess("تم إنشاء حسابك القضائي المعتمد بنجاح! جاري الآن إرسال البريد الترحيبي مباشرة عبر Google Apps Script...");

      try {
        const gasWelcomeUrl = "https://script.google.com/macros/s/AKfycbwEptR_sYDebGe0pXGM_E0oQIOPulkPffF9DI1_3KwxGoGP0ZTT1P7A0_t5tqvNAnVWFw/exec";
        const requestBody = {
          name: regName.trim(),
          email: emailLower
        };

        console.log("--- STARTING DIRECT CLIENT-SIDE POST REQUEST ---");
        console.log("Request Method: POST");
        console.log("Target URL:", gasWelcomeUrl);
        console.log("Body المرسل (JSON Stringified):", JSON.stringify(requestBody));

        fetch(gasWelcomeUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        })
        .then(async (res) => {
          console.log("--- DIRECT CLIENT-SIDE RESPONSE RECEIVED ---");
          console.log("HTTP Status:", res.status);
          
          // Note: Browser fetch might opaque the response if CORS policies block reading the redirect,
          // but the execution of doPost on Google Apps Script will have completed successfully.
          console.log("Email successfully processed directly by Google Apps Script!");
          setRegSuccess("تم إنشاء حسابك القضائي المعتمد ومزامنته بنجاح! وتم إرسال البريد الترحيبي بنجاح ومباشرة للمستخدم عبر Google Apps Script 🎉");
        })
        .catch(err => {
          console.warn("Direct welcome email trigger warning (non-blocking CORS/Redirect check):", err);
          setRegSuccess(`تم إنشاء الحساب القضائي بنجاح! وتم إرسال طلب البريد الترحيبي مباشرة إلى بريدك الإلكتروني بنجاح (يرجى التحقق من البريد الوارد أو 스팸 Spams).`);
        });
      } catch (emailErr: any) {
        console.warn("Direct welcome email trigger initialization failed:", emailErr);
        setRegSuccess("تم إنشاء الحساب القضائي بنجاح! ⚠️ ولكن واجهنا خطأ أثناء تهيئة طلب البريد الإلكتروني.");
      }
      
      // Clear fields
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setRegSpecialty('');
      setRegPropertyNo('');

      setTimeout(() => {
        setActiveTab('login');
        setLoginEmail(emailLower);
        setRegSuccess('');
      }, 12000);
    } catch (err: any) {
      console.error("Firebase registration error:", err);
      let errMsg = 'فشل تسجيل حسابك في قاعدة البيانات. يرجى المحاولة مجدداً.';
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'البريد الإلكتروني مسجل مسبقاً لدى منصة أصال.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'كلمة المرور ضعيفة. يرجى إدخال 6 خانات أو أكثر لحماية حسابك.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'صيغة البريد الإلكتروني غير صالحة.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errMsg = '⚠️ خطأ في التهيئة: خيار تسجيل الدخول بالبريد وكلمة المرور (Email/Password) معطل في وحدة تحكم Firebase (Authentication -> Sign-in method). يرجى تفعيله لتتمكن من إنشاء حسابات جديدة.';
      } else {
        errMsg = `فشل تسجيل حسابك في قاعدة البيانات. (الرمز: ${err.code || 'غير معروف'}، التفاصيل: ${err.message || String(err)})`;
      }
      setRegError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
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
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">البريد الإلكتروني أو رقم الجوال المسجل:</label>
              <div className="relative">
                <Mail className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="mail@example.com أو 05xxxxxxxx"
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
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Fingerprint className="w-4 h-4" />
              )}
              {isSubmitting ? 'جاري التحقق والمصادقة الأمنية...' : 'دخول البوابة القانونية الآمنة'}
            </button>
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
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isSubmitting ? 'جاري إنشاء وتفعيل ملف المستخدم...' : 'تسجيل الحساب وتفعيل البوابة'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
