const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "age",
    aliases: ["myage"],
    version: "6.0",
    author: "Atif Irfan Musa",
    role: 0,
    category: "AI",
    guide: "age <YYYY | DD/MM/YYYY | D Month YYYY | D/Month/YYYY>",
    countDown: 5
  },

  onStart: async function ({ api, event, args }) {
    try {

      if (!args.length) {
        return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮
      🎂 𝗠𝗨𝗦𝗔 𝗔𝗚𝗘 𝗖𝗔𝗟𝗖𝗨𝗟𝗔𝗧𝗢𝗥
╰━━━━━━━━━━━━━━━━━━╯

📌 𝗨𝘀𝗮𝗴𝗲:

➤ age 2007
➤ age 01/05/2007
➤ age 3 May 2007
➤ age 3/may/2007

💫 𝗖𝗿𝗲𝗱𝗶𝘁 𝗕𝘆 𝗠𝗨𝗦𝗔 👑`,
          event.threadID
        );
      }

      let input = args.join(" ").trim();
      let day, month, year;

      const monthMap = {
        jan: 1,
        january: 1,
        feb: 2,
        february: 2,
        mar: 3,
        march: 3,
        apr: 4,
        april: 4,
        may: 5,
        jun: 6,
        june: 6,
        jul: 7,
        july: 7,
        aug: 8,
        august: 8,
        sep: 9,
        september: 9,
        oct: 10,
        october: 10,
        nov: 11,
        november: 11,
        dec: 12,
        december: 12
      };

      // YYYY
      if (/^\d{4}$/.test(input)) {
        day = 1;
        month = 1;
        year = Number(input);
      }

      // DD/MM/YYYY
      else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(input)) {
        const p = input.split("/");

        day = +p[0];
        month = +p[1];
        year = +p[2];

        if (year < 100) {
          year += 2000;
        }
      }

      // 3 May 2007
      else if (/^\d{1,2}\s+[a-zA-Z]{3,9}\s+\d{4}$/.test(input)) {
        const p = input.split(/\s+/);

        day = +p[0];
        month = monthMap[p[1].toLowerCase()];
        year = +p[2];
      }

      // 3/May/2007
      else if (/^\d{1,2}\/[a-zA-Z]{3,9}\/\d{4}$/.test(input)) {
        const p = input.split("/");

        day = +p[0];
        month = monthMap[p[1].toLowerCase()];
        year = +p[2];
      }

      else {
        return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮
      ❌ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗙𝗢𝗥𝗠𝗔𝗧
╰━━━━━━━━━━━━━━━━━━╯

✔ age 2007
✔ age 01/05/2007
✔ age 3 May 2007
✔ age 3/may/2007

💜 𝗠𝗨𝗦𝗔 𝗔𝗚𝗘 𝗖𝗔𝗟𝗖𝗨𝗟𝗔𝗧𝗢𝗥`,
          event.threadID
        );
      }

      if (!day || !month || !year) {
        return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮
      ⚠️ 𝗗𝗔𝗧𝗘 𝗘𝗥𝗥𝗢𝗥
╰━━━━━━━━━━━━━━━━━━╯

❌ Date parse করা যায়নি!

📌 সঠিক format ব্যবহার করুন।

💫 𝗠𝗨𝗦𝗔 𝗕𝗢𝗧`,
          event.threadID
        );
      }

      const birth = moment.tz(
        `${year}-${month}-${day}`,
        "YYYY-MM-DD",
        "Asia/Dhaka"
      );

      if (!birth.isValid()) {
        return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮
      ❌ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗗𝗔𝗧𝗘
╰━━━━━━━━━━━━━━━━━━╯

⚠️ Please enter a valid birthday.

👑 𝗠𝗨𝗦𝗔 𝗔𝗚𝗘 𝗖𝗔𝗟𝗖𝗨𝗟𝗔𝗧𝗢𝗥`,
          event.threadID
        );
      }

      const now = moment.tz("Asia/Dhaka");

      if (birth.isAfter(now)) {
        return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮
      ⚠️ 𝗙𝗨𝗧𝗨𝗥𝗘 𝗗𝗔𝗧𝗘
╰━━━━━━━━━━━━━━━━━━╯

❌ Birthday cannot be in the future!

💜 𝗠𝗨𝗦𝗔 𝗕𝗢𝗧`,
          event.threadID
        );
      }

      const d = moment.duration(now.diff(birth));

      const y = d.years();
      const m = d.months();
      const dy = d.days();

      const totalMonths = y * 12 + m;
      const totalDays = Math.floor(d.asDays());
      const totalHours = Math.floor(d.asHours());

      const birthday = `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;

      const msg =
`╭━━━━━━━━━━━━━━━━━━━━╮
      🎂 𝗠𝗨𝗦𝗔 𝗔𝗚𝗘 𝗖𝗔𝗟𝗖𝗨𝗟𝗔𝗧𝗢𝗥
╰━━━━━━━━━━━━━━━━━━━━╯

📅 𝗕𝗶𝗿𝘁𝗵𝗱𝗮𝘆
   └─ ${birthday}

🎂 𝗖𝘂𝗿𝗿𝗲𝗻𝘁 𝗔𝗴𝗲
   ├─ ${y} 𝗬𝗲𝗮𝗿𝘀
   ├─ ${m} 𝗠𝗼𝗻𝘁𝗵𝘀
   └─ ${dy} 𝗗𝗮𝘆𝘀

╭──────── 𝗧𝗢𝗧𝗔𝗟 ────────╮
│
│ 🗓️ ${totalMonths} 𝗠𝗼𝗻𝘁𝗵𝘀
│ 📆 ${totalDays} 𝗗𝗮𝘆𝘀
│ ⏰ ${totalHours} 𝗛𝗼𝘂𝗿𝘀
│
╰────────────────────────╯

✨ 𝗖𝗮𝗹𝗰𝘂𝗹𝗮𝘁𝗲𝗱 𝗯𝘆 𝗠𝗨𝗦𝗔 𝗕𝗢𝗧
👑 𝗖𝗿𝗲𝗱𝗶𝘁 𝗕𝘆 𝗔𝘁𝗶𝗳 𝗜𝗿𝗳𝗮𝗻 𝗠𝘂𝘀𝗮`;

      return api.sendMessage(msg, event.threadID);

    } catch (e) {
      console.error(e);

      return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮
      ❌ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗘𝗥𝗥𝗢𝗥
╰━━━━━━━━━━━━━━━━━━╯

⚠️ Something went wrong.

🤖 𝗠𝗨𝗦𝗔 𝗕𝗢𝗧`,
        event.threadID
      );
    }
  }
};