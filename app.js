import viewer from "./profiles/viewer.js";
import morning from "./profiles/morning.js";
import pezpez from "./profiles/pezpez.js";
import alex from "./profiles/alex.js";

import tades from "./profiles/tades.js";
import tozi from "./profiles/tozi.js";
import deserve from "./profiles/Deserve.js";
import kuya from "./profiles/Kuya.js";
import vamper from "./profiles/vamper.js";
import geekbar from "./profiles/geekbar.js";
import geenaploy from "./profiles/geenaploy.js";
import onesways from "./profiles/onesways.js";
import noteface from "./profiles/noteface.js";
import lisvi from "./profiles/lisvi.js";
import advise from "./profiles/advise.js";
import grandna from "./profiles/grandna.js";
import xkj from "./profiles/xkj.js";
import lovya from "./profiles/lovya.js";
import noYears from "./profiles/no-years.js";
import pacificusAtaraxia from "./profiles/pacificus-ataraxia.js";
import velvetvenom from "./profiles/velvetvenom.js";
import leinberMens from "./profiles/leinber-mens.js";
import morbidia from "./profiles/morbidia.js";
import henmaside from "./profiles/henmaside.js";
import moon from "./profiles/moon.js";
import connie from "./profiles/connie.js";
import sports from "./profiles/sports.js";
import flipMoo from "./profiles/FlipMoo.js";
import pixkurin from "./profiles/PIXKURIN.js";
import linneyConzi from "./profiles/LinneyConzi.js";
import plasx from "./profiles/PLASX.js";
import veilAndVice from "./profiles/veil-and-vice.js";


import {posts as seedPosts, settings} from "./data/content.js";

const profiles = [viewer, morning, pezpez, alex, tades, tozi, deserve, kuya, vamper, geekbar, geenaploy, onesways, noteface, lisvi, advise, grandna, xkj, lovya, noYears, pacificusAtaraxia, velvetvenom, leinberMens, morbidia, henmaside, moon, connie, sports, flipMoo, pixkurin, linneyConzi, plasx, veilAndVice];
// The music player and admin comment composer use the site owner profile.
// viewer.js is the configured owner profile for this build.
const owner = viewer;


















let posts = structuredClone(seedPosts);
let admin = false, adminPin = "", visiblePosts = settings.initialVisiblePosts;
let activeProfileId = owner.id;
let persistentPostStorageAvailable = false;
let persistentActivityStorageAvailable = false;
let persistentPostsReady = Promise.resolve();
let persistentActivityReady = Promise.resolve();
const $ = s => document.querySelector(s);

