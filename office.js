import * as THREE from 'three';
import { createAgentTeam } from './agents.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Real procedural architecture. No AI services, panorama geometry or remote assets.
export async function createOffice({selectZone,onFailure,onQuality}) {
  const stage = document.querySelector('#scene');
  const renderer = new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:false});
  const scene = new THREE.Scene();
  const sky = new THREE.Color('#111d29');
  scene.background = sky;
  scene.fog = new THREE.Fog('#233443',38,120);
  const skyCanvas=document.createElement('canvas');skyCanvas.width=32;skyCanvas.height=512;
  const skyContext=skyCanvas.getContext('2d'),skyGradient=skyContext.createLinearGradient(0,0,0,512);
  skyGradient.addColorStop(0,'#0b1421');skyGradient.addColorStop(.3,'#233443');skyGradient.addColorStop(1,'#233443');
  skyContext.fillStyle=skyGradient;skyContext.fillRect(0,0,32,512);scene.background=new THREE.CanvasTexture(skyCanvas);scene.background.colorSpace=THREE.SRGBColorSpace;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.10;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  let lowQuality = false, paused = false, failed = false;
  let width = innerWidth, height = innerHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1,1.25));
  renderer.setSize(width,height);
  renderer.domElement.setAttribute('aria-hidden','true');
  stage.append(renderer.domElement);
  renderer.domElement.addEventListener('webglcontextlost', e => {e.preventDefault();failed=true;onFailure('A renderização 3D foi interrompida. Recarregue a página ou abra a apresentação offline.');});
  const camera = new THREE.PerspectiveCamera(36,width/height,.1,180);
  camera.position.set(27,15.7,31);
  const controls = new OrbitControls(camera,renderer.domElement);
  controls.target.set(0,3.7,0);
  controls.enableDamping = true;
  controls.dampingFactor = .075;
  controls.enablePan = false;
  controls.rotateSpeed = .55;
  controls.zoomSpeed = .7;
  controls.minDistance = 12;
  controls.maxDistance = 85;
  controls.minPolarAngle = Math.PI/6;
  controls.maxPolarAngle = Math.PI/2.03;
  controls.update();
  RectAreaLightUniformsLib.init();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room,.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = .32;
  room.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#b2c9df','#44331f',.50));
  const moon = new THREE.DirectionalLight('#bdcfe4',1.05);
  moon.position.set(-13,26,17);moon.castShadow=true;
  moon.shadow.mapSize.set(2048,2048);
  Object.assign(moon.shadow.camera,{left:-23,right:23,top:21,bottom:-18,near:1,far:70});
  moon.shadow.bias=-.00035;moon.shadow.normalBias=.035;
  scene.add(moon);
  const sunset = new THREE.DirectionalLight('#f7cba1',1.0);
  sunset.position.set(13,12,-9);scene.add(sunset);
  // Broad ceiling emitters keep warm interiors legible without pin-point hotspots.
  const roomLights={};
  for(const [key,x,y,z] of [['think',-5.5,8.7,-.5],['create',5.5,8.7,.3],['build',-5.5,4.4,-.3],['grow',5.5,4.4,.4]]) {
    const light=new THREE.RectAreaLight('#ffcc98',5.5,7.5,5.0);
    light.position.set(x,y,z);light.lookAt(x,y-1,z);scene.add(light);roomLights[key]=light;
  }
  const receptionLight=new THREE.PointLight('#ffd0a0',45,9,2);
  receptionLight.position.set(.5,3.9,3.4);scene.add(receptionLight);
  const materials = {};
  function material(name,color,roughness=.7,metalness=0,extra={}) {return materials[name]=new THREE.MeshStandardMaterial({color,roughness,metalness,...extra});}
  const steel = material('steel','#222b31',.30,.78);
  const trim = material('trim','#546065',.35,.65);
  const oak = material('oak','#89633f',.68,.02,{emissive:'#8b5b2a',emissiveIntensity:.035});
  const oakDark = material('oakDark','#60402b',.79);
  const slab = material('slab','#686c68',.65,.09);
  const limestone = material('limestone','#ada897',.9);
  const concrete = material('concrete','#747b75',.82);
  const fabric = material('fabric','#a99b80',.93);
  const seatDark = material('seatDark','#3f4b49',.9);
  const leafMats = ['#3f5d45','#304c3b','#60744e'].map((c,i)=>material(`leaf${i}`,c,.94,0,{side:THREE.DoubleSide}));
  const pot = material('pot','#3e4a46',.82);
  const screen = material('screen','#1b323c',.44,.25,{emissive:'#789da3',emissiveIntensity:.45});
  const artWhite = material('artWhite','#e0d6be',.9);
  const artOchre = material('artOchre','#b37d4b',.86);
  const glass = materials.glass = new THREE.MeshPhysicalMaterial({color:'#b1c9d6',roughness:.14,metalness:.18,transparent:true,opacity:.14,depthWrite:false,side:THREE.DoubleSide,clearcoat:1,clearcoatRoughness:.1,envMapIntensity:1.2});
  const innerGlass = material('innerGlass','#adc4c6',.24,.18,{transparent:true,opacity:.085,depthWrite:false,side:THREE.DoubleSide});
  const warm = new THREE.MeshBasicMaterial({color:'#ffc58a',toneMapped:false});
  const warmDim = new THREE.MeshBasicMaterial({color:'#b38755'});
  const cool = new THREE.MeshBasicMaterial({color:'#b5d3d3'});
  function grainTexture(base,woodGrain=false) {
    const c=document.createElement('canvas');c.width=256;c.height=256;
    const ctx=c.getContext('2d');ctx.fillStyle=base;ctx.fillRect(0,0,256,256);
    let n=713;const rand=()=>{n=(n*16807)%2147483647;return n/2147483647;};
    for(let i=0;i<9000;i++) {
      const v=rand();ctx.fillStyle=v>.5?'rgba(255,245,225,.035)':'rgba(0,0,0,.045)';
      ctx.fillRect(rand()*256,rand()*256,woodGrain?1:2,woodGrain?8+rand()*55:2);
    }
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(woodGrain?3:4,woodGrain?1:4);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;
  }
  oak.map=grainTexture('#d5c4ab',true);
  limestone.map=grainTexture('#e5e2d9');concrete.map=limestone.map;slab.map=grainTexture('#ccc6ba');
  const facade=document.createElement('canvas');facade.width=256;facade.height=256;
  const fc=facade.getContext('2d');const fg=fc.createLinearGradient(0,0,0,256);
  fg.addColorStop(0,'#92b1c8');fg.addColorStop(.5,'#c0ccd0');fg.addColorStop(1,'#344e5a');fc.fillStyle=fg;fc.fillRect(0,0,256,256);
  fc.fillStyle='#e1e8e7';fc.globalAlpha=.25;fc.fillRect(15,0,2,256);fc.fillRect(20,0,6,256);
  glass.map=new THREE.CanvasTexture(facade);glass.map.colorSpace=THREE.SRGBColorSpace;glass.opacity=.12;
  // Curved leaf surfaces reduce polygon count and avoid pebble-like foliage.
  const leafShape=new THREE.Shape();leafShape.moveTo(0,-1);
  leafShape.quadraticCurveTo(-.8,-.15,0,1);leafShape.quadraticCurveTo(.8,-.15,0,-1);
  const leafGeometry=new THREE.ShapeGeometry(leafShape,4);
  const leafVertices=leafGeometry.attributes.position;
  for(let i=0;i<leafVertices.count;i++)leafVertices.setZ(i,.18*(1-leafVertices.getY(i)**2));
  leafGeometry.computeVertexNormals();
  const contactCanvas=document.createElement('canvas');contactCanvas.width=64;contactCanvas.height=64;
  const cc=contactCanvas.getContext('2d'),cg=cc.createRadialGradient(32,32,3,32,32,31);
  cg.addColorStop(0,'rgba(0,0,0,.23)');cg.addColorStop(.55,'rgba(0,0,0,.12)');cg.addColorStop(1,'rgba(0,0,0,0)');cc.fillStyle=cg;cc.fillRect(0,0,64,64);
  const contactMaterial=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(contactCanvas),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  const rugStrategy=material('rugStrategy','#4d5557',.98),rugMarketing=material('rugMarketing','#777367',.98),rugGrowth=material('rugGrowth','#536366',.98);
  const unitBox = new THREE.BoxGeometry(1,1,1);
  const sphereGeometry = new THREE.SphereGeometry(1,7,5);
  const cylinderGeometry = new THREE.CylinderGeometry(1,1,1,20);
  const architecture = new THREE.Group();scene.add(architecture);
  function box(x,y,z,w,h,d,m,parent=architecture) {const rounded=m===fabric||m===seatDark;const o=new THREE.Mesh(rounded?new RoundedBoxGeometry(w,h,d,2,Math.min(.07,h*.25)):unitBox,m);o.position.set(x,y,z);if(!rounded)o.scale.set(w,h,d);parent.add(o);return o;}
  function sphere(x,y,z,r,m,parent=architecture,scale=[1,1,1]) {const o=new THREE.Mesh(sphereGeometry,m);o.position.set(x,y,z);o.scale.set(r*scale[0],r*scale[1],r*scale[2]);parent.add(o);return o;}
  function cylinder(x,y,z,r,h,m,parent=architecture) {const o=new THREE.Mesh(cylinderGeometry,m);o.position.set(x,y,z);o.scale.set(r,h,r);parent.add(o);return o;}
  function group(x,y,z,rotation=0) {const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rotation;architecture.add(g);return g;}
  function contact(parent,w,d,z=0) {
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,d),contactMaterial);
    mesh.rotation.x=-Math.PI/2;mesh.position.set(0,.015,z);parent.add(mesh);
  }
  function rug(x,y,z,w,d,m) {
    const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,.018,d,2,.008),m);
    mesh.position.set(x,y,z);architecture.add(mesh);return mesh;
  }
  function bar(x,y,z,length,axis='x',m=warm) {return box(x,y,z,axis==='x'?length:.025,.022,axis==='z'?length:.025,m);}
  // Ground and a planted island: quiet context, without expensive planar reflections.
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),material('ground','#293a3d',.42,.24));
  ground.rotation.x=-Math.PI/2;ground.position.y=-.35;ground.receiveShadow=true;scene.add(ground);
  box(0,-.12,0,25,.4,17,concrete);
  box(0,.14,0,23.9,.2,16.2,steel);
  box(0,.29,0,23.3,.12,15.7,limestone);
  box(0,.36,0,21.1,.12,13.4,slab);
  for(const z of [7.88,-7.88])bar(0,.19,z,23.65);
  for(const x of [-11.9,11.9])bar(x,.19,0,15.7,'z');
  // Entrance stepping stones and fine paving joints.
  for(let i=0;i<4;i++){box(2.4,.02,9+i*1.15,3.4,.15,.88,concrete);bar(2.4,-.03,9.47+i*1.15,3.25,'x',warmDim);}
  for(let x=-20;x<=20;x+=2.4)box(x,-.335,13,.018,.006,16,trim);
  const pool = material('pool','#1e373e',.19,.62);
  box(-7,-.29,11,9,.045,4.3,pool);
  box(-11.65,-.19,11,.12,.23,4.4,concrete);
  box(-2.35,-.19,11,.12,.23,4.4,concrete);
  box(-7,-.19,13.2,9.4,.23,.12,concrete);
  // Two true storeys, restrained horizontal proportions.
  for(const y of [.58,4.85,9.10]) {
    box(0,y,0,21.2,.28,12.8,steel);
    box(0,y+.18,0,20.6,.08,12.15,slab);
  }
  // Timber soffits and individual slats are batched into one material draw.
  for(const y of [4.67,8.92]) {
    box(0,y,0,20.65,.06,12.15,oakDark);
    for(let x=-10.1;x<10.2;x+=.28)box(x,y-.045,0,.18,.055,12.03,oak);
    for(const z of [-5.35,5.99]){bar(0,y-.09,z,20.05);}
    for(const x of [-8,0,8])bar(x,y-.09,-.3,9.2,'z');
  }
  for(const x of [-10,0,10])for(const z of [-5.85,5.85])box(x,4.85,z,.18,8.4,.18,steel);
  // Glass on all sides, with mullions instead of a single opaque wall.
  for(const z of [-6.03,6.03]) {
    for(const y of [2.81,7.07]) {
      for(let x=-8.75;x<10;x+=2.5)box(x,y,z,2.46,3.95,.025,glass);
      box(0,y-1.99,z,20.4,.045,.08,trim);
    }
    for(let x=-10;x<=10;x+=2.5)box(x,4.85,z,.045,8.25,.075,steel);
  }
  for(const x of [-10.22,10.22]) {
    for(const y of [2.81,7.07])box(x,y,0,.025,3.95,12,glass);
    for(const z of [-3,0,3])box(x,4.85,z,.07,8.25,.045,steel);
  }
  // Solid service walls lend depth to the transparent pavilion.
  for(const y of [2.8,7.05]) {
    box(-5.4,y,-5.55,7.7,3.9,.18,oakDark);
    for(let x=-9.15;x<-1.6;x+=.19)box(x,y,-5.40,.075,3.9,.12,oak);
    box(5.7,y,-5.55,7.4,3.9,.16,limestone);
    box(.1,y,-4.9,2.4,3.9,1.25,concrete);
  }
  box(-1.2,6.95,-1.5,.025,3.7,7.5,innerGlass);
  box(1.45,6.95,-1.5,.025,3.7,7.5,innerGlass);
  box(-1.2,2.7,-1.5,.025,3.7,7.5,innerGlass);
  // Reception, shelving and meeting architecture.
  box(.5,1.22,3.4,3.8,.98,.95,oak);
  box(.5,1.75,3.4,3.95,.09,1.1,limestone);
  bar(.5,.84,3.89,3.5);
  for(const y of [1.1,2.05,3,3.95]) {
    box(-7.3,y,-5.02,4.6,.065,.57,oak);
    for(let k=0;k<7;k++)box(-9.1+k*.61,y+.28,-5.02,.15,.47,.29,k%3===0?artWhite:oakDark);
  }
  function chair(x,y,z,rotation=0,parent=architecture) {
    const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rotation;parent.add(g);
    box(0,.48,0,.61,.12,.59,seatDark,g);box(0,.83,-.22,.59,.59,.11,seatDark,g);
    cylinder(0,.22,0,.035,.45,trim,g);
    box(0,.04,0,.64,.045,.045,steel,g);box(0,.04,0,.045,.045,.6,steel,g);
    box(-.36,.66,0,.04,.035,.47,trim,g);box(.36,.66,0,.04,.035,.47,trim,g);
  }
  function desk(x,y,z,rotation=0) {
    const g=group(x,y,z,rotation);contact(g,2.8,2.3,.3);
    box(0,.76,0,2.32,.08,1.04,oak,g);
    for(const sx of [-.97,.97])box(sx,.38,0,.065,.72,.83,steel,g);
    box(0,1.25,-.21,1.02,.63,.065,steel,g);box(0,1.25,-.17,.96,.56,.012,screen,g);
    box(0,.95,-.21,.045,.3,.045,trim,g);
    box(0,.815,.2,.7,.025,.22,steel,g);
    box(.78,.835,.17,.19,.09,.25,artWhite,g);
    chair(0,0,1,Math.PI,g);
    // Screen UI is tiny geometry, not a floating futuristic dashboard.
    for(let i=0;i<3;i++)box(-.27,1.4-i*.11,-.158,.32+i*.08,.012,.008,cool,g);
  }
  function meeting(x,y,z,rotation=0) {
    const g=group(x,y,z,rotation);contact(g,5.4,3.7);
    box(0,.79,0,4.4,.11,1.6,oak,g);
    for(const xx of [-1.5,1.5])box(xx,.39,0,.16,.74,1.05,steel,g);
    for(const xx of [-1.5,0,1.5]){chair(xx,0,1.3,Math.PI,g);chair(xx,0,-1.3,0,g);}
    box(-.7,.88,0,.65,.025,.4,artWhite,g);box(.8,.89,0,.65,.03,.45,steel,g);
  }
  const lower=.79, upper=5.07;
  rug(-5.8,upper+.008,-.7,5.8,4.4,rugStrategy);
  rug(5.6,upper+.008,.7,5.8,4.4,rugMarketing);
  rug(6.2,lower+.008,1.0,5.8,5.6,rugGrowth);
  for(const x of [-7.6,-4.5])for(const z of [1.1,-2.6])desk(x,lower,z,0);
  meeting(-5.8,upper,-.7);
  // CREATE: shared worktable, material board and lounge.
  meeting(5.6,upper,.7,0);
  box(5.7,7.1,-5.39,5.8,2.3,.1,steel);
  for(let i=0;i<5;i++) {
    box(3.4+i*1.13,7.2+(i%2)*.2,-5.30,.86,1.25,.025,i%2?artOchre:artWhite);
    box(3.4+i*1.13,6.44,-5.28,.7,.04,.02,trim);
  }
  for(const x of [-7.2,-4.4,4.2,7]) {
    cylinder(x,8.45,.1,.014,.8,steel);
    cylinder(x,8.01,.1,.32,.08,steel);
    cylinder(x,7.96,.1,.27,.025,warm);
  }
  // GROW: conversational setting, visually distinct from the build laboratory.
  function sofa(x,y,z,rotation=0) {
    const g=group(x,y,z,rotation);
    box(0,.3,0,2.8,.5,1.04,fabric,g);box(0,.77,-.42,2.8,.69,.22,fabric,g);
    for(const xx of [-1.33,1.33])box(xx,.62,0,.19,.52,1.07,fabric,g);
    for(const xx of [-.75,.75])box(xx,.59,0,1.2,.12,.84,artWhite,g);
    for(const xx of [-1.1,1.1])for(const zz of [-.33,.33])box(xx,.08,zz,.055,.15,.055,steel,g);
  }
  sofa(5.5,lower,1.9,0);sofa(8.4,lower,0,-Math.PI/2);
  cylinder(5.7,lower+.46,-.25,.87,.07,oak);cylinder(5.7,lower+.22,-.25,.12,.43,steel);
  box(5.8,lower+.51,-.3,.5,.018,.36,artWhite);
  desk(4.1,lower,-3.3,0);desk(7.3,lower,-3.3,0);
  // A sculptural helical stair joins the two floors; the structure itself moves nowhere.
  cylinder(.1,2.88,-1.1,.09,4.3,trim);
  for(let i=0;i<25;i++) {
    const a=i/24*Math.PI*1.65;
    const g=group(.1,lower+i*(4.28/24),-1.1,-a);
    box(.82,0,0,1.5,.065,.4,oak,g);
    cylinder(1.56,.51,0,.014,1.02,trim,g);
  }
  const railPoints=[];
  for(let i=0;i<=80;i++) {const a=i/80*Math.PI*1.65;railPoints.push(new THREE.Vector3(.1+Math.cos(a)*1.56,lower+i/80*4.28+1.02,-1.1+Math.sin(a)*1.56));}
  architecture.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(railPoints),90,.025,6,false),trim));
  // Deterministic tree canopies: same silhouette on every launch and screenshot.
  let seed=42;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  function plant(x,y,z,size=1,tree=false) {
    cylinder(x,y+.25*size,z,.36*size,.5*size,pot);
    cylinder(x,y+(tree?1.2:.65)*size,z,.038*size,(tree?1.95:.8)*size,oakDark);
    if(tree)for(let j=0;j<5;j++){
      const a=j*2.399,from=new THREE.Vector3(x,y+1.3*size,z),to=new THREE.Vector3(x+Math.cos(a)*.48*size,y+(2.0+j*.11)*size,z+Math.sin(a)*.48*size);
      const direction=to.clone().sub(from),branch=new THREE.Mesh(cylinderGeometry,oakDark);
      branch.position.copy(from).add(to).multiplyScalar(.5);branch.scale.set(.018*size,direction.length(),.018*size);branch.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());architecture.add(branch);
    }
    const n=tree?340:32;
    for(let i=0;i<n;i++) {
      const a=i*2.399,vertical=2*random()-1,rad=Math.cbrt(random()),spread=Math.sqrt(1-vertical*vertical)*rad;
      const leaf=new THREE.Mesh(leafGeometry,leafMats[i%3]);
      leaf.position.set(x+Math.cos(a)*spread*(tree?.82:.43)*size,y+((tree?2.35:1.0)+vertical*rad*(tree?.85:.42))*size,z+Math.sin(a)*spread*(tree?.72:.43)*size);
      const length=(tree?.15:.14)*( .7+random()*.55)*size;
      leaf.scale.set(length,length,length);leaf.rotation.set(random()*Math.PI,random()*Math.PI,random()*Math.PI);architecture.add(leaf);
    }
  }
  for(const [x,z,s] of [[-9.2,4.7,.88],[-8.9,-4.6,.7],[9.1,4.7,.9],[1.9,-4.9,.7]]){plant(x,lower,z,s,true);plant(x,upper,z,s,true);}
  for(const [x,z] of [[-2.7,3.8],[2.5,3.9],[8.9,-4.5]])plant(x,upper,z,.7);
  // A real roof terrace, with a low glass balustrade and planted borders.
  box(0,9.3,0,20.8,.06,12.3,oakDark);
  for(let z=-5.6;z<5.7;z+=.50)box(0,9.35,z,20.25,.035,.475,oak);
  for(const z of [-5.9,5.9]) {
    box(0,9.9,z,20.5,1.05,.025,innerGlass);box(0,10.43,z,20.55,.035,.045,steel);
    for(const x of [-10,-5,0,5,10])box(x,9.91,z,.035,1.05,.035,steel);
  }
  for(const x of [-10.15,10.15])box(x,9.9,0,.025,1.05,11.8,innerGlass);
  for(const x of [-8.8,-6.6,6.7,9])plant(x,9.4,-4.7,.65,true);
  sofa(-6,9.4,1.2);sofa(-2.7,9.4,1.2);
  // Landscape beds with low green foliage and occasional taller trees.
  for(const [x,z,w,d] of [[-14,2.8,2.7,12],[13.8,-2,2.4,10],[-6,-9.8,12,2.2],[9.5,11,3,3]]) {
    box(x,-.03,z,w,.4,d,concrete);
    for(let i=0;i<13;i++)plant(x+(random()-.5)*(w-.7),.17,z+(random()-.5)*(d-.7),.3+random()*.25);
  }
  plant(-14.1,.18,-1.5,1.55,true);plant(14,.18,-9.9,1.5,true);plant(-12.7,.18,-8.5,1.9,true);
  const monitorCanvas=document.createElement('canvas');monitorCanvas.width=512;monitorCanvas.height=300;
  const mc=monitorCanvas.getContext('2d');mc.fillStyle='#182c34';mc.fillRect(0,0,512,300);
  mc.fillStyle='#a1babd';mc.font='500 18px sans-serif';mc.fillText('MITANG / RADAR V01',28,36);
  mc.fillStyle='#49616b';mc.fillRect(28,55,456,1);
  for(let i=0;i<4;i++){mc.fillStyle=i===0?'#c0aa87':'#68858c';mc.fillRect(28,85+i*38,80,7);mc.fillStyle='#344e58';mc.fillRect(130,85+i*38,150+i*38,7);}
  mc.fillStyle='#bda27c';mc.fillRect(355,233,127,25);
  const monitorTexture=new THREE.CanvasTexture(monitorCanvas);monitorTexture.colorSpace=THREE.SRGBColorSpace;
  screen.map=monitorTexture;screen.emissiveMap=monitorTexture;
  // Labels are architectural signage. Texture canvases are local and font-ready.
  function sign(text,x,y,z,w,color='#e5d6bc',rotation=0) {
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;
    const c=canvas.getContext('2d');c.clearRect(0,0,1024,256);c.fillStyle=color;
    c.font='500 95px Instrument, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(text,512,128);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,w/4),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide}));
    mesh.position.set(x,y,z);mesh.rotation.y=rotation;mesh.userData.noBatch=true;architecture.add(mesh);
  }
  sign('DEMANDA',-5.9,8.1,-5.26,3.4);sign('COMUNICACAO',5.7,8.48,-5.25,3.5);
  sign('MITANG RADAR',-6.9,3.8,-5.16,2.7);sign('PROSPECCAO',6.2,3.85,-5.35,2);
  // Original AERA PNG, used as a separate identity layer on the reception fascia.
  let logo;try{logo = await new THREE.TextureLoader().loadAsync(new URL('./assets/mitang-mark.png',import.meta.url).href);}catch{logo=new THREE.CanvasTexture(monitorCanvas);}
  logo.colorSpace=THREE.SRGBColorSpace;
  const logoMesh=new THREE.Mesh(new THREE.PlaneGeometry(2.1,2.1*179/825),new THREE.MeshBasicMaterial({map:logo,transparent:true,depthWrite:false}));
  logoMesh.position.set(.5,1.28,3.89);logoMesh.userData.noBatch=true;architecture.add(logoMesh);
  // Cheap ambient contact shadow, independent of the single sun shadow map.
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;
  const sc=shadowCanvas.getContext('2d'),gradient=sc.createRadialGradient(64,64,12,64,64,64);
  gradient.addColorStop(0,'rgba(0,0,0,.65)');gradient.addColorStop(.65,'rgba(0,0,0,.3)');gradient.addColorStop(1,'rgba(0,0,0,0)');sc.fillStyle=gradient;sc.fillRect(0,0,128,128);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(39,29),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=-.325;scene.add(shadow);
  // Merge static geometry by material: hundreds of architectural details, few draw calls.
  architecture.updateMatrixWorld(true);
  const batches=new Map(),remove=[];
  architecture.traverse(object=>{
    if(!object.isMesh||object.userData.noBatch)return;
    const geometry=object.geometry.clone().applyMatrix4(object.matrixWorld);
    if(!batches.has(object.material))batches.set(object.material,[]);
    batches.get(object.material).push(geometry);remove.push(object);
  });
  remove.forEach(object=>object.removeFromParent());
  for(const [m,geometries] of batches){
    const merged=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());
    const mesh=new THREE.Mesh(merged,m);mesh.castShadow=!m.transparent&&m.isMeshStandardMaterial;mesh.receiveShadow=!m.transparent&&m.isMeshStandardMaterial;
    scene.add(mesh);
  }
  unitBox.dispose();sphereGeometry.dispose();cylinderGeometry.dispose();leafGeometry.dispose();
  renderer.shadowMap.needsUpdate=true;
  // Model extension point: attach a future licensed GLB here, preserving navigation.
  const modelRoot=new THREE.Group();modelRoot.name='MITANG_GLTF_EXTENSION';scene.add(modelRoot);
  // A bounded mirror at the reflecting pool: actual scene reflection, no panorama.
  const reflection=new Reflector(new THREE.PlaneGeometry(9,4.25),{color:0x485e71,textureWidth:512,textureHeight:512,clipBias:.003});
  reflection.rotation.x=-Math.PI/2;reflection.position.set(-7,-.263,11);scene.add(reflection);
  const zonePositions={think:[-5.8,5.13,.7],create:[5.8,5.13,.7],grow:[5.8,.85,.7],build:[-5.8,.85,.7],control:[.5,.85,3.5]};
  const accents={};
  for(const [key,pos] of Object.entries(zonePositions)){
    const w=key==='control'?3.9:7.2,d=key==='control'?2.6:5.1;
    const corners=[[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,0,d/2],[-w/2,0,d/2]].map(p=>new THREE.Vector3(...p));
    const mesh=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(corners),new THREE.LineBasicMaterial({color:'#a1c6e6',transparent:true,opacity:0,depthWrite:false}));
    mesh.position.set(pos[0],pos[1],key==='think'?-.7:pos[2]);scene.add(mesh);accents[key]=mesh;
  }
  let highlightTransition=null,highlightedZone=null;
  function highlight(zone,instant=false){
    highlightedZone=zone;team.select(zone);
    const targets={};for(const key of Object.keys(accents))targets[key]=key===zone?.55:0;
    if(instant){highlightTransition=null;for(const key of Object.keys(accents))accents[key].material.opacity=targets[key];for(const [key,light] of Object.entries(roomLights))light.intensity=key===zone?6.4:5.5;receptionLight.intensity=zone==='control'?64:45;}
    else highlightTransition={start:performance.now(),from:Object.fromEntries(Object.entries(accents).map(([key,m])=>[key,m.material.opacity])),to:targets,lights:Object.fromEntries(Object.entries(roomLights).map(([key,l])=>[key,l.intensity])),reception:receptionLight.intensity};
    dirty=true;
  }
  const connections=new THREE.Group();scene.add(connections);
  const flowOrder=['control','think','create','grow','build','control'];
  const flowLines=[];
  for(let i=0;i<flowOrder.length-1;i++){
    const a=new THREE.Vector3(...zonePositions[flowOrder[i]]),b=new THREE.Vector3(...zonePositions[flowOrder[i+1]]);a.y+=.1;b.y+=.1;
    const mid=a.clone().lerp(b,.5);mid.y+=.65;
    const curve=new THREE.CatmullRomCurve3([a,mid,b]);
    const line=new THREE.Mesh(new THREE.TubeGeometry(curve,32,.018,5,false),new THREE.MeshBasicMaterial({color:'#85b8e8',transparent:true,opacity:.55,depthWrite:false}));line.visible=false;connections.add(line);flowLines.push(line);
  }
  let flowActive=false,flowStep=0;
  const views={
    all:{target:[0,4.4,0],position:[28,12.8,38]},
    think:{target:[-5.1,6.8,0],position:[-17.5,10.2,25.5]},
    create:{target:[5.1,6.8,.3],position:[22,10.5,26]},
    build:{target:[-5.3,2.5,.1],position:[-17,6.5,25]},
    grow:{target:[5.3,2.6,.5],position:[20,6.5,26]},
    control:{target:[.5,2.5,2.3],position:[12,6.8,28]}
  };
  let transition=null,currentZone='all',dirty=true,renderUntil=0;
  const team=createAgentTeam({scene,contactMaterial,onInvalidate:()=>{dirty=true;}});
  let workflowStage=null;
  function setWorkflowStage(value){
    workflowStage=value;team.setWorkflow(value);highlight(value?.zone||null);
    if(isMobile()&&currentZone==='all')camera.setViewOffset(width,height,0,height*(value ? .16 : -.11),width,height);
    dirty=true;
  }
  const isMobile=()=>innerWidth<=900;
  function adjustedView(zone) {
    const v=views[zone],target=new THREE.Vector3(...v.target),position=new THREE.Vector3(...v.position);
    if(isMobile()) {
      const factor=zone==='all'?(innerWidth<550?1.70:1.35):(innerWidth<550?1.9:1.35);
      position.sub(target).multiplyScalar(factor).add(target);
      camera.setViewOffset(width,height,0,height*(zone==='all'?(workflowStage ? .16 : -.11):.20),width,height);
    } else {
      if(zone==='all'&&width/height<1.3)position.sub(target).multiplyScalar(1.28).add(target);
      // Leave a quiet editorial column; reserve the right side for architecture.
      const shift=innerWidth>1100?.13:.15;
      camera.setViewOffset(width,height,-width*shift,height*.025,width,height);
    }
    return {target,position};
  }
  function focus(zone,instant=false) {
    if(!views[zone])return;
    currentZone=zone;
    const v=adjustedView(zone);
    if(instant){transition=null;camera.position.copy(v.position);controls.target.copy(v.target);controls.update();}
    else transition={from:camera.position.clone(),fromTarget:controls.target.clone(),...v,start:performance.now(),duration:1800};
    dirty=true;
  }
  controls.addEventListener('start',()=>{transition=null;dirty=true;window.dispatchEvent(new Event('mitang:orbit'));});
  controls.addEventListener('change',()=>{dirty=true;});
  const labels=[];
  const labelLayer=document.querySelector('#scene-labels');
  const jobSVG=document.createElementNS('http://www.w3.org/2000/svg','svg'),jobPath=document.createElementNS('http://www.w3.org/2000/svg','path');jobSVG.classList.add('live-handoff-path');jobSVG.setAttribute('aria-hidden','true');jobSVG.append(jobPath);labelLayer.append(jobSVG);
  const jobLabels=[0,1].map(()=>{const div=document.createElement('div');div.className='live-agent-label';labelLayer.append(div);return div;});
  const jobDot=document.createElement('span');jobDot.className='live-handoff-dot';jobDot.setAttribute('aria-hidden','true');labelLayer.append(jobDot);
  const labelData=[['think','brand','01','Demanda',[-7.8,7.55,6.1]],['create','marketing','02','Comunicação',[7.8,7.55,6.1]],['grow','growth','03','Prospecção',[7.8,3.05,6.1]],['build','technology','04','Radar',[-7.8,3.05,6.1]],['control','direction','05','Direção',[.6,3.15,6.1]]];
  for(const [zone,id,num,title,position] of labelData) {
    const button=document.createElement('button');button.className='hotspot';button.dataset.zone=zone;button.dataset.id=id;button.dataset.number=num;button.textContent=title;
    button.setAttribute('aria-label',`Explorar ${title}`);button.addEventListener('click',e=>selectZone(zone,{instant:e.detail===0}));
    labelLayer.append(button);labels.push({button,position:new THREE.Vector3(...position),zone});
  }
  const projected=new THREE.Vector3();
  function updateLabels(){
    for(const {button,position,zone} of labels) {
      projected.copy(position).project(camera);
      const x=(projected.x*.5+.5)*width,y=(-projected.y*.5+.5)*height;
      const leftLimit=isMobile()?40:Math.min(425,width*.29),rightLimit=width-60;
      const behind=camera.position.z<0;
      button.hidden=!!workflowStage||behind||projected.z>1||x<leftLimit||x>rightLimit||y<(isMobile()?410:180)||y>height-(isMobile()?230:225)||(currentZone!=='all'&&currentZone!==zone);
      button.style.left=`${x}px`;button.style.top=`${y}px`;
      button.classList.toggle('selected',currentZone===zone);
    }
    jobSVG.style.display=workflowStage?'block':'none';jobLabels.forEach(el=>el.hidden=!workflowStage);jobDot.hidden=true;
    if(workflowStage){
      const anchors=team.anchors(),keys=[workflowStage.zone,workflowStage.partnerZone],names=[workflowStage.agent,workflowStage.partner];
      const points=keys.map(key=>{const v=new THREE.Vector3(...anchors[key]).project(camera);return {x:(v.x*.5+.5)*width,y:(-v.y*.5+.5)*height};});
      points.forEach((p,i)=>{const text=`${names[i]} · ${i===0?'EM EXECUÇÃO':'REPASSE'}`;if(jobLabels[i].textContent!==text)jobLabels[i].textContent=text;jobLabels[i].style.transform=`translate3d(${Math.max(65,Math.min(width-65,p.x))}px,${p.y-20}px,0) translate(-50%,-100%)`;});
      const [a,b]=points,m={x:(a.x+b.x)/2,y:Math.min(a.y,b.y)-35};jobPath.setAttribute('d',`M ${a.x} ${a.y} Q ${m.x} ${m.y} ${b.x} ${b.y}`);
      if(team.state().enabled){const t=(performance.now()%2800)/2800,x=(1-t)*(1-t)*a.x+2*(1-t)*t*m.x+t*t*b.x,y=(1-t)*(1-t)*a.y+2*(1-t)*t*m.y+t*t*b.y;jobDot.hidden=false;jobDot.style.transform=`translate3d(${x}px,${y}px,0)`;}
    }
  }
  let last=performance.now(),samples=[],slowSamples=[],benchmarkUntil=0;
  function frame(now) {
    requestAnimationFrame(frame);
    if(failed||paused||document.hidden){last=now;return;}
    const delta=now-last;last=now;
    let moving=false;
    if(transition) {
      const t=Math.min(1,(now-transition.start)/transition.duration);
      // Cubic ease-in-out: weighted arrival, fixed duration independent of frame rate.
      const eased=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
      camera.position.lerpVectors(transition.from,transition.position,eased);
      controls.target.lerpVectors(transition.fromTarget,transition.target,eased);
      moving=true;
      if(t===1)transition=null;
    }
    if(highlightTransition){
      const h=highlightTransition,t=Math.min(1,(now-h.start)/550),eased=1-Math.pow(1-t,3);
      for(const [key,m] of Object.entries(accents))m.material.opacity=THREE.MathUtils.lerp(h.from[key],h.to[key],eased);
      for(const [key,light] of Object.entries(roomLights))light.intensity=THREE.MathUtils.lerp(h.lights[key],key===highlightedZone?6.4:5.5,eased);
      receptionLight.intensity=THREE.MathUtils.lerp(h.reception,highlightedZone==='control'?64:45,eased);moving=true;
      if(t===1)highlightTransition=null;
    }
    controls.update();
    const agentsChanged=team.update(now,dirty||moving);
    if(dirty||moving||agentsChanged||now<renderUntil||now<benchmarkUntil) {
      const before=performance.now();renderer.render(scene,camera);const renderMs=performance.now()-before;
      updateLabels();dirty=false;
      if(moving||now<benchmarkUntil) {
        if(delta>0&&delta<250){samples.push(delta);if(samples.length>900)samples.shift();}
        slowSamples.push(renderMs);if(slowSamples.length>900)slowSamples.shift();
      }
      // Adaptive DPR only after a substantial run of slow frames; never up/down oscillation.
      if(!lowQuality&&samples.length===180&&samples.reduce((a,b)=>a+b,0)/samples.length>27){setQuality(true);onQuality(true);}
    }
  }
  function setQuality(low) {
    lowQuality=low;reflection.visible=!low;renderer.setPixelRatio(Math.min(devicePixelRatio||1,low?1:1.25));
    renderer.shadowMap.enabled=!low;renderer.shadowMap.needsUpdate=true;renderer.setSize(width,height);dirty=true;
  }
  window.addEventListener('resize',()=>{
    width=innerWidth;height=innerHeight;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);
    focus(currentZone,true);
  });
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){last=performance.now();dirty=true;}});
  focus('all',true);
  renderer.compile(scene,camera);renderer.render(scene,camera);updateLabels();
  requestAnimationFrame(frame);
  const gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info');
  return {
    focus,
    highlight,
    setFlow(active,step=0){flowActive=active;flowStep=step;flowLines.forEach((line,i)=>line.visible=active&&i<step);team.setPresentation(active,step);dirty=true;},
    zoom(factor){transition=null;const direction=camera.position.clone().sub(controls.target);direction.multiplyScalar(factor).clampLength(controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(direction);controls.update();dirty=true;},
    toggleQuality(){setQuality(!lowQuality);return lowQuality;},
    setPaused(value){paused=value;dirty=true;},
    setAgentPresentationPaused(value){team.setPresentationPaused(value);},
    toggleAgentMotion(){return team.setEnabled(!team.state().userEnabled);},
    agentMotionState(){return team.state();},
    setWorkflowStage,
    diagnostics(){
      const ordered=[...samples].sort((a,b)=>a-b),mean=samples.reduce((a,b)=>a+b,0)/(samples.length||1);
      return {agents:team.diagnostics(),highlightedZone,flowActive,flowStep,currentZone,three:THREE.REVISION,quality:lowQuality?'leve':'alta',dpr:renderer.getPixelRatio(),viewport:[width,height],drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,sampledFrames:samples.length,fps:mean?Math.round(1000/mean*10)/10:null,p95FrameMs:ordered.length?Math.round(ordered[Math.floor(ordered.length*.95)]*10)/10:null,meanSubmitMs:slowSamples.length?+(slowSamples.reduce((a,b)=>a+b,0)/slowSamples.length).toFixed(2):null,gpu:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),camera:camera.position.toArray(),target:controls.target.toArray(),webgl:gl.getParameter(gl.VERSION)};
    }
  };
}
