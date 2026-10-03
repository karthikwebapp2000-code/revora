const fromEl=document.getElementById("from"),toEl=document.getElementById("to");
const fromList=document.getElementById("fromList"),toList=document.getElementById("toList");
const result=document.getElementById("result"),btn=document.getElementById("findBtn");
const timeEl=document.getElementById("departureTime");
let fromCoord=null,toCoord=null;
const now=new Date(); now.setMinutes(now.getMinutes()-now.getTimezoneOffset()); timeEl.value=now.toISOString().slice(0,16);

function debounce(fn,ms=450){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}
async function geocode(q,list,field){
  if(q.trim().length<3){list.innerHTML="";return}
  list.innerHTML='<div class="suggestion">Searching…</div>';
  try{
    const r=await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=in&q=${encodeURIComponent(q)}`,{headers:{"Accept-Language":"en"}});
    const data=await r.json(); list.innerHTML="";
    data.forEach(x=>{const d=document.createElement("div");d.className="suggestion";d.textContent=x.display_name;
      d.onclick=()=>{field.value=x.display_name;list.innerHTML="";const c={lat:+x.lat,lon:+x.lon,name:x.display_name};if(field===fromEl)fromCoord=c;else toCoord=c};list.appendChild(d)});
    if(!data.length)list.innerHTML='<div class="suggestion">No places found</div>';
  }catch(e){list.innerHTML='<div class="suggestion">Search unavailable — enter a place manually.</div>'}
}
fromEl.addEventListener("input",debounce(()=>{fromCoord=null;geocode(fromEl.value,fromList,fromEl)}));
toEl.addEventListener("input",debounce(()=>{toCoord=null;geocode(toEl.value,toList,toEl)}));
document.addEventListener("click",e=>{if(!e.target.closest(".field")){fromList.innerHTML="";toList.innerHTML=""}});

document.getElementById("useLocation").onclick=()=>{
  if(!navigator.geolocation){alert("Location is not available in this browser.");return}
  navigator.geolocation.getCurrentPosition(async p=>{
    const {latitude:lat,longitude:lon}=p.coords; fromCoord={lat,lon,name:"Current location"};
    fromEl.value="Current location";
  },()=>alert("Please allow location access to use this option."));
};

function hav(a,b){const R=6371,dLat=(b[0]-a[0])*Math.PI/180,dLon=(b[1]-a[1])*Math.PI/180;const x=Math.sin(dLat/2)**2+Math.cos(a[0]*Math.PI/180)*Math.cos(b[0]*Math.PI/180)*Math.sin(dLon/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))}
function bearing(a,b){const p1=a[0]*Math.PI/180,p2=b[0]*Math.PI/180,d=(b[1]-a[1])*Math.PI/180;return (Math.atan2(Math.sin(d)*Math.cos(p2),Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(d))*180/Math.PI+360)%360)}
function sunAzimuth(date,lat,lon){const rad=Math.PI/180;const jd=date.getTime()/86400000+2440587.5,n=jd-2451545.0,L=(280.46+.9856474*n)%360,g=(357.528+.9856003*n)%360,lambda=(L+1.915*Math.sin(g*rad)+.02*Math.sin(2*g*rad))*rad,eps=(23.439-.0000004*n)*rad,ra=Math.atan2(Math.cos(eps)*Math.sin(lambda),Math.cos(lambda)),dec=Math.asin(Math.sin(eps)*Math.sin(lambda));let sid=(280.46061837+360.98564736629*(jd-2451545)+lon)%360;let H=((sid-(ra/rad)*15+540)%360-180)*rad;const phi=lat*rad;return (Math.atan2(Math.sin(H),Math.cos(H)*Math.sin(phi)-Math.tan(dec)*Math.cos(phi))/rad+180)%360}
async function route(a,b){
  const url=`https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=full&geometries=geojson`;
  const r=await fetch(url); if(!r.ok)throw Error("route"); return r.json();
}
btn.onclick=async()=>{
  if(!fromCoord||!toCoord){result.className="result error";result.innerHTML="<b>Select both departure and destination from the suggestions.</b>";return}
  btn.disabled=true;btn.textContent="Calculating sunlight…";result.className="result hidden";
  try{
    const data=await route(fromCoord,toCoord),r=data.routes?.[0]; if(!r)throw Error("route");
    const pts=r.geometry.coordinates.map(x=>[x[1],x[0]]),start=new Date(timeEl.value);
    const duration=r.duration*1000;
    let left=0,right=0;
    for(let i=0;i<pts.length-1;i++){
      const p=pts[i],q=pts[i+1],mid=[(p[0]+q[0])/2,(p[1]+q[1])/2],b=bearing(p,q);
      const t=new Date(start.getTime()+duration*(i/(pts.length-1)));
      const az=sunAzimuth(t,mid[0],mid[1]); let diff=((az-b+540)%360)-180;
      const w=hav(p,q); const elevationWeight=Math.max(0.15,Math.sin(Math.abs(diff)*Math.PI/180));
      if(diff>0)right+=w*elevationWeight; else left+=w*elevationWeight;
    }
    const side=left<right?"Left side":"Right side", other=left<right?"Right side":"Left side";
    const minutes=Math.round(r.duration/60);
    result.className="result";result.innerHTML=`<h2>☀️ Take the <strong>${side}</strong></h2><p>For this route, our sunlight model estimates less direct sun exposure on the ${side.toLowerCase()} of the vehicle.</p><div class="choice"><div class="emoji">🪟</div><div><b>${side}</b><div class="metric">Recommended for lower sunlight exposure</div></div></div><div class="metric">Estimated journey: ${minutes} min · ${fromCoord.name||"Departure"} → ${toCoord.name||"Destination"}</div><p class="fine">This is an estimate based on route direction, time and solar position. Buildings, trees, traffic and vehicle orientation can change real-world exposure.</p>`;
  }catch(e){result.className="result error";result.innerHTML="<b>We couldn't calculate that route right now.</b><p>Please check the place names and try again.</p>"}
  finally{btn.disabled=false;btn.textContent="Find the shade →"}
};
