const { getPrboxx } = global.utils;

module.exports = {
	config: {
		name: "rules",
		version: "2.0",
		author: "Atif Irfan Musa",
		countDown: 5,
		role: 0,

		description: {
			en: "Create, view, add, edit, move and delete group rules",
			bn: "গ্রুপের নিয়ম দেখা, যোগ, সম্পাদনা, সরানো এবং মুছে ফেলা"
		},

		category: "box chat",

		guide: {
			en:
				"{pn}: View group rules"
				+ "\n{pn} add <rule>: Add a new rule"
				+ "\n{pn} edit <number> <text>: Edit a rule"
				+ "\n{pn} move <number1> <number2>: Swap rules"
				+ "\n{pn} delete <number>: Delete a rule"
				+ "\n{pn} remove: Remove all rules",

			bn:
				"{pn}: গ্রুপের নিয়ম দেখুন"
				+ "\n{pn} add <নিয়ম>: নতুন নিয়ম যোগ করুন"
				+ "\n{pn} edit <নম্বর> <লেখা>: নিয়ম পরিবর্তন করুন"
				+ "\n{pn} move <নম্বর1> <নম্বর2>: দুইটি নিয়মের অবস্থান পরিবর্তন করুন"
				+ "\n{pn} delete <নম্বর>: নিয়ম মুছে ফেলুন"
				+ "\n{pn} remove: সব নিয়ম মুছে ফেলুন"
		}
	},

	langs: {

		bn: {

			yourRules:
				"╭━━━〔 📜 MUSA GROUP RULES 〕━━━╮\n"
				+ "┃\n%1"
				+ "┃\n"
				+ "╰━━━━━━━━━━━━━━━━━━━━╯\n"
				+ "👑 MUSA BOT\n"
				+ "💫 Credit: Atif Irfan Musa",

			noRules:
				"╭━━━〔 📜 MUSA GROUP RULES 〕━━━╮\n"
				+ "┃\n"
				+ "┃ এখনো কোনো Rule সেট করা হয়নি।\n"
				+ "┃\n"
				+ "╰━━━━━━━━━━━━━━━━━━━━╯",

			noPermissionAdd:
				"❌ শুধুমাত্র Group Admin নতুন Rule যোগ করতে পারবে।",

			noContent:
				"⚠️ যে Rule যোগ করতে চান সেটি লিখুন।",

			success:
				"✅ নতুন Rule সফলভাবে যোগ হয়েছে।",

			noPermissionEdit:
				"❌ শুধুমাত্র Group Admin Rule edit করতে পারবে।",

			invalidNumber:
				"⚠️ সঠিক Rule number দিন।",

			rulesNotExist:
				"❌ Rule number %1 পাওয়া যায়নি।",

			numberRules:
				"📌 এই Group-এ মোট %1 টি Rule আছে।",

			noContentEdit:
				"⚠️ Rule %1-এর নতুন লেখা দিন।",

			successEdit:
				"✅ Rule %1 সফলভাবে পরিবর্তন হয়েছে।\n📝 নতুন Rule: %2",

			noPermissionMove:
				"❌ শুধুমাত্র Group Admin Rule-এর position পরিবর্তন করতে পারবে।",

			invalidNumberMove:
				"⚠️ দুইটি Rule-এর সঠিক number দিন।",

			sameNumberMove:
				"⚠️ একই Rule-এর position পরিবর্তন করা যাবে না।",

			rulesNotExistMove2:
				"❌ Rule %1 এবং %2 পাওয়া যায়নি।",

			successMove:
				"✅ Rule %1 এবং %2-এর position পরিবর্তন হয়েছে।",

			noPermissionDelete:
				"❌ শুধুমাত্র Group Admin Rule delete করতে পারবে।",

			invalidNumberDelete:
				"⚠️ যে Rule delete করতে চান তার number দিন।",

			rulesNotExistDelete:
				"❌ Rule number %1 পাওয়া যায়নি।",

			successDelete:
				"🗑️ Rule %1 delete করা হয়েছে।\n📝 Rule: %2",

			noPermissionRemove:
				"❌ শুধুমাত্র Group Admin সব Rule remove করতে পারবে।",

			confirmRemove:
				"⚠️ সব Group Rules delete করতে এই message-এ যেকোনো Emoji দিয়ে React করুন।",

			successRemove:
				"✅ Group-এর সব Rules সফলভাবে remove করা হয়েছে।",

			invalidNumberView:
				"⚠️ যে Rule দেখতে চান তার number দিন।"
		}
	},

	onStart: async function ({
		role,
		args,
		message,
		event,
		threadsData,
		getLang,
		commandName
	}) {

		const {
			threadID,
			senderID
		} = event;

		const type = args[0];

		let rulesOfThread =
			await threadsData.get(
				threadID,
				"data.rules",
				[]
			);

		/*
		 * DEFAULT MUSA RULES
		 *
		 * প্রথমবার rules ব্যবহার করলে
		 * এই ৪টি Rule automatically সেট হবে।
		 */
		if (
			!Array.isArray(rulesOfThread) ||
			rulesOfThread.length === 0
		) {

			rulesOfThread = [

				"📦 গ্রুপের নাম/টাইটেল পরিবর্তন করা যাবে না। পরিবর্তন করলে কিক করা হবে।",

				"😎 গালাগালি করলে সমস্যা নেই, তবে কাউকে ইচ্ছাকৃতভাবে হয়রানি করা যাবে না।",

				"🚫 কোনো ধরনের খারাপ/অশ্লীল ভিডিও গ্রুপে দেওয়া যাবে না।",

				"⚠️ গ্রুপের পরিবেশ সুন্দর রাখতে সবাইকে নিয়ম মেনে চলতে হবে।"

			];

			await threadsData.set(
				threadID,
				rulesOfThread,
				"data.rules"
			);
		}

		const totalRules =
			rulesOfThread.length;


		/*
		 * VIEW RULES
		 */
		if (!type) {

			let i = 1;

			const msg =
				rulesOfThread
					.map(rule =>
						`┃ ${i++}️⃣ ${rule}`
					)
					.join("\n");

			return message.reply(
				getLang("yourRules", msg),
				(err, info) => {

					if (err)
						return;

					global.GoatBot.onReply.set(
						info.messageID,
						{
							commandName,
							author: senderID,
							rulesOfThread,
							messageID:
								info.messageID
						}
					);
				}
			);
		}


		/*
		 * ADD RULE
		 */
		if (
			["add", "-a"].includes(type)
		) {

			if (role < 1)
				return message.reply(
					getLang("noPermissionAdd")
				);

			if (!args[1])
				return message.reply(
					getLang("noContent")
				);

			const newRule =
				args.slice(1).join(" ");

			rulesOfThread.push(newRule);

			try {

				await threadsData.set(
					threadID,
					rulesOfThread,
					"data.rules"
				);

				return message.reply(
					`╭━━━〔 ✅ RULE ADDED 〕━━━╮
┃
┃ 📜 ${newRule}
┃
┃ 👑 MUSA BOT
╰━━━━━━━━━━━━━━━━━━━━╯`
				);

			} catch (err) {

				return message.err(err);
			}
		}


		/*
		 * EDIT RULE
		 */
		if (
			["edit", "-e"].includes(type)
		) {

			if (role < 1)
				return message.reply(
					getLang("noPermissionEdit")
				);

			const stt =
				parseInt(args[1]);

			if (isNaN(stt))
				return message.reply(
					getLang("invalidNumber")
				);

			if (
				stt < 1 ||
				stt > totalRules
			)
				return message.reply(
					getLang(
						"rulesNotExist",
						stt
					)
				);

			if (!args[2])
				return message.reply(
					getLang(
						"noContentEdit",
						stt
					)
				);

			const newContent =
				args.slice(2).join(" ");

			rulesOfThread[stt - 1] =
				newContent;

			try {

				await threadsData.set(
					threadID,
					rulesOfThread,
					"data.rules"
				);

				return message.reply(
					getLang(
						"successEdit",
						stt,
						newContent
					)
				);

			} catch (err) {

				return message.err(err);
			}
		}


		/*
		 * MOVE RULE
		 */
		if (
			["move", "-m"].includes(type)
		) {

			if (role < 1)
				return message.reply(
					getLang("noPermissionMove")
				);

			const num1 =
				parseInt(args[1]);

			const num2 =
				parseInt(args[2]);

			if (
				isNaN(num1) ||
				isNaN(num2)
			)
				return message.reply(
					getLang(
						"invalidNumberMove"
					)
				);

			if (
				num1 < 1 ||
				num2 < 1 ||
				num1 > totalRules ||
				num2 > totalRules
			)
				return message.reply(
					getLang(
						"rulesNotExistMove2",
						num1,
						num2
					)
				);

			if (num1 === num2)
				return message.reply(
					getLang("sameNumberMove")
				);

			[
				rulesOfThread[num1 - 1],
				rulesOfThread[num2 - 1]
			] = [
				rulesOfThread[num2 - 1],
				rulesOfThread[num1 - 1]
			];

			try {

				await threadsData.set(
					threadID,
					rulesOfThread,
					"data.rules"
				);

				return message.reply(
					getLang(
						"successMove",
						num1,
						num2
					)
				);

			} catch (err) {

				return message.err(err);
			}
		}


		/*
		 * DELETE RULE
		 */
		if (
			[
				"delete",
				"del",
				"-d"
			].includes(type)
		) {

			if (role < 1)
				return message.reply(
					getLang(
						"noPermissionDelete"
					)
				);

			const stt =
				parseInt(args[1]);

			if (isNaN(stt))
				return message.reply(
					getLang(
						"invalidNumberDelete"
					)
				);

			if (
				stt < 1 ||
				stt > totalRules
			)
				return message.reply(
					getLang(
						"rulesNotExistDelete",
						stt
					)
				);

			const deletedRule =
				rulesOfThread[stt - 1];

			rulesOfThread.splice(
				stt - 1,
				1
			);

			await threadsData.set(
				threadID,
				rulesOfThread,
				"data.rules"
			);

			return message.reply(
				getLang(
					"successDelete",
					stt,
					deletedRule
				)
			);
		}


		/*
		 * REMOVE ALL RULES
		 */
		if (
			[
				"remove",
				"reset",
				"-r",
				"-rm"
			].includes(type)
		) {

			if (role < 1)
				return message.reply(
					getLang(
						"noPermissionRemove"
					)
				);

			return message.reply(
				getLang(
					"confirmRemove"
				),
				(err, info) => {

					if (err)
						return;

					global.GoatBot.onReaction.set(
						info.messageID,
						{
							commandName:
								"rules",
							messageID:
								info.messageID,
							author:
								senderID
						}
					);
				}
			);
		}


		/*
		 * VIEW SPECIFIC RULE
		 *
		 * Example:
		 * rules 2
		 */
		if (!isNaN(type)) {

			let msg = "";

			for (
				const ruleNumber of args
			) {

				const num =
					parseInt(ruleNumber);

				if (
					num >= 1 &&
					num <= totalRules
				) {

					msg +=
						`${num}. ${rulesOfThread[num - 1]}\n`;
				}
			}

			if (!msg)
				return message.reply(
					getLang(
						"rulesNotExist",
						type
					)
				);

			return message.reply(
				`╭━━━〔 📜 MUSA RULE 〕━━━╮
┃
${msg
	.split("\n")
	.filter(Boolean)
	.map(x => `┃ ${x}`)
	.join("\n")}
┃
╰━━━━━━━━━━━━━━━━━━━━╯`
			);
		}


		return message.SyntaxError();
	},


	/*
	 * REPLY HANDLER
	 */
	onReply: async function ({
		message,
		event,
		getLang,
		Reply
	}) {

		const {
			author,
			rulesOfThread
		} = Reply;

		if (
			author !== event.senderID
		)
			return;

		const num =
			parseInt(
				event.body || ""
			);

		if (
			isNaN(num) ||
			num < 1
		)
			return message.reply(
				getLang(
					"invalidNumberView"
				)
			);

		const totalRules =
			rulesOfThread.length;

		if (num > totalRules)
			return message.reply(
				getLang(
					"rulesNotExist",
					num
				)
			);

		await message.reply(
			`╭━━━〔 📜 MUSA RULE 〕━━━╮
┃
┃ ${num}. ${rulesOfThread[num - 1]}
┃
╰━━━━━━━━━━━━━━━━━━━━╯`
		);

		return message.unsend(
			Reply.messageID
		);
	},


	/*
	 * REACTION HANDLER
	 */
	onReaction: async function ({
		threadsData,
		message,
		Reaction,
		event,
		getLang
	}) {

		const {
			author
		} = Reaction;

		const {
			threadID,
			userID
		} = event;

		if (
			author !== userID
		)
			return;

		await threadsData.set(
			threadID,
			[],
			"data.rules"
		);

		return message.reply(
			`╭━━━〔 🗑️ MUSA RULES 〕━━━╮
┃
┃ ✅ সব Group Rules remove করা হয়েছে।
┃
╰━━━━━━━━━━━━━━━━━━━━╯`
		);
	}
};