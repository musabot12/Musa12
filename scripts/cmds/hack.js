const fs = require("fs-extra");
const axios = require("axios");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "hack",
    version: "1.0.0",
    author: "Atif Irfan Musa",
    countDown: 0,
    role: 0,
    shortDescription: "MUSA Fake FB Hack Generator 😎",
    longDescription:
      "Creates a fake hacking-style image using a target profile photo and name. For entertainment only.",
    category: "fun",
    guide: {
      en: "{pn} @mention অথবা reply দিয়ে ব্যবহার করো"
    }
  },

  // ✏️ Text wrapping helper
  wrapText(ctx, text, maxWidth) {
    return new Promise(resolve => {
      if (ctx.measureText(text).width < maxWidth) {
        return resolve([text]);
      }

      if (ctx.measureText("W").width > maxWidth) {
        return resolve(null);
      }

      const words = text.split(" ");
      const lines = [];
      let line = "";

      while (words.length > 0) {
        let split = false;

        while (ctx.measureText(words[0]).width >= maxWidth) {
          const temp = words[0];

          words[0] = temp.slice(0, -1);

          if (split) {
            words[1] = temp.slice(-1) + words[1];
          } else {
            split = true;
            words.splice(1, 0, temp.slice(-1));
          }
        }

        if (
          ctx.measureText(line + words[0]).width < maxWidth
        ) {
          line += words.shift() + " ";
        } else {
          lines.push(line.trim());
          line = "";
        }

        if (words.length === 0) {
          lines.push(line.trim());
        }
      }

      resolve(lines);
    });
  },

  // 🎯 Main command
  onStart: async function ({
    event,
    message,
    usersData
  }) {
    try {
      const mentionID =
        Object.keys(event.mentions)[0] ||
        event.senderID;

      const userName =
        await usersData.getName(mentionID);

      // 🎨 Background
      const backgrounds = [
        "https://drive.google.com/uc?id=1_S9eqbx8CxMMxUdOfATIDXwaKWMC-8ox&export=download"
      ];

      const bgLink =
        backgrounds[
          Math.floor(
            Math.random() * backgrounds.length
          )
        ];

      // 📁 Cache paths
      const cacheDir = __dirname + "/cache";

      await fs.ensureDir(cacheDir);

      const bgPath =
        cacheDir + "/musa_hack_bg.png";

      const avatarPath =
        cacheDir + "/musa_hack_avatar.png";

      // 👤 Download profile image
      //
      // NOTE:
      // Use a valid/private-safe image source or your
      // bot's supported profile-image method here.
      const avatarData = (
        await axios.get(
          `https://graph.facebook.com/${mentionID}/picture?width=720&height=720`,
          {
            responseType: "arraybuffer",
            timeout: 15000
          }
        )
      ).data;

      fs.writeFileSync(
        avatarPath,
        Buffer.from(avatarData)
      );

      // 🖼️ Download background
      const bgData = (
        await axios.get(bgLink, {
          responseType: "arraybuffer",
          timeout: 15000
        })
      ).data;

      fs.writeFileSync(
        bgPath,
        Buffer.from(bgData)
      );

      // 🎨 Canvas
      const background =
        await loadImage(bgPath);

      const avatar =
        await loadImage(avatarPath);

      const canvas = createCanvas(
        background.width,
        background.height
      );

      const ctx =
        canvas.getContext("2d");

      ctx.drawImage(
        background,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // 👤 User name
      ctx.font = "400 23px Arial";
      ctx.fillStyle = "#1878F3";
      ctx.textAlign = "start";

      const wrappedText =
        await this.wrapText(
          ctx,
          userName,
          1160
        );

      if (wrappedText) {
        wrappedText.forEach(
          (line, index) => {
            ctx.fillText(
              line,
              136,
              335 + index * 28
            );
          }
        );
      }

      // 👑 Avatar
      ctx.beginPath();

      ctx.drawImage(
        avatar,
        57,
        290,
        66,
        68
      );

      // 💾 Final image
      const finalBuffer =
        canvas.toBuffer();

      fs.writeFileSync(
        bgPath,
        finalBuffer
      );

      await message.reply({
        body:
          "😎 MUSA HACK PRANK COMPLETE!\n\n" +
          "👑 Created by Atif Irfan Musa\n" +
          "⚠️ এটি শুধুই একটি fake/prank image.",
        attachment:
          fs.createReadStream(bgPath)
      });

      // 🧹 Cleanup
      await fs.remove(bgPath);
      await fs.remove(avatarPath);

    } catch (err) {
      console.error(
        "MUSA Hack Command Error:",
        err
      );

      message.reply(
        "❌ MUSA Hack Generator-এ কিছু সমস্যা হয়েছে!"
      );
    }
  }
};