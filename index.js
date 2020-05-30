require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const request = require('request');

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
bot.on('ready', () => {
    bot.user.setActivity(`.help | Serving ${bot.guilds.size} servers`);
    console.log(`Logged in as ${bot.user.tag}!`);
    console.log('I am ready!');
    bot.user.setStatus("online");
});
bot.on("guildCreate", guild => {
    // This event triggers when the bot joins a guild.
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    bot.user.setActivity(`.help | Serving ${bot.guilds.size} servers`);
});

bot.on("guildDelete", guild => {
    // this event triggers when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    bot.user.setActivity(`.help | Serving ${bot.guilds.size} servers`);
});
// Create an event listener for messages
bot.on("message", async message => {
    if (message.author.bot) return;
    const prefix = '.';
    if (message.content.indexOf(prefix) !== 0) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    // If the message is "ping"
    if (command === 'help') {
        message.reply(`${message.author.username}`);
        const embedContent = {
            "title": "~Help~",
            "description": "CraftyBot Help Page",
            "url": "https://github.com/shiv213/CraftyBot",
            "color": 12995298,
            "footer": {
                "icon_url": "https://i.imgur.com/xk78Oek.png",
                "text": "Currently serving " + `${bot.guilds.size}` + " servers"
            },
            "thumbnail": {
                "url": "https://i.imgur.com/xk78Oek.png"
            },
            "author": {
                "name": "CraftBot",
                "url": "https://discordapp.com/oauth2/authorize?client_id=459064720985554945&scope=bot",
                "icon_url": "https://i.imgur.com/xk78Oek.png"
            },
            "fields": [{
                "name": ".invite",
                "value": "Displays CraftyBot invite link"
            },
                {
                    "name": ".purge (number of messages)",
                    "value": "Removes all messages from all users in the channel, up to 100"
                },
                // {
                //     "name": ".placeholder",
                //     "value": "placeholder"
                // },
                {
                    "name": ":revolving_hearts: Made with love by @shiv213#7699",
                    "value": "© CraftyBot"

                }
            ]
        };
        message.channel.send({embed: embedContent});

    }
    if (command === "say") {
        // makes the bot say something and delete the message. As an example, it's open to anyone to use.
        // To get the "message" itself we join the `args` back into a string with spaces:
        const sayMessage = args.join(" ");
        // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
        message.delete().catch(O_o => {
        });
        // And we get the bot to say the thing:
        message.channel.send(sayMessage);
    }
    if (command === 'xkcd') {
        let [comic, ...extra] = args;
        if (args[0] === undefined) {
            message.reply(`${message.author.username}, please specify a comic number after xkcd`);
        } else {
            message.reply(`${message.author.username}, here's xkcd comic number ${comic}.`);
            request('https://xkcd.com/' + args[0] + '/info.0.json', {json: true}, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }
                const embed = {
                    "title": (body.safe_title) + " - #" + args[0],
                    "description": (body.alt),
                    "color": 2216797,
                    "image": {
                        "url": (body.img)
                    }
                };
                message.channel.send({embed});

            });
        }
        console.log(extra);
    }
    if (command === "purge") {
        console.log(message.guild.roles.cache);
        if (!(message.guild.roles.cache.find(role => role.name === "Administrator")))
            return message.reply("Sorry, you don't have permissions to use this!");
        let [amount, ...extra] = args;
        if (!amount) return message.reply('You haven\'t given an amount of messages which should be deleted!'); // Checks if the `amount` parameter is given
        if (isNaN(parseInt(amount))) return message.reply('The amount parameter isn`t a number!'); // Checks if the `amount` parameter is a number. If not, the command throws an error

        if (amount > 100) return message.reply('You can`t delete more than 100 messages at once!'); // Checks if the `amount` integer is bigger than 100
        if (amount < 1) return message.reply('You have to delete at least 1 message!'); // Checks if the `amount` integer is smaller than 1

        await message.channel.messages.fetch({limit: amount}).then(messages => { // Fetches the messages
            message.channel.bulkDelete(messages // Bulk deletes all messages that have been fetched and are not older than 14 days (due to the Discord API)
            )
        });
    }
    // Voice only works in guilds, if the message does not come from a guild,
    // we ignore it
    if (!message.guild) return;
    if (command === 'invite') {
        message.channel.send(`${message.author.username}, you can invite CraftyBot to your own server with this link:`);
        message.channel.send(process.env.invite);
    }

    // if (command === 'join') {
    //     // Only try to join the sender's voice channel if they are in one themselves
    //     if (message.member.voiceChannel) {
    //         message.member.voiceChannel.join()
    //             .then(connection => { // Connection is an instance of VoiceConnection
    //                 message.reply('I have successfully connected to the channel!');
    //             })
    //             .catch(console.log);
    //     } else {
    //         message.reply('You need to join a voice channel first!');
    //     }
    // }

});

// Log our bot in
bot.login(process.env.TOKEN);
// client.login(process.env.tokenBoxie).catch(err => console.log(err));