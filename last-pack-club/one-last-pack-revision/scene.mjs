import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { ease, mix } from '../../skills/directing-stickman-videos/scripts/b6-scene.mjs';

const dir=path.dirname(fileURLToPath(import.meta.url)); process.chdir(dir);
const skill=path.resolve('../../skills/directing-stickman-videos');
const require=createRequire(skill+'/package.json');
const {createCanvas, loadImage, Path2D, GlobalFonts}=require('@napi-rs/canvas');
GlobalFonts.registerFromPath(skill+'/assets/fonts/ArchivoBlack.ttf','Archivo Black');
const names=['voltorb','oddish','diglett','magnemite','ditto','caterpie','gastly','psyduck'];
const img={};
for(const n of [...names,'counter','binder','pigment','wrapper']) img[n]=await loadImage('assets/'+n+'.png');
const camera=JSON.parse(fs.readFileSync('assets/binder-camera.json'));
const canvas=createCanvas(1080,1920),c=canvas.getContext('2d');
const plum='#43252e', mauve='#b88b94';
const phase=(t,a,b)=>ease((t-a)/(b-a));
function shape(d,fill,stroke=plum,w=1.7){const p=new Path2D(d);if(fill){c.fillStyle=fill;c.fill(p)}if(stroke){c.lineWidth=w;c.strokeStyle=stroke;c.stroke(p)}return p}
function round(x,y,w,h,r,fill,stroke,sw=1){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=sw;c.stroke()}}
function line(d,col,w){return shape(d,null,col,w)}
function filled(d,a,b,x1,y1,x2,y2){const gradient=c.createLinearGradient(x1,y1,x2,y2);gradient.addColorStop(0,a);gradient.addColorStop(1,b);const p=shape(d,gradient);
 c.save();c.clip(p);c.globalAlpha=.12;c.globalCompositeOperation='soft-light';c.drawImage(img.pigment,-80,-72,176,132);c.restore();return p}
function cardEdge(w,h){round(-.6,1.3,w+1.3,h+1,2.8,'#8d7474',plum,1.7)}
function faceCard(name,w,h){cardEdge(w,h);c.save();c.beginPath();c.roundRect(0,0,w,h,2.3);c.clip();c.drawImage(img[name],0,0,w,h);c.restore();
 round(0,0,w,h,2.3,null,plum,1.95);
 line('M1 '+(h*.8)+' Q-.1 '+(h*.61)+' .65 '+(h*.36),plum,.95);
 line('M2 2 Q'+w*.46+' 1.4 '+(w-3)+' 1.8','#f1cb9b',.68);
 if(name==='psyduck'){const foil=c.createLinearGradient(w-4,0,w,0);foil.addColorStop(0,'#916f88');foil.addColorStop(.48,'#dfbd85');foil.addColorStop(1,'#829c94');c.fillStyle=foil;c.fillRect(w-4,2,3,h-4)}}
function spriteCard(name,x,y,w,h,angle=-.028){c.save();c.translate(x,y);c.rotate(angle);faceCard(name,w,h);c.restore()}
function stack(x,y,w,h,count=5){c.save();c.translate(x,y);c.rotate(-.035);
 for(let k=count;k>0;k--){const dx=k*w*.029;round(dx,-dx*.61,w,h,1.6,k%2?'#d6bc94':'#c1a99b',plum,.8)}
 faceCard('voltorb',w,h);c.restore()}
// The palm passes behind the card. The thumb and its contact shadow are drawn on top.
// Local x runs from the cuff towards the card edge at (0,0).
function hand(x,y,right,scale,pass,tilt=0){c.save();c.translate(x,y);c.scale(right?-scale:scale,scale);c.rotate(tilt);
 if(pass==='back'){
 filled('M-560 310 L-132 74 Q-109 53 -81 29 Q-60 13 -36 1 L-24 15 Q-55 39 -78 57 L-124 96 L-550 342Z','#466f69','#254b50',-80,42,-53,66);
 filled('M-41 1 Q-39 -2 -35 -2 L-24 12 Q-23 16 -27 19 L-36 23 L-49 6Z','#527773','#34585b',-48,0,-24,15);
 line('M-44 5 L-33 19 M-40 3 L-29 17','#7b9290',.8);
 filled('M-37 1 Q-30 -4 -23 -11 Q-15 -18 -6 -17 Q1 -18 4 -12 Q9 -12 10 -7 Q15 -6 14 -1 Q15 4 10 8 Q3 14 -9 14 Q-18 13 -26 18 Q-32 13 -37 1Z','#ffead0','#e7bba4',-19,-13,-10,19);
 shape('M-26 10 Q-17 13 -9 10 Q2 10 9 5 Q5 13 -6 14 L-24 17Z','#d2a1a1',null);
 line('M-22 -8 Q-18 -13 -14 -13','#ffeed8',1.7)
 }else{
 shape('M-5 -7 Q1 -10 8 -7 Q14 -3 12 3 Q10 8 5 8 Q-1 8 -6 5Z','rgba(85,44,59,.32)',null);
 filled('M-16 -5 Q-10 -11 -3 -12 Q3 -14 8 -10 Q12 -7 11 -3 Q10 2 5 4 Q0 5 -4 4 Q-9 4 -12 7','#ffebd1','#d8a9a3',-3,-10,1,7);
 line('M1 -9 Q5 -10 7 -7','#fff2d9',1.3);
 }c.restore()}
