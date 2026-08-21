"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[7864],{28247:(t,e,i)=>{i.d(e,{Y:()=>p,c:()=>d});var a=i(56665);let o="var(--font-cairo),'Cairo',Tahoma,Arial,sans-serif",n="var(--font-kids),'Baloo Bhaijaan 2',Tahoma,Arial,sans-serif";function r(t=34,e="#F9B428"){return`<svg width="${t}" height="${t}" viewBox="0 0 58 58" fill="none" aria-hidden>
    <path d="M29 4l7 16 18 2-13 12 4 17-16-9-16 9 4-17-13-12 18-2z" fill="${e}" stroke="#EA6622" stroke-width="2.4" stroke-linejoin="round"/>
  </svg>`}function l(t,e="#424CF3"){return`
    <div style="position:relative;border:4px solid ${e};border-radius:28px 12px 28px 16px;background:#fff8ec;padding:10px;box-sizing:border-box;">
      <div style="position:relative;border:2px dashed #EA6622;border-radius:22px 10px 22px 12px;background:#ffffff;padding:22px 20px 18px;overflow:hidden;">
        <span style="position:absolute;top:10px;right:12px;opacity:.9;">${r(28)}</span>
        <span style="position:absolute;top:14px;left:14px;opacity:.9;">${function(t=40){return`<svg width="${t}" height="${Math.round(.78*t)}" viewBox="0 0 70 54" fill="none" aria-hidden>
    <path d="M8 8c18-8 36-8 54 0v38c-18-6-36-6-54 0z" fill="#4BC2FC" fill-opacity=".7" stroke="#424CF3" stroke-width="2.2"/>
    <path d="M35 6v42" stroke="#424CF3" stroke-width="2"/>
  </svg>`}(34)}</span>
        <span style="position:absolute;bottom:12px;right:16px;opacity:.85;">${function(t=52){return`<svg width="${t}" height="${Math.round(.28*t)}" viewBox="0 0 90 24" fill="none" aria-hidden>
    <rect x="8" y="6" width="58" height="12" rx="2" fill="#F9B428" stroke="#EA6622" stroke-width="1.8"/>
    <path d="M66 6l16 6-16 6z" fill="#1A1A1A"/>
    <rect x="0" y="6" width="10" height="12" rx="1" fill="#EA6622"/>
  </svg>`}(48)}</span>
        <span style="position:absolute;bottom:10px;left:14px;opacity:.9;">${r(22,"#4BC2FC")}</span>
        <div style="position:relative;z-index:1;">${t}</div>
      </div>
    </div>
  `}async function d({certificate:t,config:e,schoolName:i="مدرسة غَزتنا",honorsTitle:p}){let s=p?.trim()||e.honorsTitle,g=await (0,a.Ts)(),f=(0,a.gH)(),x=null!=t.averagePercent?`${t.averagePercent.toFixed(1)}%`:"—",c=`
    <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
      <tr>
        <td style="width:120px;vertical-align:middle;">
          <img src="${g}" alt="" style="height:64px;width:auto;max-width:120px;object-fit:contain;display:block;" />
        </td>
        <td style="vertical-align:middle;text-align:center;">
          <p style="margin:0;font-family:${n};font-size:15px;font-weight:800;color:#424CF3;">${(0,a.ZD)(i)}</p>
          <p style="margin:4px 0 0;font-size:12px;font-weight:700;color:#1a1a1a99;">${(0,a.ZD)(t.periodLabel)}</p>
        </td>
        <td style="width:56px;text-align:left;vertical-align:middle;">${function(t=42){return`<svg width="${t}" height="${t}" viewBox="0 0 48 48" fill="none" aria-hidden>
    <path d="M14 10h20v10c0 7-4.5 12-10 12s-10-5-10-12V10z" fill="#F9B428" stroke="#EA6622" stroke-width="2.2"/>
    <path d="M14 14H8c0 6 3 9 6 10M34 14h6c0 6-3 9-6 10" stroke="#424CF3" stroke-width="2.1" stroke-linecap="round"/>
    <rect x="20" y="32" width="8" height="5" rx="1" fill="#EA6622"/>
    <rect x="16" y="37" width="16" height="5" rx="2" fill="#424CF3"/>
  </svg>`}(48)}</td>
      </tr>
    </table>

    <div style="margin:12px auto 8px;max-width:460px;background:#F9B428;border:3px solid #1a1a1a14;border-radius:999px;padding:10px 18px;text-align:center;box-shadow:-4px 5px 0 0 rgba(234,102,34,.35);">
      <p style="margin:0;font-family:${n};font-size:26px;font-weight:800;color:#1a1a1a;line-height:1.35;">
        ${(0,a.ZD)(s)}
      </p>
    </div>

    <p style="margin:10px 0 6px;text-align:center;font-family:${n};font-size:15px;font-weight:800;color:#EA6622;">
      أحسنت… شهادة فخر
    </p>
    <p style="margin:0 auto 14px;max-width:480px;text-align:center;font-size:13px;line-height:1.7;color:#1a1a1acc;">
      تُمنح بكل حب وتقدير إلى النجم/ة
    </p>

    <div style="margin:0 auto 16px;max-width:520px;background:#fff8ec;border:3px solid #F9B428;border-radius:22px;padding:14px 16px;text-align:center;">
      <p style="margin:0;font-family:${n};font-size:30px;font-weight:800;color:#424CF3;line-height:1.3;">
        ${(0,a.ZD)(t.studentName)}
      </p>
      <p style="margin:8px 0 0;font-size:13px;font-weight:700;color:#1a1a1a99;">
        الصف ${(0,a.ZD)(t.gradeLevel||"—")}
        \xb7 الشعبة ${(0,a.ZD)(t.section||"—")}
        \xb7 رقم ${(0,a.ZD)(t.studentNumber||"—")}
      </p>
    </div>

    <div style="margin:0 auto 18px;text-align:center;">
      <span style="display:inline-block;vertical-align:middle;">${r(30)}</span>
      <div style="display:inline-block;width:158px;height:158px;margin:0 10px;border-radius:50%;background:#424CF3;color:#ffffff;vertical-align:middle;box-shadow:-5px 6px 0 0 rgba(249,180,40,.55);">
        <div style="display:table;width:100%;height:100%;">
          <div style="display:table-cell;vertical-align:middle;text-align:center;">
            <p style="margin:0;font-size:12px;font-weight:800;opacity:.88;">المعدل</p>
            <p style="margin:6px 0 0;font-family:${n};font-size:36px;font-weight:800;line-height:1;direction:ltr;">${x}</p>
          </div>
        </div>
      </div>
      <span style="display:inline-block;vertical-align:middle;">${r(30)}</span>
    </div>

    <p style="margin:0 auto 10px;max-width:540px;text-align:center;font-size:14px;line-height:1.9;font-weight:600;color:#1a1a1add;">
      ${(0,a.ZD)(e.honorsMessage)}
    </p>
    <p style="margin:0 0 18px;text-align:center;font-size:11px;font-weight:700;color:#EA6622;">
      الحد الأدنى لهذه الشهادة: ${e.honorsMinAverage}%
    </p>

    <table style="width:100%;max-width:480px;margin:0 auto;border-collapse:collapse;">
      <tr>
        <td style="width:50%;padding-top:10px;text-align:center;">
          <p style="margin:0 auto;width:70%;border-top:2px solid #424CF3;padding-top:8px;font-size:12px;font-weight:800;color:#424CF3;">مدير/ة المدرسة</p>
        </td>
        <td style="width:50%;padding-top:10px;text-align:center;">
          <p style="margin:0 auto;width:70%;border-top:2px solid #EA6622;padding-top:8px;font-size:12px;font-weight:800;color:#EA6622;">تاريخ الإصدار: ${f}</p>
        </td>
      </tr>
    </table>
  `;return`
    <div dir="rtl" style="font-family:${o};background:#ffffff;color:#1a1a1a;width:746px;">
      ${l(c,"#424CF3")}
      ${(0,a.xj)(i)}
    </div>
  `}async function p({certificate:t,config:e,schoolName:i="مدرسة غَزتنا"}){let d=await (0,a.Ts)(),s=(0,a.gH)(),g=`border:2px solid #fff;background:#424CF3;padding:10px 12px;text-align:right;font-size:12px;font-weight:800;color:#fff;font-family:${n};`,f="border:1px solid #ece7d8;padding:10px 12px;font-size:13px;color:#1a1a1a;vertical-align:middle;text-align:right;font-weight:600;",x=t.subjects.map((t,e)=>{var i,o,n;let r=null==t.percent?"color:#888;font-weight:700;":t.percent>=90?"color:#EA6622;font-weight:800;":t.percent>=50?"color:#2F9E44;font-weight:800;":"color:#ea6622;font-weight:800;";return`<tr style="background:${e%2==0?"#fffdf6":"#ffffff"};">
        <td style="${f}font-weight:800;">${(0,a.ZD)(t.subject)}</td>
        <td style="${f}">${i=t.score,o=t.maxScore,null==i||null==o?"—":`${i}/${o}`}</td>
        <td style="${f}${r}">${null==(n=t.percent)?"—":`${n.toFixed(2)}%`}</td>
      </tr>`}).join(""),c=null!=t.averagePercent?`<table style="width:100%;margin-top:16px;border-collapse:collapse;">
          <tr>
            <td style="padding:14px 16px;background:#fff8ec;border:3px solid #F9B428;border-radius:18px;vertical-align:middle;">
              <p style="margin:0;font-family:${n};font-size:14px;font-weight:800;color:#1a1a1a;">المعدل العام</p>
              <p style="margin:4px 0 0;font-size:12px;font-weight:700;color:#1a1a1a99;">${t.gradedSubjectsCount} من ${t.assignedSubjectsCount} مادة</p>
            </td>
            <td style="width:16px;"></td>
            <td style="width:150px;padding:14px 10px;background:#424CF3;border-radius:18px;text-align:center;vertical-align:middle;box-shadow:-4px 5px 0 0 rgba(249,180,40,.45);">
              <p style="margin:0;font-family:${n};font-size:28px;font-weight:800;color:#ffffff;direction:ltr;">${t.averagePercent.toFixed(1)}%</p>
            </td>
          </tr>
        </table>`:'<p style="margin-top:16px;text-align:center;color:#666;font-size:13px;">لا توجد علامات كافية لحساب المعدل.</p>',h=`
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
      <tr>
        <td style="width:120px;vertical-align:middle;">
          <img src="${d}" alt="" style="height:64px;width:auto;max-width:120px;object-fit:contain;display:block;" />
        </td>
        <td style="vertical-align:middle;text-align:right;">
          <p style="margin:0;font-family:${n};font-size:14px;font-weight:800;color:#424CF3;">${(0,a.ZD)(i)}</p>
          <h1 style="margin:4px 0 0;font-family:${n};font-size:26px;font-weight:800;color:#1a1a1a;line-height:1.3;">${(0,a.ZD)(e.certificateTitle)}</h1>
          <p style="margin:6px 0 0;font-size:12px;font-weight:700;color:#1a1a1a99;">${(0,a.ZD)(t.periodLabel)} \xb7 ${s}</p>
        </td>
        <td style="width:48px;text-align:left;vertical-align:top;">${r(32)}</td>
      </tr>
    </table>

    <table style="width:100%;border-collapse:separate;border-spacing:8px;margin-bottom:12px;">
      <tr>
        <td style="padding:12px;background:#fff8ec;border:2px solid #F9B42855;border-radius:16px;width:50%;">
          <span style="font-size:11px;font-weight:800;color:#EA6622;">اسم الطالب</span>
          <p style="margin:2px 0 0;font-family:${n};font-size:16px;font-weight:800;">${(0,a.ZD)(t.studentName)}</p>
        </td>
        <td style="padding:12px;background:#eef2ff;border:2px solid #424CF322;border-radius:16px;width:50%;">
          <span style="font-size:11px;font-weight:800;color:#424CF3;">رقم الطالب</span>
          <p style="margin:2px 0 0;font-size:16px;font-weight:800;direction:ltr;text-align:right;">${(0,a.ZD)(t.studentNumber||"—")}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:12px;background:#fff;border:2px solid #ece7d8;border-radius:16px;width:50%;">
          <span style="font-size:11px;font-weight:800;color:#1a1a1a88;">الصف</span>
          <p style="margin:2px 0 0;font-size:15px;font-weight:800;">${(0,a.ZD)(t.gradeLevel||"—")}</p>
        </td>
        <td style="padding:12px;background:#fff;border:2px solid #ece7d8;border-radius:16px;width:50%;">
          <span style="font-size:11px;font-weight:800;color:#1a1a1a88;">الشعبة</span>
          <p style="margin:2px 0 0;font-size:15px;font-weight:800;">${(0,a.ZD)(t.section||"—")}</p>
        </td>
      </tr>
    </table>

    <table style="width:100%;border-collapse:collapse;table-layout:fixed;border-radius:16px;overflow:hidden;">
      <thead>
        <tr>
          <th style="${g}">المادة</th>
          <th style="${g}">العلامة</th>
          <th style="${g}">النسبة</th>
        </tr>
      </thead>
      <tbody>
        ${x||`<tr><td colspan="3" style="${f}text-align:center;color:#666;">لا توجد مواد مسندة.</td></tr>`}
      </tbody>
    </table>

    ${c}

    <table style="width:100%;margin-top:22px;border-collapse:collapse;">
      <tr>
        <td style="width:50%;padding-top:8px;text-align:center;">
          <p style="margin:0 auto;width:60%;border-top:2px solid #424CF3;padding-top:8px;font-size:12px;font-weight:800;color:#424CF3;">توقيع الإدارة</p>
        </td>
        <td style="width:50%;padding-top:8px;text-align:center;">
          <p style="margin:0 auto;width:60%;border-top:2px solid #EA6622;padding-top:8px;font-size:12px;font-weight:800;color:#EA6622;">ختم المدرسة</p>
        </td>
      </tr>
    </table>
  `;return`
    <div dir="rtl" style="font-family:${o};background:#ffffff;color:#1a1a1a;width:746px;">
      ${l(h,"#EA6622")}
      ${(0,a.xj)(i)}
    </div>
  `}},33713:(t,e,i)=>{i.d(e,{Z:()=>n});var a=i(95155),o=i(40980);function n({children:t,className:e,padding:i="md",...r}){return(0,a.jsx)("div",{className:(0,o.cn)("rounded-[1.6rem_0.7rem_1.6rem_0.9rem] border-[3px] border-black/10 bg-white shadow-[-5px_6px_0_0_rgba(66,76,243,0.12)]",{none:"p-0",sm:"p-4",md:"p-5 sm:p-6"}[i],e),...r,children:t})}},35723:(t,e,i)=>{i.d(e,{V:()=>r});var a=i(28247),o=i(56665);async function n(t){return(0,o.sT)(await (0,a.Y)(t))}async function r(t){let e=await n(t),i=t.certificate.studentName.replace(/[\\/:*?"<>|]/g,"-").trim()||"طالب";await (0,o.nw)(e,`شهادة_علامات_${i}_${(0,o.gH)()}.pdf`)}},48188:(t,e,i)=>{i.d(e,{E:()=>r});var a=i(95155),o=i(40980);let n={default:"bg-neutral-100 text-neutral-600",success:"bg-p-green/10 text-p-green",warning:"bg-amber-50 text-amber-700",danger:"bg-p-red/10 text-p-red",info:"bg-p-green/10 text-p-green"};function r({children:t,variant:e="default",className:i}){return(0,a.jsx)("span",{className:(0,o.cn)("inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold",n[e],i),children:t})}},56665:(t,e,i)=>{function a(){let t=new Date,e=t=>String(t).padStart(2,"0");return`${t.getFullYear()}-${e(t.getMonth()+1)}-${e(t.getDate())}`}function o(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function n(){try{let t=await fetch(`${window.location.origin}/images/logo.png`);if(!t.ok)return"";let e=await t.blob();return await new Promise((t,i)=>{let a=new FileReader;a.onload=()=>t(String(a.result||"")),a.onerror=()=>i(Error("failed to read school logo")),a.readAsDataURL(e)})}catch{return""}}function r(t){let{logoDataUrl:e,title:i,schoolName:a,lines:n=[]}=t,r=a?`<p style="margin:0 0 4px;font-size:12px;color:#666;">${o(a)}</p>`:"",l=n.filter(Boolean).map(t=>`<p style="margin:4px 0 0;font-size:12px;color:#666;line-height:1.5;">${o(t)}</p>`).join("");return`
    <header style="display:flex;align-items:center;gap:20px;border-bottom:2px solid #424cf3;padding-bottom:16px;margin-bottom:18px;">
      ${e?`<img
        src="${e}"
        alt="شعار المدرسة"
        style="height:76px;width:auto;max-width:340px;object-fit:contain;display:block;flex-shrink:0;"
      />`:""}
      <div style="flex:1;min-width:0;text-align:right;">
        ${r}
        <h1 style="margin:0;font-family:var(--font-kids),'Baloo Bhaijaan 2',Tahoma,Arial,sans-serif;font-size:22px;font-weight:800;color:#111111;line-height:1.35;">${o(i)}</h1>
        ${l}
      </div>
    </header>
  `}function l(t="مدرسة غَزتنا"){return`
    <footer style="margin-top:24px;padding-top:12px;border-top:1px solid #d4d4d4;font-size:10px;color:#888;text-align:center;">
      وثيقة صادرة إلكترونياً من منصة ${o(t)}
    </footer>
  `}function d(t){let e=document.createElement("div");e.innerHTML=t;let i=e.firstElementChild;if(!(i instanceof HTMLElement))throw Error("failed to build pdf element");return i.style.position="fixed",i.style.left="0",i.style.top="0",i.style.zIndex="2147483647",i.style.background="#ffffff",i.style.padding="24px",i.style.boxSizing="border-box",i}async function p(t){let e=Array.from(t.querySelectorAll("img"));await Promise.all(e.map(t=>new Promise(e=>{t.complete&&t.naturalWidth>0?e():(t.addEventListener("load",()=>e(),{once:!0}),t.addEventListener("error",()=>e(),{once:!0}))})))}async function s(t,e){let[{default:a},{jsPDF:o}]=await Promise.all([i.e(4316).then(i.t.bind(i,82201,23)),Promise.all([i.e(5033),i.e(3930),i.e(4233)]).then(i.bind(i,18831))]);document.body.appendChild(t);try{await p(t),await new Promise(t=>setTimeout(t,120));let i=await a(t,{scale:2,useCORS:!0,backgroundColor:"#ffffff",logging:!1,scrollX:0,scrollY:0,windowWidth:t.scrollWidth,windowHeight:t.scrollHeight});if(0===i.width||0===i.height)throw Error("empty canvas");let n=i.toDataURL("image/jpeg",.95),r=new o({unit:"mm",format:"a4",orientation:"portrait"}),l=r.internal.pageSize.getWidth(),d=r.internal.pageSize.getHeight(),s=l-20,g=i.height*s/i.width,f=g,x=10;for(r.addImage(n,"JPEG",10,x,s,g),f-=d-20;f>0;)r.addPage(),x=10-(g-f),r.addImage(n,"JPEG",10,x,s,g),f-=d-20;r.save(e)}finally{t.remove()}}i.d(e,{Ts:()=>n,ZD:()=>o,d6:()=>r,gH:()=>a,nw:()=>s,sT:()=>d,xj:()=>l})},85863:(t,e,i)=>{i.d(e,{p:()=>r});var a=i(28247),o=i(56665);async function n(t){return(0,o.sT)(await (0,a.c)(t))}async function r(t){let e=await n(t),i=t.certificate.studentName.replace(/[\\/:*?"<>|]/g,"-").trim()||"طالب";await (0,o.nw)(e,`شهادة_تقدير_${i}_${(0,o.gH)()}.pdf`)}}}]);