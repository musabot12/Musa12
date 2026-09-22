module.exports = {
  config: {
    name: "uid",
    version: "2.0.0",
    author: "Atif Irfan Musa",
    description: "Get and share Facebook UID",
    category: "utility",
    cooldowns: 5,

    shortDescription: "MUSA UID",
    longDescription: "Reply, mention অথবা নিজের UID দিয়ে contact share করুন.",

    guide: {
      en: "{pn} — নিজের UID\nReply করে {pn} — replied user's UID\nMention করে {pn} — mentioned user's UID"
    }
  },

  onStart: async function ({ api, event }) {
    let uid;

    try {
      // 🎯 Reply করা message
      if (
        event.type === "message_reply" &&
        event.messageReply?.senderID
      ) {
        uid = event.messageReply.senderID;
      }

      // 🎯 Mention করা user
      else if (
        event.mentions &&
        Object.keys(event.mentions).length > 0
      ) {
        uid = Object.keys(event.mentions)[0];
      }

      // 🎯 নিজের UID
      else {
        uid = event.senderID;
      }

      if (!uid) {
        return api.sendMessage(
          "╭━━━〔 ⚡ MUSA UID 〕━━━╮\n" +
          "┃ ❌ UID পাওয়া যায়নি!\n" +
          "┃\n" +
          "┃ আবার চেষ্টা করুন।\n" +
          "╰━━━━━━━━━━━━━━━━━━╯",
          event.threadID,
          event.messageID
        );
      }

      // ⏳ Loading reaction
      api.setMessageReaction(
        "⏳",
        event.messageID,
        () => {},
        true
      );

      // 📇 Share contact
      await api.shareContact(
        uid,
        uid,
        event.threadID,
        event.messageID
      );

      // ✅ Success reaction
      api.setMessageReaction(
        "✅",
        event.messageID,
        () => {},
        true
      );

      // ✨ Stylish info message
      return api.sendMessage(
        "╭━━━〔 👤 MUSA UID 〕━━━╮\n" +
        "┃\n" +
        "┃ ✦ UID: " + uid + "\n" +
        "┃ ✦ Status: Contact Shared ✅\n" +
        "┃\n" +
        "┃ ⚡ MUSA BOT\n" +
        "┃ 👑 Atif Irfan Musa\n" +
        "╰━━━━━━━━━━━━━━━━━━╯",
        event.threadID
      );

    } catch (error) {
      console.error("MUSA UID ERROR:", error);

      api.setMessageReaction(
        "❌",
        event.messageID,
        () => {},
        true
      );

      return api.sendMessage(
        "╭━━━〔 ❌ MUSA UID ERROR 〕━━━╮\n" +
        "┃ UID/Contact share করা যায়নি।\n" +
        "┃\n" +
        "┃ Error: " + (error.message || "Unknown error") + "\n" +
        "┃\n" +
        "┃ ⚡ MUSA BOT\n" +
        "╰━━━━━━━━━━━━━━━━━━━━╯",
        event.threadID,
        event.messageID
      );
    }
  }
};