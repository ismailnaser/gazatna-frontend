(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,57582,e=>{"use strict";var t=e.i(38411);let i=["الأول","الثاني","الثالث","الرابع","الخامس","السادس"];function a(e){let t=i[e-1]??String(e);return`الفصل ${t}`}let r=/^T\d+$/i;function n(e){if(!e)return"—";if(e.displayName?.trim())return e.displayName.trim();let t=e.name.trim();return!t||r.test(t)?a(e.sortOrder):t}function l(e,t){let i=/^(\d{4})-(\d{2})-(\d{2})/.exec(e.trim());if(!i)return e;let a=new Date(Number(i[1]),Number(i[2])-1,Number(i[3]));a.setDate(a.getDate()+t);let r=a.getFullYear(),n=String(a.getMonth()+1).padStart(2,"0"),l=String(a.getDate()).padStart(2,"0");return`${r}-${n}-${l}`}let o=()=>({evaluationScope:"single_term",yearCalculationMethod:"term_average",evaluationTermId:null,passRule:"minimum_count",passMinimumCount:1,requiredSubjects:[],passScoreRatio:.5,passPromotionMode:"automatic",failHandlingMode:"manual_review"});function d(e,t){return"minimum_count"!==e.passRule?null:Math.max(1,Number(t||e.passMinimumCount)||1)}function s(e,t){return null==t?e:e.slice(0,t)}function c(e=new Date){return e.getFullYear()}function u(e){return`${e}/${e+1}`}function p(e){let t=Number(e.split("/")[0]);return{name:e,startDate:`${t}-09-01`,endDate:`${t+1}-06-30`}}function f(e,t=10,i=new Date){let a=new Set(e.map(e=>e.name.trim().replace("-","/"))),r=[],n=c(i);for(let e=0;e<=t;e+=1){let t=u(n+e);a.has(t)||r.push({value:t,label:t})}return r}function m(e){return"archived"===e.status}function g(e){return[...e.terms].sort((e,t)=>e.sortOrder-t.sortOrder)}function x(e){return e.terms.find(e=>e.isCurrent)??g(e)[0]??null}function h(e,t){let i=g(e);return i.length>0&&i[i.length-1].id===t.id}function b(e,t){for(let i of g(e)){if(i.id===t.id)break;if(!i.isClosed)return!1}return!0}e.s(["DEFAULT_SCHOOL_NAME",0,"مدرسة غَزتنا","academicYearFormFromLabel",0,p,"academicYearSelectOptions",0,f,"buildPassMinimumCountInputs",0,function(e){let t={};for(let[i,a]of Object.entries(e))t[i]=String(a.passMinimumCount);return t},"buildPolicyDraftsFromGrades",0,function(e){let t={};for(let i of e){let e=i.promotionPolicy?{...i.promotionPolicy}:o(),a=d(e,String(e.passMinimumCount));t[i.id]={...e,requiredSubjects:s(e.requiredSubjects,a)}}return t},"canUseTermEnd",0,function(e){let t=x(e);return!!t&&!t.isClosed&&!h(e,t)&&b(e,t)},"canUseYearEnd",0,function(e){let t=x(e);return!!t&&h(e,t)&&b(e,t)},"cloneTerms",0,function(e){return e.map(e=>({...e}))},"defaultCertificateConfig",0,()=>({academicYearId:"",issuanceScope:"term",isPublished:!1,publishedAt:null,publishedTermId:null,honorsEnabled:!0,honorsMinAverage:95,honorsTitle:"شهادة تقدير",honorsMessage:"تقديراً للتميز والاجتهاد، تُمنح هذه الشهادة اعترافاً بالمعدل العالي والأداء المتميز طوال الفترة الدراسية.",certificateTitle:"شهادة علامات",updatedAt:null}),"defaultPolicy",0,o,"defaultTermName",0,a,"formatCertificatePercent",0,function(e){return null==e?"—":`${e.toFixed(2)}%`},"getActiveCertificateTerm",0,function(e){if(!e)return null;let t=e.terms.find(e=>e.isCurrent);return t||(e.currentTermId?e.terms.find(t=>t.id===e.currentTermId)??null:null)},"getCurrentTerm",0,x,"getTermDisplayName",0,n,"isArchivedAcademicYear",0,m,"isGradePolicyConfigured",0,function(e){return!!e.promotionPolicy?.isConfigured},"isLastTermInYear",0,h,"isManageableAcademicYear",0,function(e){return!m(e)},"maxRequiredSubjectsForPolicy",0,d,"priorTermsAllClosed",0,b,"reindexTerms",0,function(e){return e.map((e,t)=>({...e,sortOrder:t+1}))},"resolveStudentDecision",0,function(e,t){let i=t[e.studentId];return i&&"pending"!==i?i:"pending"!==e.finalAction?e.finalAction:e.yearPassed?"promote":"repeat"},"resolveTermLabelFromYear",0,function(e,t,i){if(e&&t){let i=e.terms.find(e=>e.id===t);if(i)return n(i)}if(e&&i?.trim()){let t=e.terms.find(e=>e.name===i.trim());if(t)return n(t)}let l=i?.trim();return l?r.test(l)?a(Number(l.slice(1))||1):l:"—"},"sortedTerms",0,g,"suggestNewYearForm",0,function(e){let t=f(e);return t.length>0?p(t[0].value):p(u(c()))},"suggestedTermDates",0,function(e,t){let i=t[t.length-1];if(i){let t=l(i.endDate,1);return t>e.endDate?{startDate:e.endDate,endDate:e.endDate}:{startDate:t,endDate:e.endDate}}return{startDate:e.startDate,endDate:e.endDate}},"summarizePromotionPolicy",0,function(e){let i=t.passRuleLabels[e.passRule];return"minimum_count"===e.passRule?`${i}: ${e.passMinimumCount} مواد`:i},"trimRequiredSubjects",0,s,"validateAcademicTerms",0,function(e,t){if(0===t.length)return"يجب تحديد فصل دراسي واحد على الأقل";let i=[...t].sort((e,t)=>e.sortOrder-t.sortOrder);for(let t of i){let i=t.name.trim()||"الفصل";if(!t.name.trim())return"أدخل اسم كل فصل دراسي";if(t.endDate<t.startDate)return`تاريخ نهاية \xab${i}\xbb يجب أن يكون بعد تاريخ البداية`;if(t.startDate<e.startDate)return`بداية \xab${i}\xbb يجب أن تكون ضمن السنة الدراسية (${e.startDate} — ${e.endDate})`;if(t.endDate>e.endDate)return`نهاية \xab${i}\xbb يجب أن تكون ضمن السنة الدراسية (${e.startDate} — ${e.endDate})`}for(let e=1;e<i.length;e+=1){let t=i[e-1],a=i[e],r=t.name.trim()||"الفصل السابق",n=a.name.trim()||"الفصل";if(a.startDate<=t.endDate)return`\xab${n}\xbb يتداخل مع \xab${r}\xbb. يجب أن يبدأ في ${l(t.endDate,1)} أو بعده`}return null}])},76358,e=>{"use strict";function t(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function i(){let e=await fetch(`${window.location.origin}/images/logo.png`);if(!e.ok)throw Error("failed to load school logo");let t=await e.blob();return new Promise((e,i)=>{let a=new FileReader;a.onload=()=>e(String(a.result)),a.onerror=()=>i(Error("failed to read school logo")),a.readAsDataURL(t)})}async function a(e){let t=Array.from(e.querySelectorAll("img"));await Promise.all(t.map(e=>new Promise(t=>{e.complete&&e.naturalWidth>0?t():(e.addEventListener("load",()=>t(),{once:!0}),e.addEventListener("error",()=>t(),{once:!0}))})))}async function r(t,i){let[{default:r},{jsPDF:n}]=await Promise.all([e.A(48503),e.A(34162)]);document.body.appendChild(t);try{await a(t),await new Promise(e=>setTimeout(e,120));let e=await r(t,{scale:2,useCORS:!0,backgroundColor:"#ffffff",logging:!1,scrollX:0,scrollY:0,windowWidth:t.scrollWidth,windowHeight:t.scrollHeight});if(0===e.width||0===e.height)throw Error("empty canvas");let l=e.toDataURL("image/jpeg",.95),o=new n({unit:"mm",format:"a4",orientation:"portrait"}),d=o.internal.pageSize.getWidth(),s=o.internal.pageSize.getHeight(),c=d-20,u=e.height*c/e.width,p=u,f=10;for(o.addImage(l,"JPEG",10,f,c,u),p-=s-20;p>0;)o.addPage(),f=10-(u-p),o.addImage(l,"JPEG",10,f,c,u),p-=s-20;o.save(i)}finally{t.remove()}}e.s(["buildPdfBrandedFooterHtml",0,function(e="مدرسة غَزتنا"){return`
    <footer style="margin-top:24px;padding-top:12px;border-top:1px solid #d4d4d4;font-size:10px;color:#888;text-align:center;">
      وثيقة صادرة إلكترونياً من منصة ${t(e)}
    </footer>
  `},"buildPdfBrandedHeaderHtml",0,function(e){let{logoDataUrl:i,title:a,schoolName:r,lines:n=[]}=e,l=r?`<p style="margin:0 0 4px;font-size:12px;color:#666;">${t(r)}</p>`:"",o=n.filter(Boolean).map(e=>`<p style="margin:4px 0 0;font-size:12px;color:#666;line-height:1.5;">${t(e)}</p>`).join("");return`
    <header style="display:flex;align-items:center;gap:20px;border-bottom:2px solid #424cf3;padding-bottom:16px;margin-bottom:18px;">
      <img
        src="${i}"
        alt="شعار المدرسة"
        style="height:76px;width:auto;max-width:340px;object-fit:contain;display:block;flex-shrink:0;"
      />
      <div style="flex:1;min-width:0;text-align:right;">
        ${l}
        <h1 style="margin:0;font-size:22px;font-weight:700;color:#111111;line-height:1.35;">${t(a)}</h1>
        ${o}
      </div>
    </header>
  `},"escapeHtml",0,t,"exportHTMLElementToPdf",0,r,"formatExportDate",0,function(){let e=new Date,t=e=>String(e).padStart(2,"0");return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}`},"loadSchoolLogoDataUrl",0,i,"mountPdfElement",0,function(e){let t=document.createElement("div");t.innerHTML=e;let i=t.firstElementChild;if(!(i instanceof HTMLElement))throw Error("failed to build pdf element");return i.style.position="fixed",i.style.left="0",i.style.top="0",i.style.zIndex="2147483647",i.style.background="#ffffff",i.style.padding="24px",i.style.boxSizing="border-box",i}])},72489,7179,25249,e=>{"use strict";var t=e.i(76358);async function i({certificate:e,config:a,schoolName:r="مدرسة غَزتنا",honorsTitle:n}){let l=n?.trim()||a.honorsTitle,o=await (0,t.loadSchoolLogoDataUrl)(),d=(0,t.formatExportDate)(),s=null!=e.averagePercent?`${e.averagePercent.toFixed(2)}%`:"—";return`
    <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#ffffff;color:#111111;width:746px;">
      <div style="border:3px double #b45309;border-radius:16px;padding:22px 24px 20px;background:#fffbeb;">
        <div style="border:1px solid rgba(180,83,9,0.35);border-radius:12px;padding:22px 20px 18px;background:#fffdf5;">

          <table style="width:100%;border-collapse:collapse;margin-bottom:18px;border-bottom:2px solid #d97706;padding-bottom:16px;">
            <tr>
              <td style="width:140px;vertical-align:middle;padding-left:12px;">
                <img
                  src="${o}"
                  alt="شعار المدرسة"
                  style="height:72px;width:auto;max-width:130px;object-fit:contain;display:block;"
                />
              </td>
              <td style="vertical-align:middle;text-align:right;">
                <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#92400e;line-height:1.5;">${(0,t.escapeHtml)(r)}</p>
                <p style="margin:0;font-size:12px;color:#78350f;line-height:1.6;">${(0,t.escapeHtml)(e.periodLabel)}</p>
              </td>
            </tr>
          </table>

          <div style="margin:0 auto 14px;max-width:420px;padding:12px 20px;background:#b45309;border-radius:10px;text-align:center;">
            <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;line-height:1.45;letter-spacing:0;">
              ${(0,t.escapeHtml)(l)}
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
                ${s}
              </td>
            </tr>
          </table>

          <p style="margin:0 auto 16px;max-width:560px;font-size:13px;line-height:1.95;color:#78350f;text-align:center;">
            ${(0,t.escapeHtml)(a.honorsMessage)}
          </p>

          <p style="margin:0 0 22px;font-size:11px;color:#92400e;text-align:center;line-height:1.6;">
            الحد الأدنى لشهادة التقدير: ${a.honorsMinAverage}%
          </p>

          <table style="width:100%;max-width:460px;margin:0 auto;border-collapse:collapse;">
            <tr>
              <td style="width:50%;border-top:2px solid rgba(180,83,9,0.45);padding-top:10px;text-align:center;vertical-align:top;">
                <p style="margin:0;font-size:11px;color:#78350f;line-height:1.5;">مدير/ة المدرسة</p>
              </td>
              <td style="width:50%;border-top:2px solid rgba(180,83,9,0.45);padding-top:10px;text-align:center;vertical-align:top;">
                <p style="margin:0;font-size:11px;color:#78350f;line-height:1.5;">تاريخ الإصدار: ${d}</p>
              </td>
            </tr>
          </table>

        </div>
      </div>

      ${(0,t.buildPdfBrandedFooterHtml)(r)}
    </div>
  `}async function a({certificate:e,config:i,schoolName:r="مدرسة غَزتنا"}){let n=await (0,t.loadSchoolLogoDataUrl)(),l=(0,t.formatExportDate)(),o="border:1px solid #d4d4d4;background:#f8fafc;padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#111;",d="border:1px solid #e5e7eb;padding:10px 12px;font-size:12px;color:#111;vertical-align:middle;text-align:right;",s=e.subjects.map(e=>{var i,a,r;let n=null==e.percent?"color:#888;font-weight:600;":e.percent>=50?"color:#16a34a;font-weight:700;":"color:#ea6622;font-weight:700;";return`<tr>
        <td style="${d}font-weight:600;">${(0,t.escapeHtml)(e.subject)}</td>
        <td style="${d}">${i=e.score,a=e.maxScore,null==i||null==a?"—":`${i}/${a}`}</td>
        <td style="${d}${n}">${null==(r=e.percent)?"—":`${r.toFixed(2)}%`}</td>
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
                src="${n}"
                alt="شعار المدرسة"
                style="height:76px;width:auto;max-width:130px;object-fit:contain;display:block;"
              />
            </td>
            <td style="vertical-align:middle;text-align:right;">
              <p style="margin:0 0 4px;font-size:12px;color:#666;">${(0,t.escapeHtml)(r)}</p>
              <h1 style="margin:0;font-size:24px;font-weight:800;color:#111111;line-height:1.35;">${(0,t.escapeHtml)(i.certificateTitle)}</h1>
              <p style="margin:6px 0 0;font-size:12px;color:#666;line-height:1.5;">${(0,t.escapeHtml)(e.periodLabel)}</p>
              <p style="margin:4px 0 0;font-size:12px;color:#666;line-height:1.5;">تاريخ الإصدار: ${l}</p>
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
              <th style="${o}">المادة</th>
              <th style="${o}">العلامة</th>
              <th style="${o}">النسبة من 100%</th>
            </tr>
          </thead>
          <tbody>
            ${s||`<tr><td colspan="3" style="${d}text-align:center;color:#666;">لا توجد مواد مسندة.</td></tr>`}
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

      ${(0,t.buildPdfBrandedFooterHtml)(r)}
    </div>
  `}async function r(e){return(0,t.mountPdfElement)(await i(e))}async function n(e){let i=await r(e),a=e.certificate.studentName.replace(/[\\/:*?"<>|]/g,"-").trim()||"طالب";await (0,t.exportHTMLElementToPdf)(i,`شهادة_تقدير_${a}_${(0,t.formatExportDate)()}.pdf`)}async function l(e){return(0,t.mountPdfElement)(await a(e))}async function o(e){let i=await l(e),a=e.certificate.studentName.replace(/[\\/:*?"<>|]/g,"-").trim()||"طالب";await (0,t.exportHTMLElementToPdf)(i,`شهادة_علامات_${a}_${(0,t.formatExportDate)()}.pdf`)}e.s(["buildHonorsCertificateHtml",0,i,"buildStudentCertificateHtml",0,a],7179),e.s(["exportHonorsCertificatePdf",0,n],72489),e.s(["exportStudentCertificatePdf",0,o],25249)},58130,e=>{"use strict";var t=e.i(43476),i=e.i(71645),a=e.i(28762),r=e.i(60649),n=e.i(48752),l=e.i(7179),o=e.i(72489),d=e.i(76358),s=e.i(38411);async function c({preview:e,decisions:t,schoolName:i="مدرسة غَزتنا",title:a="معاينة نتائج نهاية السنة",passedLabel:r="ناجح",failedLabel:n="راسب",hideDecisionColumns:l=!1}){let o=await (0,d.loadSchoolLogoDataUrl)(),u=(0,d.formatExportDate)(),p="border:1px solid #d4d4d4;background:#f5f5f5;padding:8px 10px;text-align:right;font-size:11px;font-weight:700;color:#111;",f="border:1px solid #d4d4d4;padding:8px 10px;font-size:11px;color:#111;vertical-align:middle;text-align:right;",m=(l?[{label:r,value:e.summary.passed},{label:n,value:e.summary.failed}]:[{label:"ناجح",value:e.summary.passed},{label:"راسب",value:e.summary.failed},{label:"ترفيع",value:e.summary.promote},{label:"إعادة",value:e.summary.repeat},{label:"تخرّج",value:e.summary.graduate},{label:"بانتظار قرار",value:e.summary.pending}]).map(e=>`
      <div style="flex:1;min-width:90px;border:1px solid #ececec;border-radius:10px;padding:10px;text-align:center;background:#fffdf8;">
        <p style="margin:0;font-size:18px;font-weight:700;color:#111;">${e.value}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#666;">${(0,d.escapeHtml)(e.label)}</p>
      </div>`).join(""),g=e.students.map(e=>{let i,a=(i=t?.[e.studentId])&&"pending"!==i?i:"pending"!==e.finalAction?e.finalAction:e.yearPassed?"promote":"repeat";return`<tr>
        <td style="${f}font-weight:600;">${(0,d.escapeHtml)(e.name)}<br/><span style="color:#888;font-size:10px;">${(0,d.escapeHtml)(e.studentNumber||"—")}</span></td>
        <td style="${f}">${(0,d.escapeHtml)(`${e.currentGrade} ${e.currentSection}`.trim())}</td>
        <td style="${f}${e.yearPassed?"color:#16a34a;font-weight:700;":"color:#ea6622;font-weight:700;"}">${e.yearPassed?(0,d.escapeHtml)(r):(0,d.escapeHtml)(n)}</td>
        ${l?"":`<td style="${f}font-weight:600;">${(0,d.escapeHtml)("pending"===a?"بانتظار قرار":s.promotionActionLabels[a]??a)}</td>
        <td style="${f}">${(0,d.escapeHtml)(e.proposedGrade)}</td>`}
      </tr>`}).join("");return(0,d.mountPdfElement)(`
    <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#ffffff;color:#111111;width:746px;">
      ${(0,d.buildPdfBrandedHeaderHtml)({logoDataUrl:o,schoolName:i,title:a,lines:[`السنة الدراسية: ${e.academicYearName}`,e.termName?`الفصل: ${e.termName}`:"",`تاريخ التصدير: ${u}`].filter(Boolean)})}

      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px;">${m}</div>

      <h2 style="margin:0 0 10px;font-size:15px;font-weight:700;color:#111;">ملخص الطلاب</h2>
      <table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-bottom:22px;">
        <thead>
          <tr>
            <th style="${p}">الطالب</th>
            <th style="${p}">الصف</th>
            <th style="${p}">الحالة</th>
            ${l?"":`<th style="${p}">القرار</th>
            <th style="${p}">الصف المقترح</th>`}
          </tr>
        </thead>
        <tbody>${g}</tbody>
      </table>

      ${(0,d.buildPdfBrandedFooterHtml)(i)}
    </div>
  `)}async function u(e){let t=await c(e),i=e.preview.academicYearName.replace(/[\\/:*?"<>|]/g,"-").trim()||"سنة",a=e.preview.termName?.replace(/[\\/:*?"<>|]/g,"-").trim(),r="term"===e.preview.scope?"نتائج_نهاية_الفصل":"نتائج_نهاية_السنة",n=a?`${i}_${a}`:i;await (0,d.exportHTMLElementToPdf)(t,`${r}_${n}_${(0,d.formatExportDate)()}.pdf`)}var p=e.i(25249),f=e.i(57582);let m=(0,i.createContext)(null);e.s(["AcademicAdminProvider",0,function({children:e}){let{grades:d,subjects:c,loading:g}=(0,r.useSchool)(),[x,h]=(0,i.useState)([]),[b,y]=(0,i.useState)(!0),[w,v]=(0,i.useState)(""),[S,$]=(0,i.useState)(""),[P,A]=(0,i.useState)([]),[T,C]=(0,i.useState)([]),[D,H]=(0,i.useState)(!1),[E,z]=(0,i.useState)({}),[M,N]=(0,i.useState)({}),[j,Y]=(0,i.useState)({}),[L,F]=(0,i.useState)(""),[_,k]=(0,i.useState)(""),[I,O]=(0,i.useState)(!1),[q,R]=(0,i.useState)(!1),[G,U]=(0,i.useState)({name:"",startDate:"",endDate:""}),[B,W]=(0,i.useState)(null),[J,K]=(0,i.useState)(""),[V,X]=(0,i.useState)(""),[Q,Z]=(0,i.useState)(null),[ee,et]=(0,i.useState)(""),[ei,ea]=(0,i.useState)(""),[er,en]=(0,i.useState)(null),[el,eo]=(0,i.useState)({}),[ed,es]=(0,i.useState)(!1),[ec,eu]=(0,i.useState)(!1),[ep,ef]=(0,i.useState)(""),[em,eg]=(0,i.useState)({}),[ex,eh]=(0,i.useState)(f.DEFAULT_SCHOOL_NAME),[eb,ey]=(0,i.useState)(!1),[ew,ev]=(0,i.useState)(null),[eS,e$]=(0,i.useState)(!1),[eP,eA]=(0,i.useState)(!1),[eT,eC]=(0,i.useState)(""),[eD,eH]=(0,i.useState)({}),[eE,ez]=(0,i.useState)(!1),[eM,eN]=(0,i.useState)(null),[ej,eY]=(0,i.useState)((0,f.defaultCertificateConfig)()),[eL,eF]=(0,i.useState)(!1),[e_,ek]=(0,i.useState)(!1),[eI,eO]=(0,i.useState)(!1),[eq,eR]=(0,i.useState)(""),[eG,eU]=(0,i.useState)(!1),[eB,eW]=(0,i.useState)(!1),[eJ,eK]=(0,i.useState)(null),[eV,eX]=(0,i.useState)(!1),[eQ,eZ]=(0,i.useState)({}),[e0,e1]=(0,i.useState)(""),[e2,e4]=(0,i.useState)(null),[e6,e8]=(0,i.useState)(null),[e5,e7]=(0,i.useState)(!1),[e3,e9]=(0,i.useState)([]),[te,tt]=(0,i.useState)(!1),[ti,ta]=(0,i.useState)(!1),tr=(0,i.useRef)(""),tn=(0,i.useMemo)(()=>x.find(e=>e.id===S)??null,[x,S]),tl=(0,i.useMemo)(()=>(0,f.getActiveCertificateTerm)(tn),[tn]),to=(0,i.useMemo)(()=>[{value:"",label:"اختر الفصل"},...e3.length>0?e3.map(e=>({value:e.id,label:(0,f.getTermDisplayName)(e)})):tn?.terms.map(e=>({value:e.id,label:(0,f.getTermDisplayName)(e)}))??[]],[tn,e3]),td=(0,i.useMemo)(()=>[{value:"promote",label:"ترفيع"},{value:"repeat",label:"إعادة الصف"},{value:"graduate",label:"تخرّج"}],[]),ts=(0,i.useCallback)(async()=>{H(!0);try{let e=await a.api.getAdminGrades(),t=(0,n.mapGrades)(e).sort((e,t)=>(e.sortOrder??0)-(t.sortOrder??0));C(t);let i=(0,f.buildPolicyDraftsFromGrades)(t);z(i),N((0,f.buildPassMinimumCountInputs)(i))}catch{C([]),z({}),N({})}finally{H(!1)}},[]),tc=(0,i.useCallback)(async()=>{y(!0),v("");try{let e=(await a.api.getAdminAcademicYears()).map(s.mapAcademicYear);h(e),$(t=>t||e.find(e=>e.isActive)?.id||e[0]?.id||"")}catch{v("تعذر تحميل السنوات الدراسية"),h([])}finally{y(!1)}},[]);async function tu(){if(tn){ek(!0),eO(!1),v("");try{let e=(0,s.mapCertificateConfig)(await a.api.updateAdminCertificateConfig(tn.id,{issuanceScope:ej.issuanceScope,certificateTitle:ej.certificateTitle,honorsEnabled:ej.honorsEnabled,honorsMinAverage:ej.honorsMinAverage,honorsTitle:ej.honorsTitle,honorsMessage:ej.honorsMessage}));eN(e),eY(e),eO(!0)}catch{v("تعذر حفظ إعدادات الشهادات")}finally{ek(!1)}}}async function tp(){if(tn){if("term"===ej.issuanceScope&&!tl)return void v("لا يوجد فصل دراسي نشط حالياً. عيّن الفصل الحالي من إعدادات الفصول الدراسية أولاً.");if(window.confirm("سيتم نشر الشهادات للطلاب وأولياء الأمور. هل تريد المتابعة؟")){eU(!0),v(""),eR("");try{let e=(0,s.mapCertificateConfig)(await a.api.publishAdminCertificates(tn.id,"term"===ej.issuanceScope?{termId:tl?.id}:void 0));eN(e),eY(e),eR("term"===ej.issuanceScope&&tl?`تم إصدار ونشر شهادات ${(0,f.getTermDisplayName)(tl)} بنجاح. يمكن لأولياء الأمور الاطلاع عليها من صفحة \xabالشهادات\xbb.`:"تم إصدار ونشر شهادات السنة الدراسية بنجاح. يمكن لأولياء الأمور الاطلاع عليها من صفحة «الشهادات».")}catch{v("تعذر إصدار الشهادات"),eR("")}finally{eU(!1)}}}}async function tf(){if(tn&&window.confirm("سيتم إخفاء الشهادات عن الطلاب. هل أنت متأكد؟")){eW(!0),v("");try{let e=(0,s.mapCertificateConfig)(await a.api.unpublishAdminCertificates(tn.id));eN(e),eY(e)}catch{v("تعذر إلغاء نشر الشهادات")}finally{eW(!1)}}}async function tm(){if(tn){if("term"===ej.issuanceScope&&!tl)return void v("لا يوجد فصل دراسي نشط حالياً. عيّن الفصل الحالي من إعدادات الفصول الدراسية أولاً.");eX(!0),v("");try{let e=(0,s.mapCertificatePreview)(await a.api.getAdminCertificatePreview(tn.id,{issuanceScope:ej.issuanceScope,certificateTitle:ej.certificateTitle,honorsEnabled:ej.honorsEnabled,honorsMinAverage:ej.honorsMinAverage,honorsTitle:ej.honorsTitle,honorsMessage:ej.honorsMessage,..."term"===ej.issuanceScope?{termId:tl?.id}:{}}));eK(e),eZ({})}catch{v("تعذر تحميل معاينة الشهادات")}finally{eX(!1)}}}async function tg(e,t){if(!eJ)return;let i=eJ.students.find(t=>t.studentId===e);if(!i||"regular"===t&&null==i.averagePercent||"honors"===t&&!i.qualifiesHonors)return;let a="honors"===t?`${eJ.config.honorsTitle} — ${i.studentName}`:`${eJ.config.certificateTitle} — ${i.studentName}`;e4({studentId:e,kind:t,title:a}),e8(null),e7(!0),v("");try{let e={certificate:i,config:eJ.config,schoolName:ex},a="honors"===t?await (0,l.buildHonorsCertificateHtml)(e):await (0,l.buildStudentCertificateHtml)(e);e8(a)}catch{v("honors"===t?"تعذر معاينة شهادة التقدير":"تعذر معاينة شهادة العلامات"),e4(null)}finally{e7(!1)}}async function tx(e,t){if(!eJ)return;let i=eJ.students.find(t=>t.studentId===e);if(i&&("honors"!==t||i.qualifiesHonors)){e1(`${e}-${t}`),v("");try{"honors"===t?await (0,o.exportHonorsCertificatePdf)({certificate:i,config:eJ.config,schoolName:ex}):await (0,p.exportStudentCertificatePdf)({certificate:i,config:eJ.config,schoolName:ex})}catch{v("honors"===t?"تعذر تحميل شهادة التقدير":"تعذر تحميل شهادة العلامات")}finally{e1("")}}}async function th(){let e=G.name.trim();if(!e)return void v("أدخل اسم السنة الدراسية");if(!G.startDate)return void v("أدخل تاريخ بداية السنة الدراسية");if(!G.endDate)return void v("أدخل تاريخ نهاية السنة الدراسية");if(G.endDate<G.startDate)return void v("تاريخ النهاية يجب أن يكون بعد تاريخ البداية");O(!0),v("");try{let t=await a.api.createAdminAcademicYear({name:e,startDate:G.startDate,endDate:G.endDate,status:"draft",isActive:!1}),i=(0,s.mapAcademicYear)(t);h(e=>[i,...e]),$(i.id),R(!1)}catch{v("تعذر إنشاء سنة دراسية جديدة")}finally{O(!1)}}async function tb(){if(B){K(B.id),X("");try{await a.api.deleteAdminAcademicYear(B.id);let e=x.filter(e=>e.id!==B.id);if(h(e),S===B.id){let t=(0,f.isArchivedAcademicYear)(B)?e.filter(f.isArchivedAcademicYear):e.filter(e=>!(0,f.isArchivedAcademicYear)(e));$(t[0]?.id??"")}W(null)}catch(e){X(e instanceof Error?e.message:"تعذر حذف السنة الدراسية")}finally{K("")}}}async function ty(e){et(e),v("");try{let t=(0,s.mapAcademicYear)(await a.api.setAdminAcademicYearActive(e));h(e=>e.map(e=>e.id===t.id?t:{...e,isActive:!1,status:"archived"})),$(t.id)}catch{v("تعذر تفعيل السنة الدراسية")}finally{et("")}}async function tw(e,t){ea(t),v("");try{let i=(0,s.mapAcademicYear)(await a.api.setAdminAcademicCurrentTerm(e,t));h(e=>e.map(e=>e.id===i.id?i:e)),e9((0,f.cloneTerms)(i.terms))}catch{v("تعذر تعيين الفصل الحالي")}finally{ea("")}}function tv(e,t){z(i=>({...i,[e]:{...i[e]??(0,f.defaultPolicy)(),...t}})),k("")}async function tS(){if(!tn||te)return;let e=(0,f.validateAcademicTerms)(tn,(0,f.reindexTerms)(e3));if(e)return void v(e);tt(!0),ta(!1),v("");try{let e=(0,s.mapAcademicYear)(await a.api.updateAdminAcademicYear(tn.id,{terms:(0,f.reindexTerms)(e3).map(e=>({id:e.id.startsWith("new-")?"":e.id,name:e.name.trim(),sortOrder:e.sortOrder,startDate:e.startDate,endDate:e.endDate,isCurrent:e.isCurrent}))}));h(t=>t.map(t=>t.id===e.id?e:t)),e9((0,f.cloneTerms)(e.terms)),tr.current=e.id,ta(!0)}catch(e){v((0,a.formatClientFetchError)(e,"تعذر حفظ الفصول الدراسية"))}finally{tt(!1)}}async function t$(e){if(0!==e.length){F("__batch__"),k(""),v("");try{let t=await Promise.all(e.map(async e=>{let t=E[e]??(0,f.defaultPolicy)(),i=Math.max(1,Number(M[e])||1),r=(0,f.maxRequiredSubjectsForPolicy)({...t,passMinimumCount:i},String(i)),l={...t,passMinimumCount:i,requiredSubjects:(0,f.trimRequiredSubjects)(t.requiredSubjects,r),evaluationScope:"single_term"};return tv(e,l),(0,n.mapGrade)(await a.api.updateAdminGradePromotionPolicy(e,l))})),i=new Map(t.map(e=>[e.id,e]));C(e=>e.map(e=>i.get(e.id)??e)),z(e=>{let i={...e};for(let e of t)i[e.id]=e.promotionPolicy?{...e.promotionPolicy}:i[e.id];return i}),N(e=>{let i={...e};for(let e of t)i[e.id]=String(e.promotionPolicy?.passMinimumCount??1);return i}),k("__batch__")}catch{v("تعذر حفظ سياسات الترفيع")}finally{F("")}}}async function tP(e){await t$([e])}async function tA(e){F(e),k(""),v("");try{let t=(0,n.mapGrade)(await a.api.resetAdminGradePromotionPolicy(e));C(e=>e.map(e=>e.id===t.id?t:e));let i=t.promotionPolicy?{...t.promotionPolicy}:(0,f.defaultPolicy)();z(t=>({...t,[e]:i})),N(t=>({...t,[e]:String(i.passMinimumCount)})),Y(t=>({...t,[e]:""}))}catch{v("تعذر حذف سياسة الترفيع")}finally{F("")}}async function tT(){if(er){ey(!0),v("");try{await u({preview:er,decisions:el,schoolName:ex})}catch{v("تعذر تصدير ملف PDF")}finally{ey(!1)}}}async function tC(){if(!ew)return;let e=(0,f.resolveTermLabelFromYear)(tn,ew.termId,ew.termName);ez(!0),v("");try{await u({preview:ew,schoolName:ex,title:`معاينة نهاية ${e}`,passedLabel:"ناجح في الفصل",failedLabel:"راسب في الفصل",hideDecisionColumns:!0})}catch{v("تعذر تصدير ملف PDF")}finally{ez(!1)}}function tD(){return Object.entries(el).filter(([,e])=>e&&"pending"!==e).map(([e,t])=>({studentId:e,action:t}))}async function tH(){if(tn){es(!0),v(""),ef("");try{let e=tD(),t=await a.api.getAdminPromotionPreview(tn.id,e.length?e:void 0),i=(0,s.mapPromotionPreview)(t),r={};for(let e of i.students)e.needsReview&&(r[e.studentId]=e.yearPassed?"promote":"repeat");if(eo(r),Object.keys(r).length>0){let e=(0,s.mapPromotionPreview)(await a.api.getAdminPromotionPreview(tn.id,Object.entries(r).map(([e,t])=>({studentId:e,action:t}))));en(e)}else en(i)}catch(e){v(e instanceof Error?e.message:"تعذر تحميل معاينة الترفيع")}finally{es(!1)}}}async function tE(){if(tn){e$(!0),v(""),eC("");try{let e=await a.api.getAdminTermEndPreview(tn.id);ev((0,s.mapPromotionPreview)(e))}catch(e){v(e instanceof Error?e.message:"تعذر تحميل معاينة نهاية الفصل")}finally{e$(!1)}}}async function tz(){if(!tn||!ew)return;let e=(0,f.resolveTermLabelFromYear)(tn,ew.termId,ew.termName),t=ew.nextTermName?(0,f.resolveTermLabelFromYear)(tn,ew.nextTermId,ew.nextTermName):"",i=ew.nextTermActivatesImmediately?t?` وتفعيل \xab${t}\xbb فوراً`:"":t&&ew.nextTermStartDate?`. \xab${t}\xbb يُفعَّل تلقائياً بتاريخ ${ew.nextTermStartDate}`:"";if(window.confirm(`سيتم إغلاق \xab${e}\xbb ونشر شهادات الفصل${i}. هل أنت متأكد؟`)){eA(!0),v(""),eC("");try{let t=await a.api.executeAdminTermEnd(tn.id,{termId:ew.termId??void 0,publishCertificates:!0}),i=t.academicYear;if(i){let e=(0,s.mapAcademicYear)(i);h(t=>t.map(t=>t.id===e.id?e:t)),e9((0,f.cloneTerms)(e.terms))}let r=t.nextTerm,n=!!(r?.activated??ew.nextTermActivatesImmediately);if(ew.nextTermName){let t=(0,f.resolveTermLabelFromYear)(tn,ew.nextTermId,ew.nextTermName);eC(n?`تم إغلاق \xab${e}\xbb بنجاح. الفصل الحالي الآن: ${t}`:`تم إغلاق \xab${e}\xbb بنجاح. سيبدأ \xab${t}\xbb تلقائياً في ${r?.startDate??ew.nextTermStartDate??"تاريخ بدايته"}.`)}else eC(`تم إغلاق \xab${e}\xbb بنجاح.`);ev(null),await tc()}catch(e){v(e instanceof Error?e.message:"تعذر تنفيذ نهاية الفصل")}finally{eA(!1)}}}async function tM(){if(tn&&er&&window.confirm("سيتم أرشفة السنة الحالية وترفيع/إعادة الطلاب دون إنشاء سنة جديدة. أنشئ السنة التالية يدوياً من السنوات الدراسية. هل أنت متأكد؟")){eu(!0),v(""),ef("");try{let e=tD();await a.api.executeAdminYearRollover(tn.id,{decisions:e,publishCertificates:!0}),ef("تم تنفيذ نهاية السنة بنجاح: شهادة نهاية السنة (معدل جميع الفصول) وشهادة التقدير للمؤهلين. أُرشفت السنة — أنشئ السنة الدراسية الجديدة من قسم السنوات الدراسية."),en(null),eo({}),await tc()}catch(e){v(e instanceof Error?e.message:"تعذر تنفيذ نهاية السنة")}finally{eu(!1)}}}return(0,i.useEffect)(()=>{tc(),a.api.getSiteSettings().then(e=>{let t=e.hero?.schoolName?.trim();t&&eh(t)}).catch(()=>{})},[tc]),(0,i.useEffect)(()=>{if(d.length){let e=[...d].sort((e,t)=>(e.sortOrder??0)-(t.sortOrder??0));C(e);let t=(0,f.buildPolicyDraftsFromGrades)(e);z(t),N((0,f.buildPassMinimumCountInputs)(t));return}g||ts()},[d,g,ts]),(0,i.useEffect)(()=>{c.length?A(c.map(e=>({id:String(e.id),name:String(e.name),teacherCount:Number(e.teacherCount??0)}))):g||a.api.getAdminSubjects().then(e=>{A(e.map(e=>({id:String(e.id),name:String(e.name),teacherCount:Number(e.teacherCount??0)})))}).catch(()=>A([]))},[c,g]),(0,i.useEffect)(()=>{let e=x.find(e=>e.id===S)??null,t=tr.current!==S;e?(t&&(e9((0,f.cloneTerms)(e.terms)),tr.current=S,ta(!1)),Y({}),k("")):S||(e9([]),tr.current=""),t&&(en(null),eo({}),eg({}),ef(""),eN(null),eY((0,f.defaultCertificateConfig)()),eO(!1),eR(""),eK(null),eZ({}))},[S,x]),(0,i.useEffect)(()=>{tn&&(eF(!0),a.api.getAdminCertificateConfig(tn.id).then(e=>{let t=(0,s.mapCertificateConfig)(e);eN(t),eY(t)}).catch(()=>{eN(null),eY((0,f.defaultCertificateConfig)())}).finally(()=>eF(!1)))},[tn]),(0,t.jsx)(m.Provider,{value:{years:x,loading:b,error:w,setError:v,selectedYearId:S,setSelectedYearId:$,selectedYear:tn,subjects:P,grades:T,loadingGrades:D,policyDraftsByGradeId:E,passMinimumCountInputs:M,requiredSubjectPickers:j,savingPolicyGradeId:L,savedPolicyGradeId:_,creatingYear:I,createYearOpen:q,setCreateYearOpen:R,createYearForm:G,setCreateYearForm:U,deleteYearTarget:B,setDeleteYearTarget:W,deletingYearId:J,deleteYearError:V,setDeleteYearError:X,deleteTermTarget:Q,setDeleteTermTarget:Z,activatingYearId:ee,settingTermId:ei,preview:er,decisions:el,loadingPreview:ed,executingRollover:ec,rolloverSuccess:ep,expandedStudentIds:em,schoolName:ex,exportingPdf:eb,termPreview:ew,loadingTermPreview:eS,executingTermEnd:eP,termEndSuccess:eT,expandedTermStudentIds:eD,exportingTermPdf:eE,certificateConfig:eM,certificateDraft:ej,setCertificateDraft:eY,activeCertificateTerm:tl,loadingCertificate:eL,savingCertificate:e_,certificateSaved:eI,certificatePublishSuccess:eq,publishingCertificates:eG,unpublishingCertificates:eB,certificatePreview:eJ,loadingCertificatePreview:eV,expandedCertificateStudentIds:eQ,exportingCertificateStudentId:e0,certificateVisualPreview:e2,certificatePreviewHtml:e6,loadingCertificateVisualPreview:e5,termsDraft:e3,savingTerms:te,termsSaved:ti,termSelectOptions:to,promotionDecisionOptions:td,openCreateYearDialog:function(){U((0,f.suggestNewYearForm)(x)),v(""),R(!0)},handleCreateYearSubmit:th,handleDeleteYear:tb,handleSetActive:ty,handleSetCurrentTerm:tw,updateTermDraft:function(e,t){e9(i=>i.map(i=>i.id===e?{...i,...t}:i)),ta(!1)},handleAddTerm:function(){if(!tn)return;let e=`new-${Date.now()}`;e9(t=>{let i=t.length+1,{startDate:a,endDate:r}=(0,f.suggestedTermDates)(tn,t);return[...t,{id:e,academicYearId:tn.id,name:(0,f.defaultTermName)(i),sortOrder:i,startDate:a,endDate:r,isCurrent:0===t.length,isClosed:!1,closedAt:null}]}),ta(!1)},handleRemoveTerm:function(e){e9(t=>{let i=t.find(t=>t.id===e),a=(0,f.reindexTerms)(t.filter(t=>t.id!==e));return i?.isCurrent&&a.length>0&&(a[0]={...a[0],isCurrent:!0}),a}),ta(!1)},updateGradePolicyDraft:tv,addRequiredSubject:function(e){let t=(j[e]??"").trim(),i=E[e]??(0,f.defaultPolicy)(),a=(0,f.maxRequiredSubjectsForPolicy)(i,M[e]);!t||i.requiredSubjects.includes(t)||null!=a&&i.requiredSubjects.length>=a||(tv(e,{requiredSubjects:[...i.requiredSubjects,t]}),Y(t=>({...t,[e]:""})))},removeRequiredSubject:function(e,t){let i=E[e]??(0,f.defaultPolicy)();tv(e,{requiredSubjects:i.requiredSubjects.filter(e=>e!==t)})},handleSaveTerms:tS,handleSaveGradePolicy:tP,handleSaveGradePolicies:t$,handleResetGradePolicy:tA,subjectPickerOptions:function(e){let t=E[e]??(0,f.defaultPolicy)();return[{value:"",label:P.length?"اختر مادة":"لا توجد مواد مسجّلة"},...P.filter(e=>!t.requiredSubjects.includes(e.name)).map(e=>({value:e.name,label:e.name}))]},toggleStudentExpanded:function(e){eg(t=>({...t,[e]:!t[e]}))},handleExportPdf:tT,handleLoadPreview:tH,handleExecuteRollover:tM,handleLoadTermPreview:tE,handleExecuteTermEnd:tz,handleExportTermPdf:tC,toggleTermStudentExpanded:function(e){eH(t=>({...t,[e]:!t[e]}))},setStudentDecision:function(e,t){eo(i=>({...i,[e]:t}))},actionBadgeVariant:function(e){return"promote"===e?"success":"graduate"===e?"info":"repeat"===e?"warning":"danger"},handleSaveCertificateConfig:tu,handlePublishCertificates:tp,handleUnpublishCertificates:tf,handleLoadCertificatePreview:tm,toggleCertificateStudentExpanded:function(e){eZ(t=>({...t,[e]:!t[e]}))},handlePreviewCertificate:tg,closeCertificateVisualPreview:function(){e4(null),e8(null),e7(!1)},handleDownloadPreviewCertificate:tx,setPassMinimumCountInputs:N,setRequiredSubjectPickers:Y},children:e})},"useAcademicAdmin",0,function(){let e=(0,i.useContext)(m);if(!e)throw Error("useAcademicAdmin must be used within AcademicAdminProvider");return e}],58130)}]);