function caption(s){c.font='20px "Archivo Black"';c.textAlign='center';c.textBaseline='middle';c.lineWidth=3.3;c.strokeStyle='#35232a';c.fillStyle='#fffaf5';c.strokeText(s,180,522);c.fillText(s,180,522)}
function packShot(t){let tear=phase(t,3.33,3.82), lift=phase(t,3.98,4.77),rest=phase(t,4.78,5.27);
 const x=91+2*Math.sin(tear*Math.PI),y=246+3*tear;
 let rx=mix(211,274,tear),ry=mix(260,218,tear);
 rx=mix(rx,224,phase(t,3.83,4.08));ry=mix(ry,260-72*lift+9*rest,phase(t,3.83,4.08));
 hand(100,394,false,.91,'back');hand(rx,ry,true,.84,'back');
 c.save();c.beginPath();c.rect(0,0,360,390);c.clip();if(lift>0)stack(108+7*lift,280-146*lift+6*rest,99+4*lift,147,6);c.restore();
 c.save();c.translate(x,y);c.rotate(.015);
 const wrapper=new Path2D('M0 3 L9 6 L15 2 L23 7 L31 2 L39 7 L47 2 L56 7 L65 2 L74 7 L83 1 L92 6 L101 1 L111 6 L120 2 L128 5 L130 194 Q66 196 0 193Z');
 c.save();c.clip(wrapper);c.drawImage(img.wrapper,0,0,130,194);c.restore();c.lineWidth=2.4;c.strokeStyle=plum;c.stroke(wrapper);
 line('M3 190 Q42 192 125 191','#e1a98a',1.4);line('M7 16 Q6 76 5 111','#f1b49a',1.2);c.restore();
 c.save();c.translate(155+62*tear,248-22*tear+134*phase(t,3.83,4.78));c.rotate(.02-.62*tear+1.48*phase(t,3.79,4.67));
 shape('M-54 -3 L55 -4 L54 3 L-54 4Z','#ae5456',plum,1.6);line('M-51 -1 L52 -2','#efb078',1.1);c.restore();
 hand(100,394,false,.91,'front');hand(rx,ry,true,.84,'front')}
function reveal(t){
 stack(99,129,45,60,5);
 const w=130,h=186,bx=178,by=217,angle=-.029;
 const border=3.5*phase(t,11.46,11.91), sweep=phase(t,12.60,13.52);
 const dx=border+153*sweep, fx=bx-dx,fy=by+dx*.031;
 let lx=fx+2.5,ly=fy+139,rx=bx+w+1.3,ry=by+41;
 hand(lx,ly,false,.94,'back',-.12);hand(rx,ry,true,.86,'back',.06);
 c.save();c.translate(bx,by);c.rotate(angle);
 if(dx>0){faceCard('psyduck',w,h);
 // Confine the only moving highlight to the exposed metallic edge.
 if(t>=11.95&&t<12.50){const v=(t-11.95)/.55;let cy=mix(8,h-8,v);c.save();c.beginPath();c.rect(w-2.5,2,1.9,h-4);c.clip();let g=c.createLinearGradient(0,cy-15,0,cy+15);g.addColorStop(0,'rgba(255,245,218,0)');g.addColorStop(.5,'#ffffeb');g.addColorStop(1,'rgba(255,245,218,0)');c.fillStyle=g;c.fillRect(w-3,cy-15,3,30);c.restore()}
 }c.restore();
 c.save();c.translate(fx,fy);c.rotate(angle);c.shadowColor='rgba(58,33,49,.36)';c.shadowOffsetX=3;c.shadowOffsetY=5;c.shadowBlur=5;round(0,0,w,h,2,'#614956');c.shadowColor='transparent';faceCard('caterpie',w,h);c.restore();
 hand(lx,ly,false,.94,'front',-.12);hand(rx,ry,true,.86,'front',.06);
 if(t>=13.92)caption('OH. PSYDUCK.')}
