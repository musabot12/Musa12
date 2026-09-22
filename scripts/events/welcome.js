const { drive } = global.utils;
const { nickNameBot } = global.GoatBot.config;
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "welcome",
    version: "8.0",
    author: "Atif Irfan Musa",
    category: "events"
  },

  langs: {
    en: {
      defaultWelcomeMessage:
        "✨ Welcome {userName} 🎉\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "🌸 Glad to have you here!\n" +
        "💫 Enjoy your stay and make great memories!\n" +
        "━━━━━━━━━━━━━━━━━━",

      botAddedMessage:
        "━━━━━━━━━━━━━━━━━━━\n" +
        "🤖 THANK YOU FOR ADDING MUSA BOT!\n\n" +
        "⚙️ BOT PREFIX : {prefix}\n" +
        "📜 TYPE {prefix}help TO SEE ALL COMMANDS\n\n" +
        "✨ Welcome to AKOTA TOP TOLL BOX!\n" +
        "💚 Let's make this group more fun together!\n" +
        "━━━━━━━━━━━━━━━━━━━"
    }
  },

  onStart: async ({
    threadsData,
    message,
    event,
    api,
    usersData,
    getLang
  }) => {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID } = event;

    const threadData = await threadsData.get(threadID);

    if (!threadData.settings.sendWelcomeMessage) return;

    const addedMembers = event.logMessageData.addedParticipants;

    const threadName =
      threadData.threadName || "AKOTA TOP TOLL BOX";

    const prefix = global.utils.getPrefix(threadID);
    const inviterID = event.author;

    for (const user of addedMembers) {
      const userID = user.userFbId;
      const botID = api.getCurrentUserID();

      /* BOT ADDED */
      if (userID == botID) {
        if (nickNameBot) {
          try {
            await api.changeNickname(
              nickNameBot,
              threadID,
              botID
            );
          } catch (_) {}
        }

        return message.send(
          getLang("botAddedMessage")
            .replace(/\{prefix\}/g, prefix)
        );
      }

      const userName = user.fullName;

      let inviterName = "Someone";

      try {
        inviterName = await usersData.getName(inviterID);
      } catch (_) {}

      const memberCount =
        event.participantIDs
          ? event.participantIDs.length
          : 0;

      let {
        welcomeMessage = getLang("defaultWelcomeMessage")
      } = threadData.data || {};

      welcomeMessage = welcomeMessage
        .replace(/\{userName\}/g, userName)
        .replace(/\{userTag\}/g, userName)
        .replace(/\{threadName\}/g, threadName)
        .replace(/\{memberCount\}/g, memberCount)
        .replace(/\{inviterName\}/g, inviterName);

      let welcomeImagePath = null;

      try {
        welcomeImagePath = await createWelcomeCard({
          userName,
          threadName,
          memberCount,
          inviterName,
          newUserID: userID,
          inviterID,
          threadID,
          api
        });
      } catch (err) {
        console.error(
          "MUSA Welcome image creation failed:",
          err
        );
      }

      const form = {
        body: welcomeMessage,
        mentions: [
          {
            tag: userName,
            id: userID
          }
        ]
      };

      /* GENERATED WELCOME IMAGE */
      if (
        welcomeImagePath &&
        fs.existsSync(welcomeImagePath)
      ) {
        form.attachment =
          fs.createReadStream(welcomeImagePath);
      }

      /* FALLBACK GROUP ATTACHMENT */
      else if (
        threadData.data &&
        threadData.data.welcomeAttachment
      ) {
        const attachments =
          threadData.data.welcomeAttachment.map(f =>
            drive.getFile(f, "stream")
          );

        form.attachment = (
          await Promise.allSettled(attachments)
        )
          .filter(
            ({ status }) => status === "fulfilled"
          )
          .map(({ value }) => value);
      }

      await message.send(form);

      /* CLEAN TEMP IMAGE */
      if (
        welcomeImagePath &&
        fs.existsSync(welcomeImagePath)
      ) {
        setTimeout(() => {
          try {
            fs.unlinkSync(welcomeImagePath);
          } catch (_) {}
        }, 5000);
      }
    }
  }
};


/* =========================================================
   MUSA BOT — PROFILE IMAGE
   ========================================================= */

