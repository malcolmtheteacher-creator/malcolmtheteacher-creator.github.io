(function(){
'use strict';
var D=window.SS||{};
var $=function(s,r){return (r||document).querySelector(s)};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'")}
function img(key,alt,cls,label){
  cls=cls||'thumb';
  if(!key) return '<div class="ph '+(cls.indexOf('land')>-1?'land':'')+'" role="img" aria-label="'+esc(alt)+'">'+esc(label||alt)+'<small>No image available</small></div>';
  return '<img class="'+cls+'" src="images/'+esc(key)+'.webp" alt="'+esc(alt)+'" loading="lazy" data-ph="'+esc(label||alt)+'">';
}
function paras(a){return (a||[]).map(function(p){return '<p>'+esc(p)+'</p>'}).join('')}
function facts(list){return '<dl class="facts">'+list.map(function(f){return '<dt>'+esc(f[0])+'</dt><dd>'+esc(f[1])+'</dd>'}).join('')+'</dl>'}
function stars(n){var s='';for(var i=0;i<5;i++)s+=i<n?'★':'☆';return '<span class="stars" title="Importance '+n+'/5">'+s+'</span>'}
var stories=D.stories||[],cast=D.cast||[],eps=D.episodes||[],S98=D.series||{},guides=D.guides||[];
var CH=[
 ['top','Introduction'],['origin','1 · Origin & backstory'],['guides','2 · In-depth guides'],['comics','3 · Key comic stories'],['cast','4 · Heralds, allies & enemies'],
 ['tv98','5 · ★ 1998 animated series'],['films','6 · Movies'],['tv','7 · TV & animation'],['games','8 · Video games'],
 ['other','9 · Other media & influence'],['creators','10 · Creators'],['timeline','11 · Timeline 1966–2026'],
 ['start','12 · Where to start reading'],['glossary','13 · Glossary'],['about','14 · About & sources']];
function buildTOC(){
  var h='<h4>Guide</h4>';
  CH.forEach(function(c){h+='<a href="#'+c[0]+'" data-sec="'+c[0]+'"'+(c[0]==='tv98'?' class="star"':'')+'>'+esc(c[1])+'</a>'});
  h+='<h4>In-depth guides</h4>';
  guides.forEach(function(g){h+='<a class="sub'+(g.id==='galactus'||g.id==='life'?' star':'')+'" href="#/guide/'+g.id+'">'+esc(g.title)+'</a>'});
  h+='<h4>1998 series</h4><a href="#/series" class="star">Series overview & episodes</a>';
  eps.forEach(function(e){h+='<a class="sub" href="#/ep/'+e.n+'">'+e.n+'. '+esc(e.title)+'</a>'});
  h+='<h4>Story pages</h4>';
  stories.forEach(function(s){h+='<a class="sub" href="#/story/'+s.id+'">'+esc(s.title)+'</a>'});
  $('#toc').innerHTML=h;
}
function storyCard(s){
  return '<a class="card" href="#/story/'+s.id+'">'+img(s.img,s.title+' cover')+'<div class="body"><div class="tag">'+esc(s.year)+'</div><h3>'+esc(s.title)+'</h3><div class="sub">'+esc(s.sub||'')+'</div>'+stars(s.importance||3)+'</div></a>';
}
function castCard(c){
  return '<button class="card" data-cast="'+c.id+'">'+img(c.img,c.name,'thumb',c.name)+'<div class="body"><div class="tag">'+esc(c.role)+'</div><h3>'+esc(c.name)+'</h3><div class="sum">'+esc(c.text)+'</div></div></button>';
}
function epCard(e){
  return '<a class="card epcard" href="#/ep/'+e.n+'"><span class="epn">'+e.n+'</span>'+img(e.img,'Episode '+e.n+' still','thumb land','Episode '+e.n)+'<div class="body"><div class="tag">'+esc(e.air.split(' (')[0])+'</div><h3>'+esc(e.title)+'</h3><div class="sub">Written by '+esc(e.writer)+'</div></div></a>';
}
function home(){
  var h='';
  var eras=[];stories.forEach(function(s){if(eras.indexOf(s.era)<0)eras.push(s.era)});
  h+='<section class="hero" id="top">'+img('ff48','Fantastic Four #48 cover','','')+'<div><h1>The Silver Surfer</h1><p>An offline deep-dive guide to Norrin Radd of Zenn-La, the Sentinel of the Spaceways, covering six decades of comics, the 1998 animated series, films, games and his cultural legacy.</p>'+
   '<div class="stats"><span>'+stories.length+' story pages</span><span>'+cast.length+' character cards</span><span>'+eps.length+' episode pages (1998)</span><span>'+(D.films||[]).length+' films</span><span>'+(D.tv||[]).length+' TV entries</span><span>'+(D.games||[]).length+' games</span><span>'+(D.timeline||[]).length+' timeline events</span><span>'+guides.length+' in-depth guides</span></div>'+
   '<p style="margin-top:14px"><a class="btn primary" href="#/series">★ Explore the 1998 animated series</a><a class="btn primary" href="#/guide/life">The Life of Norrin Radd</a><a class="btn primary" href="#/guide/galactus">Galactus &amp; his heralds</a><a class="btn" href="#/guide/reading">Reading order</a></p></div></section>';
  h+='<section class="ch" id="origin"><h2><span class="num">01</span>Origin &amp; backstory</h2><p class="lede">Who Norrin Radd was, the bargain that made him the Silver Surfer, and what the Power Cosmic does.</p><div class="prose">';
  (D.origin||[]).forEach(function(o){h+='<h3>'+esc(o[0])+'</h3><p>'+esc(o[1])+'</p>'});
  h+='</div><p><a class="btn" href="#/guide/life">Full biography →</a><a class="btn" href="#/guide/bargain">The bargain, retold →</a><a class="btn" href="#/guide/zennla">Zenn-La guide →</a><a class="btn" href="#/guide/powers">Powers explained →</a></p></section>';
  h+='<section class="ch" id="guides"><h2><span class="num">02</span>In-depth guides</h2><p class="lede">Long-form chapters: a full biography, a dedicated Galactus chapter with every herald, Zenn-La, powers, reading order, collecting, creators and more.</p><div class="grid">'+guides.map(guideCard).join('')+'</div></section>';
  h+='<section class="ch" id="comics"><h2><span class="num">03</span>Key comic stories &amp; runs</h2><p class="lede">Every major run and storyline, grouped by era. Each card opens a full page with key issues, creators, dates, a synopsis and why it matters. Stars show importance.</p>';
  eras.forEach(function(er){h+='<h3 class="era">'+esc(er)+'</h3><div class="grid">'+stories.filter(function(s){return s.era===er}).map(storyCard).join('')+'</div>'});
  h+='</section>';
  var groups=[];cast.forEach(function(c){if(groups.indexOf(c.group)<0)groups.push(c.group)});
  h+='<section class="ch" id="cast"><h2><span class="num">04</span>Heralds, allies &amp; enemies</h2><p class="lede">'+cast.length+' character cards. Click a card to see more.</p>';
  groups.forEach(function(g){h+='<h3 class="era">'+esc(g)+'</h3><div class="grid">'+cast.filter(function(c){return c.group===g}).map(castCard).join('')+'</div>'});
  h+='</section>';
  h+='<section class="ch" id="tv98"><h2><span class="num">05</span>★ Silver Surfer: The Animated Series (1998)</h2><div class="row" style="background:linear-gradient(120deg,#1b1f4a,#2a1d5c)">'+img('tv_box','Silver Surfer animated series DVD art')+'<div><p>'+esc((S98.overview||[])[0])+'</p><p><b>1 season · 13 episodes · Fox Kids, 7 Feb – 29 May 1998.</b> Voice of the Surfer: Paul Essiembre.</p><a class="btn primary" href="#/series">Open the series hub: overview, production, cancellation &amp; all 13 episodes →</a></div></div><div class="eplist">'+eps.map(epCard).join('')+'</div></section>';
  h+='<section class="ch" id="films"><h2><span class="num">06</span>Movies</h2>';
  (D.films||[]).forEach(function(f){h+='<div class="row">'+img(f.img,f.title+' poster')+'<div><h4>'+esc(f.title)+' ('+esc(f.year)+')</h4>'+facts(f.facts)+'<h4>Plot</h4>'+paras(f.plot)+'<p><b>How it relates to the comics:</b> '+esc(f.comics)+'</p><p class="sub" style="color:var(--mute)">'+esc(f.note)+'</p></div></div>'});
  h+='<h3 class="era">MCU status &amp; Avengers: Doomsday</h3><div class="note">'+esc((D.mcu||[])[0])+'</div><div class="prose"><p>'+esc((D.mcu||[])[1])+'</p></div></section>';
  h+='<section class="ch" id="tv"><h2><span class="num">07</span>TV &amp; animation appearances</h2><div class="grid wide">';
  (D.tv||[]).forEach(function(t){h+=(t.id==='tv_ss98'?'<a class="card" href="#/series">':'<div class="card">')+img(t.img,t.title,'thumb land',t.title)+'<div class="body"><div class="tag">'+esc(t.year)+'</div><h3>'+esc(t.title)+'</h3><div class="sum">'+esc(t.role)+'</div></div>'+(t.id==='tv_ss98'?'</a>':'</div>')});
  h+='</div><div class="note blue">'+esc(D.tvnote)+'</div></section>';
  h+='<section class="ch" id="games"><h2><span class="num">08</span>Video games</h2><div class="grid wide">';
  (D.games||[]).forEach(function(g){h+='<div class="card">'+img(g.img,g.title,'thumb land',g.title)+'<div class="body"><div class="tag">'+esc(g.year)+' · '+esc(g.plat)+(g.conf<2?' · unverified':'')+'</div><h3>'+esc(g.title)+'</h3><div class="sum">'+esc(g.note)+'</div></div></div>'});
  h+='</div></section>';
  h+='<section class="ch" id="other"><h2><span class="num">09</span>Other media &amp; cultural influence</h2><div class="row">'+img('m_satriani','Surfing with the Alien album cover')+'<div class="prose">';
  (D.other||[]).forEach(function(o){if(o[0].indexOf('Creation')===0||o[0].indexOf('Stan Lee')===0||o[0].indexOf('Mœbius')===0)return;h+='<h3>'+esc(o[0])+'</h3><p>'+esc(o[1])+'</p>'});
  h+='</div></div></section>';
  h+='<section class="ch" id="creators"><h2><span class="num">10</span>Creators &amp; creation notes</h2>';
  var cimg={'Creation (Jack Kirby)':'kirby','Stan Lee’s Surfer':'lee','Mœbius and Parable':'moebius'};
  (D.other||[]).forEach(function(o){if(!cimg[o[0]])return;h+='<div class="row">'+img(cimg[o[0]],o[0])+'<div><h4>'+esc(o[0])+'</h4><p>'+esc(o[1])+'</p></div></div>'});
  var cg=guides.find(function(g){return g.id==='creators'});var ncr=cg?cg.blocks.filter(function(b){return b.t==='cards'})[0].items.length:0;
  h+='<p class="lede">Other key creators include John Buscema, Steve Englehart, Marshall Rogers, Ron Lim, Jim Starlin, Ron Marz, J. M. DeMatteis, J. Michael Straczynski and Esad Ribić, Dan Slott and the Allreds, Donny Cates and Tradd Moore, Al Ewing, Greg Pak and Larry Brody.</p><p><a class="btn primary" href="#/guide/creators">Open all '+ncr+' creator cards →</a></p></section>';
  h+='<section class="ch" id="timeline"><h2><span class="num">11</span>Timeline 1966–2026</h2><div class="legend"><span><i style="background:#a98bff"></i>Comics</span><span><i style="background:#2d7ff0"></i>TV</span><span><i style="background:#f0b35d"></i>Film</span><span><i style="background:#5ed39a"></i>Games</span><span><i style="background:#c9d3f0"></i>Other</span></div><div class="timeline">';
  (D.timeline||[]).forEach(function(t){h+='<div class="tl '+t[1]+'"><b>'+esc(t[0])+'</b><span class="kind">'+esc(t[1])+'</span>'+esc(t[2])+'</div>'});
  h+='</div></section>';
  h+='<section class="ch" id="start"><h2><span class="num">12</span>Where to start reading</h2><div class="grid wide">';
  (D.reading||[]).forEach(function(r){h+='<div class="card"><div class="body"><h3>'+esc(r[0])+'</h3><ol style="padding-left:18px;margin:6px 0">'+r[1].map(function(x){return '<li style="font-size:.88rem;margin:3px 0">'+esc(x)+'</li>'}).join('')+'</ol></div></div>'});
  h+='</div><p><a class="btn primary" href="#/guide/reading">Complete reading order by era →</a><a class="btn" href="#/guide/collecting">Key issues &amp; collecting →</a></p></section>';
  h+='<section class="ch" id="glossary"><h2><span class="num">13</span>Glossary</h2><dl class="gloss">'+(D.glossary||[]).map(function(g){return '<dt id="g-'+norm(g[0]).replace(/[^a-z0-9]+/g,'-')+'">'+esc(g[0])+'</dt><dd>'+esc(g[1])+'</dd>'}).join('')+'</dl></section>';
  h+='<section class="ch" id="about"><h2><span class="num">14</span>About, sources &amp; limitations</h2><div class="prose">'+
   '<p>This is an unofficial, non-commercial fan reference built to work completely offline. Every file it uses lives inside this folder.</p>'+
   '<h3>Text sources</h3><p>Facts and summaries were researched and paraphrased from: Wikipedia (Silver Surfer, the Silver Surfer comic series, the Galactus Trilogy, Parable, Requiem, Black, the Thanos Quest, the Infinity Gauntlet, Annihilation, Fantastic Four: Rise of the Silver Surfer, The Fantastic Four: First Steps, Avengers: Doomsday, the Silver Surfer TV series and video game articles; text licensed CC BY-SA 4.0); the Marvel Database on Fandom (character, issue and episode pages; CC BY-SA 3.0); TVmaze (episode list and airdates); X-Cess Minutiae’s 2025 episode reviews of the 1998 series; Garn’s Guides (episode credits); and an archived copy of the official Silver Surfer animated-series scripts page (Wayback Machine) for the unproduced season-two list. Under CC BY-SA, adapted text from those wikis in this guide may be reused under the same licence with attribution.</p>'+
   '<h3>Fact-checking &amp; limitations</h3><ul>'+
   '<li>Key facts (dates, creators, cast, episode counts, box office) were cross-checked against at least two sources; where sources disagree or only one was available, the text says so.</li>'+
   '<li>The 1998 series ran one season of 13 episodes (not two seasons). Eight season-two scripts were written but never produced.</li>'+
   '<li>Silver Surfer series volume numbering follows Marvel Database: vol. 1 (1968), vol. 2 (1982 one-shot), vol. 3 (1987–98), vol. 4 (Parable), vol. 5 (2003), vol. 6 (2011), vol. 7 (2014), vol. 8 (2016).</li>'+
   '<li>The Silver Surfer’s role in Avengers: Doomsday (December 2026) is unconfirmed as of 30 October 2026.</li>'+
   '<li>Version 2 (October 2026) adds the in-depth guides, longer story pages, new character cards and corrections (Ghost Light is by John Jennings &amp; Valentine De Landro; In Thy Name rewritten from Marvel Database issue data).</li>'+
   '<li>Pop-culture trivia from Marvel Database’s community lists is flagged as fan-sourced. 2026 news items (e.g. a reported Shalla-Bal one-shot) are hedged. Mobile-game appearances beyond those listed are unverified.</li>'+
   '<li>Synopses are original paraphrases; highlights from episodes are paraphrased, not verbatim quotes.</li></ul>'+
   '<h3>Images</h3><p>Comic covers, posters, box art and episode stills are copyrighted by their owners (chiefly Marvel/Disney) and are reproduced as small, compressed thumbnails (WebP) for identification and commentary only. No fan art is used. Images were taken from the Marvel Database and Wikipedia/Wikimedia file pages listed below. Grey-blue panels mark items with no suitable image.</p></div>'+
   '<h3 class="era">Image credits ('+(D.credits||[]).length+' files)</h3><div class="cred">'+(D.credits||[]).map(function(c){return '<div><b>'+esc(c.k)+'</b>: '+esc(c.f)+', <a href="'+esc(c.url)+'" target="_blank" rel="noopener">'+esc(c.site)+'</a></div>'}).join('')+'</div></section>';
  return h;
}
function storyPage(id){
  var i=stories.findIndex(function(s){return s.id===id}),s=stories[i];if(!s)return notFound();
  var p=stories[i-1],n=stories[i+1];
  var h='<div class="detail"><div class="crumbs"><a href="#comics">Comics</a> › '+esc(s.era)+'</div><div class="dhead">'+img(s.img,s.title+' cover')+'<div><div class="tag">'+esc(s.year)+'</div><h1>'+esc(s.title)+'</h1><div class="sub">'+esc(s.sub||'')+'</div>'+stars(s.importance||3)+
   facts([['Key issues',s.issues],['Creators',s.creators],['Dates',s.dates]])+'</div></div>';
  if(s.gallery&&s.gallery.length)h+='<div class="gallery">'+s.gallery.map(function(g){return '<img src="images/'+esc(g)+'.webp" alt="Cover: '+esc(g)+'" loading="lazy" data-zoom="'+esc(g)+'">'}).join('')+'</div>';
  h+='<h2>Synopsis</h2>'+paras(s.syn)+(s.deep&&s.deep.length?'<h2>In depth</h2>'+paras(s.deep):'')+'<h2>Why it matters</h2><p>'+esc(s.why)+'</p>';
  if(s.src)h+='<p class="sub" style="color:var(--mute);font-size:.82rem">Sources: '+esc(s.src)+'</p>';
  h+='<div class="pager">'+(p?'<a class="btn" href="#/story/'+p.id+'">← '+esc(p.title)+'</a>':'<span></span>')+(n?'<a class="btn" href="#/story/'+n.id+'">'+esc(n.title)+' →</a>':'')+'</div></div>';
  return h;
}
function seriesPage(){
  var s=S98,h='<div class="detail" style="max-width:1100px"><div class="crumbs"><a href="#top">Guide</a> › 1998 animated series</div><div class="dhead">'+img('tv_title','Silver Surfer (1998) title card','thumb land')+'<div><div class="tag">Fox Kids · 1998</div><h1>Silver Surfer: The Animated Series</h1><div class="sub">1 season · 13 episodes · cel-shaded / CGI hybrid in the style of Jack Kirby</div></div></div>';
  h+=facts(s.facts||[]);
  h+='<h2>Overview</h2>'+paras(s.overview)+'<h2>Voice cast</h2><p>Paul Essiembre (Silver Surfer / Norrin Radd); James Blendick (Galactus); Colin Fox (Uatu the Watcher); Gary Krawford (Thanos); Camilla Scott (Shalla-Bal); Tara Rosling (Frankie Raye / Nova). Guests include Lally Cadeau (Lady Chaos), Robert Bockstael (Pip the Troll), Norm Spencer (Drax), Oliver Becker (Adam Warlock), Roy Lewis (Ego), Karl Pruner (Beta Ray Bill), David Hemblen (Supreme Intelligence), Jennifer Dale (Nebula), Mary Long and Alison Sealy-Smith (Gamora), Cedric Smith (Mentor), John Neville (Eternity), Elizabeth Sheperd (Infinity), Aron Tager (Master of Zenn-La) and Denis Akiyama (Watcher Prime).</p>'+
   '<h2>Cancellation &amp; the unmade season two</h2>'+paras(s.cancel)+'<ul>'+(s.unproduced||[]).map(function(u){return '<li><b>'+esc(u[0])+'</b> – '+esc(u[1])+'</li>'}).join('')+'</ul>'+
   '<h2>Reception &amp; legacy</h2>'+paras(s.reception)+'<h2>Fox Kids, the Marvel Action Hour &amp; crossovers</h2><div class="note blue">'+esc((s.crossover||[])[0])+'</div><div class="note">'+esc(s.notes)+'</div>'+
   '<h2 id="eps">All 13 episodes</h2><div class="eplist">'+eps.map(epCard).join('')+'</div></div>';
  return h;
}
function epPage(n){
  var i=eps.findIndex(function(e){return String(e.n)===String(n)}),e=eps[i];if(!e)return notFound();
  var p=eps[i-1],nx=eps[i+1];
  var h='<div class="detail"><div class="crumbs"><a href="#/series">1998 animated series</a> › Episode '+e.n+' of 13</div><div class="dhead">'+img(e.img,'Episode '+e.n+' still','thumb land','Episode '+e.n)+'<div><div class="tag">Episode '+e.n+' · '+esc(e.air)+'</div><h1>'+esc(e.title)+'</h1>'+facts([['Original airdate',e.air],['Written by',e.writer],['Directed by',e.director]])+'</div></div>';
  h+='<h2>Plot</h2>'+paras(e.plot)+'<h2>Key characters</h2><p>'+esc(e.chars)+'</p><h2>Voice cast</h2><p>'+esc(e.cast)+'</p><h2>Notable moments</h2><ul>'+(e.highlights||[]).map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul><h2>Comics it adapts or draws on</h2><p>'+esc(e.adapts)+'</p>'+(e.readnext?'<div class="note blue"><b>Read next in the comics:</b> '+esc(e.readnext)+'</div>':'');
  h+='<div class="pager">'+(p?'<a class="btn" href="#/ep/'+p.n+'">← '+p.n+'. '+esc(p.title)+'</a>':'<a class="btn" href="#/series">← Series overview</a>')+(nx?'<a class="btn" href="#/ep/'+nx.n+'">'+nx.n+'. '+esc(nx.title)+' →</a>':'<a class="btn" href="#/series">Series overview →</a>')+'</div></div>';
  return h;
}
function guideCard(g){
  var w=0;g.blocks.forEach(function(b){w+=blockText(b).split(/\s+/).length});
  return '<a class="card" href="#/guide/'+g.id+'">'+img(g.img,g.title,'thumb',g.title)+'<div class="body"><div class="tag">Guide · ~'+(Math.round(w/100)*100)+' words</div><h3>'+esc(g.title)+'</h3><div class="sum">'+esc(g.lede)+'</div></div></a>';
}
function blockText(b){
  if(b.t==='sec')return (b.p||[]).join(' ');
  if(b.t==='table')return b.rows.map(function(r){return r.join(' ')}).join(' ')+' '+(b.note||'');
  if(b.t==='facts')return b.rows.map(function(r){return r.join(' ')}).join(' ');
  if(b.t==='cards')return b.items.map(function(i){return [i.name,i.meta,i.text,i.extra].join(' ')}).join(' ');
  if(b.t==='list')return b.items.map(function(i){return i.join(' ')}).join(' ')+' '+(b.note||'');
  if(b.t==='gallery')return b.items.map(function(i){return i[1]}).join(' ');
  return '';
}
function phDiv(name){return '<div class="ph" role="img" aria-label="'+esc(name)+'">'+esc(name)+'<small>No image available</small></div>'}
function zimg(k,alt,cls){return '<img'+(cls?' class="'+cls+'"':'')+' src="images/'+esc(k)+'.webp" alt="'+esc(alt)+'" loading="lazy" data-ph="'+esc(alt)+'" data-zoom="'+esc(k)+'">'}
function guidePage(id){
  var i=guides.findIndex(function(g){return g.id===id}),g=guides[i];if(!g)return notFound();
  var p=guides[i-1],n=guides[i+1];
  var h='<div class="detail guide"><div class="crumbs"><a href="#guides">In-depth guides</a> › '+esc(g.title)+'</div><div class="dhead">'+img(g.img,g.title,'thumb',g.title)+'<div><div class="tag">Guide '+(i+1)+' of '+guides.length+'</div><h1>'+esc(g.title)+'</h1><div class="sub">'+esc(g.lede)+'</div>';
  h+='<nav class="gtoc" aria-label="On this page"><b>On this page</b>'+g.blocks.map(function(b,k){return b.h?'<a href="#/guide/'+g.id+'/s'+k+'">'+esc(b.h)+'</a>':''}).join('')+'</nav></div></div>';
  g.blocks.forEach(function(b,k){
    var sid='s'+k;
    h+='<section class="gsec" id="'+sid+'">'+(b.kicker?'<div class="tag">'+esc(b.kicker)+'</div>':'')+'<h2>'+esc(b.h)+'</h2>';
    if(b.t==='sec'){
      h+=(b.img?zimg(b.img,b.h,'gimg'):'')+paras(b.p)+(b.refs?'<p class="refs">Key issues: '+esc(b.refs)+'</p>':'');
    }else if(b.t==='facts'){
      h+=facts(b.rows);
    }else if(b.t==='table'){
      h+='<div class="tblwrap"><table class="tbl"><thead><tr>'+b.cols.map(function(c){return '<th>'+esc(c)+'</th>'}).join('')+'</tr></thead><tbody>'+b.rows.map(function(r){return '<tr>'+r.map(function(c){return '<td'+(String(c).indexOf('★')===0?' class="ess"':'')+'>'+esc(c)+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>'+(b.note?'<p class="refs">'+esc(b.note)+'</p>':'');
    }else if(b.t==='cards'){
      h+='<div class="gcards">'+b.items.map(function(it,j){return '<div class="gcard" id="'+sid+'c'+j+'">'+(it.img?zimg(it.img,it.name,'thumb'):phDiv(it.name))+'<div><h3>'+esc(it.name)+'</h3><div class="meta">'+esc(it.meta)+'</div><p>'+esc(it.text)+'</p>'+(it.extra?'<div class="note blue"><b>'+esc(it.extralabel||'Note')+':</b> '+esc(it.extra)+'</div>':'')+'</div></div>'}).join('')+'</div>';
    }else if(b.t==='list'){
      h+='<dl class="gloss">'+b.items.map(function(it){return '<dt>'+esc(it[0])+'</dt><dd>'+esc(it[1])+'</dd>'}).join('')+'</dl>'+(b.note?'<p class="refs">'+esc(b.note)+'</p>':'');
    }else if(b.t==='gallery'){
      h+='<div class="figs">'+b.items.map(function(it){return '<figure>'+zimg(it[0],it[1])+'<figcaption>'+esc(it[1])+'</figcaption></figure>'}).join('')+'</div>';
    }
    h+='</section>';
  });
  h+='<div class="pager">'+(p?'<a class="btn" href="#/guide/'+p.id+'">← '+esc(p.title)+'</a>':'<a class="btn" href="#guides">← All guides</a>')+(n?'<a class="btn" href="#/guide/'+n.id+'">'+esc(n.title)+' →</a>':'<a class="btn" href="#guides">All guides →</a>')+'</div></div>';
  return h;
}
function notFound(){return '<div class="detail"><h1>Not found</h1><p><a href="#top">Back to the guide</a></p></div>'}
// modal
function openModal(html){$('#sheet').innerHTML='<button class="close" aria-label="Close">×</button>'+html;$('#modal').classList.add('open');fixImgs($('#sheet'))}
function closeModal(){$('#modal').classList.remove('open')}
function castModal(id){var c=cast.find(function(x){return x.id===id});if(!c)return;
  openModal('<div class="dhead">'+img(c.img,c.name,'thumb',c.name)+'<div><div class="tag">'+esc(c.group)+'</div><h1 style="font-size:1.5rem">'+esc(c.name)+'</h1><div class="sub">'+esc(c.role)+'</div>'+facts([['First appearance',c.first]])+'<p>'+esc(c.text)+'</p></div></div>')}
document.addEventListener('click',function(ev){
  var t=ev.target;
  if(t.closest&&t.closest('[data-cast]')){castModal(t.closest('[data-cast]').getAttribute('data-cast'));return}
  if(t.getAttribute&&t.getAttribute('data-zoom')){openModal('<img class="big" src="images/'+esc(t.getAttribute('data-zoom'))+'.webp" alt="Cover">');return}
  if(t.id==='modal'||(t.classList&&t.classList.contains('close'))){closeModal();return}
  if(t.closest&&t.closest('#toc a')&&window.innerWidth<=900){toggleToc(false)}
});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeModal();hideResults()}});
function fixImgs(root){Array.prototype.forEach.call(root.querySelectorAll('img[data-ph]'),function(im){im.addEventListener('error',function(){var d=document.createElement('div');d.className='ph'+(im.classList.contains('land')?' land':'');d.textContent=im.getAttribute('data-ph')||'Image';im.replaceWith(d)},{once:true})})}
// toc
function toggleToc(open){var t=$('#toc');if(window.innerWidth<=900){t.style.paddingTop=($('header.top').getBoundingClientRect().bottom+10)+'px'}else{t.style.paddingTop=''}t.classList.toggle('open',open);$('#menuBtn').setAttribute('aria-expanded',open?'true':'false')}
$('#menuBtn').addEventListener('click',function(){toggleToc(!$('#toc').classList.contains('open'))});
var obs=null;
function watchSections(){
  if(obs)obs.disconnect();if(!('IntersectionObserver' in window))return;
  obs=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){setActive(x.target.id)}})},{rootMargin:'-80px 0px -70% 0px'});
  CH.forEach(function(c){var el=document.getElementById(c[0]);if(el)obs.observe(el)});
}
function setActive(id){Array.prototype.forEach.call(document.querySelectorAll('#toc a'),function(a){a.classList.toggle('active',a.getAttribute('data-sec')===id||a.getAttribute('href')==='#'+id)})}
// router
var view='';
function route(){
  var h=location.hash||'#top',app=$('#app');
  closeModal();
  if(h.indexOf('#/')===0){
    var parts=h.slice(2).split('/'),html;
    if(parts[0]==='story')html=storyPage(decodeURIComponent(parts[1]));
    else if(parts[0]==='ep')html=epPage(parts[1]);
    else if(parts[0]==='series')html=seriesPage();
    else if(parts[0]==='guide')html=guidePage(parts[1]);
    else html=notFound();
    var base=parts[0]==='guide'?'#/guide/'+parts[1]:h;
    if(view!==base){app.innerHTML=html;view=base;fixImgs(app);window.scrollTo(0,0)}
    if(parts[0]==='guide'&&parts[2]){var tg=document.getElementById(parts[2]);if(tg){tg.scrollIntoView();setTimeout(function(){if(location.hash===h)tg.scrollIntoView()},350);setTimeout(function(){if(location.hash===h)tg.scrollIntoView()},900)}}
    if(obs)obs.disconnect();setActive(null);
    Array.prototype.forEach.call(document.querySelectorAll('#toc a'),function(a){a.classList.toggle('active',a.getAttribute('href')===base)});
    var t=app.querySelector('h1');document.title=(t?t.textContent+' — ':'')+'Silver Surfer guide';
  }else{
    if(view!=='home'){app.innerHTML=home();view='home';fixImgs(app);watchSections();document.title='Silver Surfer — The Sentinel\'s Guide'}
    var el=document.getElementById(h.slice(1));
    if(el){el.scrollIntoView();setActive(h.slice(1))}
  }
}
window.addEventListener('hashchange',route);
// search
var IDX=[];
function add(kind,title,href,text){IDX.push({k:kind,t:title,h:href,x:text,n:norm(title+' '+text)})}
stories.forEach(function(s){add('Story',s.title,'#/story/'+s.id,[s.sub,s.year,s.creators,s.issues,(s.syn||[]).join(' '),s.why].join(' '))});
eps.forEach(function(e){add('Episode '+e.n,e.title,'#/ep/'+e.n,[e.air,e.chars,e.cast,(e.plot||[]).join(' '),e.adapts,(e.highlights||[]).join(' ')].join(' '))});
add('1998 series','Silver Surfer animated series overview','#/series',[(S98.overview||[]).join(' '),(S98.cancel||[]).join(' '),(S98.crossover||[]).join(' ')].join(' '));
cast.forEach(function(c){add('Character',c.name,'cast:'+c.id,[c.role,c.first,c.text].join(' '))});
(D.films||[]).forEach(function(f){add('Film',f.title,'#films',[f.year,f.plot.join(' '),f.comics].join(' '))});
(D.tv||[]).forEach(function(t){add('TV',t.title,t.id==='tv_ss98'?'#/series':'#tv',t.year+' '+t.role)});
(D.games||[]).forEach(function(g){add('Game',g.title,'#games',g.year+' '+g.plat+' '+g.note)});
(D.glossary||[]).forEach(function(g){add('Glossary',g[0],'#g-'+norm(g[0]).replace(/[^a-z0-9]+/g,'-'),g[1])});
(D.origin||[]).forEach(function(o){add('Origin',o[0],'#origin',o[1])});
(D.other||[]).forEach(function(o){add('Other media',o[0],/Kirby|Lee|Mœbius/.test(o[0])?'#creators':'#other',o[1])});
(D.timeline||[]).forEach(function(t){add('Timeline '+t[0],t[2].slice(0,70),'#timeline',t[2])});
guides.forEach(function(g){add('Guide',g.title,'#/guide/'+g.id,g.lede);g.blocks.forEach(function(b,k){
  var base='#/guide/'+g.id+'/s'+k;
  if(b.t==='cards')b.items.forEach(function(it,j){add(g.title,it.name,'#/guide/'+g.id+'/s'+k+'c'+j,[it.meta,it.text,it.extra].join(' '))});
  else if(b.h)add(g.title,b.h,base,blockText(b));})});
