import {createRequire} from 'node:module';
import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const dir=path.dirname(fileURLToPath(import.meta.url));process.chdir(dir);
const skill=path.resolve('../../skills/directing-stickman-videos');
const require=createRequire(skill+'/package.json');
const {createCanvas,loadImage,Path2D,GlobalFonts}=require('@napi-rs/canvas');
GlobalFonts.registerFromPath(skill+'/assets/fonts/ArchivoBlack.ttf','Archivo Black');
const room=await loadImage('assets/bedroom.png'),head=await loadImage('assets/chase-expression-base.png');
const original=await loadImage('../references/frames/chase-standing.png');
const canvas=createCanvas(1080,1920),c=canvas.getContext('2d');
const ink='#38222c',cream='#ffe5c9',teal='#315d5d';
function curve(d,fill,stroke=ink,w=1){let p=new Path2D(d);if(fill){c.fillStyle=fill;c.fill(p)}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke(p)}}
function box(x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h)}
function oval(x,y,a,b,color){c.beginPath();c.ellipse(x,y,a,b,0,0,Math.PI*2);c.fillStyle=color;c.fill()}
function round(x,y,w,h,r,fill,stroke=ink,sw=1){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.lineWidth=sw;c.strokeStyle=stroke;c.stroke()}}
function text(s,x,y,size,color,outline=0){c.font=size+'px "Archivo Black"';c.textAlign='center';c.textBaseline='middle';if(outline){c.strokeStyle=ink;c.lineWidth=outline;c.strokeText(s,x,y)}c.fillStyle=color;c.fillText(s,x,y)}
function ease(t,a,b){let v=Math.min(1,Math.max(0,(t-a)/(b-a)));return v*v*(3-2*v)}
function key(t,points){for(let i=1;i<points.length;i++){let [b,v]=points[i],[a,u]=points[i-1];if(t<=b)return u+(v-u)*ease(t,a,b)}return points.at(-1)[1]}
function card(x,y,ang,scale=1,kind=0){c.save();c.translate(x,y);c.rotate(ang);c.scale(scale,scale);round(-6,-8,12,16,.8,'#f4d886',ink,.55);round(-4.7,-6.7,9.4,8,.4,['#8baf94','#d18b88','#909dc3'][kind],null);oval(0,-2.5,2.5,2.3,['#54715d','#e9b051','#ab7cb5'][kind]);box(-4,3,7,.6,'#866a50');box(-4,5,5,.5,'#99866b');c.restore()}
function battle(t){c.save();c.transform(1,-.12,0,1,175,73);c.beginPath();c.rect(0,0,85,58);c.clip();
let g=c.createLinearGradient(0,0,0,58);g.addColorStop(0,'#838db2');g.addColorStop(.6,'#d3bec1');g.addColorStop(1,'#a6a08e');box(0,0,85,58,g);
curve('M0 34 Q15 21 28 29 Q50 17 70 27 L85 21 V42 H0Z','#8f99a4',null);oval(42,44,38,6,'#b2ad9f');
const u=t%3.15, wind=ease(u,.45,.93)-ease(u,.93,1.23), strike=ease(u,.97,1.23)-ease(u,1.40,1.92);
c.save();c.translate(19-3*wind+12*strike,39+Math.sin(t*5)*.5);c.rotate(.12*strike-.08*wind);
curve('M-11 2 Q-14 -3 -9 -10 L-12 -20 L-4 -15 L-3 -18 L0 -14 L4 -17 L6 -13 L12 -17 L10 -8 Q16 -5 12 1 L15 3 L9 5 L10 9 L4 9 L2 6 L-4 7 L-9 10 L-11 8 L-8 5 L-14 4Z','#68547f',ink,.8);
curve('M-3 -8 L2 -6 L0 -4Z M4 -6 L10 -9 L8 -5Z','#dc8794',ink,.5);curve('M-4 -3 Q3 0 10 -3 Q5 5 -4 -3Z','#eee0cb',ink,.5);c.restore();
c.save();c.translate(62+3*wind-9*strike,40);c.rotate(-.1*strike);
curve('M-17 -4 L-12 -5 L-18 -13 L-10 -9 L-9 -14 L-4 -12 L-4 -22 Q3 -19 1 -11 L6 -13 L9 -17 L10 -12 L14 -14 L13 -9 Q20 -6 16 1 L18 7 L14 8 L10 3 L5 4 L3 9 L-1 9 L0 3 L-7 2 L-10 8 L-14 7 L-12 0 L-17 -1Z','#a891b1',ink,.8);curve('M-4 -19 L-1 -17 L-3 -13Z','#7d738e',null);oval(-10,-7,1.4,1.1,'#942f42');oval(7,-7,2.3,1.5,'#85708f');c.restore();
if(u>1.18&&u<1.29)curve('M40 28 L43 32 L45 24 L46 33 L52 30 L48 36 L53 38 L46 38 L43 44 L43 38 L38 39 L41 35 L37 33Z','#fff3bd',null);c.restore()}
function wallpaper(){c.save();c.transform(1,.034,0,1,173,148);box(0,0,84,51,'#576679');curve('M0 31 Q22 18 44 32 T84 24 V51 H0Z','#788891',null);oval(49,26,11,11,'#d39688');c.save();c.beginPath();c.rect(37,26,24,12);c.clip();oval(49,26,11,11,'#dfd6bb');c.restore();box(38,25.2,22,1.5,'#5c5355');oval(49,26,3.4,3.4,'#635958');oval(49,26,2,2,'#ede3ce');for(let i=0;i<3;i++)round(3,4+8*i,3,3,.5,'#b8beca',null);c.restore()}
function desk(){// Open nine-pocket binder, loose cards and clear graded slabs.
c.save();c.translate(59,329);c.transform(1,.06,-.24,.71,0,0);round(-45,-24,86,48,2,'#4d525c',ink,1.8);
for(let page=0;page<2;page++){round(-42+42*page,-21,39,42,1.3,'#c4b7a5','#665e61',.7);for(let j=0;j<2;j++)for(let i=0;i<3;i++)card(-35+page*42+i*12,-11+j*19,0,.77,(i+j+page)%3)}
box(-1,-20,1.5,41,'#7d7774');c.restore();
card(109,335,-.28,.93,2);card(117,338,-.1,.9,1);card(128,312,.23,.86,0);
for(let i=0;i<3;i++){c.save();c.translate(207+i*16,319+i*2);c.rotate(-.19+i*.13);round(-8,-13,16,25,1.2,'#d8d7ce','#7c7779',.8);box(-6,-11,12,4,'#b87774');card(0,3,0,.85,i);curve('M-6 6 L4 -6',null,'#f5eee5',.6);c.restore()}}
function face(t){let glance=key(t,[[0,0],[1.53,0],[1.72,1],[6,1],[8.9,.5],[9.8,.4],[9.96,1],[16.7,1],[17.7,-.5]]);
let brow=key(t,[[0,0],[1.8,0],[2.01,1],[4.4,1],[6,.6],[8.9,-.4],[9.87,-.4],[10.16,1],[13.4,.8],[15.4,-.6],[18,-.6]]);
let smile=key(t,[[0,.25],[4.35,.25],[5.8,1],[6.55,1],[8.7,-.5],[10,-.5],[10.7,.35],[14.3,.3],[15.5,-.8]]);
// The traced silhouette is used as a clip only. Visible cap, face, outline and nose are source pixels.
c.save();c.clip(new Path2D('M41 143 C36 131 38 105 49 86 C65 56 94 52 116 55 C139 57 159 68 170 89 C190 90 211 94 216 100 Q221 108 184 116 C191 127 198 146 196 165 C193 195 167 214 135 217 C101 222 71 205 55 187 C45 175 41 159 46 146Z'));c.drawImage(head,36,52.5,184,167.5);c.restore();
curve('M84 141 Q105 142 128 134',null,ink,4.3);
curve('M141 '+(128-2*brow)+' Q158 '+(106-4*brow)+' 175 '+(118-3*brow),null,ink,4);
let blink=[.83,7.38,12.26,16.54].some(x=>t>=x&&t<x+.10);
for(const [x,y,w] of [[82,153,47],[145,149,33]]){if(!blink){oval(x+w*.8+glance*2,y+1+glance*1.2,4.8,6.3,ink)}curve('M'+x+' '+y+' Q'+(x+w*.5)+' '+(y-.6)+' '+(x+w)+' '+(y-3),null,ink,2.9)}
curve('M120 178 Q136 '+(182+smile*7)+' 148 '+(178-smile*1.8)+' Q138 '+(181+smile*2)+' 120 178Z',smile>.05?'#fff0df':ink,ink,1.9)}
function phonePose(t){let lift=key(t,[[0,0],[16.68,0],[16.9,1],[17.08,1],[17.30,0]]);
return {x:155,y:311-10*lift,flip:ease(t,16.91,17.19),lift}}
function phone(t){const p=phonePose(t);c.save();c.translate(p.x,p.y);c.rotate(-.10);c.scale(1,.84);
let sx=Math.cos(Math.PI*p.flip);c.scale(Math.max(.06,Math.abs(sx)),1);
round(-17,-26,34,52,3.2,sx>=0?'#332f3b':'#50646a',ink,1.2);
if(sx<0){round(-13,-23,8,10,2,'#36444b');oval(-10,-20,1.7,1.7,'#868b95');c.restore();return}
const awake=t>=1.5;round(-15,-23.4,30,46,2,awake?'#f4eadd':'#454051',null);
if(awake){box(-14.6,-21.5,29.2,5.1,'#425b5c');text('PACK CLUB',0,-18.7,2.4,'#f5ecd7');
let loading=(t>=4.30&&t<9)||(t>=14.05&&t<15.3);
if(loading){c.save();c.rotate(t*5.8);c.beginPath();c.arc(0,0,5.4,0,4.9);c.strokeStyle='#658c8b';c.lineWidth=1.3;c.stroke();c.restore()}
else if(t<4.30||(t>=9.8&&t<14.05)){if(t>=9.8){text('OUT OF STOCK',0,12,2.6,'#845a58')}round(-13,-9,26,15,1.3,'#dbe8dc','#78958c',.45);text('RESTOCK',0,-4.6,4.05,'#2e514f');text('ALERT',0,.5,4.05,'#2e514f')}
else {text('OUT OF',0,-3,4.85,'#843f48');text('STOCK',0,3,4.85,'#843f48')}
}round(-4,19.7,8,.7,.35,'#ada6a4',null);c.restore()}
function drawScene(t){c.drawImage(room,0,0,270,480);battle(t);wallpaper();
c.save();c.translate(0,0);curve('M9 302 L3 201 Q3 182 18 178 L69 172 Q82 174 86 190 L98 284 L86 306Z','#403747',ink,2);curve('M11 278 L8 205 Q8 189 19 187 L57 182',null,'#997779',2);c.restore();
let sink=key(t,[[0,0],[5.7,0],[8.8,6],[10,6],[10.6,3],[15,3],[15.7,7]]);
// Seated trousers and shoes are behind the front desk.
curve('M50 266 L98 262 L109 289 L99 315 L83 311 L87 284 L62 288 L63 316 L47 315Z','#38333b',ink,1.5);
c.save();c.translate(0,sink);
curve('M49 207 Q57 201 74 204 Q91 204 99 215 L106 239 L96 244 L96 274 Q67 280 38 272 L43 233 L35 235 L34 227 Q35 213 49 207Z',teal,ink,2);
c.save();c.clip(new Path2D('M49 209 Q60 204 73 206 L95 216 L97 267 Q68 276 42 269 L44 233 L37 234 Q37 216 49 209Z'));c.globalAlpha=.27;c.drawImage(original,397,978,105,105,34,202,66,74);c.restore();
curve('M46 209 Q46 198 59 196 Q69 195 74 203 Q84 198 91 201 L90 211 L76 216 L69 212 L59 208 L49 217Z','#345758',ink,1.6);
curve('M65 212 L66 229 M81 212 L83 228',null,'#e9cca5',1.8);
curve('M55 257 Q63 258 78 256 L84 267 L50 269Z',null,'#31484a',1);
let nod=key(t,[[0,0],[1.69,0],[2.03,1],[5,1],[8.9,2.1],[10,2.1],[10.5,.2],[16.7,.3],[17.7,1.7]]);
c.save();c.translate(71,209);c.rotate(nod*.022);c.scale(.73,.73);c.translate(-119,-213);face(t);c.restore();c.restore();
c.save();c.beginPath();c.rect(0,293,270,187);c.clip();c.drawImage(room,0,0,270,480);c.restore();
desk();
let h=key(t,[[0,0],[.5,.35],[.82,.02],[1.49,.67],[1.54,.69],[17.42,.69],[17.89,1]]);
let hx=68+h*24,hy=305-h*9+ease(t,17.45,17.88)*21;
curve('M39 '+(231+sink)+' Q36 252 37 271 Q40 281 '+hx+' '+hy,null,ink,3.6);
card(hx+4,hy-5,-.23,.92,1);oval(hx,hy,3.6,3.2,ink);
let reach=key(t,[[0,0],[3.83,0],[4.09,-.07],[4.30,1],[4.44,.77],[4.68,.27],[12.62,.27],[13.81,.84],[14.05,1],[14.15,.85],[14.25,1],[14.35,.85],[14.45,1],[14.58,.83],[15.85,.65],[16.69,1],[17.34,1],[17.72,0]]);
const p=phonePose(t),grip=ease(t,16.44,16.68)*(1-ease(t,17.34,17.63));
let rx=115+reach*40-grip*(16*Math.abs(Math.cos(p.flip*Math.PI))),ry=301+reach*9-grip*(10*p.lift);
// Approach the screen from above its upper-left corner. Only the fingertip
// crosses the bezel on a tap; the later flip uses the original edge grip.
const hover = ease(t,1.93,2.23) * (1-ease(t,15.75,16.43));
const press = Math.max(0, (reach-.84)/.16);
rx += hover * ((139 + 3*press) - rx);
ry += hover * ((283 + 11*press) - ry);
const wristY = ry - 5*hover;
phone(t);
curve('M99 '+(236+sink)+' Q109 249 111 273 Q116 '+(292-15*hover)+' '+rx+' '+wristY,null,ink,3.5);
curve('M'+rx+' '+wristY+' L'+rx+' '+ry,null,ink,2.6);
oval(rx,wristY,3.15,3.35,ink);
}
function frame(n){let t=n/30;c.resetTransform();box(0,0,1080,1920,'#000');if(n>=538)return;c.scale(4,4);c.lineJoin='round';c.lineCap='round';
let phoneShot=(t>=2.25&&t<3.45)||(t>=4.43&&t<5.47)||(t>=9&&t<10.8)||(t>=14.50&&t<16.50);
let close=(t>=5.47&&t<9)||(t>=10.8&&t<13.47);
c.save();if(phoneShot){c.translate(135,237);c.scale(6.1,6.1);c.translate(-155,-311)}
if(close){let zoom=2.03+(t<9?.22*ease(t,5.47,8.96):0);c.translate(132,217);c.scale(zoom,zoom);c.translate(-74,-171)}
drawScene(t);c.restore();
if(t>=16.5){text('I’M NOT EVEN',135,389,13.6,'#fff',2.35);text('EXCITED ANYMORE.',135,406,13.6,'#fff',2.35)}}
if(process.argv[2]==='still'){frame(Number(process.argv[3]||0));fs.writeFileSync(process.argv[4]||'representative.png',canvas.toBuffer('image/png'))}
else {
const enc=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgba','-s','1080x1920','-r','30','-i','pipe:0','-i','assets/effects.wav','-c:v','libx264','-threads','4','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart','THE RESTOCK ALERT.mp4'],{stdio:['pipe','inherit','inherit']});
const done=once(enc,'close');for(let n=0;n<540;n++){frame(n);if(!enc.stdin.write(canvas.data()))await once(enc.stdin,'drain')}enc.stdin.end();const [code]=await done;if(code)process.exit(code);
}
