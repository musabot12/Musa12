const axios = require("axios");

async function getMusaAPI() {
	try {
		const base = await axios.get(
			"https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json",
			{ timeout: 15000 }
		);

		return base.data?.mahmud;
	} catch (error) {
		throw new Error("API Base URL পাওয়া যায়নি");
	}
}

module.exports = {
	config: {
		name: "sing",
		version: "2.0",
		author: "Atif Irfan Musa",
		countDown: 10,
		role: 0,

		description: {
			bn: "যেকোনো গান সার্চ করে অডিও ডাউনলোড করুন",
			en: "Search and download any song as an audio file"
		},

		category: "music",

		guide: {
			bn:
				"🎵 {pn} <গানের নাম>\n\n"
				+ "উদাহরণ:\n"
				+ "{pn} shape of you",

			en:
				"🎵 {pn} <song name>\n\n"
				+ "Example:\n"
				+ "{pn} shape of you"
		}
	},

	langs: {
		bn: {

			noInput:
				`╭━━━〔 🎵 MUSA MUSIC 〕━━━╮
┃
┃ ⚠️ গানের নাম লিখুন।
┃
┃ 📌 উদাহরণ:
┃ ${global.GoatBot?.config?.prefix || ""}sing shape of you
┃
╰━━━━━━━━━━━━━━━━━━━━╯`,

			searching:
				`╭━━━〔 🎧 MUSA MUSIC 〕━━━╮
┃
┃ 🔎 গান খোঁজা হচ্ছে...
┃ ⏳ একটু অপেক্ষা করুন।
┃
╰━━━━━━━━━━━━━━━━━━━━╯`,

			success:
				`╭━━━〔 🎵 MUSA MUSIC 〕━━━╮
┃
┃ ✅ গান প্রস্তুত!
┃
┃ 🎶 Song: %1
┃
┃ 🎧 Audio attached below
┃
╰━━━━━━━━━━━━━━━━━━━━╯
👑 Atif Irfan Musa
✨ MUSA BOT`,

			error:
				`╭━━━〔 ❌ MUSA MUSIC 〕━━━╮
┃
┃ গানটি ডাউনলোড করা যায়নি।
┃
┃ ⚠️ Error: %1
┃
┃ 🔄 অন্য গান দিয়ে চেষ্টা করুন।
┃
╰━━━━━━━━━━━━━━━━━━━━╯`
		},

		en: {

			noInput:
				`╭━━━〔 🎵 MUSA MUSIC 〕━━━╮
┃
┃ ⚠️ Please enter a song name.
┃
┃ Example:
┃ ${global.GoatBot?.config?.prefix || ""}sing shape of you
┃
╰━━━━━━━━━━━━━━━━━━━━╯`,

			searching:
				`╭━━━〔 🎧 MUSA MUSIC 〕━━━╮
┃
┃ 🔎 Searching for your song...
┃ ⏳ Please wait.
┃
╰━━━━━━━━━━━━━━━━━━━━╯`,

			success:
				`╭━━━〔 🎵 MUSA MUSIC 〕━━━╮
┃
┃ ✅ Song ready!
┃
┃ 🎶 Song: %1
┃
┃ 🎧 Audio attached below
┃
╰━━━━━━━━━━━━━━━━━━━━╯
👑 Atif Irfan Musa
✨ MUSA BOT`,

			error:
				`╭━━━〔 ❌ MUSA MUSIC 〕━━━╮
┃
┃ Could not download the song.
┃
┃ ⚠️ Error: %1
┃
┃ 🔄 Try another song.
┃
╰━━━━━━━━━━━━━━━━━━━━╯`
		}
	},

	onStart: async function ({
		api,
		event,
		args,
		message,
		getLang
	}) {

		const query = args.join(" ").trim();

		if (!query) {
			return message.reply(
				getLang("noInput")
			);
		}

		try {

			// Loading reaction
			api.setMessageReaction(
				"⏳",
				event.messageID,
				() => {},
				true
			);

			// Searching message
			const loading = await message.reply(
				getLang("searching")
			);

			// Get API
			const baseUrl = await getMusaAPI();

			if (!baseUrl) {
				throw new Error(
					"Music API unavailable"
				);
			}

			const apiUrl =
				`${baseUrl}/api/song/mahmud?query=${encodeURIComponent(query)}`;

			// Download audio stream
			const response = await axios({
				method: "GET",
				url: apiUrl,
				responseType: "stream",
				timeout: 60000,
				headers: {
					"User-Agent":
						"MUSA-BOT/2.0"
				}
			});

			if (
				!response.data ||
				!response.headers
			) {
				throw new Error(
					"Audio data পাওয়া যায়নি"
				);
			}

			// Send audio
			await message.reply({
				body: getLang(
					"success",
					query
				),

				attachment:
					response.data

			});

			// Success reaction
			api.setMessageReaction(
				"🎵",
				event.messageID,
				() => {},
				true
			);

			// Remove loading message
			if (loading?.messageID) {
				setTimeout(() => {
					api.unsendMessage(
						loading.messageID
					).catch(() => {});
				}, 1000);
			}

		} catch (error) {

			console.error(
				"MUSA SING ERROR:",
				error
			);

			api.setMessageReaction(
				"❌",
				event.messageID,
				() => {},
				true
			);

			return message.reply(
				getLang(
					"error",
					error.message || "Unknown error"
				)
			);
		}
	}
};