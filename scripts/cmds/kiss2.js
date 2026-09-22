const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const response = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json",
    { timeout: 15000 }
  );

  if (!response.data || !response.data.mahmud) {
    throw new Error("Base API URL not found");
  }

  return response.data.mahmud;
};

module.exports = {
  config: {
    name: "kiss2",
    aliases: ["k2"],
    version: "1.8",
    author: "Atif Irfan Musa",
    role: 0,
    category: "fun",
    cooldown: 8,
    guide: "kiss2 [mention/reply/UID]"
  },

  onStart: async function ({ api, event, args }) {
    const {
      threadID,
      messageID,
      messageReply,
      mentions,
      senderID
    } = event;

    let id2;

    // Reply করলে reply করা ব্যক্তিকে target করবে
    if (messageReply && messageReply.senderID) {
      id2 = messageReply.senderID;
    }

    // Mention করলে প্রথম mention-কে target করবে
    else if (mentions && Object.keys(mentions).length > 0) {
      id2 = Object.keys(mentions)[0];
    }

    // UID দিলে সেই UID target করবে
    else if (args[0]) {
      id2 = args[0];
    }

    else {
      return api.sendMessage(
        `╭━━━『 💋 𝐌𝐔𝐒𝐀 𝐁𝐎𝐓 』━━━╮
┃
┃ ⚠️ Please mention, reply, or
┃ provide a UID.
┃
┃ 💡 Example:
┃ ${event.prefix || ""}kiss2 @user
┃
╰━━━━━━━━━━━━━━━━━━━━╯`,
        threadID,
        messageID
      );
    }

    if (!senderID || !id2) {
      return api.sendMessage(
        "❌ Unable to detect user ID.",
        threadID,
        messageID
      );
    }

    let filePath;

    try {
      const baseUrl = await baseApiUrl();

      const url =
        `${baseUrl}/api/dig?type=kiss` +
        `&user=${encodeURIComponent(senderID)}` +
        `&user2=${encodeURIComponent(id2)}`;

      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 30000,
        headers: {
          "User-Agent": "MUSA-BOT/1.0"
        }
      });

      if (!response.data || response.data.length === 0) {
        throw new Error("Empty image response");
      }

      filePath = path.join(
        __dirname,
        `musa_kiss_${Date.now()}_${id2}.png`
      );

      fs.writeFileSync(filePath, response.data);

      return api.sendMessage(
        {
          attachment: fs.createReadStream(filePath),
          body:
`╭━━━『 💋 𝐌𝐔𝐒𝐀 𝐁𝐎𝐓 』━━━╮
┃
┃ 💋 𝐊𝐢𝐬𝐬 𝐄𝐟𝐟𝐞𝐜𝐭 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥!
┃
┃ 👤 From: ${senderID}
┃ 🎯 Target: ${id2}
┃
╰━━━━━━━━━━━━━━━━━━━━╯
✨ Credit: Atif Irfan Musa`
        },
        threadID,
        () => {
          try {
            if (filePath && fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (e) {
            console.error("MUSA KISS CLEANUP:", e.message);
          }
        },
        messageID
      );

    } catch (err) {
      console.error("MUSA KISS ERROR:", err);

      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {}
      }

      return api.sendMessage(
`╭━━━『 ❌ 𝐌𝐔𝐒𝐀 𝐁𝐎𝐓 』━━━╮
┃
┃ ⚠️ Kiss effect failed.
┃
┃ Possible reasons:
┃ • API is unavailable
┃ • Invalid target UID
┃ • Image generation failed
┃ • Network timeout
┃
┃ 🔄 Please try again later.
┃
╰━━━━━━━━━━━━━━━━━━━━╯`,
        threadID,
        messageID
      );
    }
  }
};