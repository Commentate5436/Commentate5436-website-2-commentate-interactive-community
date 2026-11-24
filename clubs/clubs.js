const clubAssets = (file) => `clubs%20png/${file.split("/").map(encodeURIComponent).join("/")}`;

export default [
  {
    id: "harnsoi-kinzo",
    name: "Harnsoi Kinzo",
    background: clubAssets("Harnsoi_Kinzo  backgrouund.gif"),
    avatar: clubAssets("Harnsoi_Kinzo pfp.gif"),
    verified: true,
    members: 12451,
    following: 0,
    likes: 6,
    reactions: [{label: "Coin", image: "reaction-image-47", count: 5674, id: "03-30-33-674_512"}]
  },
  {
    id: "hons-family",
    name: "The Hon's family.",
    background: clubAssets("The Hon's family. background.gif"),
    avatar: clubAssets("The Hon's family. pfp.webp"),
    verified: true,
    members: 920456,
    following: 568,
    likes: 8000000,
    reactions: []
  },
  {
    id: "the-honor-one",
    name: "TheHonorOne",
    background: clubAssets("TheHonorOne Background.gif"),
    avatar: clubAssets("TheHonorOne Pfp.gif"),
    verified: true,
    members: 889543,
    following: 907,
    likes: 4679097,
    reactions: []
  },
  {
    id: "v-per",
    name: "V-PER",
    background: clubAssets("V-PER background.gif"),
    avatar: clubAssets("V-PER pfp.gif"),
    verified: true,
    members: 1000000,
    following: 0,
    likes: 0,
    reactions: []
  },
  {
    id: "hazelshoneyroom",
    name: "ℌ𝔞𝔷𝔢𝔩𝔰ℌ𝔬𝔫𝔢𝔶𝔯𝔬𝔬𝔪_777",
    background: clubAssets("ℌ𝔞𝔷𝔢𝔩𝔰ℌ𝔬𝔫𝔢𝔶𝔯𝔬𝔬𝔪_777 Background.webp"),
    avatar: clubAssets("ℌ𝔞𝔷𝔢𝔩𝔰ℌ𝔬𝔫𝔢𝔶𝔯𝔬𝔬𝔪_777 Pfp.gif"),
    verified: true,
    members: 162300000,
    following: 5,
    likes: 1000000000,
    reactions: [{label: "Yes Mommy", image: "reaction-image-45", count:50000000, id: "yesmommey"}]
  },
  {
    id: "knot-and-honey",
    name: "𝙺𝚗𝚘𝚝 & 𝙷𝚘𝚗𝚎𝚢",
    background: clubAssets("𝙺𝚗𝚘𝚝 & 𝙷𝚘𝚗𝚎𝚢 Background.gif"),
    avatar: clubAssets("𝙺𝚗𝚘𝚝 & 𝙷𝚘𝚗𝚎𝚢 Pfp.jpg"),
    verified: true,
    members: 100567,
    following: 8986,
    likes: 10000000,
    reactions: [{label: "fuggie", image: "reaction-image-32", count:50000000000000, id: "fuggie"}]
  }
];
