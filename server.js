require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DB_FILE = path.join(ROOT, "data", "db.json");
const UPLOAD_DIR = path.join(ROOT, "uploads");
const ADMIN_PIN = process.env.ADMIN_PIN || "723X";
const sessions = new Set();

fs.mkdirSync(path.dirname(DB_FILE), {recursive:true});
fs.mkdirSync(UPLOAD_DIR, {recursive:true});
app.disable("x-powered-by");
app.use(helmet({contentSecurityPolicy:false, crossOriginResourcePolicy:{policy:"cross-origin"}}));
const origins = (process.env.CORS_ORIGINS || "").split(",").map(x=>x.trim()).filter(Boolean);
app.use(cors({origin:(origin,cb)=> {
  if (!origin || !origins.length || origins.includes(origin)) return cb(null,true);
  cb(new Error("Origin not allowed"));
}, credentials:true}));
app.use(express.json({limit:"2mb"}));
app.use("/api", rateLimit({windowMs:60_000, max:180, standardHeaders:true, legacyHeaders:false}));
app.use("/uploads", express.static(UPLOAD_DIR, {maxAge:"1d"}));
app.use(express.static(path.join(ROOT,"public")));

function readDB(){ return JSON.parse(fs.readFileSync(DB_FILE,"utf8")); }
function writeDB(db){ fs.writeFileSync(DB_FILE, JSON.stringify(db,null,2)); }
function id(prefix="id"){ return prefix+"-"+crypto.randomBytes(6).toString("hex"); }
function isAdmin(req){ const token=req.get("x-admin-token") || req.cookies?.commentate_admin; return !!token && sessions.has(token); }
function adminOnly(req,res,next){ if(!isAdmin(req)) return res.status(403).json({error:"Admin access required"}); next(); }
function safeProfile(p){ return {...p}; }

