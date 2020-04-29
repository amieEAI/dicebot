import {AkairoModule, Argument, Command, Inhibitor, Listener} from 'discord-akairo';
import {codeblock} from 'discord-md-tags';
import {Message} from 'discord.js';
import {ArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {DiceListener} from '../../structures/DiceListener';
import {startTimer} from '../../util/timer';
import ms = require('pretty-ms');

type DiceModule = AkairoModule | DiceCommand | Inhibitor | DiceListener;

export default class ReloadCommand extends DiceCommand {
	constructor() {
		super('reload', {
			aliases: ['reload-module', 'reload-command', 'reload-listener', 'reload-inhibitor'],
			description: {content: 'Reload a module (command, listener, or inhibitor).', usage: '<module>', examples: ['ping']},
			category: DiceCommandCategories.Admin,
			ownerOnly: true,
			args: [
				{
					id: 'module',
					type: Argument.union(
						// Commands have their ID as an alias, so no need to add the command type in here
						ArgumentType.CommandAlias,
						ArgumentType.Listener,
						ArgumentType.Inhibitor
					),
					match: 'content',
					prompt: {start: 'Which module do you want to reload?', retry: 'Invalid module provided, try again'}
				}
			]
		});
	}

	public async exec(message: Message, args: {module: DiceModule}): Promise<Message | undefined> {
		const endTimer = startTimer();

		let reloaded: DiceModule;
		try {
			reloaded = args.module.reload();
		} catch (error) {
			// eslint-disable-next-line no-return-await
			return await message.util?.send(['An error occurred while reloading', codeblock`${error}`].join('\n'));
		}

		const elapsed = endTimer();

		let type = 'module';

		if (reloaded instanceof Command) {
			type = 'command';
		} else if (reloaded instanceof Listener) {
			type = 'listener';
		} else if (reloaded instanceof Inhibitor) {
			type = 'inhibitor';
		}

		return message.util?.send(`Reloaded ${type} \`${reloaded.categoryID}:${reloaded.id}\` in ${ms(elapsed)}`);
	}
}