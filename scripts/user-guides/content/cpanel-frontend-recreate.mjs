/** دليل إعادة رفع وتشغيل الفرونت اند على cPanel بعد حذف تطبيق Node */
export default {
  filename: "دليل-إعادة-رفع-الفرونت-اند-على-cPanel.pdf",
  title: "دليل إعادة رفع الواجهة الأمامية على cPanel",
  subtitle:
    "شرح مفصّل وممل بالترتيب: بعد حذف تطبيق Node.js، كيف تعيد إنشاءه وتشغّل غَزتنا (Next.js) مع البناء الجاهز من جهازك — بدون ما يعلق السيرفر على npm run build",
  sections: [
    {
      id: "intro",
      title: "اقرأ هذا قبل أي خطوة",
      blocks: [
        {
          type: "p",
          text: "هذا الدليل مخصص لحالتك الحالية: حذفت (أو ستحذف) تطبيق Node.js من Setup Node.js App، وتريد تعيده من الصفر بشكل صحيح. السيرفر عندك ما يقدر يكمل npm run build (يطلع Aborted بسبب ضعف الذاكرة)، لذلك البناء يتم على جهازك ثم ترفع ملف ZIP صغير للإنتاج، مش مجلد .next فيه كاش 4 جيجا.",
        },
        {
          type: "warn",
          text: "لا ترفع .next.rar ولا .next/dev ولا node_modules من ويندوز على GitHub. GitHub للكود فقط. ملف البناء ارفعه ZIP عبر File Manager.",
        },
        {
          type: "info",
          text: "المسار الشائع عندك للتطبيق: my_project/gazatna-frontend — واسم Startup file الصحيح: server.js (مش npm run start).",
        },
        {
          type: "h3",
          text: "قائمة التحقق السريعة — ماذا تحتاج جاهزًا؟",
        },
        {
          type: "ul",
          items: [
            "دخول cPanel شغّال.",
            "الكود محدث على GitHub (بما فيه server.js).",
            "رابط الـ API الحقيقي جاهز (مثال: https://api.gzs.edu.ps/api) — بدّل بموقعك الفعلي.",
            "دومين الواجهة جاهز (مثال: https://gzs.edu.ps).",
            "الباكند Django شغال ومتغيرات CORS تسمح بدومين الواجهة.",
          ],
        },
      ],
    },
    {
      id: "delete",
      title: "الخطوة 0 — حذف التطبيق القديم (إذا ما حذفته بعد)",
      blocks: [
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "افتح Setup Node.js App",
              where: "cPanel → Software → Setup Node.js App",
              body: "ستظهر قائمة التطبيقات الموجودة.",
            },
            {
              n: 2,
              title: "احذف التطبيق القديم",
              body: "اضغط حذف / Destroy / Remove على التطبيق المرتبط بـ my_project/gazatna-frontend. أكّد الحذف.",
            },
            {
              n: 3,
              title: "تأكد أنه اختفى من القائمة",
              body: "حدّث الصفحة. إذا بقي خطأ No such application لاحقًا، غالبًا الحذف غير مكتمل — كرر أو اطلب من الدعم تنظيف التطبيق اليتيم.",
            },
          ],
        },
        {
          type: "info",
          text: "حذف تطبيق Node من اللوحة لا يحذف عادة ملفات المشروع من القرص (الكود يبقى في my_project/gazatna-frontend). هذا جيد.",
        },
      ],
    },
    {
      id: "pull",
      title: "الخطوة 1 — تحديث ملفات المشروع على السيرفر من Git",
      blocks: [
        {
          type: "p",
          text: "قبل إنشاء التطبيق من جديد، تأكد أن السيرفر فيه آخر كود، خاصة server.js و package.json.",
        },
        {
          type: "h3",
          text: "من Terminal في cPanel",
        },
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\">cd ~/my_project/gazatna-frontend\ngit status\ngit pull origin main\n\nls -la server.js package.json next.config.ts</pre><p>لازم تشوف ملف <code>server.js</code> موجود. إذا مش موجود، الـ Pull فشل أو الفرع غلط.</p>",
        },
        {
          type: "warn",
          text: "إذا المشروع مستنسخ بـ Git Version Control من واجهة cPanel وليس من التيرمنال، افتح Git Version Control → المستودع → Pull / Update ثم تأكد من وجود server.js من File Manager.",
        },
      ],
    },
    {
      id: "local-build",
      title: "الخطوة 2 — بناء الواجهة على جهازك (ويندوز) بالرابط الصحيح",
      blocks: [
        {
          type: "p",
          text: "لأن npm run build على السيرفر يُجهض (Aborted)، نبني محليًا ثم نعبّئ ZIP إنتاجي بدون كاش .next/dev.",
        },
        {
          type: "warn",
          text: "مهم جدًا: لا تستخدم الرابط الوهمي من الأمثلة. ضع رابط الـ API الحقيقي قبل البناء، لأن NEXT_PUBLIC_API_URL يُدمَج وقت البناء.",
        },
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "افتح PowerShell داخل مجلد الفرونت",
              body: "المسار عندك مثل: I:\\ghazatna\\gazatna-frontend",
            },
            {
              n: 2,
              title: "اضبط رابط الـ API للإنتاج",
              body: "بدّل المثال التالي بعنوانك الفعلي (يجب أن ينتهي بـ /api):",
            },
          ],
        },
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\">cd I:\\ghazatna\\gazatna-frontend\n\n$env:NEXT_PUBLIC_API_URL = \"https://api.gzs.edu.ps/api\"\n\n# أو أنشئ ملف .env.production بالمحتوى:\n# NEXT_PUBLIC_API_URL=https://api.gzs.edu.ps/api\n\nnpm run pack:cpanel</pre>",
        },
        {
          type: "h3",
          text: "كيف تعرف أن التعبئة خلصت؟",
        },
        {
          type: "ul",
          items: [
            "أثناء العمل ستظهر رسالة Compress-Archive … in progress.",
            "عند الانتهاء تظهر رسالة مثل: <strong>OK: …\\cpanel-frontend-build-…….zip (XX MB)</strong>",
            "حجم الـ ZIP الطبيعي تقريبًا عشرات الميغا (مثلًا 20–80 MB) — <strong>مش</strong> مئات أو آلاف الميجا.",
            "إذا الحجم مئات الميجا فأنت ربما ضمّنت كاش .next/dev بالغلط؛ استخدم pack:cpanel المحدّث الذي يستثني dev.",
          ],
        },
        {
          type: "h3",
          text: "أين الملف؟",
        },
        {
          type: "p",
          text: "داخل نفس مجلد gazatna-frontend على جهازك، باسم يشبه: cpanel-frontend-build-20260714-163730.zip",
        },
      ],
    },
    {
      id: "upload-zip",
      title: "الخطوة 3 — رفع ZIP البناء إلى السيرفر (File Manager)",
      blocks: [
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "افتح File Manager",
              where: "cPanel → Files → File Manager",
              body: "ادخل إلى المجلد: home → my_project → gazatna-frontend",
            },
            {
              n: 2,
              title: "ارفع الـ ZIP",
              body: "Upload → اختر ملف cpanel-frontend-build-….zip من جهازك وانتظر اكتمال الرفع.",
            },
            {
              n: 3,
              title: "فك الضغط فوق الملفات",
              body: "اضغط يمين على الـ ZIP → Extract. تأكد أن الاستخراج يكون داخل gazatna-frontend نفسها بحيث يظهر/يتحدَّث مجلد .next و public و package.json و next.config.ts.",
            },
            {
              n: 4,
              title: "تأكد من وجود الملفات الحرجة",
              body: "بعد الاستخراج لازم تشوف على الأقل:",
              list: [
                "مجلد .next (بدون الحاجة لـ .next/dev)",
                "مجلد public",
                "package.json",
                "package-lock.json",
                "next.config.ts",
                "server.js",
              ],
            },
            {
              n: 5,
              title: "احذف الـ ZIP من السيرفر بعد الاستخراج (اختياري ونظيف)",
              body: "لتوفير مساحة: احذف ملف الـ ZIP من File Manager بعد التأكد أن الاستخراج نجح.",
            },
          ],
        },
        {
          type: "warn",
          text: "لا ترفع node_modules من ويندوز. لا ترفع .next.rar الضخم. لا ترفع مجلد .next وفيه مجلد dev بحجم جيجات.",
        },
      ],
    },
    {
      id: "create-node-app",
      title: "الخطوة 4 — إنشاء تطبيق Node.js من جديد (بالتفصيل)",
      blocks: [
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "افتح Setup Node.js App",
              where: "cPanel → Software → Setup Node.js App",
              body: "اضغط Create Application.",
            },
            {
              n: 2,
              title: "اختر إصدار Node",
              body: "اختر نفس الإصدار الذي كان يعمل معك إن أمكن (مثل Node 20). تجنّب إصدارًا قديمًا جدًا لأن المشروع Next 16.",
            },
            {
              n: 3,
              title: "Application root",
              body: "اكتب بالضبط مسار مجلد الواجهة كما هو على السيرفر، مثال شائع عندك:",
              list: ["my_project/gazatna-frontend"],
            },
            {
              n: 4,
              title: "Application URL",
              body: "اختر الدومين الرئيسي للموقع العام (مثل gzs.edu.ps) أو المسار الذي تريد أن تفتح منه الواجهة.",
            },
            {
              n: 5,
              title: "Application startup file — أهم خانة",
              body: "اكتب فقط:",
              list: [
                "<strong>server.js</strong>",
                "لا تكتب: npm run start",
                "لا تكتب: node server.js",
                "لا تكتب مسارًا كاملًا خارج مجلد التطبيق",
              ],
            },
            {
              n: 6,
              title: "أنشئ التطبيق",
              body: "اضغط Create / Save. إذا ظهر خطأ No such application أثناء التعديل لاحقًا، احذف التطبيق وأعد إنشاءه من هذه الخطوة ولا تعدّل نصف إعدادات.",
            },
            {
              n: 7,
              title: "انسخ أمر تفعيل البيئة (source)",
              body: "بعد الإنشاء، اللوحة تعرض أمرًا مثل source .../bin/activate. انسخه للاستخدام في التيرمنال بالخطوة التالية.",
            },
          ],
        },
        {
          type: "info",
          text: "سبب خطأ No such application عند تغيير startup من npm run start إلى server.js غالبًا فساد إعداد التطبيق أو غياب الملف على المسار. الإنشاء من الصفر مع وجود server.js يحلّها عادة.",
        },
      ],
    },
    {
      id: "env-node",
      title: "الخطوة 5 — متغيرات البيئة لتطبيق Node",
      blocks: [
        {
          type: "p",
          text: "من Setup Node.js App → Edit التطبيق → Environment variables أضف (أو عدّل):",
        },
        {
          type: "table",
          headers: ["المتغير", "مثال", "ملاحظات"],
          rows: [
            [
              "NODE_ENV",
              "production",
              "مهم لوضع الإنتاج",
            ],
            [
              "NEXT_PUBLIC_API_URL",
              "https://api.gzs.edu.ps/api",
              "للتشغيل المستقبلي؛ لكن البناء الحالي الذي رفعته يعتمد على القيمة وقت البناء المحلي",
            ],
            [
              "PORT",
              "(اتركه لما تحدده اللوحة إن ظهر)",
              "لا تجبر 3001 إلا إذا طلبت الاستضافة ذلك",
            ],
          ],
        },
        {
          type: "warn",
          text: "إذا غيّرت NEXT_PUBLIC_API_URL بعد ما رفعت بناء جاهز، لازم تعيد pack:cpanel على جهازك بالرابط الجديد وتعيد رفع الـ ZIP. قيم NEXT_PUBLIC تُخبز داخل البناء.",
        },
      ],
    },
    {
      id: "npm-install",
      title: "الخطوة 6 — تثبيت الحزم على السيرفر (بدون بناء)",
      blocks: [
        {
          type: "p",
          text: "هنا نثبّت مكتبات Linux فقط. لا ننفّذ npm run build على السيرفر.",
        },
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\"># الصق أمر source من لوحة Node ثم:\ncd ~/my_project/gazatna-frontend\n\n# احذف playwright إن وُجد (ثقيل وما يلزم التشغيل)\nnpm uninstall playwright 2&gt;/dev/null\n\n# تثبيت حزم الإنتاج فقط\nnpm install --omit=dev\n\n# تأكد أن Next موجود\nnpm ls next --depth=0\n\n# تأكد أن البناء موجود\nls -la .next/BUILD_ID\nls -la server.js</pre>",
        },
        {
          type: "h3",
          text: "بديل من واجهة اللوحة",
        },
        {
          type: "p",
          text: "بعض اللوحات فيها زر Run NPM Install. استخدمه إذا أحببت، ثم من التيرمنال تأكد أن .next و server.js موجودان. لا تضغط زر Build على السيرفر إن كان يسبب Aborted.",
        },
      ],
    },
    {
      id: "start",
      title: "الخطوة 7 — تشغيل التطبيق وإعادة التشغيل",
      blocks: [
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "من Setup Node.js App",
              body: "افتح التطبيق → اضغط Restart أو Stop ثم Start / Run.",
            },
            {
              n: 2,
              title: "راقب الحالة",
              body: "يفترض أن تظهر حالة Running أو ما يعادلها بدون رسالة No such application.",
            },
            {
              n: 3,
              title: "افتح الموقع من المتصفح",
              body: "افتح دومين الواجهة. جرّب الصفحة الرئيسية ثم صفحة تسجيل الدخول.",
            },
            {
              n: 4,
              title: "افحص اتصال الـ API",
              body: "من أدوات المطوّر في المتصفح (F12 → Network) أثناء تسجيل الدخول: طلبات /api يجب ألا تفشل بفشل شبكة. إن فشلت: إما رابط API داخل البناء غلط، أو CORS في Django، أو الباكند متوقف.",
            },
          ],
        },
      ],
    },
    {
      id: "backend-cors",
      title: "الخطوة 8 — تأكد أن الباكند يسمح للواجهة (CORS)",
      blocks: [
        {
          type: "p",
          text: "حتى لو الفرونت اشتغل، الدخول لن ينجح إذا Django يمنع أصل الواجهة.",
        },
        {
          type: "ul",
          items: [
            "في Setup Python App → Environment variables تأكد:",
            "<code>DJANGO_ENV=production</code>",
            "<code>CORS_ALLOWED_ORIGINS=https://gzs.edu.ps,https://www.gzs.edu.ps</code> (بدون مسافات زائدة؛ عدّل لدومك الحقيقي)",
            "بعد التعديل: Restart لتطبيق البايثون.",
          ],
        },
      ],
    },
    {
      id: "verify",
      title: "الخطوة 9 — قائمة تحقق نهائية (ضع علامة ذهنيًا)",
      blocks: [
        {
          type: "ol",
          items: [
            "تطبيق Node موجود في القائمة وحالته شغّالة.",
            "Application startup file = server.js.",
            "server.js موجود فعليًا في my_project/gazatna-frontend.",
            "مجلد .next موجود وفيه BUILD_ID.",
            "لم أشغّل npm run build على السيرفر (أو شغلته وفشل فتتجاهل وتستخدم البناء المرفوع).",
            "npm install --omit=dev اكتمل بدون EBADPLATFORM لـ swc-win32.",
            "فتح الدومين يعرض صفحات الموقع.",
            "تسجيل الدخول يعمل أو على الأقل /api يرد من نفس الدومين/البروكسي.",
            "SSL https شغال للواجهة وللـ API.",
          ],
        },
      ],
    },
    {
      id: "updates",
      title: "الخطوة 10 — كيف تحدّث لاحقًا؟ (روتين ثابت)",
      blocks: [
        {
          type: "h3",
          text: "أ) تغييرات كود الفرونت أو إعدادات NEXT_PUBLIC",
        },
        {
          type: "ol",
          items: [
            "على جهازك: عدّل الكود + اضبط NEXT_PUBLIC_API_URL إن لزم.",
            "npm run pack:cpanel",
            "ارفع ZIP عبر File Manager وفكّه.",
            "على السيرفر: npm install --omit=dev فقط إذا تغيّر package.json.",
            "Restart من Setup Node.js App.",
          ],
        },
        {
          type: "h3",
          text: "ب) تغييرات بسيطة في ملفات مثل server.js فقط",
        },
        {
          type: "ol",
          items: [
            "Push على GitHub ثم على السيرفر: git pull",
            "Restart لتطبيق Node.",
          ],
        },
        {
          type: "h3",
          text: "ج) الباكند فقط",
        },
        {
          type: "ol",
          items: [
            "git pull في gazatna-backend",
            "فعّل virtualenv ثم pip install -r requirements.txt إن لزم",
            "python manage.py migrate",
            "Restart لـ Python App",
          ],
        },
      ],
    },
    {
      id: "troubleshoot",
      title: "أخطاء شائعة وحلولها",
      blocks: [
        {
          type: "table",
          headers: ["الخطأ / العرض", "المعنى", "ماذا تفعل"],
          rows: [
            [
              "No such application … gazatna-frontend",
              "تطبيق Node غير مسجّل أو إعداداته انكسرت",
              "احذف التطبيق وأعد إنشاءه؛ تأكد من وجود server.js في نفس الـ root",
            ],
            [
              "Aborted أثناء npm run build",
              "السيرفر قتل العملية لنقص الذاكرة",
              "لا تبنِ على السيرفر؛ استخدم pack:cpanel على جهازك وارفع ZIP",
            ],
            [
              "EBADPLATFORM swc-win32",
              "حزمة ويندوز وصلت للينكس",
              "تأكد أن package.json بدون @next/swc-win32 ثم npm install من جديد",
            ],
            [
              "Push حجمه مئات الميجا",
              "رفع أرشيف بناء (مثل .next.rar) بالغلط على Git",
              "لا ترفع rar/zip عبر Git؛ احذفها من التاريخ إن دخلت",
            ],
            [
              "الموقع يفتح لكن الدخول يفشل",
              "API أو CORS",
              "راجع NEXT_PUBLIC_API_URL وقت البناء + CORS_ALLOWED_ORIGINS + حالة Django",
            ],
            [
              "Startup file = npm run start يشتغل فقط",
              "لوحة الاستضافة تقبل أمر npm في الخانة",
              "يمكنك الإبقاء عليه مؤقتًا إن فرضته الاستضافة، بشرط وجود .next وسكربت start",
            ],
          ],
        },
      ],
    },
    {
      id: "cheat",
      title: "ورقة أوامر مختصرة للنسخ",
      blocks: [
        {
          type: "h3",
          text: "على جهازك (PowerShell)",
        },
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\">cd I:\\ghazatna\\gazatna-frontend\n$env:NEXT_PUBLIC_API_URL = \"https://api.gzs.edu.ps/api\"\nnpm run pack:cpanel</pre>",
        },
        {
          type: "h3",
          text: "على السيرفر (Terminal)",
        },
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\">cd ~/my_project/gazatna-frontend\ngit pull origin main\n# بعد رفع وفك ZIP البناء:\nnpm uninstall playwright 2&gt;/dev/null\nnpm install --omit=dev\nls -la server.js .next/BUILD_ID\n# ثم Restart من Setup Node.js App</pre>",
        },
        {
          type: "h3",
          text: "قيم Setup Node.js App",
        },
        {
          type: "table",
          headers: ["الحقل", "القيمة"],
          rows: [
            ["Application root", "my_project/gazatna-frontend"],
            ["Application startup file", "server.js"],
            ["NODE_ENV", "production"],
            ["البناء", "جاهز من الجهاز (مجلد .next) — بدون build على السيرفر"],
          ],
        },
        {
          type: "p",
          text: "إذا التزمت بهذا الترتيب حرفياً: حذف التطبيق → تحديث الكود → بناء محلي برابط API صحيح → رفع ZIP → إنشاء Node App بـ server.js → npm install --omit=dev → Restart → فحص CORS، المفروض الواجهة تشتغل حتى لو السيرفر ما يقدر يعمل build.",
        },
      ],
    },
  ],
};