const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const profile = id => profiles.find(p=>p.id===id) || morning;
const avatar = p => `<img class="avatar" src="${esc(p.avatar)}" alt="">`;
const avatarLink = p => `<button class="profile-avatar-link" type="button" data-profile="${esc(p.id)}" aria-label="View ${esc(p.displayName)} profile">${avatar(p)}</button>`;
const badge = p => p.badge || p.badgeImage || p.verified ? `<span class="badge">${p.badgeImage?`${esc(p.badgeImage)} `:""}${esc(p.badge||"")}${p.verified?' <img class="verified" src="assets/verified.png" alt="Verified" style="width:14px;height:14px;object-fit:contain;vertical-align:middle">':""}</span>` : "";
function timeAgo(d){let n=Math.max(0,Math.floor((Date.now()-new Date(d).getTime())/60000));return n<1?"just now":n<60?`${n}m ago`:n<1440?`${Math.floor(n/60)}h ago`:`${Math.floor(n/1440)}d ago`}
function setupPostVideos(){
 $("#feed").querySelectorAll(".post-video-player").forEach(player=>{
  const video=player.querySelector("video");
  const toggle=player.querySelector(".video-play-toggle");
  const seek=player.querySelector(".video-seek");
  const progressStar=player.querySelector(".video-progress-star");
  const time=player.querySelector(".video-time");

  const updateProgress=()=>{
   const percent=video.duration?video.currentTime/video.duration*100:0;
   seek.value=String(percent);
   seek.style.setProperty("--progress",`${percent}%`);
   progressStar.style.left=`${percent}%`;
   time.textContent=`${fmt(video.currentTime)} / ${fmt(video.duration)}`;
  };
  const updatePlayback=()=>{
   const isPlaying=!video.paused;
   toggle.textContent=isPlaying?"Ⅱ":"▶";
   toggle.setAttribute("aria-label",isPlaying?"Pause video":"Play video");
   toggle.setAttribute("aria-pressed",String(isPlaying));
  };

  toggle.addEventListener("click",()=>{
   if(video.paused){
    video.play().catch(()=>toast("This video couldn't be played."));
   }else{
    video.pause();
   }
  });
  seek.addEventListener("input",()=>{
   if(video.duration)video.currentTime=video.duration*Number(seek.value)/100;
  });
  video.addEventListener("play",()=>{
   window.clearTimeout(Number(player.dataset.endEffectTimer));
   player.classList.remove("video-ended");
   updatePlayback();
  });
  video.addEventListener("pause",updatePlayback);
  video.addEventListener("timeupdate",updateProgress);
  video.addEventListener("loadedmetadata",updateProgress);
  video.addEventListener("durationchange",updateProgress);
  video.addEventListener("ended",()=>{
   updatePlayback();
   player.classList.add("video-ended");
   player.dataset.endEffectTimer=String(window.setTimeout(()=>{
    player.classList.remove("video-ended");
    delete player.dataset.endEffectTimer;
   },2000));
  });
  updateProgress();
  updatePlayback();
 });
}
function render(){
 const feed=$("#feed"); const shown=posts.slice(0,visiblePosts);
 $("#postCount").textContent=posts.length;$("#statPosts").textContent=posts.length;$("#statProfiles").textContent=profiles.length;
 feed.innerHTML=shown.map(post=>{
  const p=profile(post.profileId);
  const media=post.image?`<img class="post-media" src="${esc(post.image)}">`:post.video?`<div class="post-video-player"><video class="post-media" src="${esc(post.video)}" playsinline preload="metadata"></video><div class="video-controls"><button class="video-play-toggle" type="button" aria-label="Play video" aria-pressed="false">▶</button><div class="video-progress"><input class="video-seek" type="range" min="0" max="100" step="0.1" value="0" aria-label="Seek video"><span class="video-progress-star" aria-hidden="true">★</span></div><span class="video-time">0:00 / 0:00</span></div><div class="video-end-star" aria-hidden="true">✦</div></div>`:"";
  const postSettings={visibleComments:settings.initialVisibleComments,commentsEnabled:true,reactionsEnabled:true,...(post.settings||{})};
  const allComments=post.comments||[];
  const commentLimit=admin?10:postSettings.visibleComments;
  const comments=allComments.slice(Math.max(0,allComments.length-commentLimit));
  return `<article class="post" data-post="${esc(post.id)}"><div class="post-head">${avatarLink(p)}<div class="post-user"><button class="post-profile-link" type="button" data-profile="${esc(p.id)}"><b>${esc(p.displayName)}</b>${badge(p)}<small>@${esc(p.username)} · ${timeAgo(post.date)}</small></button></div><button class="post-menu" data-edit-post="${esc(post.id)}" title="Edit post">···</button></div>
  <div class="post-text">${esc(post.text).replace(/\n/g,"<br>")}</div>${media}
  <div class="post-actions"><button class="action ${post.liked?'liked':''}" data-like="${esc(post.id)}">♥ ${post.likes||0} likes</button><button class="action" data-focus="${esc(post.id)}">↩ ${(post.comments||[]).length} comments</button>${postSettings.reactionsEnabled?`<button class="action" data-react="${esc(post.id)}">＋ react</button>`:""}${admin?`<button class="action" data-delete="${esc(post.id)}">delete</button>`:""}</div>
  <div class="reactions">${postSettings.reactionsEnabled?Object.entries(post.reactions||{}).map(([e,n])=>`<button class="react" data-react-existing="${esc(post.id)}|${esc(e)}">${e} ${n}</button>`).join(""):""}</div>
  <div class="comments">${comments.map(c=>{let cp=profile(c.profileId);return `<div class="comment">${avatarLink(cp)}<div class="comment-content"><button class="comment-profile-link" type="button" data-profile="${esc(cp.id)}"><b>${esc(cp.username)}</b>${badge(cp)}</button>${esc(c.text)}${c.image?`<img class="comment-image" src="${esc(c.image)}">`:""}<div class="comment-actions">${settings.commentReactionChoices.map(emoji=>`<button class="comment-react" data-comment-react="${esc(post.id)}|${esc(c.id)}|${emoji}" title="React ${emoji}">${emoji}</button>`).join("")}${Object.entries(c.reactions||{}).map(([emoji,count])=>`<button class="comment-react-count" data-comment-react="${esc(post.id)}|${esc(c.id)}|${esc(emoji)}">${emoji} ${count}</button>`).join("")}${admin?`<button class="comment-edit" data-edit-comment="${esc(post.id)}|${esc(c.id)}">edit</button><button class="comment-edit" data-delete-comment="${esc(post.id)}|${esc(c.id)}">delete</button>`:""}</div></div></div>`}).join("")}
  ${!postSettings.commentsEnabled?`<div class="comment-compose"><input placeholder="Comments are turned off for this post" disabled></div>`:admin?`<div class="comment-compose"><input id="comment-${esc(post.id)}" placeholder="Write a comment as @${esc(profile(activeProfileId).username)}…"><button class="tiny-send" data-comment="${esc(post.id)}">SEND</button></div>`:`<div class="comment-compose"><input placeholder="Spectator view · comments are read-only" disabled></div>`}
  </div></article>`;
 }).join("");
 setupPostVideos();
 $("#feedGate").classList.toggle("hidden",visiblePosts>=posts.length);
 $("#gateUnlock").textContent=admin?"ALL POSTS UNLOCKED":"ENTER ADMIN PIN →";
}
function modal(title,body,actions=""){ $("#modalRoot").innerHTML=`<div class="modal-backdrop"><div class="modal"><h2>${title}</h2>${body}${actions}</div></div>`;$("#modalRoot").querySelector(".modal-backdrop").addEventListener("click",e=>{if(e.target.classList.contains("modal-backdrop"))closeModal()})}
function closeModal(){$("#modalRoot").innerHTML=""}
function toast(msg){let t=document.createElement("div");t.className="toast";t.textContent=msg;document.body.append(t);setTimeout(()=>t.remove(),2300)}
async function loadSavedPosts() {
 try {
  let response=await fetch("./api/posts",{cache:"no-store"});
  let saved;
  let apiStorage=false;
  if(response.ok){
   saved=await response.json();
   apiStorage=true;
  }else if(response.status===404){
   saved=[];
  }else{
   throw new Error(`Saved posts request failed (${response.status}).`);
  }
  if(!Array.isArray(saved)||!saved.every(post=>post&&typeof post.id==="string"&&typeof post.profileId==="string"&&typeof post.text==="string")){
   throw new Error("Saved posts data is invalid.");
  }
  persistentPostStorageAvailable=apiStorage;
  const existingIds=new Set(posts.map(post=>post.id));
  posts.unshift(...saved.filter(post=>!existingIds.has(post.id)));
  render();
 }catch(error){
  console.error("Could not load saved posts:",error);
  toast("Saved posts couldn't be loaded. Check the server and try refreshing.");
 }
}
async function loadSavedActivity() {
 await persistentPostsReady;
 try {
  let response=await fetch("./api/activity",{cache:"no-store"});
  let activity;
  let apiStorage=false;
  if(response.ok){
   activity=await response.json();
   apiStorage=true;
  }else if(response.status===404){
   response=await fetch("./data/activity.json",{cache:"no-store"});
   if(!response.ok)throw new Error(`Saved activity request failed (${response.status}).`);
   activity=await response.json();
  }else{
   throw new Error(`Saved activity request failed (${response.status}).`);
  }
  if(!activity||!Array.isArray(activity.comments)||!Array.isArray(activity.postReactions)||!Array.isArray(activity.commentReactions)){
   throw new Error("Saved activity data is invalid.");
  }
  for(const entry of activity.comments){
   if(!entry||typeof entry.postId!=="string"||!entry.comment||typeof entry.comment.id!=="string"||typeof entry.comment.profileId!=="string"||typeof entry.comment.text!=="string"||!posts.some(post=>post.id===entry.postId)){
    throw new Error("Saved comment refers to a missing post or is invalid.");
   }
  }
  for(const entry of activity.postReactions){
   if(!entry||typeof entry.postId!=="string"||typeof entry.emoji!=="string"||!Number.isInteger(entry.count)||entry.count<1||!posts.some(post=>post.id===entry.postId)){
    throw new Error("Saved post reaction is invalid.");
   }
  }
  for(const entry of activity.commentReactions){
   const post=entry&&posts.find(item=>item.id===entry.postId);
   const comment=post?.comments?.some(item=>item.id===entry.commentId)
    ||activity.comments.some(item=>item.postId===entry.postId&&item.comment.id===entry.commentId);
   if(!post||typeof entry.emoji!=="string"||!Number.isInteger(entry.count)||entry.count<1||!comment){
    throw new Error("Saved comment reaction is invalid.");
   }
  }
  persistentActivityStorageAvailable=apiStorage;
  for(const entry of activity.comments){
   const post=posts.find(item=>item.id===entry.postId);
   post.comments=post.comments||[];
   if(!post.comments.some(comment=>comment.id===entry.comment.id))post.comments.push(entry.comment);
  }
  for(const entry of activity.postReactions){
   const post=posts.find(item=>item.id===entry.postId);
   post.reactions=post.reactions||{};
   post.reactions[entry.emoji]=(Number(post.reactions[entry.emoji])||0)+entry.count;
  }
  for(const entry of activity.commentReactions){
   const comment=posts.find(item=>item.id===entry.postId)?.comments?.find(item=>item.id===entry.commentId);
   comment.reactions=comment.reactions||{};
   comment.reactions[entry.emoji]=(Number(comment.reactions[entry.emoji])||0)+entry.count;
  }
  render();
 }catch(error){
  persistentActivityStorageAvailable=false;
  console.error("Could not load saved activity:",error);
  toast("Saved comments or reactions couldn't be loaded. Check the server and try refreshing.");
 }
}
async function saveActivity(action,requiresAdmin=false) {
 await persistentActivityReady;
 if(!persistentActivityStorageAvailable)return false;
 const headers={"Content-Type":"application/json"};
 if(requiresAdmin)headers["X-Admin-Pin"]=adminPin;
 const response=await fetch("./api/activity",{method:"POST",headers,body:JSON.stringify(action)});
 const result=await response.json();
 if(!response.ok)throw new Error(result.error||`Save failed (${response.status}).`);
 return true;
}
function askPin() {
 modal("HOLD ON. ARE YOU ADMIN?",`<p>Please type in the admin key to unlock posting, comments and older posts.</p><label>ADMIN KEY</label><input id="pinInput" placeholder="Enter admin pin" autocomplete="off"><p id="pinError" style="color:#ff6684"></p>`,`<div class="modal-actions"><button class="secondary-btn" id="cancelModal">CANCEL</button><button class="primary-btn" id="submitPin">UNLOCK ACCESS →</button></div>`);
 $("#cancelModal").onclick=closeModal;
 $("#submitPin").onclick=()=>{
  if($("#pinInput").value===settings.adminPin){
   admin=true;
   adminPin=$("#pinInput").value;
   visiblePosts=posts.length;
   closeModal();
   render();
   toast("Admin access unlocked.");
  }else{
   $("#pinError").textContent="That pin doesn't look right. Try again.";
  }
 };
 $("#pinInput").addEventListener("keydown",e=>{if(e.key==="Enter")$("#submitPin").click()});
}
function postEditor(post=null,useSelectedProfile=false) {
 if(!admin)return askPin();
 const p=post||{text:"",image:"",video:""};
 modal(post?"EDIT POST":"CREATE A POST",`<p>New posts are saved to this project when using <b>npm start</b>. Edits remain in this browser session.</p><label>POST TEXT</label><textarea id="postText">${esc(p.text)}</textarea><label>IMAGE PATH OR URL (OPTIONAL)</label><input id="postImage" value="${esc(p.image||"")}" placeholder="assets/my-image.jpg"><label>VIDEO PATH OR URL (OPTIONAL)</label><input id="postVideo" value="${esc(p.video||"")}" placeholder="assets/my-video.mp4">`,`<div class="modal-actions"><button class="secondary-btn" id="cancelModal">CANCEL</button><button class="primary-btn" id="savePost">SAVE POST</button></div>`);
 $("#cancelModal").onclick=closeModal;
 $("#savePost").onclick=async()=>{
  const text=$("#postText").value.trim();
  if(!text)return toast("Add some post text first.");
  const image=$("#postImage").value.trim();
  const video=$("#postVideo").value.trim();
  await persistentPostsReady;
  if(post){
   post.text=text;
   post.image=image;
   post.video=video;
  }else{
   const newPost={id:"p"+Date.now(),profileId:useSelectedProfile?activeProfileId:owner.id,text,date:new Date().toISOString(),image,video,likes:0,reactions:{},comments:[]};
   if(persistentPostStorageAvailable){
    try{
     const response=await fetch("./api/posts",{method:"POST",headers:{"Content-Type":"application/json","X-Admin-Pin":adminPin},body:JSON.stringify(newPost)});
     const result=await response.json();
     if(!response.ok)throw new Error(result.error||`Save failed (${response.status}).`);
     posts.unshift(result);
    }catch(error){
     console.error("Could not save post:",error);
     return toast(`Post wasn't saved: ${error.message}`);
    }
   }else{
    posts.unshift(newPost);
   }
  }
  closeModal();
  render();
  toast(post?"Post saved for this session.":persistentPostStorageAvailable?"Post saved to this project.":"Post saved for this session only. Use npm start to save it to the project.");
 };
}
function updateAccountSwitchButton(){
 const button=$("#accountSwitch");
 const selected=profile(activeProfileId);
 button.title=`Switch account (currently @${selected.username})`;
 button.setAttribute("aria-label",`Switch posting and commenting account. Current account: @${selected.username}`);
}
function switchPostingAccount(){
 if(!admin)return askPin();
 modal("SWITCH ACCOUNT",`<p>New posts and comments will use the selected account.</p><label>POST AND COMMENT AS</label><select id="activeProfileSelect">${profiles.map(person=>`<option value="${esc(person.id)}" ${person.id===activeProfileId?"selected":""}>${esc(person.displayName)} · @${esc(person.username)}</option>`).join("")}</select>`,`<div class="modal-actions"><button class="secondary-btn" id="cancelModal">CANCEL</button><button class="primary-btn" id="saveAccount">SWITCH ACCOUNT</button></div>`);
 $("#cancelModal").onclick=closeModal;
 $("#saveAccount").onclick=()=>{
  const selected=profiles.find(person=>person.id===$("#activeProfileSelect").value);
  if(!selected)return toast("Choose an existing account.");
  activeProfileId=selected.id;
  updateAccountSwitchButton();
  closeModal();
  render();
  toast(`Now posting and commenting as @${selected.username}.`);
 };
}
async function commentEditor(postId){
 if(!admin)return askPin();
 const input=$(`#comment-${CSS.escape(postId)}`);
 const text=input?.value.trim();
 if(!text)return toast("Write a comment first.");
 const post=posts.find(item=>item.id===postId);
 if(!post)return toast("That post could not be found.");
 const comment={id:`c${Date.now()}-${Math.random().toString(36).slice(2,8)}`,profileId:activeProfileId,text,image:"",likes:0,reactions:{}};
 try{
  await saveActivity({type:"comment",postId,comment},true);
 }catch(error){
  console.error("Could not save comment:",error);
  return toast(`Comment wasn't saved: ${error.message}`);
 }
 post.comments=post.comments||[];
 post.comments.push(comment);
 render();
 document.querySelector(`[data-post="${CSS.escape(postId)}"] .comment-compose`)?.scrollIntoView({behavior:"smooth",block:"nearest"});
 toast(persistentActivityStorageAvailable?`Comment saved as @${profile(activeProfileId).username}.`:`Comment added as @${profile(activeProfileId).username} for this session only.`);
}
async function addReaction(postId,emoji,commentId=""){
 if(typeof emoji!=="string"||!emoji.trim()||emoji.trim().length>32||emoji.includes("|")){
  return toast("Use a short reaction without the | character.");
 }
 emoji=emoji.trim();
 const post=posts.find(item=>item.id===postId);
 const target=commentId?post?.comments?.find(item=>item.id===commentId):post;
 if(!target)return;
 try{
  await saveActivity({type:"reaction",target:commentId?"comment":"post",postId,commentId,emoji});
 }catch(error){
  console.error("Could not save reaction:",error);
  return toast(`Reaction wasn't saved: ${error.message}`);
 }
 target.reactions=target.reactions||{};
 target.reactions[emoji]=(Number(target.reactions[emoji])||0)+1;
 render();
 if(!persistentActivityStorageAvailable)toast("Reaction added for this session only.");
}
function profileModal(id){let p=profile(id);modal(`<div class="profile-hero" ${p.profileBackground?`style="background-image:linear-gradient(#100d14bb,#100d14dd),url('${esc(p.profileBackground)}');background-size:cover;background-position:center;padding:14px;border-radius:12px"`:""}>${avatar(p)}<div><h2>${esc(p.displayName)}</h2><p>@${esc(p.username)} ${badge(p)}</p></div></div>`,`<p>${esc(p.bio)}</p><div class="profile-stats"><span><b>${p.followers}</b> FOLLOWERS</span><span><b>${posts.filter(x=>x.profileId===p.id).length}</b> POSTS</span><span><b>${p.artist?"ARTIST":"MEMBER"}</b></span></div><p>${p.artist?`♫ ${esc(p.musicName)}`:"Not listed as an artist."}</p><p>Profile ID: <code>${esc(p.id)}</code></p>`,`<div class="modal-actions"><button class="secondary-btn" id="copyProfile">COPY PROFILE ID</button><button class="primary-btn" id="closeProfile">CLOSE</button></div>`);$("#closeProfile").onclick=closeModal;$("#copyProfile").onclick=()=>{navigator.clipboard?.writeText(p.id);toast("Profile ID copied.")};}
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
 el=e.target.closest("[data-react]");if(el){let id=el.dataset.react;let emoji=prompt("Type one emoji to react with:","✨");if(emoji?.trim())void addReaction(id,emoji.trim());return}
 el=e.target.closest("[data-react-existing]");if(el){let [id,emoji]=el.dataset.reactExisting.split("|");void addReaction(id,emoji);return}
 el=e.target.closest("[data-comment-react]");if(el){let [pid,cid,emoji]=el.dataset.commentReact.split("|");void addReaction(pid,emoji,cid);return}
 el=e.target.closest("[data-comment]");if(el){commentEditor(el.dataset.comment);return}
 if(e.target.closest("[data-comment-lock]")){askPin();return}
 el=e.target.closest("[data-focus]");if(el){document.querySelector(`[data-post="${CSS.escape(el.dataset.focus)}"] .comment-compose input`)?.focus();return}
 el=e.target.closest("[data-edit-post]");if(el){postEditor(posts.find(p=>p.id===el.dataset.editPost));return}
 el=e.target.closest("[data-delete]");if(el&&admin){posts=posts.filter(p=>p.id!==el.dataset.delete);render();return}
 el=e.target.closest("[data-like-comment]");if(el){let [pid,cid]=el.dataset.likeComment.split("|");let c=posts.find(p=>p.id===pid).comments.find(c=>c.id===cid);c.likes=(c.likes||0)+1;render();return}
 el=e.target.closest("[data-edit-comment]");if(el){if(!admin)return askPin();let [pid,cid]=el.dataset.editComment.split("|");let c=posts.find(p=>p.id===pid).comments.find(c=>c.id===cid);let t=prompt("Edit comment:",c.text);if(t!==null){c.text=t;render()}return}
 el=e.target.closest("[data-delete-comment]");if(el&&admin){let [pid,cid]=el.dataset.deleteComment.split("|");let p=posts.find(p=>p.id===pid);p.comments=p.comments.filter(c=>c.id!==cid);render();return}
});
$("#adminBtn").insertAdjacentHTML("beforebegin",`<button id="newPost" class="icon-btn" title="Create post" aria-label="Create post">＋</button><button id="accountPost" class="icon-btn" title="Create a post as the selected account" aria-label="Create a post as the selected account">★</button><button id="accountSwitch" class="icon-btn account-switch-button" title="Switch posting account" aria-label="Switch posting and commenting account"><span aria-hidden="true">⟳</span></button>`);$("#newPost").onclick=()=>admin?postEditor():askPin();$("#accountPost").onclick=()=>postEditor(null,true);$("#accountSwitch").onclick=switchPostingAccount;updateAccountSwitchButton();
$("#openPlayer").onclick=()=>$("#musicPlayer").classList.remove("hidden");$("#musicToggle").onclick=()=>$("#musicPlayer").classList.toggle("hidden");$("#closePlayer").onclick=()=>$("#musicPlayer").classList.add("hidden");$("#minPlayer").onclick=()=>$("#musicPlayer").classList.toggle("compact");
const tracks=[
 {title:"Loze gaze.",src:"assets/Love gaze..mp4",artist:"MoringShedding_grey"},
 {title:"Made Us.",src:"assets/Made Us..mp4",artist:"deserve"},
 {title:"Bleeding",src:"assets/Bleeding.mp4",artist:"MoringShedding_grey"},
 {title:"Early Moring",src:"assets/Early Moring.mp4",artist:"MoringShedding_grey"},
 {title:"OG EECHOSHARE",src:"assets/OG%20EECHOSHARE.mp3",artist:"MoringShedding_grey"}
];let track=0;const audio=$("#audio");
function fmt(s){return !isFinite(s)?"0:00":`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`}
function madeBy(t){return `Made by @${t.artist}`}
function loadTrack(i,play=false){track=(i+tracks.length)%tracks.length;$("#trackTitle").textContent=tracks[track].title;$("#nowTitle").textContent=tracks[track].title;$("#nowArtist").textContent=madeBy(tracks[track]);$("#trackArtist").textContent=madeBy(tracks[track]);audio.src=tracks[track].src;$("#trackList").innerHTML=tracks.map((t,j)=>`<button class="track-item ${j===track?'active':''}" data-track="${j}">♫ ${t.title}<small>Made by @${t.artist}</small></button>`).join("");if(play)audio.play().catch(()=>toast("Press play to start audio."));}
$("#playTrack").onclick=()=>{if(audio.paused)audio.play().catch(()=>{});else audio.pause()};audio.onplay=()=>$("#playTrack").textContent="Ⅱ";audio.onpause=()=>$("#playTrack").textContent="▶";$("#nextTrack").onclick=()=>loadTrack(track+1,true);$("#prevTrack").onclick=()=>loadTrack(track-1,true);$("#trackList").onclick=e=>{let b=e.target.closest("[data-track]");if(b)loadTrack(+b.dataset.track,true)};audio.ontimeupdate=()=>{$("#seek").value=audio.duration?audio.currentTime/audio.duration*100:0;$("#elapsed").textContent=fmt(audio.currentTime);$("#duration").textContent=fmt(audio.duration)};$("#seek").oninput=()=>{if(audio.duration)audio.currentTime=audio.duration*$("#seek").value/100};audio.onended=()=>loadTrack(track+1,true);loadTrack(0);
const player=$("#musicPlayer"),head=player.querySelector(".player-head");let drag=null;head.addEventListener("pointerdown",e=>{if(e.target.tagName==="BUTTON")return;let r=player.getBoundingClientRect();drag={x:e.clientX-r.left,y:e.clientY-r.top};head.setPointerCapture(e.pointerId)});head.addEventListener("pointermove",e=>{if(!drag)return;player.style.left=(e.clientX-drag.x)+"px";player.style.top=(e.clientY-drag.y)+"px";player.style.right="auto";player.style.bottom="auto"});head.addEventListener("pointerup",()=>drag=null);
render();setTimeout(()=>$("#loader").classList.add("done"),1500);
persistentPostsReady=loadSavedPosts();
persistentActivityReady=loadSavedActivity();


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
