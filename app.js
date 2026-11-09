import viewer from "./profiles/viewer.js";
import morning from "./profiles/morning.js";
import pezpez from "./profiles/pezpez.js";

import tades from "./profiles/tades.js";
import tozi from "./profiles/tozi.js";
import deserve from "./profiles/Deserve.js";
import kuya from "./profiles/Kuya.js";


import {posts as seedPosts, settings} from "./data/content.js";

const profiles = [viewer, morning, pezpez, tades, tozi, deserve, kuya];
// The music player and admin comment composer use the site owner profile.
// viewer.js is the configured owner profile for this build.
const owner = viewer;


















let posts = structuredClone(seedPosts);
let admin = false, visiblePosts = settings.initialVisiblePosts;
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const profile = id => profiles.find(p=>p.id===id) || morning;
const avatar = p => `<img class="avatar" src="${esc(p.avatar)}" alt="">`;
const badge = p => `<span class="badge">${esc(p.badgeImage||"✦")} ${esc(p.badge)}${p.verified?' <span class="verified">✓</span>':''}</span>`;
function timeAgo(d){let n=Math.max(0,Math.floor((Date.now()-new Date(d).getTime())/60000));return n<1?"just now":n<60?`${n}m ago`:n<1440?`${Math.floor(n/60)}h ago`:`${Math.floor(n/1440)}d ago`}
function render(){
 const feed=$("#feed"); const shown=posts.slice(0,visiblePosts);
 $("#postCount").textContent=posts.length;$("#statPosts").textContent=posts.length;$("#statProfiles").textContent=profiles.length;
 feed.innerHTML=shown.map(post=>{
  const p=profile(post.profileId);
  const media=post.image?`<img class="post-media" src="${esc(post.image)}">`:post.video?`<video class="post-media" src="${esc(post.video)}" controls></video>`:"";
  const postSettings={visibleComments:settings.initialVisibleComments,commentsEnabled:true,reactionsEnabled:true,...(post.settings||{})};
  const comments=(post.comments||[]).slice(0,admin?10:postSettings.visibleComments);
  return `<article class="post" data-post="${esc(post.id)}"><div class="post-head">${avatar(p)}<div class="post-user"><b>${esc(p.displayName)}</b>${badge(p)}<small>@${esc(p.username)} · ${timeAgo(post.date)}</small></div><button class="post-menu" data-edit-post="${esc(post.id)}" title="Edit post">···</button></div>
  <div class="post-text">${esc(post.text).replace(/\n/g,"<br>")}</div>${media}
  <div class="post-actions"><button class="action ${post.liked?'liked':''}" data-like="${esc(post.id)}">♥ ${post.likes||0} likes</button><button class="action" data-focus="${esc(post.id)}">↩ ${(post.comments||[]).length} comments</button>${postSettings.reactionsEnabled?`<button class="action" data-react="${esc(post.id)}">＋ react</button>`:""}${admin?`<button class="action" data-delete="${esc(post.id)}">delete</button>`:""}</div>
  <div class="reactions">${postSettings.reactionsEnabled?Object.entries(post.reactions||{}).map(([e,n])=>`<button class="react" data-react-existing="${esc(post.id)}|${esc(e)}">${e} ${n}</button>`).join(""):""}</div>
  <div class="comments">${comments.map(c=>{let cp=profile(c.profileId);return `<div class="comment">${avatar(cp)}<div class="comment-content"><b>${esc(cp.username)}</b>${cp.badge?`<span class="badge">${esc(cp.badgeImage||"✦")} ${esc(cp.badge)}</span>`:""}${esc(c.text)}${c.image?`<img class="comment-image" src="${esc(c.image)}">`:""}<div class="comment-actions">${settings.commentReactionChoices.map(emoji=>`<button class="comment-react" data-comment-react="${esc(post.id)}|${esc(c.id)}|${emoji}" title="React ${emoji}">${emoji}</button>`).join("")}${Object.entries(c.reactions||{}).map(([emoji,count])=>`<button class="comment-react-count" data-comment-react="${esc(post.id)}|${esc(c.id)}|${esc(emoji)}">${emoji} ${count}</button>`).join("")}${admin?`<button class="comment-edit" data-edit-comment="${esc(post.id)}|${esc(c.id)}">edit</button><button class="comment-edit" data-delete-comment="${esc(post.id)}|${esc(c.id)}">delete</button>`:""}</div></div></div>`}).join("")}
  ${!postSettings.commentsEnabled?`<div class="comment-compose"><input placeholder="Comments are turned off for this post" disabled></div>`:admin?`<div class="comment-compose"><input id="comment-${esc(post.id)}" placeholder="Write a comment as @${esc(owner.username)}…"><button class="tiny-send" data-comment="${esc(post.id)}">SEND</button></div>`:`<div class="comment-compose"><input placeholder="Spectator view · comments are read-only" disabled></div>`}
  </div></article>`;
 }).join("");
 $("#feedGate").classList.toggle("hidden",visiblePosts>=posts.length);
 $("#gateUnlock").textContent=admin?"ALL POSTS UNLOCKED":"ENTER ADMIN PIN →";
}
function modal(title,body,actions=""){ $("#modalRoot").innerHTML=`<div class="modal-backdrop"><div class="modal"><h2>${title}</h2>${body}${actions}</div></div>`;$("#modalRoot").querySelector(".modal-backdrop").addEventListener("click",e=>{if(e.target.classList.contains("modal-backdrop"))closeModal()})}
function closeModal(){$("#modalRoot").innerHTML=""}
function toast(msg){let t=document.createElement("div");t.className="toast";t.textContent=msg;document.body.append(t);setTimeout(()=>t.remove(),2300)}
function askPin(){modal("HOLD ON. ARE YOU ADMIN?",`<p>Please type in the admin key to unlock posting, comments and older posts.</p><label>ADMIN KEY</label><input id="pinInput" placeholder="Enter admin pin" autocomplete="off"><p id="pinError" style="color:#ff6684"></p>`,`<div class="modal-actions"><button class="secondary-btn" id="cancelModal">CANCEL</button><button class="primary-btn" id="submitPin">UNLOCK ACCESS →</button></div>`);$("#cancelModal").onclick=closeModal;$("#submitPin").onclick=()=>{if($("#pinInput").value===settings.adminPin){admin=true;visiblePosts=posts.length;closeModal();render();toast("Admin access unlocked.");}else $("#pinError").textContent="That pin doesn't look right. Try again.";};$("#pinInput").addEventListener("keydown",e=>{if(e.key==="Enter")$("#submitPin").click()})}
function postEditor(post=null){if(!admin)return askPin();let p=post||{text:"",image:"",video:""};modal(post?"EDIT POST":"CREATE A POST",`<p>Posts are controlled by the script in <b>data/content.js</b>. This quick editor changes this browser session.</p><label>POST TEXT</label><textarea id="postText">${esc(p.text)}</textarea><label>IMAGE PATH OR URL (OPTIONAL)</label><input id="postImage" value="${esc(p.image||"")}" placeholder="assets/my-image.jpg"><label>VIDEO PATH OR URL (OPTIONAL)</label><input id="postVideo" value="${esc(p.video||"")}" placeholder="assets/my-video.mp4">`,`<div class="modal-actions"><button class="secondary-btn" id="cancelModal">CANCEL</button><button class="primary-btn" id="savePost">SAVE POST</button></div>`);$("#cancelModal").onclick=closeModal;$("#savePost").onclick=()=>{let text=$("#postText").value.trim();if(!text)return toast("Add some post text first.");if(post){post.text=text;post.image=$("#postImage").value.trim();post.video=$("#postVideo").value.trim()}else posts.unshift({id:"p"+Date.now(),profileId:"owner",text,date:new Date().toISOString(),image:$("#postImage").value.trim(),video:$("#postVideo").value.trim(),likes:0,reactions:{},comments:[]});closeModal();render();toast("Post saved for this session.");}}
function commentEditor(postId){if(!admin)return askPin();let inp=$("#comment-"+CSS.escape(postId));let text=inp?.value.trim();if(!text)return toast("Write a comment first.");let post=posts.find(p=>p.id===postId);post.comments.unshift({id:"c"+Date.now(),profileId:"owner",text,image:"",likes:0,reactions:{}});render();toast("Comment added.");}
function profileModal(id){let p=profile(id);modal(`<div class="profile-hero" ${p.profileBackground?`style="background-image:linear-gradient(#100d14bb,#100d14dd),url('${esc(p.profileBackground)}');background-size:cover;background-position:center;padding:14px;border-radius:12px"`:""}>${avatar(p)}<div><h2>${esc(p.displayName)} ${p.verified?'<span class="verified">✓</span>':''}</h2><p>@${esc(p.username)} ${badge(p)}</p></div></div>`,`<p>${esc(p.bio)}</p><div class="profile-stats"><span><b>${p.followers}</b> FOLLOWERS</span><span><b>${posts.filter(x=>x.profileId===p.id).length}</b> POSTS</span><span><b>${p.artist?"ARTIST":"MEMBER"}</b></span></div><p>${p.artist?`♫ ${esc(p.musicName)}`:"Not listed as an artist."}</p><p>Profile ID: <code>${esc(p.id)}</code></p>`,`<div class="modal-actions"><button class="secondary-btn" id="copyProfile">COPY PROFILE ID</button><button class="primary-btn" id="closeProfile">CLOSE</button></div>`);$("#closeProfile").onclick=closeModal;$("#copyProfile").onclick=()=>{navigator.clipboard?.writeText(p.id);toast("Profile ID copied.")};}
$("#adminBtn").onclick=askPin;$("#gateUnlock").onclick=askPin;$("#openUpdates").onclick=()=>modal("WHAT'S NEW — COMMENTATE",`<p><b>01 / The feed is alive.</b><br>Newest posts appear first. The public view starts with two posts.</p><p><b>02 / Community profiles.</b><br>Tap a username or avatar to open a profile card.</p><p><b>03 / Admin controls.</b><br>Use the admin key to unlock older posts, create posts and add comments.</p><p><b>04 / Music corner.</b><br>Drag the player by its title bar and resize from the bottom-right corner.</p>`,`<div class="modal-actions"><button class="primary-btn" id="closeProfile">LET'S GO</button></div>`);$("#modalRoot").addEventListener("click",e=>{if(e.target.id==="closeProfile")closeModal()});
$("#peopleNav").onclick = () => {
  // Set peopleRequiresAdmin to true/false in data/content.js.
  if (settings.peopleRequiresAdmin && !admin) {
    askPin();
    return;
  }

  const peopleList = profiles.map(person => `
    <p>
      <button class="action" data-profile="${esc(person.id)}">
        ${esc(person.displayName)} · @${esc(person.username)}
        ${person.verified ? "✓" : ""}
      </button>
    </p>
  `).join("");

  modal(
    "PEOPLE",
    peopleList,
    `<div class="modal-actions">
      <button class="primary-btn" id="closeProfile">CLOSE</button>
    </div>`
  );

  $("#closeProfile").onclick = closeModal;
};

