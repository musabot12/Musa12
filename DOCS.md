### 🛠️ Built-in Functions

MUSA BOT includes a collection of useful built-in functions:

- 🌐 Translate
- ⏰ convertTime
- 🖥️ process.stderr.clearLine enable/disable
- 📁 getExtFromMimeType
- 🕐 getTime
- 🎨 jsonStringifyColor
- 🔢 randomString / randomNumber
- 👤 Facebook UID Finder
- 📎 getStreamsFromAttachment
- 🌐 getStreamFromURL
- ☁️ Google Drive — upload, delete, getFile, etc.
- ⚡ And many more...

For more details, see the project's `utils.js` file.

---

## 🧠 Requirements

Before running **MUSA BOT**, make sure you have:

- 🟢 Node.js 16.x or a compatible supported version
- 💻 IDE or Text Editor
- 🧠 Basic JavaScript knowledge
- 🧠 Basic Node.js knowledge
- 📦 Basic JSON knowledge
- 🔌 Understanding of the messaging API used by the project

### 📚 Recommended Resources

- [JavaScript — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [JSON](https://www.json.org/)

---

## ⚠️ Important Note

Please use **MUSA BOT** responsibly.

Do not use custom commands or modifications for:

- 🔞 Adult or explicit content
- 🚫 Illegal activities
- 🛑 Harassment or abuse
- 🔐 Unauthorized access
- 🤖 Spam or harmful automation
- ⚠️ Any activity that violates the applicable platform rules

Always review your code before adding it to the bot.

---

# 💾 Database

MUSA BOT supports multiple storage methods depending on the project configuration.

### 📦 Supported Database Types

- 🗂️ JSON
- 🗃️ SQLite
- 🍃 MongoDB

Database configuration can be managed through the project's configuration files.

---

## 👤 Users Database

The Users database stores information associated with users.

### CREATE USER DATA

```javascript
const newUserData = await usersData.create(userID, userInfo);