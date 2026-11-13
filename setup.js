(() => {
  "use strict";
  const $ = id => document.getElementById(id), C = window.PartyCore;
  let draft, dirty = false, lastQr = null, timer;
  const bindings = {name:"cfgName",partyId:"cfgPartyId",edition:"cfgEdition",headline:"cfgHeadline",intro:"cfgIntro",footerNote:"cfgFooter",accentColor:"cfgAccent",spinDurationMs:"cfgDuration",confetti:"cfgConfetti",allowCompletion:"cfgCompletion"};
  function notify(text) {
    $("toast").textContent=text; $("toast").hidden=false; clearTimeout(timer);
    timer=setTimeout(()=>{$("toast").hidden=true;},4500);
  }
  function download(content,type,name) {
    const url=URL.createObjectURL(new Blob([content],{type}));
    const a=document.createElement("a"); a.href=url; a.download=name;
    document.body.append(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
  }
  function collect() {
    const config={};
    for(const [key,id] of Object.entries(bindings)) {
      const input=$(id);
      config[key]=input.type==="checkbox" ? input.checked : (key==="spinDurationMs" ? Number(input.value) : input.value);
    }
    config.tasks=Array.from($("taskEditors").children, editor => {
      const result={id:editor.dataset.id};
      editor.querySelectorAll("[data-field]").forEach(input=>{result[input.dataset.field]=input.value;});
      return result;
    });
    return config;
  }
  function updateNumbers() {
    const editors=Array.from($("taskEditors").children);
    $("editorTaskCount").textContent=`${editors.length} Aufgaben`;
    $("addTask").disabled=editors.length>=C.MAX_TASKS;
    editors.forEach((editor,i)=>{
      editor.querySelector(".task-summary-number").textContent=String(i+1).padStart(2,"0");
      editor.querySelector(".task-up").disabled=i===0;
      editor.querySelector(".task-down").disabled=i===editors.length-1;
      editor.querySelector(".task-delete").disabled=editors.length<=2;
      editor.querySelector(".task-up").setAttribute("aria-label",`Aufgabe ${i+1} nach oben verschieben`);
      editor.querySelector(".task-down").setAttribute("aria-label",`Aufgabe ${i+1} nach unten verschieben`);
    });
  }
  function addEditor(task,expanded=false) {
    const editor=$("taskTemplate").content.firstElementChild.cloneNode(true);
    editor.dataset.id=task.id; editor.open=expanded;
    editor.querySelector(".task-id").textContent=`ID: ${task.id}`;
    editor.querySelectorAll("[data-field]").forEach(input=>{input.value=task[input.dataset.field];});
    function updateSummary() {
      editor.querySelector(".task-summary-name").textContent=editor.querySelector('[data-field="label"]').value || "Neue Aufgabe";
      editor.querySelector(".task-preview-emoji").textContent=editor.querySelector('[data-field="emoji"]').value;
    }
    editor.addEventListener("input",()=>{dirty=true;updateSummary();}); updateSummary();
    editor.querySelector(".task-up").addEventListener("click",()=>{
      const previous=editor.previousElementSibling;
      if(previous) editor.parentNode.insertBefore(editor,previous);
      dirty=true;updateNumbers();editor.querySelector("summary").focus();
    });
    editor.querySelector(".task-down").addEventListener("click",()=>{
      const next=editor.nextElementSibling;
      if(next) editor.parentNode.insertBefore(next,editor);
      dirty=true;updateNumbers();editor.querySelector("summary").focus();
    });
    editor.querySelector(".task-delete").addEventListener("click",()=>{
      if($("taskEditors").children.length<=2) return;
      const name=editor.querySelector('[data-field="label"]').value || "Neue Aufgabe";
      if(!window.confirm(`„${name}“ wirklich entfernen?`)) return;
      editor.remove(); dirty=true;updateNumbers();
    });
    $("taskEditors").append(editor);
  }
  function makeSvg(qr) {
    const ns="http://www.w3.org/2000/svg", border=4, count=qr.getModuleCount(),size=count+border*2;
    const svg=document.createElementNS(ns,"svg");
    svg.setAttribute("viewBox",`0 0 ${size} ${size}`);svg.setAttribute("width","800");svg.setAttribute("height","800");svg.setAttribute("shape-rendering","crispEdges");
    svg.setAttribute("role","img");svg.setAttribute("aria-label","QR-Code zur Party-Gästeseite");
    const background=document.createElementNS(ns,"rect");background.setAttribute("width",String(size));background.setAttribute("height",String(size));background.setAttribute("fill","#fff");svg.append(background);
    const path=document.createElementNS(ns,"path");let d="";
    for(let y=0;y<count;y++) for(let x=0;x<count;x++) if(qr.isDark(y,x)) d+=`M${x+border},${y+border}h1v1h-1z`;
    path.setAttribute("d",d);path.setAttribute("fill","#000");svg.append(path);
    return svg;
  }
  function generateQr() {
    $("qrError").hidden=true;$("qrActions").hidden=true;lastQr=null;
    try {
      let url;
      try {url=new URL($("siteUrl").value.trim());} catch(_){throw new Error("Bitte eine vollständige Adresse inklusive https:// eintragen.");}
      if(!["https:","http:"].includes(url.protocol) || url.username || url.password) throw new Error("Bitte eine HTTP- oder HTTPS-Adresse ohne Benutzername und Passwort verwenden.");
      if(/\/setup\.html$/i.test(url.pathname)) throw new Error("Bitte die Adresse der Gästeseite eintragen, nicht setup.html.");
      const canonical=url.href;
      if(canonical.length>1200) throw new Error("Die Adresse ist zu lang. Bitte eine kürzere öffentliche URL verwenden.");
      const svg=makeSvg(window.PartyQR.create(canonical));
      $("qrPreview").replaceChildren(svg);$("posterQr").replaceChildren(svg.cloneNode(true));
      $("posterUrl").textContent=canonical;$("posterBrand").textContent=$("cfgName").value || "DEINE PARTY";
      $("siteUrl").value=canonical;lastQr={svg, url:canonical};$("qrActions").hidden=false;
      const isLocal=["localhost","127.0.0.1","[::1]"].includes(url.hostname);
      const warning=isLocal ? "Achtung: localhost funktioniert nur auf diesem Gerät. Für die Party eine öffentlich erreichbare Adresse verwenden." : (url.protocol!=="https:" ? "Hinweis: Für zuverlässige Tab-Sperren die Website mit HTTPS veröffentlichen." : "Vor dem Ausdrucken den Code einmal mit einem Handy testen.");
      $("qrLocalWarning").textContent=warning;$("qrLocalWarning").hidden=false;
    } catch(error) {
      $("qrError").textContent=error.message;$("qrError").hidden=false;
      $("qrPreview").replaceChildren(document.createTextNode("Bitte Adresse prüfen."));
    }
  }
  try {
    draft=C.validateConfig(window.PARTY_CONFIG);
    for(const [key,id] of Object.entries(bindings)) {
      if($(id).type==="checkbox") $(id).checked=draft[key]; else $(id).value=draft[key];
    }
    draft.tasks.forEach((task,i)=>addEditor(task,i===0));updateNumbers();
    $("configForm").addEventListener("input",()=>{dirty=true;});
    // Expand invalid collapsed details so native validation can focus their controls.
    $("configForm").addEventListener("invalid",event=>{const details=event.target.closest("details");if(details) details.open=true;},true);
    $("configForm").addEventListener("submit",event=>{
      event.preventDefault();$("setupError").hidden=true;
      try {
        const config=C.validateConfig(collect());
        download(C.exportConfig(config),"text/javascript;charset=utf-8","config.js");dirty=false;
        notify("Export gestartet. Ersetze config.js und veröffentliche die App neu.");
      } catch(error) {$("setupError").textContent=error.message;$("setupError").hidden=false;$("setupError").scrollIntoView({behavior:"smooth",block:"center"});}
    });
    $("addTask").addEventListener("click",()=>{
      const n=$("taskEditors").children.length;if(n>=C.MAX_TASKS)return;
      const id="task-"+Date.now().toString(36)+"-"+C.randomInt(100000,window.crypto).toString(36);
      addEditor({id,label:"Neue Mission",emoji:"✨",category:"DEINE MISSION",title:"Deine neue Aufgabe",description:"Beschreibe hier, was deine Gäste machen sollen.",color:C.DEFAULT_COLORS[n%3]},true);
      dirty=true;updateNumbers();const last=$("taskEditors").lastElementChild;last.scrollIntoView({behavior:"smooth",block:"center"});last.querySelector("input").focus({preventScroll:true});
    });
    $("generateQr").addEventListener("click",generateQr);
    $("siteUrl").addEventListener("input",()=>{lastQr=null;$("qrActions").hidden=true;$("qrLocalWarning").hidden=true;$("qrPreview").replaceChildren(document.createTextNode("QR-Code neu erstellen."));});
    $("siteUrl").addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();generateQr();}});
    $("downloadQr").addEventListener("click",()=>{if(lastQr)download('<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(lastQr.svg),"image/svg+xml;charset=utf-8","party-qr-code.svg");});
    $("printPoster").addEventListener("click",()=>{if(lastQr){$("posterBrand").textContent=$("cfgName").value || "DEINE PARTY";window.print();}});
    if(["https:","http:"].includes(location.protocol)) $("siteUrl").value=new URL("./",location.href).href;
    window.addEventListener("beforeunload",event=>{if(dirty){event.preventDefault();event.returnValue="";}});
  } catch(error) {
    $("setupError").textContent="Editor konnte nicht geladen werden: "+error.message;$("setupError").hidden=false;
    $("exportConfig").disabled=true;$("addTask").disabled=true;
  }
})();
