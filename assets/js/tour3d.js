/* Tour 3D: maquete gerada a partir da planta de cada imóvel (three.js r128, global THREE).
   Tour3D.mount(elemento, imovel) → { setInside, setNight, setRotate, refreshTheme, dispose } */
(function(){
  'use strict';
  var C={wall:0xF4F1EB,wallIn:0xEAE5DC,navy:0x0B2A5B,orange:0xF26B1D,wood:0xB9844F,floorWood:0xCDA57B,floorLight:0xE1C49F,
    tile:0xDDE2E9,bathTile:0xBCD7EA,glass:0x9EC0D6,roof:0x3B4559,grass:0x6E9A57,lot:0xC9BFAC,path:0xCBC4B8,water:0x3BA3DA,
    white:0xFFFFFF,dark:0x2E3A4F,sofa:0x1F4FBF,bed:0xF7F6F2,leaf:0x5C8F4C,trunk:0x7A5536,car:0x51617A,slab:0xA3ACBA,tower:0xD9DEE6};

  function mat(color,opts){var o={color:color,roughness:.85,metalness:0};if(opts)for(var k in opts)o[k]=opts[k];return new THREE.MeshStandardMaterial(o);}
  function box(w,h,d,m,x,y,z,noShadow){
    var g=new THREE.BoxGeometry(w,h,d);g.translate(0,h/2,0);
    var me=new THREE.Mesh(g,m);me.position.set(x,y,z);
    if(!noShadow){me.castShadow=true;me.receiveShadow=true;}
    return me;
  }
  function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
  function label(text){
    var c=document.createElement('canvas'),s=2;c.width=320*s;c.height=72*s;
    var x=c.getContext('2d');x.scale(s,s);x.font='700 28px Manrope, Inter, sans-serif';
    var w=Math.min(310,x.measureText(text).width+36);
    x.fillStyle='rgba(7,28,61,.9)';rr(x,(320-w)/2,12,w,48,24);x.fill();
    x.fillStyle='#F26B1D';x.beginPath();x.arc((320-w)/2+20,36,5,0,7);x.fill();
    x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';x.fillText(text,160+6,37);
    var t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;
    var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true,opacity:0}));
    sp.scale.set(2.9,.65,1);sp.renderOrder=20;return sp;
  }

  /* ---------- Plantas ---------- */
  function plan(im){
    var k=im.modelo.kind,q=im.q,s=im.s;
    function qn(i){return (s>0&&i===0)?'Suíte':'Quarto '+(i+1);}
    if(k==='sobrado'){
      var W=8.6,D=9,h=D/2;
      var ground=[
        {n:'Sala de estar',t:'sala',x0:-W/2,x1:W/2,z0:0,z1:h},
        {n:'Cozinha',t:'cozinha',x0:-W/2,x1:1,z0:-h,z1:0},
        {n:'Lavabo',t:'banho',x0:1,x1:W/2,z0:-h,z1:-1.7},
        {n:'Escada',t:'escada',x0:1,x1:W/2,z0:-1.7,z1:0}];
      var slots=[[-W/2,.6,0,h],[.6,W/2,0,h],[-W/2,.6,-h,0]];
      var upper=[];
      for(var i=0;i<3;i++){var sl=slots[i];upper.push({n:i<q?qn(i):'Escritório',t:i<q?'quarto':'escritorio',x0:sl[0],x1:sl[1],z0:sl[2],z1:sl[3]});}
      upper.push({n:'Banheiro',t:'banho',x0:.6,x1:W/2,z0:-h,z1:-1.5});
      upper.push({n:'Hall',t:'escada',x0:.6,x1:W/2,z0:-1.5,z1:0});
      return {W:W,D:D,floors:[ground,upper]};
    }
    if(k==='apto'){
      var W2=q>=3?10:q===1?7:8.6,D2=7.4,h2=D2/2,bath=2.3,rooms=[];
      if(q===1){
        rooms.push({n:'Sala e cozinha',t:'sala',x0:-W2/2,x1:W2/2,z0:0,z1:h2});
        rooms.push({n:'Quarto',t:'quarto',x0:-W2/2,x1:W2/2-bath,z0:-h2,z1:0});
      }else{
        rooms.push({n:'Sala',t:'sala',x0:-W2/2,x1:W2/2-3.2,z0:0,z1:h2});
        rooms.push({n:'Cozinha',t:'cozinha',x0:W2/2-3.2,x1:W2/2,z0:0,z1:h2});
        var bw=(W2-bath)/q;
        for(var j=0;j<q;j++)rooms.push({n:qn(j),t:'quarto',x0:-W2/2+j*bw,x1:-W2/2+(j+1)*bw,z0:-h2,z1:0});
      }
      rooms.push({n:'Banheiro',t:'banho',x0:W2/2-bath,x1:W2/2,z0:-h2,z1:0});
      return {W:W2,D:D2,floors:[rooms],balcony:true};
    }
    // casa térrea
    var W3=q>=4?14:q===3?12:10.4,D3=9,h3=D3/2,bath3=2.4,r=[];
    r.push({n:'Sala de estar',t:'sala',x0:-W3/2,x1:W3/2-4,z0:0,z1:h3});
    r.push({n:'Cozinha',t:'cozinha',x0:W3/2-4,x1:W3/2,z0:0,z1:h3});
    var bw3=(W3-bath3)/q;
    for(var m=0;m<q;m++)r.push({n:qn(m),t:'quarto',x0:-W3/2+m*bw3,x1:-W3/2+(m+1)*bw3,z0:-h3,z1:0});
    r.push({n:'Banheiro',t:'banho',x0:W3/2-bath3,x1:W3/2,z0:-h3,z1:0});
    return {W:W3,D:D3,floors:[r]};
  }

  /* ---------- Construção ---------- */
  function build(im,M){
    var P=plan(im),H=3,root=new THREE.Group(),walls=[],extras=[],roofs=[],labels=[],glows=[],uppers=[];
    var W=P.W,D=P.D,isApto=im.modelo.kind==='apto';

    // Terreno / entorno
    if(isApto){
      var sl=box(60,.4,60,M.slab,0,-.4,0,true);sl.receiveShadow=true;root.add(sl);
      var tw=[[-26,7,-22],[24,9,-20],[-30,5,8],[28,6,12],[3,10,-34],[-12,4,-36],[36,8,-4]];
      tw.forEach(function(t){var b=box(5+Math.abs(t[0])%3,t[1],5,M.tower,t[0],-.4,t[2]);root.add(b);
        var top=box(5+Math.abs(t[0])%3+.2,.3,5.2,M.navyM,t[0],t[1]-.4,t[2]);root.add(top);});
    }else{
      var grass=new THREE.Mesh(new THREE.CircleGeometry(48,48),M.grass);grass.rotation.x=-Math.PI/2;grass.position.y=-.02;grass.receiveShadow=true;root.add(grass);
      var lotD=D+(im.modelo.pool?14:10),lotW=W+(im.modelo.garage>0?9:6);
      var lot=box(lotW,.08,lotD,M.lot,(im.modelo.garage>0?-2.2:0),0,-(im.modelo.pool?2.4:0),true);lot.receiveShadow=true;root.add(lot);
      var street=box(80,.04,6,M.dark,0,0,lotD/2-(im.modelo.pool?2.4:0)+4,true);street.receiveShadow=true;root.add(street);
      for(var sx=-36;sx<40;sx+=4){root.add(box(1.8,.05,.18,M.whiteM,sx,0,lotD/2-(im.modelo.pool?2.4:0)+4,true));}
      var walk=box(1.4,.1,lotD/2-D/2+(im.modelo.pool?-2.4:0)+0.2,M.path,0,0,D/2+(lotD/2-D/2+(im.modelo.pool?-2.4:0))/2,true);root.add(walk);
      // árvores
      var trees=[[-W/2-3,D/2+2.5],[W/2+2.5,-D/2-2],[-W/2-2.8,-D/2-3.5],[W/2+3.5,D/2+3]];
      trees.forEach(function(t,i){
        var g=new THREE.Group(),h=1.4+(i%2)*.6;
        g.add(box(.25,h,.25,M.trunk,0,0,0));
        var c=new THREE.Mesh(new THREE.IcosahedronGeometry(1.2+(i%3)*.25,0),M.leaf);c.position.y=h+.9;c.castShadow=true;g.add(c);
        g.position.set(t[0],0,t[1]);root.add(g);
      });
      // garagem
      if(im.modelo.garage>0){
        var gx=-W/2-2.6,gz=D/2-2.6,cars=Math.min(im.modelo.garage,2);
        root.add(box(4.4,.1,5.6,M.path,gx,0,gz+.6,true));
        [[-2.1,-2.2],[2.1,-2.2],[-2.1,3],[2.1,3]].forEach(function(p){root.add(box(.14,2.5,.14,M.navyM,gx+p[0],0,gz+p[1]));});
        var cp=box(4.6,.16,5.6,M.roofM,gx,2.5,gz+.4);root.add(cp);roofs.push({m:cp,y:2.5,lift:0});
        for(var c2=0;c2<cars;c2++){
          var car=new THREE.Group(),cxo=cars===2?(c2?1:-1)*1.05:0;
          car.add(box(1.7,.55,3.6,M.carM,0,.25,0));car.add(box(1.5,.5,2,M.glassDark,0,.8,-.2));
          [[-.8,-1.1],[.8,-1.1],[-.8,1.1],[.8,1.1]].forEach(function(w){var wh=new THREE.Mesh(new THREE.CylinderGeometry(.33,.33,.22,14),M.dark);wh.rotation.z=Math.PI/2;wh.position.set(w[0],.33,w[1]);car.add(wh);});
          car.scale.set(cars===2?.55:.9,.9,.9);car.position.set(gx+cxo,0,gz+.6);root.add(car);
        }
      }
      // piscina
      if(im.modelo.pool){
        var pz=-D/2-4.4,pw=Math.min(W-2,7);
        root.add(box(pw+2.4,.12,4.6,M.deck,0,0,pz,true));
        root.add(box(pw+.4,.16,3.4,M.whiteM,0,0,pz,true));
        var water=box(pw,.18,3,M.water,0,.02,pz,true);root.add(water);glows.push({m:water.material,day:0x000000,night:0x1E7FC0,i:.9});
        [-1,1].forEach(function(sg){var ch=new THREE.Group();ch.add(box(.7,.25,1.6,M.whiteM,0,0,0));ch.position.set(sg*(pw/2+.6),.12,pz-1.2);root.add(ch);});
      }
    }

    // Andares
    P.floors.forEach(function(rooms,fi){
      var g=new THREE.Group(),base=fi*H;g.position.y=base;root.add(g);
      if(fi>0)uppers.push(g);
      // piso / laje
      g.add(box(W+.2,.14,D+.2,M.slabM,0,-.14,0,true));
      rooms.forEach(function(r){
        var cx=(r.x0+r.x1)/2,cz=(r.z0+r.z1)/2,rw=r.x1-r.x0,rd=r.z1-r.z0;
        var fm=r.t==='banho'?M.bath:r.t==='cozinha'?M.tile:r.t==='quarto'||r.t==='escritorio'?M.floorLight:M.floorWood;
        g.add(box(rw-.06,.04,rd-.06,fm,cx,0,cz,true));
        furnish(g,r,cx,cz,rw,rd,M);
        var lb=label(r.n);lb.position.set(cx,2.2,cz);g.add(lb);labels.push(lb);
      });
      // paredes internas (bordas compartilhadas)
      var seen={};
      rooms.forEach(function(r){
        [[r.x0,r.z0,r.x1,r.z0],[r.x0,r.z1,r.x1,r.z1],[r.x0,r.z0,r.x0,r.z1],[r.x1,r.z0,r.x1,r.z1]].forEach(function(e){
          var onEdge=(e[1]===e[3]&&Math.abs(Math.abs(e[1])-D/2)<.01)||(e[0]===e[2]&&Math.abs(Math.abs(e[0])-W/2)<.01);
          if(onEdge)return;
          var key=e.map(function(v){return v.toFixed(2)}).join(',');if(seen[key])return;seen[key]=1;
          var horiz=e[1]===e[3],len=horiz?e[2]-e[0]:e[3]-e[1];
          var gap=Math.min(.9,len*.35);
          // deixa uma porta no meio
          var a=(len-gap)/2;
          [0,1].forEach(function(side){
            var seg=a,off=side?(a+gap+seg/2):seg/2,wm;
            if(horiz)wm=box(seg,2.6,.12,M.wallInM,e[0]+off,0,e[1]);else wm=box(.12,2.6,seg,M.wallInM,e[0],0,e[1]+off);
            g.add(wm);walls.push({m:wm,full:1,cut:.42});
          });
        });
      });
      // paredes externas
      var t=.22,ew=[[W+t,t,0,D/2],[W+t,t,0,-D/2],[t,D,-W/2,0],[t,D,W/2,0]];
      ew.forEach(function(w,wi){
        var accent=(fi===P.floors.length-1&&wi===0&&!isApto)||(isApto&&wi===2);
        var m=box(w[0],H,w[1],accent?M.navyWall:M.wallM,w[2],0,w[3]);g.add(m);walls.push({m:m,full:1,cut:.3});
      });
      // janelas e porta
      var ext=new THREE.Group();g.add(ext);extras.push(ext);
      var nWin=Math.max(2,Math.round(W/3.2));
      for(var wi2=0;wi2<nWin;wi2++){
        var wx=-W/2+(wi2+.5)*W/nWin;
        if(!(fi===0&&!isApto&&Math.abs(wx)<1.1)){
          var gf=box(1.7,1.5,.08,M.glassM,wx,1.05,D/2+.13,true);ext.add(gf);
          ext.add(box(1.86,.1,.16,M.navyM,wx,.98,D/2+.14,true));
        }
        ext.add(box(1.5,1.2,.08,M.glassM,wx,1.3,-D/2-.13,true));
      }
      if(fi===0&&!isApto){ext.add(box(1.1,2.2,.1,M.orangeM,0,0,D/2+.14));ext.add(box(1.8,.12,1.2,M.navyM,0,2.5,D/2+.7));}
      // teto
      var top=box(W+.6,.24,D+.6,M.roofM,0,H,0);g.add(top);roofs.push({m:top,y:H,lift:2.5,group:g});
      if(fi===P.floors.length-1&&!isApto){top.add(box(W+.6,.5,.2,M.navyM,0,.24,(D+.6)/2-.1));}
    });

    // varanda do apartamento
    if(P.balcony){
      root.add(box(W,.14,1.8,M.deck,0,-.14,D/2+.9,true));
      var rail=box(W,1.05,.06,M.glassM,0,0,D/2+1.78,true);root.add(rail);
      root.add(box(W,.06,.1,M.navyM,0,1.05,D/2+1.78,true));
      var tb=new THREE.Group();tb.add(box(.8,.7,.8,M.woodM,0,0,0));tb.position.set(-W/4,0,D/2+.9);root.add(tb);
      var pl=new THREE.Mesh(new THREE.IcosahedronGeometry(.45,0),M.leaf);pl.position.set(W/2-.6,.75,D/2+1);pl.castShadow=true;root.add(pl);
      root.add(box(.6,.5,.6,M.whiteM,W/2-.6,0,D/2+1));
    }
    return {root:root,walls:walls,extras:extras,roofs:roofs,labels:labels,glows:glows,uppers:uppers,P:P,H:H,isApto:isApto};
  }

  function furnish(g,r,cx,cz,rw,rd,M){
    var add=function(o){g.add(o);};
    if(r.t==='sala'){
      var sx=cx-rw/2+Math.min(2.2,rw*.3);
      add(box(.9,.45,Math.min(2.6,rd*.6),M.sofaM,sx,0,cz));
      add(box(.25,.85,Math.min(2.6,rd*.6),M.sofaM,sx-.45,0,cz));
      add(box(1.8,.02,2.4,M.rug,sx+1.4,.04,cz,true));
      add(box(.8,.35,1.1,M.woodM,sx+1.5,0,cz));
      add(box(.4,.5,Math.min(2.2,rd*.5),M.navyM,cx+rw/2-.4,0,cz));
      add(box(.06,.9,Math.min(1.8,rd*.4),M.dark,cx+rw/2-.4,.55,cz));
      var p=new THREE.Mesh(new THREE.IcosahedronGeometry(.35,0),M.leaf);p.position.set(cx-rw/2+.5,.7,cz+rd/2-.5);p.castShadow=true;add(p);
      add(box(.45,.4,.45,M.whiteM,cx-rw/2+.5,0,cz+rd/2-.5));
    }else if(r.t==='cozinha'){
      add(box(Math.min(rw-.6,3),.9,.65,M.woodM,cx,0,cz-rd/2+.45));
      add(box(Math.min(rw-.6,3)+.04,.06,.7,M.whiteM,cx,.9,cz-rd/2+.45));
      add(box(1.4,.75,.9,M.woodM,cx,0,cz+.4));
      add(box(1.5,.05,1,M.whiteM,cx,.75,cz+.4));
      add(box(.65,1.9,.65,M.whiteM,cx+rw/2-.5,0,cz-rd/2+.45));
    }else if(r.t==='quarto'){
      var bw=Math.min(1.6,rw-.8),bx=cx,bz=cz-rd/2+1.2;
      add(box(bw,.45,2,M.bedM,bx,0,bz));
      add(box(bw+.1,1,.12,M.navyM,bx,0,bz-1.02));
      add(box(bw*.4,.15,.4,M.whiteM,bx-bw*.25,.45,bz-.7));add(box(bw*.4,.15,.4,M.whiteM,bx+bw*.25,.45,bz-.7));
      add(box(bw,.08,1.1,M.orangeM,bx,.45,bz+.4));
      if(rw>2.6)add(box(.6,1.9,1.4,M.woodM,cx+rw/2-.4,0,cz+rd/2-1));
    }else if(r.t==='banho'){
      add(box(.95,.05,.95,M.whiteM,cx-rw/2+.6,0,cz-rd/2+.6));
      add(box(.04,1.9,.95,M.glassM,cx-rw/2+1.08,0,cz-rd/2+.6,true));
      add(box(.4,.42,.55,M.whiteM,cx+rw/2-.45,0,cz+rd/2-.5));
      add(box(.7,.85,.45,M.woodM,cx+rw/2-.5,0,cz-rd/2+.35));
    }else if(r.t==='escritorio'){
      add(box(1.4,.75,.7,M.woodM,cx,0,cz-rd/2+.6));
      add(box(.5,.9,.5,M.navyM,cx,0,cz-rd/2+1.3));
      add(box(.6,.4,.05,M.dark,cx,.75,cz-rd/2+.4));
    }else if(r.t==='escada'){
      for(var i=0;i<8;i++)add(box(Math.min(1,rw-.3),.18*(i+1),.3,M.woodM,cx,0,cz-rd/2+.3+i*.3*Math.min(1,(rd-.4)/2.4)));
    }
  }

  function materials(){
    var glass=mat(C.glass,{transparent:true,opacity:.55,roughness:.1,metalness:.2,emissive:0x000000});
    return {
      grass:mat(C.grass),lot:mat(C.lot),path:mat(C.path),dark:mat(C.dark),slab:mat(C.slab),slabM:mat(0xD4CFC6),
      tower:mat(C.tower),wallM:mat(C.wall),wallInM:mat(C.wallIn),navyWall:mat(C.navy),navyM:mat(C.navy),orangeM:mat(C.orange),
      woodM:mat(C.wood),floorWood:mat(C.floorWood),floorLight:mat(C.floorLight),tile:mat(C.tile),bath:mat(C.bathTile),
      glassM:glass,glassDark:mat(0x2B3A52,{roughness:.2,metalness:.3}),roofM:mat(C.roof,{transparent:true,opacity:1}),
      water:mat(C.water,{roughness:.1,metalness:.1,emissive:0x000000}),whiteM:mat(C.white),deck:mat(0xA87B52),
      sofaM:mat(C.sofa),bedM:mat(C.bed),rug:mat(0xC9B79C),leaf:mat(C.leaf,{flatShading:true}),trunk:mat(C.trunk),carM:mat(C.car,{roughness:.4,metalness:.3})
    };
  }

  function mount(el,im){
    if(!window.THREE){el.innerHTML='<div class="stage-fallback">Não foi possível carregar o 3D.</div>';return null;}
    var renderer;
    try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});}
    catch(e){el.innerHTML='<div class="stage-fallback">Seu navegador não exibe 3D. Veja as fotos do imóvel.</div>';return null;}
    var dpr=Math.min(window.devicePixelRatio||1,2);
    renderer.setPixelRatio(dpr);renderer.outputEncoding=THREE.sRGBEncoding;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.82;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    var scene=new THREE.Scene(),M=materials(),B=build(im,M);
    scene.add(B.root);
    var themeBg=new THREE.Color(getComputedStyle(el).getPropertyValue('--scene-bg').trim()||'#E7EEF9');
    var nightBg=new THREE.Color(0x07132B),bg=themeBg.clone();
    scene.background=bg;scene.fog=new THREE.Fog(bg,75,150);

    var hemi=new THREE.HemisphereLight(0xFFFFFF,0x6F7F99,.62);scene.add(hemi);
    var sun=new THREE.DirectionalLight(0xFFF1DE,1.0);sun.position.set(14,20,10);sun.castShadow=true;
    sun.shadow.mapSize.set(1024,1024);var sc=sun.shadow.camera;sc.left=-20;sc.right=20;sc.top=20;sc.bottom=-20;sc.near=1;sc.far=60;sun.shadow.bias=-.0006;
    scene.add(sun);
    var warm=new THREE.PointLight(0xFFB56B,0,26,1.6);warm.position.set(0,2.4,0);scene.add(warm);
    var warm2=new THREE.PointLight(0xFFB56B,0,20,1.6);warm2.position.set(0,2.4+B.H,0);if(B.uppers.length)B.uppers[0].add(warm2);

    var camera=new THREE.PerspectiveCamera(38,1,.1,300);
    var size=Math.max(B.P.W,B.P.D),dist=size*1.9+(B.uppers.length?5:3);
    var home=new THREE.Vector3(dist*.82,dist*.5,dist*.98);
    camera.position.copy(home).multiplyScalar(1.6);
    var controls=new THREE.OrbitControls(camera,renderer.domElement);
    controls.target.set(0,B.uppers.length?2.6:1.4,0);controls.enableDamping=true;controls.dampingFactor=.08;
    controls.enablePan=false;controls.minDistance=size*.9;controls.maxDistance=dist*2.2;controls.maxPolarAngle=1.42;
    controls.autoRotate=true;controls.autoRotateSpeed=.7;
    var intro=0,userMoved=false;
    controls.addEventListener('start',function(){userMoved=true;intro=1;el.dispatchEvent(new CustomEvent('tour3d:interact'));});

    var st={inside:0,insideT:0,night:0,nightT:0};
    var glassDay=new THREE.Color(0x000000),glassNight=new THREE.Color(0xFFC27A),tmp=new THREE.Color();

    var homeBase=home.clone();
    function resize(){var w=el.clientWidth||600,h=el.clientHeight||400;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
      var a=w/h,fit=a<1.25?Math.pow(1.25/a,.8):1;home.copy(homeBase).multiplyScalar(fit);controls.maxDistance=dist*2.2*fit;
      if(intro>=1&&!userMoved)camera.position.copy(home);}
    resize();
    var ro=window.ResizeObserver?new ResizeObserver(resize):null;if(ro)ro.observe(el);else window.addEventListener('resize',resize);

    var visible=true,raf=0,last=performance.now();
    var io=window.IntersectionObserver?new IntersectionObserver(function(es){visible=es[0].isIntersecting;if(visible&&!raf)loop(performance.now());}):null;
    if(io)io.observe(el);

    function loop(now){
      raf=0;if(!visible||document.hidden)return;
      var dt=Math.min(.05,(now-last)/1000);last=now;var k=1-Math.exp(-dt*5);
      if(intro<1){intro=Math.min(1,intro+dt*.7);var e=1-Math.pow(1-intro,3);camera.position.lerpVectors(home.clone().multiplyScalar(1.6),home,e);}
      st.inside+=(st.insideT-st.inside)*k;st.night+=(st.nightT-st.night)*k;
      var ins=st.inside,ni=st.night;
      B.walls.forEach(function(w){w.m.scale.y=1-(1-w.cut)*ins;});
      B.extras.forEach(function(g){g.visible=ins<.5;});
      B.roofs.forEach(function(r){r.m.material.opacity=1-ins;r.m.visible=ins<.98;r.m.position.y=r.y+ins*r.lift;});
      B.uppers.forEach(function(g){g.position.y=B.H+ins*3.4;});
      B.labels.forEach(function(l){l.material.opacity=Math.max(0,(ins-.55)/.45);l.visible=ins>.55;});
      hemi.intensity=.62-.48*ni;sun.intensity=1.0-.92*ni;
      hemi.color.setHSL(.6,.25*ni,1-.35*ni);
      tmp.copy(glassDay).lerp(glassNight,ni);M.glassM.emissive.copy(tmp);M.glassM.emissiveIntensity=1.1*ni;
      B.glows.forEach(function(g){g.m.emissive.setHex(g.night);g.m.emissiveIntensity=g.i*ni;});
      warm.intensity=1.6*ni;warm2.intensity=1.4*ni;
      bg.copy(themeBg).lerp(nightBg,ni);scene.fog.color.copy(bg);
      controls.update();renderer.render(scene,camera);
      raf=requestAnimationFrame(loop);
    }
    raf=requestAnimationFrame(loop);
    function vis(){if(!document.hidden&&visible&&!raf){last=performance.now();loop(last);}}
    document.addEventListener('visibilitychange',vis);

    return {
      setInside:function(b){st.insideT=b?1:0;if(b&&!userMoved){}},
      setNight:function(b){st.nightT=b?1:0;},
      setRotate:function(b){controls.autoRotate=!!b;},
      refreshTheme:function(){themeBg.set(getComputedStyle(el).getPropertyValue('--scene-bg').trim()||'#E7EEF9');},
      reset:function(){camera.position.copy(home);controls.target.set(0,B.uppers.length?2.6:1.4,0);},
      dispose:function(){
        cancelAnimationFrame(raf);raf=0;visible=false;if(ro)ro.disconnect();if(io)io.disconnect();
        document.removeEventListener('visibilitychange',vis);controls.dispose();
        scene.traverse(function(o){if(o.geometry)o.geometry.dispose();if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose();}});
        renderer.dispose();if(renderer.forceContextLoss)renderer.forceContextLoss();
        if(renderer.domElement.parentNode)renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }

  /* Carrega three.js só quando o 3D é aberto */
  var loading=null;
  function load(){
    if(window.THREE&&window.THREE.OrbitControls)return Promise.resolve();
    if(loading)return loading;
    function s(src){return new Promise(function(res,rej){var t=document.createElement('script');t.src=src;t.onload=res;t.onerror=rej;document.head.appendChild(t);});}
    loading=s('assets/vendor/three.min.js').then(function(){return s('assets/vendor/OrbitControls.js');});
    return loading;
  }

  window.Tour3D={mount:mount,load:load};
})();
