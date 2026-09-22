module.exports = {
  config: {
    name: "adminmention",
    version: "1.3.2",
    author: "Atif Irfan Musa",
    countDown: 0,
    role: 0,
    shortDescription: "Replies when someone mentions MUSA BOSS",
    longDescription: "If anyone mentions MUSA BOSS, the bot replies with random messages.",
    category: "system"
  },

  onStart: async function () {},

  onChat: async function ({ event, message }) {

    // MUSA BOSS Admin IDs
    const adminIDs = [
      "100078049308655",
      "100090071683807",
      "100092480994957"
    ].map(String);

    // Admin নিজে mention করলে reply করবে না
    if (adminIDs.includes(String(event.senderID))) return;

    // Mention করা IDs
    const mentionedIDs = event.mentions
      ? Object.keys(event.mentions).map(String)
      : [];

    // MUSA BOSS-কে mention করা হয়েছে কিনা
    const isMentioningAdmin = adminIDs.some(
      id => mentionedIDs.includes(id)
    );

    if (!isMentioningAdmin) return;

    // MUSA BOSS random replies
    const REPLIES = [
      "😎 আরে ভাই, MUSA BOSS-কে এভাবে মেনশন দিস না!",
      "👑 MUSA BOSS এখন বিজি আছে, পরে আসো! 😌",
      "😂 বসকে ডাকতেছিস কেন? কোনো জরুরি কাজ নাকি?",
      "😏 MUSA BOSS-কে মেনশন করছিস—কী খবর বল!",
      "🔥 Boss MUSA এখানে VIP mood-এ আছে! 👑",
      "🥱 MUSA BOSS এখন ব্যস্ত, একটু অপেক্ষা কর!",
      "😎 মেনশন দেখছি! MUSA BOSS-কে কেন ডাকছিস?",
      "👑 সাবধানে মেনশন দে—এটা কিন্তু MUSA BOSS! 😈"
    ];

    const randomReply =
      REPLIES[Math.floor(Math.random() * REPLIES.length)];

    return message.reply(randomReply);
  }
};