var q=$('#q'),R=$('#results'),sel=-1;
function hideResults(){R.hidden=true;sel=-1}
function snippet(x,terms){var nx=norm(x),i=nx.indexOf(terms[0]);if(i<0)return x.slice(0,110);var s=Math.max(0,i-40);return (s?'…':'')+x.slice(s,s+120)+'…'}
function search(){
  var v=norm(q.value.trim());if(v.length<2){hideResults();return}
  var terms=v.split(/\s+/);
  var res=IDX.map(function(it){var sc=0;for(var i=0;i<terms.length;i++){var p=it.n.indexOf(terms[i]);if(p<0)return null;sc+=norm(it.t).indexOf(terms[i])>-1?10:1}return {it:it,sc:sc}}).filter(Boolean).sort(function(a,b){return b.sc-a.sc}).slice(0,30);
  R.innerHTML=res.length?res.map(function(r){var it=r.it;return '<a href="'+(it.h.indexOf('cast:')===0?'#cast':it.h)+'" data-go="'+esc(it.h)+'"><span class="k">'+esc(it.k)+'</span>'+esc(it.t)+'<span class="x">'+esc(snippet(it.x,terms))+'</span></a>'}).join(''):'<div class="none">No matches for “'+esc(q.value)+'”</div>';
  R.hidden=false;sel=-1;
}
q.addEventListener('input',search);
q.addEventListener('focus',search);
q.addEventListener('keydown',function(e){var a=R.querySelectorAll('a');if(!a.length)return;
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();sel=(sel+(e.key==='ArrowDown'?1:-1)+a.length)%a.length;Array.prototype.forEach.call(a,function(x,i){x.classList.toggle('sel',i===sel)});a[sel].scrollIntoView({block:'nearest'})}
  if(e.key==='Enter'){e.preventDefault();(a[sel<0?0:sel]).click()}});
R.addEventListener('click',function(e){var a=e.target.closest('a');if(!a)return;var g=a.getAttribute('data-go');hideResults();
  if(g.indexOf('cast:')===0){e.preventDefault();if(location.hash!=='#cast')location.hash='#cast';else route();setTimeout(function(){castModal(g.slice(5))},30)}
  else if(g===location.hash){e.preventDefault();route()}});
document.addEventListener('click',function(e){if(!e.target.closest('.searchwrap'))hideResults()});
buildTOC();route();
})();