document.body.addEventListener("click",e=>{
 let el=e.target.closest("[data-profile]");if(el){profileModal(el.dataset.profile);return}
 el=e.target.closest("[data-like]");if(el){let p=posts.find(x=>x.id===el.dataset.like);p.liked=!p.liked;p.likes=Math.max(0,(p.likes||0)+(p.liked?1:-1));render();return}
 el=e.target.closest("[data-react]");if(el){let id=el.dataset.react;let emoji=prompt("Type one emoji to react with:","✨");if(emoji){let p=posts.find(x=>x.id===id);p.reactions=p.reactions||{};p.reactions[emoji]=(Number(p.reactions[emoji])||0)+1;render()}return}
 el=e.target.closest("[data-react-existing]");if(el){let [id,emoji]=el.dataset.reactExisting.split("|");let p=posts.find(x=>x.id===id);p.reactions[emoji]=(Number(p.reactions[emoji])||0)+1;render();return}
 el=e.target.closest("[data-comment-react]");if(el){let [pid,cid,emoji]=el.dataset.commentReact.split("|");let c=posts.find(p=>p.id===pid)?.comments.find(c=>c.id===cid);if(c){c.reactions=c.reactions||{};c.reactions[emoji]=(Number(c.reactions[emoji])||0)+1;render()}return}
 el=e.target.closest("[data-comment]");if(el){commentEditor(el.dataset.comment);return}
 if(e.target.closest("[data-comment-lock]")){askPin();return}
 el=e.target.closest("[data-focus]");if(el){document.querySelector(`[data-post="${CSS.escape(el.dataset.focus)}"] .comment-compose input`)?.focus();return}
 el=e.target.closest("[data-edit-post]");if(el){postEditor(posts.find(p=>p.id===el.dataset.editPost));return}
 el=e.target.closest("[data-delete]");if(el&&admin){posts=posts.filter(p=>p.id!==el.dataset.delete);render();return}
 el=e.target.closest("[data-like-comment]");if(el){let [pid,cid]=el.dataset.likeComment.split("|");let c=posts.find(p=>p.id===pid).comments.find(c=>c.id===cid);c.likes=(c.likes||0)+1;render();return}
 el=e.target.closest("[data-edit-comment]");if(el){if(!admin)return askPin();let [pid,cid]=el.dataset.editComment.split("|");let c=posts.find(p=>p.id===pid).comments.find(c=>c.id===cid);let t=prompt("Edit comment:",c.text);if(t!==null){c.text=t;render()}return}
 el=e.target.closest("[data-delete-comment]");if(el&&admin){let [pid,cid]=el.dataset.deleteComment.split("|");let p=posts.find(p=>p.id===pid);p.comments=p.comments.filter(c=>c.id!==cid);render();return}
});
$("#adminBtn").insertAdjacentHTML("beforebegin",`<button id="newPost" class="icon-btn" title="Create post">＋</button>`);$("#newPost").onclick=()=>admin?postEditor():askPin();
$("#openPlayer").onclick=()=>$("#musicPlayer").classList.remove("hidden");$("#musicToggle").onclick=()=>$("#musicPlayer").classList.toggle("hidden");$("#closePlayer").onclick=()=>$("#musicPlayer").classList.add("hidden");$("#minPlayer").onclick=()=>$("#musicPlayer").classList.toggle("compact");
const tracks=[{title:"Love gaze..",src:"assets/Love gaze..mp4"},{title:"Made Us..",src:"assets/Made Us..mp4"}];let track=0;const audio=$("#audio");
function fmt(s){return !isFinite(s)?"0:00":`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`}
function loadTrack(i,play=false){track=(i+tracks.length)%tracks.length;$("#trackTitle").textContent=tracks[track].title;$("#nowTitle").textContent=tracks[track].title;$("#nowArtist").textContent=owner.musicName||owner.displayName;$("#trackArtist").textContent=owner.musicName||owner.displayName;audio.src=tracks[track].src;$("#trackList").innerHTML=tracks.map((t,j)=>`<button class="track-item ${j===track?'active':''}" data-track="${j}">♫ ${t.title}</button>`).join("");if(play)audio.play().catch(()=>toast("Press play to start audio."));}
$("#playTrack").onclick=()=>{if(audio.paused)audio.play().catch(()=>{});else audio.pause()};audio.onplay=()=>$("#playTrack").textContent="Ⅱ";audio.onpause=()=>$("#playTrack").textContent="▶";$("#nextTrack").onclick=()=>loadTrack(track+1,true);$("#prevTrack").onclick=()=>loadTrack(track-1,true);$("#trackList").onclick=e=>{let b=e.target.closest("[data-track]");if(b)loadTrack(+b.dataset.track,true)};audio.ontimeupdate=()=>{$("#seek").value=audio.duration?audio.currentTime/audio.duration*100:0;$("#elapsed").textContent=fmt(audio.currentTime);$("#duration").textContent=fmt(audio.duration)};$("#seek").oninput=()=>{if(audio.duration)audio.currentTime=audio.duration*$("#seek").value/100};audio.onended=()=>loadTrack(track+1,true);loadTrack(0);
const player=$("#musicPlayer"),head=player.querySelector(".player-head");let drag=null;head.addEventListener("pointerdown",e=>{if(e.target.tagName==="BUTTON")return;let r=player.getBoundingClientRect();drag={x:e.clientX-r.left,y:e.clientY-r.top};head.setPointerCapture(e.pointerId)});head.addEventListener("pointermove",e=>{if(!drag)return;player.style.left=(e.clientX-drag.x)+"px";player.style.top=(e.clientY-drag.y)+"px";player.style.right="auto";player.style.bottom="auto"});head.addEventListener("pointerup",()=>drag=null);
render();setTimeout(()=>$("#loader").classList.add("done"),1500);


