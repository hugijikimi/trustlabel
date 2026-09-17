/**
 * The embed renderer.
 *
 * This runs inside someone else's page, so it is defensive by construction:
 * no innerHTML, no globals, inline styles only. Their CSS is not ours and ours
 * is not theirs.
 *
 * renderScript is verbatim from docs/DESIGN.md §5.
 */

export function renderScript({ heading, lines }) {
  const data = JSON.stringify({ heading, lines });   // safe: JSON, not interpolation
  return `(function(){
  var d=${data};
  var s=document.currentScript;
  var box=document.createElement("section");
  box.setAttribute("data-trustlabel","");
  box.style.cssText="max-width:640px;margin:24px 0;padding:24px;border:1px solid #E8E3DA;border-radius:14px;background:#fff;font-family:system-ui,-apple-system,'Noto Sans KR',sans-serif;color:#16191D";
  var h=document.createElement("h2");
  h.textContent=d.heading;
  h.style.cssText="margin:0 0 4px;font-size:17px;font-weight:600";
  var rule=document.createElement("div");
  rule.style.cssText="height:3px;width:44px;background:#0E7C66;margin:0 0 16px";
  box.appendChild(h);box.appendChild(rule);
  d.lines.forEach(function(t){
    var p=document.createElement("p");
    p.textContent=t;                                  // never innerHTML
    p.style.cssText="margin:0 0 10px;font-size:14px;line-height:1.85";
    box.appendChild(p);
  });
  if(s&&s.parentNode){s.parentNode.insertBefore(box,s);}else{document.body.appendChild(box);}
})();`;
}


/**
 * The embed URL ends up in a stranger's production HTML for years. Every path
 * out of the route — unknown slug, unpublished, database down — has to be valid
 * JavaScript, because a 404 that returns HTML throws a syntax error inside
 * their page. This renders nothing and leaves one line in the console for
 * whoever is eventually debugging it.
 */
export function noopScript(reason) {
  const message = JSON.stringify(`[TrustLabel] ${reason}`);
  return `(function(){try{console.warn(${message});}catch(e){}})();`;
}
