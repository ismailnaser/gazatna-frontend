/** رفع غَزتنا من الصفر على cPanel — فرونت gzs.edu.ps + باكند /backend + تيرمنال */
export default {
  filename: "دليل-رفع-من-الصفر-فرونت-ودومين-باكند-backend.pdf",
  title: "دليل الرفع من الصفر على cPanel",
  subtitle:
    "منصة غَزتنا بعد حذف كل شيء: الواجهة على gzs.edu.ps والباكند على gzs.edu.ps/backend — مع التيرمنال وبناء الفرونت من الجهاز (ZIP) أو من السيرفر",
  sections: [
    {
      id: "overview",
      title: "اقرأ هذا أولًا — الهدف النهائي",
      blocks: [
        {
          type: "p",
          text: "هذا الدليل مخصص لحالتك الآن: حذفت الفرونت والباكند من cPanel وتريد إعادة كل شيء من الصفر. الهدف بعد الانتهاء:",
        },
        {
          type: "table",
          headers: ["العنصر", "العنوان النهائي"],
          rows: [
            ["الواجهة (Next.js)", "https://gzs.edu.ps"],
            ["الباكند (Django / Passenger)", "https://gzs.edu.ps/backend/"],
            ["لوحة أدمن Django", "https://gzs.edu.ps/backend/admin/"],
            ["الـ API للمتصفح", "https://gzs.edu.ps/backend/api/..."],
            ["NEXT_PUBLIC_API_URL", "/backend/api"],
          ],
        },
        {
          type: "info",
          text: "الزائر يفتح دومينًا واحدًا. الـ API يكون تحت نفس الدومين عبر المسار /backend/api. لا نستخدم سب دومين django.… في هذا الدليل.",
        },
        {
          type: "warn",
          text: "مهم جدًا من تجارب سابقة على نفس الاستضافة: تطبيق Node على جذر gzs.edu.ps قد يبتلع المسارات. لذلك ننشئ ونختبر الباكند على /backend أولًا (وNode متوقف)، ثم نشغّل الفرونت ونختبر /backend مرة ثانية.",
        },
        {
          type: "h3",
          text: "ما تحتاجه جاهزًا",
        },
        {
          type: "ul",
          items: [
            "دخول cPanel لحساب الدومين <code>gzs.edu.ps</code>.",
            "تيرمنال داخل cPanel (Terminal) أو SSH.",
            "مستودع GitHub فيه <code>gazatna-backend</code> و <code>gazatna-frontend</code>.",
            "بايثون <strong>3.11.x فقط</strong> (لا تستخدم 3.12 أو 3.13 — mysqlclient يفشل).",
            "MariaDB/MySQL من cPanel (المشروع مضبوط على Django 4.1 بسبب MariaDB 10.3).",
            "جهاز ويندوز لبناء الفرونت محليًا إذا فشل البناء على السيرفر (Aborted / ذاكرة).",
          ],
        },
        {
          type: "h3",
          text: "الترتيب المختصر (احفظه)",
        },
        {
          type: "ol",
          items: [
            "قاعدة بيانات MySQL.",
            "استنساخ الكود (Git).",
            "Setup Python App على <code>gzs.edu.ps/backend</code> + متغيرات البيئة.",
            "تيرمنال: pip + migrate + collectstatic + اختبار /backend و /backend/admin.",
            "Setup Node.js App على <code>gzs.edu.ps</code>.",
            "بناء الفرونت (محلي ZIP مفضّل، أو على السيرفر إن نجح).",
            "ضبط <code>NEXT_PUBLIC_API_URL=/backend/api</code> وإعادة البناء إن لزم.",
            "SSL + اختبار تسجيل الدخول.",
          ],
        },
      ],
    },
    {
      id: "architecture",
      title: "كيف تشتغل الاستضافة؟ (افهم قبل التنفيذ)",
      blocks: [
        {
          type: "p",
          text: "على VPS مثل DigitalOcean غالبًا Nginx يقسّم المسارات. على cPanel عندك أداتان منفصلتان:",
        },
        {
          type: "ul",
          items: [
            "<strong>Setup Node.js App:</strong> يقدّم Next على جذر الدومين <code>gzs.edu.ps</code>.",
            "<strong>Setup Python App (Passenger):</strong> يقدّم Django على المسار <code>/backend</code> عبر ملف <code>public_html/backend/.htaccess</code> الذي يشير إلى مجلد المشروع وملف <code>passenger_wsgi.py</code>.",
          ],
        },
        {
          type: "h3",
          text: "سلسلة طلب الباكند (المفروض)",
        },
        {
          type: "ol",
          items: [
            "المتصفح يطلب <code>https://gzs.edu.ps/backend/admin/</code>.",
            "LiteSpeed يقرأ <code>public_html/backend/.htaccess</code>.",
            "Passenger يفتح <code>passenger_wsgi.py</code> من مجلد الباكند ببايثون الـ virtualenv.",
            "الملف يعرّف كائنًا اسمه <code>application</code> ويحمّل Django.",
            "Django يرد بصفحة الأدمن أو الـ API.",
          ],
        },
        {
          type: "warn",
          text: "إذا ظهر 404 من LiteSpeed على /backend بدون ملف index.html، وملف PASSENGER_HIT.txt لا يُنشأ، فالسيرفر لا يشغّل Passenger أصلًا — هذا عطل استضافة وليس عطل كود Django. وقتها افتح تذكرة دعم قبل إكمال الفرونت.",
        },
        {
          type: "info",
          text: "Document Root للدومين عادة <code>public_html</code>. كود Django الحقيقي يبقى في <code>my_project/gazatna-backend</code>. مجلد <code>public_html/backend</code> بوابة (.htaccess) وليس نسخة كاملة من المشروع.",
        },
      ],
    },
    {
      id: "paths",
      title: "مسارات وأسماء ثابتة في هذا الدليل",
      blocks: [
        {
          type: "table",
          headers: ["البند", "القيمة المعتمدة"],
          rows: [
            ["مستخدم cPanel (مثال)", "gzsedu"],
            ["مجلد المشروع", "~/my_project"],
            ["الباكند", "~/my_project/gazatna-backend"],
            ["الفرونت", "~/my_project/gazatna-frontend"],
            ["venv بايثون", "~/virtualenv/my_project/gazatna-backend/3.11"],
            ["بوابة الويب للباكند", "~/public_html/backend/.htaccess"],
            ["Startup Python", "passenger_wsgi.py"],
            ["Startup Node", "server.js"],
          ],
        },
        {
          type: "p",
          text: "إذا كان اسم مستخدمك مختلفًا، استبدل gzsedu ومسارات /home/... بما يظهر عندك بعد source من لوحة Python.",
        },
      ],
    },
    {
      id: "mysql",
      title: "أولًا: قاعدة البيانات",
      blocks: [
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "أنشئ قاعدة ومستخدمًا",
              where: "cPanel → Databases → MySQL® Databases أو Database Wizard",
              body: "أنشئ Database + User بكلمة مرور قوية، ثم أضف المستخدم للقاعدة بـ ALL PRIVILEGES.",
            },
            {
              n: 2,
              title: "احفظ القيم كاملة (مع بادئة الحساب)",
              list: [
                "<code>DB_NAME</code>",
                "<code>DB_USER</code>",
                "<code>DB_PASSWORD</code>",
                "<code>DB_HOST</code> = عادة <code>localhost</code>",
              ],
            },
          ],
        },
        {
          type: "warn",
          text: "لا ترفع كلمات المرور إلى GitHub. ضعها فقط في Environment variables داخل Setup Python App.",
        },
      ],
    },
    {
      id: "git",
      title: "ثانيًا: رفع الكود (Git)",
      blocks: [
        {
          type: "h3",
          text: "الطريقة المفضّلة — من التيرمنال",
        },
        {
          type: "code",
          text: `mkdir -p ~/my_project
cd ~/my_project

# استنساخ المستودع (عدّل الرابط إن لزم)
git clone https://github.com/YOUR_ORG/ghazatna.git .

# أو إذا المستودع يحتوي المجلدين مباشرة:
# git clone ... gazatna && mv gazatna/* . 

ls -la
# يجب أن ترى: gazatna-backend و gazatna-frontend`,
        },
        {
          type: "h3",
          text: "بديل — Git Version Control من الواجهة",
        },
        {
          type: "ol",
          items: [
            "cPanel → Files → Git™ Version Control → Create → Clone.",
            "الصق رابط المستودع والفرع <code>main</code>.",
            "مسار الاستنساخ مثل: <code>my_project</code>.",
            "تأكد من وجود المجلدين <code>gazatna-backend</code> و <code>gazatna-frontend</code>.",
          ],
        },
        {
          type: "code",
          text: `ls -la ~/my_project/gazatna-backend/manage.py
ls -la ~/my_project/gazatna-backend/passenger_wsgi.py
ls -la ~/my_project/gazatna-frontend/server.js
ls -la ~/my_project/gazatna-frontend/package.json`,
        },
      ],
    },
    {
      id: "python-app",
      title: "ثالثًا: إنشاء Setup Python App على /backend",
      blocks: [
        {
          type: "warn",
          text: "قبل إنشاء Python App: إذا كان عندك Setup Node.js App على gzs.edu.ps شغّال، أوقفه مؤقتًا (STOP APP) حتى لا يبتلع /backend أثناء الاختبار.",
        },
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "افتح Setup Python App",
              where: "cPanel → Software → Setup Python App → Create Application",
            },
            {
              n: 2,
              title: "اضبط الحقول كالتالي",
              list: [
                "<strong>Python version:</strong> 3.11.x فقط (مثال 3.11.10 أو 3.11.15)",
                "<strong>Application root:</strong> <code>my_project/gazatna-backend</code>",
                "<strong>Application URL:</strong> الدومين <code>gzs.edu.ps</code> والمسار <code>backend</code> → يصير https://gzs.edu.ps/backend/",
                "<strong>Application startup file:</strong> <code>passenger_wsgi.py</code>",
                "<strong>Application Entry point:</strong> <code>application</code>",
              ],
            },
            {
              n: 3,
              title: "Save ثم انسخ أمر source",
              body: "بعد الحفظ تظهر جملة مثل: source /home/USER/virtualenv/my_project/gazatna-backend/3.11/bin/activate — انسخها للتيرمنال.",
            },
          ],
        },
        {
          type: "h3",
          text: "متغيرات البيئة (Environment variables)",
        },
        {
          type: "p",
          text: "أضفها من صفحة تعديل تطبيق Python ثم Save:",
        },
        {
          type: "code",
          text: `DJANGO_ENV=production
FORCE_SCRIPT_NAME=/backend
SECRET_KEY=ضع_مفتاحاً_طويلاً_عشوائياً
DB_NAME=اسم_القاعدة_الكامل
DB_USER=اسم_المستخدم_الكامل
DB_PASSWORD=كلمة_المرور
DB_HOST=localhost
DB_PORT=3306
ALLOWED_HOSTS=gzs.edu.ps,www.gzs.edu.ps,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://gzs.edu.ps,https://www.gzs.edu.ps
CSRF_TRUSTED_ORIGINS=https://gzs.edu.ps,https://www.gzs.edu.ps`,
        },
        {
          type: "info",
          text: "FORCE_SCRIPT_NAME=/backend ضروري لأن Django مركّب تحت مسار فرعي. بدونه روابط الأدمن والـ static قد تخرج بدون /backend.",
        },
        {
          type: "h3",
          text: "توليد SECRET_KEY من جهازك (PowerShell)",
        },
        {
          type: "code",
          text: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`,
        },
        {
          type: "p",
          text: "أو من أي بايثون:",
        },
        {
          type: "code",
          text: `python -c "import secrets; print(secrets.token_urlsafe(50))"`,
        },
      ],
    },
    {
      id: "terminal-backend",
      title: "رابعًا: تيرمنال الباكند — تثبيت وتشغيل",
      blocks: [
        {
          type: "code",
          text: `# الصق أمر source من لوحة Python، مثال:
source /home/gzsedu/virtualenv/my_project/gazatna-backend/3.11/bin/activate
cd /home/gzsedu/my_project/gazatna-backend

python --version
# المتوقع: Python 3.11.x — إذا طلع 3.13 قف وأعد إنشاء التطبيق على 3.11

pip install -U pip
pip install -r requirements.txt
pip show Django mysqlclient

export DJANGO_ENV=production
# إن لم تُحقن متغيرات اللوحة في الجلسة، صدّرها يدويًا هنا أيضًا

python manage.py check
python manage.py migrate
python manage.py collectstatic --noinput

mkdir -p tmp logs cache media
touch tmp/restart.txt`,
        },
        {
          type: "warn",
          text: "إذا فشل mysqlclient مع pkg-config وأنت على 3.13: هذا متوقع. ارجع لـ Python 3.11. على 3.11 كان التثبيت ينجح سابقًا على نفس الحساب.",
        },
        {
          type: "h3",
          text: "ملف التشغيل passenger_wsgi.py",
        },
        {
          type: "p",
          text: "بعد إنشاء التطبيق قد تستبدل اللوحة الملف بنسخة قصيرة. تأكد أن عندك النسخة الحقيقية لـ Django:",
        },
        {
          type: "code",
          text: `cd ~/my_project/gazatna-backend
ls -la passenger_wsgi.py passenger_wsgi_django.py

# إن وُجد passenger_wsgi_django.py:
cp passenger_wsgi_django.py passenger_wsgi.py
touch tmp/restart.txt

# أو من اللوحة: Restart لتطبيق Python`,
        },
        {
          type: "info",
          text: "passenger_wsgi.py يجب أن يعرّف كائن application ويحمّل Django (عبر get_wsgi_application). هو باب دخول Passenger وليس بديلًا عن config/wsgi.py فقط — على cPanel الغلاف ضروري غالبًا لضبط المسارات والـ venv.",
        },
      ],
    },
    {
      id: "test-backend",
      title: "خامسًا: اختبار الباكند قبل الفرونت (حرج)",
      blocks: [
        {
          type: "p",
          text: "لا ترفع الفرونت قبل أن تتأكد أن الباكند يرد من المتصفح. Node يجب أن يكون متوقفًا في هذه المرحلة.",
        },
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "تحقق من بوابة .htaccess",
              body: "من التيرمنال:",
            },
          ],
        },
        {
          type: "code",
          text: `ls -la ~/public_html/backend/
sed -n '1,40p' ~/public_html/backend/.htaccess`,
        },
        {
          type: "p",
          text: "المفترض ترى شيئًا مثل:",
        },
        {
          type: "code",
          text: `PassengerAppRoot "/home/USER/my_project/gazatna-backend"
PassengerBaseURI "/backend"
PassengerPython "/home/USER/virtualenv/my_project/gazatna-backend/3.11/bin/python"
PassengerEnabled On`,
        },
        {
          type: "steps",
          items: [
            {
              n: 2,
              title: "افتح من المتصفح",
              list: [
                "<code>https://gzs.edu.ps/backend/</code> — يفترض استجابة Django/API أو صفحة التطبيق وليس 404 LiteSpeed",
                "<code>https://gzs.edu.ps/backend/admin/</code> — صفحة تسجيل دخول أدمن Django",
              ],
            },
            {
              n: 3,
              title: "اختبار سريع إن Passenger لا يعمل",
              body: "ضع ملفًا ثابتًا ثم احذفه:",
            },
          ],
        },
        {
          type: "code",
          text: `echo 'STATIC BACKEND OK' > ~/public_html/backend/index.html
# افتح /backend/ — إذا ظهرت الجملة فالمجلد يوصل
rm -f ~/public_html/backend/index.html
# افتح /backend/ مرة أخرى — يجب أن يرد Passenger/Django وليس 404`,
        },
        {
          type: "warn",
          text: "إذا الثابت يفتح وبدون index.html تحصل على 404 LiteSpeed: الاستضافة لا تشغّل Passenger على /backend. أوقف هنا وافتح تذكرة دعم قبل بناء الفرونت. رسالة الدعم جاهزة في قسم لاحق من هذا الدليل.",
        },
        {
          type: "h3",
          text: "إنشاء مستخدم أدمن (اختياري)",
        },
        {
          type: "code",
          text: `source ~/virtualenv/my_project/gazatna-backend/3.11/bin/activate
cd ~/my_project/gazatna-backend
export DJANGO_ENV=production
python manage.py createsuperuser`,
        },
      ],
    },
    {
      id: "nodejs-app",
      title: "سادسًا: إنشاء Setup Node.js App للفرونت",
      blocks: [
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "أنشئ التطبيق",
              where: "cPanel → Software → Setup Node.js App → Create Application",
              list: [
                "<strong>Node.js version:</strong> 20.x إن وُجد (أو أحدث LTS متاح)",
                "<strong>Application mode:</strong> Production",
                "<strong>Application root:</strong> <code>my_project/gazatna-frontend</code>",
                "<strong>Application URL:</strong> <code>gzs.edu.ps</code> والمسار فارغ (الجذر)",
                "<strong>Application startup file:</strong> <code>server.js</code> (ليس npm start)",
              ],
            },
            {
              n: 2,
              title: "متغيرات بيئة Node",
              list: [
                "<code>NEXT_PUBLIC_API_URL=/backend/api</code>",
                "اختياري للـ SSR إن احتجت بروكسي: <code>BACKEND_URL=https://gzs.edu.ps/backend</code>",
              ],
            },
            {
              n: 3,
              title: "لا تضغط Build على السيرفر أولًا",
              body: "على حسابات ضعيفة الذاكرة npm run build يُجهض (Aborted). اتبع قسم البناء المحلي أدناه، أو جرّب البناء على السيرفر كخيار ثانٍ.",
            },
          ],
        },
        {
          type: "warn",
          text: "بعد تشغيل Node، أعد اختبار https://gzs.edu.ps/backend/admin/ فورًا. إذا اختفى الأدمن وصار 404 Next، فـ Node يبتلع /backend وتحتاج دعم الاستضافة لاستثناء المسار.",
        },
      ],
    },
    {
      id: "build-local",
      title: "سابعًا أ — بناء الفرونت من جهازك ثم ZIP (المفضّل)",
      blocks: [
        {
          type: "p",
          text: "لأن البناء على السيرفر غالبًا يفشل بسبب الذاكرة، ابنِ على ويندوز ثم ارفع حزمة إنتاج صغيرة.",
        },
        {
          type: "h3",
          text: "1) على جهازك (PowerShell)",
        },
        {
          type: "code",
          text: `cd I:\\ghazatna\\gazatna-frontend

# مهم: القيمة تُخبز داخل البناء
$env:NEXT_PUBLIC_API_URL = "/backend/api"

npm ci
# أو: npm install

npm run pack:cpanel
# ينتج ملفًا مثل: cpanel-frontend-build-YYYYMMDD-HHMMSS.zip`,
        },
        {
          type: "info",
          text: "سكربت pack:cpanel يجهّز بناء إنتاج ويستثني كاش .next/dev الثقيل. حجم الـ ZIP الطبيعي عشرات الميغا وليس مئات أو آلاف.",
        },
        {
          type: "h3",
          text: "2) ارفع إلى السيرفر",
        },
        {
          type: "ol",
          items: [
            "cPanel → File Manager → <code>my_project/gazatna-frontend</code>.",
            "ارفع الـ ZIP ثم Extract فوق المجلد (أو استخدم FTP إن رفضantivirus الـ ZIP).",
            "تأكد من وجود <code>.next/BUILD_ID</code> و <code>server.js</code>.",
          ],
        },
        {
          type: "warn",
          text: "بعض لوحات cPanel ترفض ZIP فيه ملفات JS (Foxhole). الحل: ارفع عبر FTP/SFTP بدون ضغط، أو اطلب استثناء من الدعم.",
        },
        {
          type: "h3",
          text: "3) تثبيت حزم الإنتاج على السيرفر",
        },
        {
          type: "code",
          text: `# من لوحة Node انسخ أمر تفعيل بيئة Node ثم:
cd ~/my_project/gazatna-frontend

npm install --omit=dev
# لا تشغّل npm run build هنا إذا كنت رفعت بناء جاهز

ls -la server.js .next/BUILD_ID`,
        },
        {
          type: "steps",
          items: [
            {
              n: 4,
              title: "Restart لتطبيق Node",
              where: "Setup Node.js App → اختر التطبيق → Restart",
            },
          ],
        },
      ],
    },
    {
      id: "build-server",
      title: "سابعًا ب — بناء الفرونت من السيرفر (اختياري)",
      blocks: [
        {
          type: "warn",
          text: "جرّب هذا فقط إذا فشل الرفع المحلي أو أردت البناء على السيرفر. إن ظهر Aborted توقف فورًا وارجع للطريقة أ.",
        },
        {
          type: "code",
          text: `# فعّل بيئة Node من أمر اللوحة ثم:
cd ~/my_project/gazatna-frontend

printf 'NEXT_PUBLIC_API_URL=/backend/api\\n' > .env.production

npm ci
# أو npm install

NODE_OPTIONS='--max-old-space-size=512' npm run build

ls -la .next/BUILD_ID
# ثم Restart من Setup Node.js App`,
        },
        {
          type: "info",
          text: "تقليل الذاكرة عبر NODE_OPTIONS قد يساعد أحيانًا لكنه لا يضمن النجاح على استضافة مشتركة ضعيفة.",
        },
      ],
    },
    {
      id: "link-test",
      title: "ثامنًا: الربط والاختبار النهائي",
      blocks: [
        {
          type: "h3",
          text: "قيم يجب أن تتطابق",
        },
        {
          type: "table",
          headers: ["المكان", "القيمة"],
          rows: [
            ["Python → FORCE_SCRIPT_NAME", "/backend"],
            ["Python → CORS / CSRF", "https://gzs.edu.ps و www إن لزم"],
            ["Node Env → NEXT_PUBLIC_API_URL", "/backend/api"],
            ["بناء الفرونت وقت pack/build", "نفس /backend/api"],
            ["اختبار API", "https://gzs.edu.ps/backend/api/"],
            ["اختبار أدمن", "https://gzs.edu.ps/backend/admin/"],
            ["اختبار الواجهة", "https://gzs.edu.ps"],
          ],
        },
        {
          type: "steps",
          items: [
            {
              n: 1,
              title: "افتح الواجهة",
              body: "https://gzs.edu.ps — يجب أن تظهر صفحات Next وليس خطأ Node.",
            },
            {
              n: 2,
              title: "افتح أدوات المطوّر → Network أثناء تسجيل الدخول",
              body: "طلبات الـ API يجب أن تذهب إلى /backend/api/... على نفس المضيف وترجع 200 أو 401 منطقية وليس Failed to fetch.",
            },
            {
              n: 3,
              title: "أعد اختبار الأدمن",
              body: "https://gzs.edu.ps/backend/admin/ ما زال يفتح بعد تشغيل Node.",
            },
          ],
        },
        {
          type: "warn",
          text: "إذا غيّرت NEXT_PUBLIC_API_URL بعد بناء قديم، يجب إعادة pack:cpanel ورفع .next من جديد. وضع المتغير في لوحة Node وحده لا يغيّر بناءًا قديمًا.",
        },
      ],
    },
    {
      id: "ssl",
      title: "تاسعًا: SSL",
      blocks: [
        {
          type: "ol",
          items: [
            "cPanel → Security → SSL/TLS Status أو Let's Encrypt / AutoSSL.",
            "فعّل الشهادة لـ <code>gzs.edu.ps</code> و <code>www.gzs.edu.ps</code>.",
            "بما أن الباكند تحت نفس الدومين (/backend) لا تحتاج شهادة منفصلة لسب دومين.",
            "بعد تفعيل https تأكد أن CORS و CSRF يستخدمان https وليس http.",
          ],
        },
      ],
    },
    {
      id: "updates",
      title: "عاشرًا: روتين التحديث لاحقًا",
      blocks: [
        {
          type: "code",
          text: `cd ~/my_project
git pull origin main

# ===== Backend =====
source ~/virtualenv/my_project/gazatna-backend/3.11/bin/activate
cd ~/my_project/gazatna-backend
pip install -r requirements.txt
export DJANGO_ENV=production
python manage.py migrate
python manage.py collectstatic --noinput
touch tmp/restart.txt
# أو Restart من Setup Python App

# ===== Frontend =====
# على جهازك:
#   $env:NEXT_PUBLIC_API_URL = "/backend/api"
#   npm run pack:cpanel
# ثم ارفع ZIP واستخرج فوق gazatna-frontend
# ثم من السيرفر:
cd ~/my_project/gazatna-frontend
npm install --omit=dev
# Restart من Setup Node.js App`,
        },
      ],
    },
    {
      id: "troubleshoot",
      title: "أعطال شائعة وحلولها",
      blocks: [
        {
          type: "table",
          headers: ["العَرَض", "السبب المحتمل", "الحل"],
          rows: [
            [
              "DNS NXDOMAIN لسب دومين",
              "سجل A غير منشور",
              "هذا الدليل لا يعتمد سب دومين؛ استخدم /backend أو تذكرة DNS",
            ],
            [
              "/backend يعرض STATIC فقط أو 404 بدون index",
              "Passenger لا يعمل",
              "تذكرة دعم؛ لا تكمل الفرونت",
            ],
            [
              "/backend/admin صار 404 Next بعد Start Node",
              "Node يبتلع كل المسارات",
              "STOP Node واختبر؛ اطلب من الدعم استثناء /backend",
            ],
            [
              "pip mysqlclient يفشل",
              "Python 3.13 أو نقص مكتبات",
              "استخدم Python 3.11 فقط",
            ],
            [
              "npm run build → Aborted",
              "نفاد ذاكرة السيرفر",
              "ابنِ محليًا بـ pack:cpanel",
            ],
            [
              "تسجيل الدخول Failed to fetch",
              "بناء بـ API غلط أو باكند واقف",
              "أعد pack بـ /backend/api وتأكد /backend/api يفتح",
            ],
            [
              "حلقة 500 على /api",
              "بروكسي Next لنفسه",
              "لا تستخدم NEXT_PUBLIC_API_URL=https://gzs.edu.ps/api بدون باكند منفصل؛ هنا المسار الصحيح /backend/api",
            ],
            [
              "django.log فارغ والصفحة 404",
              "الطلب لا يصل لـ Django",
              "مشكلة توجيه ويب/Passenger وليس منطق Django",
            ],
          ],
        },
      ],
    },
    {
      id: "support-ticket",
      title: "نص تذكرة للدعم إن فشل Passenger على /backend",
      blocks: [
        {
          type: "p",
          text: "انسخ هذا النص إن ثبت أن المجلد /backend يخدم ملفات ثابتة لكن Python لا يعمل:",
        },
        {
          type: "code",
          text: `الموضوع: المسار /backend يفتح ملفات ثابتة لكن تطبيق Python/Passenger لا يعمل (404 من LiteSpeed)

السلام عليكم،
نحتاج تفعيل تشغيل تطبيق Python على https://gzs.edu.ps/backend/

الإعداد:
- Node.js App على جذر gzs.edu.ps (نوقفه أثناء الاختبار)
- Python App: URL = gzs.edu.ps/backend ، الجذر = my_project/gazatna-backend ، Python 3.11 ، startup = passenger_wsgi.py
- public_html/backend/.htaccess يحتوي PassengerAppRoot و PassengerBaseURI=/backend و PassengerPython و PassengerEnabled On

الإثبات:
1) وضع index.html في public_html/backend يظهر في المتصفح — المسار يصل للمجلد.
2) حذف index.html يعطي 404 من LiteSpeed.
3) ملف تشخيص passenger_wsgi يفترض إنشاء PASSENGER_HIT.txt ولا يُنشأ — أي أن Passenger لا ينفّذ التطبيق.

المطلوب:
أ) تفعيل Passenger/LSAPI على /backend مع الإبقاء على Node لباقي الدومين، أو
ب) رابط مؤقت لتطبيق Python، أو
ج) نشر DNS لسب دومين بديل إن لزم.

الحساب على cPanel / السيرفر الحالي.
شكرًا.`,
        },
      ],
    },
    {
      id: "checklist",
      title: "قائمة تحقق نهائية",
      blocks: [
        {
          type: "ul",
          items: [
            "Python 3.11 و pip install نجح و mysqlclient ظاهر.",
            "FORCE_SCRIPT_NAME=/backend في بيئة Python.",
            "https://gzs.edu.ps/backend/admin/ يفتح قبل وبعد تشغيل Node.",
            "Node startup = server.js و Application URL = gzs.edu.ps.",
            "البناء تم بـ NEXT_PUBLIC_API_URL=/backend/api.",
            "تسجيل الدخول من الواجهة يعمل و Network يظهر /backend/api.",
            "SSL https مفعّل و CORS/CSRF على https.",
          ],
        },
        {
          type: "info",
          text: "إذا نجحت قائمة التحقق فأنت انتهيت من الرفع من الصفر على نفس الدومين مع الباكند تحت /backend.",
        },
      ],
    },
  ],
};
