/** دليل رفع منصة غَزتنا على cPanel — مع التيرمنال (Terminal / SSH) */
export default {
  filename: "دليل-رفع-الموقع-على-cPanel-مع-التيرمنال.pdf",
  title: "دليل رفع الموقع على cPanel (مع التيرمنال)",
  subtitle:
    "شرح كامل خطوة بخطوة لرفع منصة غَزتنا على الاستضافة: cPanel + Git + Setup Python App + أوامر التيرمنال (SSH)",
  sections: [
    {
      id: "overview",
      title: "قبل ما تبدأ",
      blocks: [
        {
          type: "p",
          text: "هذا الدليل مخصص لحالة عندك صلاحية تيرمنال (Terminal أو SSH) داخل cPanel. رح نستخدم الواجهة الرسومية لإنشاء قاعدة البيانات وتطبيق البايثون، والتيرمنال لتثبيت الحزم وتشغيل migrate و collectstatic وأي أمر Django/Node يلزم.",
        },
        {
          type: "info",
          text: "يوجد أيضاً دليل سابق بدون تيرمنال. هذا الملف هو النسخة الأكمل والأوضح عندما يكون التيرمنال متاحاً.",
        },
        {
          type: "h3",
          text: "ما تحتاجه",
        },
        {
          type: "ul",
          items: [
            "دخول cPanel للدومين (مثل gzs.edu.ps).",
            "مستودع GitHub فيه المشروع (gazatna-backend + gazatna-frontend).",
            "تفعيل Terminal أو SSH Access من الاستضافة.",
            "بايثون <strong>3.11.10</strong> من Setup Python App.",
            "قاعدة <strong>MariaDB 10.3</strong> (المشروع مضبوط على Django 4.1.x لهذا السبب).",
          ],
        },
        {
          type: "h3",
          text: "الترتيب المختصر",
        },
        {
          type: "ol",
          items: [
            "إنشاء قاعدة MariaDB/MySQL من cPanel.",
            "رفع الكود بـ Git Version Control (أو git clone من التيرمنال).",
            "إنشاء Setup Python App على مجلد gazatna-backend.",
            "إضافة Environment Variables.",
            "من التيرمنال: تفعيل البيئة → pip install → migrate → collectstatic.",
            "رفع/بناء الواجهة (Node) وربط NEXT_PUBLIC_API_URL.",
            "تفعيل SSL ثم اختبار الموقع.",
          ],
        },
        {
          type: "warn",
          text: "لا تضع SECRET_KEY أو كلمات مرور قاعدة البيانات داخل GitHub. ضعها فقط في Environment variables أو ملف .env غير مرفوع.",
        },
      ],
    },
    {
      id: "mysql",
      title: "أولاً: إنشاء قاعدة البيانات من cPanel",
      blocks: [
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "افتح MySQL Databases",
              where: "cPanel → Databases → MySQL® Databases (أو Database Wizard)",
              body: "أنشئ قاعدة بيانات واسم مستخدم وكلمة مرور قوية، ثم اربط المستخدم بالقاعدة بـ ALL PRIVILEGES.",
            },
            {
              n: 2,
              title: "احفظ هذه القيم",
              body: "ستستخدمها كمتغيرات بيئة وكأوامر لاحقاً:",
              list: [
                "<code>DB_NAME</code> = الاسم الكامل للقاعدة (مع بادئة الحساب)",
                "<code>DB_USER</code> = الاسم الكامل للمستخدم",
                "<code>DB_PASSWORD</code> = كلمة المرور",
                "<code>DB_HOST</code> = عادةً <code>localhost</code>",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "git",
      title: "ثانياً: رفع الكود (Git من الواجهة أو التيرمنال)",
      blocks: [
        {
          type: "h3",
          text: "الطريقة أ — Git Version Control (واجهة)",
        },
        {
          type: "ol",
          items: [
            "cPanel → Files → Git™ Version Control → Create → Clone.",
            "الصق رابط المستودع واختر الفرع <code>main</code> (أو الفرع المعتمد).",
            "حدد مسار الاستنساخ، مثال: <code>repositories/ghazatna</code>.",
            "بعد أي تحديث لاحق: نفس الصفحة → Pull / Update.",
          ],
        },
        {
          type: "h3",
          text: "الطريقة ب — من التيرمنال",
        },
        {
          type: "info",
          html: "<strong>فتح التيرمنال:</strong> cPanel → Advanced → Terminal<br/><br/><pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\">cd ~\nmkdir -p repositories\ncd repositories\ngit clone https://github.com/USERNAME/ghazatna.git\ncd ghazatna\nls</pre><p>يفترض أن ترى المجلدين: <code>gazatna-backend</code> و <code>gazatna-frontend</code>.</p>",
        },
        {
          type: "p",
          text: "للتحديث لاحقاً من التيرمنال:",
        },
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\">cd ~/repositories/ghazatna\ngit pull origin main</pre>",
        },
      ],
    },
    {
      id: "python-app",
      title: "ثالثاً: إنشاء Setup Python App",
      blocks: [
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "Create Application",
              where: "cPanel → Software → Setup Python App",
              body: "اختر Python version = 3.11.10.",
            },
            {
              n: 2,
              title: "Application root",
              body: "مسار مجلد الباكند بعد الاستنساخ، مثال: <code>repositories/ghazatna/gazatna-backend</code>.",
            },
            {
              n: 3,
              title: "Application URL",
              body: "دومين أو سب دومين للـ API مثل <code>api.gzs.edu.ps</code> أو مسار تحت الدومين الرئيسي. احفظ هذا الرابط.",
            },
            {
              n: 4,
              title: "Startup file",
              body: "ضع: <code>passenger_wsgi.py</code> (موجود في المستودع).",
            },
            {
              n: 5,
              title: "Entry point",
              body: "إن وُجدت الخانة: <code>application</code>.",
            },
            {
              n: 6,
              title: "Create ثم انسخ أمر تفعيل البيئة",
              body: "بعد الإنشاء، cPanel يعرض سطراً مثل <code>source /home/USER/virtualenv/.../bin/activate</code>. انسخه — سنستخدمه في التيرمنال.",
            },
          ],
        },
      ],
    },
    {
      id: "env",
      title: "رابعاً: متغيرات البيئة",
      blocks: [
        {
          type: "p",
          text: "من Setup Python App → Edit → Environment variables أضف:",
        },
        {
          type: "table",
          headers: ["المتغير", "مثال / قيمة"],
          rows: [
            ["DJANGO_ENV", "production"],
            ["DJANGO_SETTINGS_MODULE", "config.settings"],
            ["SECRET_KEY", "مفتاح عشوائي طويل"],
            ["DB_NAME", "user_ghazatna"],
            ["DB_USER", "user_dbuser"],
            ["DB_PASSWORD", "••••••••"],
            ["DB_HOST", "localhost"],
            ["DB_PORT", "3306"],
            ["CORS_ALLOWED_ORIGINS", "https://gzs.edu.ps,https://www.gzs.edu.ps"],
          ],
        },
        {
          type: "warn",
          text: "بدون DJANGO_ENV=production الموقع يظل على وضع local و SQLite — وهذا غلط على السيرفر.",
        },
        {
          type: "h3",
          text: "توليد SECRET_KEY (اختياري من جهازك أو التيرمنال)",
        },
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\">python -c \"from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())\"</pre><p>أو من سكربت المشروع بعد تثبيت Django:</p><pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\">python scripts/generate_secret_key.py</pre>",
        },
      ],
    },
    {
      id: "terminal-backend",
      title: "خامساً: أوامر التيرمنال للباكند (الأهم)",
      blocks: [
        {
          type: "p",
          text: "افتح Terminal من cPanel، ثم نفّذ الأوامر بالترتيب. استبدل المسارات بما يظهر عندك في Setup Python App.",
        },
        {
          type: "h3",
          text: "1) تفعيل بيئة البايثون والدخول لمجلد المشروع",
        },
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\"># الصق أمر source الذي يعطيك إياه Setup Python App، مثال:\nsource /home/USERNAME/virtualenv/repositories/ghazatna/gazatna-backend/3.11.10/bin/activate\n\ncd ~/repositories/ghazatna/gazatna-backend\n\npython --version\n# المتوقع: Python 3.11.10</pre>",
        },
        {
          type: "h3",
          text: "2) تثبيت المتطلبات",
        },
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\">pip install --upgrade pip\npip install -r requirements.txt\n\npython -c \"import django; print(django.get_version())\"\n# المتوقع ضمن سلسلة 4.1.x</pre>",
        },
        {
          type: "info",
          text: "Django مضبوط على 4.1.x ليتوافق مع MariaDB 10.3 على الاستضافة. لا ترفع Django إلى 4.2 أو 5.x على هذا السيرفر دون ترقية قاعدة البيانات.",
        },
        {
          type: "h3",
          text: "3) إنشاء جداول قاعدة البيانات",
        },
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\">export DJANGO_ENV=production\n# أو تأكد أن متغيرات البيئة محقونة من تطبيق cPanel بعد إعادة التشغيل\n\npython manage.py migrate\npython manage.py check</pre>",
        },
        {
          type: "h3",
          text: "4) جمع الملفات الثابتة",
        },
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\">python manage.py collectstatic --noinput</pre>",
        },
        {
          type: "h3",
          text: "5) إنشاء مشرف (حساب إدارة)",
        },
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\">python manage.py createsuperuser</pre><p>اتبع الأسئلة (اسم مستخدم، إيميل، كلمة مرور).</p>",
        },
        {
          type: "h3",
          text: "6) إعادة تشغيل تطبيق البايثون",
        },
        {
          type: "p",
          text: "من Setup Python App اضغط Restart. بعض الاستضافات تقبل أيضاً لمس ملف إعادة التحميل:",
        },
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\">mkdir -p tmp\ntouch tmp/restart.txt</pre>",
        },
      ],
    },
    {
      id: "db-reset",
      title: "أوامر مفيدة لقاعدة البيانات (بحذر)",
      blocks: [
        {
          type: "warn",
          text: "الأوامر التالية تمسح بيانات. لا تستخدمها على بيانات حقيقية إلا إذا قصدت المسح الكامل.",
        },
        {
          type: "h3",
          text: "تفريغ البيانات مع بقاء الجداول",
        },
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\">python manage.py flush --no-input\n# أو:\npython manage.py wipe_data</pre>",
        },
        {
          type: "h3",
          text: "حذف القاعدة بالكامل وإعادة إنشائها (MariaDB)",
        },
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\">python manage.py dbshell</pre><p>ثم داخل MySQL:</p><pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\">DROP DATABASE اسم_القاعدة;\nCREATE DATABASE اسم_القاعدة CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\nEXIT;</pre><p>ثم خارجها:</p><pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\">python manage.py migrate</pre>",
        },
      ],
    },
    {
      id: "frontend",
      title: "سادساً: الواجهة الأمامية (Next.js) — بالتفصيل مثل الباكند",
      blocks: [
        {
          type: "p",
          text: "الواجهة داخل مجلد gazatna-frontend (Next.js). مثل الباكند: جزء من اللوحة الرسومية (Setup Node.js App) وجزء من التيرمنال (تثبيت، بناء، تشغيل، تحديث). أكمل هذا القسم فقط بعد ما الـ API يشتغل ويجاوب على الدومين/المسار تبع Python App.",
        },
        {
          type: "info",
          text: "الواجهة توجّه طلبات /api و /media إلى عنوان الباكند عبر NEXT_PUBLIC_API_URL (انظر next.config.ts). لذلك خطأ شائع بعد الرفع: بناء الواجهة قبل ضبط رابط الـ API أو نسيان إعادة البناء بعد تغيير المتغير.",
        },
        {
          type: "h3",
          text: "أ) إنشاء Setup Node.js App من cPanel",
        },
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "افتح الأداة",
              where: "cPanel → Software → Setup Node.js App",
              body: "اضغط Create Application. إذا الأداة غير ظاهرة، اطلب من الاستضافة تفعيل Node.js Selector / Setup Node.js App.",
            },
            {
              n: 2,
              title: "اختر إصدار Node",
              body: "يفضّل إصدار حديث مستقر تدعمه الاستضافة (مثل 20 LTS أو 22 إن وُجد). تجنّب إصدارات قديمة جداً لأن المشروع على Next 16.",
            },
            {
              n: 3,
              title: "Application root",
              body: "مسار مجلد الواجهة بعد استنساخ Git، مثال: <code>repositories/ghazatna/gazatna-frontend</code>.",
            },
            {
              n: 4,
              title: "Application URL",
              body: "غالباً الدومين الرئيسي للمدرسة: <code>gzs.edu.ps</code> (أو www). هذا عنوان الزوار للموقع العام ولوحات الدخول.",
            },
            {
              n: 5,
              title: "Application startup file / أمر التشغيل",
              body: "حسب ما تعرضه اللوحة. لمشروع Next المعتاد بعد البناء هو تشغيل <code>next start</code> عبر سكربت package.json، أي الأمر العملي: <code>npm run start</code>. إن طلبت اللوحة ملفاً مثل <code>server.js</code> أو خانة Application mode = Production فاختر Production.",
            },
            {
              n: 6,
              title: "أنشئ التطبيق وانسخ أمر تفعيل البيئة",
              body: "بعد Create، cPanel يعرض غالباً سطر <code>source .../bin/activate</code> خاص ببيئة Node. انسخه للتيرمنال كما نسخت أمر بايثون في الباكند.",
            },
          ],
        },
        {
          type: "h3",
          text: "ب) متغيرات البيئة للواجهة",
        },
        {
          type: "p",
          text: "من Setup Node.js App → Edit → Environment variables (أو ملف <code>.env.production</code> داخل gazatna-frontend على السيرفر — بشرط ألا يُرفع لـ GitHub إن احتوى أسراراً؛ رابط الـ API هنا عام نسبياً).",
        },
        {
          type: "table",
          headers: ["المتغير", "مثال", "ملاحظات"],
          rows: [
            [
              "NEXT_PUBLIC_API_URL",
              "https://api.gzs.edu.ps/api",
              "يجب أن ينتهي بـ /api ويطابق عنوان Python App الفعلي",
            ],
            [
              "NODE_ENV",
              "production",
              "غالباً تضبطه لوحة Node تلقائياً في وضع الإنتاج",
            ],
            [
              "PORT",
              "(المنفذ الذي تعرضه اللوحة)",
              "لا تجبر 3001 إلا إذا طلبت الاستضافة ذلك صراحة",
            ],
          ],
        },
        {
          type: "warn",
          text: "أي تغيير على NEXT_PUBLIC_API_URL بعد البناء لا يكفي لوحده. لازم تعيد npm run build ثم Restart لأن القيم NEXT_PUBLIC_* تُدمَج وقت البناء.",
        },
        {
          type: "h3",
          text: "ج) أوامر التيرمنال للفرونت اند (بالترتيب)",
        },
        {
          type: "h4",
          text: "1) تفعيل بيئة Node والدخول للمجلد",
        },
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\"># الصق أمر source الخاص بـ Setup Node.js App، مثال:\nsource /home/USERNAME/nodevenv/repositories/ghazatna/gazatna-frontend/20/bin/activate\n\ncd ~/repositories/ghazatna/gazatna-frontend\n\nnode -v\nnpm -v</pre>",
        },
        {
          type: "h4",
          text: "2) التأكد من متغير الـ API قبل البناء",
        },
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\"># إن أضفت المتغير من لوحة Node، تحقق:\necho $NEXT_PUBLIC_API_URL\n\n# أو أنشئ/عدّل ملف بيئة للإنتاج داخل مجلد الفرونت:\ncat &gt; .env.production &lt;&lt;'EOF'\nNEXT_PUBLIC_API_URL=https://api.gzs.edu.ps/api\nEOF\n\n# مهم: استبدل الرابط بعنوان الـ API الحقيقي عندك</pre>",
        },
        {
          type: "h4",
          text: "3) تثبيت حزم Node",
        },
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\"># الأفضل عند وجود package-lock.json:\nnpm ci\n\n# وإن فشل ci لأي سبب:\nnpm install</pre><p>انتظر حتى ينتهي بدون أخطاء حمراء. أول تثبيت قد يأخذ وقتاً أطول على السيرفر.</p>",
        },
        {
          type: "info",
          text: "ملاحظة استضافة Linux: المشروع قد يحتوي حزمة SWC خاصة بويندوز على جهاز التطوير. على السيرفر لينكس يعتمد Next على الحزم المناسبة للمنصة أثناء npm install. إن ظهر خطأ متعلق بـ @next/swc-win32 أخبر المطوّر لنقل الحزمة إلى optional/dev أو إزالتها من الإنتاج.",
        },
        {
          type: "h4",
          text: "4) بناء الواجهة للإنتاج",
        },
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\">npm run build</pre><p>عند النجاح ستُنشأ مخرجات الإنتاج (مثل مجلد <code>.next</code>). إذا فشل البناء اقرأ آخر أسطر الخطأ؛ أشهر الأسباب: نسخة Node قديمة، ذاكرة السيرفر منخفضة، أو متغيرات بيئة ناقصة.</p>",
        },
        {
          type: "h4",
          text: "5) تشغيل الواجهة",
        },
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\"># من التيرمنال للتجربة السريعة (أحياناً تتوقف عند إغلاق الجلسة):\nnpm run start\n\n# الأفضل للإنتاج: اضبط Startup في Setup Node.js App على:\n# npm run start\n# ثم من اللوحة اضغط Run / Restart ولا تعتمد على جلسة التيرمنال المفتوحة</pre>",
        },
        {
          type: "p",
          text: "سكربت start في المشروع هو next start (بدون إجبار منفذ 3001 على السيرفر). المنفذ يحدده عادة Setup Node.js App عبر متغير PORT أو إعداد التطبيق.",
        },
        {
          type: "h4",
          text: "6) إعادة التشغيل بعد كل بناء",
        },
        {
          type: "ol",
          items: [
            "Setup Node.js App → اختر التطبيق → Restart / Stop ثم Start.",
            "افتح الدومين الرئيسي في المتصفح واختبر الصفحة الرئيسية وتسجيل الدخول.",
            "من أدوات المطوّر في المتصفح (Network): طلبات /api يجب أن ترجع 200 أو 401 منطقية وليس فشلاً في الاتصال.",
          ],
        },
        {
          type: "h3",
          text: "د) ربط الفرونت بالباكند — ماذا يتحقق؟",
        },
        {
          type: "ul",
          items: [
            "<code>NEXT_PUBLIC_API_URL</code> يشير لنفس مضيف Python App مع لاحقة <code>/api</code>.",
            "في بايثون: <code>CORS_ALLOWED_ORIGINS</code> يتضمن رابط الواجهة بـ https بدون شرطة زائدة في النهاية غالباً (مثال: https://gzs.edu.ps).",
            "شهادة SSL مفعّلة لكلا الدومين (الواجهة و الـ API إن كان subdomain منفصل).",
            "بعد تغيير أي طرف: Restart للطرف المعدّل + إعادة build للفرونت إن تغيّر متغير NEXT_PUBLIC_*.",
          ],
        },
        {
          type: "h3",
          text: "هـ) أعطال فرونت شائعة وحلولها من التيرمنال",
        },
        {
          type: "table",
          headers: ["العَرَض", "ماذا تفعل"],
          rows: [
            ["صفحة بيضاء / 503 من Node", "Restart من Setup Node.js App ثم أعد <code>npm run build</code>"],
            ["تسجيل الدخول لا يعمل / Network error", "تحقق <code>echo $NEXT_PUBLIC_API_URL</code> وأعد البناء، وافتح رابط الـ API مباشرة"],
            ["CORS في المتصفح", "عدّل CORS_ALLOWED_ORIGINS في بايثون + Restart بايثون"],
            ["npm ci فشل", "جرّب <code>npm install</code> أو احذف node_modules ثم install من جديد"],
            ["build ينهار للذاكرة", "اطلب من الاستضافة زيادة memory limit أو نفّذ البناء بوقت أقل ازدحاماً"],
            ["الصور/الملفات لا تظهر", "تأكد أن rewrite لـ /media يعمل وأن MEDIA على الباكند متاح عبر نفس أصل الـ API"],
          ],
        },
        {
          type: "h3",
          text: "و) أوامر فرونت سريعة للنسخ",
        },
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\">source /home/USERNAME/nodevenv/.../bin/activate\ncd ~/repositories/ghazatna/gazatna-frontend\n\n# ضبط API (عدّل الرابط)\nprintf 'NEXT_PUBLIC_API_URL=https://api.gzs.edu.ps/api\\n' &gt; .env.production\n\nnpm ci\nnpm run build\n\n# بعدها Restart من Setup Node.js App\n# أو للتجربة:\nnpm run start</pre>",
        },
      ],
    },
    {
      id: "ssl",
      title: "سابعاً: الدومين و SSL",
      blocks: [
        {
          type: "ol",
          items: [
            "cPanel → Domains: تأكد أن gzs.edu.ps (و www) مضافان.",
            "cPanel → Security → SSL/TLS Status أو Let's Encrypt: فعّل AutoSSL للدومين وللـ API subdomain.",
            "حدّث CORS_ALLOWED_ORIGINS ليطابق روابط https النهائية ثم Restart لبايثون.",
          ],
        },
      ],
    },
    {
      id: "updates",
      title: "ثامناً: روتين التحديث اليومي (مع التيرمنال)",
      blocks: [
        {
          type: "info",
          html: "<pre style=\"direction:ltr;text-align:left;background:#1a1a1a;color:#e8e8e8;padding:12px;border-radius:8px;overflow:auto;font-size:0.85rem\">cd ~/repositories/ghazatna\ngit pull origin main\n\n# ===== Backend =====\nsource /home/USERNAME/virtualenv/.../bin/activate\ncd gazatna-backend\npip install -r requirements.txt\npython manage.py migrate\npython manage.py collectstatic --noinput\nmkdir -p tmp &amp;&amp; touch tmp/restart.txt\n# أو Restart من Setup Python App\n\n# ===== Frontend =====\nsource /home/USERNAME/nodevenv/.../bin/activate\ncd ../gazatna-frontend\n# إن تغيّر رابط الـ API: عدّل .env.production أولاً\nnpm ci\nnpm run build\n# ثم Restart إلزامي من Setup Node.js App</pre>",
        },
        {
          type: "warn",
          text: "تحديث الفرونت لا يكتمل بـ git pull وحده: لازم npm ci (أو install) + npm run build + Restart من لوحة Node في كل مرة يتغير كود الواجهة أو متغير NEXT_PUBLIC_*.",
        },
      ],
    },
    {
      id: "checklist",
      title: "تاسعاً: قائمة تحقق + أعطال شائعة",
      blocks: [
        {
          type: "ol",
          items: [
            "رابط الـ API لا يعطي 500 بعد Restart.",
            "الدومين الرئيسي يفتح الواجهة.",
            "تسجيل الدخول يعمل بحساب createsuperuser أو الحساب التجريبي.",
            "رفع صورة/ملف يعمل (مجلد media وصلاحياته).",
            "بعد كل git pull: migrate إن لزم + Restart.",
          ],
        },
        {
          type: "table",
          headers: ["العَرَض", "ماذا تجرب في التيرمنال / اللوحة"],
          rows: [
            ["OperationalError / DB", "تحقق DB_* ثم <code>python manage.py check</code> و dbshell"],
            ["MariaDB version error", "تأكد أن Django في النطاق 4.1.x وليس 4.2+"],
            ["ModuleNotFoundError", "فعّل الـ virtualenv ثم <code>pip install -r requirements.txt</code>"],
            ["Static files 404", "<code>collectstatic --noinput</code> ومسار STATIC_ROOT"],
            ["CORS من الواجهة", "CORS_ALLOWED_ORIGINS + https الصحيح"],
            ["الواجهة لا تصل للـ API", "NEXT_PUBLIC_API_URL ثم أعد <code>npm run build</code>"],
          ],
        },
      ],
    },
    {
      id: "cheat",
      title: "عاشراً: ورقة أوامر سريعة (Cheat sheet)",
      blocks: [
        {
          type: "table",
          headers: ["المهمة", "الأمر"],
          rows: [
            ["تفعيل بيئة بايثون", "<code>source …/virtualenv/…/bin/activate</code>"],
            ["تثبيت حزم بايثون", "<code>pip install -r requirements.txt</code>"],
            ["ترحيل الجداول", "<code>python manage.py migrate</code>"],
            ["ملفات static", "<code>python manage.py collectstatic --noinput</code>"],
            ["مشرف جديد", "<code>python manage.py createsuperuser</code>"],
            ["فحص الإعدادات", "<code>python manage.py check</code>"],
            ["تحديث الكود", "<code>git pull origin main</code>"],
            ["تفعيل بيئة Node", "<code>source …/nodevenv/…/bin/activate</code>"],
            ["تثبيت حزم الفرونت", "<code>npm ci</code> أو <code>npm install</code>"],
            ["بناء الواجهة", "<code>npm run build</code>"],
            ["تشغيل الواجهة", "<code>npm run start</code> + Restart من لوحة Node"],
            ["ملف بيئة الفرونت", "<code>.env.production</code> فيه NEXT_PUBLIC_API_URL"],
          ],
        },
        {
          type: "table",
          headers: ["البند", "القيمة في مشروع غَزتنا"],
          rows: [
            ["Python", "3.11.10"],
            ["Django", "4.1.x (MariaDB 10.3)"],
            ["Settings", "config.settings"],
            ["إنتاج", "DJANGO_ENV=production"],
            ["Startup", "passenger_wsgi.py"],
            ["Requirements", "gazatna-backend/requirements.txt"],
          ],
        },
        {
          type: "p",
          text: "بهذا الترتيب: قاعدة بيانات → Git → Python App → Environment → أوامر التيرمنال (pip/migrate/collectstatic) → Node → SSL، يكون الموقع جاهزاً على cPanel مع الاستفادة الكاملة من التيرمنال.",
        },
      ],
    },
  ],
};
