
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const https = require("https");

function decode(b64) {
  return Buffer.from(b64, "base64").toString("utf-8");
}

async function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);

    const request = https.get(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      },
      (res) => {
        if (res.statusCode !== 200) {
          file.close();
          fs.unlink(filePath, () => {});
          return reject(
            new Error(`Image fetch failed: HTTP ${res.statusCode}`)
          );
        }

        res.pipe(file);

        file.on("finish", () => {
          file.close(resolve);
        });

        file.on("error", (err) => {
          fs.unlink(filePath, () => {});
          reject(err);
        });
      }
    );

    request.setTimeout(20000, () => {
      request.destroy(new Error("Image download timeout"));
    });

    request.on("error", (err) => {
      file.close();
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

const encodedUrl =
  "aHR0cHM6Ly9yYXNpbi1hcGlzLm9ucmVuZGVyLmNvbQ==";

const encodedKey =
  "cnNfaGVpNTJjbTgtbzRvai11Y2ZjLTR2N2MtZzE=";

module.exports = {
  config: {
    name: "needgf",
    aliases: ["randomprofile", "single"],
    version: "4.0.0",
    author: "Atif Irfan Musa",
    countDown: 10,
    role: 0,

    shortDescription: "Show a random profile",
    longDescription:
      "Fun random profile generator for MUSA BOT",

    category: "fun",

    guide: "{pn}"
  },

  onStart: async function ({ message, event }) {
    let imgPath = null;

    try {
      // Create temporary directory
      const tmpDir = path.join(__dirname, "tmp");
      await fs.ensureDir(tmpDir);

      // Loading message
      const loading = await message.reply(
`╭━━━『 ✨ 𝐌𝐔𝐒𝐀 𝐁𝐎𝐓 ✨ 』━━━╮
┃
┃ 🔎 Finding random profile...
┃ ⏳ Please wait...
┃
╰━━━━━━━━━━━━━━━━━━━━╯`
      );

      const apiUrl = decode(encodedUrl);
      const apiKey = decode(encodedKey);

      const fullUrl =
        `${apiUrl}/api/rasin/gf?apikey=${encodeURIComponent(apiKey)}`;

      const res = await axios.get(fullUrl, {
        timeout: 15000,
        headers: {
          "User-Agent": "MUSA-BOT/1.0"
        }
      });

      const imgUrl = res.data?.data?.url;

      if (!imgUrl) {
        throw new Error("Image URL not found in API response");
      }

      // Unique filename
      const fileName =
        `musa_profile_${event.senderID}_${Date.now()}.jpg`;

      imgPath = path.join(tmpDir, fileName);

      await downloadImage(imgUrl, imgPath);

      if (!(await fs.pathExists(imgPath))) {
        throw new Error("Image was not downloaded");
      }

      // Remove loading message if supported
      if (loading?.messageID && message.unsend) {
        try {
          await message.unsend(loading.messageID);
        } catch (e) {}
      }

      const replyMsg =
`╭━━━『 🌸 𝐌𝐔𝐒𝐀 𝐁𝐎𝐓 🌸 』━━━╮
┃
┃ ✨ 𝐑𝐚𝐧𝐝𝐨𝐦 𝐏𝐫𝐨𝐟𝐢𝐥𝐞
┃
┃ 🎲 নতুন একটি random profile
┃ 🖼️ Profile generated successfully
┃
╰━━━━━━━━━━━━━━━━━━━━╯

💫 𝐄𝐧𝐣𝐨𝐲 𝐭𝐡𝐞 𝐟𝐮𝐧!
👑 𝐂𝐫𝐞𝐝𝐢𝐭: 𝐀𝐭𝐢𝐟 𝐈𝐫𝐟𝐚𝐧 𝐌𝐮𝐬𝐚`;

      await message.reply({
        body: replyMsg,
        attachment: fs.createReadStream(imgPath)
      });

    } catch (err) {
      console.error("MUSA NEEDGF ERROR:", err);

      await message.reply(
`╭━━━『 ❌ 𝐌𝐔𝐒𝐀 𝐁𝐎𝐓 』━━━╮
┃
┃ ⚠️ Profile পাওয়া যায়নি!
┃
┃ 🔄 কিছুক্ষণ পরে আবার চেষ্টা করো।
┃
┃ Possible reason:
┃ • API unavailable
┃ • Image server unavailable
┃ • Network timeout
┃ • Invalid API response
┃
╰━━━━━━━━━━━━━━━━━━━━╯`
      );

    } finally {
      // Always clean temporary image
      if (imgPath) {
        try {
          if (await fs.pathExists(imgPath)) {
            await fs.remove(imgPath);
          }
        } catch (cleanupError) {
          console.error(
            "MUSA CLEANUP ERROR:",
            cleanupError.message
          );
        }
      }
    }
  }
};