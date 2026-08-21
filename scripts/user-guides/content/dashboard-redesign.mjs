/** @type {import('../lib/pdf-builder.mjs').Manual} */
export default {
  filename: "تعديلات-واجهة-الداشبورد.pdf",
  title: "تقرير تعديلات واجهة الداشبورد",
  subtitle: "لوحة الإدارة — 20 آب 2026",
  sections: [
    {
      id: "summary",
      title: "ملخص التغيير",
      intro:
        "أُعيد ترتيب لوحة الإدارة: الشاشات أخف، والتنقّل بين الأقسام أوضح، والقائمة الجانبية مقسومة حسب المجال.",
      blocks: [
        {
          type: "ul",
          items: [
            "شكل الصفحة موحّد: خلفية فاتحة، بطاقات بيضاء، وعنوان مع مسار الرجوع.",
            "الأقسام الثقيلة انفصلت لمسارات خاصة بدل تجميعها في تبويبات أو نوافذ فوق نفس الشاشة.",
            "الجداول والخيارات المتعددة صارت أقرب لشكل لوحات الإدارة المعتادة.",
            "البيانات المحمَّلة تُحفظ مؤقتًا، فلا تُعاد نفس الطلبات عند الرجوع للصفحة.",
          ],
        },
        {
          type: "info",
          text: "التعديل على الواجهة الأمامية. مسارات الـ API في الخادم لم تتغير.",
        },
      ],
    },
    {
      id: "design",
      title: "الشكل العام",
      blocks: [
        {
          type: "p",
          text: "أُضيف تخطيط مشترك لصفحات اللوحة حتى لا يختلف شكل كل قسم عن الثاني.",
        },
        {
          type: "h3",
          text: "مكوّنات أُضيفت",
        },
        {
          type: "table",
          headers: ["الاسم", "الملف", "الاستخدام"],
          rows: [
            ["WorkspacePage", "components/dashboard/WorkspacePage.tsx", "عنوان الصفحة ومسار الرجوع ومنطقة المحتوى"],
            ["HubCard / HubGrid", "components/dashboard/HubCard.tsx", "شبكة بطاقات للانتقال بين الأقسام"],
            ["Checkbox", "components/atoms/Checkbox.tsx", "مربع اختيار بعلامة صح وحالة تحديد جزئي"],
            ["SearchField", "components/molecules/SearchField.tsx", "حقل بحث بتصميم موحّد"],
            ["EmptyState", "components/molecules/EmptyState.tsx", "عرض الصفحة الفارغة"],
          ],
        },
        {
          type: "h3",
          text: "مكوّنات عُدّلت",
        },
        {
          type: "ul",
          items: [
            "<strong>DashboardShell:</strong> خلفية رمادية فاتحة تفصل المحتوى عن الإطار.",
            "<strong>DashboardHeader:</strong> شريط علوي ثابت.",
            "<strong>DashboardSidebar:</strong> القائمة مجمَّعة تحت عناوين: نظرة عامة، الأشخاص، الدراسة، التشغيل.",
            "<strong>PageHeader:</strong> يدعم مسار الرجوع وأزرار بجانب العنوان.",
            "<strong>Card:</strong> بطاقة بيضاء بحدود أوضح.",
            "<strong>DataTable:</strong> رأس جدول أوضح وترقيم صفحات أسفله.",
          ],
        },
        {
          type: "h3",
          text: "ترتيب القائمة الجانبية",
        },
        {
          type: "table",
          headers: ["المجموعة", "الأقسام"],
          rows: [
            ["نظرة عامة", "الرئيسية · التحليلات · التنبيهات"],
            ["الأشخاص", "الطلاب · طلبات التسجيل · الكادر · المستخدمون"],
            ["الدراسة", "المراحل · السنوات والفصول · السياسات · الجداول · المواد · تقسيمة العلامات"],
            ["التشغيل", "المالية · المحتوى · رسائل التواصل · إعدادات الموقع"],
          ],
        },
      ],
    },
    {
      id: "routes",
      title: "المسارات الجديدة",
      intro: "كل مهمة إدارية صارت في صفحة مستقلة. الروابط القديمة ذات التبويب (?tab= و ?type=) تُحوَّل للمسار الجديد.",
      blocks: [
        {
          type: "h3",
          text: "الرئيسية",
        },
        {
          type: "p",
          text: "الرسوم البيانية نُقلت بالكامل إلى التحليلات. الرئيسية تعرض اختصارات للأقسام الظاهرة حسب صلاحية الحساب، مع اسم السنة والفصل الحاليين.",
        },
        {
          type: "h3",
          text: "المالية",
        },
        {
          type: "table",
          headers: ["المسار", "المحتوى"],
          rows: [
            ["/admin/finance", "اختيار القسم"],
            ["/admin/finance/payments", "إشعارات الدفع واعتمادها أو رفضها"],
            ["/admin/finance/manual", "تسجيل دفعة يدوية وسجل الدفعات"],
            ["/admin/finance/plans", "خطط الرسوم"],
            ["/admin/finance/plans/create", "إنشاء خطة"],
            ["/admin/finance/plans/[id]/edit", "تعديل خطة"],
            ["/admin/finance/access", "فتح وصول مؤقت لطالب"],
          ],
        },
        {
          type: "h3",
          text: "المراحل الدراسية",
        },
        {
          type: "table",
          headers: ["المسار", "المحتوى"],
          rows: [
            ["/admin/classes", "قائمة المراحل مع إمكانية إعادة الترتيب بالسحب"],
            ["/admin/classes/new", "إضافة مرحلة وتحديد عدد الشعب"],
            ["/admin/classes/[gradeId]", "شعب المرحلة وتعديل عددها أو حذف المرحلة"],
            ["/admin/classes/[gradeId]/sections/[classId]", "طلاب الشعبة وتعيين مربي الصف"],
          ],
        },
        {
          type: "h3",
          text: "المواد",
        },
        {
          type: "ul",
          items: [
            "<strong>/admin/subjects</strong> — قائمة المواد مع البحث.",
            "<strong>/admin/subjects/[id]</strong> — صفحة المادة: الإسناد والتعديل والحذف.",
            "<strong>/admin/subjects/[id]/classes</strong> — ربط المادة بالشعب.",
            "<strong>/admin/subjects/[id]/teachers</strong> — تعيين معلم لكل شعبة.",
            "صفحات الإنشاء والتعديل بقيت: /create و /[id]/edit.",
          ],
        },
        {
          type: "h3",
          text: "إعدادات الموقع",
        },
        {
          type: "ul",
          items: [
            "/admin/site — قائمة الأقسام",
            "/admin/site/hero — الصفحة الرئيسية",
            "/admin/site/about — من نحن",
            "/admin/site/contact — التواصل والفوتر",
            "/admin/site/registration — فورم التسجيل",
            "/admin/site/programs — البرامج التعليمية",
          ],
        },
        {
          type: "h3",
          text: "التنبيهات",
        },
        {
          type: "ul",
          items: [
            "/admin/notifications — اختيار نوع التنبيه",
            "/admin/notifications/fees — الطلاب المحجوبون بسبب الرسوم",
            "/admin/notifications/inactive — الحسابات غير النشطة",
          ],
        },
        {
          type: "h3",
          text: "طلبات التسجيل",
        },
        {
          type: "ul",
          items: [
            "/admin/admissions — الجدول مع فلتر الحالة والبحث.",
            "/admin/admissions/[id] — الطلب كاملًا: الاعتماد، اختيار الشعبة، الحذف أو التراجع، وملف الطالب إن وُجد.",
          ],
        },
      ],
    },
    {
      id: "tables-forms",
      title: "الجداول والنماذج",
      blocks: [
        {
          type: "ul",
          items: [
            "رأس الجدول بلون محايد، والصف يتغيّر عند المرور عليه.",
            "ترقيم الصفحات أسفل الجدول يعرض المدى الحالي من المجموع.",
            "طلبات التسجيل تُفتح من اسم الطالب بدل توسيع الصف داخل الجدول.",
            "المواد تُفتح من البطاقة بدل تجميع إجراءات الإسناد داخل نفس البطاقة.",
          ],
        },
        {
          type: "h3",
          text: "مربعات الاختيار",
        },
        {
          type: "p",
          text: "مربع الاختيار موحّد في الإسناد والفلاتر: علامة صح، وتحديد جزئي عند اختيار بعض العناصر فقط. يُستخدم في إسناد المواد للفصول، تعيين المعلمين، اختيار مواد المعلم، والقوائم المتعددة، وحقول فورم التسجيل.",
        },
      ],
    },
    {
      id: "cache",
      title: "التحميل والكاش",
      blocks: [
        {
          type: "ul",
          items: [
            "كل صفحة تحمّل بياناتها عند فتحها. الرجوع إليها خلال دقائق يعرض النتيجة المحفوظة دون انتظار ظاهر.",
            "الطلب المكرر لنفس المسار أثناء التحميل لا يُرسل مرتين.",
            "الخادم الأمامي يبقي طلب الشبكة متسلسلًا حتى لا تتراكم الطلبات على الاستضافة.",
            "كتالوج المدرسة (المراحل والفصول والمعلمون) يُحمَّل فقط في الصفحات التي تحتاجه، ولا يُعاد مع كل تنقّل.",
          ],
        },
        {
          type: "h3",
          text: "أمثلة",
        },
        {
          type: "ul",
          items: [
            "قائمة المراحل لا تحمّل المعلمين. صفحة الشعبة تحمّلهم لتعيين مربي الصف.",
            "جدول الطلبات لا يحمّل الفصول. صفحة الاعتماد تحمّلها لاختيار الشعبة.",
            "أقسام الموقع تشترك في نفس الإعدادات المحفوظة بعد أول فتح.",
            "إنشاء خطة رسوم أو تعديلها يحمّل المراحل لأنها جزء من النموذج.",
          ],
        },
        {
          type: "h3",
          text: "مسح الكاش",
        },
        {
          type: "ul",
          items: [
            "أي حفظ أو حذف يمسح كاش ذلك القسم.",
            "اعتماد طلب يحدّث كاش الطلبات والطلاب والتحليلات.",
            "تفعيل طالب أو فتح وصول يحدّث كاش التنبيهات.",
            "تعديل مرحلة يحدّث كاش المراحل والفصول.",
            "تسجيل الخروج يمسح الكاش بالكامل.",
          ],
        },
      ],
    },
    {
      id: "files",
      title: "الملفات",
      blocks: [
        {
          type: "h3",
          text: "أُضيفت",
        },
        {
          type: "ul",
          items: [
            "src/components/atoms/Checkbox.tsx",
            "src/components/dashboard/WorkspacePage.tsx",
            "src/components/dashboard/HubCard.tsx",
            "src/components/molecules/SearchField.tsx",
            "src/components/molecules/EmptyState.tsx",
            "src/hooks/useAdminSiteSettings.ts",
            "src/lib/adminSiteSettings.ts",
            "src/lib/adminNotifications.ts",
            "src/lib/adminAdmissions.ts",
          ],
        },
        {
          type: "h3",
          text: "صفحات أُضيفت",
        },
        {
          type: "ul",
          items: [
            "المالية: payments، manual، plans، access",
            "المراحل: new، [gradeId]، [gradeId]/sections/[classId]",
            "الموقع: hero، about، contact، registration، programs",
            "التنبيهات: fees، inactive",
            "المواد: [id]، [id]/classes، [id]/teachers",
            "طلبات التسجيل: [id]",
          ],
        },
        {
          type: "h3",
          text: "عُدّلت",
        },
        {
          type: "ul",
          items: [
            "DashboardShell، DashboardHeader، DashboardSidebar",
            "PageHeader، Card، DataTable، MultiSelect",
            "adminRoles.ts، navigation.ts، pageFetchPriority.ts",
            "api.ts، SchoolContext.tsx",
            "SubjectClassAssigner، SubjectSectionTeacherAssigner، TeacherSubjectPicker",
            "AdminSubjectsGrid، AdminAdmissionsTable",
            "صفحات الإدارة: الرئيسية، المالية، المراحل، المواد، الموقع، التنبيهات، الطلبات",
          ],
        },
      ],
    },
    {
      id: "scope",
      title: "خارج هذا التعديل",
      blocks: [
        {
          type: "ul",
          items: [
            "مسارات الخادم وصلاحيات الأدوار الجزئية كما كانت؛ الصفحات الفرعية تتبع صلاحية القسم الأب.",
            "لوحتا المعلم وولي الأمر أخذتا الإطار العام (الخلفية والهيدر) دون إعادة تقسيم صفحاتهما.",
            "مساحة السنوات الدراسية بقيت على تخطيطها الحالي: قائمة سنوات وتفاصيل بجانبها.",
          ],
        },
      ],
    },
  ],
};
