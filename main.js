const $=id=>document.getElementById(id);
const BASIS={
 U:{n:[0,-1,0],u:[1,0,0],v:[0,0,1]},D:{n:[0,1,0],u:[1,0,0],v:[0,0,-1]},
 L:{n:[-1,0,0],u:[0,0,1],v:[0,1,0]},R:{n:[1,0,0],u:[0,0,-1],v:[0,1,0]},
 F:{n:[0,0,1],u:[1,0,0],v:[0,1,0]},B:{n:[0,0,-1],u:[-1,0,0],v:[0,1,0]}
};
const BY_NORMAL=Object.fromEntries(Object.entries(BASIS).map(([f,b])=>[b.n.join(","),f]));
const DIR={U:[0,-1],R:[1,0],D:[0,1],L:[-1,0]};
const POS={U:[1,0],L:[0,1],F:[1,1],R:[2,1],B:[3,1],D:[1,2]};
const NAMES={U:"UP",R:"RIGHT",D:"DOWN",L:"LEFT",F:"FRONT",B:"BACK"};
const LEVELS=[
{name:"First Dig",limit:22,difficulty:"BEGINNER",hint:"Gather the gold and gem, then find the exit.",faces:{U:["...",".C.","..."],L:["...","...","..."],F:["...",".S.","..."],R:["...","..G","..."],B:["...",".C.","..."],D:["...",".E.","..."]}},
{name:"Shifting Tunnels",limit:27,difficulty:"BEGINNER",hint:"Rock blocks the shortest routes. Twist faces to shift the corridors.",faces:{U:["#..",".C.","..."],L:["...","...","C.."],F:["...",".S.","#.."],R:["...","..G",".#."],B:["...",".G.","..."],D:["...",".E.","..."]}},
{name:"Crystal Run",limit:31,difficulty:"INTERMEDIATE",hint:"Two gems are hidden on opposite sides of the cave.",faces:{U:["..#","C..","..."],L:["...","#C.","..."],F:["...",".S.","..."],R:["..G","...","#.."],B:["...","G#.","..."],D:["...",".E.","..."]}},
{name:"The Deep Shaft",limit:34,difficulty:"INTERMEDIATE",hint:"Paths shift with every turn. Keep an eye on the miner's face.",faces:{U:["C..","..#","..."],L:["...","..C","#.."],F:["S..","##.","..."],R:["...","G#.","..."],B:["..G","...","..."],D:["...","..E","..."]}},
{name:"Gemstone Vault",limit:38,difficulty:"ADVANCED",hint:"Collect three gems and two coins. The exit is on the bottom face.",faces:{U:["..G",".#.","C.."],L:["...","C#.","..."],F:["..S","...","#.."],R:["G..","...","..#"],B:["...","#G.","..."],D:["..E","...","..."]}},
{name:"Last Expedition",limit:43,difficulty:"EXPERT",hint:"The toughest cave. Plan your route before you turn.",faces:{U:["C.#","...","..G"],L:["...","#C.","..."],F:["S..",".#.","..."],R:["..G","...","#.."],B:["G..","...","..#"],D:["...","..E","..."]}}
];
let level=0,faces={},player={face:"F",x:1,y:1},moves=0,coins=0,gems=0,totalCoins=0,totalGems=0,history=[],active=false,timer;
const clone=f=>Object.fromEntries(Object.entries(f).map(([k,rows])=>[k,rows.map(r=>r.split(""))]));
const snap=()=>({faces:Object.fromEntries(Object.entries(faces).map(([f,g])=>[f,g.map(r=>r.slice())])),player:{...player},moves,coins,gems});
const restore=s=>{faces=s.faces;player=s.player;moves=s.moves;coins=s.coins;gems=s.gems};
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");clearTimeout(timer);timer=setTimeout(()=>$("toast").classList.remove("show"),1400)}
function screen(id){["select","game","result"].forEach(x=>$(x).classList.toggle("hidden",x!==id))}
function buildLevels(){$("levels").innerHTML=LEVELS.map((l,i)=>`<button class="level-card" data-level="${i}"><span class="num">CAVE ${String(i+1).padStart(2,"0")}</span><strong>${l.name}</strong><p>${l.hint}</p><footer><span>${l.difficulty}</span><span>${l.limit} MOVES</span></footer></button>`).join("");document.querySelectorAll("[data-level]").forEach(b=>b.onclick=()=>start(+b.dataset.level))}
function start(i){
 level=i;faces=clone(LEVELS[i].faces);player={face:"F",x:1,y:1};
 for(const f of Object.keys(faces))for(let y=0;y<3;y++)for(let x=0;x<3;x++)if(faces[f][y][x]==="S"){player={face:f,x,y};faces[f][y][x]="."}
 moves=coins=gems=0;history=[];active=true;
 totalCoins=Object.values(faces).flat(2).filter(t=>t==="C").length;totalGems=Object.values(faces).flat(2).filter(t=>t==="G").length;
 $("level-number").textContent=`CAVE ${String(i+1).padStart(2,"0")}`;$("level-name").textContent=LEVELS[i].name;$("mission").textContent=LEVELS[i].hint;$("last-turn").textContent="—";screen("game");render();
}
function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]}
function add(a,b){return a.map((v,i)=>v+b[i])}
function mul(a,k){return a.map(v=>v*k)}
function collect(){let t=faces[player.face][player.y][player.x];if(t==="C"){coins++;faces[player.face][player.y][player.x]=".";toast("Gold coin collected!")}if(t==="G"){gems++;faces[player.face][player.y][player.x]=".";toast("Gem collected!")}}
function step(dx,dy){
 const b=BASIS[player.face];let x=player.x+dx,y=player.y+dy,next={face:player.face,x,y};
 if(x<0||x>2||y<0||y>2){
  const d=add(mul(b.u,dx),mul(b.v,dy)),nf=BY_NORMAL[d.join(",")];if(!nf)return false;
  const edge=dx!==0?mul(b.v,player.y-1):mul(b.u,player.x-1);
  const p=add(d,add(b.n,edge)),nb=BASIS[nf];
  next={face:nf,x:Math.max(0,Math.min(2,Math.round(dot(p,nb.u)+1))),y:Math.max(0,Math.min(2,Math.round(dot(p,nb.v)+1)))};
 }
 if(faces[next.face][next.y][next.x]==="#")return false;
 player=next;collect();return true;
}
function depth(target){let f=target;if(player.face===target)f=target==="F"?"B":"F";if(faces[f][player.y][player.x]==="#")return false;player.face=f;collect();return true}
function rotate(face,cw){
 const old=faces[face],next=Array.from({length:3},()=>Array(3).fill("."));
 for(let y=0;y<3;y++)for(let x=0;x<3;x++)next[y][x]=cw?old[2-x][y]:old[x][2-y];
 faces[face]=next;
 if(player.face===face){let {x,y}=player;player=cw?{...player,x:2-y,y:x}:{...player,x:y,y:2-x}}
}
function render(){
 $("moves-left").textContent=Math.max(0,LEVELS[level].limit-moves);$("coins").textContent=`${coins}/${totalCoins}`;$("gems").textContent=`${gems}/${totalGems}`;
 $("location").textContent=`${NAMES[player.face]} · ${["TOP","MIDDLE","BOTTOM"][player.y]} ${["LEFT","CENTER","RIGHT"][player.x]}`;
 $("checklist").innerHTML=`<div class="check-row ${coins===totalCoins?"done":""}"><span>${coins===totalCoins?"✓":""}</span>Gold coins ${coins}/${totalCoins}</div><div class="check-row ${gems===totalGems?"done":""}"><span>${gems===totalGems?"✓":""}</span>Gems ${gems}/${totalGems}</div><div class="check-row"><span>🚪</span>Reach the exit</div>`;
 $("undo").disabled=!history.length;
 const cube=$("cube-3d");cube.innerHTML="";
 const transforms={F:"translateZ(105px)",B:"rotateY(180deg) translateZ(105px)",R:"rotateY(90deg) translateZ(105px)",L:"rotateY(-90deg) translateZ(105px)",U:"rotateX(90deg) translateZ(105px)",D:"rotateX(-90deg) translateZ(105px)"};
 for(const f of ["F","B","R","L","U","D"]){
  const panel=document.createElement("div");panel.className="cube-face face-"+f.toLowerCase()+(player.face===f?" current":"");panel.style.transform=transforms[f];
  const cells=document.createElement("div");cells.className="cube-face-cells";
  for(let y=0;y<3;y++)for(let x=0;x<3;x++){
   const t=faces[f][y][x],el=document.createElement("div");el.className="cube-sticker";
   if(t==="#"){el.classList.add("wall");el.textContent="🪨"}else if(t==="C"){el.classList.add("coin");el.textContent="🪙"}else if(t==="G"){el.classList.add("gem");el.textContent="💎"}else if(t==="E"){el.classList.add("exit");el.textContent="🚪"}
   if(player.face===f&&player.x===x&&player.y===y){el.classList.add("player");el.textContent="👷"}
   cells.appendChild(el);
  }
  const label=document.createElement("span");label.className="cube-face-label";label.textContent=NAMES[f];
  panel.append(cells,label);cube.appendChild(panel);
 }
}
function parse(raw){let m=String(raw||"").trim().toUpperCase().replace(/’/g,"'").match(/^([URFDLB])('?)(2)?$/);return m?{f:m[1],prime:m[2]==="'",n:m[3]?2:1}:null}
function turn(raw){
 if(!active)return;let p=parse(raw);if(!p)return;
 for(let i=0;i<p.n&&active;i++){
  history.push(snap());let moved;
  if("URDL".includes(p.f)){let [dx,dy]=DIR[p.f];if(p.prime){dx=-dx;dy=-dy}moved=step(dx,dy)}
  else moved=depth(p.prime?(p.f==="F"?"B":"F"):p.f);
  // The cave layout is fixed in cube-local coordinates. Only the miner moves;
  // collected objectives disappear, and uncollected objectives never shift.
  moves++;$("last-turn").textContent=p.f+(p.prime?"′":"")+(p.n===2?"2":"");render();
  if(!moved)toast("Rock wall — the cave still shifted!");
  if(checkExit())return;if(moves>=LEVELS[level].limit){finish(false);return}
 }
}
function checkExit(){if(faces[player.face][player.y][player.x]==="E"){if(coins===totalCoins&&gems===totalGems){finish(true);return true}toast(`Still need ${totalCoins-coins} coin(s) and ${totalGems-gems} gem(s).`)}return false}
function finish(won){active=false;screen("result");$("result-symbol").textContent=won?"✦":"⛏";$("result-eyebrow").textContent=won?"CAVE CLEARED":"OUT OF MOVES";$("result-title").textContent=won?"Expedition complete!":"The cave is still unexplored";$("result-copy").textContent=won?`You collected ${coins} coin(s) and ${gems} gem(s), and escaped in ${moves} turns.`:`You collected ${coins}/${totalCoins} coins and ${gems}/${totalGems} gems. Restart and plan your twists more carefully.`;$("result-next").textContent=won?(level===5?"PLAY AGAIN →":"NEXT CAVE →"):"TRY AGAIN →"}
function undo(){if(!active||!history.length)return;restore(history.pop());$("last-turn").textContent="UNDO";render();toast("Last turn undone")}
function back(){active=false;screen("select")}
$("back").onclick=back;$("restart").onclick=()=>start(level);$("undo").onclick=undo;$("result-levels").onclick=back;$("result-next").onclick=()=>start((level+1)%6);
document.querySelectorAll("[data-turn]").forEach(b=>b.onclick=()=>turn(b.dataset.turn));
window.addEventListener("keydown",e=>{if(e.key==="Backspace"){e.preventDefault();undo();return}let k=e.key.toUpperCase();if("URFDLB".includes(k)){e.preventDefault();turn(k+(e.shiftKey?"'":""))}});
buildLevels();
if(window.acubemy){
 window.acubemy.onMove(({move})=>turn(move));
 window.acubemy.onDeviceChange(d=>{
  $("device").classList.toggle("connected",!!d.connected);
  $("device").innerHTML=`<i></i>${d.connected?(d.deviceName||"Cube connected"):"Waiting for cube"}${d.connected?(d.hasGyro?" · GYRO READY":" · NO GYRO"):""}`;
 });
 // Gyroscope changes only the 3D camera/cube orientation. The puzzle grid,
 // miner coordinates and collectible positions remain in cube-local space.
 window.acubemy.onGyro(({x,y,z,w})=>setGyroOrientation(x,y,z,w));
}else $("device").textContent="Keyboard preview ready";

// Drag/gyro orbit changes only the 3D view; it never changes tile or miner coordinates.
let gyroMatrix="matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)";
function setGyroOrientation(x,y,z,w){
 // Convert the SDK's Three.js-frame quaternion to a CSS 4x4 rotation matrix.
 const xx=x*x,yy=y*y,zz=z*z,xy=x*y,xz=x*z,yz=y*z,wx=w*x,wy=w*y,wz=w*z;
 const m00=1-2*(yy+zz),m01=2*(xy-wz),m02=2*(xz+wy);
 const m10=2*(xy+wz),m11=1-2*(xx+zz),m12=2*(yz-wx);
 const m20=2*(xz-wy),m21=2*(yz+wx),m22=1-2*(xx+yy);
 gyroMatrix=`matrix3d(${[m00,m10,m20,0,m01,m11,m21,0,m02,m12,m22,0,0,0,0,1].join(",")})`;
 if(window.applyCubeView)window.applyCubeView();
}
(()=>{
 const viewport=$("cube-viewport"),cube=$("cube-3d"),reset=$("cube-reset");
 if(!viewport||!cube)return;
 let rx=-22,ry=-32,drag=null;
 const apply=()=>{cube.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg) ${gyroMatrix}`};
 window.applyCubeView=apply;apply();
 viewport.addEventListener("pointerdown",e=>{drag={x:e.clientX,y:e.clientY,rx,ry};viewport.setPointerCapture(e.pointerId)});
 viewport.addEventListener("pointermove",e=>{if(!drag)return;ry=drag.ry+(e.clientX-drag.x)*.55;rx=Math.max(-75,Math.min(75,drag.rx-(e.clientY-drag.y)*.55));apply()});
 const stop=()=>{drag=null};viewport.addEventListener("pointerup",stop);viewport.addEventListener("pointercancel",stop);
 reset?.addEventListener("click",()=>{
  rx=-22;ry=-32;apply();
  if(window.acubemy?.calibrateGyro){window.acubemy.calibrateGyro();toast("Gyroscope recentered — hold cube with white up, green front")}
  else toast("View reset — connect a gyro-enabled cube for motion control");
 });
})();
