const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "admin",
		version: "1.6",
		author: "Atif Irfan Musa",
		countDown: 5,
		role: 2,
		description: {
			vi: "Quản lý quyền admin",
			en: "Manage admin roles",
			bn: "Admin role পরিচালনা করুন"
		},
		category: "box chat",
		guide: {
			vi: '   {pn} [add | -a] <uid | @tag>: Thêm quyền admin'
				+ '\n   {pn} [remove | -r] <uid | @tag>: Xóa quyền admin'
				+ '\n   {pn} [list | -l]: Liệt kê admin',
			en: '   {pn} [add | -a] <uid | @tag>: Add admin role'
				+ '\n   {pn} [remove | -r] <uid | @tag>: Remove admin role'
				+ '\n   {pn} [list | -l]: List all admins',
			bn: '   {pn} add <uid | @tag>: Admin role দিন'
				+ '\n   {pn} remove <uid | @tag>: Admin role সরান'
				+ '\n   {pn} list: সব Admin দেখুন'
		}
	},

	langs: {
		vi: {
			added: "👑 | Đã thêm quyền admin cho %1 người dùng:\n%2",
			alreadyAdmin: "\n⚠️ | %1 người dùng đã là admin:\n%2",
			missingIdAdd: "⚠️ | Vui lòng nhập ID hoặc tag người dùng muốn thêm admin",
			removed: "🗑️ | Đã xóa quyền admin của %1 người dùng:\n%2",
			notAdmin: "⚠️ | %1 người dùng không phải admin:\n%2",
			missingIdRemove: "⚠️ | Vui lòng nhập ID hoặc tag người dùng muốn xóa admin",
			listAdmin: "👑 | Danh sách admin MUSA BOT:\n%1"
		},

		en: {
			added: "👑 | MUSA BOT admin role added for %1 user(s):\n%2",
			alreadyAdmin: "\n⚠️ | %1 user(s) already have admin role:\n%2",
			missingIdAdd: "⚠️ | Please enter a user ID or tag to add admin role.",
			removed: "🗑️ | MUSA BOT admin role removed from %1 user(s):\n%2",
			notAdmin: "⚠️ | %1 user(s) don't have admin role:\n%2",
			missingIdRemove: "⚠️ | Please enter a user ID or tag to remove admin role.",
			listAdmin: "👑 | MUSA BOT Admin List:\n%1"
		},

		tl: {
			added: "👑 | Naidagdag ang MUSA BOT admin role para sa %1 user:\n%2",
			alreadyAdmin: "\n⚠️ | %1 user ay admin na:\n%2",
			missingIdAdd: "⚠️ | Maglagay ng ID o mag-tag ng user para magdagdag ng admin",
			removed: "🗑️ | Naalis ang MUSA BOT admin role ng %1 user:\n%2",
			notAdmin: "⚠️ | %1 user ay hindi admin:\n%2",
			missingIdRemove: "⚠️ | Maglagay ng ID o mag-tag ng user para alisin ang admin",
			listAdmin: "👑 | MUSA BOT Admin List:\n%1"
		},

		hi: {
			added: "👑 | %1 users ko MUSA BOT admin role de diya gaya:\n%2",
			alreadyAdmin: "\n⚠️ | %1 users pehle se admin hain:\n%2",
			missingIdAdd: "⚠️ | Admin role dene ke liye ID dalein ya user ko tag karein",
			removed: "🗑️ | %1 users ka MUSA BOT admin role hata diya gaya:\n%2",
			notAdmin: "⚠️ | %1 users admin nahi hain:\n%2",
			missingIdRemove: "⚠️ | Admin role hatane ke liye ID dalein ya user ko tag karein",
			listAdmin: "👑 | MUSA BOT Admin List:\n%1"
		},

		ar: {
			added: "👑 | تمت إضافة دور المسؤول في MUSA BOT لـ %1 مستخدم:\n%2",
			alreadyAdmin: "\n⚠️ | %1 مستخدم لديهم بالفعل صلاحية المسؤول:\n%2",
			missingIdAdd: "⚠️ | الرجاء إدخال ID أو وضع علامة على المستخدم",
			removed: "🗑️ | تمت إزالة صلاحية المسؤول من %1 مستخدم:\n%2",
			notAdmin: "⚠️ | %1 مستخدم ليس لديهم صلاحية المسؤول:\n%2",
			missingIdRemove: "⚠️ | الرجاء إدخال ID أو وضع علامة على المستخدم",
			listAdmin: "👑 | قائمة مسؤولي MUSA BOT:\n%1"
		},

		bn: {
			added: "👑 | MUSA BOT-এর Admin Role %1 জনকে দেওয়া হয়েছে:\n%2",
			alreadyAdmin: "\n⚠️ | %1 জনের আগে থেকেই Admin Role আছে:\n%2",
			missingIdAdd: "⚠️ | Admin Role দিতে User ID দিন অথবা User-কে Tag করুন।",
			removed: "🗑️ | %1 জনের Admin Role সরিয়ে দেওয়া হয়েছে:\n%2",
			notAdmin: "⚠️ | %1 জনের Admin Role নেই:\n%2",
			missingIdRemove: "⚠️ | Admin Role সরাতে User ID দিন অথবা User-কে Tag করুন।",
			listAdmin: "👑 | MUSA BOT-এর Admin List:\n%1"
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {

		switch (args[0]) {

			// =========================
			// ADD ADMIN
			// =========================
			case "add":
			case "-a": {

				if (args[1]) {

					let uids = [];

					if (Object.keys(event.mentions).length > 0) {
						uids = Object.keys(event.mentions);
					}
					else if (event.messageReply) {
						uids.push(event.messageReply.senderID);
					}
					else {
						uids = args.filter(arg => !isNaN(arg));
					}

					const notAdminIds = [];
					const adminIds = [];

					for (const uid of uids) {
						if (config.adminBot.includes(uid))
							adminIds.push(uid);
						else
							notAdminIds.push(uid);
					}

					config.adminBot.push(...notAdminIds);

					const getNames = await Promise.all(
						uids.map(uid =>
							usersData
								.getName(uid)
								.then(name => ({ uid, name }))
						)
					);

					writeFileSync(
						global.client.dirConfig,
						JSON.stringify(config, null, 2)
					);

					return message.reply(
						(notAdminIds.length > 0
							? getLang(
								"added",
								notAdminIds.length,
								getNames
									.filter(({ uid }) => notAdminIds.includes(uid))
									.map(({ uid, name }) => `• ${name} (${uid})`)
									.join("\n")
							)
							: "")
						+
						(adminIds.length > 0
							? getLang(
								"alreadyAdmin",
								adminIds.length,
								adminIds
									.map(uid => `• ${uid}`)
									.join("\n")
							)
							: "")
					);
				}

				return message.reply(getLang("missingIdAdd"));
			}


			// =========================
			// REMOVE ADMIN
			// =========================
			case "remove":
			case "-r": {

				if (args[1]) {

					let uids = [];

					if (Object.keys(event.mentions).length > 0) {
						uids = Object.keys(event.mentions);
					}
					else {
						uids = args.filter(arg => !isNaN(arg));
					}

					const notAdminIds = [];
					const adminIds = [];

					for (const uid of uids) {
						if (config.adminBot.includes(uid))
							adminIds.push(uid);
						else
							notAdminIds.push(uid);
					}

					for (const uid of adminIds) {
						const index = config.adminBot.indexOf(uid);

						if (index !== -1) {
							config.adminBot.splice(index, 1);
						}
					}

					const getNames = await Promise.all(
						adminIds.map(uid =>
							usersData
								.getName(uid)
								.then(name => ({ uid, name }))
						)
					);

					writeFileSync(
						global.client.dirConfig,
						JSON.stringify(config, null, 2)
					);

					return message.reply(
						(adminIds.length > 0
							? getLang(
								"removed",
								adminIds.length,
								getNames
									.map(({ uid, name }) => `• ${name} (${uid})`)
									.join("\n")
							)
							: "")
						+
						(notAdminIds.length > 0
							? getLang(
								"notAdmin",
								notAdminIds.length,
								notAdminIds
									.map(uid => `• ${uid}`)
									.join("\n")
							)
							: "")
					);
				}

				return message.reply(getLang("missingIdRemove"));
			}


			// =========================
			// ADMIN LIST
			// =========================
			case "list":
			case "-l": {

				const getNames = await Promise.all(
					config.adminBot.map(uid =>
						usersData
							.getName(uid)
							.then(name => ({ uid, name }))
					)
				);

				return message.reply(
					getLang(
						"listAdmin",
						getNames
							.map(({ uid, name }) => `• ${name} (${uid})`)
							.join("\n")
					)
				);
			}


			// =========================
			// INVALID COMMAND
			// =========================
			default:
				return message.SyntaxError();
		}
	}
};