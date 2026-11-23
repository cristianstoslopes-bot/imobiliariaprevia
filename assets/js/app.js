(function(){
  'use strict';
  var $=function(s,r){return (r||document).querySelector(s);};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
  var IM=window.IMOVEIS||[],BYID={};IM.forEach(function(i){BYID[i.id]=i;});
  var WA='5511944037048';
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var brl=function(v){return v.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});};
  var short=function(v){return v>=1e6?'R$ '+(v/1e6).toLocaleString('pt-BR',{maximumFractionDigits:2})+' mi':v>=1e4?'R$ '+Math.round(v/1e3)+' mil':brl(v);};
  var ic=function(id,st){return '<svg class="ico"'+(st?' style="'+st+'"':'')+'><use href="#'+id+'"/></svg>';};
  var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
  var waLink=function(msg){return 'https://wa.me/'+WA+'?text='+encodeURIComponent(msg);};
  var store={get:function(k,d){try{var v=localStorage.getItem(k);return v===null?d:JSON.parse(v);}catch(e){return d;}},set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
  function toast(msg){var t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove();},2600);}

  /* ---------- Tema claro / escuro ---------- */
  var root=document.documentElement,mq=matchMedia('(prefers-color-scheme: dark)');
  function isDark(){var a=root.getAttribute('data-theme');return a?a==='dark':mq.matches;}
  var tours=[];
  function themeChanged(){
    var m=$('meta[name="theme-color"]');if(m)m.content=isDark()?'#081226':'#0B2A5B';
    $$('.theme-btn').forEach(function(b){b.setAttribute('aria-pressed',isDark()?'true':'false');});
    setTimeout(function(){tours.forEach(function(t){t&&t.refreshTheme();});},30);
  }
  document.addEventListener('click',function(e){
    if(!e.target.closest('.theme-btn'))return;
    var next=isDark()?'light':'dark';root.setAttribute('data-theme',next);
    try{localStorage.setItem('tema',next);}catch(err){}
    themeChanged();toast(next==='dark'?'Modo escuro ativado':'Modo claro ativado');
  });
  if(mq.addEventListener)mq.addEventListener('change',themeChanged);
  themeChanged();

  /* ---------- Header e WhatsApp flutuante ---------- */
  var hdr=$('#topo'),wa=$('.wa-float'),hero=$('.hero');
  function onScroll(){var y=scrollY;hdr.classList.toggle('scrolled',y>10);wa.classList.toggle('show',y>hero.offsetTop+hero.offsetHeight-200);}
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  /* ---------- Menu mobile ---------- */
  var drawer=$('#drawer'),mo=$('#menu-open');
  function closeDrawer(){drawer.hidden=true;mo.setAttribute('aria-expanded','false');}
  mo.addEventListener('click',function(){drawer.hidden=false;mo.setAttribute('aria-expanded','true');$('.d-top [data-close]',drawer).focus();});
  drawer.addEventListener('click',function(e){if(e.target.closest('[data-close]'))closeDrawer();});

  /* ---------- Slideshow do hero ---------- */
  var slides=$$('.slide'),bars=$$('.si-bars button'),heroIds=['GS106','GS109','GS112'],cur=0;
  function go(n){
    cur=(n+slides.length)%slides.length;
    slides.forEach(function(s,i){s.classList.toggle('on',i===cur);});
    bars.forEach(function(b,i){b.classList.remove('on');b.classList.toggle('done',i<cur);});
    void bars[cur].offsetWidth;bars[cur].classList.add('on');
    var im=BYID[heroIds[cur]];$('#si-t').textContent=im.tipo+' em '+im.bairro;$('#si-p').textContent=im.q+' quartos · '+im.m+' m² · '+brl(im.preco);
  }
  bars.forEach(function(b,i){b.addEventListener('click',function(){go(i);});$('i',b).addEventListener('animationend',function(){if(i===cur)go(cur+1);});});
  var si=$('.si-txt');si.style.cursor='pointer';si.title='Ver imóvel';si.addEventListener('click',function(){openRoute(heroIds[cur]);});
  go(0);if(reduce)bars[0].classList.add('done');

  /* ---------- Filtros ---------- */
  var RANGES={
    venda:{min:200000,max:900000,step:10000,presets:[[0,300000,'Até R$ 300 mil'],[300000,500000,'R$ 300 a 500 mil'],[500000,900000,'Acima de R$ 500 mil']]},
    loc:{min:1000,max:4000,step:100,presets:[[0,1500,'Até R$ 1.500'],[1500,2500,'R$ 1.500 a 2.500'],[2500,4000,'Acima de R$ 2.500']]}
  };
  var F;
  function resetF(fin){var r=RANGES[fin||'venda'];F={fin:fin||'venda',pmin:r.min,pmax:r.max,tipos:[],bairro:'',q:0,v:0,area:0,extras:[],sort:F?F.sort:'preco-asc'};}
  resetF('venda');
  var bairros=[];IM.forEach(function(i){if(bairros.indexOf(i.bairro)<0)bairros.push(i.bairro);});bairros.sort();
  bairros.forEach(function(b){$('#f-bairro').insertAdjacentHTML('beforeend','<option>'+esc(b)+'</option>');$('#h-bairro').insertAdjacentHTML('beforeend','<option>'+esc(b)+'</option>');});
  ['Pq. Res. Cocaia','Grajaú','Interlagos','Jd. Varginha'].forEach(function(b){$('.search .chips').insertAdjacentHTML('beforeend','<button type="button" class="chip" data-hb="'+esc(b)+'">'+esc(b.replace('Pq. Res. ',''))+'</button>');});
  function numBtns(el,key,lbl){el.innerHTML=[0,1,2,3,4].map(function(n){return '<button type="button" data-n="'+n+'" aria-pressed="false" aria-label="'+(n?n+' ou mais '+lbl:'Qualquer quantidade')+'">'+(n?n+'+':'Todos')+'</button>';}).join('');
    el.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;F[key]=+b.dataset.n;apply();});}
  numBtns($('#f-quartos'),'q','quartos');numBtns($('#f-vagas'),'v','vagas');

  var pMin=$('#p-min'),pMax=$('#p-max');
  function setupRange(){var r=RANGES[F.fin];[pMin,pMax].forEach(function(i){i.min=r.min;i.max=r.max;i.step=r.step;});
    $('#p-presets').innerHTML=r.presets.map(function(p){return '<button type="button" class="chip" data-pmin="'+p[0]+'" data-pmax="'+p[1]+'">'+p[2]+'</button>';}).join('');}
  function fmtIn(v){return v.toLocaleString('pt-BR');}
  function syncUI(){
    var r=RANGES[F.fin];
    $$('[data-ffin]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.ffin===F.fin?'true':'false');});
    pMin.value=Math.max(r.min,F.pmin);pMax.value=F.pmax;
    var a=(pMin.value-r.min)/(r.max-r.min)*100,b=(pMax.value-r.min)/(r.max-r.min)*100;
    $('#p-fill').style.left=a+'%';$('#p-fill').style.width=(b-a)+'%';
    $('#o-pmin').textContent=F.pmin<=r.min?'Sem mínimo':short(F.pmin)+(F.fin==='loc'?'/mês':'');
    $('#o-pmax').textContent=F.pmax>=r.max?'Sem limite':short(F.pmax)+(F.fin==='loc'?'/mês':'');
    if(document.activeElement!==$('#p-min-n'))$('#p-min-n').value=F.pmin<=r.min?'':fmtIn(F.pmin);
    if(document.activeElement!==$('#p-max-n'))$('#p-max-n').value=F.pmax>=r.max?'':fmtIn(F.pmax);
    $$('#p-presets .chip').forEach(function(c){var lo=+c.dataset.pmin,hi=+c.dataset.pmax;c.setAttribute('aria-pressed',(Math.max(lo,r.min)===Math.max(F.pmin,r.min)&&hi===F.pmax)?'true':'false');});
    $$('#f-tipos .chip').forEach(function(c){c.setAttribute('aria-pressed',F.tipos.indexOf(c.dataset.tipo)>=0?'true':'false');});
    $('#f-bairro').value=F.bairro;
    $$('#f-quartos button').forEach(function(b){b.setAttribute('aria-pressed',+b.dataset.n===F.q?'true':'false');});
    $$('#f-vagas button').forEach(function(b){b.setAttribute('aria-pressed',+b.dataset.n===F.v?'true':'false');});
    $('#f-area').value=F.area;$('#o-area').textContent=F.area?F.area+' m²':'qualquer área';
    $$('[data-extra]').forEach(function(c){c.checked=F.extras.indexOf(c.dataset.extra)>=0;});
    $('#f-sort').value=F.sort;
  }
  function has(i,x){
    if(x==='suite')return i.s>0;
    if(x==='piscina')return i.itens.some(function(t){return /^Piscina/.test(t);});
    if(x==='financiamento')return i.itens.indexOf('Aceita financiamento')>=0;
    if(x==='pet')return i.itens.indexOf('Aceita pet')>=0;
    return true;
  }
  function results(){
    var r=RANGES[F.fin];
    var list=IM.filter(function(i){
      if(i.fin!==F.fin)return false;
      if(F.pmin>r.min&&i.preco<F.pmin)return false;
      if(F.pmax<r.max&&i.preco>F.pmax)return false;
      if(F.tipos.length&&F.tipos.indexOf(i.tipo)<0)return false;
      if(F.bairro&&i.bairro!==F.bairro)return false;
      if(i.q<F.q||i.v<F.v||i.m<F.area)return false;
      return F.extras.every(function(x){return has(i,x);});
    });
    var s=F.sort;
    list.sort(function(a,b){
      if(s==='preco-desc')return b.preco-a.preco;
      if(s==='area-desc')return b.m-a.m;
      if(s==='m2-asc')return a.preco/a.m-b.preco/b.m;
      if(s==='novo')return b.ano-a.ano;
      return a.preco-b.preco;
    });
    return list;
  }
  var favs=store.get('favs',[]);
  function priceHTML(i){return brl(i.preco)+(i.fin==='loc'?' <small>/mês</small>':'');}
  function priceSub(i){return i.fin==='venda'?brl(Math.round(i.preco/i.m))+'/m²'+(i.cond?' · cond. '+brl(i.cond):''):'Total '+brl(i.preco+i.cond+i.iptu)+'/mês com cond. e IPTU';}
  function card(i){
    var fav=favs.indexOf(i.id)>=0;
    return '<article class="card rv" data-id="'+i.id+'">'+
      '<div class="ph" data-i="0" data-n="'+i.gal.length+'">'+
        '<div class="track">'+i.gal.map(function(g,k){return '<img src="img/'+g+'.webp" alt="'+(k?'':esc(i.tipo+' em '+i.bairro))+'" loading="lazy">';}).join('')+'</div>'+
        '<div class="badges"><span class="badge '+(i.fin==='venda'?'b-venda':'b-loc')+'">'+(i.fin==='venda'?'Venda':'Locação')+'</span>'+(i.novo?'<span class="badge b-new">Novo</span>':'')+'</div>'+
        '<button class="fav" type="button" aria-pressed="'+fav+'" aria-label="Favoritar">'+ic('i-heart')+'</button>'+
        '<button class="pv" type="button" aria-label="Foto anterior">'+ic('i-left')+'</button>'+
        '<button class="nx" type="button" aria-label="Próxima foto">'+ic('i-right')+'</button>'+
        '<div class="dots" aria-hidden="true">'+i.gal.map(function(_,k){return '<i class="'+(k?'':'on')+'"></i>';}).join('')+'</div>'+
        '<button class="b3d" type="button" data-open3d="'+i.id+'">'+ic('i-cube')+'Tour 3D</button>'+
        '<span class="photos">'+ic('i-camera')+i.fotos+'</span>'+
      '</div>'+
      '<div class="body">'+
        '<div class="price">'+priceHTML(i)+'</div><div class="price-sub">'+priceSub(i)+'</div>'+
        '<h3>'+esc(i.tipo)+(i.q?' com '+i.q+(i.q>1?' quartos':' quarto'):'')+'</h3>'+
        '<div class="loc">'+ic('i-pin')+esc(i.bairro)+', São Paulo</div>'+
        '<div class="feats"><span><b>'+ic('i-bed')+i.q+'</b>quartos</span><span><b>'+ic('i-bath')+i.b+'</b>banheiros</span><span><b>'+ic('i-car')+i.v+'</b>vagas</span><span><b>'+ic('i-area')+i.m+'</b>m²</span></div>'+
        '<div class="card-foot"><a class="btn btn-primary" href="#imovel-'+i.id+'">Ver detalhes</a>'+
        '<a class="wa-mini" href="'+waLink('Olá! Tenho interesse no imóvel Ref. '+i.id+' ('+i.tipo+' em '+i.bairro+').')+'" target="_blank" rel="noopener" aria-label="Perguntar no WhatsApp">'+ic('i-wa')+'</a></div>'+
      '</div></article>';
  }
  function tagsHTML(){
    var r=RANGES[F.fin],t=[];
    if(F.pmin>r.min||F.pmax<r.max)t.push(['preco',(F.pmin>r.min?short(F.pmin):'até')+(F.pmin>r.min&&F.pmax<r.max?' – ':' ')+(F.pmax<r.max?short(F.pmax):'ou mais')]);
    F.tipos.forEach(function(x){t.push(['tipo:'+x,x]);});
    if(F.bairro)t.push(['bairro',F.bairro]);
    if(F.q)t.push(['q',F.q+'+ quartos']);if(F.v)t.push(['v',F.v+'+ vagas']);if(F.area)t.push(['area','a partir de '+F.area+' m²']);
    var names={suite:'Com suíte',piscina:'Com piscina',financiamento:'Aceita financiamento',pet:'Aceita pet'};
    F.extras.forEach(function(x){t.push(['x:'+x,names[x]]);});
    return t.map(function(p){return '<button class="tag-x" type="button" data-rm="'+esc(p[0])+'">'+esc(p[1])+ic('i-x')+'</button>';}).join('');
  }
  function apply(){
    syncUI();
    var list=results(),n=list.length;
    $('#r-count').textContent=n+(n===1?' imóvel encontrado':' imóveis encontrados')+(F.fin==='loc'?' para alugar':' à venda');
    $('#f-count').textContent=n;
    $('#active-tags').innerHTML=tagsHTML();
    var grid=$('#cards');
    grid.innerHTML=n?list.map(card).join(''):
      '<div class="empty">'+ic('i-search')+'<h3>Nenhum imóvel com esses filtros</h3><p>Tente ampliar a faixa de preço ou tirar algum filtro. A corretora também pode procurar para você.</p>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><button class="btn btn-blue btn-sm" type="button" data-clear>Limpar filtros</button>'+
      '<a class="btn btn-wa btn-sm" href="'+waLink('Olá! Procuro imóvel na Zona Sul e não achei no site. Pode me ajudar?')+'" target="_blank" rel="noopener">'+ic('i-wa')+'Pedir pelo WhatsApp</a></div></div>';
    watch(grid);
  }
  $('#filters').addEventListener('click',function(e){
    var b;
    if((b=e.target.closest('[data-ffin]'))&&b.dataset.ffin!==F.fin){resetFin(b.dataset.ffin);return;}
    if((b=e.target.closest('#f-tipos .chip'))){var k=F.tipos.indexOf(b.dataset.tipo);if(k<0)F.tipos.push(b.dataset.tipo);else F.tipos.splice(k,1);apply();return;}
    if((b=e.target.closest('#p-presets .chip'))){var r=RANGES[F.fin],lo=Math.max(+b.dataset.pmin,r.min),hi=+b.dataset.pmax;
      if(b.getAttribute('aria-pressed')==='true'){F.pmin=r.min;F.pmax=r.max;}else{F.pmin=lo;F.pmax=hi;}apply();}
  });
  function resetFin(fin){var keep=F;resetF(fin);F.tipos=keep.tipos;F.bairro=keep.bairro;F.q=keep.q;F.v=keep.v;F.area=keep.area;F.extras=keep.extras;setupRange();apply();}
  pMin.addEventListener('input',function(){var v=+pMin.value;if(v>+pMax.value-RANGES[F.fin].step){v=+pMax.value-RANGES[F.fin].step;pMin.value=v;}F.pmin=v;apply();});
  pMax.addEventListener('input',function(){var v=+pMax.value;if(v<+pMin.value+RANGES[F.fin].step){v=+pMin.value+RANGES[F.fin].step;pMax.value=v;}F.pmax=v;apply();});
  function parseN(s){var n=parseInt(String(s).replace(/\D/g,''),10);return isNaN(n)?null:n;}
  $('#p-min-n').addEventListener('change',function(){var r=RANGES[F.fin],n=parseN(this.value);F.pmin=n===null?r.min:Math.min(Math.max(n,r.min),F.pmax);apply();});
  $('#p-max-n').addEventListener('change',function(){var r=RANGES[F.fin],n=parseN(this.value);F.pmax=n===null?r.max:Math.max(Math.min(n,r.max),F.pmin);apply();});
  $('#f-bairro').addEventListener('change',function(){F.bairro=this.value;apply();});
  $('#f-area').addEventListener('input',function(){F.area=+this.value;apply();});
  $$('[data-extra]').forEach(function(c){c.addEventListener('change',function(){var x=c.dataset.extra,k=F.extras.indexOf(x);if(c.checked&&k<0)F.extras.push(x);if(!c.checked&&k>=0)F.extras.splice(k,1);apply();});});
  $('#f-sort').addEventListener('change',function(){F.sort=this.value;apply();});
  function clearAll(){resetF(F.fin);setupRange();apply();}
  $('#f-clear').addEventListener('click',clearAll);
  $('#active-tags').addEventListener('click',function(e){var b=e.target.closest('[data-rm]');if(!b)return;var k=b.dataset.rm,r=RANGES[F.fin];
    if(k==='preco'){F.pmin=r.min;F.pmax=r.max;}else if(k==='bairro')F.bairro='';else if(k==='q')F.q=0;else if(k==='v')F.v=0;else if(k==='area')F.area=0;
    else if(k.indexOf('tipo:')===0)F.tipos.splice(F.tipos.indexOf(k.slice(5)),1);else if(k.indexOf('x:')===0)F.extras.splice(F.extras.indexOf(k.slice(2)),1);apply();});
  // folha de filtros no celular
  var filt=$('#filters'),scrim=$('#f-scrim');
  function openF(){filt.classList.add('open');scrim.hidden=false;document.body.classList.add('lock','f-open');}
  function closeF(){filt.classList.remove('open');scrim.hidden=true;document.body.classList.remove('lock','f-open');}
  $('#open-f').addEventListener('click',openF);$('#close-f').addEventListener('click',closeF);scrim.addEventListener('click',closeF);
  $('#f-apply').addEventListener('click',function(){closeF();$('#imoveis').scrollIntoView({behavior:reduce?'auto':'smooth'});});

  // atalhos que preenchem filtros
  function goList(){closeDrawer();var el=$('#imoveis');setTimeout(function(){el.scrollIntoView({behavior:reduce?'auto':'smooth'});},10);}
  $$('[data-fin]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();resetF(a.dataset.fin);setupRange();apply();goList();});});
  $$('[data-preset]').forEach(function(b){b.addEventListener('click',function(){
    var p=b.dataset.preset;resetF(p==='aluguel'?'loc':'venda');setupRange();
    if(p==='casa')F.tipos=['Casa'];if(p==='sobrado')F.tipos=['Sobrado'];if(p==='apto')F.tipos=['Apartamento'];
    if(p==='piscina')F.extras=['piscina'];if(p==='barato')F.pmax=350000;
    apply();goList();});});

  // busca do hero
  var hfin='venda';
  function heroPrices(){var r=RANGES[hfin];$('#h-preco').innerHTML='<option value="">Qualquer valor</option>'+r.presets.map(function(p,k){return '<option value="'+k+'">'+p[2]+'</option>';}).join('');}
  $$('[data-hfin]').forEach(function(b){b.addEventListener('click',function(){hfin=b.dataset.hfin;$$('[data-hfin]').forEach(function(x){x.setAttribute('aria-selected',x===b?'true':'false');});heroPrices();});});
  heroPrices();
  $('.search .chips').addEventListener('click',function(e){var b=e.target.closest('[data-hb]');if(b)$('#h-bairro').value=b.dataset.hb;});
  $('#busca').addEventListener('submit',function(e){e.preventDefault();resetF(hfin);setupRange();
    var t=$('#h-tipo').value;if(t)F.tipos=[t];F.bairro=$('#h-bairro').value;
    var pk=$('#h-preco').value;if(pk!==''){var pr=RANGES[hfin].presets[+pk];F.pmin=Math.max(pr[0],RANGES[hfin].min);F.pmax=pr[1];}
    apply();goList();});

  /* ---------- Cards: fotos, favoritos, 3D ---------- */
  document.addEventListener('click',function(e){
    var fav=e.target.closest('.fav');
    if(fav){var id=fav.closest('[data-id]').dataset.id,k=favs.indexOf(id);if(k<0){favs.push(id);toast('Imóvel salvo nos favoritos');}else favs.splice(k,1);store.set('favs',favs);
      $$('[data-id="'+id+'"] .fav, .d-fav').forEach(function(f){f.setAttribute('aria-pressed',favs.indexOf(id)>=0?'true':'false');});return;}
    var nav=e.target.closest('.card .pv,.card .nx');
    if(nav){var ph=nav.closest('.ph'),n=+ph.dataset.n,i=((+ph.dataset.i)+(nav.classList.contains('nx')?1:-1)+n)%n;
      ph.dataset.i=i;$('.track',ph).style.transform='translateX(-'+(i*100)+'%)';$$('.dots i',ph).forEach(function(d,k){d.classList.toggle('on',k===i);});return;}
    var b3=e.target.closest('[data-open3d]');if(b3){openRoute(b3.dataset.open3d,'3d');return;}
    var ph2=e.target.closest('.card .ph');if(ph2&&!e.target.closest('button')){openRoute(ph2.closest('[data-id]').dataset.id);}
  });

  /* ---------- Bairros ---------- */
  $('#hoods').innerHTML=(window.BAIRROS||[]).map(function(b){var n=IM.filter(function(i){return i.bairro===b.nome;}).length;
    return '<button class="hood rv" type="button" data-hood="'+esc(b.nome)+'"><img src="img/'+b.img+'.webp" alt="" loading="lazy"><div><span class="spec">'+n+(n===1?' imóvel':' imóveis')+' · '+esc(b.sub)+'</span><h3>'+esc(b.nome)+'</h3><span class="go">Ver imóveis '+ic('i-arrow','width:16px;height:16px')+'</span></div></button>';}).join('');
  $('#hoods').addEventListener('click',function(e){var b=e.target.closest('[data-hood]');if(!b)return;var fin=IM.some(function(i){return i.bairro===b.dataset.hood&&i.fin===F.fin;})?F.fin:'venda';resetF(fin);setupRange();F.bairro=b.dataset.hood;apply();goList();});

  /* ---------- Tour 3D ---------- */
  function stageUI(stage,ctl){
    var ui=document.createElement('div');ui.className='stage-ui';
    ui.innerHTML='<button type="button" data-a="inside" aria-pressed="false">'+ic('i-eye')+'Ver por dentro</button>'+
      '<button type="button" data-a="night" aria-pressed="false">'+ic('i-moon')+'Noite</button>'+
      '<button type="button" data-a="rotate" aria-pressed="true">'+ic('i-rotate')+'Girar</button>';
    stage.appendChild(ui);
    var hint=document.createElement('div');hint.className='stage-hint';hint.textContent='Arraste para girar · aproxime com dois dedos ou a roda do mouse';stage.appendChild(hint);
    stage.addEventListener('tour3d:interact',function(){hint.style.opacity=0;var r=$('[data-a="rotate"]',ui);r.setAttribute('aria-pressed','false');},{once:true});
    ui.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);
      if(b.dataset.a==='inside')ctl.setInside(on);if(b.dataset.a==='night')ctl.setNight(on);if(b.dataset.a==='rotate')ctl.setRotate(on);});
  }
  function mountTour(stage,im){
    var loading=document.createElement('div');loading.className='stage-loading';loading.textContent='Carregando maquete 3D…';
    stage.innerHTML='';stage.appendChild(loading);
    return window.Tour3D.load().then(function(){
      loading.remove();var ctl=window.Tour3D.mount(stage,im);if(!ctl)return null;
      tours.push(ctl);stageUI(stage,ctl);return ctl;
    }).catch(function(){stage.innerHTML='<div class="stage-fallback">Não foi possível carregar o 3D agora. Veja as fotos do imóvel.</div>';return null;});
  }
  function unmount(ctl){if(!ctl)return;ctl.dispose();var k=tours.indexOf(ctl);if(k>=0)tours.splice(k,1);}
  // vitrine
  var scPick=$('#sc-pick'),scStage=$('#sc-stage'),scCtl=null,scStarted=false;
  scPick.innerHTML=IM.map(function(i){return '<option value="'+i.id+'"'+(i.id==='GS106'?' selected':'')+'>'+esc(i.tipo+' · '+i.bairro+' · '+short(i.preco))+'</option>';}).join('');
  function startShowcase(){scStarted=true;unmount(scCtl);scCtl=null;mountTour(scStage,BYID[scPick.value]).then(function(c){scCtl=c;});}
  scPick.addEventListener('change',startShowcase);
  $('#sc-open').addEventListener('click',function(){openRoute(scPick.value,'3d');});
  if('IntersectionObserver' in window){var sio=new IntersectionObserver(function(es){if(es[0].isIntersecting&&!scStarted){startShowcase();sio.disconnect();}},{rootMargin:'300px'});sio.observe(scStage);}
  else startShowcase();

  /* ---------- Página de detalhes ---------- */
  var det=$('#detail'),dCtl=null,dId=null,lastFocus=null,savedY=0,pushed=false;
  function days(){var out=[],d=new Date(),wd=['dom','seg','ter','qua','qui','sex','sáb'];
    while(out.length<6){d.setDate(d.getDate()+1);if(d.getDay()!==0)out.push({k:d.toISOString().slice(0,10),w:wd[d.getDay()],n:d.getDate(),m:d.getMonth()+1,sat:d.getDay()===6});}return out;}
  function parcela(v){var fin=v*.8,i=Math.pow(1.105,1/12)-1,n=360;return fin*i/(1-Math.pow(1+i,-n));}
  function similar(im){return IM.filter(function(i){return i.id!==im.id&&i.fin===im.fin;}).sort(function(a,b){return (a.tipo===im.tipo?0:1)-(b.tipo===im.tipo?0:1)||Math.abs(a.preco-im.preco)-Math.abs(b.preco-im.preco);}).slice(0,3);}
  function detailHTML(im){
    var isV=im.fin==='venda',fav=favs.indexOf(im.id)>=0,t=im.tipo+(im.q?' com '+im.q+(im.q>1?' quartos':' quarto'):'')+' em '+im.bairro;
    var feats=[['i-area',im.m+' m²','área útil'],['i-bed',im.q,im.s?'quartos · '+im.s+(im.s>1?' suítes':' suíte'):'quartos'],['i-bath',im.b,'banheiros'],['i-car',im.v,'vagas']];
    if(im.terreno)feats.push(['i-map',im.terreno+' m²','terreno']);feats.push(['i-cal',im.ano,'ano de construção']);
    var dl=isV?
      '<dt>Condomínio</dt><dd>'+(im.cond?brl(im.cond)+'/mês':'Não tem')+'</dd><dt>IPTU</dt><dd>'+brl(im.iptu)+'/ano</dd><dt>Preço por m²</dt><dd>'+brl(Math.round(im.preco/im.m))+'</dd>':
      '<dt>Aluguel</dt><dd>'+brl(im.preco)+'</dd><dt>Condomínio</dt><dd>'+(im.cond?brl(im.cond):'Não tem')+'</dd><dt>IPTU</dt><dd>'+brl(im.iptu)+'</dd><dt>Total por mês</dt><dd class="total">'+brl(im.preco+im.cond+im.iptu)+'</dd>';
    var ds=days();
    return '<div class="d-bar"><div class="wrap">'+
        '<button class="btn btn-ghost btn-sm" type="button" data-dclose>'+ic('i-back','width:17px;height:17px')+'Voltar</button>'+
        '<span class="ref">Ref. '+im.id+'</span>'+
        '<div class="acts"><button class="icon-btn theme-btn" type="button" aria-label="Alternar modo claro e escuro">'+ic('i-moon').replace('class="ico"','class="ico moon"')+ic('i-sun').replace('class="ico"','class="ico sun"')+'</button>'+
        '<button class="icon-btn" type="button" data-share aria-label="Compartilhar">'+ic('i-share')+'</button>'+
        '<span data-id="'+im.id+'" style="display:contents"><button class="icon-btn fav d-fav" style="position:static;width:42px;height:42px;border:1px solid var(--line)" type="button" aria-pressed="'+fav+'" aria-label="Favoritar">'+ic('i-heart')+'</button></span></div>'+
      '</div></div>'+
      '<div class="wrap d-media">'+
        '<div class="d-tabs" role="tablist" aria-label="Mídia do imóvel"><button type="button" role="tab" data-dtab="fotos" aria-selected="true">'+ic('i-camera')+'Fotos</button><button type="button" role="tab" data-dtab="3d" aria-selected="false">'+ic('i-cube')+'Tour 3D</button></div>'+
        '<div class="gal" id="d-fotos">'+im.gal.slice(0,3).map(function(g,k){return '<button type="button" data-lb="'+k+'" aria-label="Ampliar foto '+(k+1)+'"><img src="img/'+g+'.webp" alt="'+(k?'':esc(t))+'"'+(k?' loading="lazy"':'')+'>'+(k===0?'<span class="all">'+ic('i-grid','width:16px;height:16px')+'Ver '+im.gal.length+' fotos</span>':'')+'</button>';}).join('')+'</div>'+
        '<div class="d-stage" id="d-3d" hidden></div>'+
      '</div>'+
      '<div class="wrap d-main">'+
        '<div class="d-info">'+
          '<div class="d-title"><div class="d-badges"><span class="badge '+(isV?'b-venda':'b-loc')+'" style="border:1px solid var(--line)">'+(isV?'Venda':'Locação')+'</span>'+(im.novo?'<span class="badge b-new">Novo</span>':'')+'</div>'+
          '<h1 id="d-title">'+esc(t)+'</h1><div class="loc">'+ic('i-pin')+esc(im.bairro)+', São Paulo – SP</div></div>'+
          '<div class="d-feats">'+feats.map(function(f){return '<div class="d-feat">'+ic(f[0])+'<b>'+f[1]+'</b><span>'+f[2]+'</span></div>';}).join('')+'</div>'+
          '<section class="d-sec"><h2>Sobre o imóvel</h2><p>'+esc(im.desc)+'</p></section>'+
          '<section class="d-sec"><h2>Diferenciais</h2><ul class="amen">'+im.itens.map(function(x){return '<li>'+ic('i-check')+esc(x)+'</li>';}).join('')+'</ul></section>'+
          '<section class="d-sec"><h2>Veja em 3D</h2><p style="margin-bottom:12px">Passeie pela maquete com a planta dos cômodos. Medidas e móveis são ilustrativos.</p><button class="btn btn-blue" type="button" data-goto3d>'+ic('i-cube')+'Abrir tour 3D</button></section>'+
          '<section class="d-sec"><h2>Localização</h2><div class="map d-map"><div class="pin"><span>'+ic('i-house')+'</span></div><div class="addr"><b>'+esc(im.bairro)+', São Paulo</b><br>O endereço exato é informado no agendamento da visita.</div></div></section>'+
          '<section class="d-sec similar"><h2>Imóveis parecidos</h2><div class="grid">'+similar(im).map(card).join('')+'</div></section>'+
        '</div>'+
        '<aside class="d-side">'+
          '<div class="price-card">'+
            '<span class="spec" style="color:var(--orange-ink)">'+(isV?'Valor de venda':'Aluguel mensal')+'</span>'+
            '<div class="price">'+priceHTML(im)+'</div>'+
            '<dl>'+dl+'</dl>'+
            '<form class="visit" id="visit-form"><span class="f-label">Agendar visita</span>'+
              '<div class="days" role="group" aria-label="Dia da visita">'+ds.map(function(d,k){return '<button type="button" class="day" data-day="'+d.w+' '+d.n+'/'+d.m+'" data-sat="'+d.sat+'" aria-pressed="'+(k===0)+'"><span>'+d.w+'</span><b>'+d.n+'</b></button>';}).join('')+'</div>'+
              '<div class="periods" role="group" aria-label="Período"><button type="button" data-per="manhã" aria-pressed="true">Manhã</button><button type="button" data-per="tarde" aria-pressed="false">Tarde</button></div>'+
              '<div class="field"><label for="v-nome">Seu nome</label><input id="v-nome" required autocomplete="name"></div>'+
              '<button class="btn btn-primary btn-block" type="submit">'+ic('i-cal')+'Agendar pelo WhatsApp</button>'+
              '<div class="visit-ok" id="visit-ok" hidden><span class="ck">'+ic('i-check')+'</span><span>Abrimos o WhatsApp com o pedido de visita. É só tocar em enviar.</span></div>'+
            '</form>'+
            '<a class="btn btn-wa btn-block" href="'+waLink('Olá! Tenho interesse no imóvel Ref. '+im.id+' ('+t+'). Pode me passar mais informações?')+'" target="_blank" rel="noopener">'+ic('i-wa')+'Perguntar no WhatsApp</a>'+
          '</div>'+
          (isV?'<div class="mini-sim"><div><span>Parcela estimada</span><b>'+brl(parcela(im.preco))+'/mês</b><span>20% de entrada · 30 anos</span></div><a class="link" href="#simulador" data-simv="'+im.preco+'">Simular</a></div>':
            '<div class="mini-sim"><div><span>Para alugar você precisa de</span><b>RG, CPF e renda</b><span>cerca de 3x o aluguel</span></div><a class="link" href="#duvidas" data-dclose-to="duvidas">Ver mais</a></div>')+
        '</aside>'+
      '</div>';
  }
  function setTab(tab){
    var im=BYID[dId];if(!im)return;
    $$('[data-dtab]',det).forEach(function(b){b.setAttribute('aria-selected',b.dataset.dtab===tab?'true':'false');});
    $('#d-fotos',det).hidden=tab!=='fotos';var st=$('#d-3d',det);st.hidden=tab!=='3d';
    if(tab==='3d'&&!dCtl&&!st.dataset.started){st.dataset.started='1';mountTour(st,im).then(function(c){if(dId===im.id)dCtl=c;else unmount(c);});}
  }
  function openDetail(id,tab){
    var im=BYID[id];if(!im){return;}
    if(dId!==id){closeDetailDom();}
    if(det.hidden){savedY=scrollY;lastFocus=document.activeElement;}
    dId=id;det.innerHTML=detailHTML(im);det.hidden=false;det.scrollTop=0;document.body.classList.add('lock');
    document.title=im.tipo+' em '+im.bairro+' · Gestora Imobiliária Sandra Barbosa';
    setTab(tab==='3d'?'3d':'fotos');watch(det);
    setTimeout(function(){var b=$('[data-dclose]',det);if(b)b.focus({preventScroll:true});},50);
  }
  function closeDetailDom(){unmount(dCtl);dCtl=null;if(!det.hidden){det.hidden=true;det.innerHTML='';document.body.classList.remove('lock');document.title='Gestora Imobiliária Sandra Barbosa';window.scrollTo(0,savedY);if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});}dId=null;}
  function openRoute(id,tab){pushed=true;location.hash='imovel-'+id+(tab==='3d'?'-3d':'');}
  function closeRoute(after){
    if(pushed){pushed=false;history.back();if(after)setTimeout(after,80);}
    else{history.replaceState(null,'',location.pathname+location.search);closeDetailDom();if(after)after();}
  }
  function route(){
    var m=/^#imovel-([A-Z0-9]+)(-3d)?$/.exec(location.hash);
    if(m)openDetail(m[1],m[2]?'3d':'fotos');else{closeDetailDom();closeLB();}
  }
  addEventListener('hashchange',route);
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href^="#imovel-"]');
    if(a){e.preventDefault();var m=/#imovel-([A-Z0-9]+)/.exec(a.getAttribute('href'));if(m){if(!det.hidden){history.replaceState(null,'','#imovel-'+m[1]);openDetail(m[1]);}else openRoute(m[1]);}}
  });
  det.addEventListener('click',function(e){
    var b;
    if(e.target.closest('[data-dclose]')){closeRoute();return;}
    if((b=e.target.closest('[data-dtab]'))){setTab(b.dataset.dtab);return;}
    if(e.target.closest('[data-goto3d]')){setTab('3d');$('.d-media',det).scrollIntoView({behavior:reduce?'auto':'smooth'});return;}
    if((b=e.target.closest('[data-lb]'))){openLB(+b.dataset.lb);return;}
    if((b=e.target.closest('.day'))){$$('.day',det).forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});return;}
    if((b=e.target.closest('[data-per]'))){$$('[data-per]',det).forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});return;}
    if(e.target.closest('[data-share]')){var url=location.href,ti=document.title;
      if(navigator.share){navigator.share({title:ti,url:url}).catch(function(){});}
      else if(navigator.clipboard){navigator.clipboard.writeText(url).then(function(){toast('Link do imóvel copiado');},function(){toast(url);});}else toast(url);return;}
    if((b=e.target.closest('[data-simv]'))){e.preventDefault();var v=+b.dataset.simv;closeRoute(function(){$('#s-valor').value=Math.min(1000000,v);sim();$('#simulador').scrollIntoView({behavior:reduce?'auto':'smooth'});});return;}
    if((b=e.target.closest('[data-dclose-to]'))){e.preventDefault();var to=b.dataset.dcloseTo;closeRoute(function(){$('#'+to).scrollIntoView({behavior:reduce?'auto':'smooth'});});}
  });
  det.addEventListener('submit',function(e){
    if(e.target.id!=='visit-form')return;e.preventDefault();var im=BYID[dId];
    var d=$('.day[aria-pressed="true"]',det),p=$('[data-per][aria-pressed="true"]',det),n=$('#v-nome',det).value.trim();
    var msg='Olá! Sou '+n+' e quero agendar uma visita ao imóvel Ref. '+im.id+' ('+im.tipo+' em '+im.bairro+') na '+d.dataset.day+', período da '+p.dataset.per+'.';
    window.open(waLink(msg),'_blank','noopener');$('#visit-ok',det).hidden=false;
  });

  /* ---------- Lightbox ---------- */
  var lb=$('#lightbox'),lbI=0,lbList=[];
  function drawLB(){
    lb.innerHTML='<div class="lb-top"><span>'+(lbI+1)+' de '+lbList.length+'</span><button class="icon-btn" type="button" data-lbclose aria-label="Fechar fotos">'+ic('i-x')+'</button></div>'+
      '<div class="lb-img"><img src="img/'+lbList[lbI]+'.webp" alt="Foto '+(lbI+1)+'"><button class="pv" type="button" aria-label="Foto anterior">'+ic('i-left')+'</button><button class="nx" type="button" aria-label="Próxima foto">'+ic('i-right')+'</button></div>'+
      '<div class="lb-thumbs">'+lbList.map(function(g,k){return '<button type="button" data-k="'+k+'" aria-current="'+(k===lbI)+'" aria-label="Foto '+(k+1)+'"><img src="img/'+g+'.webp" alt=""></button>';}).join('')+'</div>';
  }
  function openLB(i){lbList=BYID[dId].gal;lbI=i;drawLB();lb.hidden=false;$('[data-lbclose]',lb).focus();}
  function closeLB(){if(!lb.hidden){lb.hidden=true;lb.innerHTML='';}}
  function stepLB(d){lbI=(lbI+d+lbList.length)%lbList.length;drawLB();}
  lb.addEventListener('click',function(e){var b;if(e.target.closest('[data-lbclose]')){closeLB();return;}
    if(e.target.closest('.pv')){stepLB(-1);return;}if(e.target.closest('.nx')){stepLB(1);return;}
    if((b=e.target.closest('[data-k]'))){lbI=+b.dataset.k;drawLB();}});
  var tx=null;lb.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;},{passive:true});
  lb.addEventListener('touchend',function(e){if(tx===null)return;var dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)>50)stepLB(dx<0?1:-1);tx=null;});
  addEventListener('keydown',function(e){
    if(!lb.hidden){if(e.key==='Escape')closeLB();if(e.key==='ArrowRight')stepLB(1);if(e.key==='ArrowLeft')stepLB(-1);return;}
    if(e.key==='Escape'){if(!det.hidden)closeRoute();else if(!drawer.hidden){closeDrawer();mo.focus();}else if(filt.classList.contains('open'))closeF();}
  });

  /* ---------- Modal de avaliação ---------- */
  var dlg=$('#modal-aval');
  document.addEventListener('click',function(e){var b=e.target.closest('.js-aval');if(!b)return;e.preventDefault();
    $('#aval-form').hidden=false;$('#aval-ok').hidden=true;if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');});
  dlg.addEventListener('click',function(e){if(e.target===dlg||e.target.closest('[data-mclose]'))dlg.close();});
  $('#aval-form').addEventListener('submit',function(e){e.preventDefault();
    var msg='Olá! Sou '+$('#a-nome').value.trim()+' ('+$('#a-tel').value.trim()+'). Quero uma avaliação gratuita: '+$('#a-fin').value.toLowerCase()+' '+$('#a-tipo').value.toLowerCase()+($('#a-bairro').value.trim()?' no bairro '+$('#a-bairro').value.trim():'')+'.';
    window.open(waLink(msg),'_blank','noopener');$('#aval-form').hidden=true;$('#aval-ok').hidden=false;});

  /* ---------- Simulador ---------- */
  function sim(){
    var valor=+$('#s-valor').value,ent=+$('#s-ent').value,anos=+$('#s-prazo').value;
    var fin=valor*(1-ent/100),i=Math.pow(1.105,1/12)-1,n=anos*12,parc=fin*i/(1-Math.pow(1+i,-n));
    $('#o-valor').textContent=brl(valor);$('#o-ent').textContent=ent+'%';$('#o-prazo').textContent=anos+' anos';
    $('#o-parc').textContent=brl(parc);$('#o-fin').textContent=brl(fin);$('#o-entv').textContent=brl(valor*ent/100);$('#o-renda').textContent=brl(parc/.3);
  }
  ['#s-valor','#s-ent','#s-prazo'].forEach(function(s){$(s).addEventListener('input',sim);});sim();

  /* ---------- Newsletter ---------- */
  $('#news-form').addEventListener('submit',function(e){e.preventDefault();$('#news-ok').hidden=false;});

  /* ---------- Revelação ao rolar ---------- */
  var rvIO=('IntersectionObserver' in window&&!reduce)?new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');rvIO.unobserve(en.target);}});},{rootMargin:'0px 0px 12% 0px'}):null;
  function watch(r){if(rvIO)$$('.rv:not(.in)',r).forEach(function(el){rvIO.observe(el);});}

  /* ---------- Início ---------- */
  setupRange();apply();watch(document);
  if(/^#imovel-/.test(location.hash)){pushed=false;route();}
})();