app.post("/api/admin/login", (req,res)=>{
  const pin=String(req.body?.pin || "");
  if(pin !== ADMIN_PIN) return res.status(401).json({error:"That PIN is not correct."});
  const token=crypto.randomBytes(32).toString("hex");
  sessions.add(token);
  res.json({ok:true,token});
});
app.post("/api/admin/logout", (req,res)=>{
  const token=req.get("x-admin-token"); if(token) sessions.delete(token);
  res.json({ok:true});
});
app.get("/api/state",(req,res)=>{
  const db=readDB();
  res.json({profiles:db.profiles.map(safeProfile),posts:db.posts,admin:isAdmin(req)});
});
app.post("/api/posts",adminOnly,(req,res)=>{
  const db=readDB(); const {profileId,text,media="",mediaType=""}=req.body||{};
  if(!db.profiles.some(p=>p.id===profileId)) return res.status(400).json({error:"Choose an existing profile."});
  if(!String(text||"").trim() && !media) return res.status(400).json({error:"Add text or media."});
  const post={id:id("post"),profileId,text:String(text||"").slice(0,5000),media,mediaType,likes:0,reactions:{},createdAt:Date.now(),comments:[]};
  db.posts.unshift(post); writeDB(db); res.json(post);
});
app.patch("/api/posts/:id",adminOnly,(req,res)=>{
  const db=readDB(), p=db.posts.find(x=>x.id===req.params.id); if(!p) return res.status(404).json({error:"Post not found"});
  for(const k of ["text","likes","reactions","profileId"]) if(req.body[k]!==undefined) p[k]=req.body[k];
  writeDB(db); res.json(p);
});
app.delete("/api/posts/:id",adminOnly,(req,res)=>{
  const db=readDB(), before=db.posts.length; db.posts=db.posts.filter(x=>x.id!==req.params.id);
  if(db.posts.length===before) return res.status(404).json({error:"Post not found"});
  writeDB(db); res.json({ok:true});
});
app.post("/api/posts/:id/comments",adminOnly,(req,res)=>{
  const db=readDB(), p=db.posts.find(x=>x.id===req.params.id); if(!p) return res.status(404).json({error:"Post not found"});
  const {profileId,text}=req.body||{};
  if(!db.profiles.some(x=>x.id===profileId) || !String(text||"").trim()) return res.status(400).json({error:"Choose a profile and enter a comment."});
  const c={id:id("comment"),profileId,text:String(text).slice(0,2000),likes:0,reactions:{},replies:[],createdAt:Date.now()};
  p.comments.push(c); writeDB(db); res.json(c);
});
app.patch("/api/comments/:id",adminOnly,(req,res)=>{
  const db=readDB(); let found=null;
  for(const p of db.posts){ for(const c of p.comments){ if(c.id===req.params.id){found=c;break;} for(const r of (c.replies||[])){if(r.id===req.params.id){found=r;break;}} if(found)break;} if(found)break; }
  if(!found) return res.status(404).json({error:"Comment not found"});
  for(const k of ["text","likes","reactions","profileId"]) if(req.body[k]!==undefined) found[k]=req.body[k];
  writeDB(db); res.json(found);
});
app.delete("/api/comments/:id",adminOnly,(req,res)=>{
  const db=readDB(); let removed=false;
  for(const p of db.posts){ const n=p.comments.length; p.comments=p.comments.filter(c=>c.id!==req.params.id); if(n!==p.comments.length)removed=true;
    for(const c of p.comments){const old=(c.replies||[]).length;c.replies=(c.replies||[]).filter(r=>r.id!==req.params.id);if(old!==c.replies.length)removed=true;}
  }
  if(!removed)return res.status(404).json({error:"Comment not found"}); writeDB(db);res.json({ok:true});
});
app.post("/api/comments/:id/replies",adminOnly,(req,res)=>{
  const db=readDB(); let parent=null;
  for(const p of db.posts) for(const c of p.comments) if(c.id===req.params.id) parent=c;
  if(!parent)return res.status(404).json({error:"Comment not found"});
  const {profileId,text}=req.body||{};
  if(!db.profiles.some(x=>x.id===profileId)||!String(text||"").trim())return res.status(400).json({error:"Choose a profile and enter a reply."});
  const r={id:id("reply"),profileId,text:String(text).slice(0,1500),likes:0,createdAt:Date.now()};
  parent.replies=parent.replies||[];parent.replies.push(r);writeDB(db);res.json(r);
});
app.patch("/api/profiles/:id",adminOnly,(req,res)=>{
  const db=readDB(), p=db.profiles.find(x=>x.id===req.params.id);if(!p)return res.status(404).json({error:"Profile not found"});
  const allowed=["userId","username","displayName","avatar","badgeImage","verified","artist","musicName","bio","followers","following","theme"];
  for(const k of allowed)if(req.body[k]!==undefined)p[k]=req.body[k];
  writeDB(db);res.json(p);
});
const storage=multer.diskStorage({destination:UPLOAD_DIR,filename:(req,file,cb)=>{
  const ext=path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g,"").slice(0,10);
  cb(null,Date.now()+"-"+crypto.randomBytes(5).toString("hex")+ext);
}});
const upload=multer({storage,limits:{fileSize:50*1024*1024},fileFilter:(req,file,cb)=>{
  const ok=/^(image\/(png|jpeg|gif|webp)|video\/(mp4|webm|quicktime))$/.test(file.mimetype);
  cb(ok?null:new Error("Only images and common video files are allowed."),ok);
}});
app.post("/api/upload",adminOnly,upload.single("media"),(req,res)=>{
  if(!req.file)return res.status(400).json({error:"Choose a file."});
  res.json({url:"/uploads/"+req.file.filename,type:req.file.mimetype.startsWith("video/")?"video":"image"});
});
app.get("/api/health",(req,res)=>res.json({ok:true,service:"Commentate"}));
app.use((err,req,res,next)=>{console.error(err.message);res.status(400).json({error:err.message||"Request failed"});});
app.listen(PORT,"0.0.0.0",()=>console.log(`Commentate running at http://localhost:${PORT}`));
