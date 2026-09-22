const fs = require("fs-extra");
const request = require("request");
const path = require("path");

module.exports = {
  config: {
    name: "owner",
    version: "1.3.0",
    author: "Atif Irfan Musa",
    role: 0,
    shortDescription: "MUSA Owner Information",
    longDescription: "Shows MUSA BOT owner information with profile image.",
    category: "Information",
    guide: {
      en: "owner"
    }
  },

  onStart: async function ({ api, event }) {
    const ownerText =
`╭─ 👑 𝗠𝗨𝗦𝗔 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 👑 ─╮
│
│ 👤 𝗡𝗮𝗺𝗲       : 𝗔𝘁𝗶𝗳 𝗜𝗿𝗳𝗮𝗻 𝗠𝘂𝘀𝗮
│ 🧸 𝗡𝗶𝗰𝗸       : 𝗠𝘂𝘀𝗮
│ 🎂 𝗖𝗹𝗮𝘀𝘀      : 𝟭𝟬
│ 💘 𝗥𝗲𝗹𝗮𝘁𝗶𝗼𝗻   : 𝗦𝗶𝗻𝗴𝗹𝗲 𝗟𝗶𝗳𝗲
│ 🎓 𝗣𝗿𝗼𝗳𝗲𝘀𝘀𝗶𝗼𝗻 : 𝗦𝘁𝘂𝗱𝗲𝗻𝘁
│ 📚 𝗗𝗲𝗽𝗮𝗿𝘁𝗺𝗲𝗻𝘁 : 𝗦𝗰𝗶𝗲𝗻𝗰𝗲
│ 🏡 𝗟𝗼𝗰𝗮𝘁𝗶𝗼𝗻   : 𝗕𝗼𝗴𝘂𝗿𝗮, 𝗕𝗮𝗻𝗴𝗹𝗮𝗱𝗲𝘀𝗵
│
├─ 🔗 𝗖𝗢𝗡𝗧𝗔𝗖𝗧 ─────────╮
│ 📘 Facebook  : 𝗔𝘁𝗶𝗳 𝗜𝗿𝗳𝗮𝗻 𝗠𝘂𝘀𝗮
│ 📞 WhatsApp  : 𝟬𝟭𝟯𝟯𝟰𝟱𝟬𝟭𝟵𝟳𝟳
│
├─ 🤖 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢 ─────────╮
│ ✨ Bot Name  : 𝗠𝗨𝗦𝗔 𝗕𝗢𝗧
│ 👑 Owner     : 𝗔𝘁𝗶𝗳 𝗜𝗿𝗳𝗮𝗻 𝗠𝘂𝘀𝗮
│ 💎 Credit    : 𝗠𝗨𝗦𝗔
│ 🚀 Status    : 𝗢𝗡𝗟𝗜𝗡𝗘
│
╰────────────────────────╯

        💜 𝗖𝗥𝗘𝗗𝗜𝗧 𝗕𝗬 𝗠𝗨𝗦𝗔 💜`;

    const cacheDir = path.join(__dirname, "cache");
    const imgPath = path.join(cacheDir, "musa-owner.jpg");

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // নিজের পছন্দের owner image URL এখানে বসাতে পারো
    const imgLink = "https://i.imgur.com/1G4ZhU7.jpeg";

    const send = () => {
      api.sendMessage(
        {
          body: ownerText,
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => {
          try {
            if (fs.existsSync(imgPath)) {
              fs.unlinkSync(imgPath);
            }
          } catch (err) {}
        },
        event.messageID
      );
    };

    request(encodeURI(imgLink))
      .pipe(fs.createWriteStream(imgPath))
      .on("close", send);
  }
};