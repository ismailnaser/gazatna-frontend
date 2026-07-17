module.exports=[11285,a=>{"use strict";var b=a.i(15388);let c=["الأول","الثاني","الثالث","الرابع","الخامس","السادس"];function d(a){let b=c[a-1]??String(a);return`الفصل ${b}`}let e=/^T\d+$/i;function f(a){if(!a)return"—";if(a.displayName?.trim())return a.displayName.trim();let b=a.name.trim();return!b||e.test(b)?d(a.sortOrder):b}function g(a,b){let c=/^(\d{4})-(\d{2})-(\d{2})/.exec(a.trim());if(!c)return a;let d=new Date(Number(c[1]),Number(c[2])-1,Number(c[3]));d.setDate(d.getDate()+b);let e=d.getFullYear(),f=String(d.getMonth()+1).padStart(2,"0"),g=String(d.getDate()).padStart(2,"0");return`${e}-${f}-${g}`}let h=()=>({evaluationScope:"single_term",yearCalculationMethod:"term_average",evaluationTermId:null,passRule:"minimum_count",passMinimumCount:1,requiredSubjects:[],passScoreRatio:.5,passPromotionMode:"automatic",failHandlingMode:"manual_review"});function i(a,b){return"minimum_count"!==a.passRule?null:Math.max(1,Number(b||a.passMinimumCount)||1)}function j(a,b){return null==b?a:a.slice(0,b)}function k(a=new Date){return a.getFullYear()}function l(a){return`${a}/${a+1}`}function m(a){let b=Number(a.split("/")[0]);return{name:a,startDate:`${b}-09-01`,endDate:`${b+1}-06-30`}}function n(a,b=10,c=new Date){let d=new Set(a.map(a=>a.name.trim().replace("-","/"))),e=[],f=k(c);for(let a=0;a<=b;a+=1){let b=l(f+a);d.has(b)||e.push({value:b,label:b})}return e}function o(a){return"archived"===a.status}function p(a){return[...a.terms].sort((a,b)=>a.sortOrder-b.sortOrder)}function q(a){return a.terms.find(a=>a.isCurrent)??p(a)[0]??null}function r(a,b){let c=p(a);return c.length>0&&c[c.length-1].id===b.id}function s(a,b){for(let c of p(a)){if(c.id===b.id)break;if(!c.isClosed)return!1}return!0}a.s(["DEFAULT_SCHOOL_NAME",0,"مدرسة غَزتنا","academicYearFormFromLabel",0,m,"academicYearSelectOptions",0,n,"buildPassMinimumCountInputs",0,function(a){let b={};for(let[c,d]of Object.entries(a))b[c]=String(d.passMinimumCount);return b},"buildPolicyDraftsFromGrades",0,function(a){let b={};for(let c of a){let a=c.promotionPolicy?{...c.promotionPolicy}:h(),d=i(a,String(a.passMinimumCount));b[c.id]={...a,requiredSubjects:j(a.requiredSubjects,d)}}return b},"canUseTermEnd",0,function(a){let b=q(a);return!!b&&!b.isClosed&&!r(a,b)&&s(a,b)},"canUseYearEnd",0,function(a){let b=q(a);return!!b&&r(a,b)&&s(a,b)},"cloneTerms",0,function(a){return a.map(a=>({...a}))},"defaultCertificateConfig",0,()=>({academicYearId:"",issuanceScope:"term",isPublished:!1,publishedAt:null,publishedTermId:null,honorsEnabled:!0,honorsMinAverage:95,honorsTitle:"شهادة تقدير",honorsMessage:"تقديراً للتميز والاجتهاد، تُمنح هذه الشهادة اعترافاً بالمعدل العالي والأداء المتميز طوال الفترة الدراسية.",certificateTitle:"شهادة علامات",updatedAt:null}),"defaultPolicy",0,h,"defaultTermName",0,d,"formatCertificatePercent",0,function(a){return null==a?"—":`${a.toFixed(2)}%`},"getActiveCertificateTerm",0,function(a){if(!a)return null;let b=a.terms.find(a=>a.isCurrent);return b||(a.currentTermId?a.terms.find(b=>b.id===a.currentTermId)??null:null)},"getCurrentTerm",0,q,"getTermDisplayName",0,f,"isArchivedAcademicYear",0,o,"isGradePolicyConfigured",0,function(a){return!!a.promotionPolicy?.isConfigured},"isLastTermInYear",0,r,"isManageableAcademicYear",0,function(a){return!o(a)},"maxRequiredSubjectsForPolicy",0,i,"priorTermsAllClosed",0,s,"reindexTerms",0,function(a){return a.map((a,b)=>({...a,sortOrder:b+1}))},"resolveStudentDecision",0,function(a,b){let c=b[a.studentId];return c&&"pending"!==c?c:"pending"!==a.finalAction?a.finalAction:a.yearPassed?"promote":"repeat"},"resolveTermLabelFromYear",0,function(a,b,c){if(a&&b){let c=a.terms.find(a=>a.id===b);if(c)return f(c)}if(a&&c?.trim()){let b=a.terms.find(a=>a.name===c.trim());if(b)return f(b)}let g=c?.trim();return g?e.test(g)?d(Number(g.slice(1))||1):g:"—"},"sortedTerms",0,p,"suggestNewYearForm",0,function(a){let b=n(a);return b.length>0?m(b[0].value):m(l(k()))},"suggestedTermDates",0,function(a,b){let c=b[b.length-1];if(c){let b=g(c.endDate,1);return b>a.endDate?{startDate:a.endDate,endDate:a.endDate}:{startDate:b,endDate:a.endDate}}return{startDate:a.startDate,endDate:a.endDate}},"summarizePromotionPolicy",0,function(a){let c=b.passRuleLabels[a.passRule];return"minimum_count"===a.passRule?`${c}: ${a.passMinimumCount} مواد`:c},"trimRequiredSubjects",0,j,"validateAcademicTerms",0,function(a,b){if(0===b.length)return"يجب تحديد فصل دراسي واحد على الأقل";let c=[...b].sort((a,b)=>a.sortOrder-b.sortOrder);for(let b of c){let c=b.name.trim()||"الفصل";if(!b.name.trim())return"أدخل اسم كل فصل دراسي";if(b.endDate<b.startDate)return`تاريخ نهاية \xab${c}\xbb يجب أن يكون بعد تاريخ البداية`;if(b.startDate<a.startDate)return`بداية \xab${c}\xbb يجب أن تكون ضمن السنة الدراسية (${a.startDate} — ${a.endDate})`;if(b.endDate>a.endDate)return`نهاية \xab${c}\xbb يجب أن تكون ضمن السنة الدراسية (${a.startDate} — ${a.endDate})`}for(let a=1;a<c.length;a+=1){let b=c[a-1],d=c[a],e=b.name.trim()||"الفصل السابق",f=d.name.trim()||"الفصل";if(d.startDate<=b.endDate)return`\xab${f}\xbb يتداخل مع \xab${e}\xbb. يجب أن يبدأ في ${g(b.endDate,1)} أو بعده`}return null}])},17659,a=>{"use strict";function b(a){return a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function c(){let a=await fetch("/images/logo.png");if(!a.ok)throw Error("failed to load school logo");let b=await a.blob();return new Promise((a,c)=>{let d=new FileReader;d.onload=()=>a(String(d.result)),d.onerror=()=>c(Error("failed to read school logo")),d.readAsDataURL(b)})}async function d(a){let b=Array.from(a.querySelectorAll("img"));await Promise.all(b.map(a=>new Promise(b=>{a.complete&&a.naturalWidth>0?b():(a.addEventListener("load",()=>b(),{once:!0}),a.addEventListener("error",()=>b(),{once:!0}))})))}async function e(b,c){let[{default:e},{jsPDF:f}]=await Promise.all([a.A(93042),a.A(52143)]);document.body.appendChild(b);try{await d(b),await new Promise(a=>setTimeout(a,120));let a=await e(b,{scale:2,useCORS:!0,backgroundColor:"#ffffff",logging:!1,scrollX:0,scrollY:0,windowWidth:b.scrollWidth,windowHeight:b.scrollHeight});if(0===a.width||0===a.height)throw Error("empty canvas");let g=a.toDataURL("image/jpeg",.95),h=new f({unit:"mm",format:"a4",orientation:"portrait"}),i=h.internal.pageSize.getWidth(),j=h.internal.pageSize.getHeight(),k=i-20,l=a.height*k/a.width,m=l,n=10;for(h.addImage(g,"JPEG",10,n,k,l),m-=j-20;m>0;)h.addPage(),n=10-(l-m),h.addImage(g,"JPEG",10,n,k,l),m-=j-20;h.save(c)}finally{b.remove()}}a.s(["buildPdfBrandedFooterHtml",0,function(a="مدرسة غَزتنا"){return`
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
  `}async function e(a){return(0,b.mountPdfElement)(await c(a))}async function f(a){let c=await e(a),d=a.certificate.studentName.replace(/[\\/:*?"<>|]/g,"-").trim()||"طالب";await (0,b.exportHTMLElementToPdf)(c,`شهادة_تقدير_${d}_${(0,b.formatExportDate)()}.pdf`)}async function g(a){return(0,b.mountPdfElement)(await d(a))}async function h(a){let c=await g(a),d=a.certificate.studentName.replace(/[\\/:*?"<>|]/g,"-").trim()||"طالب";await (0,b.exportHTMLElementToPdf)(c,`شهادة_علامات_${d}_${(0,b.formatExportDate)()}.pdf`)}a.s(["buildHonorsCertificateHtml",0,c,"buildStudentCertificateHtml",0,d],13730),a.s(["exportHonorsCertificatePdf",0,f],28979),a.s(["exportStudentCertificatePdf",0,h],98969)}];

//# sourceMappingURL=src_1sun89f._.js.map