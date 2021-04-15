// Dependecies
const { Structures } = require('discord.js'),
	sm = require('string-similarity');

module.exports = Structures.extend('Message', Message => {
	class CustomMessage extends Message {
		constructor(bot, data, channel) {
			super(bot, data, channel);
			// This for caching server settings
			this.args = [];
		}

		// mainly be used for fetch messages and then getting the args from it
		getArgs() {
			const args = this.content.split(' ');
			args.shift();
			if (this.content.startsWith(`<@!${this.client.user.id}>`)) args.shift();

			// append it to message structure
			this.args = args;
			return args;
		}

		// Get User from @ or ID
		getMember() {
			const users = [];
			// add all mentioned users
			for (let i = 0; i < this.args.length; i++) {
				if (this.guild.member(this.mentions.users.array()[i] || this.guild.members.cache.get(this.args[i]))) {
					users.push(this.guild.member(this.mentions.users.array()[i] || this.guild.members.cache.get(this.args[i])));
				}
			}
			// find user
			if (this.args[0]) {
				const members = [];
				const indexes = [];
				this.guild.members.cache.forEach(member => {
					members.push(member.user.username);
					indexes.push(member.id);
				});
				const match = sm.findBestMatch(this.args.join(' '), members);
				const username = match.bestMatch.target;
				const member = this.guild.members.cache.get(indexes[members.indexOf(username)]);
				users.push(member);
			}

			// add author at the end
			users.push(this.member);
			return users;
		}

		// Get image, from file download or avatar
		getImage() {
			const fileTypes = ['png', 'jpeg', 'tiff', 'jpg', 'webp'];
			// get image if there is one
			const file = [];
			// Check attachments
			if (this.attachments.size > 0) {
				const url = this.attachments.first().url;
				for (let i = 0; i < fileTypes.length; i++) {
					if (url.toLowerCase().indexOf(fileTypes[i]) !== -1) {
						file.push(url);
					}
				}
				// no file with the correct format was found
				if (file.length == 0) return this.channel.error(this.guild.settings.Language, 'IMAGE/INVALID_FILE').then(m => m.delete({ timeout: 10000 }));
			} else {
				file.push(...this.getMember().map(member => member.user.displayAvatarURL({ format: 'png', size: 1024 })));
			}
			return file;
		}
	}
	return CustomMessage;
});
