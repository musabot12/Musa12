/**
 * @author NTKhang
 * @customized-by Atif Irfan Musa (MUSA BOT)
 *
 * Official source:
 * https://github.com/ntkhang03/Goat-Bot-V2
 *
 * MUSA BOT
 * GitHub: https://github.com/musabot12/musa-bot
 * Location: Bogura, Bangladesh
 * Class: 10 | Science
 * Single Life
 */

const { spawn } = require("child_process");
const log = require("./logger/log.js");

function startProject() {
	const child = spawn("node", ["EryXenX.js"], {
		cwd: __dirname,
		stdio: "inherit",
		shell: true
	});

	child.on("close", (code) => {
		if (code == 2) {
			log.info("MUSA BOT: Restarting Project...");
			startProject();
		}
	});
}

startProject();

const express = require("express");
const app = express();

app.get("/", (req, res) => {
	res.send(`
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<title>MUSA BOT</title>
			<style>
				body {
					margin: 0;
					min-height: 100vh;
					display: flex;
					align-items: center;
					justify-content: center;
					background: #080812;
					color: white;
					font-family: Arial, sans-serif;
					text-align: center;
				}
				.box {
					padding: 30px;
					border: 1px solid #00ffff;
					border-radius: 20px;
					box-shadow:
						0 0 15px #00ffff,
						0 0 35px #8a2be2;
				}
				h1 {
					margin: 0 0 10px;
					font-size: 32px;
				}
				p {
					opacity: .8;
				}
			</style>
		</head>
		<body>
			<div class="box">
				<h1>🤖 MUSA BOT</h1>
				<p>Bot is running successfully!</p>
				<p>Credit: Atif Irfan Musa</p>
			</div>
		</body>
		</html>
	`);
});

app.listen(3000, () => {
	console.log("🚀 MUSA BOT uptime server running on port 3000");
});