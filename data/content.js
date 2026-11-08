// CONTENT SETTINGS — edit each post and its comments separately below.
// Put newest posts first. Use an image/video path inside assets/ or leave it blank.
export const posts = [
  {
    id: "p2",
    profileId: "guest",
    text: "late night thoughts hit different when the whole city is asleep. ✦",
    date: "2026-11-08T02:14:00",
    image: "",
    video: "",
    likes: 18,
    reactions: { "🖤": 7, "✨": 4 },
    // Settings for THIS post only
    settings: { visibleComments: 2, commentsEnabled: true, reactionsEnabled: true },
    comments: [
      { id: "c21", profileId: "owner", text: "the quiet hours always have the best ideas.", image: "", likes: 3, reactions: { "🌙": 2 } },
      { id: "c22", profileId: "guest", text: "exactly that.", image: "", likes: 1, reactions: {} }
    ]
  },
  {
    id: "p1",
    profileId: "owner",
    text: "Welcome to Commentate. A place to post your thoughts, share media, and make some noise. ❤️‍🔥",
    date: "2026-11-07T22:30:00",
    image: "",
    video: "",
    likes: 32,
    reactions: { "❤️‍🔥": 12, "✨": 8 },
    // Settings for THIS post only
    settings: { visibleComments: 2, commentsEnabled: true, reactionsEnabled: true },
    comments: [
      { id: "c11", profileId: "guest", text: "this looks so cool already ✨", image: "", likes: 5, reactions: { "🖤": 2 } },
      { id: "c12", profileId: "owner", text: "we're just getting started.", image: "", likes: 2, reactions: {} }
    ]
  }
];

// GENERAL FEED SETTINGS — individual post settings above override these defaults.
export const settings = {
  initialVisiblePosts: 2,
  initialVisibleComments: 2,
  feedLimit: 10,
  adminPin: "723X",
  siteName: "Commentate",
  commentReactionChoices: ["❤️", "😂", "🔥", "✨", "🖤", "😭"]
};