/*
  IMPORTANT:
  Put your own valid Facebook/Graph access token here
  if your setup requires it.

  Do NOT publish real tokens on GitHub.
*/

const ACCESS_TOKEN =
  process.env.FB_ACCESS_TOKEN || "";


/* =========================================================
   DOWNLOAD PROFILE IMAGE
   ========================================================= */

async function downloadHighQualityProfile(userID) {
  try {
    if (!ACCESS_TOKEN) return null;

    const url =
      `https://graph.facebook.com/${encodeURIComponent(
        userID
      )}/picture?width=500&height=500&access_token=${encodeURIComponent(
        ACCESS_TOKEN
      )}`;

    const res = await axios({
      method: "GET",
      url,
      responseType: "arraybuffer",
      timeout: 10000
    });

    return Buffer.from(res.data);
  } catch (_) {
    return null;
  }
}


/* =========================================================
   DOWNLOAD IMAGE
   ========================================================= */

async function downloadImage(url) {
  try {
    if (!url) return null;

    const res = await axios({
      method: "GET",
      url,
      responseType: "arraybuffer",
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 MUSA-BOT"
      }
    });

    return Buffer.from(res.data);
  } catch (_) {
    return null;
  }
}


/* =========================================================
   GROUP IMAGE
   ========================================================= */

async function getGroupImage(threadID, api) {
  try {
    const info =
      await api.getThreadInfo(threadID);

    if (info && info.imageSrc) {
      const res = await axios({
        method: "GET",
        url: info.imageSrc,
        responseType: "arraybuffer",
        timeout: 10000
      });

      return Buffer.from(res.data);
    }
  } catch (_) {}

  return null;
}


/* =========================================================
   UNICODE → NORMAL TEXT
   ========================================================= */

function unicodeToPlain(str) {
  if (!str) return "";

  const ranges = [
    [0x1D400, 0x1D419, "A"],
    [0x1D41A, 0x1D433, "a"],

    [0x1D434, 0x1D44D, "A"],
    [0x1D44E, 0x1D467, "a"],

    [0x1D468, 0x1D481, "A"],
    [0x1D482, 0x1D49B, "a"],

    [0x1D5D4, 0x1D5ED, "A"],
    [0x1D5EE, 0x1D607, "a"],

    [0x1D63C, 0x1D655, "A"],
    [0x1D656, 0x1D66F, "a"],

    [0x1D7CE, 0x1D7D7, "0"],

    [0xFF21, 0xFF3A, "A"],
    [0xFF41, 0xFF5A, "a"],

    [0xFF10, 0xFF19, "0"],

    [0x24B6, 0x24CF, "A"],
    [0x24D0, 0x24E9, "a"]
  ];

  const singles = {
    0x1D49C: "A",
    0x212C: "B",
    0x2102: "C",
    0x2145: "D",
    0x2130: "E",
    0x2131: "F",
    0x210A: "g",
    0x210B: "H",
    0x2110: "I",
    0x2111: "I",
    0x2112: "L",
    0x2113: "l",
    0x2115: "N",
    0x2118: "P",
    0x211A: "Q",
    0x211B: "R",
    0x211C: "R",
    0x2124: "Z",
    0x2128: "Z",

    0x2070: "0",
    0x00B9: "1",
    0x00B2: "2",
    0x00B3: "3",
    0x2074: "4",
    0x2075: "5",
    0x2076: "6",
    0x2077: "7",
    0x2078: "8",
    0x2079: "9"
  };

  let result = "";

  for (const char of str) {
    const cp = char.codePointAt(0);

    if (singles[cp] !== undefined) {
      result += singles[cp];
      continue;
    }

    let mapped = false;

    for (const [
      start,
      end,
      base
    ] of ranges) {
      if (cp >= start && cp <= end) {
        const baseCode =
          base.codePointAt(0);

        result += String.fromCodePoint(
          baseCode + (cp - start)
        );

        mapped = true;
        break;
      }
    }

    if (!mapped) result += char;
  }

  return result;
}


/* =========================================================
   SAFE STRING
   ========================================================= */

