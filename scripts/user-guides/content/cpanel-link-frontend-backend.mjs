/** ربط الفرونت بالباكند على cPanel — السيناريو ب: نفس الدومين + /api — بدون تيرمنال */
export default {
  filename: "دليل-ربط-الفرونت-بالباكند-على-cPanel.pdf",
  title: "دليل ربط الواجهة بالخادم على cPanel",
  subtitle:
    "الخطة ب: الواجهة والـ API على نفس الدومين (مثل gzs.edu.ps) عبر مسار /api — شرح مفصّل من واجهات cPanel فقط بدون تيرمنال",
  sections: [
    {
      id: "intro",
      title: "الخطة ب — كيف تشتغل؟",
      blocks: [
        {
          type: "p",
          text: "في الخطة ب الزائر يفتح موقعًا واحدًا فقط مثل https://gzs.edu.ps. المتصفح يطلب البيانات من نفس الدومين عبر المسار /api (مثل https://gzs.edu.ps/api/...). تطبيق Next.js يستلم طلبات /api و/media ويحوّلها داخليًا إلى تطبيق Django (الباكند). بهذا تقل مشاكل CORS لأن أصل الصفحة وطلب الـ API من نفس الموقع.",
        },
        {
          type: "info",
          text: "هذا هو أسلوب مشروع غَزتنا في next.config.ts و middleware: طلبات /api و /media تُعاد كتابتها إلى عنوان الباكند الحقيقي. المتغير NEXT_PUBLIC_API_URL يحدد أصل التحويل وقت البناء، ويمكن أن تكون قيمته https://gzs.edu.ps/api أو /api حسب ضبطك.",
        },
        {
          type: "table",
          headers: ["العنصر", "القيمة في الخطة ب"],
          rows: [
            ["دومين الزائر (الواجهة)", "https://gzs.edu.ps"],
            ["مسار الـ API الظاهر للمتصفح", "https://gzs.edu.ps/api/..."],
            ["NEXT_PUBLIC_API_URL (للمتصفح)", "/api"],
            ["BACKEND_URL (لبروكسي Node → Django)", "رابط Application URL لتطبيق Python من cPanel بدون /api"],
            ["CORS_ALLOWED_ORIGINS", "https://gzs.edu.ps,https://www.gzs.edu.ps"],
          ],
        },
        {
          type: "warn",
          text: "خطأ شائع يسبب Internal Server Error 500: وضع NEXT_PUBLIC_API_URL=https://gzs.edu.ps/api بدون BACKEND_URL. وقتها Next يحوّل /api إلى نفس الدومين مرة أخرى (حلقة بروكسي). الحل: NEXT_PUBLIC_API_URL=/api و BACKEND_URL = رابط تطبيق Python الحقيقي.",
        },
      ],
    },
    {
      id: "roles",
      title: "دور كل تطبيق في الخطة ب",
      blocks: [
        {
          type: "ul",
          items: [
            "<strong>Setup Node.js App (gazatna-frontend):</strong> مربوط بدومين gzs.edu.ps — يقدّم الصفحات وملفات /_next ويستقبل /api و /media من المتصفح.",
            "<strong>Setup Python App (gazatna-backend):</strong> يشغّل Django. في الخطة ب غالبًا Application URL يكون مسارًا داخليًا أو دومين/بورت يستقبله البروكسي من Next — المهم أن عنوان التحويل داخل البناء يصل لباكند حي.",
            "<strong>المتصفح:</strong> لا يحتاج معرفة عنوان بايثون الداخلي؛ يرى فقط gzs.edu.ps.",
          ],
        },
        {
          type: "h3",
          text: "قيمتان يجب أن تتطابقا",
        },
        {
          type: "ol",
          items: [
            "ما يضعه المتصفح في الطلبات: نفس أصل الواجهة + /api",
            "ما بُني عليه الفرونت (NEXT_PUBLIC_API_URL) وما يقرأه السيرفر للـ rewrite/middleware نحو باكند شغال",
          ],
        },
      ],
    },
    {
      id: "prep",
      title: "أولًا: جهّز الورقة — املأ قيمتك",
      blocks: [
        {
          type: "table",
          headers: ["البند", "قيمة الخطة ب (مثال)", "اكتب قيمتك"],
          rows: [
            ["دومين الواجهة", "https://gzs.edu.ps", "………………"],
            ["NEXT_PUBLIC_API_URL", "https://gzs.edu.ps/api", "………………"],
            ["CORS (بايثون)", "https://gzs.edu.ps,https://www.gzs.edu.ps", "………………"],
            ["مجلد الفرونت", "my_project/gazatna-frontend", "………………"],
            ["مجلد الباكند", "…/gazatna-backend", "………………"],
          ],
        },
        {
          type: "info",
          text: "في الخطة ب لا تحتاج سب دومين api.… إلا إذا استضافتك تفرض عنوانًا داخليًا للباكند مختلفًا عن مسار التحويل. الواجهة العامة تبقى دومين واحد.",
        },
      ],
    },
    {
      id: "ssl",
      title: "ثانيًا: الدومين و SSL (واجهة واحدة)",
      blocks: [
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "Domains",
              where: "cPanel → Domains",
              body: "تأكد أن gzs.edu.ps (و www إن لزم) موجود ومربوط بالحساب.",
            },
            {
              n: 2,
              title: "فعّل https",
              where: "cPanel → Security → SSL/TLS Status أو AutoSSL / Let's Encrypt",
              body: "فعّل الشهادة لدومين الواجهة. ادخل الموقع بـ https وليس http.",
            },
            {
              n: 3,
              title: "وجه الدومين لتطبيق Node",
              body: "في Setup Node.js App يجب أن يكون Application URL هو نفس الدومين العام. هذا يضمن أن / و /_next و /api تمر عبر Next أولًا (أساس الخطة ب).",
            },
          ],
        },
      ],
    },
    {
      id: "python",
      title: "ثالثًا: ضبط الباكند (Setup Python App)",
      blocks: [
        {
          type: "p",
          text: "حتى مع البروكسي من نفس الدومين، اضبط Django كإنتاج واسمح بأصل الواجهة.",
        },
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "افتح تطبيق البايثون",
              where: "cPanel → Software → Setup Python App → Edit",
              body: "تأكد أن التطبيق Running وأن Application root يشير لمجلد gazatna-backend.",
            },
            {
              n: 2,
              title: "Environment variables للخطة ب",
              body: "أضف/عدّل ثم احفظ:",
            },
          ],
        },
        {
          type: "table",
          headers: ["المتغير", "قيمة الخطة ب"],
          rows: [
            ["DJANGO_ENV", "production"],
            ["DJANGO_SETTINGS_MODULE", "config.settings"],
            [
              "CORS_ALLOWED_ORIGINS",
              "https://gzs.edu.ps,https://www.gzs.edu.ps",
            ],
            [
              "ALLOWED_HOSTS",
              "gzs.edu.ps,www.gzs.edu.ps",
            ],
            ["SECRET_KEY", "(مفتاحك السري)"],
            ["DB_NAME / DB_USER / DB_PASSWORD / DB_HOST", "(بيانات MySQL)"],
          ],
        },
        {
          type: "info",
          text: "CORS في الخطة ب يبقى مهمًا إذا وُجدت طلبات مباشرة من المتصفح بنفس الأصل؛ ضعه مطابقًا لـ https دومين الواجهة. بعد الحفظ اضغط Restart لتطبيق البايثون.",
        },
        {
          type: "h3",
          text: "عنوان الباكند الداخلي للتحويل",
        },
        {
          type: "p",
          text: "Next يحتاج يعرف أين Django فعليًا خلف البروكسي. عمليًا وقت البناء تُضبط NEXT_PUBLIC_API_URL على ما يراه المتصفح (https://gzs.edu.ps/api). وإعدادات rewrite تستخدم أصل هذا العنوان بعد حذف /api للوصول لمضيف الباكند. لذلك يجب أن يصل Django عبر نفس المضيف الذي اخترته في Application URL لبايثون، أو عبر عنوان داخلي متاح من بيئة Node إن كانت الاستضافة تعرضه.",
        },
        {
          type: "warn",
          text: "إذا بقي التحويل يشير إلى http://localhost:8000 فطلبات /api على السيرفر ستفشل. لا تبنِ الإنتاج بالقيمة الافتراضية المحلية.",
        },
      ],
    },
    {
      id: "node",
      title: "رابعًا: ضبط الفرونت (Setup Node.js App) للخطة ب",
      blocks: [
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "افتح تطبيق Node",
              where: "cPanel → Setup Node.js App → Edit",
              body: "Application URL = دومين الواجهة الوحيد (gzs.edu.ps).",
            },
            {
              n: 2,
              title: "Startup file",
              body: "server.js (إن كان هذا ما يعمل عندك).",
            },
            {
              n: 3,
              title: "Environment variables — للخطة ب",
              body: "أضف اثنين:",
              list: [
                "<code>NEXT_PUBLIC_API_URL</code> = <code>/api</code>",
                "<code>BACKEND_URL</code> = رابط <strong>Application URL</strong> لتطبيق Python من Setup Python App (مثل https://user.السيرفر.example/gazatna-backend) <strong>بدون</strong> /api في النهاية",
                "<code>NODE_ENV</code> = <code>production</code>",
              ],
            },
            {
              n: 4,
              title: "احفظ ثم Restart لتطبيق Node",
              body: "حتى تُقرأ المتغيرات على السيرفر (مفيد للـ middleware).",
            },
          ],
        },
        {
          type: "warn",
          text: "قيمة NEXT_PUBLIC_API_URL تُخبز داخل الجافاسكربت عند البناء. ضبطها في اللوحة وحدها لا يغيّر بناءًا قديمًا بُني على localhost. بعد التأكد من القيمة الصحيحة نفّذ خطوة إعادة البناء التالية.",
        },
      ],
    },
    {
      id: "rebuild",
      title: "خامسًا: أعد بناء الفرونت بقيمة الخطة ب ثم ارفعه",
      blocks: [
        {
          type: "p",
          text: "بدون تيرمنال على السيرفر: ابنِ على جهازك وارفع عبر File Manager (أو FTP إن رفض الماسح الـ ZIP).",
        },
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\">cd I:\\ghazatna\\gazatna-frontend\n\n# الخطة ب — المتصفح يستخدم /api من نفس الدومين\n$env:NEXT_PUBLIC_API_URL = \"/api\"\n\nnpm run pack:cpanel</pre><p>على السيرفر في Setup Node.js App ضع أيضاً BACKEND_URL = رابط تطبيق Python، ثم Restart لـ Node بعد رفع البناء.</p>",
        },
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "ارفع وفك الـ ZIP",
              where: "cPanel → File Manager → my_project/gazatna-frontend",
              body: "Upload ثم Extract فوق المجلد. تأكد أن .next تجددت.",
            },
            {
              n: 2,
              title: "إن رفض Foxhole الـ ZIP",
              body: "ارفع مجلد .next عبر FTP بدون ضغط (بعد حذف .next/dev محليًا إن وُجد)، أو اطلب من الدعم استثناء Foxhole.",
            },
            {
              n: 3,
              title: "Restart لتطبيق Node من اللوحة",
              body: "Setup Node.js App → Restart.",
            },
          ],
        },
      ],
    },
    {
      id: "verify",
      title: "سادسًا: اختبر أن الخطة ب مربوطة فعليًا",
      blocks: [
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "افتح https://gzs.edu.ps في نافذة خاصة",
              body: "تأكد أن الصفحة تظهر (وليست عالقة بلا JS — إن ظهرت 404 على /_next/static أصلِح تقديم الفرونت أولًا).",
            },
            {
              n: 2,
              title: "F12 → Network → حدّث",
              body: "ابحث عن طلبات إلى /api/… على نفس المضيف gzs.edu.ps وليس localhost وليس api. منفصل إن كنت ملتزمًا بالخطة ب.",
            },
            {
              n: 3,
              title: "جرّب تسجيل الدخول من /login",
              body: "نجاح الدخول يعني: الفرونت يصل للـ API عبر /api والباكند يرد.",
            },
            {
              n: 4,
              title: "اختبار يدوي لمسار الـ API من المتصفح",
              body: "افتح تبويبًا: https://gzs.edu.ps/api/ — إن مرّ عبر Next إلى Django سترى استجابة API/DRF وليس صفحة 404 لمجلد فارغ.",
            },
          ],
        },
        {
          type: "table",
          headers: ["العَرَض", "المعنى في الخطة ب", "ماذا تفعل من اللوحة"],
          rows: [
            [
              "الطلبات تذهب لـ localhost:8000",
              "بناء قديم بقيمة تطوير",
              "أعد pack بـ https://gzs.edu.ps/api وارفع .next",
            ],
            [
              "Failed to fetch / 502 على /api",
              "البروكسي لا يصل لبايثون أو بايثون متوقف",
              "Restart لـ Python و Node، تحقق Application URL للباكند",
            ],
            [
              "CORS error رغم نفس الدومين",
              "أصل مختلف (http ضد https أو www)",
              "وحّد https وعدّل CORS لنفس الأصل تمامًا + Restart بايثون",
            ],
            [
              "الصفحة تحمل و /api 404 من Apache",
              "الدومين لا يمر عبر Node",
              "اربط Application URL لدومين الواجهة كاملًا عبر Setup Node.js App",
            ],
            [
              "تسجيل الدخول 401 فقط",
              "الربط يعمل لكن بيانات الدخول خطأ",
              "جرّب حسابًا صحيحًا — هذا ليس فشل بروكسي",
            ],
          ],
        },
      ],
    },
    {
      id: "checklist",
      title: "سابعًا: قائمة تحقق الخطة ب",
      blocks: [
        {
          type: "ol",
          items: [
            "الموقع يُفتح على https://gzs.edu.ps عبر تطبيق Node.",
            "لا أعتمد سب دومين api للعامة في هذه الخطة.",
            "في Node Env: NEXT_PUBLIC_API_URL=https://gzs.edu.ps/api",
            "أعيد بناء الفرونت بهذا السطر ورفعت .next ثم Restart Node.",
            "في Python Env: DJANGO_ENV=production و CORS يضم https://gzs.edu.ps و www إن لزم + Restart.",
            "من Network: طلبات /api على نفس مضيف الواجهة.",
            "https://gzs.edu.ps/api يفتح استجابة باكند وليس 404 استضافة.",
            "تسجيل الدخول يعمل من نافذة خاصة.",
          ],
        },
      ],
    },
    {
      id: "cheat",
      title: "ورقة قيم الخطة ب (انسخ وعدّل الدومين فقط)",
      blocks: [
        {
          type: "table",
          headers: ["أين في cPanel", "ماذا تضع"],
          rows: [
            ["Node → Application URL", "gzs.edu.ps"],
            ["Node → Env NEXT_PUBLIC_API_URL", "/api"],
            ["Node → Env BACKEND_URL", "Application URL لتطبيق Python (بدون /api)"],
            ["Node → Startup", "server.js"],
            ["Python → Env DJANGO_ENV", "production"],
            ["Python → Env CORS_ALLOWED_ORIGINS", "https://gzs.edu.ps,https://www.gzs.edu.ps"],
            ["جهازك قبل pack", "$env:NEXT_PUBLIC_API_URL = \"/api\""],
          ],
        },
        {
          type: "p",
          text: "الخطة ب باختصار: دومين واحد للزائر → الفرونت يستقبل كل شيء → /api يُمرَّر للباكند → أعد البناء بعنوان https://دومينك/api → CORS و Restart للطرفين → اختبر Network وتسجيل الدخول.",
        },
      ],
    },
  ],
};
