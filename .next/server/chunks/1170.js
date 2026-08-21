"use strict";exports.id=1170,exports.ids=[1170],exports.modules={15969:(a,b,c)=>{c.d(b,{Y:()=>j,c:()=>i});var d=c(49259);let e="var(--font-cairo),'Cairo',Tahoma,Arial,sans-serif",f="var(--font-kids),'Baloo Bhaijaan 2',Tahoma,Arial,sans-serif";function g(a=34,b="#F9B428"){return`<svg width="${a}" height="${a}" viewBox="0 0 58 58" fill="none" aria-hidden>
    <path d="M29 4l7 16 18 2-13 12 4 17-16-9-16 9 4-17-13-12 18-2z" fill="${b}" stroke="#EA6622" stroke-width="2.4" stroke-linejoin="round"/>
  </svg>`}function h(a,b="#424CF3"){return`
    <div style="position:relative;border:4px solid ${b};border-radius:28px 12px 28px 16px;background:#fff8ec;padding:10px;box-sizing:border-box;">
      <div style="position:relative;border:2px dashed #EA6622;border-radius:22px 10px 22px 12px;background:#ffffff;padding:22px 20px 18px;overflow:hidden;">
        <span style="position:absolute;top:10px;right:12px;opacity:.9;">${g(28)}</span>
        <span style="position:absolute;top:14px;left:14px;opacity:.9;">${function(a=40){return`<svg width="${a}" height="${Math.round(.78*a)}" viewBox="0 0 70 54" fill="none" aria-hidden>
    <path d="M8 8c18-8 36-8 54 0v38c-18-6-36-6-54 0z" fill="#4BC2FC" fill-opacity=".7" stroke="#424CF3" stroke-width="2.2"/>
    <path d="M35 6v42" stroke="#424CF3" stroke-width="2"/>
  </svg>`}(34)}</span>
        <span style="position:absolute;bottom:12px;right:16px;opacity:.85;">${function(a=52){return`<svg width="${a}" height="${Math.round(.28*a)}" viewBox="0 0 90 24" fill="none" aria-hidden>
    <rect x="8" y="6" width="58" height="12" rx="2" fill="#F9B428" stroke="#EA6622" stroke-width="1.8"/>
    <path d="M66 6l16 6-16 6z" fill="#1A1A1A"/>
    <rect x="0" y="6" width="10" height="12" rx="1" fill="#EA6622"/>
  </svg>`}(48)}</span>
        <span style="position:absolute;bottom:10px;left:14px;opacity:.9;">${g(22,"#4BC2FC")}</span>
        <div style="position:relative;z-index:1;">${a}</div>
      </div>
    </div>
  `}async function i({certificate:a,config:b,schoolName:c="مدرسة غَزتنا",honorsTitle:j}){let k=j?.trim()||b.honorsTitle,l=await (0,d.Ts)(),m=(0,d.gH)(),n=null!=a.averagePercent?`${a.averagePercent.toFixed(1)}%`:"—",o=`
    <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
      <tr>
        <td style="width:120px;vertical-align:middle;">
          <img src="${l}" alt="" style="height:64px;width:auto;max-width:120px;object-fit:contain;display:block;" />
        </td>
        <td style="vertical-align:middle;text-align:center;">
          <p style="margin:0;font-family:${f};font-size:15px;font-weight:800;color:#424CF3;">${(0,d.ZD)(c)}</p>
          <p style="margin:4px 0 0;font-size:12px;font-weight:700;color:#1a1a1a99;">${(0,d.ZD)(a.periodLabel)}</p>
        </td>
        <td style="width:56px;text-align:left;vertical-align:middle;">${function(a=42){return`<svg width="${a}" height="${a}" viewBox="0 0 48 48" fill="none" aria-hidden>
    <path d="M14 10h20v10c0 7-4.5 12-10 12s-10-5-10-12V10z" fill="#F9B428" stroke="#EA6622" stroke-width="2.2"/>
    <path d="M14 14H8c0 6 3 9 6 10M34 14h6c0 6-3 9-6 10" stroke="#424CF3" stroke-width="2.1" stroke-linecap="round"/>
    <rect x="20" y="32" width="8" height="5" rx="1" fill="#EA6622"/>
    <rect x="16" y="37" width="16" height="5" rx="2" fill="#424CF3"/>
  </svg>`}(48)}</td>
      </tr>
    </table>

    <div style="margin:12px auto 8px;max-width:460px;background:#F9B428;border:3px solid #1a1a1a14;border-radius:999px;padding:10px 18px;text-align:center;box-shadow:-4px 5px 0 0 rgba(234,102,34,.35);">
      <p style="margin:0;font-family:${f};font-size:26px;font-weight:800;color:#1a1a1a;line-height:1.35;">
        ${(0,d.ZD)(k)}
      </p>
    </div>

    <p style="margin:10px 0 6px;text-align:center;font-family:${f};font-size:15px;font-weight:800;color:#EA6622;">
      أحسنت… شهادة فخر
    </p>
    <p style="margin:0 auto 14px;max-width:480px;text-align:center;font-size:13px;line-height:1.7;color:#1a1a1acc;">
      تُمنح بكل حب وتقدير إلى النجم/ة
    </p>

    <div style="margin:0 auto 16px;max-width:520px;background:#fff8ec;border:3px solid #F9B428;border-radius:22px;padding:14px 16px;text-align:center;">
      <p style="margin:0;font-family:${f};font-size:30px;font-weight:800;color:#424CF3;line-height:1.3;">
        ${(0,d.ZD)(a.studentName)}
      </p>
      <p style="margin:8px 0 0;font-size:13px;font-weight:700;color:#1a1a1a99;">
        الصف ${(0,d.ZD)(a.gradeLevel||"—")}
        \xb7 الشعبة ${(0,d.ZD)(a.section||"—")}
        \xb7 رقم ${(0,d.ZD)(a.studentNumber||"—")}
      </p>
    </div>

    <div style="margin:0 auto 18px;text-align:center;">
      <span style="display:inline-block;vertical-align:middle;">${g(30)}</span>
      <div style="display:inline-block;width:158px;height:158px;margin:0 10px;border-radius:50%;background:#424CF3;color:#ffffff;vertical-align:middle;box-shadow:-5px 6px 0 0 rgba(249,180,40,.55);">
        <div style="display:table;width:100%;height:100%;">
          <div style="display:table-cell;vertical-align:middle;text-align:center;">
            <p style="margin:0;font-size:12px;font-weight:800;opacity:.88;">المعدل</p>
            <p style="margin:6px 0 0;font-family:${f};font-size:36px;font-weight:800;line-height:1;direction:ltr;">${n}</p>
          </div>
        </div>
      </div>
      <span style="display:inline-block;vertical-align:middle;">${g(30)}</span>
    </div>

    <p style="margin:0 auto 10px;max-width:540px;text-align:center;font-size:14px;line-height:1.9;font-weight:600;color:#1a1a1add;">
      ${(0,d.ZD)(b.honorsMessage)}
    </p>
    <p style="margin:0 0 18px;text-align:center;font-size:11px;font-weight:700;color:#EA6622;">
      الحد الأدنى لهذه الشهادة: ${b.honorsMinAverage}%
    </p>

    <table style="width:100%;max-width:480px;margin:0 auto;border-collapse:collapse;">
      <tr>
        <td style="width:50%;padding-top:10px;text-align:center;">
          <p style="margin:0 auto;width:70%;border-top:2px solid #424CF3;padding-top:8px;font-size:12px;font-weight:800;color:#424CF3;">مدير/ة المدرسة</p>
        </td>
        <td style="width:50%;padding-top:10px;text-align:center;">
          <p style="margin:0 auto;width:70%;border-top:2px solid #EA6622;padding-top:8px;font-size:12px;font-weight:800;color:#EA6622;">تاريخ الإصدار: ${m}</p>
        </td>
      </tr>
    </table>
  `;return`
    <div dir="rtl" style="font-family:${e};background:#ffffff;color:#1a1a1a;width:746px;">
      ${h(o,"#424CF3")}
      ${(0,d.xj)(c)}
    </div>
  `}async function j({certificate:a,config:b,schoolName:c="مدرسة غَزتنا"}){let i=await (0,d.Ts)(),k=(0,d.gH)(),l=`border:2px solid #fff;background:#424CF3;padding:10px 12px;text-align:right;font-size:12px;font-weight:800;color:#fff;font-family:${f};`,m="border:1px solid #ece7d8;padding:10px 12px;font-size:13px;color:#1a1a1a;vertical-align:middle;text-align:right;font-weight:600;",n=a.subjects.map((a,b)=>{var c,e,f;let g=null==a.percent?"color:#888;font-weight:700;":a.percent>=90?"color:#EA6622;font-weight:800;":a.percent>=50?"color:#2F9E44;font-weight:800;":"color:#ea6622;font-weight:800;";return`<tr style="background:${b%2==0?"#fffdf6":"#ffffff"};">
        <td style="${m}font-weight:800;">${(0,d.ZD)(a.subject)}</td>
        <td style="${m}">${c=a.score,e=a.maxScore,null==c||null==e?"—":`${c}/${e}`}</td>
        <td style="${m}${g}">${null==(f=a.percent)?"—":`${f.toFixed(2)}%`}</td>
      </tr>`}).join(""),o=null!=a.averagePercent?`<table style="width:100%;margin-top:16px;border-collapse:collapse;">
          <tr>
            <td style="padding:14px 16px;background:#fff8ec;border:3px solid #F9B428;border-radius:18px;vertical-align:middle;">
              <p style="margin:0;font-family:${f};font-size:14px;font-weight:800;color:#1a1a1a;">المعدل العام</p>
              <p style="margin:4px 0 0;font-size:12px;font-weight:700;color:#1a1a1a99;">${a.gradedSubjectsCount} من ${a.assignedSubjectsCount} مادة</p>
            </td>
            <td style="width:16px;"></td>
            <td style="width:150px;padding:14px 10px;background:#424CF3;border-radius:18px;text-align:center;vertical-align:middle;box-shadow:-4px 5px 0 0 rgba(249,180,40,.45);">
              <p style="margin:0;font-family:${f};font-size:28px;font-weight:800;color:#ffffff;direction:ltr;">${a.averagePercent.toFixed(1)}%</p>
            </td>
          </tr>
        </table>`:'<p style="margin-top:16px;text-align:center;color:#666;font-size:13px;">لا توجد علامات كافية لحساب المعدل.</p>',p=`
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
      <tr>
        <td style="width:120px;vertical-align:middle;">
          <img src="${i}" alt="" style="height:64px;width:auto;max-width:120px;object-fit:contain;display:block;" />
        </td>
        <td style="vertical-align:middle;text-align:right;">
          <p style="margin:0;font-family:${f};font-size:14px;font-weight:800;color:#424CF3;">${(0,d.ZD)(c)}</p>
          <h1 style="margin:4px 0 0;font-family:${f};font-size:26px;font-weight:800;color:#1a1a1a;line-height:1.3;">${(0,d.ZD)(b.certificateTitle)}</h1>
          <p style="margin:6px 0 0;font-size:12px;font-weight:700;color:#1a1a1a99;">${(0,d.ZD)(a.periodLabel)} \xb7 ${k}</p>
        </td>
        <td style="width:48px;text-align:left;vertical-align:top;">${g(32)}</td>
      </tr>
    </table>

    <table style="width:100%;border-collapse:separate;border-spacing:8px;margin-bottom:12px;">
      <tr>
        <td style="padding:12px;background:#fff8ec;border:2px solid #F9B42855;border-radius:16px;width:50%;">
          <span style="font-size:11px;font-weight:800;color:#EA6622;">اسم الطالب</span>
          <p style="margin:2px 0 0;font-family:${f};font-size:16px;font-weight:800;">${(0,d.ZD)(a.studentName)}</p>
        </td>
        <td style="padding:12px;background:#eef2ff;border:2px solid #424CF322;border-radius:16px;width:50%;">
          <span style="font-size:11px;font-weight:800;color:#424CF3;">رقم الطالب</span>
          <p style="margin:2px 0 0;font-size:16px;font-weight:800;direction:ltr;text-align:right;">${(0,d.ZD)(a.studentNumber||"—")}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:12px;background:#fff;border:2px solid #ece7d8;border-radius:16px;width:50%;">
          <span style="font-size:11px;font-weight:800;color:#1a1a1a88;">الصف</span>
          <p style="margin:2px 0 0;font-size:15px;font-weight:800;">${(0,d.ZD)(a.gradeLevel||"—")}</p>
        </td>
        <td style="padding:12px;background:#fff;border:2px solid #ece7d8;border-radius:16px;width:50%;">
          <span style="font-size:11px;font-weight:800;color:#1a1a1a88;">الشعبة</span>
          <p style="margin:2px 0 0;font-size:15px;font-weight:800;">${(0,d.ZD)(a.section||"—")}</p>
        </td>
      </tr>
    </table>

    <table style="width:100%;border-collapse:collapse;table-layout:fixed;border-radius:16px;overflow:hidden;">
      <thead>
        <tr>
          <th style="${l}">المادة</th>
          <th style="${l}">العلامة</th>
          <th style="${l}">النسبة</th>
        </tr>
      </thead>
      <tbody>
        ${n||`<tr><td colspan="3" style="${m}text-align:center;color:#666;">لا توجد مواد مسندة.</td></tr>`}
      </tbody>
    </table>

    ${o}

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
    <div dir="rtl" style="font-family:${e};background:#ffffff;color:#1a1a1a;width:746px;">
      ${h(p,"#EA6622")}
      ${(0,d.xj)(c)}
    </div>
  `}},40201:(a,b,c)=>{c.d(b,{V:()=>g});var d=c(15969),e=c(49259);async function f(a){return(0,e.sT)(await (0,d.Y)(a))}async function g(a){let b=await f(a),c=a.certificate.studentName.replace(/[\\/:*?"<>|]/g,"-").trim()||"طالب";await (0,e.nw)(b,`شهادة_علامات_${c}_${(0,e.gH)()}.pdf`)}},49259:(a,b,c)=>{function d(){let a=new Date,b=a=>String(a).padStart(2,"0");return`${a.getFullYear()}-${b(a.getMonth()+1)}-${b(a.getDate())}`}function e(a){return String(a??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function f(){try{let a=await fetch("/images/logo.png");if(!a.ok)return"";let b=await a.blob();return await new Promise((a,c)=>{let d=new FileReader;d.onload=()=>a(String(d.result||"")),d.onerror=()=>c(Error("failed to read school logo")),d.readAsDataURL(b)})}catch{return""}}function g(a){let{logoDataUrl:b,title:c,schoolName:d,lines:f=[]}=a,g=d?`<p style="margin:0 0 4px;font-size:12px;color:#666;">${e(d)}</p>`:"",h=f.filter(Boolean).map(a=>`<p style="margin:4px 0 0;font-size:12px;color:#666;line-height:1.5;">${e(a)}</p>`).join("");return`
    <header style="display:flex;align-items:center;gap:20px;border-bottom:2px solid #424cf3;padding-bottom:16px;margin-bottom:18px;">
      ${b?`<img
        src="${b}"
        alt="شعار المدرسة"
        style="height:76px;width:auto;max-width:340px;object-fit:contain;display:block;flex-shrink:0;"
      />`:""}
      <div style="flex:1;min-width:0;text-align:right;">
        ${g}
        <h1 style="margin:0;font-family:var(--font-kids),'Baloo Bhaijaan 2',Tahoma,Arial,sans-serif;font-size:22px;font-weight:800;color:#111111;line-height:1.35;">${e(c)}</h1>
        ${h}
      </div>
    </header>
  `}function h(a="مدرسة غَزتنا"){return`
    <footer style="margin-top:24px;padding-top:12px;border-top:1px solid #d4d4d4;font-size:10px;color:#888;text-align:center;">
      وثيقة صادرة إلكترونياً من منصة ${e(a)}
    </footer>
  `}function i(a){let b=document.createElement("div");b.innerHTML=a;let c=b.firstElementChild;if(!(c instanceof HTMLElement))throw Error("failed to build pdf element");return c.style.position="fixed",c.style.left="0",c.style.top="0",c.style.zIndex="2147483647",c.style.background="#ffffff",c.style.padding="24px",c.style.boxSizing="border-box",c}async function j(a){let b=Array.from(a.querySelectorAll("img"));await Promise.all(b.map(a=>new Promise(b=>{a.complete&&a.naturalWidth>0?b():(a.addEventListener("load",()=>b(),{once:!0}),a.addEventListener("error",()=>b(),{once:!0}))})))}async function k(a,b){let[{default:d},{jsPDF:e}]=await Promise.all([c.e(8594).then(c.bind(c,18594)),Promise.all([c.e(8594),c.e(7847)]).then(c.bind(c,37847))]);document.body.appendChild(a);try{await j(a),await new Promise(a=>setTimeout(a,120));let c=await d(a,{scale:2,useCORS:!0,backgroundColor:"#ffffff",logging:!1,scrollX:0,scrollY:0,windowWidth:a.scrollWidth,windowHeight:a.scrollHeight});if(0===c.width||0===c.height)throw Error("empty canvas");let f=c.toDataURL("image/jpeg",.95),g=new e({unit:"mm",format:"a4",orientation:"portrait"}),h=g.internal.pageSize.getWidth(),i=g.internal.pageSize.getHeight(),k=h-20,l=c.height*k/c.width,m=l,n=10;for(g.addImage(f,"JPEG",10,n,k,l),m-=i-20;m>0;)g.addPage(),n=10-(l-m),g.addImage(f,"JPEG",10,n,k,l),m-=i-20;g.save(b)}finally{a.remove()}}c.d(b,{Ts:()=>f,ZD:()=>e,d6:()=>g,gH:()=>d,nw:()=>k,sT:()=>i,xj:()=>h})},64911:(a,b,c)=>{c.d(b,{p:()=>g});var d=c(15969),e=c(49259);async function f(a){return(0,e.sT)(await (0,d.c)(a))}async function g(a){let b=await f(a),c=a.certificate.studentName.replace(/[\\/:*?"<>|]/g,"-").trim()||"طالب";await (0,e.nw)(b,`شهادة_تقدير_${c}_${(0,e.gH)()}.pdf`)}},83046:(a,b,c)=>{c.d(b,{E:()=>g});var d=c(48249),e=c(14490);let f={default:"bg-neutral-100 text-neutral-600",success:"bg-p-green/10 text-p-green",warning:"bg-amber-50 text-amber-700",danger:"bg-p-red/10 text-p-red",info:"bg-p-green/10 text-p-green"};function g({children:a,variant:b="default",className:c}){return(0,d.jsx)("span",{className:(0,e.cn)("inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold",f[b],c),children:a})}}};