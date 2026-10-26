(function(){
'use strict';
var EG=window.EG, S=EG.series, E=EG.episodes, ORDER=EG.order;
var PLACE='data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"><rect width="400" height="225" fill="#141b2b"/><g fill="none" stroke="#3a4766" stroke-width="3"><rect x="150" y="75" width="100" height="75" rx="8"/><circle cx="200" cy="112" r="16"/></g><text x="200" y="185" fill="#6b7a99" font-family="sans-serif" font-size="16" text-anchor="middle">No image available</text></svg>');
var $=function(id){return document.getElementById(id)};
var state={tab:'Star Trek',series:'tos',season:'all',q:'',all:false};
var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
var DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
function fmt(iso,long){ if(!iso)return ''; var p=iso.split('-'); var d=new Date(Date.UTC(+p[0],+p[1]-1,+p[2])); var s=(+p[2])+' '+MONTHS[+p[1]-1]+' '+p[0]; return long?DAYS[d.getUTCDay()]+' '+s:s; }
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function groupSeries(g){return ORDER.filter(function(k){return S[k].group===g})}
function seasonLabel(k,s){
  if(k==='col'){ if(s===0)return 'Pilot TV movies (1968 & 1971)'; if(s===11)return 'Later TV movies (1991–2003)'; return 'Season '+s; }
  if(s===0)return 'Pilot'; return 'Season '+s;
}
function code(ep){
  var k=ep.series;
  if(k==='col'){ if(ep.season===0)return 'Pilot'; if(ep.season===11)return 'Later movie '+ep.number; return 'S'+ep.season+' E'+ep.number; }
  if(ep.season===0)return 'Pilot';
  return 'S'+ep.season+' E'+ep.number;
}
function imgTag(ep,cls,alt){
  var local=ep.image||(S[ep.series].art), remote=ep.imageRemote||'';
  return '<img class="'+cls+'" loading="lazy" alt="'+esc(alt||'')+'" src="'+esc(local||remote||PLACE)+'" data-remote="'+esc(remote)+'" data-art="'+esc(S[ep.series].art||'')+'" onerror="window.EGfail(this)">';
}
window.EGfail=function(el){
  var step=+(el.getAttribute('data-step')||0); el.setAttribute('data-step',step+1);
  var r=el.getAttribute('data-remote'), a=el.getAttribute('data-art');
  if(step===0&&r&&el.src.indexOf(r)<0){el.src=r;return;}
  if(step<=1&&a&&el.src.indexOf(a)<0){el.src=a;return;}
  el.onerror=null; el.src=PLACE;
};
function ukLine(ep){
  if(ep.ukDate) return '<div class="uk">UK: '+fmt(ep.ukDate,false)+'</div>';
  return '<div class="uk none">UK broadcast date not found</div>';
}
function usLine(ep){ return ep.usAirDate?'<div class="us">Original US air date: '+fmt(ep.usAirDate)+'</div>':'<div class="us">Original air date unknown</div>'; }
function card(ep,showSeries){
  return '<button class="card" data-id="'+ep.id+'">'+imgTag(ep,'thumb',ep.title)+
   '<div class="body"><div class="se">'+(showSeries?esc(S[ep.series].short)+' · ':'')+code(ep)+'</div><h3>'+esc(ep.title)+'</h3>'+ukLine(ep)+usLine(ep)+'</div></button>';
}
function norm(s){return s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'')}
function render(){
  document.querySelectorAll('.tab').forEach(function(b){b.classList.toggle('active',b.dataset.tab===state.tab)});
  var chips=$('chips');
  if(state.tab==='About'){chips.innerHTML='';renderAbout();return;}
  var keys=groupSeries(state.tab);
  if(keys.indexOf(state.series)<0){state.series=keys[0];state.season='all';}
  chips.innerHTML=keys.length>1?keys.map(function(k){return '<button class="chip'+(k===state.series?' active':'')+'" data-series="'+k+'">'+esc(S[k].short==='vST'?'vShort Treks':S[k].name)+'<span class="n">'+E[k].length+'</span></button>'}).join(''):'';
  var s=S[state.series], list=E[state.series];
  var seasons=[]; list.forEach(function(e){if(seasons.indexOf(e.season)<0)seasons.push(e.season)});
  var q=norm(state.q.trim());
  var searchAll=state.all&&q&&state.tab==='Star Trek';
  var pool=[]; if(searchAll){groupSeries('Star Trek').forEach(function(k){pool=pool.concat(E[k])})} else pool=list;
  var res=pool.filter(function(e){
    if(!searchAll&&state.season!=='all'&&String(e.season)!==String(state.season))return false;
    if(!q)return true;
    return norm(e.title+' '+e.summary).indexOf(q)>=0;
  });
  var h='<section class="hero">'+(s.art?'<img src="'+esc(s.art)+'" alt="" onerror="this.style.display=\'none\'">':'')+'<div><h1>'+(s.group==='Star Trek'?'Star Trek: ':'')+esc(s.name)+'</h1><p>'+esc(s.premiered?s.premiered.slice(0,4):'')+' · '+esc(s.network||'')+' · '+list.length+' episodes</p></div></section>';
  h+='<div class="notice">'+esc(s.note)+'</div>';
  h+='<div class="controls"><input type="search" id="q" placeholder="Search titles and summaries'+(state.tab==='Star Trek'?'':' (Columbo)')+'…" value="'+esc(state.q)+'" aria-label="Search">';
  if(state.tab==='Star Trek')h+='<label><input type="checkbox" id="all"'+(state.all?' checked':'')+'> all Star Trek series</label>';
  h+='<select id="season" aria-label="Season"'+(searchAll?' disabled':'')+'><option value="all">All seasons</option>'+seasons.map(function(x){return '<option value="'+x+'"'+(String(x)===String(state.season)?' selected':'')+'>'+esc(seasonLabel(state.series,x))+'</option>'}).join('')+'</select>';
  h+='<span class="count">'+res.length+' episode'+(res.length===1?'':'s')+'</span></div>';
  if(!res.length){h+='<div class="empty">No episodes match.</div>';}
  else{
    h+='<div class="grid">'; var last=null;
    res.forEach(function(e){
      var gk=searchAll?e.series+'|'+e.season:e.season;
      if(gk!==last){last=gk; h+='<h2 class="seasonhead">'+(searchAll?esc(S[e.series].name)+' · ':'')+esc(seasonLabel(e.series,e.season))+'</h2>';}
      h+=card(e,searchAll);
    });
    h+='</div>';
  }
  var keep=document.activeElement&&document.activeElement.id==='q';
  var pos=keep?document.activeElement.selectionStart:0;
  $('main').innerHTML=h;
  if(keep){var qq=$('q');qq.focus();qq.setSelectionRange(pos,pos);}
}
function stats(){
  var rows=[],T=0,U=0;
  ORDER.forEach(function(k){var l=E[k],u=l.filter(function(e){return e.ukDate}).length;T+=l.length;U+=u;rows.push({k:k,n:l.length,u:u})});
  return {rows:rows,T:T,U:U};
}
function renderAbout(){
  var st=stats(), x=EG.extra;
  var h='<div class="about"><h1>About &amp; sources</h1>';
  h+='<p>This guide covers <strong>'+st.T+' episodes</strong> across Star Trek and Columbo. <strong>'+st.U+'</strong> of them have a UK date I could source; <strong>'+(st.T-st.U)+'</strong> show "UK broadcast date not found" together with the original (US) air date. No UK date has been guessed or filled in from the US date.</p>';
  h+='<table><thead><tr><th>Series</th><th class="r">Episodes</th><th class="r">UK date found</th><th class="r">Not found</th></tr></thead><tbody>';
  st.rows.forEach(function(r){h+='<tr><td>'+(S[r.k].group==='Star Trek'?'Star Trek: ':'')+esc(S[r.k].name)+'</td><td class="r">'+r.n+'</td><td class="r">'+r.u+'</td><td class="r">'+(r.n-r.u)+'</td></tr>'});
  h+='<tr><th>Total</th><th class="r">'+st.T+'</th><th class="r">'+st.U+'</th><th class="r">'+(st.T-st.U)+'</th></tr></tbody></table>';
  h+='<h2>What counts as a "UK date"</h2><ul><li>The date of the first UK transmission I could find in a named source. For Star Trek (TOS, TAS) these are BBC1 dates from 1969–74; for TNG seasons 1–3 they are BBC2 dates.</li><li>BBC Genome (Radio Times listings) is the main underlying source, but its scheduled times are sometimes wrong, so where BBC records show a different actual date I used that and said so on the episode.</li><li>Where Sky One had first-run rights (TNG from 1993, DS9, Voyager, Enterprise) only a few premiere dates could be found, so most of those episodes show "not found" and, where relevant, a note about the earliest later BBC showing.</li><li>For streaming-era series (Discovery onwards) and Columbo no per-episode UK dates were found.</li></ul>';
  h+='<h2>Sources</h2><ul><li><a href="https://www.tvmaze.com/" target="_blank" rel="noopener">TVmaze</a> — episode titles, numbering, original air dates, summaries and images (CC BY-SA). Summaries are shortened from TVmaze text.</li><li><a href="https://memory-alpha.fandom.com/" target="_blank" rel="noopener">Memory Alpha</a> — UK airdates for TOS and TNG episodes (CC BY-SA), which cite BBC Genome / Radio Times.</li><li><a href="http://space-doubt.blogspot.com/2016/01/star-trek-at-bbc-written-archive-centre.html" target="_blank" rel="noopener">Space Doubt blog</a> — BBC Written Archives "Programme as Broadcast" confirmations for several TOS episodes.</li><li><a href="https://scifiuk.home.blog/star-trek-1966-69/" target="_blank" rel="noopener">Sci-Fi TV UK</a> — BBC transmission dates for TOS and TAS, used to cross-check Memory Alpha.</li><li><a href="https://www.trekbbs.com/threads/uk-first-air-dates-on-sky-tv.274184/" target="_blank" rel="noopener">The Trek BBS</a> — forum posts on early Sky One dates (DS9 premiere, a few TNG episodes). Lower reliability, flagged on the episode.</li><li><a href="http://news.bbc.co.uk/1/hi/entertainment/1747412.stm" target="_blank" rel="noopener">BBC News</a> — Enterprise UK premiere, 7 January 2002.</li><li>Voyager premiere date (22 October 1995) from BFI/TV IV records as surfaced by web search; those pages were not opened directly.</li></ul>';
  h+='<h2>Scope and caveats</h2><ul><li>Star Trek series included: TOS, TAS, TNG, DS9, Voyager, Enterprise, Discovery, Picard, Lower Decks, Prodigy, Strange New Worlds, Short Treks, very Short Treks and Starfleet Academy. Columbo: all 69 episodes (two pilots, 1971–78 NBC, 1989–2003 ABC).</li>';
  h+='<li>Counts follow TVmaze: two-part episodes that TVmaze lists as two entries count twice (TNG shows 178 rather than 176; DS9 and Voyager pilots are two entries each). TOS has 79 regular episodes plus the pilot "The Cage". Prodigy shows 39 because its opener is a single entry (40 officially).</li>';
  h+='<li>Not yet released, so not listed: '+x.unreleased.map(esc).join('; ')+'.</li><li>Not included: '+x.excluded.map(esc).join('; ')+'.</li>';
  h+='<li>Images are resized copies stored in the <code>images/</code> folder; if one fails to load the page tries the original online image, then a placeholder.</li></ul></div>';
  $('main').innerHTML=h;
}
/* detail view */
var current=[],curIdx=-1;
function openEp(id){
  var ep=null,list=null;
  Object.keys(E).some(function(k){return E[k].some(function(e){if(e.id===id){ep=e;list=E[k];return true}})});
  if(!ep)return; current=list; curIdx=list.indexOf(ep); showEp();
}
function showEp(){
  var ep=current[curIdx], s=S[ep.series];
  var uk=ep.ukDate?'<dd class="ok">'+fmt(ep.ukDate,true)+'</dd>':'<dd class="none">UK broadcast date not found</dd>';
  var h=imgTag(ep,'','Image for '+ep.title)+'<div class="in"><div class="se">'+esc(s.group==='Star Trek'?'Star Trek: '+s.name:s.name)+' · '+seasonLabel(ep.series,ep.season)+(ep.season===0?'':' · Episode '+ep.number)+'</div><h2>'+esc(ep.title)+'</h2>';
  h+='<p>'+esc(ep.summary||'No summary available.')+'</p><dl class="facts"><dt>Season / episode</dt><dd>'+esc(code(ep))+'</dd><dt>UK first broadcast</dt>'+uk;
  if(ep.ukDate&&ep.ukDateSource)h+='<dt>UK date source</dt><dd>'+esc(ep.ukDateSource)+'</dd>';
  if(ep.ukNote)h+='<dt>UK note</dt><dd>'+esc(ep.ukNote)+'</dd>';
  h+='<dt>Original air date</dt><dd>'+(ep.usAirDate?fmt(ep.usAirDate,true)+' <span class="small">(original / US)</span>':'unknown')+'</dd></dl>';
  h+='<div class="nav"><button class="btn" id="prev"'+(curIdx<=0?' disabled':'')+'>← Previous</button><button class="btn" id="close">Close</button><button class="btn" id="next"'+(curIdx>=current.length-1?' disabled':'')+'>Next →</button></div></div>';
  $('sheet').innerHTML=h; $('modal').classList.add('open'); document.body.style.overflow='hidden'; $('sheet').parentNode.scrollTop=0;
}
function closeEp(){$('modal').classList.remove('open');document.body.style.overflow='';}
document.addEventListener('click',function(ev){
  var t=ev.target;
  var c=t.closest&&t.closest('.card'); if(c){openEp(c.dataset.id);return;}
  var ch=t.closest&&t.closest('.chip'); if(ch){state.series=ch.dataset.series;state.season='all';render();return;}
  var tb=t.closest&&t.closest('.tab'); if(tb){state.tab=tb.dataset.tab;if(state.tab!=='About'){state.series=groupSeries(state.tab)[0];state.season='all';state.all=false}render();window.scrollTo(0,0);return;}
  if(t.id==='close'||t.id==='modal'){closeEp();return;}
  if(t.id==='prev'&&curIdx>0){curIdx--;showEp();return;}
  if(t.id==='next'&&curIdx<current.length-1){curIdx++;showEp();return;}
});
document.addEventListener('input',function(ev){ if(ev.target.id==='q'){state.q=ev.target.value;render();} });
document.addEventListener('change',function(ev){
  if(ev.target.id==='season'){state.season=ev.target.value;render();}
  if(ev.target.id==='all'){state.all=ev.target.checked;render();}
});
document.addEventListener('keydown',function(ev){
  if(!$('modal').classList.contains('open'))return;
  if(ev.key==='Escape')closeEp();
  if(ev.key==='ArrowLeft'&&curIdx>0){curIdx--;showEp();}
  if(ev.key==='ArrowRight'&&curIdx<current.length-1){curIdx++;showEp();}
});
render();
})();
