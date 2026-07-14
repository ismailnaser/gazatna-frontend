/** دليل رفع منصة غَزتنا على cPanel — بدون تيرمنال (Git + Setup Python App) */
export default {
  filename: "دليل-رفع-الموقع-على-cPanel.pdf",
  title: "دليل رفع الموقع على cPanel",
  subtitle:
    "شرح مفصل خطوة بخطوة لرفع منصة غَزتنا باستخدام Git Version Control و Setup Python App فقط — بدون تيرمنال وبدون أوامر يدوية",
  sections: [
    {
      id: "overview",
      title: "قبل ما تبدأ — نظرة عامة",
      blocks: [
        {
          type: "p",
          text: "هذا الدليل يشرح طريقة رفع منصة غَزتنا على استضافة cPanel باستخدام واجهات cPanel فقط. لن نستخدم التيرمنال ولا SSH. الاعتماد على: Git Version Control لجلب الكود من GitHub، و Setup Python App لتشغيل الخادم (Django)، وأدوات MySQL الجاهزة في cPanel.",
        },
        {
          type: "info",
          text: "الموقع مكوّن من جزئين: (1) الخادم الخلفي Django داخل مجلد gazatna-backend — هذا الجزء يُدار بـ Setup Python App. (2) الواجهة Next.js داخل مجلد gazatna-frontend — إذا كان عندك في cPanel خيار Setup Node.js App تستخدمه بنفس أسلوب الواجهة الرسومية. الدليل يغطي الاثنين بالتفصيل.",
        },
        {
          type: "h3",
          text: "ماذا تحتاج جاهزاً؟",
        },
        {
          type: "ul",
          items: [
            "حساب cPanel للدومين (مثل gzs.edu.ps) مع صلاحية الدخول.",
            "مستودع GitHub فيه مشروع غَزتنا (الباكند والفرونتند).",
            "معرفة بيانات الـ GitHub (رابط المستودع، واسم المستخدم، وإن لزم رمز وصول Personal Access Token لو المستودع خاص).",
            "اختيار بايثون <strong>3.11.10</strong> من قائمة cPanel (هذا أحدث إصدار متاح عندك على السيرفر).",
          ],
        },
        {
          type: "warn",
          text: "لا تضع كلمة سر قاعدة البيانات أو SECRET_KEY داخل ملفات الكود أو داخل GitHub. كل الأسرار تُضاف فقط من شاشة Environment variables داخل Setup Python App.",
        },
        {
          type: "h3",
          text: "الترتيب الصحيح للخطوات",
        },
        {
          type: "ol",
          items: [
            "إنشاء قاعدة بيانات MySQL من cPanel.",
            "ربط المستودع ورفع الكود عبر Git Version Control.",
            "إنشاء تطبيق بايثون عبر Setup Python App وربطه بمجلد gazatna-backend.",
            "إدخال متغيرات البيئة (بما فيها DJANGO_ENV=production).",
            "تثبيت مكتبات requirements.txt من واجهة التطبيق.",
            "تشغيل أوامر Django المطلوبة من واجهة الأوامر داخل التطبيق (إن وُجدت) أو عبر Git hooks المعتمدة في لوحة Git.",
            "ضبط الواجهة الأمامية (Node.js App) وربطها بالـ API.",
            "اختبار الموقع والتأكد من الدخول.",
          ],
        },
      ],
    },
    {
      id: "mysql",
      title: "أولاً: إنشاء قاعدة بيانات MySQL من cPanel",
      blocks: [
        {
          type: "p",
          text: "على السيرفر نستخدم MySQL (وليس SQLite). أنشئ القاعدة والمستخدم والصلاحيات من واجهة cPanel فقط.",
        },
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "افتح أداة قواعد البيانات",
              where: "cPanel → Databases → MySQL® Databases (أو MySQL Database Wizard)",
              body: "إن وُجدت «Database Wizard» فهي أسهل للمبتدئين لأنها تمشي معك خطوة خطوة.",
            },
            {
              n: 2,
              title: "أنشئ قاعدة البيانات",
              body: "اكتب اسماً واضحاً مثل: ghazatna أو school. cPanel غالباً يضيف بادئة اسم حسابك تلقائياً (مثال: user_ghazatna). انسخ الاسم الكامل كما يظهر بعد الإنشاء.",
            },
            {
              n: 3,
              title: "أنشئ مستخدم قاعدة البيانات",
              body: "اختر اسم مستخدم وكلمة مرور قوية. احفظ الثلاثة عندك في مكان آمن: اسم القاعدة، اسم المستخدم، كلمة المرور.",
            },
            {
              n: 4,
              title: "اربط المستخدم بالقاعدة وامنحه كل الصلاحيات",
              body: "من قسم Add User To Database اختر المستخدم + القاعدة → اضغط Make Changes → فعّل ALL PRIVILEGES ثم احفظ.",
            },
          ],
        },
        {
          type: "table",
          headers: ["المعلومة", "أين تجدها / القيمة المعتادة"],
          rows: [
            ["DB_NAME", "الاسم الكامل لقاعدة البيانات بعد البادئة"],
            ["DB_USER", "الاسم الكامل لمستخدم MySQL"],
            ["DB_PASSWORD", "كلمة مرور المستخدم التي اخترتها"],
            ["DB_HOST", "عادةً localhost على cPanel"],
            ["DB_PORT", "عادةً 3306 (اختياري)"],
          ],
        },
        {
          type: "info",
          text: "هذه القيم ستدخلها لاحقاً كمتغيرات بيئة داخل Setup Python App. لا تحتاج كتابتها في أي ملف داخل المشروع.",
        },
      ],
    },
    {
      id: "git",
      title: "ثانياً: رفع الكود عبر Git Version Control (بدون تيرمنال)",
      blocks: [
        {
          type: "p",
          text: "بدل رفع الملفات يدوياً بملف ZIP، نربط cPanel بمستودع GitHub. أي تحديث لاحق يصير بضغطة Pull من نفس الشاشة.",
        },
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "افتح Git Version Control",
              where: "cPanel → Files → Git™ Version Control",
              body: "اضغط Create ثم اختر Clone a Repository.",
            },
            {
              n: 2,
              title: "أدخل رابط المستودع",
              body: "ضع رابط GitHub لمشروع غَزتنا (HTTPS مفضل).",
              list: [
                "مستودع عام: يكفي الرابط مثل https://github.com/USERNAME/ghazatna.git",
                "مستودع خاص: استخدم رابطاً مع رمز وصول، أو اضبط مصادقة GitHub من إعدادات cPanel حسب ما يوفره الاستضافة (مثل Deploy Keys أو Token).",
              ],
            },
            {
              n: 3,
              title: "حدد مجلد الاستنساخ (Repository Path)",
              body: "اختر مساراً واضحاً داخل حسابك، مثلاً: repositories/ghazatna أو مباشرة تحت home بما يناسب سياسة الاستضافة. المهم أن تعرف المسار الكامل لأن Setup Python App سيشير لمجلد gazatna-backend داخله.",
            },
            {
              n: 4,
              title: "اختر الفرع Branch",
              body: "غالباً main أو master. تأكد أنه الفرع الذي عليه كود الإنتاج النهائي.",
            },
            {
              n: 5,
              title: "أنهِ الاستنساخ",
              body: "اضغط Create / Clone وانتظر حتى يظهر المستودع في القائمة بحالة ناجحة.",
            },
            {
              n: 6,
              title: "للتحديثات لاحقاً",
              where: "نفس صفحة Git Version Control → المستودع → Manage / Pull",
              body: "كلما دفعت تعديلاً جديداً إلى GitHub، ارجع هنا واضغط Pull أو Update. لا تحتاج تيرمنال.",
            },
          ],
        },
        {
          type: "warn",
          text: "بعد كل Pull قد تحتاج إعادة تشغيل تطبيق البايثون من Setup Python App (زر Restart) حتى يقرأ الكود الجديد.",
        },
        {
          type: "h3",
          text: "هيكل المجلدات المتوقع بعد الاستنساخ",
        },
        {
          type: "ul",
          items: [
            "<code>…/ghazatna/gazatna-backend/</code> ← تطبيق Django (هنا Setup Python App)",
            "<code>…/ghazatna/gazatna-frontend/</code> ← واجهة Next.js (هنا Setup Node.js App إن وُجد)",
            "<code>…/ghazatna/gazatna-backend/requirements.txt</code> ← قائمة مكتبات بايثون",
            "<code>…/ghazatna/gazatna-backend/passenger_wsgi.py</code> ← نقطة تشغيل Django على cPanel",
            "<code>…/ghazatna/gazatna-backend/config/settings.py</code> ← إعدادات local/production",
          ],
        },
      ],
    },
    {
      id: "python-app",
      title: "ثالثاً: Setup Python App (تشغيل Django)",
      blocks: [
        {
          type: "p",
          text: "من هذه الأداة تُنشئ بيئة بايثون وتربط الدومين/المسار بمجلد gazatna-backend بدون كتابة أوامر في التيرمنال.",
        },
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "افتح Setup Python App",
              where: "cPanel → Software → Setup Python App",
              body: "اضغط Create Application.",
            },
            {
              n: 2,
              title: "اختر إصدار بايثون 3.11.10",
              body: "من قائمة Python version اختر 3.11.10 — هذا الإصدار المعتمد للمشروع والمتوافق مع requirements.txt.",
            },
            {
              n: 3,
              title: "حدد Application root",
              body: "وجّه المسار إلى مجلد الباكند بعد الاستنساخ، مثال: repositories/ghazatna/gazatna-backend (استخدم المسار الفعلي عندك).",
            },
            {
              n: 4,
              title: "حدد Application URL",
              body: "اختر الدومين أو الدومين الفرعي الذي سيستقبل واجهة الـ API، مثال: api.gzs.edu.ps أو مسار تحت الدومين الرئيسي حسب تخطيطك. سجّل هذا الرابط لأن الواجهة الأمامية ستحتاجه.",
            },
            {
              n: 5,
              title: "Application startup file",
              body: "ضع: passenger_wsgi.py (الملف موجود داخل gazatna-backend في المستودع).",
            },
            {
              n: 6,
              title: "Application Entry point",
              body: "إن ظهرت خانة Entry point / WSGI ضع: application (وهذا الاسم المعرّف داخل passenger_wsgi.py).",
            },
            {
              n: 7,
              title: "أنشئ التطبيق",
              body: "اضغط Create ثم احفظ الصفحة. cPanel سينشئ بيئة افتراضية (virtualenv) ويربط Passenger بالملف.",
            },
          ],
        },
        {
          type: "info",
          text: "لو ظهرت رسالة عن passenger_wsgi.py أو تعارض مسار، تأكد أن Application root يشير مباشرة لمجلد gazatna-backend وليس لمجلد أعلى أو أسفل منه بالخطأ.",
        },
      ],
    },
    {
      id: "env",
      title: "رابعاً: متغيرات البيئة Environment Variables",
      blocks: [
        {
          type: "p",
          text: "هذه أهم خطوة للإنتاج. بدونها الموقع يبقى على وضع التطوير المحلي أو يفشل الاتصال بقاعدة MySQL.",
        },
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "افتح تعديل التطبيق",
              where: "Setup Python App → اختر تطبيقك → Edit / Configuration",
              body: "انزل لقسم Environment variables أو Variables.",
            },
            {
              n: 2,
              title: "أضف المتغيرات التالية واحداً واحداً",
              body: "اضغط Add variable لكل سطر، ثم احفظ في النهاية وأعد تشغيل التطبيق (Restart).",
            },
          ],
        },
        {
          type: "table",
          headers: ["اسم المتغير", "القيمة", "ملاحظة"],
          rows: [
            ["DJANGO_ENV", "production", "يُفعّل MySQL ويُطفئ DEBUG تلقائياً من settings.py"],
            ["DJANGO_SETTINGS_MODULE", "config.settings", "ملف الإعدادات الموحد"],
            ["SECRET_KEY", "(مفتاح عشوائي طويل)", "لا ترفعه على GitHub"],
            ["DB_NAME", "اسم قاعدة MySQL الكامل", "من خطوة MySQL"],
            ["DB_USER", "اسم مستخدم MySQL الكامل", "من خطوة MySQL"],
            ["DB_PASSWORD", "كلمة مرور MySQL", "سرية تماماً"],
            ["DB_HOST", "localhost", "المعتاد على cPanel"],
            ["DB_PORT", "3306", "اختياري"],
            [
              "CORS_ALLOWED_ORIGINS",
              "https://gzs.edu.ps,https://www.gzs.edu.ps",
              "ضع دومين الواجهة الحقيقي، مفصولاً بفواصل بلا مسافات زائدة",
            ],
          ],
        },
        {
          type: "warn",
          text: "إن نسيت DJANGO_ENV=production سيحاول النظام العمل كأنه local بـ SQLite، وهذا غير مناسب على السيرفر.",
        },
        {
          type: "h3",
          text: "كيف تولّد SECRET_KEY؟",
        },
        {
          type: "p",
          text: "ولّده مرة واحدة على جهازك المحلي (من سكربت المشروع أو أي مولّد Django)، ثم الصقه فقط في متغير البيئة على cPanel. لا تضعه داخل الكود.",
        },
      ],
    },
    {
      id: "packages",
      title: "خامساً: تثبيت المتطلبات من واجهة Python App",
      blocks: [
        {
          type: "p",
          text: "ملف requirements.txt داخل gazatna-backend جاهز ومتوافق مع بايثون 3.11.10. ثبّته من واجهة التطبيق وليس من التيرمنال.",
        },
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "افتح قسم Configuration files داخل التطبيق",
              where: "Setup Python App → Edit التطبيق",
              body: "ابحث عن خانة Configuration file / requirements وحدد الملف requirements.txt الموجود في جذر gazatna-backend.",
            },
            {
              n: 2,
              title: "نفّذ تثبيت الحزم من الزر في الواجهة",
              body: "معظم لوحات cPanel تعرض زراً مثل Run Pip Install أو Update من requirements.txt. اضغطه وانتظر حتى يظهر اكتمال التثبيت بدون أخطاء حمراء.",
            },
            {
              n: 3,
              title: "تأكد من ظهور الحزم الأساسية",
              body: "بعد التثبيت يفترض أن تُثبَّت مكتبات مثل Django و djangorestframework و mysqlclient و gunicorn و Pillow. إن فشل mysqlclient أخبر الاستضافة أن مكتبة التطوير MySQL client غير مفعّلة على السيرفر.",
            },
            {
              n: 4,
              title: "أعد تشغيل التطبيق",
              body: "اضغط Restart للتطبيق حتى تُحمَّل المكتبات الجديدة.",
            },
          ],
        },
        {
          type: "info",
          text: "بعض الاستضافات توفّر أيضاً صندوق Execute python script أو Run Module داخل نفس صفحة التطبيق. استخدمه فقط إن احتجت تشغيل أوامر Django من الواجهة كما في القسم التالي.",
        },
      ],
    },
    {
      id: "django-init",
      title: "سادساً: تهيئة Django على السيرفر (migrate و collectstatic)",
      blocks: [
        {
          type: "p",
          text: "بعد تثبيت الحزم تحتاج إنشاء جداول قاعدة البيانات وجمع الملفات الثابتة. ذلك يتم عادة بأوامر manage.py. بما أننا نتجنب التيرمنال الخارجي، استخدم أدوات cPanel الرسومية المتاحة لتطبيق البايثون.",
        },
        {
          type: "h3",
          text: "الخيار أ — من واجهة Setup Python App (الأفضل إن وُجد)",
        },
        {
          type: "ol",
          items: [
            "افتح تطبيقك في Setup Python App.",
            "ابحث عن قسم مثل Execute Python Script / Run Command / Enter Console داخل صفحة التطبيق (واجهة داخل المتصفح وليست تيرمنال خارجي).",
            "شغّل بالترتيب: <code>manage.py migrate</code>",
            "ثم: <code>manage.py collectstatic --noinput</code>",
            "اختياري لأول تشغيل: إنشاء مشرف عبر <code>manage.py createsuperuser</code> إن وفّرت الواجهة إدخالاً تفاعلياً، أو أنشئ حساب الإدارة لاحقاً من أداة جاهزة داخل النظام إن وجدت.",
          ],
        },
        {
          type: "h3",
          text: "الخيار ب — Git Deploy Hook من واجهة Git (بدون SSH)",
        },
        {
          type: "p",
          text: "من Git Version Control → Manage → قد تجد خانة Deployment / Hooks. ضع فيها أوامر ما بعد السحب إن سمحت الاستضافة بذلك (تفعيل البيئة ثم migrate و collectstatic). الهدف أن تبقى كل العملية من لوحات cPanel دون الدخول لسيرفر عبر SSH.",
        },
        {
          type: "warn",
          text: "إذا استضافتك لا تعرض أي زر لتنفيذ سكربت بايثون داخل اللوحة، اطلب من الدعم تفعيل «Python App console» أو نفّذ الخطوتين لأول مرة بمساعدتهم — لأن migrate ضروري مرة واحدة على الأقل لإنشاء الجداول.",
        },
        {
          type: "h3",
          text: "الملفات الثابتة والوسائط",
        },
        {
          type: "ul",
          items: [
            "STATIC_ROOT في المشروع هو مجلد static داخل الباكند بعد collectstatic.",
            "MEDIA للمرفوعات (صور المعلمين، إيصالات…) داخل مجلد media.",
            "من Domains / Redirects أو من إعدادات التطبيق تأكد أن المسارات /static/ و /media/ تُخدم بشكل صحيح. كثير من استضافات Passenger تخدمها تلقائياً مع Django عند DEBUG=False إن ضُبطت الروابط في urls أو عبر Alias من لوحة MultiPHP/Apache داخل cPanel عند الحاجة.",
          ],
        },
      ],
    },
    {
      id: "frontend",
      title: "سابعاً: رفع الواجهة (Next.js) بدون تيرمنال",
      blocks: [
        {
          type: "p",
          text: "الواجهة في مجلد gazatna-frontend. الطريقة الموافقة لفكرة «بدون تيرمنال» هي Setup Node.js App إن كانت ظاهرة في cPanel لديك (ضمن Software).",
        },
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "افتح Setup Node.js App",
              where: "cPanel → Software → Setup Node.js App",
              body: "إن لم تجد الأداة، اطلب من الاستضافة تفعيلها أو استخدم خيار البناء المسبق محلياً كما في الملاحظة أسفل هذا القسم.",
            },
            {
              n: 2,
              title: "أنشئ تطبيقاً جديداً",
              body: "اختر إصدار Node حديث مستقر تدعمه الاستضافة، وحدّد Application root على مجلد gazatna-frontend بعد الاستنساخ بـ Git.",
            },
            {
              n: 3,
              title: "اربط Application URL",
              body: "غالباً الدومين الرئيسي https://gzs.edu.ps للموقع العام، بينما الـ API على نطاق فرعي أو مسار منفصل.",
            },
            {
              n: 4,
              title: "أضف متغير الواجهة",
              body: "أضف متغيراً باسم NEXT_PUBLIC_API_URL وقيمته رابط الـ API مع /api في النهاية، مثال: https://api.gzs.edu.ps/api أو https://gzs.edu.ps/api حسب أين ربطت Python App.",
            },
            {
              n: 5,
              title: "ثبّت الحزم وابنِ الواجهة من أزرار اللوحة",
              body: "استخدم أزرار Install / Run NPM Install ثم Build إن وُجدت (npm install و npm run build من الواجهة). ثم ضع أمر التشغيل Application startup على ما تتيحه اللوحة لـ next start، أو حسب النص الذي تعرضه واجهة Node.js App لتطبيقات Next.",
            },
            {
              n: 6,
              title: "أعد تشغيل تطبيق Node",
              body: "Restart ثم جرّب فتح الدومين من المتصفح.",
            },
          ],
        },
        {
          type: "info",
          text: "الواجهة عندك تعمل محلياً على المنفذ 3001 وتوجّه طلبات /api إلى Django. على السيرفر يجب أن يشير NEXT_PUBLIC_API_URL إلى عنوان الـ API الحقيقي بعد رفع الباكند.",
        },
        {
          type: "h3",
          text: "إن لم يتوفر Setup Node.js App",
        },
        {
          type: "p",
          text: "ابنِ الواجهة على جهازك المحلي مرة واحدة، ثم ارفع مخرجات التشغيل عبر Git إلى فرع إنتاج أو ارفع ملفات البناء بأداة File Manager فقط للملفات الناتجة — هذا استثناء نادر ويفضّل تجنّبه إن توفرت أداة Node في cPanel.",
        },
      ],
    },
    {
      id: "dns-ssl",
      title: "ثامناً: الدومين وشهادة SSL",
      blocks: [
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "تأكد أن الدومين يشير للاستضافة",
              where: "cPanel → Domains",
              body: "الدومين gzs.edu.ps (و www إن رغبت) يجب أن يكون مضافاً ومربوطاً بالحساب.",
            },
            {
              n: 2,
              title: "فعّل شهادة الأمان HTTPS",
              where: "cPanel → Security → SSL/TLS Status أو Let's Encrypt",
              body: "فعّل AutoSSL أو Let's Encrypt للدومين والدومين الفرعي الخاص بالـ API إن وُجد. لازم الموقع يفتح بـ https وليس http فقط.",
            },
            {
              n: 3,
              title: "طابق CORS مع الدومين النهائي",
              body: "ارجع لمتغير CORS_ALLOWED_ORIGINS في Python App وتأكد أنه يضم روابط الواجهة الفعلية بعد تفعيل SSL (https).",
            },
          ],
        },
      ],
    },
    {
      id: "checklist",
      title: "تاسعاً: قائمة التحقق بعد الرفع",
      blocks: [
        {
          type: "ol",
          items: [
            "فتح رابط الـ API في المتصفح لا يعطي خطأ 500 مستمر (قد تظهر صفحة Django أو استجابة JSON حسب المسار).",
            "فتح الدومين الرئيسي يعرض واجهة المدرسة.",
            "صفحة تسجيل الدخول تعمل.",
            "الدخول بحساب إدارة تجريبي أو الحساب الذي أنشأته ينجح.",
            "رفع صورة أو ملف صغير يعمل (للتحقق من MEDIA).",
            "بعد أي تحديث من GitHub: Pull من Git Version Control ثم Restart لتطبيق البايثون (والنود إن لزم).",
          ],
        },
        {
          type: "table",
          headers: ["مشكلة شائعة", "ماذا تراجع؟"],
          rows: [
            ["خطأ قاعدة بيانات / OperationalError", "DB_NAME و DB_USER و DB_PASSWORD و DB_HOST + صلاحيات المستخدم"],
            ["الموقع يبدو وضع تطوير أو SQLite", "هل DJANGO_ENV=production محفوظ ثم عملت Restart؟"],
            ["CORS / منع طلبات من الواجهة", "CORS_ALLOWED_ORIGINS يطابق دومين الواجهة بـ https"],
            ["صفحة بيضاء أو 503", "Restart لـ Python App وتأكد أن passenger_wsgi.py في المكان الصحيح"],
            ["مكتبات ناقصة", "أعد تثبيت requirements.txt من واجهة التطبيق"],
            ["الواجهة لا تصل للـ API", "NEXT_PUBLIC_API_URL ومسار Application URL للباكند"],
          ],
        },
      ],
    },
    {
      id: "updates",
      title: "عاشراً: روتين التحديثات اليومية (Git فقط)",
      blocks: [
        {
          type: "p",
          text: "بعد أن يعمل الموقع، التحديث يكون بسيطاً ومستمراً بدون تيرمنال:",
        },
        {
          type: "ol",
          items: [
            "على جهازك: ارفع التعديلات إلى GitHub (Commit + Push) كالمعتاد من Cursor أو GitHub Desktop.",
            "على cPanel → Git Version Control → Pull لأحدث نسخة.",
            "إن تغيّر requirements.txt: أعد Run Pip Install من Setup Python App.",
            "إن وُجدت migrations جديدة: نفّذ migrate من واجهة أوامر التطبيق.",
            "Restart لتطبيق البايثون، وإن لزم Restart لتطبيق Node.",
            "جرّب صفحة الدخول وصفحة واحدة من الإدارة بسرعة.",
          ],
        },
        {
          type: "info",
          text: "خلاصة السياسة: الكود من GitHub، الأسرار من Environment variables، التشغيل من Setup Python App / Setup Node.js App — وهذه الثلاثة كافية لإدارة الموقع بدون تيرمنال.",
        },
      ],
    },
    {
      id: "summary",
      title: "ملخص سريع للقِيَم المرجعية",
      blocks: [
        {
          type: "table",
          headers: ["البند", "القيمة المرجعية في مشروع غَزتنا"],
          rows: [
            ["بايثون", "3.11.10"],
            ["Django", "4.1.x (متوافق مع MariaDB 10.3 على الاستضافة)"],
            ["قاعدة السيرفر", "MariaDB 10.3 / MySQL عبر متغيرات DB_*"],
            ["ملف الإعدادات", "config.settings"],
            ["مفتاح بيئة الإنتاج", "DJANGO_ENV=production"],
            ["قاعدة محلية", "SQLite"],
            ["Startup file", "passenger_wsgi.py"],
            ["متطلبات بايثون", "gazatna-backend/requirements.txt"],
            ["دومين مثالي", "gzs.edu.ps / www.gzs.edu.ps"],
          ],
        },
        {
          type: "p",
          text: "إذا التزمت بهذا الترتيب: MySQL → Git Clone → Python App → Environment → Pip Install → migrate/collectstatic → Node App → SSL، يكون الموقع جاهزاً للتشغيل على cPanel بنفس الأدوات التي طلبتها بدون استخدام التيرمنال.",
        },
      ],
    },
  ],
};
