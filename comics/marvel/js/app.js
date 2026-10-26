(function(){
'use strict';
var MG=window.MG||{},CH=MG.ch||[],VO=MG.vo||[],AR=MG.ar||[],FI=MG.fi||[],TEAMS=MG.teams||[],META=MG.meta||{};
var ARR={c:CH,v:VO,a:AR,f:FI};
var PAGE=60;
var ROLE={h:'Hero',v:'Villain',a:'Anti-hero',o:'Other / supporting'};
var FREL={F:'Featured',S:'Supporting',A:'Antagonist'};
var AREL={B:'Based on',A:'Adapts elements of',I:'Inspired by'};
var TYPE={c:'Character',v:'Comic series',a:'Story',f:'Movie'};
var $=function(s){return document.querySelector(s)};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim()}
function fmt(n){return Number(n).toLocaleString('en-GB')}
function cmpName(a,b){return a.n.localeCompare(b.n,'en',{sensitivity:'base',numeric:true})}

/* ---------- derived indexes ---------- */
var cFilms={},vFilms={},aFilms={},aChars={},cVols={},vArcs={},fVolsA={},fVolsL={};
(function(){
  FI.forEach(function(f){
    (f.ch||[]).forEach(function(x){(cFilms[x[0]]=cFilms[x[0]]||[]).push([f.i,x[1]])});
    (f.ar||[]).forEach(function(x){(aFilms[x[0]]=aFilms[x[0]]||[]).push([f.i,x[1]])});
    (f.vo||[]).forEach(function(x){(vFilms[x[0]]=vFilms[x[0]]||[]).push([f.i,x[1]])});
  });
  CH.forEach(function(c){(c.ar||[]).forEach(function(a){(aChars[a]=aChars[a]||[]).push(c.i)})});
  VO.forEach(function(v){(v.ft||[]).forEach(function(c){(cVols[c]=cVols[c]||[]).push(v.i)})});
  Object.keys(cVols).forEach(function(k){cVols[k].sort(function(a,b){var A=VO[a],B=VO[b];return (B.kd!=='Collected')-(A.kd!=='Collected')||(B.cnt||0)-(A.cnt||0)})});
  AR.forEach(function(a){if(a.vol!=null)(vArcs[a.vol]=vArcs[a.vol]||[]).push(a.i)});
  var o={F:0,A:1,S:2};
  Object.keys(cFilms).forEach(function(k){cFilms[k].sort(function(a,b){return (FI[a[0]].d||'9').localeCompare(FI[b[0]].d||'9')})});
  FI.forEach(function(f){if(f.ch)f.ch.sort(function(a,b){return o[a[1]]-o[b[1]]||a[0]-b[0]})});
  CH.forEach(function(c){c.sx=norm([c.n,c.r,c.occ,(c.tm||[]).map(function(t){return TEAMS[t]}).join(' ')].join(' '));c.nn=norm(c.n)});
  VO.forEach(function(v){v.sx=norm([v.n,v.pub,(v.w||[]).join(' '),(v.p||[]).join(' ')].join(' '));v.nn=norm(v.n)});
  AR.forEach(function(a){a.sx=norm(a.n+' '+a.cover);a.nn=norm(a.n)});
  FI.forEach(function(f){f.sx=norm([f.n,f.y,f.dir,f.studio,f.prod].join(' '));f.nn=norm(f.n)});
})();

/* ---------- images ---------- */
var phCache={};
function ph(label,id){
  var k=label+id;if(phCache[k])return phCache[k];
  var w=String(label).replace(/\([^)]*\)/g,'').split(/[\s\-:]+/).filter(Boolean),ini=((w[0]||'?')[0]+((w[1]||'')[0]||'')).toUpperCase();
  var hue=(id*47+label.length*13)%360;
  var svg='<svg xmlns="http://www.w3.org/2000/svg" width="150" height="200" viewBox="0 0 150 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl('+hue+',55%,26%)"/><stop offset="1" stop-color="#111118"/></linearGradient></defs><rect width="150" height="200" fill="url(#g)"/><text x="75" y="115" font-family="Arial,sans-serif" font-weight="800" font-size="58" fill="rgba(255,255,255,.75)" text-anchor="middle">'+esc(ini)+'</text></svg>';
  return phCache[k]='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
window.MGfail=function(el){el.onerror=null;el.src=el.getAttribute('data-ph')};
function imgTag(e,t,cls){
  var p=ph(e.n,e.i),c=cls?' class="'+cls+'"':'';
  if(!e.im)return '<img'+c+' src="'+p+'" alt="" loading="lazy">';
  return '<img'+c+' src="images/'+e.im+'.webp" data-ph="'+p+'" alt="" loading="lazy" decoding="async" onerror="MGfail(this)">';
}

/* ---------- names ---------- */
function vname(v){return v.n+(v.vn>1?' (Vol. '+v.vn+')':'')}
function yrs(v){return v.y0?(v.y1&&v.y1!==v.y0?v.y0+'–'+v.y1:String(v.y0)):''}
function ename(t,i){var e=ARR[t][i];return t==='v'?vname(e):e.n}
function shortStudio(s){return {'Marvel Studios / Disney':'Marvel Studios / Disney','Sony / Columbia':'Sony','20th Century Fox':'Fox','Other studios':'Other studio','TV / animation / other':'TV / animation'}[s]||s}

/* ---------- state ---------- */
var S={tab:'chars',q:'',f:{},shown:PAGE,stack:[],map:{seg:'f',sel:['f',null],q:''}};
var TABS=['chars','comics','arcs','films','map','about'];
function fv(k,d){return S.f[S.tab+'.'+k]!=null?S.f[S.tab+'.'+k]:d}
function setf(k,v){S.f[S.tab+'.'+k]=v;S.shown=PAGE}

/* ---------- list logic ---------- */
function count(arr,fn){var m={};arr.forEach(function(x){var k=fn(x);if(k!=null)m[k]=(m[k]||0)+1});return m}
var roleCounts=count(CH,function(c){return c.k}),kindCounts=count(VO,function(v){return v.kd}),typeCounts=count(AR,function(a){return a.ty}),studioCounts=count(FI,function(f){return f.studio});
var originCounts=count(CH,function(c){return c.o}),pubCounts=count(VO,function(v){return v.pub||'Marvel Comics'});
var teamCount={};CH.forEach(function(c){(c.tm||[]).forEach(function(t){teamCount[t]=(teamCount[t]||0)+1})});
var topTeams=Object.keys(teamCount).map(Number).sort(function(a,b){return teamCount[b]-teamCount[a]}).slice(0,40);
var pubList=Object.keys(pubCounts).sort(function(a,b){return pubCounts[b]-pubCounts[a]}).slice(0,14);
var decades=(function(){var m={};VO.forEach(function(v){if(v.y0)m[Math.floor(v.y0/10)*10]=1});return Object.keys(m).map(Number).sort()})();

function rank(e,q,nq){ // 0 = no match
  if(!q)return 1;
  var qs=q.split(' '),i;
  for(i=0;i<qs.length;i++)if(e.sx.indexOf(qs[i])<0)return 0;
  if(e.nn===q)return 5;if(e.nn.indexOf(q)===0)return 4;if(e.nn.indexOf(q)>=0)return 3;return 2;
}
function filtered(){
  var q=norm(S.q),out=[],i,e,r;
  if(S.tab==='chars'){
    var role=fv('role','all'),org=fv('origin','all'),tm=fv('team','all'),fl=fv('film','all');
    for(i=0;i<CH.length;i++){e=CH[i];
      if(role!=='all'&&e.k!==role)continue;
      if(org!=='all'&&e.o!==org)continue;
      if(tm!=='all'&&(e.tm||[]).indexOf(+tm)<0)continue;
      if(fl==='yes'&&!cFilms[i])continue;
      if(fl==='img'&&!e.im)continue;
      r=rank(e,q);if(r)out.push([e,r]);}
    var so=fv('sort','pop');
    if(so==='az')out.sort(function(a,b){return q&&a[1]!==b[1]?b[1]-a[1]:cmpName(a[0],b[0])});else if(q)out.sort(function(a,b){return b[1]-a[1]||a[0].i-b[0].i});
  }else if(S.tab==='comics'){
    var kd=fv('kind','all'),dc=fv('decade','all'),pb=fv('pub','all'),fl2=fv('film','all');
    for(i=0;i<VO.length;i++){e=VO[i];
      if(kd!=='all'&&e.kd!==kd)continue;
      if(dc==='none'){if(e.y0)continue}else if(dc!=='all'&&(!e.y0||Math.floor(e.y0/10)*10!==+dc))continue;
      if(pb!=='all'&&(e.pub||'Marvel Comics')!==pb)continue;
      if(fl2==='yes'&&!vFilms[i])continue;
      r=rank(e,q);if(r)out.push([e,r]);}
    var s2=fv('sort','az');
    out.sort(function(a,b){var A=a[0],B=b[0];if(q&&a[1]!==b[1])return b[1]-a[1];
      if(q&&s2==='az')return (B.cnt||0)-(A.cnt||0);
      if(s2==='year')return (A.y0||9999)-(B.y0||9999)||cmpName(A,B);
      if(s2==='issues')return (B.cnt||0)-(A.cnt||0)||cmpName(A,B);
      return A.i-B.i});
  }else if(S.tab==='arcs'){
    var ty=fv('type','all');
    for(i=0;i<AR.length;i++){e=AR[i];
      if(ty!=='all'&&e.ty!==ty)continue;
      r=rank(e,q);if(r)out.push([e,r]);}
    var s3=fv('sort','az');
    out.sort(function(a,b){if(q&&a[1]!==b[1])return b[1]-a[1];if(s3==='films')return (aFilms[b[0].i]||[]).length-(aFilms[a[0].i]||[]).length||cmpName(a[0],b[0]);return cmpName(a[0],b[0])});
  }else if(S.tab==='films'){
    var st=fv('studio','all'),stt=fv('status','all'),fk=fv('fk','all');
    for(i=0;i<FI.length;i++){e=FI[i];
      if(st!=='all'&&e.studio!==st)continue;
      if(stt==='rel'&&e.status!=='Released')continue;
      if(stt==='up'&&e.status==='Released')continue;
      if(fk!=='all'&&e.fk!==fk)continue;
      r=rank(e,q);if(r)out.push([e,r]);}
    var s4=fv('sort','new');
    out.sort(function(a,b){if(q&&a[1]!==b[1])return b[1]-a[1];var A=a[0],B=b[0];
      if(s4==='az')return cmpName(A,B);
      var d=(A.d||'9999').localeCompare(B.d||'9999');return s4==='old'?d:-d});
  }
  return out.map(function(x){return x[0]});
}

/* ---------- rendering: lists ---------- */
function sel(id,label,opts,cur){
  return '<label>'+esc(label)+'<select data-sel="'+id+'">'+opts.map(function(o){return '<option value="'+esc(o[0])+'"'+(String(o[0])===String(cur)?' selected':'')+'>'+esc(o[1])+'</option>'}).join('')+'</select></label>';
}
function chipsHtml(id,items,cur){
  return items.map(function(it){return '<button class="chip'+(String(it[0])===String(cur)?' active':'')+'" data-chip="'+id+'" data-v="'+esc(it[0])+'">'+esc(it[1])+(it[2]!=null?'<span class="n">'+fmt(it[2])+'</span>':'')+'</button>'}).join('');
}
function renderChips(){
  var h='';
  if(S.tab==='chars')h=chipsHtml('role',[['all','All',CH.length],['h','Heroes',roleCounts.h],['v','Villains',roleCounts.v],['a','Anti-heroes',roleCounts.a],['o','Other / supporting',roleCounts.o]],fv('role','all'));
  else if(S.tab==='comics')h=chipsHtml('kind',[['all','All',VO.length]].concat(['Ongoing','Limited','One-Shot','Annual','Collected','Other'].map(function(k){return [k,k==='One-Shot'?'One-shots':k==='Other'?'Other':k,kindCounts[k]]})),fv('kind','all'));
  else if(S.tab==='arcs')h=chipsHtml('type',[['all','All',AR.length]].concat(['Event','Storyline','Key issue'].map(function(k){return [k,k+(k==='Key issue'?'s':'s'),typeCounts[k]]})),fv('type','all'));
  else if(S.tab==='films')h=chipsHtml('studio',[['all','All',FI.length]].concat(['Marvel Studios / Disney','Sony / Columbia','20th Century Fox','Other studios','TV / animation / other'].map(function(k){return [k,shortStudio(k),studioCounts[k]]})),fv('studio','all'));
  $('#chips').innerHTML=h;
}
function heroHtml(){
  var t={chars:['Characters','Heroes, villains and everyone else in the Marvel universe, with a picture and a short write-up each. Roles are auto-classified.'],
    comics:['Comics','Every Marvel Database comic series and volume: ongoing runs, limited series, one-shots, annuals and collected editions.'],
    arcs:['Key stories & issues','Landmark storylines, events and key issues, especially those that inspired Marvel films.'],
    films:['Movies & screen adaptations','Marvel Cinematic Universe, Sony, Fox and other films and specials, with the comics each one comes from.']}[S.tab];
  return '<div class="hero"><div><h1>'+t[0]+'</h1><p>'+t[1]+'</p></div></div>';
}
function controlsHtml(){
  var h='<div class="controls"><input type="search" id="q" placeholder="Search '+({chars:'characters, teams, real names',comics:'comics, publishers, creators',arcs:'stories and key issues',films:'movies, directors, studios'}[S.tab])+'…" value="'+esc(S.q)+'" autocomplete="off">';
  if(S.tab==='chars'){
    h+=sel('origin','Origin',[['all','Any']].concat(Object.keys(originCounts).sort().map(function(o){return [o,o+' ('+fmt(originCounts[o])+')']})),fv('origin','all'));
    h+=sel('team','Team',[['all','Any']].concat(topTeams.map(function(t){return [t,TEAMS[t]+' ('+teamCount[t]+')']})),fv('team','all'));
    h+=sel('film','Show',[['all','All'],['yes','Appears in a movie'],['img','Has a picture']],fv('film','all'));
    h+=sel('sort','Sort',[['pop','Most notable'],['az','A–Z']],fv('sort','pop'));
  }else if(S.tab==='comics'){
    h+=sel('decade','Era',[['all','Any'],['none','Year unknown']].concat(decades.map(function(d){return [d,d+'s']})),fv('decade','all'));
    h+=sel('pub','Publisher',[['all','Any']].concat(pubList.map(function(p){return [p,p]})),fv('pub','all'));
    h+=sel('film','Show',[['all','All'],['yes','Linked to a movie']],fv('film','all'));
    h+=sel('sort','Sort',[['az','A–Z'],['year','Year'],['issues','Issues']],fv('sort','az'));
  }else if(S.tab==='arcs'){
    h+=sel('sort','Sort',[['az','A–Z'],['films','Most films']],fv('sort','az'));
  }else if(S.tab==='films'){
    h+=sel('status','Status',[['all','Any'],['rel','Released'],['up','Upcoming / unreleased']],fv('status','all'));
    h+=sel('fk','Format',[['all','Any'],['Feature','Feature'],['Short','Short'],['Series','Series / special']].filter(function(o){return o[0]==='all'||FI.some(function(f){return f.fk===o[0]})}),fv('fk','all'));
    h+=sel('sort','Sort',[['new','Newest first'],['old','Oldest first'],['az','A–Z']],fv('sort','new'));
  }
  return h+'<span class="count" id="count"></span></div>';
}
function card(t,e){
  var tag,sub='',badge='',cls='card';
  if(t==='c'){tag='<div class="tag '+e.k+'">'+ROLE[e.k]+'</div>';sub=e.r||e.occ||'';if(cFilms[e.i])badge='<span class="badge">'+cFilms[e.i].length+' film'+(cFilms[e.i].length>1?'s':'')+'</span>'}
  else if(t==='v'){tag='<div class="tag">'+esc(e.kd)+'</div>';sub=[yrs(e),e.cnt?e.cnt+' issue'+(e.cnt>1?'s':''):''].filter(Boolean).join(' · ');if(vFilms[e.i])badge='<span class="badge">film link</span>'}
  else if(t==='a'){tag='<div class="tag">'+esc(e.ty)+'</div>';sub='';var n=(aFilms[e.i]||[]).length;if(n)badge='<span class="badge">'+n+' film'+(n>1?'s':'')+'</span>'}
  else{tag='<div class="tag">'+esc(e.y||'TBA')+' · '+esc(shortStudio(e.studio))+'</div>';sub=e.fk||'';var n2=(e.ar||[]).length;if(n2)badge='<span class="badge">'+n2+' source'+(n2>1?'s':'')+'</span>'}
  return '<button class="card" data-open="'+t+':'+e.i+'">'+badge+imgTag(e,t,'thumb')+'<div class="body">'+tag+'<h3>'+esc(t==='v'?vname(e):e.n)+'</h3>'+(sub?'<div class="sub">'+esc(sub)+'</div>':'')+'<div class="sum">'+esc(e.s)+'</div></div></button>';
}
var curList=[];
function tchar(){return {chars:'c',comics:'v',arcs:'a',films:'f'}[S.tab]}
function updateList(){
  curList=filtered();var t=tchar();
  $('#count').textContent=fmt(curList.length)+' result'+(curList.length===1?'':'s');
  var h=curList.slice(0,S.shown).map(function(e){return card(t,e)}).join('');
  if(!curList.length)h='<div class="empty">Nothing matches. Try fewer filters or a different search.</div>';
  var more=curList.length>S.shown?'<div class="more"><button class="btn red" data-more="1">Show more ('+fmt(curList.length-S.shown)+' left)</button></div>':'';
  $('#list').innerHTML='<div class="grid">'+h+'</div>'+more;
}
function renderList(){
  var notice='';
  if(S.tab==='comics')notice='<div class="notice">All '+fmt(VO.length)+' Marvel Database comic series and volumes are listed ('+fmt(META.issues)+' issues in total). Individual issues are not listed. Where there is no Wikipedia article the write-up is generated from catalogue data. Collected editions have no year.</div>';
  if(S.tab==='arcs')notice='<div class="notice">A hand-picked set of landmark stories and key issues, chosen for their links to Marvel films. Open one to see its films, characters and comics.</div>';
  if(S.tab==='films')notice='<div class="notice">Film-to-comic links are curated for well-known adaptations. Character links come from the Marvel Database. Series links are inferred from lead characters unless marked as sources.</div>';
  $('#main').innerHTML=heroHtml()+notice+controlsHtml()+'<div id="list"></div>';
  updateList();
}

/* ---------- about ---------- */
function renderAbout(){
  var R=META.rep||{},C=META.conn||{},H=META.hist||{};
  function row(n,k){var r=R[k]||{};return '<tr><td>'+n+'</td><td class="r">'+fmt(r.n||0)+'</td><td class="r">'+fmt(r.summary||0)+'</td><td class="r">'+fmt(r.real_text||0)+'</td><td class="r">'+fmt(r.image||0)+'</td><td class="r">'+fmt(r.placeholder||0)+'</td></tr>'}
  $('#main').innerHTML='<div class="about"><h1>About this guide</h1>'+
  '<div class="box"><p>A self-contained, offline browser for the Marvel universe: characters, comic series, key stories and movies, with the links between comics and films. Everything is stored in this folder. Open <code>index.html</code> in any browser, no internet or server needed.</p>'+
  '<p class="small">Built '+esc(META.built||'')+'. This is an unofficial fan reference.</p></div>'+
  '<div class="box"><h2>What is inside</h2><table><tr><th>Section</th><th class="r">Entries</th><th class="r">With write-up</th><th class="r">Write-up from Wikipedia / Marvel Database</th><th class="r">With real image</th><th class="r">Initials placeholder</th></tr>'+
  row('Characters','characters')+row('Comic series &amp; volumes','comics')+row('Key stories &amp; issues','arcs')+row('Movies &amp; specials','films')+'</table>'+
  '<p>Connections: '+fmt(C.film_arc)+' movie→story links, '+fmt(C.film_char)+' movie→character links, '+fmt(C.film_vol)+' movie→comic-series links and '+fmt(C.char_arc)+' character→story links. All ids were checked for dangling references. The comics section covers '+fmt(META.issues)+' issues in total (counted per series).</p>'+
  '<p>Characters: '+fmt(H.roles&&H.roles.h)+' auto-classified as heroes, '+fmt(H.roles&&H.roles.a)+' anti-heroes, '+fmt(H.roles&&H.roles.v)+' villains and '+fmt(H.roles&&H.roles.o)+' others. '+fmt(H.heroes_img)+' heroes and anti-heroes have a real picture.</p></div>'+
  '<div class="box"><h2>Honest limits: not “every comic ever”</h2><ul>'+
  '<li><b>Comics:</b> every comic <i>series and volume</i> in the Marvel Database is here, but <b>individual issues are not listed</b> (about '+fmt(META.issues)+' of them). Only a few dozen landmark stories and key issues have their own page.</li>'+
  '<li><b>Years:</b> series years come from each series’ first and last listed issue. Collected editions (trade paperbacks and similar) have no year, and a few series have none either.</li>'+
  '<li><b>Write-ups:</b> where Wikipedia has an article we use its opening text. Otherwise characters use the Marvel Database overview or history. Most comic series have <i>generated</i> write-ups, built from catalogue facts such as publisher, years, issue count and featured characters. These are marked in each pop-up.</li>'+
  '<li><b>Characters:</b> the Marvel Database lists about 37,500 Earth-616 characters; this guide includes the 7,500 best-documented ones (the well-known heroes and villains, and most film characters). The other ~30,000 are mostly minor characters with a single appearance. Roles (hero, villain, anti-hero, other) and origins are auto-classified from Wikipedia lists, Marvel Database categories and keywords, so some will be wrong. Pictures exist for the most documented characters; the rest show an initials placeholder.</li>'+
  '<li><b>Connections:</b> movie→story links are hand-curated. Movie→character links come from the Marvel Database film appearance lists. Movie→series links are <i>inferred</i> through lead characters unless they come from a source story. Treat inferred links as “related”, not “based on”.</li>'+
  '<li><b>Movies:</b> MCU, Sony, Fox and other films, shorts and specials (including some TV films). A few planned titles are included as unreleased or upcoming, and their details may change.</li></ul></div>'+
  '<div class="box"><h2>Sources</h2><ul>'+
  '<li><a href="https://marvel.fandom.com/">Marvel Database</a> (Fandom), via its public MediaWiki API: characters, volumes, film pages, images. Text under CC BY-SA 3.0.</li>'+
  '<li><a href="https://en.wikipedia.org/">Wikipedia</a> via its public API: article extracts for characters, series, stories and films. Text under CC BY-SA 4.0; author history is on each article.</li>'+
  '<li>Curated list of story-to-film mappings: compiled for this guide from the above sources.</li></ul>'+
  '<p>Text has been shortened and lightly edited. Per CC BY-SA, these write-ups stay under the same licence.</p>'+
  '<p class="small"><b>Images and trademarks:</b> pictures are small low-resolution thumbnails from the Marvel Database, used for identification only. Marvel, character names and cover art belong to Marvel Characters, Inc. and the respective creators and owners. Official logos are not used. This is not affiliated with or endorsed by Marvel or Disney.</p></div>'+
  '<div class="box"><h2>Using it</h2><ul><li><b>Characters, Comics, Key stories, Movies:</b> filter, search and open any card for a write-up and links.</li><li><b>Connections:</b> pick a movie, character, story or series to see what it connects to.</li><li>In a pop-up, links jump to related entries. Use Back or Esc to return.</li></ul></div></div>';
}

/* ---------- modal ---------- */
function lk(t,i,note,rel){
  var e=ARR[t][i];if(!e)return '';
  return '<button class="lk" data-open="'+t+':'+i+'">'+imgTag(e,t)+'<span>'+esc(ename(t,i))+(note?'<small>'+esc(note)+'</small>':'')+'</span>'+(rel?'<b class="rl">'+esc(rel)+'</b>':'')+'</button>';
}
function relBlock(title,why,items){if(!items||!items.length)return '';return '<div class="rel"><h4>'+esc(title)+(why?'<span class="why">'+esc(why)+'</span>':'')+'</h4><div class="links">'+items.join('')+'</div></div>'}
function filmNote(f){return [f.y,shortStudio(f.studio)].filter(Boolean).join(' · ')}
function srcNote(e){
  var m={w:'Text: Wikipedia (CC BY-SA 4.0), shortened.',m:'Text: Marvel Database (CC BY-SA 3.0), shortened.',g:'Write-up generated from catalogue data (Marvel Database / Wikipedia fields), not copied from an article.',c:'Curated note for this guide.'}[e.src]||'';
  return '<div class="srcnote'+(e.src==='g'?' gen':'')+'">'+m+(e.im?' Image: Marvel Database thumbnail (© Marvel).':' No picture available; showing a placeholder.')+'</div>';
}
function facts(rows){rows=rows.filter(function(r){return r[1]});return rows.length?'<dl class="facts">'+rows.map(function(r){return '<dt>'+esc(r[0])+'</dt><dd>'+(r[2]?r[1]:esc(r[1]))+'</dd>'}).join('')+'</dl>':''}
function detail(t,i){
  var e=ARR[t][i],h='',tag='',title=ename(t,i),alt='',fr=[],rel='';
  if(t==='c'){
    tag='<span class="tag '+e.k+'">'+ROLE[e.k]+'</span> · <span class="tag o">'+esc(e.o)+'</span>';alt=[e.r,e.occ].filter(Boolean).join(' · ');
    var tn=(e.tm||[]).map(function(x){return TEAMS[x]});
    fr=[['Gender',e.g],['First appearance',(e.f||'').replace(/ Vol\.? (\d+) (\d+)$/,' (Vol. $1) #$2')],['Created by',e.c],['Teams',tn.join(', ')]];
    var fl=(cFilms[i]||[]).map(function(x){return lk('f',x[0],filmNote(FI[x[0]]),FREL[x[1]])});
    rel+=relBlock('In movies','',fl);
    rel+=relBlock('Key stories','where this character first appears',(e.ar||[]).map(function(a){return lk('a',a)}));
    var cv=[];if(e.fv!=null)cv.push(lk('v',e.fv,'First appearance','1st'));
    (cVols[i]||[]).slice(0,14).forEach(function(v){if(v!==e.fv)cv.push(lk('v',v,[yrs(VO[v]),VO[v].kd].filter(Boolean).join(' · ')))});
    rel+=relBlock('Comic series','featuring this character',cv);
  }else if(t==='v'){
    tag='<span class="tag">'+esc(e.kd)+'</span>';alt=yrs(e);
    fr=[['Publisher',e.pub||'Marvel Comics'],['Status',e.st],['Years',yrs(e)||'Not listed'],['Issues listed',e.cnt?String(e.cnt):''],['Writers',(e.w||[]).join(', ')],['Artists',(e.p||[]).join(', ')],['Genre',e.gen]];
    var vf=vFilms[i]||[];
    rel+=relBlock('From a story behind a movie','',vf.filter(function(x){return x[1]==='A'}).map(function(x){return lk('f',x[0],filmNote(FI[x[0]]))}));
    rel+=relBlock('Related movies','inferred from this series’ lead characters',vf.filter(function(x){return x[1]==='L'}).map(function(x){return lk('f',x[0],filmNote(FI[x[0]]))}));
    rel+=relBlock('Key stories in this series','',(vArcs[i]||[]).map(function(a){return lk('a',a)}));
    rel+=relBlock('Featuring','',(e.ft||[]).map(function(c){return lk('c',c,ROLE[CH[c].k])}));
  }else if(t==='a'){
    tag='<span class="tag">'+esc(e.ty)+'</span>';
    var af=aFilms[i]||[];
    fr=[['Type',e.ty],['Starts at / collected as',e.cover]];
    rel+=relBlock('Movies','from this story',af.map(function(x){return lk('f',x[0],filmNote(FI[x[0]]),AREL[x[1]])}));
    if(e.vol!=null)rel+=relBlock('Comic series','',[lk('v',e.vol,[yrs(VO[e.vol]),VO[e.vol].kd].filter(Boolean).join(' · '))]);
    rel+=relBlock('Characters','first appearing in this story',(aChars[i]||[]).slice(0,24).map(function(c){return lk('c',c,ROLE[CH[c].k])}));
  }else{
    tag='<span class="tag">'+esc(e.y||'TBA')+' · '+esc(shortStudio(e.studio))+'</span>';alt=e.dt||'';
    fr=[['Release',e.dt],['Status',e.status],['Format',e.fk],['Director',e.dir],['Producer',e.prod],['Characters created by',e.cw],['Screenplay',e.sp],['Music',e.mus],['Distributor',e.dist],['Runtime',e.run],['Rating',e.rate],['Budget',e.bud]];
    rel+=relBlock('Comics it comes from','',(e.ar||[]).slice().sort(function(a,b){return 'BAI'.indexOf(a[1])-'BAI'.indexOf(b[1])}).map(function(x){return lk('a',x[0],AR[x[0]].ty,AREL[x[1]])}));
    ['F','A','S'].forEach(function(k){rel+=relBlock({F:'Featured characters',A:'Antagonists',S:'Supporting characters'}[k],k==='F'?'in the Marvel Database film page':'',(e.ch||[]).filter(function(x){return x[1]===k}).slice(0,k==='F'?30:20).map(function(x){return lk('c',x[0],ROLE[CH[x[0]].k])}))});
    var vo=e.vo||[];
    rel+=relBlock('Comic series behind it','series of its source stories',vo.filter(function(x){return x[1]==='A'}).map(function(x){return lk('v',x[0],yrs(VO[x[0]]))}));
    rel+=relBlock('Related comic series','inferred from lead characters',vo.filter(function(x){return x[1]==='L'}).slice(0,16).map(function(x){return lk('v',x[0],yrs(VO[x[0]]))}));
  }
  var hasMap=(t==='f')||(t==='c'&&cFilms[i])||(t==='a'&&aFilms[i])||(t==='v'&&vFilms[i]);
  h='<div class="head">'+imgTag(e,t)+'<div class="t"><div>'+tag+'</div><h2>'+esc(title)+'</h2>'+(alt?'<div class="alt">'+esc(alt)+'</div>':'')+'<p>'+esc(e.s)+'</p>'+srcNote(e)+'</div></div><div class="in">'+facts(fr)+rel+'</div>'+
    '<div class="nav"><button class="btn" data-back="1">'+(S.stack.length>1?'← Back':'Close')+'</button><span>'+(hasMap?'<button class="btn" data-tomap="'+t+':'+i+'">Show in Connections</button> ':'')+'<button class="btn red" data-close="1">Close ✕</button></span></div>';
  return h;
}
function openEnt(t,i,noPush){
  if(!ARR[t]||!ARR[t][i])return;
  if(!noPush)S.stack.push([t,i]);
  $('#sheet').innerHTML=detail(t,i);
  var m=$('#modal');m.classList.add('open');m.scrollTop=0;document.body.style.overflow='hidden';
  try{history.replaceState(null,'','#'+t+'/'+i)}catch(e){}
}
function closeModal(){S.stack=[];$('#modal').classList.remove('open');document.body.style.overflow='';try{history.replaceState(null,'','#'+S.tab)}catch(e){}}
function back(){if(S.stack.length>1){S.stack.pop();var x=S.stack[S.stack.length-1];openEnt(x[0],x[1],true)}else closeModal()}

/* ---------- connections ---------- */
function mapEntries(seg){
  var out=[],i;
  if(seg==='f'){FI.forEach(function(f){if((f.ar&&f.ar.length)||(f.ch&&f.ch.length)||(f.vo&&f.vo.length))out.push(f.i)});out.sort(function(a,b){return (FI[a].d||'9999').localeCompare(FI[b].d||'9999')})}
  else if(seg==='c'){Object.keys(cFilms).forEach(function(k){out.push(+k)});out.sort(function(a,b){return cFilms[b].length-cFilms[a].length||a-b})}
  else if(seg==='a'){AR.forEach(function(a){if(aFilms[a.i])out.push(a.i)});out.sort(function(a,b){return aFilms[b].length-aFilms[a].length||cmpName(AR[a],AR[b])})}
  else{Object.keys(vFilms).forEach(function(k){out.push(+k)});out.sort(function(a,b){var A=vFilms[a],B=vFilms[b];var aa=A.some(function(x){return x[1]==='A'}),bb=B.some(function(x){return x[1]==='A'});return (bb-aa)||B.length-A.length||a-b})}
  return out;
}
function mapSub(seg,i){
  if(seg==='f')return filmNote(FI[i]);
  if(seg==='c')return (cFilms[i]||[]).length+' film'+((cFilms[i]||[]).length>1?'s':'');
  if(seg==='a')return AR[i].ty+' · '+(aFilms[i]||[]).length+' film'+((aFilms[i]||[]).length>1?'s':'');
  return [yrs(VO[i]),VO[i].kd].filter(Boolean).join(' · ');
}
function renderMap(){
  var m=S.map,list=mapEntries(m.seg),q=norm(m.q);
  if(q)list=list.filter(function(i){return norm(ename(m.seg,i)).indexOf(q)>=0});
  if(m.sel[1]==null){var def=FI.filter(function(f){return /Infinity War/.test(f.n)})[0];m.sel=['f',def?def.i:mapEntries('f')[0]];m.seg='f'}
  var segs=[['f','Movies'],['c','Characters'],['a','Stories'],['v','Comic series']];
  var side='<div class="side"><div class="seg">'+segs.map(function(s){return '<button class="chip'+(m.seg===s[0]?' active':'')+'" data-seg="'+s[0]+'">'+s[1]+'</button>'}).join('')+'</div><input type="search" id="mq" placeholder="Filter…" value="'+esc(m.q)+'" autocomplete="off">'+
    list.slice(0,300).map(function(i){var e=ARR[m.seg][i];return '<button class="row'+(m.sel[0]===m.seg&&m.sel[1]===i?' sel':'')+'" data-map="'+m.seg+':'+i+'">'+imgTag(e,m.seg)+'<span>'+esc(ename(m.seg,i))+'<small>'+esc(mapSub(m.seg,i))+'</small></span></button>'}).join('')+(list.length>300?'<div class="small">'+(list.length-300)+' more, narrow with the filter.</div>':'')+(list.length?'':'<div class="small">No matches.</div>')+'</div>';
  $('#main').innerHTML='<div class="hero"><div><h1>Comics ⇄ movies</h1><p>Pick a movie to see its source comics, stories and characters. Pick a character, story or series to see its films.</p></div></div><div class="map"><div class="pick">'+side+'<div class="panel" id="mpanel">'+mapPanel()+'</div></div></div>';
}
function mapPanel(){
  var t=S.map.sel[0],i=S.map.sel[1],e=ARR[t][i];if(!e)return '';
  var h='<div style="display:flex;gap:14px;align-items:flex-start">'+imgTag(e,t,'')+'<div><div class="tag">'+TYPE[t]+'</div><h2>'+esc(ename(t,i))+'</h2><p class="small" style="margin:0 0 6px">'+esc(e.s.length>260?e.s.slice(0,257)+'…':e.s)+'</p><button class="btn" data-open="'+t+':'+i+'">Open details</button></div></div>';
  h=h.replace('<img ','<img style="width:110px;aspect-ratio:3/4;object-fit:cover;object-position:top;border-radius:8px;flex:none" ');
  var P=function(){return relBlock.apply(null,arguments)};
  if(t==='f'){
    h+=P('Comics it comes from','Based on / adapts / inspired by',(e.ar||[]).slice().sort(function(a,b){return 'BAI'.indexOf(a[1])-'BAI'.indexOf(b[1])}).map(function(x){return lk('a',x[0],AR[x[0]].ty,AREL[x[1]])}));
    h+=P('Characters','from the film’s cast list',(e.ch||[]).slice(0,40).map(function(x){return lk('c',x[0],FREL[x[1]])}));
    h+=P('Comic series','series of the source stories',(e.vo||[]).filter(function(x){return x[1]==='A'}).map(function(x){return lk('v',x[0],yrs(VO[x[0]]))}));
    h+=P('Related comic series','inferred from lead characters',(e.vo||[]).filter(function(x){return x[1]==='L'}).slice(0,24).map(function(x){return lk('v',x[0],yrs(VO[x[0]]))}));
  }else if(t==='c'){
    h+=P('Movies','',(cFilms[i]||[]).map(function(x){return lk('f',x[0],filmNote(FI[x[0]]),FREL[x[1]])}));
    h+=P('Stories where they first appear','',(e.ar||[]).map(function(a){return lk('a',a)}));
    var cv=[];if(e.fv!=null)cv.push(lk('v',e.fv,'First appearance','1st'));(cVols[i]||[]).slice(0,14).forEach(function(v){if(v!==e.fv)cv.push(lk('v',v,yrs(VO[v])))});
    h+=P('Comic series','',cv);
  }else if(t==='a'){
    h+=P('Movies','',(aFilms[i]||[]).map(function(x){return lk('f',x[0],filmNote(FI[x[0]]),AREL[x[1]])}));
    if(e.vol!=null)h+=P('Comic series','',[lk('v',e.vol,yrs(VO[e.vol]))]);
    h+=P('Characters','first appearing here',(aChars[i]||[]).slice(0,24).map(function(c){return lk('c',c)}));
  }else{
    h+=P('Movies','',(vFilms[i]||[]).map(function(x){return lk('f',x[0],filmNote(FI[x[0]]),x[1]==='A'?'story':'inferred')}));
    h+=P('Key stories','',(vArcs[i]||[]).map(function(a){return lk('a',a)}));
    h+=P('Featuring','',(e.ft||[]).map(function(c){return lk('c',c)}));
  }
  return h+'<p class="legend">Links marked “inferred” connect a series to a movie through the characters it stars, not through a specific adaptation.</p>';
}

/* ---------- main render ---------- */
function render(){
  document.querySelectorAll('.tab').forEach(function(b){b.classList.toggle('active',b.dataset.tab===S.tab)});
  renderChips();
  if(S.tab==='about')renderAbout();else if(S.tab==='map')renderMap();else renderList();
}
function goTab(t){S.tab=t;S.q='';S.shown=PAGE;render();window.scrollTo(0,0);if(!S.stack.length)try{history.replaceState(null,'','#'+t)}catch(e){}}

/* ---------- events ---------- */
document.addEventListener('click',function(ev){
  var el=ev.target.closest('[data-tab],[data-chip],[data-open],[data-more],[data-back],[data-close],[data-seg],[data-map],[data-tomap]');
  if(!el){if(ev.target.id==='modal')closeModal();return}
  var d=el.dataset;
  if(d.tab){goTab(d.tab)}
  else if(d.chip){setf(d.chip,d.v);render()}
  else if(d.open){var p=d.open.split(':');openEnt(p[0],+p[1])}
  else if(d.more){S.shown+=PAGE*2;updateList()}
  else if(d.back){back()}
  else if(d.close){closeModal()}
  else if(d.seg){S.map.seg=d.seg;S.map.q='';renderMap()}
  else if(d.map){var m=d.map.split(':');S.map.sel=[m[0],+m[1]];renderMap();var pn=$('#mpanel');if(pn&&window.innerWidth<=760)pn.scrollIntoView()}
  else if(d.tomap){var m2=d.tomap.split(':');S.map.sel=[m2[0],+m2[1]];S.map.seg=m2[0];S.map.q='';closeModal();S.tab='map';S.q='';render();window.scrollTo(0,0)}
});
var tmr;
document.addEventListener('input',function(ev){
  if(ev.target.id==='q'){S.q=ev.target.value;S.shown=PAGE;clearTimeout(tmr);tmr=setTimeout(updateList,120)}
  else if(ev.target.id==='mq'){S.map.q=ev.target.value;clearTimeout(tmr);tmr=setTimeout(function(){var v=ev.target.value;renderMap();var n=$('#mq');if(n){n.focus();n.setSelectionRange(v.length,v.length)}},150)}
});
document.addEventListener('change',function(ev){
  var s=ev.target.dataset&&ev.target.dataset.sel;if(s){setf(s,ev.target.value);updateList()}
});
document.addEventListener('keydown',function(ev){
  if(ev.key==='Escape'&&$('#modal').classList.contains('open'))back();
});

/* ---------- start ---------- */
(function init(){
  var h=(location.hash||'').replace('#',''),m=h.match(/^([cvaf])\/(\d+)$/);
  if(TABS.indexOf(h)>=0)S.tab=h;
  else if(m){S.tab={c:'chars',v:'comics',a:'arcs',f:'films'}[m[1]]}
  render();
  if(m)openEnt(m[1],+m[2]);
})();
})();
