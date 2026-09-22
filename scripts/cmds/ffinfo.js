const axios = require("axios");

module.exports = {
  config: {
    name: "ffinfo",
    aliases: ["freefireinfo", "ffstats"],
    version: "2.1.0",
    author: "Atif Irfan Musa",
    role: 0,
    premium: false,
    description: "Show complete Free Fire player info with MUSA styled output",
    category: "game",
    guide: {
      en: "{p}ffinfo <uid>"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const uid = args[0];

      if (!uid) {
        return api.sendMessage(
          "⚠️ 𝐌𝐔𝐒𝐀 𝐅𝐅 𝐈𝐍𝐅𝐎\n\n📌 Please provide a Free Fire UID\n\n💡 Example: ffinfo 3060644273",
          event.threadID,
          event.messageID
        );
      }

      const wait = await api.sendMessage(
        "⏳ 𝐌𝐔𝐒𝐀 𝐅𝐅 𝐈𝐍𝐅𝐎\n━━━━━━━━━━━━━━━━━━\n🔎 Fetching player information...\n⚡ Please wait...",
        event.threadID
      );

      const url = `https://ff.mlbbai.com/info/?uid=${encodeURIComponent(uid)}`;
      const res = await axios.get(url, {
        timeout: 15000,
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      const data = res.data;

      if (!data || !data.basicInfo) {
        return api.editMessage(
          "❌ 𝐌𝐔𝐒𝐀 𝐅𝐅 𝐈𝐍𝐅𝐎\n━━━━━━━━━━━━━━━━━━\n⚠️ Player data not found!\n\n🔎 UID may be invalid or API unavailable.",
          wait.messageID
        );
      }

      const b = data.basicInfo || {};
      const clan = data.clanBasicInfo || {};
      const pet = data.petInfo || {};
      const social = data.socialInfo || {};
      const credit = data.creditScoreInfo || {};
      const cap = data.captainBasicInfo || {};

      const cleanText = (text) => {
        if (!text) return "None";
        return String(text)
          .replace(/\[B\]|\[C\]|\[ff[0-9a-fA-F]+\]/g, "")
          .trim() || "None";
      };

      const formatDate = (timestamp) => {
        if (!timestamp || isNaN(timestamp)) return "N/A";
        const date = new Date(Number(timestamp) * 1000);
        if (isNaN(date.getTime())) return "N/A";
        return date.toLocaleDateString("en-GB");
      };

      const gender = social.gender
        ? String(social.gender).replace("Gender_", "")
        : "N/A";

      const language = social.language
        ? String(social.language).replace("Language_", "")
        : "N/A";

      const rewardState = credit.rewardState
        ? String(credit.rewardState).replace("REWARD_STATE_", "")
        : "N/A";

      const msg = `
╭━━━『 🔥 𝐌𝐔𝐒𝐀 𝐅𝐅 𝐈𝐍𝐅𝐎 🔥 』━━━╮
┃
┃ 👤 𝐍𝐚𝐦𝐞: ${b.nickname || "N/A"}
┃ 🆔 𝐔𝐈𝐃: ${b.accountId || uid}
┃ 🌍 𝐑𝐞𝐠𝐢𝐨𝐧: ${b.region || "N/A"}
┃ ⭐ 𝐋𝐞𝐯𝐞𝐥: ${b.level || "N/A"}
┃ ❤️ 𝐋𝐢𝐤𝐞𝐬: ${b.liked || 0}
┃ 📈 𝐄𝐱𝐩: ${b.exp || 0}
┃
┣━━『 🏆 𝐑𝐀𝐍𝐊 』━━
┃ 🏆 𝐑𝐚𝐧𝐤: ${b.rank || "N/A"}
┃ 🎯 𝐑𝐚𝐧𝐤 𝐏𝐨𝐢𝐧𝐭𝐬: ${b.rankingPoints || 0}
┃ ⚔️ 𝐂𝐒 𝐑𝐚𝐧𝐤: ${b.csRank || "N/A"}
┃ 🎮 𝐂𝐒 𝐏𝐨𝐢𝐧𝐭𝐬: ${b.csRankingPoints || 0}
┃ 👑 𝐌𝐚𝐱 𝐑𝐚𝐧𝐤: ${b.maxRank || "N/A"}
┃ 👑 𝐌𝐚𝐱 𝐂𝐒 𝐑𝐚𝐧𝐤: ${b.csMaxRank || "N/A"}
┃ 🎟️ 𝐄𝐥𝐢𝐭𝐞 𝐏𝐚𝐬𝐬: ${b.hasElitePass ? "✅ Yes" : "❌ No"}
┃ 🏅 𝐁𝐚𝐝𝐠𝐞𝐬: ${b.badgeCnt || 0}
┃
┣━━『 📅 𝐀𝐂𝐂𝐎𝐔𝐍𝐓 』━━
┃ 📅 𝐒𝐞𝐚𝐬𝐨𝐧: ${b.seasonId || "N/A"}
┃ 🛠️ 𝐑𝐞𝐥𝐞𝐚𝐬𝐞: ${b.releaseVersion || "N/A"}
┃ 👁️ 𝐁𝐑 𝐑𝐚𝐧𝐤: ${b.showBrRank ? "Yes" : "No"}
┃ 👁️ 𝐂𝐒 𝐑𝐚𝐧𝐤: ${b.showCsRank ? "Yes" : "No"}
┃ ⏳ 𝐂𝐫𝐞𝐚𝐭𝐞𝐝: ${formatDate(b.createAt)}
┃
┣━━『 🛡️ 𝐆𝐔𝐈𝐋𝐃 』━━
┃ 🏷️ 𝐍𝐚𝐦𝐞: ${clan.clanName || "None"}
┃ 🆔 𝐈𝐃: ${clan.clanId || "N/A"}
┃ 📊 𝐋𝐞𝐯𝐞𝐥: ${clan.clanLevel || "N/A"}
┃ 👥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${clan.memberNum || 0}/${clan.capacity || 0}
┃ 👑 𝐋𝐞𝐚𝐝𝐞𝐫: ${cap.nickname || "N/A"}
┃
┣━━『 🐾 𝐏𝐄𝐓 』━━
┃ 🐶 𝐍𝐚𝐦𝐞: ${pet.name || "None"}
┃ 📈 𝐋𝐞𝐯𝐞𝐥: ${pet.level || "N/A"}
┃ ⭐ 𝐄𝐱𝐩: ${pet.exp || 0}
┃ 🎨 𝐒𝐤𝐢𝐧 𝐈𝐃: ${pet.skinId || "N/A"}
┃
┣━━『 🌐 𝐒𝐎𝐂𝐈𝐀𝐋 』━━
┃ 🚻 𝐆𝐞𝐧𝐝𝐞𝐫: ${gender}
┃ 🗣️ 𝐋𝐚𝐧𝐠𝐮𝐚𝐠𝐞: ${language}
┃ ✍️ 𝐒𝐢𝐠𝐧𝐚𝐭𝐮𝐫𝐞:
┃ ${cleanText(social.signature)}
┃
┣━━『 🛡️ 𝐂𝐑𝐄𝐃𝐈𝐓 』━━
┃ 💯 𝐒𝐜𝐨𝐫𝐞: ${credit.creditScore || "N/A"}
┃ 🎁 𝐑𝐞𝐰𝐚𝐫𝐝: ${rewardState}
┃ 📆 𝐏𝐞𝐫𝐢𝐨𝐝 𝐄𝐧𝐝: ${
        credit.periodicSummaryEndTime
          ? formatDate(credit.periodicSummaryEndTime)
          : "N/A"
      }
┃
╰━━━『 👑 𝐌𝐔𝐒𝐀 𝐁𝐎𝐓 👑 』━━━╯

⚡ 𝐂𝐫𝐞𝐝𝐢𝐭: 𝐀𝐭𝐢𝐟 𝐈𝐫𝐟𝐚𝐧 𝐌𝐮𝐬𝐚
💫 𝐌𝐔𝐒𝐀 𝐁𝐎𝐓 • 𝐅𝐫𝐞𝐞 𝐅𝐢𝐫𝐞 𝐈𝐧𝐟𝐨
`;

      await api.editMessage(msg, wait.messageID);

    } catch (err) {
      console.error("MUSA FFINFO ERROR:", err);

      const errorMessage =
        err.code === "ECONNABORTED"
          ? "⏰ API request timed out."
          : err.response
          ? `❌ API Error: ${err.response.status}`
          : `❌ Error: ${err.message}`;

      api.sendMessage(
        `🔥 𝐌𝐔𝐒𝐀 𝐅𝐅 𝐈𝐍𝐅𝐎\n━━━━━━━━━━━━━━━━━━\n${errorMessage}\n\n⚠️ Please try again later.`,
        event.threadID,
        event.messageID
      );
    }
  }
};