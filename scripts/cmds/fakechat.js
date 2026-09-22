const fs = require("fs-extra");
const axios = require("axios");
const { loadImage, createCanvas } = require("canvas");
const path = require("path");

const TOP_BAR_URL = "https://i.ibb.co/5bqFx6C/2d96e52b17d7.jpg";
const BOTTOM_BAR_URL = "https://i.ibb.co/ccnk9pMq/81194654b06f.jpg";

module.exports = {
  config: {
    name: "fakechat",
    aliases: ["fchat"],
    version: "3.0.0",
    author: "Atif Irfan Musa",
    countDown: 5,
    role: 0,

    description: {
      en: "Create a fake Messenger-style chat image",
      bn: "মেসেঞ্জার স্টাইলে ফেক চ্যাট ছবি তৈরি করুন"
    },

    category: "fun",

    guide: {
      en: "Reply to a message with {pn} <your reply>",
      bn: "একটি মেসেজে reply করে {pn} <তোমার reply> লিখুন"
    }
  },

  langs: {
    en: {
      noReply:
        "❌ | Reply to a message and write your message!",
      error:
        "❌ | Failed to create fake chat image. Please try again."
    },

    bn: {
      noReply:
        "❌ | আগে একটি মেসেজে reply করে তারপর তোমার message লিখো!",
      error:
        "❌ | Fake chat image তৈরি করতে সমস্যা হয়েছে!"
    },

    hi: {
      noReply:
        "❌ | Kisi message ko reply karke apna message likhein!",
      error:
        "❌ | Fake chat image banane mein problem hui."
    },

    tl: {
      noReply:
        "❌ | Mag-reply muna sa isang message at ilagay ang iyong reply!",
      error:
        "❌ | Hindi nagawa ang fake chat image."
    },

    ar: {
      noReply:
        "❌ | قم بالرد على رسالة ثم اكتب رسالتك!",
      error:
        "❌ | حدث خطأ أثناء إنشاء الصورة."
    }
  },

  onStart: async function ({
    event,
    message,
    getLang,
    usersData,
    args
  }) {
    let files = [];

    try {

      // =========================
      // CHECK REPLY
      // =========================

      if (!event.messageReply || !args.length) {
        return message.reply(getLang("noReply"));
      }

      const friendID = String(event.messageReply.senderID);
      const friendText = String(event.messageReply.body || "").trim();
      const myText = args.join(" ").trim();

      if (!friendText || !myText) {
        return message.reply(getLang("noReply"));
      }

      // =========================
      // GET USER NAME
      // =========================

      let friendName = "Friend";

      try {
        friendName = await usersData.getName(friendID);
      } catch (e) {
        friendName = "Friend";
      }

      if (!friendName) {
        friendName = "Friend";
      }

      // =========================
      // CACHE DIRECTORY
      // =========================

      const cacheDir = path.join(__dirname, "cache");

      await fs.ensureDir(cacheDir);

      const ts = Date.now();

      const topBarPath = path.join(
        cacheDir,
        `musa_top_${ts}.jpg`
      );

      const bottomBarPath = path.join(
        cacheDir,
        `musa_bottom_${ts}.jpg`
      );

      const friendAvtPath = path.join(
        cacheDir,
        `musa_avatar_${ts}.jpg`
      );

      const outputPath = path.join(
        cacheDir,
        `musa_fakechat_${ts}.jpg`
      );

      files = [
        topBarPath,
        bottomBarPath,
        friendAvtPath,
        outputPath
      ];

      // =========================
      // AVATAR URL
      // =========================

      const avatarURL =
        `https://graph.facebook.com/${encodeURIComponent(friendID)}/picture?width=300&height=300`;

      // =========================
      // DOWNLOAD FILES
      // =========================

      const downloadImage = async (url, filePath) => {

        const response = await axios.get(url, {
          responseType: "arraybuffer",
          timeout: 20000,
          maxRedirects: 5,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36"
          }
        });

        if (!response.data || response.data.length < 100) {
          throw new Error("Invalid image response");
        }

        await fs.writeFile(
          filePath,
          Buffer.from(response.data)
        );

        return filePath;
      };

      await Promise.all([
        downloadImage(TOP_BAR_URL, topBarPath),
        downloadImage(BOTTOM_BAR_URL, bottomBarPath),
        downloadImage(avatarURL, friendAvtPath)
      ]);

      // =========================
      // LOAD IMAGES
      // =========================

      const [
        topBarImg,
        bottomBarImg,
        friendImg
      ] = await Promise.all([
        loadImage(topBarPath),
        loadImage(bottomBarPath),
        loadImage(friendAvtPath)
      ]);

      // =========================
      // CANVAS SETTINGS
      // =========================

      const W = 720;

      const topBarH = Math.round(
        topBarImg.height *
        (W / topBarImg.width)
      );

      const bottomBarH = Math.round(
        bottomBarImg.height *
        (W / bottomBarImg.width)
      );

      const bubblePadX = 22;
      const bubblePadY = 16;

      const maxBubbleWidth = 460;

      const avatarSize = 44;

      const fontSize = 26;
      const lineHeight = 36;

      // =========================
      // TEXT MEASURE
      // =========================

      const measureCanvas =
        createCanvas(10, 10);

      const mctx =
        measureCanvas.getContext("2d");

      mctx.font =
        `${fontSize}px Sans`;

      const friendLines =
        wrapTextByWidth(
          mctx,
          friendText,
          maxBubbleWidth -
            bubblePadX * 2
        );

      const myLines =
        wrapTextByWidth(
          mctx,
          myText,
          maxBubbleWidth -
            bubblePadX * 2
        );

      const friendTextWidth =
        Math.max(
          ...friendLines.map(line =>
            mctx.measureText(line).width
          )
        );

      const myTextWidth =
        Math.max(
          ...myLines.map(line =>
            mctx.measureText(line).width
          )
        );

      const friendBubbleW =
        Math.min(
          maxBubbleWidth,
          friendTextWidth +
            bubblePadX * 2
        );

      const myBubbleW =
        Math.min(
          maxBubbleWidth,
          myTextWidth +
            bubblePadX * 2
        );

      const friendBubbleH =
        friendLines.length *
          lineHeight +
        bubblePadY * 2;

      const myBubbleH =
        myLines.length *
          lineHeight +
        bubblePadY * 2;

      // =========================
      // CANVAS HEIGHT
      // =========================

      const chatPaddingTop = 40;
      const gapBetween = 30;

      const chatAreaH =
        friendBubbleH +
        gapBetween +
        myBubbleH +
        70;

      const H =
        topBarH +
        chatPaddingTop +
        chatAreaH +
        bottomBarH;

      const canvas =
        createCanvas(W, H);

      const ctx =
        canvas.getContext("2d");

      // =========================
      // BACKGROUND
      // =========================

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);

      // =========================
      // TOP BAR
      // =========================

      ctx.drawImage(
        topBarImg,
        0,
        0,
        W,
        topBarH
      );

      // =========================
      // TIME
      // =========================

      const now = new Date();

      const timeStr =
        now.toLocaleTimeString(
          "en-US",
          {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Dhaka"
          }
        );

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px Sans";
      ctx.textAlign = "left";

      ctx.fillText(
        timeStr,
        24,
        44
      );

      // =========================
      // HEADER AVATAR
      // =========================

      const headerAvtSize = 56;

      const headerAvtX = 86;

      const headerAvtY =
        topBarH - 45;

      ctx.save();

      ctx.beginPath();

      ctx.arc(
        headerAvtX +
          headerAvtSize / 2,
        headerAvtY,
        headerAvtSize / 2,
        0,
        Math.PI * 2
      );

      ctx.closePath();
      ctx.clip();

      drawCoverImage(
        ctx,
        friendImg,
        headerAvtX,
        headerAvtY -
          headerAvtSize / 2,
        headerAvtSize,
        headerAvtSize
      );

      ctx.restore();

      // =========================
      // ONLINE DOT
      // =========================

      const dotRadius = 9;

      const dotX =
        headerAvtX +
        headerAvtSize -
        4;

      const dotY =
        headerAvtY +
        headerAvtSize / 2 -
        4;

      ctx.fillStyle = "#000000";

      ctx.beginPath();

      ctx.arc(
        dotX,
        dotY,
        dotRadius + 3,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.fillStyle = "#31a24c";

      ctx.beginPath();

      ctx.arc(
        dotX,
        dotY,
        dotRadius,
        0,
        Math.PI * 2
      );

      ctx.fill();

      // =========================
      // FRIEND NAME
      // =========================

      const nameX =
        headerAvtX +
        headerAvtSize +
        14;

      const nameMaxWidth = 290;

      ctx.fillStyle = "#ffffff";

      ctx.textAlign = "left";

      const fittedName =
        fitTextToWidth(
          ctx,
          friendName,
          nameMaxWidth,
          "bold 28px Sans"
        );

      ctx.font =
        "bold 28px Sans";

      ctx.fillText(
        fittedName,
        nameX,
        headerAvtY + 8
      );

      // =========================
      // CHAT AREA
      // =========================

      let curY =
        topBarH +
        chatPaddingTop;

      // =========================
      // FRIEND MESSAGE
      // =========================

      const friendBubbleX =
        40 +
        avatarSize +
        12;

      drawBubble(
        ctx,
        friendBubbleX,
        curY,
        friendBubbleW,
        friendBubbleH,
        "#3a3b3c"
      );

      ctx.fillStyle = "#ffffff";

      ctx.font =
        `${fontSize}px Sans`;

      ctx.textAlign = "left";

      friendLines.forEach(
        (line, i) => {

          ctx.fillText(
            line,
            friendBubbleX +
              bubblePadX,
            curY +
              bubblePadY +
              (i + 1) *
                lineHeight -
              8
          );

        }
      );

      // =========================
      // FRIEND AVATAR
      // =========================

      ctx.save();

      ctx.beginPath();

      ctx.arc(
        40 + avatarSize / 2,
        curY +
          friendBubbleH / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
      );

      ctx.closePath();
      ctx.clip();

      drawCoverImage(
        ctx,
        friendImg,
        40,
        curY +
          friendBubbleH / 2 -
          avatarSize / 2,
        avatarSize,
        avatarSize
      );

      ctx.restore();

      // =========================
      // AVATAR BORDER
      // =========================

      ctx.strokeStyle =
        "rgba(255,255,255,0.25)";

      ctx.lineWidth = 2;

      ctx.beginPath();

      ctx.arc(
        40 + avatarSize / 2,
        curY +
          friendBubbleH / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
      );

      ctx.stroke();

      curY +=
        friendBubbleH +
        gapBetween;

      // =========================
      // MY MESSAGE
      // =========================

      const myBubbleX =
        W -
        40 -
        myBubbleW;

      drawBubble(
        ctx,
        myBubbleX,
        curY,
        myBubbleW,
        myBubbleH,
        "#0084ff"
      );

      ctx.fillStyle = "#ffffff";

      ctx.font =
        `${fontSize}px Sans`;

      myLines.forEach(
        (line, i) => {

          ctx.fillText(
            line,
            myBubbleX +
              bubblePadX,
            curY +
              bubblePadY +
              (i + 1) *
                lineHeight -
              8
          );

        }
      );

      // =========================
      // BOTTOM BAR
      // =========================

      ctx.drawImage(
        bottomBarImg,
        0,
        H - bottomBarH,
        W,
        bottomBarH
      );

      // =========================
      // SAVE IMAGE
      // =========================

      await fs.writeFile(
        outputPath,
        canvas.toBuffer(
          "image/jpeg",
          {
            quality: 0.92
          }
        )
      );

      // =========================
      // SEND IMAGE
      // =========================

      await message.reply({
        attachment:
          fs.createReadStream(outputPath)
      });

    } catch (err) {

      console.error(
        "[MUSA FAKECHAT ERROR]",
        err
      );

      return message.reply(
        getLang("error")
      );

    } finally {

      // =========================
      // CLEAN CACHE
      // =========================

      for (const file of files) {

        try {

          if (await fs.pathExists(file)) {
            await fs.remove(file);
          }

        } catch (e) {}

      }
    }
  }
};