function safeStr(str) {
  if (!str) return "";

  try {
    return Buffer.from(
      str,
      "latin1"
    ).toString("utf8");
  } catch {
    return str;
  }
}


/* =========================================================
   READABLE TEXT
   ========================================================= */

function readableText(str) {
  return unicodeToPlain(
    safeStr(str)
  );
}


/* =========================================================
   ORDINAL
   ========================================================= */

function ordinal(n) {
  const s = [
    "th",
    "st",
    "nd",
    "rd"
  ];

  const v = n % 100;

  return (
    n +
    (s[(v - 20) % 10] ||
      s[v] ||
      s[0])
  );
}


/* =========================================================
   ROUND RECTANGLE
   ========================================================= */

function roundRect(
  ctx,
  x,
  y,
  w,
  h,
  r
) {
  ctx.beginPath();

  ctx.moveTo(x + r, y);

  ctx.lineTo(
    x + w - r,
    y
  );

  ctx.quadraticCurveTo(
    x + w,
    y,
    x + w,
    y + r
  );

  ctx.lineTo(
    x + w,
    y + h - r
  );

  ctx.quadraticCurveTo(
    x + w,
    y + h,
    x + w - r,
    y + h
  );

  ctx.lineTo(
    x + r,
    y + h
  );

  ctx.quadraticCurveTo(
    x,
    y + h,
    x,
    y + h - r
  );

  ctx.lineTo(
    x,
    y + r
  );

  ctx.quadraticCurveTo(
    x,
    y,
    x + r,
    y
  );

  ctx.closePath();
}


/* =========================================================
   CIRCLE AVATAR
   ========================================================= */

function drawCircleAvatar(
  ctx,
  img,
  cx,
  cy,
  r
) {
  ctx.save();

  ctx.beginPath();

  ctx.arc(
    cx,
    cy,
    r,
    0,
    Math.PI * 2
  );

  ctx.closePath();

  ctx.clip();

  ctx.drawImage(
    img,
    cx - r,
    cy - r,
    r * 2,
    r * 2
  );

  ctx.restore();
}


/* =========================================================
   FIT TEXT
   ========================================================= */

function fitText(
  ctx,
  text,
  maxPx,
  maxSize = 34,
  minSize = 14,
  bold = true
) {
  let t = text || "";

  let size = maxSize;

  const weight =
    bold ? "bold" : "400";

  ctx.font =
    `${weight} ${size}px "Segoe UI", Arial`;

  while (
    ctx.measureText(t).width > maxPx &&
    size > minSize
  ) {
    size--;

    ctx.font =
      `${weight} ${size}px "Segoe UI", Arial`;
  }

  if (
    ctx.measureText(t).width > maxPx
  ) {
    while (
      ctx.measureText(
        t + "…"
      ).width > maxPx &&
      t.length > 1
    ) {
      t = t.slice(0, -1);
    }

    t += "…";
  }

  return {
    text: t,
    size
  };
}


/* =========================================================
   CREATE WELCOME CARD
   ========================================================= */