const slotNames=['voltorb','oddish','diglett','magnemite','ditto','caterpie','gastly','psyduck','psyduck'];
function binder(t,n){const m=camera[n-450];c.save();c.transform(m[0][0],m[1][0],m[0][1],m[1][1],m[0][2],m[1][2]);c.drawImage(img.binder,0,410/3,360,1115/3);
 c.translate(47,178);c.rotate(-.035);
 const positions=slotNames.map((name,i)=>({name,x:88.65*(i%3),y:102.22*Math.floor(i/3)}));
 for(const {x,y} of positions){round(x-5,y-4,74,98,1.6,'#353638','#5b535c',1.1);line('M'+(x-4)+' '+(y+93)+' L'+(x+67)+' '+(y+93),'#737074',.65)}
 const p=positions[8];const travel=phase(t,15.97,16.86),release=phase(t,16.91,17.29);
 const ax=p.x+148*(1-travel),ay=p.y+2.4*(1-travel),hx=ax+62+release*91,hy=ay+55-release*11;
 if(t>=15.90&&t<17.32)hand(hx,hy,true,.72,'back',.23);
 for(let i=0;i<8;i++){const a=positions[i];spriteCard(a.name,a.x,a.y,62.5,89.5,0)}
 if(t>=15.92)spriteCard('psyduck',ax,ay,62.5,89.5,0);
 // A fixed front and seam for each pocket, all in page coordinates.
 for(const {x,y} of positions){c.save();c.beginPath();c.rect(x-4,y-3,72,96);c.clip();
 const glass=c.createLinearGradient(x,y,x+70,y+52);glass.addColorStop(0,'rgba(221,218,223,.045)');glass.addColorStop(.46,'rgba(226,217,221,.018)');glass.addColorStop(.49,'rgba(242,221,218,.09)');glass.addColorStop(.53,'rgba(226,217,221,.018)');glass.addColorStop(1,'rgba(186,194,200,.035)');c.fillStyle=glass;c.fillRect(x-4,y-3,72,96);
 line('M'+(x-4)+' '+(y-2)+' Q'+(x+29)+' '+(y-2.6)+' '+(x+66)+' '+(y-2),'#9b979e',.65);line('M'+(x+67)+' '+(y-2)+' L'+(x+67)+' '+(y+92),'rgba(235,216,221,.48)',.75);c.restore()}
 if(t>=15.90&&t<17.32)hand(hx,hy,true,.72,'front',.23);
 c.restore(); if(t<17.29)caption('PULLED HIM YESTERDAY.');else caption('HE BROUGHT A MATE.')}
function frame(n){const t=n/30;c.resetTransform();c.scale(3,3);c.lineCap='round';c.lineJoin='round';c.drawImage(img.counter,0,0,360,640);
 if(n>=90&&n<164)packShot(t);else if(n>=300&&n<450)reveal(t);else if(n>=450)binder(t,n)}
if(process.argv[2]==='still'){frame(Number(process.argv[3]));fs.writeFileSync(process.argv[4],canvas.toBuffer('image/png'))}
else{const src='../references/One-Last-Pack-Vertical-Zoom.mp4';
 const ff=spawn('ffmpeg',['-v','error','-y','-f','rawvideo','-pixel_format','rgba','-video_size','1080x1920','-framerate','30','-i','pipe:0','-i',src,'-filter_complex',"[1:v][0:v]overlay=enable='between(n,90,163)+gte(n,300)'[v]",'-map','[v]','-map','1:a:0','-c:v','libx264','-threads','4','-preset','veryfast','-crf','17','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart','ONE LAST PACK - Painted Edition.mp4'],{stdio:['pipe','inherit','inherit']});
 const done=once(ff,'close');for(let n=0;n<600;n++){if(n===0||(n>=90&&n<164)||n>=300)frame(n);if(!ff.stdin.write(canvas.data()))await once(ff.stdin,'drain')}ff.stdin.end();const [code]=await done;if(code)process.exit(code)}
