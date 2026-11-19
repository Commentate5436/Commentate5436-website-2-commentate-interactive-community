import { createReadStream } from "node:fs";
import { readFile, rename, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { timingSafeEqual } from "node:crypto";
import { posts as contentPosts, settings } from "./data/content.js";

const root = dirname(fileURLToPath(import.meta.url));
const contentPath = resolve(root, "data/content.js");
const activityPath = resolve(root, "data/activity.json");
const maxRequestSize = 64 * 1024;
const mimeTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".webp": "image/webp"
};
let writeQueue = Promise.resolve();
let localPosts = contentPosts.filter(post => post.savedByEditor === true);

function sendJson(response, status, value) {
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(value));
}

async function readRequestBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxRequestSize) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.statusCode = 400;
    throw error;
  }
}

function validatePost(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    const error = new Error("A post object is required.");
    error.statusCode = 400;
    throw error;
  }

  const post = {
    id: typeof value.id === "string" ? value.id : "",
    profileId: typeof value.profileId === "string" ? value.profileId : "",
    text: typeof value.text === "string" ? value.text.trim() : "",
    date: typeof value.date === "string" ? value.date : "",
    image: typeof value.image === "string" ? value.image.trim() : "",
    video: typeof value.video === "string" ? value.video.trim() : ""
  };
  if (!/^p[a-zA-Z0-9_-]{1,100}$/.test(post.id)
    || !/^[a-zA-Z0-9_-]{1,100}$/.test(post.profileId)
    || !post.text || post.text.length > 5000
    || !Number.isFinite(Date.parse(post.date))
    || post.image.length > 2048 || post.video.length > 2048) {
    const error = new Error("The post fields are invalid or exceed their limits.");
    error.statusCode = 400;
    throw error;
  }

  return {
    ...post,
    date: new Date(post.date).toISOString(),
    likes: 0,
    reactions: {},
    comments: [],
    savedByEditor: true
  };
}

function savePost(post) {
  const operation = writeQueue.then(async () => {
    const source = await readFile(contentPath, "utf8");
    if (source.includes(`id: "${post.id}"`) || source.includes(`"id": "${post.id}"`)) {
      const error = new Error("A post with this ID already exists.");
      error.statusCode = 409;
      throw error;
    }
    const marker = "export const posts = [";
    const markerIndex = source.indexOf(marker);
    if (markerIndex === -1 || source.indexOf(marker, markerIndex + marker.length) !== -1) {
      throw new Error("Could not locate the posts array in data/content.js.");
    }
    const insertionPoint = markerIndex + marker.length;
    const serializedPost = JSON.stringify(post, null, 2).split("\n").map(line => `  ${line}`).join("\n");
    const updatedSource = `${source.slice(0, insertionPoint)}\n${serializedPost},${source.slice(insertionPoint)}`;
    const temporaryPath = `${contentPath}.${process.pid}.tmp`;
    await writeFile(temporaryPath, updatedSource);
    await rename(temporaryPath, contentPath);
    localPosts.unshift(post);
    return post;
  });
  writeQueue = operation.catch(() => {});
  return operation;
}

async function readActivity() {
  const activity = JSON.parse(await readFile(activityPath, "utf8"));
  if (!activity || !Array.isArray(activity.comments)
    || !Array.isArray(activity.postReactions) || !Array.isArray(activity.commentReactions)) {
    throw new Error("Saved activity data must contain comments and reaction arrays.");
  }
  return activity;
}

function updateActivity(update) {
  const operation = writeQueue.then(async () => {
    const activity = await readActivity();
    const result = update(activity);
    const temporaryPath = `${activityPath}.${process.pid}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(activity, null, 2)}\n`);
    await rename(temporaryPath, activityPath);
    return result;
  });
  writeQueue = operation.catch(() => {});
  return operation;
}

function knownPost(postId) {
  return contentPosts.find(post => post.id === postId) || localPosts.find(post => post.id === postId);
}

function validateComment(value) {
  const comment = {
    id: typeof value?.id === "string" ? value.id : "",
    profileId: typeof value?.profileId === "string" ? value.profileId : "",
    text: typeof value?.text === "string" ? value.text.trim() : "",
    image: typeof value?.image === "string" ? value.image.trim() : ""
  };
  if (!/^c[a-zA-Z0-9_-]{1,100}$/.test(comment.id)
    || !/^[a-zA-Z0-9_-]{1,100}$/.test(comment.profileId)
    || !comment.text || comment.text.length > 5000 || comment.image.length > 2048) {
    const error = new Error("The comment fields are invalid or exceed their limits.");
    error.statusCode = 400;
    throw error;
  }
  return { ...comment, likes: 0, reactions: {} };
}

function checkSameOrigin(request, response) {
  const origin = request.headers.origin;
  if (!origin) return true;
  try {
    if (new URL(origin).host === request.headers.host) return true;
  } catch {
    // Treat malformed origins as cross-origin.
  }
  sendJson(response, 403, { error: "Cross-origin write requests are not allowed." });
  return false;
}

function hasValidAdminPin(request) {
  const providedPin = Buffer.from(request.headers["x-admin-pin"] || "");
  const expectedPin = Buffer.from(settings.adminPin);
  return providedPin.length === expectedPin.length && timingSafeEqual(providedPin, expectedPin);
}

