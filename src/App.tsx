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
import { collection, doc, setDoc, deleteDoc, getDocs, onSnapshot, getDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, onDatabaseError } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
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
      if (cleanTitle.includes('محمداحمد') || cleanTitle.includes('محمدأحمد') || cleanTitle.includes('عمر') || cleanTitle.includes('عخم') || cleanTitle.toLowerCase().includes('omar') || cleanTitle.toLowerCase().includes('akhm') || cleanTitle.toLowerCase().includes('ekhm')) return false;
      if (cleanPlaintiff.includes('محمداحمد') || cleanPlaintiff.includes('محمدأحمد') || cleanPlaintiff.includes('عمر') || cleanPlaintiff.includes('عخم') || cleanPlaintiff.toLowerCase().includes('omar') || cleanPlaintiff.toLowerCase().includes('akhm') || cleanPlaintiff.toLowerCase().includes('ekhm')) return false;
      if (cleanDefendant.includes('محمداحمد') || cleanDefendant.includes('محمدأحمد') || cleanDefendant.includes('عمر') || cleanDefendant.includes('عخم') || cleanDefendant.toLowerCase().includes('omar') || cleanDefendant.toLowerCase().includes('akhm') || cleanDefendant.toLowerCase().includes('ekhm')) return false;
      return true;
    });
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('nazaha_invoices');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.filter((i: any) => {
      if (i.id === 'INV-4011' || i.tenantId === 'T1' || i.tenantId === 'T2') return false;
      const cleanName = (i.tenantName || '').replace(/\s+/g, '');
      if (cleanName.includes('محمداحمد') || cleanName.includes('محمدأحمد') || cleanName.includes('عمر') || cleanName.includes('عخم') || cleanName.toLowerCase().includes('omar') || cleanName.toLowerCase().includes('akhm') || cleanName.toLowerCase().includes('ekhm')) return false;
      return true;
    });
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('nazaha_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((n: any) => {
          const cleanTitle = (n.title || '').replace(/\s+/g, '');
          const cleanMsg = (n.message || '').replace(/\s+/g, '');
          if (cleanTitle.includes('محمداحمد') || cleanTitle.includes('محمدأحمد') || cleanTitle.includes('عمر') || cleanTitle.includes('عخم') || cleanTitle.toLowerCase().includes('omar') || cleanTitle.toLowerCase().includes('akhm') || cleanTitle.toLowerCase().includes('ekhm')) return false;
          if (cleanMsg.includes('محمداحمد') || cleanMsg.includes('محمدأحمد') || cleanMsg.includes('عمر') || cleanMsg.includes('عخم') || cleanMsg.toLowerCase().includes('omar') || cleanMsg.toLowerCase().includes('akhm') || cleanMsg.toLowerCase().includes('ekhm')) return false;
          return true;
        });
      } catch (e) {
        return DEMO_NOTIFICATIONS;
      }
    }
    return DEMO_NOTIFICATIONS;
  });

  const [lawyers, setLawyers] = useState<Lawyer[]>(() => {
    const saved = localStorage.getItem('asal_lawyers');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.filter((l: any) => {
      if (l.id === 'L1' || l.id === 'L2') return false;
      const cleanName = (l.name || '').replace(/\s+/g, '');
      if (cleanName.includes('محمداحمد') || cleanName.includes('محمدأحمد') || cleanName.includes('عمر') || cleanName.includes('عخم') || cleanName.toLowerCase().includes('omar') || cleanName.toLowerCase().includes('akhm') || cleanName.toLowerCase().includes('ekhm')) return false;
      return true;
    });
  });

  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('asal_tenants');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.filter((t: any) => {
      if (t.id === 'T1' || t.id === 'T2') return false;
      const cleanName = (t.name || '').replace(/\s+/g, '');
      if (cleanName.includes('محمداحمد') || cleanName.includes('محمدأحمد') || cleanName.includes('عمر') || cleanName.includes('عخم') || cleanName.toLowerCase().includes('omar') || cleanName.toLowerCase().includes('akhm') || cleanName.toLowerCase().includes('ekhm')) return false;
      return true;
    });
  });

  // Logged-in user session state
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('asal_session');
    const parsed = saved ? JSON.parse(saved) : null;
    if (parsed) {
      const cleanName = (parsed.name || '').replace(/\s+/g, '');
      if (cleanName.includes('محمداحمد') || cleanName.includes('محمدأحمد') || cleanName.includes('عمر') || cleanName.includes('عخم') || cleanName.toLowerCase().includes('omar') || cleanName.toLowerCase().includes('akhm') || cleanName.toLowerCase().includes('ekhm')) {
        return null;
      }
    }
    return parsed;
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

  // Database Connection / Configuration Error State
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    onDatabaseError((err, path, operation) => {
      console.warn(`Captured database error for path [${path}] during [${operation}]:`, err);
      setDbError(err);
    });
  }, []);

  // Listen to Firestore data in real-time with instant synchronization
  useEffect(() => {
    // 1. Listen to Lawyers
    const unsubLawyers = onSnapshot(collection(db, 'lawyers'), (snapshot) => {
      const list: Lawyer[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Lawyer);
      });
      if (list.length > 0) {
        setLawyers(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'lawyers');
    });

    // 2. Listen to Tenants
    const unsubTenants = onSnapshot(collection(db, 'tenants'), (snapshot) => {
      const list: Tenant[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Tenant);
      });
      if (list.length > 0) {
        setTenants(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tenants');
    });

    // 3. Listen to Sessions (Cases & court dates)
    const unsubSessions = onSnapshot(collection(db, 'sessions'), (snapshot) => {
      const list: Session[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Session);
      });
      setSessions(list.sort((a, b) => b.id.localeCompare(a.id)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'sessions');
    });

    // 4. Listen to Invoices (Payments)
    const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snapshot) => {
      const list: Invoice[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Invoice);
      });
      setInvoices(list.sort((a, b) => b.id.localeCompare(a.id)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'invoices');
    });

    // 5. Listen to Notifications
    const unsubNotifications = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const list: Notification[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Notification);
      });
      setNotifications(list.sort((a, b) => b.id.localeCompare(a.id)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'notifications');
    });

    return () => {
      unsubLawyers();
      unsubTenants();
      unsubSessions();
      unsubInvoices();
      unsubNotifications();
    };
  }, []);

  // Listen to Firebase Authentication State and load appropriate user profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email || '';
        const emailLower = email.toLowerCase();

        // 1. Check Admin Account Override
        if (emailLower === 'admin@asal.com') {
          const adminSession: UserSession = {
            id: firebaseUser.uid,
            name: 'إدارة أصال للنظم القانونية',
            email: emailLower,
            phone: '0500000000',
            role: 'admin'
          };
          setUserSession(adminSession);
          setCurrentRole('admin');
          localStorage.setItem('asal_session', JSON.stringify(adminSession));
          return;
        }

        // 2. Check Lawyer Profile inside Firestore
        try {
          const lawyerDoc = await getDoc(doc(db, 'lawyers', firebaseUser.uid));
          if (lawyerDoc.exists()) {
            const data = lawyerDoc.data() as Lawyer;
            const lawyerSession: UserSession = {
              id: data.id,
              name: data.name,
              email: data.email,
              phone: data.phone,
              role: 'lawyer'
            };
            setUserSession(lawyerSession);
            setCurrentRole('lawyer');
            localStorage.setItem('asal_session', JSON.stringify(lawyerSession));
            return;
          }
        } catch (e) {
          console.warn("Error loading lawyer profile:", e);
          const errStr = e instanceof Error ? e.message : String(e);
          if (errStr.includes("offline") || errStr.includes("permission")) {
            setDbError(errStr);
          }
        }

        // 3. Check Tenant (Client) Profile inside Firestore
        try {
          const tenantDoc = await getDoc(doc(db, 'tenants', firebaseUser.uid));
          if (tenantDoc.exists()) {
            const data = tenantDoc.data() as Tenant;
            const tenantSession: UserSession = {
              id: data.id,
              name: data.name,
              email: data.email,
              phone: data.phone,
              role: 'tenant'
            };
            setUserSession(tenantSession);
            setCurrentRole('tenant');
            localStorage.setItem('asal_session', JSON.stringify(tenantSession));
            return;
          }
        } catch (e) {
          console.warn("Error loading tenant profile:", e);
          const errStr = e instanceof Error ? e.message : String(e);
          if (errStr.includes("offline") || errStr.includes("permission")) {
            setDbError(errStr);
          }
        }

        // Fallback to locally stored session if DB query fails or delayed
        const localSess = localStorage.getItem('asal_session');
        if (localSess) {
          setUserSession(JSON.parse(localSess));
        }
      } else {
        // If there's no active Firebase user, check if we have an active admin fallback session
        const localSess = localStorage.getItem('asal_session');
        if (localSess) {
          const parsed = JSON.parse(localSess);
          if (parsed && parsed.email === 'admin@asal.com') {
            // Keep the admin session active!
            setUserSession(parsed);
            setCurrentRole('admin');
            return;
          }
        }
        setUserSession(null);
        localStorage.removeItem('asal_session');
      }
    });

    return () => unsubscribe();
  }, []);



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
    
    // Sync to Firestore
    try {
      setDoc(doc(db, 'lawyers', newLawyer.id), newLawyer);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `lawyers/${newLawyer.id}`);
    }

    // Send automated welcome email and SMS to the lawyer
    const welcomeMsg = `أهلاً بك المستشار القانوني ${newLawyer.name} في منصة أصال للمحاماة والاستشارات القانونية. تم إنشاء حسابك بنجاح بصفة مستشار ومحامي معتمد. نسعد بانضمامك إلينا ونتمنى لك مسيرة قانونية متميزة.`;
    sendRealNotification(newLawyer.email, newLawyer.phone, 'تم إنشاء حسابك بنجاح في منصة أصال ⚖️', welcomeMsg);
  };

  // Handle deleting a lawyer
  const handleDeleteLawyer = (id: string) => {
    setLawyers(prev => prev.filter(l => l.id !== id));
    
    // Sync to Firestore
    try {
      deleteDoc(doc(db, 'lawyers', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `lawyers/${id}`);
    }
  };

  // Handle adding a tenant
  const handleAddTenant = (newTenantData: Omit<Tenant, 'id'>) => {
    const newTenant: Tenant = {
      ...newTenantData,
      id: `T-${Date.now().toString().slice(-4)}`
    };
    setTenants(prev => [...prev, newTenant]);

    // Sync to Firestore
    try {
      setDoc(doc(db, 'tenants', newTenant.id), newTenant);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `tenants/${newTenant.id}`);
    }

    // Send automated welcome email and SMS to the tenant
    const welcomeMsg = `أهلاً بك يا ${newTenant.name} في منصة أصال للمحاماة والاستشارات القانونية. تم إنشاء حسابك بنجاح بصفة عميل موكل. نسعد بخدمتك وتقديم الدعم القضائي المتميز لحماية حقوقكم.`;
    sendRealNotification(newTenant.email, newTenant.phone, 'تم إنشاء حسابك بنجاح في منصة أصال ⚖️', welcomeMsg);
  };

  // Handle deleting a tenant
  const handleDeleteTenant = (id: string) => {
    setTenants(prev => prev.filter(t => t.id !== id));

    // Sync to Firestore
    try {
      deleteDoc(doc(db, 'tenants', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `tenants/${id}`);
    }
  };

  // Load complete pre-configured Demo Data
  const handleLoadDemoData = () => {
    setLawyers(DEMO_LAWYERS);
    setTenants(DEMO_TENANTS);
    setSessions(DEMO_SESSIONS);
    setInvoices(DEMO_INVOICES);
    setNotifications(DEMO_NOTIFICATIONS);

    // Sync all demo data to Firestore
    DEMO_LAWYERS.forEach(l => setDoc(doc(db, 'lawyers', l.id), l).catch(() => {}));
    DEMO_TENANTS.forEach(t => setDoc(doc(db, 'tenants', t.id), t).catch(() => {}));
    DEMO_SESSIONS.forEach(s => setDoc(doc(db, 'sessions', s.id), s).catch(() => {}));
    DEMO_INVOICES.forEach(i => setDoc(doc(db, 'invoices', i.id), i).catch(() => {}));
    DEMO_NOTIFICATIONS.forEach(n => setDoc(doc(db, 'notifications', n.id), n).catch(() => {}));
  };

  // Handle adding a session
  const handleAddSession = (newSessionData: Omit<Session, 'id'>, channels: { email: boolean; sms: boolean } = { email: true, sms: true }) => {
    const newSession: Session = {
      ...newSessionData,
      id: `S-${Date.now().toString().slice(-4)}`
    };
    setSessions(prev => [newSession, ...prev]);

    // Sync to Firestore
    try {
      setDoc(doc(db, 'sessions', newSession.id), newSession);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `sessions/${newSession.id}`);
    }

    // Lookup tenant and lawyer to send custom notifications with emails/SMS
    const tenant = tenants.find(t => t.id === newSession.tenantId);
    const lawyer = lawyers.find(l => l.id === newSession.lawyerId);

    const tenantName = tenant ? tenant.name : 'العميل';
    const lawyerName = lawyer ? lawyer.name : 'المستشار';

    // 1. Send email and SMS notification to the tenant (client)
    handleTriggerNotification(
      'tenant',
      newSession.tenantId,
      'تأكيد جدولة جلسة قضائية جديدة ⚖️',
      `أهلاً بك يا ${tenantName}، تم جدولة جلسة مرافعة جديدة لك في قضية "${newSession.caseTitle}" بخصوص ${newSession.plaintiff} ضد ${newSession.defendant}. الموعد: يوم ${newSession.day} الموافق ${newSession.date} الساعة ${newSession.time} في القاعة/الدائرة: ${newSession.courtRoom}. مع تمنياتنا بالتوفيق.`,
      'session',
      undefined,
      undefined,
      undefined,
      channels
    );

    // 2. Send email and SMS notification to the lawyer (counsel)
    handleTriggerNotification(
      'lawyer',
      newSession.lawyerId,
      'تكليف بجلسة قضائية جديدة ⚖️',
      `سعادة المستشار ${lawyerName}، تم تكليفكم بجلسة قضائية جديدة لقضية "${newSession.caseTitle}" للعميل ${tenantName}. الموعد: يوم ${newSession.day} الموافق ${newSession.date} الساعة ${newSession.time} في القاعة/الدائرة: ${newSession.courtRoom}. يرجى التحضير للمرافعة الموفقة.`,
      'session',
      undefined,
      undefined,
      undefined,
      channels
    );
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

        const updated = { ...s, status };
        // Sync to Firestore
        setDoc(doc(db, 'sessions', id), updated).catch((e) => {
          handleFirestoreError(e, OperationType.WRITE, `sessions/${id}`);
        });

        return updated;
      }
      return s;
    }));
  };

  // Handle deleting a session
  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));

    // Sync to Firestore
    try {
      deleteDoc(doc(db, 'sessions', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `sessions/${id}`);
    }
  };

  // Handle adding an invoice
  const handleAddInvoice = (newInvoiceData: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = {
      ...newInvoiceData,
      id: `INV-${Date.now().toString().slice(-4)}`
    };
    setInvoices(prev => [newInvoice, ...prev]);

    // Sync to Firestore
    try {
      setDoc(doc(db, 'invoices', newInvoice.id), newInvoice);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `invoices/${newInvoice.id}`);
    }
  };

  // Handle updating invoice status
  const handleUpdateInvoiceStatus = (id: string, status: Invoice['status']) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        const updated = { ...inv, status };
        // Sync to Firestore
        setDoc(doc(db, 'invoices', id), updated).catch((e) => {
          handleFirestoreError(e, OperationType.WRITE, `invoices/${id}`);
        });

        return updated;
      }
      return inv;
    }));
  };

  // Handle deleting an invoice
  const handleDeleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));

    // Sync to Firestore
    try {
      deleteDoc(doc(db, 'invoices', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `invoices/${id}`);
    }
  };

  // Dispatch real-world SMS & Email notifications to the backend
  const sendRealNotification = async (recipientEmail: string, recipientPhone: string, title: string, message: string) => {
    if (recipientPhone) {
      try {
        const smsRes = await fetch("/api/send-sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: recipientPhone, message: `${title}\n${message}` })
        });
        const smsData = await smsRes.json();
        console.log("SMS dispatch response:", smsData);
        if (smsData.success) {
          // If a real SMS was successfully triggered or simulated with warning
          if (smsData.simulated) {
            console.info("Twilio SMS simulated:", smsData.message);
          } else {
            console.info("Real Twilio SMS sent successfully.");
          }
        }
      } catch (e) {
        console.error("Failed to fetch /api/send-sms:", e);
      }
    }

    if (recipientEmail) {
      try {
        const emailRes = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: recipientEmail, title, message })
        });
        const emailData = await emailRes.json();
        console.log("Email dispatch response:", emailData);
        if (emailData.success) {
          if (emailData.simulated) {
            console.info("Resend email simulated:", emailData.message);
          } else {
            console.info("Real Resend email sent successfully.");
          }
        }
      } catch (e) {
        console.error("Failed to fetch /api/send-email:", e);
      }
    }
  };

  // Handle triggering a new notification (Pure secure dispatch directly to the user's mobile device / email & stores in-app)
  const handleTriggerNotification = (
    targetRole: 'lawyer' | 'tenant' | 'all' | 'custom',
    targetId: string,
    title: string,
    message: string,
    type: 'session' | 'invoice' | 'system',
    overrideEmail?: string,
    overridePhone?: string,
    senderName?: string,
    channels: { email: boolean; sms: boolean } = { email: true, sms: true }
  ) => {
    // Resolve target phone and email for real-world SMS/Email dispatching
    let recipientPhone = overridePhone || '';
    let recipientEmail = overrideEmail || '';

    if (!recipientPhone && !recipientEmail) {
      if (targetRole === 'tenant') {
        const t = tenants.find(item => item.id === targetId || item.name === targetId);
        if (t) {
          recipientPhone = t.phone || '';
          recipientEmail = t.email || '';
        }
      } else if (targetRole === 'lawyer') {
        const l = lawyers.find(item => item.id === targetId || item.name === targetId);
        if (l) {
          recipientPhone = l.phone || '';
          recipientEmail = l.email || '';
        }
      } else if (targetRole === 'all') {
        if (!targetId) {
          // Broadcast to all tenants and lawyers
          tenants.forEach(t => {
            if (t.phone || t.email) {
              sendRealNotification(
                channels.email ? (t.email || '') : '',
                channels.sms ? (t.phone || '') : '',
                title,
                message
              );
            }
          });
          lawyers.forEach(l => {
            if (l.phone || l.email) {
              sendRealNotification(
                channels.email ? (l.email || '') : '',
                channels.sms ? (l.phone || '') : '',
                title,
                message
              );
            }
          });
        } else {
          const t = tenants.find(item => item.id === targetId || item.name === targetId);
          const l = lawyers.find(item => item.id === targetId || item.name === targetId);
          if (t) {
            recipientPhone = t.phone || '';
            recipientEmail = t.email || '';
          } else if (l) {
            recipientPhone = l.phone || '';
            recipientEmail = l.email || '';
          }
        }
      }
    }

    // Direct secure dispatch to the mobile phone (SMS) or email
    if (recipientPhone || recipientEmail) {
      sendRealNotification(
        channels.email ? recipientEmail : '',
        channels.sms ? recipientPhone : '',
        title,
        message
      );
    }

    // Create a robust notification object for in-app display and save in state
    const newNotif: Notification = {
      id: `N-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      targetRole,
      targetId,
      title,
      message,
      timestamp: new Date().toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      isRead: false,
      type,
      sender: senderName || (userSession ? userSession.name : 'إدارة منصة أصال')
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Sync to Firestore
    try {
      setDoc(doc(db, 'notifications', newNotif.id), newNotif);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `notifications/${newNotif.id}`);
    }
  };

  // Clear or mark notification as read
  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        const updated = { ...n, isRead: true };
        // Sync to Firestore
        setDoc(doc(db, 'notifications', id), updated).catch((e) => {
          handleFirestoreError(e, OperationType.WRITE, `notifications/${id}`);
        });
        return updated;
      }
      return n;
    }));
  };

  const handleClearNotifications = () => {
    const backupNotifs = [...notifications];
    setNotifications([]);
    localStorage.removeItem('nazaha_notifications');

    // Sync to Firestore by deleting docs
    backupNotifs.forEach(n => {
      deleteDoc(doc(db, 'notifications', n.id)).catch(() => {});
    });
  };

  // Reset entire application database to initial seeds
  const handleResetDatabase = () => {
    if (confirm('هل أنت متأكد من مسح وتفريغ كافة البيانات والبدء من الصفر بالكامل؟')) {
      setSessions([]);
      setInvoices([]);
      setNotifications([]);
      
      if (userSession) {
        if (userSession.role === 'lawyer') {
          // Keep the current lawyer in the lawyers list, clear all other lawyers and tenants
          const currentLawyer = lawyers.find(l => l.id === userSession.id);
          if (currentLawyer) {
            setLawyers([currentLawyer]);
          } else {
            const reconstructed: Lawyer = {
              id: userSession.id,
              name: userSession.name,
              specialty: 'مستشار قانوني معتمد',
              email: userSession.email || '',
              phone: userSession.phone || '',
              password: '123'
            };
            setLawyers([reconstructed]);
          }
          setTenants([]);
        } else if (userSession.role === 'tenant') {
          const currentTenant = tenants.find(t => t.id === userSession.id);
          if (currentTenant) {
            setTenants([currentTenant]);
          } else {
            const reconstructed: Tenant = {
              id: userSession.id,
              name: userSession.name,
              propertyNo: 'ملف الموكل',
              email: userSession.email || '',
              phone: userSession.phone || '',
              password: '123'
            };
            setTenants([reconstructed]);
          }
          setLawyers([]);
        } else {
          // Admin logged in - admin credentials are hardcoded, so we can clear all lawyers and tenants safely
          setLawyers([]);
          setTenants([]);
        }
        // Do NOT set userSession to null, keep the current user logged in!
      } else {
        // No active session, clear everything
        setLawyers([]);
        setTenants([]);
        setUserSession(null);
        setCurrentRole('tenant');
      }

      localStorage.removeItem('nazaha_sessions');
      localStorage.removeItem('nazaha_invoices');
      localStorage.removeItem('nazaha_notifications');
      localStorage.removeItem('asal_lawyers');
      localStorage.removeItem('asal_tenants');
      alert('تم مسح وتفريغ كافة البيانات بنجاح! تم الحفاظ على تسجيل دخولك لتتمكن من ملء بياناتك الجديدة مباشرة من الصفر.');
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
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {userSession.role === 'admin' ? 'مدير المنصة' : userSession.role === 'lawyer' ? 'مستشار ومحامي' : 'عميل موكل'}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold bg-slate-500/10 px-2 py-0.5 rounded-full border border-slate-500/10">
                      📧 {userSession.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await signOut(auth);
                    } catch (e) {
                      console.error("Firebase signOut error:", e);
                    }
                    setUserSession(null);
                    setCurrentRole('tenant');
                    localStorage.removeItem('asal_session');
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

      {dbError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 animate-fade-in">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500" />
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <span>⚠️ تم ربط المنصة بنجاح ولكن مطلوب تفعيل الخدمات في حسابك الخاص</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  لقد قمنا بربط المنصة بمشروع Firebase الشخصي الخاص بك <span className="text-emerald-400 font-mono font-bold">law-platform-1dd66</span> بنجاح. لتفعيل تسجيل الدخول وقاعدة البيانات بشكل كامل، يرجى القيام بالخطوتين التاليتين في كونسول Firebase الخاص بك:
                </p>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside mr-2 mt-2">
                  <li>
                    <strong className="text-slate-200">تفعيل قاعدة البيانات:</strong> اذهب إلى <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">لوحة تحكم Firebase</a> ← اختر مشروعك ← اضغط على <strong className="text-slate-300">Firestore Database</strong> ← ثم اضغط على <strong className="text-slate-300">Create Database</strong> لإنشاء قاعدة البيانات الافتراضية.
                  </li>
                  <li>
                    <strong className="text-slate-200">تفعيل خيار تسجيل الدخول:</strong> في لوحة التحكم ← اضغط على <strong className="text-slate-300">Authentication</strong> ← ثم تبويب <strong className="text-slate-300">Sign-in method</strong> ← اضغط على <strong className="text-slate-300">Add new provider</strong> ← اختر <strong className="text-slate-300">Email/Password</strong> وقم بتفعيله وحفظه.
                  </li>
                </ul>
                <div className="text-[10px] text-amber-500/80 font-medium mt-1">
                  * تفاصيل الخطأ الحالي المرتجع من خادم Firebase: {dbError}
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-2 shrink-0 self-end md:self-start">
                <button
                  onClick={() => {
                    setDbError(null);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  استمر في الوضع التجريبي ⚙️
                </button>
                <button
                  onClick={() => {
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  تحديث للتحقق من الاتصال 🔄
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                
                // Automatically send login alert email to the user
                if (session.email) {
                  const loginEmailMsg = `شريكنا العزيز ${session.name}، تم تسجيل دخولك بنجاح إلى حسابك الخاص في منصة أصال للمحاماة والاستشارات القانونية اليوم في تمام الساعة ${new Date().toLocaleTimeString('ar-SA')}. إذا لم تكن أنت من قام بهذا الإجراء، يرجى مراجعة إدارة المنصة فوراً لحماية حسابك وقضيتك.`;
                  sendRealNotification(session.email, '', 'إشعار تسجيل دخول ناجح - منصة أصال ⚖️', loginEmailMsg);
                }

                if (session.phone) {
                  // Direct SMS welcome to their private phone number only
                  const welcomeMsg = `أهلاً بك في منصة أصال للمحاماة والاستشارات القانونية. نسعد بتواجدك وخدمتك يا ${session.name} ونتمنى لك تجربة متميزة في بوابتنا القضائية الإلكترونية المعتمدة.`;
                  sendRealNotification('', session.phone, 'أهلاً بك في منصة أصال ⚖️', welcomeMsg);

                  setActiveToast({
                    id: `login-sms-${Date.now()}`,
                    title: '📱 رسالة ترحيبية SMS واردة للجوال الخاص',
                    message: `تم إرسال ترحيب فوري لهاتفك الخاص (${session.phone}): أهلاً بك في منصة أصال للمحاماة...`,
                    type: 'system'
                  });
                }
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

                {/* Quick Database Reset - Only visible to Admin or Lawyer roles */}
                {(currentRole === 'admin' || currentRole === 'lawyer') && (
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
                )}
              </div>
            )}

            {/* ACTIVE DASHBOARD VIEW ROUTING */}
            <div id="active-dashboard-viewport" className="min-h-[500px]">
              {/* Quick Database Reset for Lawyer (Since Admin has it in the simulation bar) */}
              {userSession && userSession.role === 'lawyer' && (
                <div className="flex justify-end mb-4">
                  <button
                    onClick={handleResetDatabase}
                    className="text-slate-400 hover:text-red-400 text-[10px] font-bold flex items-center gap-1.5 px-3 py-2 border border-slate-800 rounded-xl hover:bg-slate-950 cursor-pointer transition-all shrink-0 bg-slate-900 shadow-md"
                    title="تفريغ كافة البيانات وإخلاء اللوحة بالكامل"
                  >
                    <RotateCcw className="w-3 h-3 text-red-400" />
                    تفريغ وإعادة ضبط النظام
                  </button>
                </div>
              )}

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
                  onClearNotifications={handleClearNotifications}
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
                  onClearNotifications={handleClearNotifications}
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
                  onClearNotifications={handleClearNotifications}
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
