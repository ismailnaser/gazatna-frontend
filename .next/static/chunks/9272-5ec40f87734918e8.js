"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9272],{18625:(t,e,a)=>{a.d(e,{N:()=>u});var l=a(12115),r=a(56665),i=a(64203),n=a(10257);let o="border:1px solid #d4d4d4;background:#f5f5f5;padding:8px 12px;text-align:right;font-size:12px;font-weight:700;color:#111;",s="border:1px solid #d4d4d4;padding:8px 12px;font-size:13px;color:#111;vertical-align:top;text-align:right;";function d(t,e=!1){let a=(0,n.Pe)(t.entries),l=a.lessonColumns.map(t=>`<th style="${o}text-align:center;">${(0,r.ZD)(t.period)}${t.timeLabel&&"—"!==t.timeLabel?`<div style="margin-top:2px;font-size:10px;font-weight:500;color:#666;">${(0,r.ZD)(t.timeLabel)}</div>`:""}</th>`).join(""),i=0===a.rows.length?`<tr><td colspan="${Math.max(a.lessonColumns.length+1,2)}" style="${s}text-align:center;color:#666;">لا توجد حصص في هذا الجدول</td></tr>`:a.rows.map((t,a)=>{let l=t.cells.map(t=>{let a=t.subject&&"—"!==t.subject?`<div style="font-weight:600;">${(0,r.ZD)(t.subject)}</div>${e&&t.teacher?`<div style="margin-top:2px;font-size:10px;font-weight:400;color:#666;">المعلم: ${(0,r.ZD)(t.teacher)}</div>`:""}`:"—";return`<td style="${s}text-align:center;vertical-align:middle;">${a}</td>`}).join("");return`<tr style="${a%2==1?"background:#fafafa;":""}"><td style="${s}font-weight:600;background:#fafafa;white-space:nowrap;">${(0,r.ZD)(t.day)}</td>${l}</tr>`}).join("");return`
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
      <thead>
        <tr>
          <th style="${o}">اليوم</th>
          ${l}
        </tr>
      </thead>
      <tbody>${i}</tbody>
    </table>
  `}async function c(t,e={}){var a;let l,f,h=await (0,r.Ts)(),p=e.schoolName?.trim()||"مدرسة غَزتنا",g=e.variant??("exam"===t.scheduleType?"exam":"full"),m="student"===g?d(t):"exam"===g||"exam"===t.scheduleType?(l=["المادة","التاريخ","الوقت","المدة (دقيقة)","ملاحظات"],f=0===(a=t).entries.length?`<tr><td colspan="${l.length}" style="${s}text-align:center;color:#666;">لا توجد صفوف في هذا الجدول</td></tr>`:a.entries.map((t,e)=>`<tr style="${e%2==1?"background:#fafafa;":""}">
              <td style="${s}font-weight:600;">${(0,r.ZD)(t.subject||"—")}</td>
              <td style="${s}direction:ltr;text-align:left;">${(0,r.ZD)(t.date||"—")}</td>
              <td style="${s}">${(0,r.ZD)((0,i.$3)(t.time))}</td>
              <td style="${s}direction:ltr;text-align:left;">${(0,r.ZD)(t.duration||"—")}</td>
              <td style="${s}">${(0,r.ZD)(t.notes||"—")}</td>
            </tr>`).join(""),`
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
      <thead>
        <tr>${l.map(t=>`<th style="${o}">${t}</th>`).join("")}</tr>
      </thead>
      <tbody>${f}</tbody>
    </table>
  `):d(t,!0),u=[n.Lr[t.scheduleType]];return t.classLabels.length>0&&u.push("student"===g?`الشعبة: ${t.classLabels.join(" \xb7 ")}`:`الفصول: ${t.classLabels.join(" \xb7 ")}`),u.push(`تاريخ التصدير: ${(0,r.gH)()}`),(0,r.sT)(`
    <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#ffffff;color:#111111;width:746px;">
      ${(0,r.d6)({logoDataUrl:h,schoolName:p,title:t.name,lines:u})}
      ${m}
    </div>
  `)}async function f(t,e={}){let a,l,i,d=await (0,r.Ts)(),c=e.schoolName?.trim()||"مدرسة غَزتنا",h=e.title?.trim()||"جدول حصصي الأسبوعي";return(0,r.sT)(`
    <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#ffffff;color:#111111;width:746px;">
      ${(0,r.d6)({logoDataUrl:d,schoolName:c,title:h,lines:["جدول حصصي الأسبوعي",`تاريخ التصدير: ${(0,r.gH)()}`]})}
      ${(l=(a=(0,n.gI)(t)).lessonColumns.map(t=>`<th style="${o}text-align:center;">${(0,r.ZD)(t.period)}${t.timeLabel&&"—"!==t.timeLabel?`<div style="margin-top:2px;font-size:10px;font-weight:500;color:#666;">${(0,r.ZD)(t.timeLabel)}</div>`:""}</th>`).join(""),i=0===a.rows.length?`<tr><td colspan="${Math.max(a.lessonColumns.length+1,2)}" style="${s}text-align:center;color:#666;">لا توجد حصص مسندة إليك</td></tr>`:a.rows.map((t,e)=>{let a=t.cells.map(t=>{let e=t.subject&&"—"!==t.subject?`<div style="font-weight:600;">${(0,r.ZD)(t.subject)}</div>${t.classLabel?`<div style="margin-top:2px;font-size:10px;font-weight:400;color:#666;">الفصل: ${(0,r.ZD)(t.classLabel)}</div>`:""}`:"—";return`<td style="${s}text-align:center;vertical-align:middle;">${e}</td>`}).join("");return`<tr style="${e%2==1?"background:#fafafa;":""}"><td style="${s}font-weight:600;background:#fafafa;white-space:nowrap;">${(0,r.ZD)(t.day)}</td>${a}</tr>`}).join(""),`
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
      <thead>
        <tr>
          <th style="${o}">اليوم</th>
          ${l}
        </tr>
      </thead>
      <tbody>${i}</tbody>
    </table>
  `)}
    </div>
  `)}async function h(t,e={}){let a=await c(t,e),l=t.name.replace(/[\\/:*?"<>|]/g,"-").trim()||"جدول";await (0,r.nw)(a,`${l}_${(0,r.gH)()}.pdf`)}async function p(t,e={}){let a=await f(t,e),l=(e.title||"جدول-المعلم").replace(/[\\/:*?"<>|]/g,"-").trim();await (0,r.nw)(a,`${l}_${(0,r.gH)()}.pdf`)}var g=a(55221);let m="مدرسة غَزتنا";function u(t){let[e,a]=(0,l.useState)(null),[r,i]=(0,l.useState)(m),n=(0,l.useCallback)(async()=>{if(r!==m)return r;try{let t=await g.FH.getSiteSettings(),e=t.hero?.schoolName?.trim();if(e)return i(e),e}catch{}return r},[r]);return{exportingId:e,requestExport:(0,l.useCallback)(async(e,l)=>{a(e.id);try{let t=await n();await h(e,{schoolName:t,variant:l??("exam"===e.scheduleType?"exam":"full")})}catch{t?.("تعذر تصدير ملف PDF")}finally{a(null)}},[t,n]),requestTeacherExport:(0,l.useCallback)(async(e,l)=>{a("teacher");try{let t=await n();await p(e,{schoolName:t,title:l})}catch{t?.("تعذر تصدير ملف PDF")}finally{a(null)}},[t,n])}}},33713:(t,e,a)=>{a.d(e,{Z:()=>i});var l=a(95155),r=a(40980);function i({children:t,className:e,padding:a="md",...n}){return(0,l.jsx)("div",{className:(0,r.cn)("rounded-[1.6rem_0.7rem_1.6rem_0.9rem] border-[3px] border-black/10 bg-white shadow-[-5px_6px_0_0_rgba(66,76,243,0.12)]",{none:"p-0",sm:"p-4",md:"p-5 sm:p-6"}[a],e),...n,children:t})}},50825:(t,e,a)=>{a.d(e,{A:()=>l});let l=(0,a(99537).A)("download",[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]])},56665:(t,e,a)=>{function l(){let t=new Date,e=t=>String(t).padStart(2,"0");return`${t.getFullYear()}-${e(t.getMonth()+1)}-${e(t.getDate())}`}function r(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function i(){try{let t=await fetch(`${window.location.origin}/images/logo.png`);if(!t.ok)return"";let e=await t.blob();return await new Promise((t,a)=>{let l=new FileReader;l.onload=()=>t(String(l.result||"")),l.onerror=()=>a(Error("failed to read school logo")),l.readAsDataURL(e)})}catch{return""}}function n(t){let{logoDataUrl:e,title:a,schoolName:l,lines:i=[]}=t,n=l?`<p style="margin:0 0 4px;font-size:12px;color:#666;">${r(l)}</p>`:"",o=i.filter(Boolean).map(t=>`<p style="margin:4px 0 0;font-size:12px;color:#666;line-height:1.5;">${r(t)}</p>`).join("");return`
    <header style="display:flex;align-items:center;gap:20px;border-bottom:2px solid #424cf3;padding-bottom:16px;margin-bottom:18px;">
      ${e?`<img
        src="${e}"
        alt="شعار المدرسة"
        style="height:76px;width:auto;max-width:340px;object-fit:contain;display:block;flex-shrink:0;"
      />`:""}
      <div style="flex:1;min-width:0;text-align:right;">
        ${n}
        <h1 style="margin:0;font-family:var(--font-kids),'Baloo Bhaijaan 2',Tahoma,Arial,sans-serif;font-size:22px;font-weight:800;color:#111111;line-height:1.35;">${r(a)}</h1>
        ${o}
      </div>
    </header>
  `}function o(t="مدرسة غَزتنا"){return`
    <footer style="margin-top:24px;padding-top:12px;border-top:1px solid #d4d4d4;font-size:10px;color:#888;text-align:center;">
      وثيقة صادرة إلكترونياً من منصة ${r(t)}
    </footer>
  `}function s(t){let e=document.createElement("div");e.innerHTML=t;let a=e.firstElementChild;if(!(a instanceof HTMLElement))throw Error("failed to build pdf element");return a.style.position="fixed",a.style.left="0",a.style.top="0",a.style.zIndex="2147483647",a.style.background="#ffffff",a.style.padding="24px",a.style.boxSizing="border-box",a}async function d(t){let e=Array.from(t.querySelectorAll("img"));await Promise.all(e.map(t=>new Promise(e=>{t.complete&&t.naturalWidth>0?e():(t.addEventListener("load",()=>e(),{once:!0}),t.addEventListener("error",()=>e(),{once:!0}))})))}async function c(t,e){let[{default:l},{jsPDF:r}]=await Promise.all([a.e(4316).then(a.t.bind(a,82201,23)),Promise.all([a.e(5033),a.e(3930),a.e(4233)]).then(a.bind(a,18831))]);document.body.appendChild(t);try{await d(t),await new Promise(t=>setTimeout(t,120));let a=await l(t,{scale:2,useCORS:!0,backgroundColor:"#ffffff",logging:!1,scrollX:0,scrollY:0,windowWidth:t.scrollWidth,windowHeight:t.scrollHeight});if(0===a.width||0===a.height)throw Error("empty canvas");let i=a.toDataURL("image/jpeg",.95),n=new r({unit:"mm",format:"a4",orientation:"portrait"}),o=n.internal.pageSize.getWidth(),s=n.internal.pageSize.getHeight(),c=o-20,f=a.height*c/a.width,h=f,p=10;for(n.addImage(i,"JPEG",10,p,c,f),h-=s-20;h>0;)n.addPage(),p=10-(f-h),n.addImage(i,"JPEG",10,p,c,f),h-=s-20;n.save(e)}finally{t.remove()}}a.d(e,{Ts:()=>i,ZD:()=>r,d6:()=>n,gH:()=>l,nw:()=>c,sT:()=>s,xj:()=>o})},78780:(t,e,a)=>{a.d(e,{A:()=>l});let l=(0,a(99537).A)("chevron-left",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]])},99537:(t,e,a)=>{a.d(e,{A:()=>d});var l=a(12115);let r=(...t)=>t.filter((t,e,a)=>!!t&&""!==t.trim()&&a.indexOf(t)===e).join(" ").trim(),i=t=>{let e=t.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,e,a)=>a?a.toUpperCase():e.toLowerCase());return e.charAt(0).toUpperCase()+e.slice(1)};var n={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let o=(0,l.createContext)({}),s=(0,l.forwardRef)(({color:t,size:e,strokeWidth:a,absoluteStrokeWidth:i,className:s="",children:d,iconNode:c,...f},h)=>{let{size:p=24,strokeWidth:g=2,absoluteStrokeWidth:m=!1,color:u="currentColor",className:y=""}=(0,l.useContext)(o)??{},w=i??m?24*Number(a??g)/Number(e??p):a??g;return(0,l.createElement)("svg",{ref:h,...n,width:e??p??n.width,height:e??p??n.height,stroke:t??u,strokeWidth:w,className:r("lucide",y,s),...!d&&!(t=>{for(let e in t)if(e.startsWith("aria-")||"role"===e||"title"===e)return!0;return!1})(f)&&{"aria-hidden":"true"},...f},[...c.map(([t,e])=>(0,l.createElement)(t,e)),...Array.isArray(d)?d:[d]])}),d=(t,e)=>{let a=(0,l.forwardRef)(({className:a,...n},o)=>(0,l.createElement)(s,{ref:o,iconNode:e,className:r(`lucide-${i(t).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${t}`,a),...n}));return a.displayName=i(t),a}}}]);