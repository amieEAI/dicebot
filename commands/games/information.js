// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const logger = require('../../providers/logger').scope('command', 'information');
const config = require('../../config');
const simpleFormat = require('../../util/simpleFormat');
const database = require('../../providers/database');

module.exports = class InformationCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'information',
      group: 'games',
      memberName: 'information',
      description: 'Get information on a user.',
      aliases: ['user-info', 'user-profile', 'profile', 'info', 'user-information'],
      examples: ['info', 'information PizzaFox'],
      clientPermissions: ['EMBED_LINKS'],
      args: [
        {
          key: 'user',
          prompt: 'Who\'s profile do you want to look up?',
          type: 'user',
          default: ''
        }
      ],
      throttling: {
        usages: 2,
        duration: 20
      }
    });
  }

  async run(msg, { user }) {
    try {
      msg.channel.startTyping();

      user = user || msg.author;

      // Make sure the target user isn't a bot (excluding the client)
      if (user.bot && user.id !== this.client.user.id) {
        return msg.reply('Bots can\'t play.');
      }

      const userBalance = await database.balances.get(user.id);
      const userProfilePicture = user.displayAvatarURL(128);
      let startingBalance;

      // Determine what the starting balance is for the requested user
      if (user.id === this.client.user.id) {
        startingBalance = config.houseStartingBalance;
      } else {
        startingBalance = config.newUserBalance;
      }

      logger.note('Target user display URL:', userProfilePicture);

      return msg.replyEmbed({
        title: user.tag,
        thumbnail: { url: userProfilePicture },
        fields: [
          {
            name: '💰 Total Profit',
            value: `${simpleFormat(userBalance - startingBalance).toLocaleString()} ${config.currency.plural}`,
            inline: true
          },
          {
            name: '🏦 Balance',
            value: `${userBalance.toLocaleString()} ${config.currency.plural}`,
            inline: true
          }
        ]
      });
    } finally {
      msg.channel.stopTyping();
    }
  }
};
