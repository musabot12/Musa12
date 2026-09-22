module.exports = {
  config: {
    name: "out",
    version: "2.1",
    author: "Atif Irfan Musa",
    countDown: 5,
    role: 2,

    shortDescription: "Remove MUSA BOT from group",
    longDescription:
      "Remove MUSA BOT from the current or specified group thread.",

    category: "owner",

    guide: {
      en: "{pn} [threadID (optional)]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const botID = api.getCurrentUserID();
    const targetThread = args[0] || event.threadID;

    try {
      await api.sendMessage(
`╭━━━『 👋 𝐌𝐔𝐒𝐀 𝐁𝐎𝐓 』━━━╮
┃
┃ 👋 Goodbye everyone!
┃
┃ 🤖 MUSA BOT is leaving
┃ this group now...
┃
┃ 👑 Credit: Atif Irfan Musa
╰━━━━━━━━━━━━━━━━━━━━╯`,
        targetThread
      );

      await api.removeUserFromGroup(
        botID,
        targetThread
      );

    } catch (error) {
      console.error("MUSA OUT ERROR:", error);

      return api.sendMessage(
`╭━━━『 ❌ 𝐌𝐔𝐒𝐀 𝐁𝐎𝐓 』━━━╮
┃
┃ ⚠️ Could not leave the group.
┃
┃ Possible reasons:
┃ • Bot is not an admin
┃ • Invalid thread ID
┃ • Permission denied
┃ • Messenger API error
┃
╰━━━━━━━━━━━━━━━━━━━━╯`,
        event.threadID,
        event.messageID
      );
    }
  }
};