function statusError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function handleActivityApi(request, response) {
  if (request.method === "GET") {
    sendJson(response, 200, await readActivity());
    return true;
  }
  if (request.method !== "POST") {
    response.writeHead(405, { Allow: "GET, POST" });
    response.end();
    return true;
  }
  if (!checkSameOrigin(request, response)) return true;

  try {
    const value = await readRequestBody(request);
    if (value?.type === "comment") {
      if (!hasValidAdminPin(request)) {
        sendJson(response, 401, { error: "Admin access is required to save comments." });
        return true;
      }
      const postId = typeof value.postId === "string" ? value.postId : "";
      const post = knownPost(postId);
      if (!post) {
        sendJson(response, 404, { error: "The post for this comment could not be found." });
        return true;
      }
      const comment = validateComment(value.comment);
      const result = await updateActivity(activity => {
        const duplicate = post.comments?.some(item => item.id === comment.id)
          || activity.comments.some(item => item.postId === postId && item.comment.id === comment.id);
        if (duplicate) throw statusError("A comment with this ID already exists on this post.", 409);
        activity.comments.push({ postId, comment });
        return { comment };
      });
      sendJson(response, 201, result);
      return true;
    }

    if (value?.type === "reaction") {
      const postId = typeof value.postId === "string" ? value.postId : "";
      const target = value.target;
      const commentId = typeof value.commentId === "string" ? value.commentId : "";
      const emoji = typeof value.emoji === "string" ? value.emoji.trim() : "";
      const post = knownPost(postId);
      if (!post || (target !== "post" && target !== "comment")
        || !emoji || emoji.length > 32 || emoji.includes("|")
        || (target === "comment" && !commentId)) {
        sendJson(response, 400, { error: "The reaction details are invalid." });
        return true;
      }
      const result = await updateActivity(activity => {
        if (target === "comment") {
          const commentExists = post.comments?.some(comment => comment.id === commentId)
            || activity.comments.some(item => item.postId === postId && item.comment.id === commentId);
          if (!commentExists) throw statusError("The comment for this reaction could not be found.", 404);
        }
        const list = target === "post" ? activity.postReactions : activity.commentReactions;
        const entry = list.find(item => item.postId === postId
          && item.emoji === emoji
          && (target === "post" || item.commentId === commentId));
        if (entry) {
          entry.count += 1;
        } else {
          list.push(target === "post"
            ? { postId, emoji, count: 1 }
            : { postId, commentId, emoji, count: 1 });
        }
        return { count: entry ? entry.count : 1 };
      });
      sendJson(response, 200, result);
      return true;
    }

    sendJson(response, 400, { error: "Unsupported activity type." });
  } catch (error) {
    sendJson(response, error.statusCode || 500, {
      error: error.statusCode ? error.message : "The activity could not be saved."
    });
    if (!error.statusCode) console.error("Could not save activity:", error);
  }
  return true;
}

async function handleApi(request, response, pathname) {
  if (pathname === "/api/activity") return handleActivityApi(request, response);
  if (pathname !== "/api/posts") return false;

  if (request.method === "GET") {
    sendJson(response, 200, localPosts);
    return true;
  }
  if (request.method !== "POST") {
    response.writeHead(405, { Allow: "GET, POST" });
    response.end();
    return true;
  }

  if (!checkSameOrigin(request, response)) return true;
  if (!hasValidAdminPin(request)) {
    sendJson(response, 401, { error: "Admin access is required to save posts." });
    return true;
  }

  try {
    const post = validatePost(await readRequestBody(request));
    sendJson(response, 201, await savePost(post));
  } catch (error) {
    sendJson(response, error.statusCode || 500, {
      error: error.statusCode ? error.message : "The post could not be saved."
    });
    if (!error.statusCode) console.error("Could not save post:", error);
  }
  return true;
}

async function serveStatic(request, response, pathname) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    response.writeHead(400);
    response.end("Invalid URL path.");
    return;
  }
  const filePath = resolve(root, `.${decodedPath === "/" ? "/index.html" : decodedPath}`);
  if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
    response.writeHead(403);
    response.end("Forbidden.");
    return;
  }

  try {
    const fileInfo = await stat(filePath);
    if (!fileInfo.isFile()) {
      response.writeHead(404);
      response.end("Not found.");
      return;
    }
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Length": fileInfo.size,
      "Content-Type": mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream"
    });
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    const stream = createReadStream(filePath);
    stream.on("error", error => {
      console.error("Could not stream file:", error);
      response.destroy(error);
    });
    stream.pipe(response);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "EISDIR") {
      response.writeHead(404);
      response.end("Not found.");
      return;
    }
    throw error;
  }
}

const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (!await handleApi(request, response, pathname)) {
      await serveStatic(request, response, pathname);
    }
  } catch (error) {
    console.error("Request failed:", error);
    if (!response.headersSent) sendJson(response, 500, { error: "The request could not be completed." });
    else response.destroy();
  }
});

const port = Number(process.env.PORT || 8000);
server.listen(port, "0.0.0.0", () => {
  console.log(`Commentate is running at http://localhost:${port}`);
});