// =====================================================
// DRAW CHAT BUBBLE
// =====================================================

function drawBubble(
  ctx,
  x,
  y,
  w,
  h,
  color
) {

  const r = 20;

  ctx.fillStyle = color;

  ctx.beginPath();

  ctx.moveTo(
    x + r,
    y
  );

  ctx.arcTo(
    x + w,
    y,
    x + w,
    y + h,
    r
  );

  ctx.arcTo(
    x + w,
    y + h,
    x,
    y + h,
    r
  );

  ctx.arcTo(
    x,
    y + h,
    x,
    y,
    r
  );

  ctx.arcTo(
    x,
    y,
    x + w,
    y,
    r
  );

  ctx.closePath();

  ctx.fill();
}


// =====================================================
// TEXT WRAPPER
// =====================================================

function wrapTextByWidth(
  ctx,
  text,
  maxWidth
) {

  const paragraphs =
    String(text).split("\n");

  const lines = [];

  for (const paragraph of paragraphs) {

    const words =
      paragraph.split(/\s+/);

    let current = "";

    for (const word of words) {

      if (!word) continue;

      const test =
        current
          ? `${current} ${word}`
          : word;

      if (
        ctx.measureText(test).width >
          maxWidth &&
        current
      ) {

        lines.push(current);

        current = word;

      } else {

        current = test;
      }
    }

    if (current) {
      lines.push(current);
    }

    if (!words.length) {
      lines.push("");
    }
  }

  return lines.length
    ? lines
    : [""];
}


// =====================================================
// FIT NAME
// =====================================================

function fitTextToWidth(
  ctx,
  text,
  maxWidth,
  font
) {

  ctx.font = font;

  if (
    ctx.measureText(text).width <=
    maxWidth
  ) {
    return text;
  }

  let truncated = text;

  while (
    truncated.length > 1 &&
    ctx.measureText(
      truncated + "..."
    ).width > maxWidth
  ) {

    truncated =
      truncated.slice(0, -1);
  }

  return truncated + "...";
}


// =====================================================
// COVER IMAGE
// =====================================================

function drawCoverImage(
  ctx,
  img,
  x,
  y,
  w,
  h
) {

  const scale =
    Math.max(
      w / img.width,
      h / img.height
    );

  const dw =
    img.width * scale;

  const dh =
    img.height * scale;

  const dx =
    x + (w - dw) / 2;

  const dy =
    y + (h - dh) / 2;

  ctx.drawImage(
    img,
    dx,
    dy,
    dw,
    dh
  );
}