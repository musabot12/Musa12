const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function getBaseApiUrl() {
  try {
    const response = await axios.get(
      "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json",
      {
        timeout: 15000,
        headers: {
          "User-Agent": "MUSA-BOT"
        }
      }
    );

    const baseUrl = response.data?.mahmud;

    if (!baseUrl) {
      throw new Error("Base API URL পাওয়া যায়নি");
    }

    return String(baseUrl).replace(/\/+$/, "");
  } catch (error) {
    throw new Error("Base API load failed: " + error.message);
  }
}

module.exports = {
  config: {
    name: "toilet",
    version: "2.0",
    author: "Atif Irfan Musa",
    role: 0,
    category: "fun",
    cooldown: 10,

    shortDescription: "MUSA Toilet Fun",
    longDescription: "Mention, reply অথবা UID দিয়ে fun toilet image তৈরি করুন।",

    guide: {
      en: "{pn} @mention\n{pn} reply\n{pn} UID"
    }
  },

  onStart: async function ({ api, event, args }) {
    const {
      threadID,
      messageID,
      mentions = {},
      messageReply
    } = event;

    let userID = null;

    // 1️⃣ Mention
    const mentionIDs = Object.keys(mentions);

    if (mentionIDs.length > 0) {
      userID = mentionIDs[0];
    }

    // 2️⃣ Reply
    else if (messageReply?.senderID) {
      userID = messageReply.senderID;
    }

    // 3️⃣ UID
    else if (args[0]) {
      userID = args[0].trim();
    }

    // Nothing provided
    else {
      return api.sendMessage(
        "╭━━━〔 🧻 MUSA TOILET 〕━━━╮\n" +
        "┃ ❌ কাউকে Mention/Reply/UID দাও।\n" +
        "┃\n" +
        "┃ উদাহরণ:\n" +
        "┃ • toilet @user\n" +
        "┃ • কোনো মেসেজে Reply করে toilet\n" +
        "┃ • toilet 1000XXXXXXXX\n" +
        "╰━━━━━━━━━━━━━━━━━━━━╯",
        threadID,
        messageID
      );
    }

    let filePath = null;

    try {
      await api.setMessageReaction(
        "⏳",
        messageID,
        () => {},
        true
      );

      const baseUrl = await getBaseApiUrl();

      const apiUrl =
        `${baseUrl}/api/toilet?user=${encodeURIComponent(userID)}`;

      const response = await axios.get(apiUrl, {
        responseType: "arraybuffer",
        timeout: 30000,
        maxContentLength: 15 * 1024 * 1024,
        headers: {
          "User-Agent": "Mozilla/5.0 MUSA-BOT"
        }
      });

      const contentType =
        response.headers["content-type"] || "";

      // API image না দিলে error
      if (
        !contentType.includes("image") &&
        !Buffer.isBuffer(response.data)
      ) {
        throw new Error("API থেকে valid image পাওয়া যায়নি");
      }

      // Unique temporary filename
      const fileName =
        `musa_toilet_${userID}_${Date.now()}.png`;

      filePath = path.join(__dirname, fileName);

      fs.writeFileSync(filePath, Buffer.from(response.data));

      await api.setMessageReaction(
        "🤮",
        messageID,
        () => {},
        true
      );

      return api.sendMessage(
        {
          body:
            "╭━━━〔 🧻 MUSA TOILET 〕━━━╮\n" +
            "┃ 🤮 এই নাও Toilet Edit!\n" +
            "┃ 👤 Target: " + userID + "\n" +
            "┃ ⚡ Powered by MUSA BOT\n" +
            "╰━━━━━━━━━━━━━━━━━━━━╯",

          attachment: fs.createReadStream(filePath)
        },

        threadID,

        () => {
          // Message পাঠানোর পরে temp file delete
          try {
            if (filePath && fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (cleanupError) {
            console.error(
              "MUSA TOILET CLEANUP ERROR:",
              cleanupError.message
            );
          }
        },

        messageID
      );

    } catch (error) {
      console.error(
        "MUSA TOILET ERROR:",
        error.response?.status || "",
        error.message
      );

      await api.setMessageReaction(
        "❌",
        messageID,
        () => {},
        true
      );

      // Error হলেও temp file delete
      try {
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (_) {}

      return api.sendMessage(
        "╭━━━〔 ❌ MUSA TOILET ERROR 〕━━━╮\n" +
        "┃ ⚠️ Image তৈরি করা যায়নি।\n" +
        "┃\n" +
        "┃ সম্ভবত API এখন কাজ করছে না\n" +
        "┃ অথবা API response পরিবর্তন হয়েছে।\n" +
        "┃\n" +
        "┃ আবার কিছুক্ষণ পরে চেষ্টা করুন।\n" +
        "╰━━━━━━━━━━━━━━━━━━━━━━━━╯",
        threadID,
        messageID
      );
    }
  }
};