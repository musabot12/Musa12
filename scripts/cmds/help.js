const fs = require("fs-extra");
const path = require("path");
const https = require("https");

module.exports = {
  config: {
    name: "help",
    aliases: ["menu", "commands"],
    version: "6.5",
    author: "Atif Irfan Musa",
    shortDescription: "Show all MUSA BOT commands",
    longDescription: "Show all commands in a clean and stylish MUSA BOT UI",
    category: "system",
    guide: "{pn}help [command name]"
  },

  onStart: async function ({ message, args, prefix }) {
    const allCommands = global.GoatBot.commands;

    const fancyFont = (str) =>
      String(str).replace(/[A-Za-z]/g, (c) => {
        const map = {
          A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",
          I:"𝐈",J:"𝐉",K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",
          Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",
          Y:"𝐘",Z:"𝐙",
          a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",f:"𝐟",g:"𝐠",h:"𝐡",
          i:"𝐢",j:"𝐣",k:"𝐤",l:"𝐥",m:"𝐦",n:"𝐧",o:"𝐨",p:"𝐩",
          q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",u:"𝐮",v:"𝐯",w:"𝐰",x:"𝐱",
          y:"𝐲",z:"𝐳"
        };

        return map[c] || c;
      });

    const categoryFont = (str) =>
      String(str)
        .split("")
        .map(c => {
          const map = {
            A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",
            I:"𝐈",J:"𝐉",K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",
            Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",
            Y:"𝐘",Z:"𝐙"
          };

          return map[c] || c;
        })
        .join("");

    const cleanCategoryName = (text) =>
      text ? String(text).toLowerCase() : "others";

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       SINGLE COMMAND INFORMATION
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    if (args[0]) {
      const cmdName = String(args[0]).toLowerCase();

      const cmd =
        allCommands.get(cmdName) ||
        [...allCommands.values()].find(c =>
          c.config.aliases?.some(alias =>
            String(alias).toLowerCase() === cmdName
          )
        );

      if (!cmd) {
        return message.reply(
`╭━━━『 ❌ 𝐌𝐔𝐒𝐀 𝐁𝐎𝐓 』━━━╮

❌ ${fancyFont(`Command '${cmdName}' not found!`)}

💡 Try:
➜ ${prefix}help

╰━━━━━━━━━━━━━━━━━━━━╯`
        );
      }

      const usage =
        typeof cmd.config.guide === "string"
          ? cmd.config.guide.replace("{pn}", cmd.config.name)
          : cmd.config.name;

      const infoMsg =
`╭━━━『 🧩 𝐌𝐔𝐒𝐀 𝐁𝐎𝐓 』━━━╮
┃
┃ 🧩 𝐍𝐚𝐦𝐞    : ${cmd.config.name}
┃ 🔗 𝐀𝐥𝐢𝐚𝐬𝐞𝐬 : ${cmd.config.aliases?.join(", ") || "None"}
┃ 📂 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐲: ${categoryFont(
        (cmd.config.category || "Others").toUpperCase()
      )}
┃ 🔢 𝐕𝐞𝐫𝐬𝐢𝐨𝐧 : v${cmd.config.version || "1.0"}
┃ 👑 𝐀𝐮𝐭𝐡𝐨𝐫  : ${cmd.config.author || "Unknown"}
┃
┣━━『 📖 𝐔𝐒𝐀𝐆𝐄 』━━
┃ ${prefix}${usage}
┃
┣━━『 📝 𝐃𝐄𝐒𝐂𝐑𝐈𝐏𝐓𝐈𝐎𝐍 』━━
┃ ${cmd.config.longDescription ||
      cmd.config.shortDescription ||
      "No description available"}
┃
╰━━━━━━━━━━━━━━━━━━━━╯
✨ 𝐌𝐔𝐒𝐀 𝐁𝐎𝐓 • 𝐀𝐭𝐢𝐟 𝐈𝐫𝐟𝐚𝐧 𝐌𝐮𝐬𝐚`;

      return message.reply(infoMsg);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       BUILD COMMAND CATEGORIES
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    const categories = {};

    for (const [name, cmd] of allCommands) {
      const cat = cleanCategoryName(cmd.config.category);

      if (!categories[cat]) {
        categories[cat] = [];
      }

      categories[cat].push(name);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       MAIN HELP MENU
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    let msg =
`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃   ✨ 𝐌𝐔𝐒𝐀 𝐁𝐎𝐓 𝐌𝐄𝐍𝐔 ✨
╰━━━━━━━━━━━━━━━━━━━━━━╯

👑 𝐎𝐰𝐧𝐞𝐫 : 𝐀𝐭𝐢𝐟 𝐈𝐫𝐟𝐚𝐧 𝐌𝐮𝐬𝐚
⚡ 𝐏𝐫𝐞𝐟𝐢𝐱 : ${prefix}
📦 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 : ${allCommands.size}
🌐 𝐒𝐭𝐚𝐭𝐮𝐬 : 𝐎𝐧𝐥𝐢𝐧𝐞
━━━━━━━━━━━━━━━━━━━━━━
`;

    for (const cat of Object.keys(categories).sort()) {
      const catTitle = categoryFont(cat.toUpperCase());

      msg += `\n╭──『 📂 ${catTitle} 』──╮\n`;

      for (const cmdName of categories[cat].sort()) {
        msg += `┃ ✦ ${fancyFont(cmdName)}\n`;
      }

      msg += `╰──────────────────╯\n`;
    }

    msg +=
`\n╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 💡 ${prefix}help <command>
┃ 🔍 View command details
╰━━━━━━━━━━━━━━━━━━━━━━╯

💫 𝐌𝐔𝐒𝐀 𝐁𝐎𝐓
👑 𝐀𝐭𝐢𝐟 𝐈𝐫𝐟𝐚𝐧 𝐌𝐮𝐬𝐚`;

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       RANDOM GIF
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    const gifURLs = [
      "https://i.imgur.com/Xw6JTfn.gif",
      "https://i.imgur.com/mW0yjZb.gif",
      "https://i.imgur.com/KQBcxOV.gif"
    ];

    const randomGifURL =
      gifURLs[Math.floor(Math.random() * gifURLs.length)];

    const gifFolder = path.join(__dirname, "cache");

    await fs.ensureDir(gifFolder);

    const gifName = path.basename(randomGifURL);
    const gifPath = path.join(gifFolder, gifName);

    try {
      if (!fs.existsSync(gifPath)) {
        await downloadGif(randomGifURL, gifPath);
      }

      return message.reply({
        body: msg,
        attachment: fs.createReadStream(gifPath)
      });

    } catch (error) {
      console.error("MUSA HELP GIF ERROR:", error);

      // GIF না এলে মেসেজটা তবুও পাঠাবে
      return message.reply(msg);
    }
  }
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   GIF DOWNLOADER
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function downloadGif(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    const request = https.get(url, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        return reject(
          new Error(`GIF download failed: HTTP ${res.statusCode}`)
        );
      }

      res.pipe(file);

      file.on("finish", () => {
        file.close(resolve);
      });

      file.on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    });

    request.setTimeout(15000, () => {
      request.destroy(new Error("GIF download timeout"));
    });

    request.on("error", (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}