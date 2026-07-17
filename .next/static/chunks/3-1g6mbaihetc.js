(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,88017,e=>{"use strict";var t=e.i(43476),a=e.i(75157);e.s(["PageHeader",0,function({title:e,description:i,className:l}){return(0,t.jsxs)("div",{className:(0,a.cn)("mb-8",l),children:[(0,t.jsx)("h1",{className:"text-2xl font-bold text-p-green sm:text-3xl",children:e}),(0,t.jsx)("div",{className:"mt-2 h-1 w-16 rounded-full bg-p-red"}),i&&(0,t.jsx)("p",{className:"mt-3 text-p-black/60",children:i})]})}])},71267,e=>{"use strict";var t=e.i(43476),a=e.i(75157);let i={default:"bg-neutral-100 text-neutral-600",success:"bg-p-green/10 text-p-green",warning:"bg-amber-50 text-amber-700",danger:"bg-p-red/10 text-p-red",info:"bg-p-green/10 text-p-green"};e.s(["Badge",0,function({children:e,variant:l="default",className:r}){return(0,t.jsx)("span",{className:(0,a.cn)("inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold",i[l],r),children:e})}])},76358,e=>{"use strict";function t(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function a(){let e=await fetch(`${window.location.origin}/images/logo.png`);if(!e.ok)throw Error("failed to load school logo");let t=await e.blob();return new Promise((e,a)=>{let i=new FileReader;i.onload=()=>e(String(i.result)),i.onerror=()=>a(Error("failed to read school logo")),i.readAsDataURL(t)})}async function i(e){let t=Array.from(e.querySelectorAll("img"));await Promise.all(t.map(e=>new Promise(t=>{e.complete&&e.naturalWidth>0?t():(e.addEventListener("load",()=>t(),{once:!0}),e.addEventListener("error",()=>t(),{once:!0}))})))}async function l(t,a){let[{default:l},{jsPDF:r}]=await Promise.all([e.A(48503),e.A(34162)]);document.body.appendChild(t);try{await i(t),await new Promise(e=>setTimeout(e,120));let e=await l(t,{scale:2,useCORS:!0,backgroundColor:"#ffffff",logging:!1,scrollX:0,scrollY:0,windowWidth:t.scrollWidth,windowHeight:t.scrollHeight});if(0===e.width||0===e.height)throw Error("empty canvas");let s=e.toDataURL("image/jpeg",.95),n=new r({unit:"mm",format:"a4",orientation:"portrait"}),o=n.internal.pageSize.getWidth(),d=n.internal.pageSize.getHeight(),c=o-20,p=e.height*c/e.width,x=p,f=10;for(n.addImage(s,"JPEG",10,f,c,p),x-=d-20;x>0;)n.addPage(),f=10-(p-x),n.addImage(s,"JPEG",10,f,c,p),x-=d-20;n.save(a)}finally{t.remove()}}e.s(["buildPdfBrandedFooterHtml",0,function(e="مدرسة غَزتنا"){return`
    <footer style="margin-top:24px;padding-top:12px;border-top:1px solid #d4d4d4;font-size:10px;color:#888;text-align:center;">
      وثيقة صادرة إلكترونياً من منصة ${t(e)}
    </footer>
  `},"buildPdfBrandedHeaderHtml",0,function(e){let{logoDataUrl:a,title:i,schoolName:l,lines:r=[]}=e,s=l?`<p style="margin:0 0 4px;font-size:12px;color:#666;">${t(l)}</p>`:"",n=r.filter(Boolean).map(e=>`<p style="margin:4px 0 0;font-size:12px;color:#666;line-height:1.5;">${t(e)}</p>`).join("");return`
    <header style="display:flex;align-items:center;gap:20px;border-bottom:2px solid #424cf3;padding-bottom:16px;margin-bottom:18px;">
      <img
        src="${a}"
        alt="شعار المدرسة"
        style="height:76px;width:auto;max-width:340px;object-fit:contain;display:block;flex-shrink:0;"
      />
      <div style="flex:1;min-width:0;text-align:right;">
        ${s}
        <h1 style="margin:0;font-size:22px;font-weight:700;color:#111111;line-height:1.35;">${t(i)}</h1>
        ${n}
      </div>
    </header>
  `},"escapeHtml",0,t,"exportHTMLElementToPdf",0,l,"formatExportDate",0,function(){let e=new Date,t=e=>String(e).padStart(2,"0");return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}`},"loadSchoolLogoDataUrl",0,a,"mountPdfElement",0,function(e){let t=document.createElement("div");t.innerHTML=e;let a=t.firstElementChild;if(!(a instanceof HTMLElement))throw Error("failed to build pdf element");return a.style.position="fixed",a.style.left="0",a.style.top="0",a.style.zIndex="2147483647",a.style.background="#ffffff",a.style.padding="24px",a.style.boxSizing="border-box",a}])},72489,7179,25249,e=>{"use strict";var t=e.i(76358);async function a({certificate:e,config:i,schoolName:l="مدرسة غَزتنا",honorsTitle:r}){let s=r?.trim()||i.honorsTitle,n=await (0,t.loadSchoolLogoDataUrl)(),o=(0,t.formatExportDate)(),d=null!=e.averagePercent?`${e.averagePercent.toFixed(2)}%`:"—";return`
    <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#ffffff;color:#111111;width:746px;">
      <div style="border:3px double #b45309;border-radius:16px;padding:22px 24px 20px;background:#fffbeb;">
        <div style="border:1px solid rgba(180,83,9,0.35);border-radius:12px;padding:22px 20px 18px;background:#fffdf5;">

          <table style="width:100%;border-collapse:collapse;margin-bottom:18px;border-bottom:2px solid #d97706;padding-bottom:16px;">
            <tr>
              <td style="width:140px;vertical-align:middle;padding-left:12px;">
                <img
                  src="${n}"
                  alt="شعار المدرسة"
                  style="height:72px;width:auto;max-width:130px;object-fit:contain;display:block;"
                />
              </td>
              <td style="vertical-align:middle;text-align:right;">
                <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#92400e;line-height:1.5;">${(0,t.escapeHtml)(l)}</p>
                <p style="margin:0;font-size:12px;color:#78350f;line-height:1.6;">${(0,t.escapeHtml)(e.periodLabel)}</p>
              </td>
            </tr>
          </table>

          <div style="margin:0 auto 14px;max-width:420px;padding:12px 20px;background:#b45309;border-radius:10px;text-align:center;">
            <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;line-height:1.45;letter-spacing:0;">
              ${(0,t.escapeHtml)(s)}
            </h1>
          </div>

          <p style="margin:0 auto 20px;max-width:520px;font-size:14px;line-height:1.7;color:#78350f;text-align:center;">
            تُمنح هذه الشهادة تقديراً للتميز الأكاديمي
          </p>

          <div style="margin:0 auto 20px;max-width:520px;padding:18px 20px;border-radius:12px;background:#ffffff;border:1px solid rgba(180,83,9,0.25);text-align:center;">
            <p style="margin:0 0 8px;font-size:13px;color:#78350f;line-height:1.6;">يُشهد بأن الطالب/ة</p>
            <p style="margin:0 0 14px;font-size:26px;font-weight:800;color:#451a03;line-height:1.35;">${(0,t.escapeHtml)(e.studentName)}</p>
            <table style="width:100%;border-collapse:collapse;margin:0 auto;max-width:320px;">
              <tr>
                <td style="padding:4px 8px;font-size:12px;color:#92400e;text-align:right;">الصف</td>
                <td style="padding:4px 8px;font-size:13px;font-weight:700;color:#451a03;text-align:left;">${(0,t.escapeHtml)(e.gradeLevel||"—")}</td>
              </tr>
              <tr>
                <td style="padding:4px 8px;font-size:12px;color:#92400e;text-align:right;">الشعبة</td>
                <td style="padding:4px 8px;font-size:13px;font-weight:700;color:#451a03;text-align:left;">${(0,t.escapeHtml)(e.section||"—")}</td>
              </tr>
              <tr>
                <td style="padding:4px 8px;font-size:12px;color:#92400e;text-align:right;">رقم الطالب</td>
                <td style="padding:4px 8px;font-size:13px;font-weight:700;color:#451a03;text-align:left;direction:ltr;">${(0,t.escapeHtml)(e.studentNumber||"—")}</td>
              </tr>
            </table>
          </div>

          <table style="margin:0 auto 20px;border-collapse:collapse;border:2px solid #b45309;border-radius:10px;overflow:hidden;">
            <tr>
              <td style="padding:12px 24px;background:#fef3c7;font-size:14px;font-weight:700;color:#92400e;text-align:center;white-space:nowrap;">
                المعدل العام
              </td>
              <td style="padding:12px 28px;background:#b45309;font-size:26px;font-weight:800;color:#ffffff;text-align:center;direction:ltr;white-space:nowrap;">
                ${d}
              </td>
            </tr>
          </table>

          <p style="margin:0 auto 16px;max-width:560px;font-size:13px;line-height:1.95;color:#78350f;text-align:center;">
            ${(0,t.escapeHtml)(i.honorsMessage)}
          </p>

          <p style="margin:0 0 22px;font-size:11px;color:#92400e;text-align:center;line-height:1.6;">
            الحد الأدنى لشهادة التقدير: ${i.honorsMinAverage}%
          </p>

          <table style="width:100%;max-width:460px;margin:0 auto;border-collapse:collapse;">
            <tr>
              <td style="width:50%;border-top:2px solid rgba(180,83,9,0.45);padding-top:10px;text-align:center;vertical-align:top;">
                <p style="margin:0;font-size:11px;color:#78350f;line-height:1.5;">مدير/ة المدرسة</p>
              </td>
              <td style="width:50%;border-top:2px solid rgba(180,83,9,0.45);padding-top:10px;text-align:center;vertical-align:top;">
                <p style="margin:0;font-size:11px;color:#78350f;line-height:1.5;">تاريخ الإصدار: ${o}</p>
              </td>
            </tr>
          </table>

        </div>
      </div>

      ${(0,t.buildPdfBrandedFooterHtml)(l)}
    </div>
  `}async function i({certificate:e,config:a,schoolName:l="مدرسة غَزتنا"}){let r=await (0,t.loadSchoolLogoDataUrl)(),s=(0,t.formatExportDate)(),n="border:1px solid #d4d4d4;background:#f8fafc;padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#111;",o="border:1px solid #e5e7eb;padding:10px 12px;font-size:12px;color:#111;vertical-align:middle;text-align:right;",d=e.subjects.map(e=>{var a,i,l;let r=null==e.percent?"color:#888;font-weight:600;":e.percent>=50?"color:#16a34a;font-weight:700;":"color:#ea6622;font-weight:700;";return`<tr>
        <td style="${o}font-weight:600;">${(0,t.escapeHtml)(e.subject)}</td>
        <td style="${o}">${a=e.score,i=e.maxScore,null==a||null==i?"—":`${a}/${i}`}</td>
        <td style="${o}${r}">${null==(l=e.percent)?"—":`${l.toFixed(2)}%`}</td>
      </tr>`}).join(""),c=null!=e.averagePercent?`<table style="width:100%;margin-top:18px;border-collapse:collapse;border:1px solid #dbeafe;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:16px 18px;background:#f8fafc;vertical-align:middle;">
              <p style="margin:0;font-size:12px;color:#475569;">المعدل العام من 100%</p>
              <p style="margin:4px 0 0;font-size:11px;color:#64748b;">${e.gradedSubjectsCount} من ${e.assignedSubjectsCount} مادة</p>
            </td>
            <td style="padding:16px 18px;background:#eef2ff;text-align:center;vertical-align:middle;width:140px;">
              <p style="margin:0;font-size:28px;font-weight:800;color:#424cf3;direction:ltr;">${e.averagePercent.toFixed(2)}%</p>
            </td>
          </tr>
        </table>`:'<p style="margin-top:16px;text-align:center;color:#666;font-size:13px;">لا توجد علامات كافية لحساب المعدل.</p>';return`
    <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#ffffff;color:#111111;width:746px;">
      <div style="padding:22px 24px 20px;background:#ffffff;">
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;border-bottom:1px solid #e5e7eb;padding-bottom:16px;">
          <tr>
            <td style="width:140px;vertical-align:middle;padding-left:12px;">
              <img
                src="${r}"
                alt="شعار المدرسة"
                style="height:76px;width:auto;max-width:130px;object-fit:contain;display:block;"
              />
            </td>
            <td style="vertical-align:middle;text-align:right;">
              <p style="margin:0 0 4px;font-size:12px;color:#666;">${(0,t.escapeHtml)(l)}</p>
              <h1 style="margin:0;font-size:24px;font-weight:800;color:#111111;line-height:1.35;">${(0,t.escapeHtml)(a.certificateTitle)}</h1>
              <p style="margin:6px 0 0;font-size:12px;color:#666;line-height:1.5;">${(0,t.escapeHtml)(e.periodLabel)}</p>
              <p style="margin:4px 0 0;font-size:12px;color:#666;line-height:1.5;">تاريخ الإصدار: ${s}</p>
            </td>
          </tr>
        </table>

        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;border:1px solid #ececec;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="padding:14px;background:#fffdf8;width:50%;vertical-align:top;">
              <span style="font-size:11px;color:#666;">اسم الطالب</span>
              <p style="margin:2px 0 0;font-size:15px;font-weight:700;">${(0,t.escapeHtml)(e.studentName)}</p>
            </td>
            <td style="padding:14px;background:#fffdf8;width:50%;vertical-align:top;">
              <span style="font-size:11px;color:#666;">رقم الطالب</span>
              <p style="margin:2px 0 0;font-size:15px;font-weight:700;direction:ltr;text-align:right;">${(0,t.escapeHtml)(e.studentNumber||"—")}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px;background:#ffffff;width:50%;vertical-align:top;">
              <span style="font-size:11px;color:#666;">الصف</span>
              <p style="margin:2px 0 0;font-size:15px;font-weight:700;">${(0,t.escapeHtml)(e.gradeLevel||"—")}</p>
            </td>
            <td style="padding:14px;background:#ffffff;width:50%;vertical-align:top;">
              <span style="font-size:11px;color:#666;">الشعبة</span>
              <p style="margin:2px 0 0;font-size:15px;font-weight:700;">${(0,t.escapeHtml)(e.section||"—")}</p>
            </td>
          </tr>
        </table>

        <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
          <thead>
            <tr>
              <th style="${n}">المادة</th>
              <th style="${n}">العلامة</th>
              <th style="${n}">النسبة من 100%</th>
            </tr>
          </thead>
          <tbody>
            ${d||`<tr><td colspan="3" style="${o}text-align:center;color:#666;">لا توجد مواد مسندة.</td></tr>`}
          </tbody>
        </table>

        ${c}

        <table style="width:100%;margin-top:28px;border-collapse:collapse;">
          <tr>
            <td style="width:50%;border-top:1px solid #cbd5e1;padding-top:8px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#64748b;">توقيع الإدارة</p>
            </td>
            <td style="width:50%;border-top:1px solid #cbd5e1;padding-top:8px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#64748b;">ختم المدرسة</p>
            </td>
          </tr>
        </table>
      </div>

      ${(0,t.buildPdfBrandedFooterHtml)(l)}
    </div>
  `}async function l(e){return(0,t.mountPdfElement)(await a(e))}async function r(e){let a=await l(e),i=e.certificate.studentName.replace(/[\\/:*?"<>|]/g,"-").trim()||"طالب";await (0,t.exportHTMLElementToPdf)(a,`شهادة_تقدير_${i}_${(0,t.formatExportDate)()}.pdf`)}async function s(e){return(0,t.mountPdfElement)(await i(e))}async function n(e){let a=await s(e),i=e.certificate.studentName.replace(/[\\/:*?"<>|]/g,"-").trim()||"طالب";await (0,t.exportHTMLElementToPdf)(a,`شهادة_علامات_${i}_${(0,t.formatExportDate)()}.pdf`)}e.s(["buildHonorsCertificateHtml",0,a,"buildStudentCertificateHtml",0,i],7179),e.s(["exportHonorsCertificatePdf",0,r],72489),e.s(["exportStudentCertificatePdf",0,n],25249)},80102,e=>{"use strict";var t=e.i(43476),a=e.i(71645),i=e.i(47402),l=e.i(71267),r=e.i(66226),s=e.i(12412),n=e.i(72489),o=e.i(25249),d=e.i(75157);let c=(0,e.i(56420).default)("award",[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]]);var p=e.i(62368),x=e.i(91783);function f(e){return null==e?"—":`${e.toFixed(2)}%`}function g({title:e,certificate:x,config:m,honorsTitle:h,schoolName:b,visibleUntil:u,archiveAfterGrace:y}){let w=h?.trim()||m.honorsTitle,[v,j]=(0,a.useState)(""),[$,N]=(0,a.useState)(!1),[k,z]=(0,a.useState)(!1);async function P(){j(""),N(!0);try{await (0,o.exportStudentCertificatePdf)({certificate:x,config:m,schoolName:b})}catch{j("تعذر تحميل شهادة العلامات.")}finally{N(!1)}}async function H(){if(x.qualifiesHonors){j(""),z(!0);try{await (0,n.exportHonorsCertificatePdf)({certificate:x,config:m,schoolName:b,honorsTitle:w})}catch{j("تعذر تحميل شهادة التقدير.")}finally{z(!1)}}}return(0,t.jsxs)("div",{className:"space-y-4",children:[v?(0,t.jsx)(i.Alert,{variant:"error",children:v}):null,(0,t.jsxs)(s.Card,{className:"overflow-hidden border-p-green/20 p-0",children:[(0,t.jsx)("div",{className:"border-b border-neutral-100 bg-p-green/5 px-4 py-4",children:(0,t.jsxs)("div",{className:"flex flex-wrap items-start justify-between gap-3",children:[(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"flex flex-wrap items-center gap-2",children:[(0,t.jsx)("h2",{className:"text-lg font-bold text-p-black",children:e}),(0,t.jsx)(l.Badge,{variant:"success",children:"منشورة"})]}),(0,t.jsx)("p",{className:"mt-1 text-sm text-p-black/55",children:x.periodLabel}),y&&u?(0,t.jsxs)("p",{className:"mt-1 text-xs text-brand-blue",children:["تبقى في قسم الشهادات حتى ",u," ثم تنتقل إلى أرشيف الشهادات"]}):null]}),(0,t.jsxs)(r.Button,{onClick:P,disabled:$,children:[(0,t.jsx)(p.Download,{className:"h-4 w-4"}),$?"جاري التحميل...":"تحميل الشهادة"]})]})}),(0,t.jsxs)("div",{className:"grid gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"text-xs text-p-black/50",children:"اسم الطالب"}),(0,t.jsx)("p",{className:"font-semibold text-p-black",children:x.studentName})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"text-xs text-p-black/50",children:"الصف"}),(0,t.jsxs)("p",{className:"font-semibold text-p-black",children:[x.gradeLevel," ",x.section]})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"text-xs text-p-black/50",children:"المعدل من 100%"}),(0,t.jsx)("p",{className:"text-xl font-bold text-p-green",children:f(x.averagePercent)})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"text-xs text-p-black/50",children:"المواد المحتسبة"}),(0,t.jsxs)("p",{className:"font-semibold text-p-black",children:[x.gradedSubjectsCount,"/",x.assignedSubjectsCount]})]})]}),(0,t.jsx)("div",{className:"overflow-x-auto border-t border-neutral-100",children:(0,t.jsxs)("table",{className:"w-full min-w-[520px] text-sm",children:[(0,t.jsx)("thead",{children:(0,t.jsxs)("tr",{className:"border-b border-neutral-100 bg-p-cream/60 text-p-black/60",children:[(0,t.jsx)("th",{className:"px-4 py-2.5 text-start font-semibold",children:"المادة"}),(0,t.jsx)("th",{className:"px-4 py-2.5 text-start font-semibold",children:"العلامة"}),(0,t.jsx)("th",{className:"px-4 py-2.5 text-start font-semibold",children:"النسبة من 100%"})]})}),(0,t.jsx)("tbody",{children:x.subjects.map(a=>(0,t.jsxs)("tr",{className:"border-b border-neutral-50",children:[(0,t.jsx)("td",{className:"px-4 py-2.5 font-medium text-p-black",children:a.subject}),(0,t.jsx)("td",{className:"px-4 py-2.5 text-p-black/70",children:null==a.score||null==a.maxScore?"—":`${a.score}/${a.maxScore}`}),(0,t.jsx)("td",{className:(0,d.cn)("px-4 py-2.5 font-semibold",null==a.percent?"text-p-black/45":a.percent>=50?"text-p-green":"text-p-red"),children:f(a.percent)})]},`${e}-${a.subject}`))})]})})]}),m.honorsEnabled&&x.qualifiesHonors?(0,t.jsx)(s.Card,{className:"overflow-hidden border-amber-300/60 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-0",children:(0,t.jsxs)("div",{className:"flex flex-wrap items-start justify-between gap-3 px-4 py-4",children:[(0,t.jsxs)("div",{className:"flex items-start gap-3",children:[(0,t.jsx)("div",{className:"rounded-full bg-amber-200/70 p-2.5",children:(0,t.jsx)(c,{className:"h-6 w-6 text-amber-700"})}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"text-lg font-bold text-amber-950",children:w}),(0,t.jsxs)("p",{className:"mt-1 text-sm text-amber-900/70",children:["مبروك! معدلك ",f(x.averagePercent)," يؤهّلك لـ",w," (الحد الأدنى ",m.honorsMinAverage,"%)."]}),(0,t.jsx)("p",{className:"mt-2 max-w-2xl text-sm leading-relaxed text-amber-900/80",children:m.honorsMessage})]})]}),(0,t.jsxs)(r.Button,{onClick:H,disabled:k,className:"bg-amber-600 hover:bg-amber-700",children:[(0,t.jsx)(p.Download,{className:"h-4 w-4"}),k?"جاري التحميل...":"تحميل شهادة التقدير"]})]})}):m.honorsEnabled?(0,t.jsxs)(i.Alert,{variant:"info",children:["شهادة التقدير لهذا المعدل متاحة للطلاب الذين يحققون معدلاً لا يقل عن ",m.honorsMinAverage,"%."]}):null]})}e.s(["ParentCertificatesPanel",0,function({data:e,schoolName:a,emptyTitle:i="لم تصدر الإدارة الشهادات بعد.",emptyDescription:l="ستظهر الشهادة هنا بعد أن تقرر الإدارة إصدارها ونشرها."}){let r=e?.config,n=e?e.certificates.length>0?e.certificates:e.certificate&&e.config?[{scope:e.config.issuanceScope,scopeLabel:e.config.certificateTitle,certificate:e.certificate}]:[]:[];return e?.published&&r&&0!==n.length?(0,t.jsx)("div",{className:"space-y-6",children:n.map(e=>(0,t.jsx)(g,{title:e.scopeLabel||e.config?.certificateTitle||r.certificateTitle,certificate:e.certificate,config:e.config??r,honorsTitle:e.honorsTitle,schoolName:a,visibleUntil:e.visibleUntil,archiveAfterGrace:e.archiveAfterGrace},`${e.academicYearId??"year"}-${e.scope}`))}):(0,t.jsxs)(s.Card,{className:"flex flex-col items-center gap-3 py-12 text-center",children:[(0,t.jsx)(x.Medal,{className:"h-10 w-10 text-p-black/25"}),(0,t.jsx)("p",{className:"text-neutral-600",children:e?.message||i}),(0,t.jsx)("p",{className:"text-sm text-p-black/45",children:l})]})}],80102)},52287,e=>{"use strict";var t=e.i(43476),a=e.i(71645),i=e.i(47402),l=e.i(88017),r=e.i(80102),s=e.i(9165),n=e.i(38411),o=e.i(8351),d=e.i(6537);e.s(["default",0,function(){let[e,c]=(0,a.useState)(null),[p,x]=(0,a.useState)("مدرسة غَزتنا"),[f,g]=(0,a.useState)(!0),[m,h]=(0,a.useState)(!1),[b,u]=(0,a.useState)(""),y=(0,a.useCallback)(async()=>{g(!0);try{let e=(0,n.mapParentCertificatesResponse)(await s.api.getParentCertificates());c(e)}catch{c({published:!1,message:"تعذر تحميل الشهادات.",config:null,certificate:null,certificates:[]})}finally{g(!1)}},[]);return((0,a.useEffect)(()=>{y(),s.api.getSiteSettings().then(e=>{let t=e.hero;t?.schoolName?.trim()&&x(t.schoolName.trim())}).catch(()=>{}),s.api.getParentFees().then(e=>{let t=(0,o.mapFeeStatus)(e.feeStatus);h(!!t?.blocked),u(t?.message??"")}).catch(()=>{h(!1),u("")})},[y]),f)?(0,t.jsx)("p",{className:"text-neutral-500",children:"جاري التحميل..."}):m?(0,t.jsxs)("div",{children:[(0,t.jsx)(l.PageHeader,{title:"الشهادات",description:"شهادات الفصل الدراسي الحالي"}),(0,t.jsx)(i.Alert,{variant:"warning",children:(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsx)(d.Lock,{className:"h-5 w-5"}),(0,t.jsx)("p",{children:b||"عذراً، يرجى تسديد القسط المستحق لعرض الشهادات."})]})})]}):(0,t.jsxs)("div",{children:[(0,t.jsx)(l.PageHeader,{title:"الشهادات",description:"شهادات الفصل الحالي والفصول المنتهية مؤخراً (أسبوعان) — ثم تنتقل إلى أرشيف الشهادات"}),(0,t.jsx)(r.ParentCertificatesPanel,{data:e,schoolName:p,emptyDescription:"بعد إغلاق الفصل تبقى شهادته هنا أسبوعين ثم تنتقل إلى أرشيف الشهادات."})]})}])},48503,e=>{e.v(t=>Promise.all(["static/chunks/3gti1qdk5epqn.js"].map(t=>e.l(t))).then(()=>t(15833)))},34162,e=>{e.v(t=>Promise.all(["static/chunks/0-pjfrll3yris.js","static/chunks/1sbyix0n3_cfa.js"].map(t=>e.l(t))).then(()=>t(55749)))}]);