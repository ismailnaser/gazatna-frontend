module.exports=[49883,a=>{"use strict";var b=a.i(87924),c=a.i(68114);a.s(["PageHeader",0,function({title:a,description:d,className:e}){return(0,b.jsxs)("div",{className:(0,c.cn)("mb-8",e),children:[(0,b.jsx)("h1",{className:"text-2xl font-bold text-p-green sm:text-3xl",children:a}),(0,b.jsx)("div",{className:"mt-2 h-1 w-16 rounded-full bg-p-red"}),d&&(0,b.jsx)("p",{className:"mt-3 text-p-black/60",children:d})]})}])},73340,a=>{"use strict";var b=a.i(87924),c=a.i(68114);let d={default:"bg-neutral-100 text-neutral-600",success:"bg-p-green/10 text-p-green",warning:"bg-amber-50 text-amber-700",danger:"bg-p-red/10 text-p-red",info:"bg-p-green/10 text-p-green"};a.s(["Badge",0,function({children:a,variant:e="default",className:f}){return(0,b.jsx)("span",{className:(0,c.cn)("inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold",d[e],f),children:a})}])},17659,a=>{"use strict";function b(a){return a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function c(){let a=await fetch("/images/logo.png");if(!a.ok)throw Error("failed to load school logo");let b=await a.blob();return new Promise((a,c)=>{let d=new FileReader;d.onload=()=>a(String(d.result)),d.onerror=()=>c(Error("failed to read school logo")),d.readAsDataURL(b)})}async function d(a){let b=Array.from(a.querySelectorAll("img"));await Promise.all(b.map(a=>new Promise(b=>{a.complete&&a.naturalWidth>0?b():(a.addEventListener("load",()=>b(),{once:!0}),a.addEventListener("error",()=>b(),{once:!0}))})))}async function e(b,c){let[{default:e},{jsPDF:f}]=await Promise.all([a.A(93042),a.A(52143)]);document.body.appendChild(b);try{await d(b),await new Promise(a=>setTimeout(a,120));let a=await e(b,{scale:2,useCORS:!0,backgroundColor:"#ffffff",logging:!1,scrollX:0,scrollY:0,windowWidth:b.scrollWidth,windowHeight:b.scrollHeight});if(0===a.width||0===a.height)throw Error("empty canvas");let g=a.toDataURL("image/jpeg",.95),h=new f({unit:"mm",format:"a4",orientation:"portrait"}),i=h.internal.pageSize.getWidth(),j=h.internal.pageSize.getHeight(),k=i-20,l=a.height*k/a.width,m=l,n=10;for(h.addImage(g,"JPEG",10,n,k,l),m-=j-20;m>0;)h.addPage(),n=10-(l-m),h.addImage(g,"JPEG",10,n,k,l),m-=j-20;h.save(c)}finally{b.remove()}}a.s(["buildPdfBrandedFooterHtml",0,function(a="مدرسة غَزتنا"){return`
    <footer style="margin-top:24px;padding-top:12px;border-top:1px solid #d4d4d4;font-size:10px;color:#888;text-align:center;">
      وثيقة صادرة إلكترونياً من منصة ${b(a)}
    </footer>
  `},"buildPdfBrandedHeaderHtml",0,function(a){let{logoDataUrl:c,title:d,schoolName:e,lines:f=[]}=a,g=e?`<p style="margin:0 0 4px;font-size:12px;color:#666;">${b(e)}</p>`:"",h=f.filter(Boolean).map(a=>`<p style="margin:4px 0 0;font-size:12px;color:#666;line-height:1.5;">${b(a)}</p>`).join("");return`
    <header style="display:flex;align-items:center;gap:20px;border-bottom:2px solid #424cf3;padding-bottom:16px;margin-bottom:18px;">
      <img
        src="${c}"
        alt="شعار المدرسة"
        style="height:76px;width:auto;max-width:340px;object-fit:contain;display:block;flex-shrink:0;"
      />
      <div style="flex:1;min-width:0;text-align:right;">
        ${g}
        <h1 style="margin:0;font-size:22px;font-weight:700;color:#111111;line-height:1.35;">${b(d)}</h1>
        ${h}
      </div>
    </header>
  `},"escapeHtml",0,b,"exportHTMLElementToPdf",0,e,"formatExportDate",0,function(){let a=new Date,b=a=>String(a).padStart(2,"0");return`${a.getFullYear()}-${b(a.getMonth()+1)}-${b(a.getDate())}`},"loadSchoolLogoDataUrl",0,c,"mountPdfElement",0,function(a){let b=document.createElement("div");b.innerHTML=a;let c=b.firstElementChild;if(!(c instanceof HTMLElement))throw Error("failed to build pdf element");return c.style.position="fixed",c.style.left="0",c.style.top="0",c.style.zIndex="2147483647",c.style.background="#ffffff",c.style.padding="24px",c.style.boxSizing="border-box",c}])},28979,13730,98969,a=>{"use strict";var b=a.i(17659);async function c({certificate:a,config:d,schoolName:e="مدرسة غَزتنا",honorsTitle:f}){let g=f?.trim()||d.honorsTitle,h=await (0,b.loadSchoolLogoDataUrl)(),i=(0,b.formatExportDate)(),j=null!=a.averagePercent?`${a.averagePercent.toFixed(2)}%`:"—";return`
    <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#ffffff;color:#111111;width:746px;">
      <div style="border:3px double #b45309;border-radius:16px;padding:22px 24px 20px;background:#fffbeb;">
        <div style="border:1px solid rgba(180,83,9,0.35);border-radius:12px;padding:22px 20px 18px;background:#fffdf5;">

          <table style="width:100%;border-collapse:collapse;margin-bottom:18px;border-bottom:2px solid #d97706;padding-bottom:16px;">
            <tr>
              <td style="width:140px;vertical-align:middle;padding-left:12px;">
                <img
                  src="${h}"
                  alt="شعار المدرسة"
                  style="height:72px;width:auto;max-width:130px;object-fit:contain;display:block;"
                />
              </td>
              <td style="vertical-align:middle;text-align:right;">
                <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#92400e;line-height:1.5;">${(0,b.escapeHtml)(e)}</p>
                <p style="margin:0;font-size:12px;color:#78350f;line-height:1.6;">${(0,b.escapeHtml)(a.periodLabel)}</p>
              </td>
            </tr>
          </table>

          <div style="margin:0 auto 14px;max-width:420px;padding:12px 20px;background:#b45309;border-radius:10px;text-align:center;">
            <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;line-height:1.45;letter-spacing:0;">
              ${(0,b.escapeHtml)(g)}
            </h1>
          </div>

          <p style="margin:0 auto 20px;max-width:520px;font-size:14px;line-height:1.7;color:#78350f;text-align:center;">
            تُمنح هذه الشهادة تقديراً للتميز الأكاديمي
          </p>

          <div style="margin:0 auto 20px;max-width:520px;padding:18px 20px;border-radius:12px;background:#ffffff;border:1px solid rgba(180,83,9,0.25);text-align:center;">
            <p style="margin:0 0 8px;font-size:13px;color:#78350f;line-height:1.6;">يُشهد بأن الطالب/ة</p>
            <p style="margin:0 0 14px;font-size:26px;font-weight:800;color:#451a03;line-height:1.35;">${(0,b.escapeHtml)(a.studentName)}</p>
            <table style="width:100%;border-collapse:collapse;margin:0 auto;max-width:320px;">
              <tr>
                <td style="padding:4px 8px;font-size:12px;color:#92400e;text-align:right;">الصف</td>
                <td style="padding:4px 8px;font-size:13px;font-weight:700;color:#451a03;text-align:left;">${(0,b.escapeHtml)(a.gradeLevel||"—")}</td>
              </tr>
              <tr>
                <td style="padding:4px 8px;font-size:12px;color:#92400e;text-align:right;">الشعبة</td>
                <td style="padding:4px 8px;font-size:13px;font-weight:700;color:#451a03;text-align:left;">${(0,b.escapeHtml)(a.section||"—")}</td>
              </tr>
              <tr>
                <td style="padding:4px 8px;font-size:12px;color:#92400e;text-align:right;">رقم الطالب</td>
                <td style="padding:4px 8px;font-size:13px;font-weight:700;color:#451a03;text-align:left;direction:ltr;">${(0,b.escapeHtml)(a.studentNumber||"—")}</td>
              </tr>
            </table>
          </div>

          <table style="margin:0 auto 20px;border-collapse:collapse;border:2px solid #b45309;border-radius:10px;overflow:hidden;">
            <tr>
              <td style="padding:12px 24px;background:#fef3c7;font-size:14px;font-weight:700;color:#92400e;text-align:center;white-space:nowrap;">
                المعدل العام
              </td>
              <td style="padding:12px 28px;background:#b45309;font-size:26px;font-weight:800;color:#ffffff;text-align:center;direction:ltr;white-space:nowrap;">
                ${j}
              </td>
            </tr>
          </table>

          <p style="margin:0 auto 16px;max-width:560px;font-size:13px;line-height:1.95;color:#78350f;text-align:center;">
            ${(0,b.escapeHtml)(d.honorsMessage)}
          </p>

          <p style="margin:0 0 22px;font-size:11px;color:#92400e;text-align:center;line-height:1.6;">
            الحد الأدنى لشهادة التقدير: ${d.honorsMinAverage}%
          </p>

          <table style="width:100%;max-width:460px;margin:0 auto;border-collapse:collapse;">
            <tr>
              <td style="width:50%;border-top:2px solid rgba(180,83,9,0.45);padding-top:10px;text-align:center;vertical-align:top;">
                <p style="margin:0;font-size:11px;color:#78350f;line-height:1.5;">مدير/ة المدرسة</p>
              </td>
              <td style="width:50%;border-top:2px solid rgba(180,83,9,0.45);padding-top:10px;text-align:center;vertical-align:top;">
                <p style="margin:0;font-size:11px;color:#78350f;line-height:1.5;">تاريخ الإصدار: ${i}</p>
              </td>
            </tr>
          </table>

        </div>
      </div>

      ${(0,b.buildPdfBrandedFooterHtml)(e)}
    </div>
  `}async function d({certificate:a,config:c,schoolName:e="مدرسة غَزتنا"}){let f=await (0,b.loadSchoolLogoDataUrl)(),g=(0,b.formatExportDate)(),h="border:1px solid #d4d4d4;background:#f8fafc;padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#111;",i="border:1px solid #e5e7eb;padding:10px 12px;font-size:12px;color:#111;vertical-align:middle;text-align:right;",j=a.subjects.map(a=>{var c,d,e;let f=null==a.percent?"color:#888;font-weight:600;":a.percent>=50?"color:#16a34a;font-weight:700;":"color:#ea6622;font-weight:700;";return`<tr>
        <td style="${i}font-weight:600;">${(0,b.escapeHtml)(a.subject)}</td>
        <td style="${i}">${c=a.score,d=a.maxScore,null==c||null==d?"—":`${c}/${d}`}</td>
        <td style="${i}${f}">${null==(e=a.percent)?"—":`${e.toFixed(2)}%`}</td>
      </tr>`}).join(""),k=null!=a.averagePercent?`<table style="width:100%;margin-top:18px;border-collapse:collapse;border:1px solid #dbeafe;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:16px 18px;background:#f8fafc;vertical-align:middle;">
              <p style="margin:0;font-size:12px;color:#475569;">المعدل العام من 100%</p>
              <p style="margin:4px 0 0;font-size:11px;color:#64748b;">${a.gradedSubjectsCount} من ${a.assignedSubjectsCount} مادة</p>
            </td>
            <td style="padding:16px 18px;background:#eef2ff;text-align:center;vertical-align:middle;width:140px;">
              <p style="margin:0;font-size:28px;font-weight:800;color:#424cf3;direction:ltr;">${a.averagePercent.toFixed(2)}%</p>
            </td>
          </tr>
        </table>`:'<p style="margin-top:16px;text-align:center;color:#666;font-size:13px;">لا توجد علامات كافية لحساب المعدل.</p>';return`
    <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#ffffff;color:#111111;width:746px;">
      <div style="padding:22px 24px 20px;background:#ffffff;">
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;border-bottom:1px solid #e5e7eb;padding-bottom:16px;">
          <tr>
            <td style="width:140px;vertical-align:middle;padding-left:12px;">
              <img
                src="${f}"
                alt="شعار المدرسة"
                style="height:76px;width:auto;max-width:130px;object-fit:contain;display:block;"
              />
            </td>
            <td style="vertical-align:middle;text-align:right;">
              <p style="margin:0 0 4px;font-size:12px;color:#666;">${(0,b.escapeHtml)(e)}</p>
              <h1 style="margin:0;font-size:24px;font-weight:800;color:#111111;line-height:1.35;">${(0,b.escapeHtml)(c.certificateTitle)}</h1>
              <p style="margin:6px 0 0;font-size:12px;color:#666;line-height:1.5;">${(0,b.escapeHtml)(a.periodLabel)}</p>
              <p style="margin:4px 0 0;font-size:12px;color:#666;line-height:1.5;">تاريخ الإصدار: ${g}</p>
            </td>
          </tr>
        </table>

        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;border:1px solid #ececec;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="padding:14px;background:#fffdf8;width:50%;vertical-align:top;">
              <span style="font-size:11px;color:#666;">اسم الطالب</span>
              <p style="margin:2px 0 0;font-size:15px;font-weight:700;">${(0,b.escapeHtml)(a.studentName)}</p>
            </td>
            <td style="padding:14px;background:#fffdf8;width:50%;vertical-align:top;">
              <span style="font-size:11px;color:#666;">رقم الطالب</span>
              <p style="margin:2px 0 0;font-size:15px;font-weight:700;direction:ltr;text-align:right;">${(0,b.escapeHtml)(a.studentNumber||"—")}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px;background:#ffffff;width:50%;vertical-align:top;">
              <span style="font-size:11px;color:#666;">الصف</span>
              <p style="margin:2px 0 0;font-size:15px;font-weight:700;">${(0,b.escapeHtml)(a.gradeLevel||"—")}</p>
            </td>
            <td style="padding:14px;background:#ffffff;width:50%;vertical-align:top;">
              <span style="font-size:11px;color:#666;">الشعبة</span>
              <p style="margin:2px 0 0;font-size:15px;font-weight:700;">${(0,b.escapeHtml)(a.section||"—")}</p>
            </td>
          </tr>
        </table>

        <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
          <thead>
            <tr>
              <th style="${h}">المادة</th>
              <th style="${h}">العلامة</th>
              <th style="${h}">النسبة من 100%</th>
            </tr>
          </thead>
          <tbody>
            ${j||`<tr><td colspan="3" style="${i}text-align:center;color:#666;">لا توجد مواد مسندة.</td></tr>`}
          </tbody>
        </table>

        ${k}

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

      ${(0,b.buildPdfBrandedFooterHtml)(e)}
    </div>
  `}async function e(a){return(0,b.mountPdfElement)(await c(a))}async function f(a){let c=await e(a),d=a.certificate.studentName.replace(/[\\/:*?"<>|]/g,"-").trim()||"طالب";await (0,b.exportHTMLElementToPdf)(c,`شهادة_تقدير_${d}_${(0,b.formatExportDate)()}.pdf`)}async function g(a){return(0,b.mountPdfElement)(await d(a))}async function h(a){let c=await g(a),d=a.certificate.studentName.replace(/[\\/:*?"<>|]/g,"-").trim()||"طالب";await (0,b.exportHTMLElementToPdf)(c,`شهادة_علامات_${d}_${(0,b.formatExportDate)()}.pdf`)}a.s(["buildHonorsCertificateHtml",0,c,"buildStudentCertificateHtml",0,d],13730),a.s(["exportHonorsCertificatePdf",0,f],28979),a.s(["exportStudentCertificatePdf",0,h],98969)},55077,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(5225),e=a.i(73340),f=a.i(90832),g=a.i(16745),h=a.i(28979),i=a.i(98969),j=a.i(68114);let k=(0,a.i(64831).default)("award",[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]]);var l=a.i(36670),m=a.i(19770);function n(a){return null==a?"—":`${a.toFixed(2)}%`}function o({title:a,certificate:m,config:p,honorsTitle:q,schoolName:r,visibleUntil:s,archiveAfterGrace:t}){let u=q?.trim()||p.honorsTitle,[v,w]=(0,c.useState)(""),[x,y]=(0,c.useState)(!1),[z,A]=(0,c.useState)(!1);async function B(){w(""),y(!0);try{await (0,i.exportStudentCertificatePdf)({certificate:m,config:p,schoolName:r})}catch{w("تعذر تحميل شهادة العلامات.")}finally{y(!1)}}async function C(){if(m.qualifiesHonors){w(""),A(!0);try{await (0,h.exportHonorsCertificatePdf)({certificate:m,config:p,schoolName:r,honorsTitle:u})}catch{w("تعذر تحميل شهادة التقدير.")}finally{A(!1)}}}return(0,b.jsxs)("div",{className:"space-y-4",children:[v?(0,b.jsx)(d.Alert,{variant:"error",children:v}):null,(0,b.jsxs)(g.Card,{className:"overflow-hidden border-p-green/20 p-0",children:[(0,b.jsx)("div",{className:"border-b border-neutral-100 bg-p-green/5 px-4 py-4",children:(0,b.jsxs)("div",{className:"flex flex-wrap items-start justify-between gap-3",children:[(0,b.jsxs)("div",{children:[(0,b.jsxs)("div",{className:"flex flex-wrap items-center gap-2",children:[(0,b.jsx)("h2",{className:"text-lg font-bold text-p-black",children:a}),(0,b.jsx)(e.Badge,{variant:"success",children:"منشورة"})]}),(0,b.jsx)("p",{className:"mt-1 text-sm text-p-black/55",children:m.periodLabel}),t&&s?(0,b.jsxs)("p",{className:"mt-1 text-xs text-brand-blue",children:["تبقى في قسم الشهادات حتى ",s," ثم تنتقل إلى أرشيف الشهادات"]}):null]}),(0,b.jsxs)(f.Button,{onClick:B,disabled:x,children:[(0,b.jsx)(l.Download,{className:"h-4 w-4"}),x?"جاري التحميل...":"تحميل الشهادة"]})]})}),(0,b.jsxs)("div",{className:"grid gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"text-xs text-p-black/50",children:"اسم الطالب"}),(0,b.jsx)("p",{className:"font-semibold text-p-black",children:m.studentName})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"text-xs text-p-black/50",children:"الصف"}),(0,b.jsxs)("p",{className:"font-semibold text-p-black",children:[m.gradeLevel," ",m.section]})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"text-xs text-p-black/50",children:"المعدل من 100%"}),(0,b.jsx)("p",{className:"text-xl font-bold text-p-green",children:n(m.averagePercent)})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"text-xs text-p-black/50",children:"المواد المحتسبة"}),(0,b.jsxs)("p",{className:"font-semibold text-p-black",children:[m.gradedSubjectsCount,"/",m.assignedSubjectsCount]})]})]}),(0,b.jsx)("div",{className:"overflow-x-auto border-t border-neutral-100",children:(0,b.jsxs)("table",{className:"w-full min-w-[520px] text-sm",children:[(0,b.jsx)("thead",{children:(0,b.jsxs)("tr",{className:"border-b border-neutral-100 bg-p-cream/60 text-p-black/60",children:[(0,b.jsx)("th",{className:"px-4 py-2.5 text-start font-semibold",children:"المادة"}),(0,b.jsx)("th",{className:"px-4 py-2.5 text-start font-semibold",children:"العلامة"}),(0,b.jsx)("th",{className:"px-4 py-2.5 text-start font-semibold",children:"النسبة من 100%"})]})}),(0,b.jsx)("tbody",{children:m.subjects.map(c=>(0,b.jsxs)("tr",{className:"border-b border-neutral-50",children:[(0,b.jsx)("td",{className:"px-4 py-2.5 font-medium text-p-black",children:c.subject}),(0,b.jsx)("td",{className:"px-4 py-2.5 text-p-black/70",children:null==c.score||null==c.maxScore?"—":`${c.score}/${c.maxScore}`}),(0,b.jsx)("td",{className:(0,j.cn)("px-4 py-2.5 font-semibold",null==c.percent?"text-p-black/45":c.percent>=50?"text-p-green":"text-p-red"),children:n(c.percent)})]},`${a}-${c.subject}`))})]})})]}),p.honorsEnabled&&m.qualifiesHonors?(0,b.jsx)(g.Card,{className:"overflow-hidden border-amber-300/60 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-0",children:(0,b.jsxs)("div",{className:"flex flex-wrap items-start justify-between gap-3 px-4 py-4",children:[(0,b.jsxs)("div",{className:"flex items-start gap-3",children:[(0,b.jsx)("div",{className:"rounded-full bg-amber-200/70 p-2.5",children:(0,b.jsx)(k,{className:"h-6 w-6 text-amber-700"})}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-bold text-amber-950",children:u}),(0,b.jsxs)("p",{className:"mt-1 text-sm text-amber-900/70",children:["مبروك! معدلك ",n(m.averagePercent)," يؤهّلك لـ",u," (الحد الأدنى ",p.honorsMinAverage,"%)."]}),(0,b.jsx)("p",{className:"mt-2 max-w-2xl text-sm leading-relaxed text-amber-900/80",children:p.honorsMessage})]})]}),(0,b.jsxs)(f.Button,{onClick:C,disabled:z,className:"bg-amber-600 hover:bg-amber-700",children:[(0,b.jsx)(l.Download,{className:"h-4 w-4"}),z?"جاري التحميل...":"تحميل شهادة التقدير"]})]})}):p.honorsEnabled?(0,b.jsxs)(d.Alert,{variant:"info",children:["شهادة التقدير لهذا المعدل متاحة للطلاب الذين يحققون معدلاً لا يقل عن ",p.honorsMinAverage,"%."]}):null]})}a.s(["ParentCertificatesPanel",0,function({data:a,schoolName:c,emptyTitle:d="لم تصدر الإدارة الشهادات بعد.",emptyDescription:e="ستظهر الشهادة هنا بعد أن تقرر الإدارة إصدارها ونشرها."}){let f=a?.config,h=a?a.certificates.length>0?a.certificates:a.certificate&&a.config?[{scope:a.config.issuanceScope,scopeLabel:a.config.certificateTitle,certificate:a.certificate}]:[]:[];return a?.published&&f&&0!==h.length?(0,b.jsx)("div",{className:"space-y-6",children:h.map(a=>(0,b.jsx)(o,{title:a.scopeLabel||a.config?.certificateTitle||f.certificateTitle,certificate:a.certificate,config:a.config??f,honorsTitle:a.honorsTitle,schoolName:c,visibleUntil:a.visibleUntil,archiveAfterGrace:a.archiveAfterGrace},`${a.academicYearId??"year"}-${a.scope}`))}):(0,b.jsxs)(g.Card,{className:"flex flex-col items-center gap-3 py-12 text-center",children:[(0,b.jsx)(m.Medal,{className:"h-10 w-10 text-p-black/25"}),(0,b.jsx)("p",{className:"text-neutral-600",children:a?.message||d}),(0,b.jsx)("p",{className:"text-sm text-p-black/45",children:e})]})}],55077)},820,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(5225),e=a.i(49883),f=a.i(55077),g=a.i(19032),h=a.i(15388),i=a.i(215),j=a.i(39353);a.s(["default",0,function(){let[a,k]=(0,c.useState)(null),[l,m]=(0,c.useState)("مدرسة غَزتنا"),[n,o]=(0,c.useState)(!0),[p,q]=(0,c.useState)(!1),[r,s]=(0,c.useState)(""),t=(0,c.useCallback)(async()=>{o(!0);try{let a=(0,h.mapParentCertificatesResponse)(await g.api.getParentCertificates());k(a)}catch{k({published:!1,message:"تعذر تحميل الشهادات.",config:null,certificate:null,certificates:[]})}finally{o(!1)}},[]);return((0,c.useEffect)(()=>{t(),g.api.getSiteSettings().then(a=>{let b=a.hero;b?.schoolName?.trim()&&m(b.schoolName.trim())}).catch(()=>{}),g.api.getParentFees().then(a=>{let b=(0,i.mapFeeStatus)(a.feeStatus);q(!!b?.blocked),s(b?.message??"")}).catch(()=>{q(!1),s("")})},[t]),n)?(0,b.jsx)("p",{className:"text-neutral-500",children:"جاري التحميل..."}):p?(0,b.jsxs)("div",{children:[(0,b.jsx)(e.PageHeader,{title:"الشهادات",description:"شهادات الفصل الدراسي الحالي"}),(0,b.jsx)(d.Alert,{variant:"warning",children:(0,b.jsxs)("div",{className:"flex items-center gap-2",children:[(0,b.jsx)(j.Lock,{className:"h-5 w-5"}),(0,b.jsx)("p",{children:r||"عذراً، يرجى تسديد القسط المستحق لعرض الشهادات."})]})})]}):(0,b.jsxs)("div",{children:[(0,b.jsx)(e.PageHeader,{title:"الشهادات",description:"شهادات الفصل الحالي والفصول المنتهية مؤخراً (أسبوعان) — ثم تنتقل إلى أرشيف الشهادات"}),(0,b.jsx)(f.ParentCertificatesPanel,{data:a,schoolName:l,emptyDescription:"بعد إغلاق الفصل تبقى شهادته هنا أسبوعين ثم تنتقل إلى أرشيف الشهادات."})]})}])},93042,a=>{a.v(b=>Promise.all(["server/chunks/ssr/node_modules_html2canvas_dist_html2canvas_esm_1n-0xws.js"].map(b=>a.l(b))).then(()=>b(33926)))},52143,a=>{a.v(b=>Promise.all(["server/chunks/ssr/[externals]_path_1ulxq_v._.js","server/chunks/ssr/[root-of-the-server]__06vksfk._.js","server/chunks/ssr/node_modules_html2canvas_dist_html2canvas_esm_1n-0xws.js"].map(b=>a.l(b))).then(()=>b(32596)))}];

//# sourceMappingURL=_16aln7h._.js.map