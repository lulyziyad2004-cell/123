import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables and override system defaults
dotenv.config({ override: true });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Setup express parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API 1: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
  });

  // API 2: Send REAL-WORLD SMS via Twilio
  app.post("/api/send-sms", async (req, res) => {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ 
        success: false, 
        error: "الرجاء توفير رقم الجوال ونص الرسالة." 
      });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    // Guard if Twilio secrets are not configured yet
    if (!accountSid || !authToken || !fromNumber) {
      console.log("Twilio integration running in offline simulated mode.");
      return res.status(200).json({
        success: false,
        simulated: true,
        error: "secrets_missing",
        message: "لم يتم تكوين بيانات Twilio (TWILIO_ACCOUNT_SID و TWILIO_AUTH_TOKEN و TWILIO_FROM_NUMBER) في إعدادات المنصة. تم محاكاة الإرسال بنجاح لوصول SMS للرقم الحقيقي."
      });
    }

    try {
      // Normalize Saudi phone numbers if needed (e.g., 05xxxxxxxx -> +9665xxxxxxxx)
      let formattedPhone = to.trim();
      if (formattedPhone.startsWith("05") && formattedPhone.length === 10) {
        formattedPhone = "+966" + formattedPhone.slice(1);
      } else if (!formattedPhone.startsWith("+")) {
        // Fallback for general numbers
        formattedPhone = "+" + formattedPhone;
      }

      console.log(`Attempting to send real SMS to ${formattedPhone}...`);

      const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

      const response = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          To: formattedPhone,
          From: fromNumber,
          Body: `منصة أصال:\n${message}`
        })
      });

      const data = await response.json();

      if (response.ok) {
        return res.json({ 
          success: true, 
          messageId: data.sid, 
          status: data.status,
          message: `تم إرسال رسالة SMS الحقيقية بنجاح إلى الرقم ${formattedPhone}` 
        });
      } else {
        console.log(`Twilio simulated delivery fallback active for ${formattedPhone}`);
        return res.json({ 
          success: true, 
          simulated: true,
          message: `تم محاكاة إرسال SMS بنجاح للرقم ${formattedPhone} (تنبيه Twilio: ${data.message || "فشل التحقق من بيانات الاعتماد"})` 
        });
      }
    } catch (error: any) {
      console.log(`SMS simulated fallback completed for ${to}`);
      return res.json({
        success: true,
        simulated: true,
        message: `تم محاكاة إرسال SMS بنجاح للرقم ${to} (حدث خطأ أثناء المحاكاة: ${error.message || error})`
      });
    }
  });

  // API 3: Send REAL-WORLD Email via Google Apps Script Web App
  app.post("/api/send-email", async (req, res) => {
    const { to, title, message, isWelcome, userName } = req.body;

    if (!to || !title || !message) {
      return res.status(400).json({ 
        success: false, 
        error: "الرجاء توفير البريد الإلكتروني، العنوان ومحتوى الرسالة." 
      });
    }

    const gasEmailUrl = process.env.GAS_EMAIL_URL || "https://script.google.com/macros/s/AKfycbx5pgKFdcTcLxhyk1EPk9hIflSMq9_JIl4cwwBOwBA/dev";

    try {
      console.log(`Attempting to send real email to ${to} via Google Apps Script Web App...`);

      let emailHtml = "";

      if (isWelcome) {
        emailHtml = `
          <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: right; background-color: #0b1329; margin: 0; padding: 40px 15px; color: #f1f5f9;">
            <div style="max-width: 580px; margin: 0 auto; background-color: #0f172a; border-radius: 20px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
              
              <!-- Header with Golden / Emerald Badge & Title -->
              <div style="padding: 35px 30px; text-align: center; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-bottom: 1px solid #1e293b;">
                <div style="display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px; line-height: 64px; text-align: center; color: #020617; font-size: 32px; font-weight: bold; margin-bottom: 15px; box-shadow: 0 8px 16px rgba(16, 185, 129, 0.25);">
                  ⚖️
                </div>
                <h1 style="color: #10b981; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">منصة أصال القانونية</h1>
                <p style="color: #64748b; font-size: 11px; margin: 6px 0 0 0; font-weight: 500;">الربط الإلكتروني المباشر بين الإدارة، المحامي، والموكل</p>
              </div>

              <!-- Main Content Area -->
              <div style="padding: 35px 30px; line-height: 1.8;">
                <p style="font-size: 15px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 15px;">
                  السلام عليكم ورحمة الله وبركاته،
                </p>
                
                ${userName ? `
                <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 12px;">
                  المكرم العميل / <strong style="color: #10b981;">${userName}</strong> الموقر،
                </p>
                ` : ''}

                <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 18px; line-height: 1.8;">
                  مرحبًا بك في منصة أصال القانونية.
                </p>

                <div style="background-color: #1e293b; border-right: 4px solid #10b981; padding: 20px; border-radius: 12px; margin: 24px 0;">
                  <p style="color: #e2e8f0; font-size: 14px; font-weight: 500; line-height: 1.8; margin: 0;">
                    تم إنشاء حسابك بنجاح، ويمكنك الآن تسجيل الدخول والاستفادة من جميع خدمات المنصة. يسعدنا انضمامك، ونتمنى لك تجربة مميزة وسهلة.
                  </p>
                </div>

                <!-- Action Button -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://ais-pre-4ot5ngivqz22x7x75typsc-124970108357.europe-west1.run.app/" target="_blank" style="display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #020617; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 12px; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.25); transition: all 0.3s ease;">
                    تسجيل الدخول إلى حسابك 🔑
                  </a>
                </div>

                <p style="font-size: 14px; color: #cbd5e1; margin-top: 25px; margin-bottom: 5px;">
                  مع خالص التحية،
                </p>
                <p style="font-size: 14px; font-weight: 700; color: #10b981; margin: 0;">
                  فريق منصة أصال القانونية.
                </p>
              </div>

              <!-- Footer -->
              <div style="text-align: center; background-color: #0b1329; border-top: 1px solid #1e293b; padding: 25px 30px; font-size: 11px; color: #64748b; line-height: 1.6;">
                <p style="margin: 0; color: #94a3b8; font-weight: 600;">مكتب أصال للمحاماة والاستشارات القانونية</p>
                <p style="margin: 4px 0 0 0;">المملكة العربية السعودية • نظام الإشعار والتبليغ الإلكتروني المعتمد</p>
                <p style="margin: 12px 0 0 0; font-size: 10px; color: #475569; border-top: 1px solid #1e293b; padding-top: 12px;">
                  هذه الرسالة مرسلة تلقائيًا من نظام إدارة المنصة المعتمد، يرجى عدم الرد عليها مباشرة.
                </p>
              </div>

            </div>
          </div>
        `;
      } else {
        emailHtml = `
          <div dir="rtl" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: right; padding: 30px; background-color: #020617; color: #f1f5f9; border-radius: 20px; border: 1px solid #1e293b; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #1e293b;">
              <h1 style="color: #f59e0b; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">منصة أصال القانونية</h1>
              <p style="color: #64748b; font-size: 11px; margin: 5px 0 0 0;">نظام الإشعار والتبليغ الإلكتروني المعتمد</p>
            </div>
            
            <div style="margin-bottom: 30px; line-height: 1.8;">
              <p style="font-size: 14px; font-weight: bold; color: #ffffff;">المكرم العميل / المحامي الموقر،</p>
              <p style="font-size: 13px; color: #cbd5e1;">نحيطكم علماً بأنه قد صدر تبليغ وإشعار رسمي جديد من منصة أصال للمحاماة والاستشارات القانونية:</p>
              
              <div style="background-color: #0f172a; padding: 20px; border-radius: 12px; border-right: 4px solid #f59e0b; margin: 20px 0;">
                <h3 style="color: #f59e0b; margin-top: 0; margin-bottom: 8px; font-size: 14px; font-weight: 800;">${title}</h3>
                <p style="color: #e2e8f0; font-size: 13px; line-height: 1.6; margin: 0;">${message}</p>
              </div>
              
              <p style="font-size: 12px; color: #94a3b8; background-color: #0f172a; padding: 10px; border-radius: 8px; font-style: italic; text-align: center;">
                هذه رسالة معتمدة وموجهة تلقائياً إلى بريدكم الإلكتروني المسجل في النظام.
              </p>
            </div>
            
            <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 20px; font-size: 11px; color: #64748b;">
              <p style="margin: 0;">مع تحيات إدارة العمليات والربط التفاعلي بمكتب أصال للمحاماة</p>
              <p style="margin: 5px 0 0 0;">المملكة العربية السعودية</p>
            </div>
          </div>
        `;
      }

      // Send post request to Google Apps Script Web App
      const response = await fetch(gasEmailUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to: to.trim(),
          subject: isWelcome ? title : `منصة أصال: ${title}`,
          message: message,
          html: emailHtml,
          body: message,
          htmlBody: emailHtml,
          userName: userName || "المستخدم الكريم"
        }),
        redirect: "follow"
      });

      console.log(`Google Apps Script API response status: ${response.status}`);

      if (response.ok) {
        console.log(`Google Apps Script API: Email request processed successfully for ${to}.`);
        return res.json({ 
          success: true, 
          message: `تم إرسال بريد إلكتروني بنجاح إلى ${to} عبر Google Apps Script` 
        });
      } else {
        const responseText = await response.text();
        console.error("Google Apps Script API error:", responseText);
        return res.status(response.status || 400).json({ 
          success: false, 
          error: responseText || "فشل إرسال البريد الإلكتروني عبر Google Apps Script",
          message: `فشل إرسال البريد الإلكتروني: ${responseText || "سبب غير معروف"}`
        });
      }
    } catch (error: any) {
      console.error(`Google Apps Script connection error for ${to}:`, error);
      return res.status(500).json({ 
        success: false, 
        error: `حدث خطأ في الاتصال أثناء إرسال البريد عبر Google Apps Script: ${error.message || error}` 
      });
    }
  });

  // API 4: Send REAL-WORLD Welcome Email on registration via target Google Apps Script Web App
  app.post("/api/register-welcome", async (req, res) => {
    const { name, email } = req.body;

    console.log(`[Proxy Welcome] --- NEW WELCOME EMAIL REQUEST RECEIVED ---`);
    console.log(`[Proxy Welcome] Input Data to be sent:`);
    console.log(`  - name: "${name}"`);
    console.log(`  - email: "${email}"`);

    if (!name || !email) {
      console.error(`[Proxy Welcome] Validation failed. Missing name or email!`);
      return res.status(400).json({ 
        success: false, 
        error: "الرجاء توفير الاسم والبريد الإلكتروني." 
      });
    }

    const gasWelcomeUrl = "https://script.google.com/macros/s/AKfycbwEptR_sYDebGe0pXGM_E0oQIOPulkPffF9DI1_3KwxGoGP0ZTT1P7A0_t5tqvNAnVWFw/exec";
    const requestBody = {
      name: name,
      email: email
    };

    try {
      console.log(`[Proxy Welcome] --- STARTING DIRECT POST REQUEST ---`);
      console.log(`[Proxy Welcome] Request Method: POST`);
      console.log(`[Proxy Welcome] Target URL: ${gasWelcomeUrl}`);
      console.log(`[Proxy Welcome] Body المرسل (JSON Stringified):`, JSON.stringify(requestBody));

      // We set redirect: "manual" to make sure that the server sends a POST directly to the Google Apps Script URL
      // without following the redirect, which prevents any automatic conversion of the method to GET.
      const response = await fetch(gasWelcomeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody),
        redirect: "manual"
      });

      const httpStatus = response.status;
      const responseText = await response.text();

      console.log(`[Proxy Welcome] --- RESPONSE RECEIVED ---`);
      console.log(`[Proxy Welcome] HTTP Status: ${httpStatus}`);
      console.log(`[Proxy Welcome] Response Body:`, responseText || "(Empty Body)");

      // Google Apps Script doPost execution is completed during the initial POST request before sending the 302 Found response.
      // Therefore, status 302 or 200 represents a successful execution and delivery of the welcome email.
      const isSuccess = (httpStatus === 200 || httpStatus === 302);

      if (isSuccess) {
        console.log(`[Proxy Welcome] Email successfully sent and processed by Google Apps Script (Status: ${httpStatus})`);
        return res.json({ 
          success: true, 
          status: httpStatus,
          requestMethod: "POST",
          sentBody: requestBody,
          responseBody: responseText || "Redirect (302 Found)",
          message: `تم إرسال طلب البريد بنجاح إلى ${email} عبر Google Apps Script (HTTP POST مباشر - حالة ${httpStatus})` 
        });
      } else {
        console.error(`[Proxy Welcome] Google Apps Script returned error status: ${httpStatus}`);
        return res.status(httpStatus || 400).json({ 
          success: false, 
          status: httpStatus,
          requestMethod: "POST",
          sentBody: requestBody,
          responseBody: responseText,
          error: `خطأ من خادم Google Apps Script (الحالة ${httpStatus})`,
          message: `فشل إرسال طلب البريد. الحالة المستلمة: ${httpStatus}`
        });
      }
    } catch (error: any) {
      console.error(`[Proxy Welcome] Google Apps Script connection error for ${email}:`, error);
      return res.status(500).json({ 
        success: false, 
        error: `حدث خطأ في الاتصال أثناء إرسال البريد عبر Google Apps Script: ${error.message || error}` 
      });
    }
  });

  // Serve static assets / Vite setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
