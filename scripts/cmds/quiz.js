const axios = require("axios");

module.exports.config = {
  name: "quiz",
  version: "2.1",
  author: "Atif Irfan Musa",
  role: 0,
  category: "economy",
  countDown: 10,
  shortDescription: "Play quiz and earn money",
  longDescription: "Answer random quiz questions and earn MUSA BOT coins.",
  guide: "{prefix}quiz"
};

const usedQuestions = new Map();

function decodeHTML(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&rsquo;/g, "\u2019");
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function fetchQuestion(senderID) {
  const used = usedQuestions.get(senderID) || new Set();

  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await axios.get(
      "https://opentdb.com/api.php?amount=5&type=multiple",
      { timeout: 15000 }
    );

    const results = res.data?.results;

    if (!Array.isArray(results) || !results.length)
      continue;

    for (const item of results) {
      const question = decodeHTML(item.question);

      if (used.has(question))
        continue;

      const correct = decodeHTML(item.correct_answer);
      const wrong = item.incorrect_answers.map(decodeHTML);

      const allOptions = shuffle([
        correct,
        ...wrong
      ]);

      const labels = ["A", "B", "C", "D"];
      const answerLabel =
        labels[allOptions.indexOf(correct)];

      const options = allOptions.map(
        (opt, i) => `${labels[i]}. ${opt}`
      );

      used.add(question);

      if (used.size > 200) {
        const first = used.values().next().value;
        used.delete(first);
      }

      usedQuestions.set(senderID, used);

      return {
        question,
        options,
        answer: answerLabel
      };
    }
  }

  return null;
}

module.exports.onStart = async function ({
  api,
  event
}) {
  const {
    senderID,
    threadID,
    messageID
  } = event;

  let quizData;

  try {
    quizData = await fetchQuestion(senderID);
  } catch (error) {
    console.error("MUSA QUIZ ERROR:", error);

    return api.sendMessage(
      `╭━━━〔 ❌ MUSA QUIZ 〕━━━╮
┃
┃ ⚠️ Quiz question load করা যায়নি।
┃
┃ 🔄 কিছুক্ষণ পরে আবার চেষ্টা করুন।
┃
╰━━━━━━━━━━━━━━━━━━━━╯`,
      threadID,
      messageID
    );
  }

  if (!quizData) {
    return api.sendMessage(
      `╭━━━〔 ⚠️ MUSA QUIZ 〕━━━╮
┃
┃ নতুন প্রশ্ন পাওয়া যায়নি।
┃
┃ 🔄 আবার চেষ্টা করুন।
┃
╰━━━━━━━━━━━━━━━━━━━━╯`,
      threadID,
      messageID
    );
  }

  const msg =
`╭━━━〔 🧠 MUSA QUIZ 〕━━━╮
┃
┃ ❓ ${quizData.question}
┃
╰━━━━━━━━━━━━━━━━━━━━╯

${quizData.options.join("\n")}

╭━━━〔 💰 REWARD 〕━━━╮
┃
┃ ⏱️ Reply: A / B / C / D
┃
┃ ✅ Correct → +500$
┃ ❌ Wrong → -50$
┃
┃ ⌛ Time: 60 Seconds
┃
╰━━━━━━━━━━━━━━━━━━━━╯

⚡ Powered by MUSA BOT
👑 Atif Irfan Musa`;

  api.sendMessage(
    msg,
    threadID,
    (err, info) => {
      if (err) {
        console.error("MUSA QUIZ SEND ERROR:", err);
        return;
      }

      global.GoatBot.onReply.set(
        info.messageID,
        {
          commandName: "quiz",
          messageID: info.messageID,
          answer: quizData.answer,
          senderID
        }
      );

      setTimeout(() => {
        if (
          global.GoatBot.onReply.has(info.messageID)
        ) {
          global.GoatBot.onReply.delete(info.messageID);

          api.sendMessage(
            `⏰ Quiz Time Out!

❌ সময় শেষ হয়ে গেছে।
🔄 আবার ${global.GoatBot.config?.prefix || ""}quiz দিয়ে খেলুন।

👑 MUSA BOT`,
            threadID
          );

          api.unsendMessage(info.messageID);
        }
      }, 60000);
    },
    messageID
  );
};

module.exports.onReply = async function ({
  api,
  event,
  usersData,
  Reply
}) {
  const {
    senderID,
    threadID,
    messageID,
    body
  } = event;

  const {
    answer,
    senderID: quizOwner
  } = Reply;

  // অন্য কেউ উত্তর দিলে
  if (senderID !== quizOwner) {
    return api.sendMessage(
      `⚠️ এই Quiz টি অন্য একজনের জন্য ছিল।

👤 শুধু Quiz শুরু করা ব্যক্তিই উত্তর দিতে পারবেন।`,
      threadID,
      messageID
    );
  }

  const userAnswer =
    body.trim().toUpperCase();

  if (
    !["A", "B", "C", "D"].includes(userAnswer)
  ) {
    return api.sendMessage(
      `⚠️ ভুল format!

শুধু A, B, C অথবা D লিখে reply করুন।`,
      threadID,
      messageID
    );
  }

  global.GoatBot.onReply.delete(
    Reply.messageID
  );

  try {
    const userData =
      await usersData.get(senderID);

    let balance =
      userData?.data?.money ?? 100;

    if (userAnswer === answer) {

      balance += 500;

      await usersData.set(senderID, {
        data: {
          ...(userData?.data || {}),
          money: balance
        }
      });

      return api.sendMessage(
`╭━━━〔 🎉 CORRECT 〕━━━╮
┃
┃ ✅ উত্তর সঠিক!
┃
┃ 🧠 Answer: ${answer}
┃ 💵 Won: +500$
┃ 💰 Balance: ${balance}$
┃
╰━━━━━━━━━━━━━━━━━━━━╯

👑 MUSA BOT
✨ Atif Irfan Musa`,
        threadID,
        messageID
      );

    } else {

      balance =
        Math.max(0, balance - 50);

      await usersData.set(senderID, {
        data: {
          ...(userData?.data || {}),
          money: balance
        }
      });

      api.unsendMessage(
        Reply.messageID
      );

      return api.sendMessage(
`╭━━━〔 ❌ WRONG ANSWER 〕━━━╮
┃
┃ ❌ তোমার উত্তর ভুল!
┃
┃ 🧠 Correct Answer: ${answer}
┃ 💸 Lost: -50$
┃ 💰 Balance: ${balance}$
┃
╰━━━━━━━━━━━━━━━━━━━━╯

🔄 আবার খেলতে:
${global.GoatBot.config?.prefix || ""}quiz

👑 MUSA BOT`,
        threadID,
        messageID
      );
    }

  } catch (error) {

    console.error(
      "MUSA QUIZ MONEY ERROR:",
      error
    );

    return api.sendMessage(
      `❌ টাকা আপডেট করতে সমস্যা হয়েছে।

🔄 আবার চেষ্টা করুন।
👑 MUSA BOT`,
      threadID,
      messageID
    );
  }
};