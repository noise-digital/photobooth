import{sb}from"../../supabase/supabase-config.js";
export{sb};
export const $=s=>document.querySelector(s),P=new URLSearchParams(location.search);
export const base=location.href.split("?")[0].replace(/[^/]*$/,"").replace(/admin\/$/,"");
export const fdate=d=>d?new Date(d).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"}):"";
export async function getWedding(id){if(!id)return null;const{data:w}=await sb.from("weddings").select("*").eq("id",id).maybeSingle();
 return w&&w.status!=="off"?{id,groomName:w.groom_name,brideName:w.bride_name,weddingDate:w.wedding_date,coverImage:w.cover_image}:null}
export async function getSettings(){const{data:s}=await sb.from("settings").select("*").eq("id","app").maybeSingle();
 return{maxAudio:30,quality:.92,brand:"Virtual Wedding Photobooth",...(s?{maxAudio:s.max_audio,quality:+s.quality,brand:s.brand}:{})}}
const PAL=[["#F4D1D8","#64152C"],["#FFF9EF","#92966C"],["#FFFFFF","#C6A46A"],["#F4D1D8","#92966C"],["#FFF9EF","#64152C"]];
const T={strip:["Strip",600,1800,[[.08,.03,.84,.27],[.08,.32,.84,.27],[.08,.61,.84,.27]],.945],polaroid:["Polaroid",900,1100,[[.06,.05,.88,.72]],.89],story:["Story",1080,1920,[[.08,.12,.84,.35],[.08,.51,.84,.35]],.93],"4r":["4R",1200,1800,[[.06,.04,.88,.42],[.06,.48,.88,.42]],.95]};
export const CATS={strip:"Photo Strip",polaroid:"Polaroid",story:"Instagram Story","4r":"Ukuran 4R"};
export const DEF=[];for(const c in T)for(let i=0;i<10;i++)DEF.push({id:"d-"+c+"-"+(i+1),name:T[c][0]+" Type "+(i+1),cat:c,W:T[c][1],H:T[c][2],slots:T[c][3],ty:T[c][4],pal:PAL[i%5]});
const fromRow=d=>({id:d.id,name:d.name,cat:d.category,imageUrl:d.image_url,W:d.width,H:d.height,slots:d.slot_coordinates.map(s=>[s.x,s.y,s.w,s.h])});
export async function getFrame(id){const d=DEF.find(f=>f.id===id);if(d)return d;const{data}=await sb.from("frames").select("*").eq("id",id).single();return fromRow(data)}
export async function listFrames(wid){const{data}=await sb.from("frames").select("*").eq("status","on");
 return[...DEF,...(data||[]).filter(d=>!d.wedding_id||d.wedding_id===wid).map(fromRow)]}
const img=u=>new Promise((r,j)=>{const i=new Image();i.crossOrigin="anonymous";i.onload=()=>r(i);i.onerror=j;i.src=u});
function deco(x,f,w){const[bg,ac]=f.pal,{W,H}=f;x.fillStyle=bg;x.fillRect(0,0,W,H);x.strokeStyle="#C6A46A";x.lineWidth=W*.008;x.strokeRect(W*.02,W*.02,W*.96,H-W*.04);
 for(const[px,py]of[[0,0],[W,0],[0,H],[W,H]])for(let k=0;k<6;k++){x.beginPath();x.fillStyle=k%2?"#F4D1D8":ac;x.globalAlpha=.55;const a=k*Math.PI/3;x.arc(px+Math.cos(a)*W*.05,py+Math.sin(a)*W*.05,W*.035,0,7);x.fill()}
 x.globalAlpha=1;x.fillStyle="#fff";for(const[a,b,c,d]of f.slots)x.fillRect(a*W-6,b*H-6,c*W+12,d*H+12);
 x.fillStyle=ac;x.textAlign="center";x.font="italic "+W*.06+"px 'Playfair Display',serif";x.fillText((w.groomName||"")+" & "+(w.brideName||""),W/2,H*f.ty);
 x.font=W*.03+"px Poppins,sans-serif";x.fillText(fdate(w.weddingDate),W/2,H*f.ty+W*.05)}
export async function compose(f,photos,w,zoom=1){const c=document.createElement("canvas");c.width=f.W;c.height=f.H;const x=c.getContext("2d");let fi;
 if(f.imageUrl)fi=await img(f.imageUrl);else deco(x,f,w||{});
 for(let i=0;i<f.slots.length;i++){const[a,b,cw,ch]=f.slots[i].map((v,j)=>v*(j%2?f.H:f.W));x.save();x.beginPath();x.rect(a,b,cw,ch);x.clip();
  const p=photos&&photos[i];if(p){const im=await img(p),s=Math.max(cw/im.width,ch/im.height)*zoom;x.drawImage(im,a+(cw-im.width*s)/2,b+(ch-im.height*s)/2,im.width*s,im.height*s)}else{x.fillStyle="#e5dcdc";x.fillRect(a,b,cw,ch)}x.restore()}
 if(fi)x.drawImage(fi,0,0,f.W,f.H);return c}
export const qr=(t,n=8)=>{const q=qrcode(0,"M");q.addData(t);q.make();return q.createDataURL(n)};
export const pub=p=>sb.storage.from("media").getPublicUrl(p).data.publicUrl;