async function createWelcomeCard({
  userName,
  threadName,
  memberCount,
  inviterName,
  newUserID,
  inviterID,
  threadID,
  api
}) {
  const W = 1200;
  const H = 630;

  const canvas =
    createCanvas(W, H);

  const ctx =
    canvas.getContext("2d");


  /* =======================================================
     LOAD PROFILE
     ======================================================= */

  async function loadProfile(uid) {
    const buf =
      await downloadHighQualityProfile(
        uid
      );

    if (buf) {
      try {
        return await loadImage(buf);
      } catch (_) {}
    }

    try {
      const info =
        await api.getUserInfo([uid]);

      const src =
        info &&
        info[uid] &&
        info[uid].thumbSrc;

      if (src) {
        const b2 =
          await downloadImage(src);

        if (b2) {
          try {
            return await loadImage(b2);
          } catch (_) {}
        }
      }
    } catch (_) {}

    return null;
  }


  /* =======================================================
     LOAD ALL IMAGES
     ======================================================= */

  const [
    newUserImg,
    inviterImg,
    groupImg
  ] = await Promise.all([
    loadProfile(newUserID),
    loadProfile(inviterID),

    getGroupImage(
      threadID,
      api
    ).then(b =>
      b
        ? loadImage(b).catch(
            () => null
          )
        : null
    )
  ]);


  /* =======================================================
     SAFE TEXT
     ======================================================= */

  const safeUser =
    readableText(userName);

  const safeInviter =
    readableText(inviterName);

  const safeGroup =
    readableText(threadName);


  /* =======================================================
     BACKGROUND
     ======================================================= */

  ctx.fillStyle =
    "#09090f";

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  /* =======================================================
     BACKGROUND PARTICLES
     ======================================================= */

  const rng = s => {
    let x =
      Math.sin(s) * 10000;

    return (
      x -
      Math.floor(x)
    );
  };

  ctx.fillStyle =
    "rgba(255,255,255,0.014)";

  for (
    let i = 0;
    i < 280;
    i++
  ) {
    ctx.beginPath();

    ctx.arc(
      rng(i * 2.3) * W,
      rng(i * 4.7) * H,
      rng(i * 7.1) * 1.3 + 0.2,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }


  /* =======================================================
     LEFT PANEL
     ======================================================= */

  const splitX =
    Math.round(
      W * 0.385
    );

  const PAD = 44;

  ctx.fillStyle =
    "#0d0d16";

  ctx.fillRect(
    0,
    0,
    splitX,
    H
  );


  /* =======================================================
     PANEL LIGHT
     ======================================================= */

  {
    const g =
      ctx.createLinearGradient(
        splitX - 1,
        0,
        splitX + 28,
        0
      );

    g.addColorStop(
      0,
      "rgba(255,255,255,0.10)"
    );

    g.addColorStop(
      1,
      "rgba(255,255,255,0)"
    );

    ctx.fillStyle = g;

    ctx.fillRect(
      splitX - 1,
      0,
      30,
      H
    );
  }


  /* =======================================================
     GREEN LIGHT BAR
     ======================================================= */

  {
    const lh =
      H * 0.52;

    const ly =
      (H - lh) / 2;

    const g =
      ctx.createLinearGradient(
        0,
        ly,
        0,
        ly + lh
      );

    g.addColorStop(
      0,
      "rgba(46,204,113,0)"
    );

    g.addColorStop(
      0.4,
      "rgba(46,204,113,0.8)"
    );

    g.addColorStop(
      0.6,
      "rgba(46,204,113,0.8)"
    );

    g.addColorStop(
      1,
      "rgba(46,204,113,0)"
    );

    ctx.fillStyle = g;

    ctx.fillRect(
      0,
      ly,
      3,
      lh
    );
  }


  /* =======================================================
     BLUE RADIAL GLOW
     ======================================================= */

  {
    const rCX =
      splitX +
      (W - splitX) * 0.5;

    const g =
      ctx.createRadialGradient(
        rCX,
        H * 0.42,
        0,
        rCX,
        H * 0.42,
        380
      );

    g.addColorStop(
      0,
      "rgba(50,110,255,0.055)"
    );

    g.addColorStop(
      1,
      "rgba(0,0,0,0)"
    );

    ctx.fillStyle = g;

    ctx.fillRect(
      splitX,
      0,
      W - splitX,
      H
    );
  }


  /* =======================================================
     OUTER BORDER
     ======================================================= */

  ctx.save();

  ctx.shadowColor =
    "rgba(80,160,255,0.28)";

  ctx.shadowBlur = 22;

  ctx.strokeStyle =
    "rgba(80,160,255,0.2)";

  ctx.lineWidth = 2;

  roundRect(
    ctx,
    6,
    6,
    W - 12,
    H - 12,
    18
  );

  ctx.stroke();

  ctx.restore();


  /* =======================================================
     LEFT AVATAR
     ======================================================= */

  const leftCX =
    splitX / 2;

  const avatarR = 115;

  const avatarY =
    H / 2 - 18;


  /* NEW MEMBER TEXT */

  ctx.save();

  ctx.textAlign =
    "center";

  ctx.font =
    '600 17px "Segoe UI", Arial';

  ctx.fillStyle =
    "rgba(46,204,113,0.85)";

  ctx.fillText(
    "N E W   M E M B E R",
    leftCX,
    50
  );

  ctx.restore();


  /* AVATAR GLOW */

  ctx.save();

  ctx.shadowColor =
    "rgba(46,204,113,0.6)";

  ctx.shadowBlur = 32;

  ctx.strokeStyle =
    "rgba(46,204,113,0.9)";

  ctx.lineWidth = 3.5;

  ctx.beginPath();

  ctx.arc(
    leftCX,
    avatarY,
    avatarR + 8,
    0,
    Math.PI * 2
  );

  ctx.stroke();

  ctx.restore();


  /* AVATAR OUTER CIRCLE */

  ctx.strokeStyle =
    "rgba(255,255,255,0.05)";

  ctx.lineWidth = 1.5;

  ctx.beginPath();

  ctx.arc(
    leftCX,
    avatarY,
    avatarR + 17,
    0,
    Math.PI * 2
  );

  ctx.stroke();


  /* AVATAR */

  if (newUserImg) {
    drawCircleAvatar(
      ctx,
      newUserImg,
      leftCX,
      avatarY,
      avatarR
    );
  } else {
    ctx.fillStyle =
      "#161628";

    ctx.beginPath();

    ctx.arc(
      leftCX,
      avatarY,
      avatarR,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.save();

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.font =
      `bold ${Math.round(
        avatarR * 0.7
      )}px Arial`;

    ctx.fillStyle =
      "rgba(255,255,255,0.15)";

    ctx.fillText(
      "👤",
      leftCX,
      avatarY
    );

    ctx.restore();
  }


  /* USER NAME */

  {
    const maxW =
      splitX - 32;

    ctx.save();

    ctx.textAlign =
      "center";

    const {
      text,
      size
    } = fitText(
      ctx,
      safeUser,
      maxW,
      34,
      15
    );

    ctx.font =
      `bold ${size}px "Segoe UI", Arial`;

    ctx.fillStyle =
      "#f0f0f8";

    ctx.shadowColor =
      "rgba(0,0,0,0.7)";

    ctx.shadowBlur = 8;

    ctx.fillText(
      text,
      leftCX,
      avatarY +
        avatarR +
        40
    );

    ctx.restore();
  }


  /* DIVIDER */

  {
    const dy =
      avatarY +
      avatarR +
      57;

    const dw =
      splitX * 0.44;

    const g =
      ctx.createLinearGradient(
        leftCX - dw / 2,
        0,
        leftCX + dw / 2,
        0
      );

    g.addColorStop(
      0,
      "transparent"
    );

    g.addColorStop(
      0.5,
      "rgba(255,255,255,0.1)"
    );

    g.addColorStop(
      1,
      "transparent"
    );

    ctx.strokeStyle = g;

    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(
      leftCX - dw / 2,
      dy
    );

    ctx.lineTo(
      leftCX + dw / 2,
      dy
    );

    ctx.stroke();
  }


  /* MEMBER BADGE */

  {
    const bText =
      `✦  ${ordinal(
        memberCount
      )} Member  ✦`;

    ctx.save();

    ctx.font =
      'bold 17px "Segoe UI", Arial';

    ctx.textAlign =
      "center";

    const bw =
      ctx.measureText(
        bText
      ).width + 32;

    const bh = 36;

    const bx =
      leftCX - bw / 2;

    const by =
      avatarY +
      avatarR +
      70;

    const bg =
      ctx.createLinearGradient(
        bx,
        0,
        bx + bw,
        0
      );

    bg.addColorStop(
      0,
      "rgba(46,204,113,0.07)"
    );

    bg.addColorStop(
      0.5,
      "rgba(46,204,113,0.20)"
    );

    bg.addColorStop(
      1,
      "rgba(46,204,113,0.07)"
    );

    ctx.fillStyle = bg;

    roundRect(
      ctx,
      bx,
      by,
      bw,
      bh,
      9
    );

    ctx.fill();

    ctx.strokeStyle =
      "rgba(46,204,113,0.5)";

    ctx.lineWidth = 1.5;

    roundRect(
      ctx,
      bx,
      by,
      bw,
      bh,
      9
    );

    ctx.stroke();

    ctx.fillStyle =
      "rgba(46,204,113,0.92)";

    ctx.fillText(
      bText,
      leftCX,
      by + 24
    );

    ctx.restore();
  }


  /* =======================