// VERSION CHECK — bump version.json whenever you publish a new GitHub Pages update.
const COMMENTATE_VERSION_URL = new URL("./version.json", import.meta.url);
let commentateVersionCheckStarted = false;

async function checkForCommentateUpdate() {
  try {
    const response = await fetch(`${COMMENTATE_VERSION_URL.href}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return;
    const latest = await response.json();
    const latestVersion = String(latest.version || "");
    if (latestVersion && latestVersion !== window.commentateCurrentVersion) {
      showCommentateUpdateNotice(latestVersion);
    }
  } catch (error) {
    // Keep the website usable if the version file is temporarily unavailable.
  }
}

function showCommentateUpdateNotice(version) {
  if (document.getElementById("commentate-update-notice")) return;
  const notice = document.createElement("div");
  notice.id = "commentate-update-notice";
  notice.className = "update-notice-backdrop";
  notice.innerHTML = `
    <section class="update-notice" role="dialog" aria-modal="true" aria-labelledby="updateNoticeTitle">
      <div class="update-notice-kicker">COMMENTATE · UPDATE AVAILABLE</div>
      <h2 id="updateNoticeTitle">SORRY TO STOP YOU.</h2>
      <p>You're currently on the old version. Click the refresh button to load the newest update.</p>
      <div class="update-notice-version">NEW VERSION ${esc(version)}</div>
      <button class="update-refresh-button" type="button">REFRESH WEBSITE ↻</button>
    </section>
  `;
  document.body.appendChild(notice);
  notice.querySelector(".update-refresh-button").addEventListener("click", () => {
    window.location.reload();
  });
}

async function startCommentateVersionCheck() {
  if (commentateVersionCheckStarted) return;
  commentateVersionCheckStarted = true;
  try {
    const response = await fetch(`${COMMENTATE_VERSION_URL.href}?t=${Date.now()}`, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      window.commentateCurrentVersion = String(data.version || "1.0.0");
    } else {
      window.commentateCurrentVersion = "1.0.0";
    }
  } catch (error) {
    window.commentateCurrentVersion = "1.0.0";
  }
  // Check every minute; visitors already on the page will be notified after deployment.
  window.setInterval(checkForCommentateUpdate, 60000);
}

startCommentateVersionCheck();
