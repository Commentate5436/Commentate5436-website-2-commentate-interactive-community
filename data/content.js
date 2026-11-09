// CONTENT SETTINGS — edit each post and its comments separately below.
// Put newest posts first. Use an image/video path inside assets/ or leave it blank.
export const posts = [
  {
    id: "p2",
    profileId: "viewer",
    text: `Welcome to Commentate.

A place to post your thoughts,
share media, and make some noise. ❤️‍🔥
Here's some things you need to know while you visit the website

You can't post or talk: This website is souly for memebers who using this website daily. If you somehow is able to make a post or a comment. it will delete the secound you refrsh

You can view the people who's Online: Simpley click on people right Under home feed.

`,
    date: "2026-11-08T14:00:00",
    image: "",
    video: "",
    likes: 32,
    reactions: { "❤️‍🔥": 12, "✨": 8 },
    // Settings for THIS post only  
    settings: { visibleComments: 2, commentsEnabled: true, reactionsEnabled: true },
    comments: [
      { id: "c11", profileId: "morning", text: "this looks so cool already ✨", image: "", likes: 5, reactions: { "🖤": 2 } }
    ]
  },
  {
    id: "p1",
    profileId: "morning",
    text: "Im done with music chat ✦",
    date: "2026-11-07T22:30:00",
    image: "memes/ight.gif",
    video: "",
    likes: 18009,
    reactions: { "🖤": 8000000000, "✨": 8890 },
    // Settings for THIS post only
    settings: { visibleComments: 4, commentsEnabled: true, reactionsEnabled: true },
    comments: [
    { id: "c21", profileId: "pezpez", text: "Call me an asshole if you will. but. aint noone told you to retire. ISTG, if you do Ima psoing up like this", image: "memes/AHHHHHHHH..gif", likes: 980, reactions: { "🌙": 2 } },
    { id: "c22", profileId: "morning", text: "I''m quitng, Just becuase of that absue", image: "", likes: 1345, reactions: { "🌙": 10000 } },
    { id: "c23", profileId: "pezpez", text: "Kuya say this shit wasn't you when you heard chunky at youre door step calling you daddy", image: "memes/Screenshot 2026-11-08 203439.png", likes: 1000000, reactions: { "😂": 9000 } },
    { id: "c24", profileId: "kuya", text: "LOLL", image: "", likes: 2000000, reactions: { "🌙": 0 } }
    ]
  }
];

export const settings = {
  initialVisiblePosts: 2,
  initialVisibleComments: 2,
  feedLimit: 10,

  adminPin: "723X",

  peopleRequiresAdmin: false,

  siteName: "Commentate",
  commentReactionChoices: ["❤️", "😂", "🔥", "✨", "🖤", "😭","🥹"]
};