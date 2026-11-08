const $ = s => document.querySelector(s);
const profiles = window.PROFILES;
let posts = window.POSTS.map(p=>({...p,comments:[...(p.comments||[])]}));
let trackIndex=0;
const tracks=[
 {title:"Love Gaze",src:"assets/love-gaze.mp4",ownerId:"neko"},
 {title:"Made Us",src:"assets/made-us.mp4",ownerId:"neko"}
];
const audio=$("#audio");
const escapeHTML=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function profile(id){return profiles[id]||profiles.you}
function badge(p){return p.verified?'<img class="verified" src="assets/verified.png" alt="Verified">':""}
function avatar(p){return p.avatar?`<img src="${escapeHTML(p.avatar)}" alt="">`:escapeHTML((p.username||"?").slice(0,1).toUpperCase())}
function openProfile(id){const p=profile(id);$("#profileDetails").innerHTML=`
 <div class="profile-banner" style="${p.banner?`background-image:url('${escapeHTML(p.banner)}');background-size:cover;background-position:center`:''}"></div>
 <div class="profile-content"><div class="avatar">${avatar(p)}</div><div class="profile-title">${escapeHTML(p.username)} ${badge(p)}</div><div class="profile-handle">${escapeHTML(p.handle)}</div>
 <p class="profile-bio">${escapeHTML(p.bio)}</p><div class="profile-stats"><div><b>${p.followers}</b><small>Followers</small></div><div><b>${p.friends}</b><small>Friends</small></div><div><b>${p.following}</b><small>Following</small></div></div>
 <div class="profile-tags">${(p.tags||[]).map(t=>`<span>${escapeHTML(t)}</span>`).join("")}</div>
 ${p.music?`<div class="profile-music">♫ <strong>${escapeHTML(p.music)}</strong> · Music shared by ${escapeHTML(p.username)}</div>`:""}</div>`;
 $("#profileModal").classList.add("show")}
function render(){
 $("#feed").innerHTML=posts.slice(0,10).map((post,i)=>{const p=profile(post.authorId);return `<article class="post-card" style="animation-delay:${i*.045}s">
 <div class="post-head"><div class="avatar">${avatar(p)}</div><div><button class="author-name" data-profile="${escapeHTML(p.id)}">${escapeHTML(p.username)} ${badge(p)}</button><div class="handle">${escapeHTML(p.handle)}</div></div></div>
 <div class="post-body">${escapeHTML(post.text)}</div>${post.attachment?`<img class="post-image" src="${post.attachment}" alt="Post attachment">`:""}
 ${post.music?`<div class="post-music"><span class="music-glyph">♫</span><span>${escapeHTML(post.music)} · shared by <button data-profile="${escapeHTML(post.authorId)}">${escapeHTML(p.username)}</button></span></div>`:""}
 <div class="post-actions"><button data-comment-toggle="${escapeHTML(post.id)}">♡ ${post.comments.length} comments</button><button data-profile="${escapeHTML(post.authorId)}">♧ View profile</button></div>
 <div class="comments" id="comments-${escapeHTML(post.id)}">${post.comments.map(c=>`<div class="comment"><strong>${escapeHTML(profile(c.authorId).username)}:</strong> ${escapeHTML(c.text)}</div>`).join("")}
 <form class="comment-form" data-comment="${escapeHTML(post.id)}"><input name="comment" maxlength="240" placeholder="Write a comment…" required><button>Send</button></form></div>
 </article>`}).join("");
 $("#endOfFeed").classList.toggle("hidden",posts.length<10);
}
function showModal(id){$("#"+id).classList.add("show")}
document.addEventListener("click",e=>{
 const prof=e.target.closest("[data-profile]");if(prof){openProfile(prof.dataset.profile);return}
 const toggle=e.target.closest("[data-comment-toggle]");if(toggle){$("#comments-"+toggle.dataset.commentToggle).classList.toggle("hidden")}
 const close=e.target.closest("[data-close]");if(close)$("#"+close.dataset.close).classList.remove("show");
});
document.addEventListener("submit",e=>{
 if(e.target.matches(".comment-form")){e.preventDefault();const post=posts.find(p=>p.id===e.target.dataset.comment);const value=new FormData(e.target).get("comment").trim();if(value){post.comments.push({authorId:"you",text:value});render()}}
});
let selectedImage="";
$("#postImage").addEventListener("change",e=>{const f=e.target.files[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{selectedImage=reader.result;$("#imageName").textContent=f.name};reader.readAsDataURL(f)});
$("#postForm").addEventListener("submit",e=>{e.preventDefault();const text=$("#postText").value.trim();if(!text)return;posts.unshift({id:"local-"+Date.now(),authorId:"you",text,attachment:selectedImage,showDate:false,comments:[]});$("#postText").value="";$("#postImage").value="";$("#imageName").textContent="";selectedImage="";render();window.scrollTo({top:0,behavior:"smooth"})});
function loadTrack(i,autoplay=false){trackIndex=(i+tracks.length)%tracks.length;const t=tracks[trackIndex];audio.src=t.src;$("#trackTitle").textContent=t.title;const owner=profile(t.ownerId);$("#trackOwner").textContent="♫ by "+owner.username;$("#trackOwner").dataset.profile=t.ownerId;$("#playButton").textContent="▶";if(autoplay)audio.play().then(()=>$("#playButton").textContent="Ⅱ").catch(()=>{})}
$("#playButton").addEventListener("click",()=>{if(audio.paused){audio.play().then(()=>$("#playButton").textContent="Ⅱ").catch(()=>{})}else{audio.pause();$("#playButton").textContent="▶"}});
$("#nextTrack").addEventListener("click",()=>loadTrack(trackIndex+1,true));$("#prevTrack").addEventListener("click",()=>loadTrack(trackIndex-1,true));
audio.addEventListener("timeupdate",()=>{if(audio.duration){$("#progress").value=audio.currentTime/audio.duration*100;$("#currentTime").textContent=fmt(audio.currentTime);$("#duration").textContent=fmt(audio.duration)}});
audio.addEventListener("ended",()=>loadTrack(trackIndex+1,true));$("#progress").addEventListener("input",e=>{if(audio.duration)audio.currentTime=audio.duration*e.target.value/100});
function fmt(s){if(!Number.isFinite(s))return"0:00";return Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0")}
$("#featuredProfile").innerHTML=`<div class="featured" data-profile="neko"><div class="avatar">N</div><div><strong>100k Neko ${badge(profile("neko"))}</strong><small>kran_neko_89351</small></div></div><p>${escapeHTML(profile("neko").bio)}</p>`;
$("#updatesButton").addEventListener("click",()=>showModal("updatesModal"));$("#enterButton").addEventListener("click",()=>$("#updatesModal").classList.remove("show"));
$("#dismissPrivacy").addEventListener("click",()=>$("#privacyNotice").classList.add("hidden"));
document.addEventListener("visibilitychange",()=>{if(!document.hidden){$("#privacyNotice").classList.remove("hidden");setTimeout(()=>$("#privacyNotice").classList.add("hidden"),7000)}});
// This is only a courtesy notice. Browsers do not let ordinary websites block screenshots,
// prevent tab switching, or force a visitor to stay on one page.
render();loadTrack(0);
setTimeout(()=>{$("#loader").classList.add("done");setTimeout(()=>{$("#loader").remove();$("#app").classList.remove("hidden");showModal("updatesModal")},650)},1900);
