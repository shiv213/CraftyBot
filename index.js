const Discord = require('discord.js');
const fs = require('fs');
require('dotenv').config();
const request = require('request');
const {prefix} = require('./config.json');
const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    client.user.setPresence({
        activity: {name: `.help | Serving ${client.guilds.cache.size} servers`},
        status: 'online'
    }).catch(console.error);
    console.log(`Logged in as ${client.user.tag}!`);
    console.log('Ready!');
});

client.on("guildCreate", guild => {
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setPresence({
        activity: {name: `.help | Serving ${client.guilds.cache.size} servers`},
        status: 'online'
    }).catch(console.error);
});

client.on("guildDelete", guild => {
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    client.user.setPresence({
        activity: {name: `.help | Serving ${client.guilds.cache.size} servers`},
        status: 'online'
    }).catch(console.error);
});

client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === 'logging');
    if (!channel) return;
    channel.send(`Welcome to the server, ${member}!`);
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;
    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('I can\'t execute that command inside DMs!');
    }
    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;
        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }
        return message.channel.send(reply);
    }
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 0) * 1000;
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.login(process.env.TOKEN).catch(err => console.log(err));
const cliArgs = process.argv.slice(2);
if (cliArgs[0] === "test") {
    console.log("everything working!");
    process.exit(0);
}

//
// // Create an event listener for messages
// client.on("message", async message => {
//     const prefix = '.';
//     if (message.content.indexOf(prefix) !== 0) return;
//     const args = message.content.slice(prefix.length).trim().split(/ +/g);
//     const command = args.shift().toLowerCase();
//     // If the message is "ping"
//     if (command === 'help') {
//     }
//     if (command === "say") {
//         if (!(message.guild.roles.cache.find(role => role.name === "Administrator")))
//             return message.reply("Sorry, you don't have permissions to use this!");
//         // makes the bot say something and delete the message. As an example, it's open to anyone to use.
//         // To get the "message" itself we join the `args` back into a string with spaces:
//         const sayMessage = args.join(" ");
//         // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
//         message.delete().catch(O_o => {
//         });
//         // And we get the bot to say the thing:
//         message.channel.send(sayMessage);
//     }
//     if (command === 'xkcd') {
//         let [comic, ...extra] = args;
//         if (args[0] === undefined) {
//             message.reply(`${message.author.username}, please specify a comic number after xkcd`);
//         } else {
//             message.reply(`${message.author.username}, here's xkcd comic number ${comic}.`);
//             request('https://xkcd.com/' + args[0] + '/info.0.json', {json: true}, (err, res, body) => {
//                 if (err) {
//                     return console.log(err);
//                 }
//                 const embed = {
//                     "title": (body.safe_title) + " - #" + args[0],
//                     "description": (body.alt),
//                     "color": 2216797,
//                     "image": {
//                         "url": (body.img)
//                     }
//                 };
//                 message.channel.send({embed});
//
//             });
//         }
//         console.log(extra);
//     }
//     if (command === "purge") {
//         if (!(message.guild.roles.cache.find(role => role.name === "Administrator")))
//             return message.reply("Sorry, you don't have permissions to use this!");
//         let [amount, ...extra] = args;
//         if (!amount) return message.reply('You haven\'t given an amount of messages which should be deleted!'); // Checks if the `amount` parameter is given
//         if (isNaN(parseInt(amount))) return message.reply('The amount parameter isn`t a number!'); // Checks if the `amount` parameter is a number. If not, the command throws an error
//
//         if (amount > 100) return message.reply('You can`t delete more than 100 messages at once!'); // Checks if the `amount` integer is bigger than 100
//         if (amount < 1) return message.reply('You have to delete at least 1 message!'); // Checks if the `amount` integer is smaller than 1
//
//         await message.channel.messages.fetch({limit: amount}).then(messages => { // Fetches the messages
//             message.channel.bulkDelete(messages // Bulk deletes all messages that have been fetched and are not older than 14 days (due to the Discord API)
//             )
//         });
//     }
//     // Voice only works in guilds, if the message does not come from a guild,
//     // we ignore it
//     if (!message.guild) return;
//     if (command === 'invite') {
//         message.channel.send(`${message.author.username}, you can invite CraftyBot to your own server with this link:`);
//         message.channel.send(process.env.invite);
//     }
//
//     // if (command === 'join') {
//     //     // Only try to join the sender's voice channel if they are in one themselves
//     //     if (message.member.voiceChannel) {
//     //         message.member.voiceChannel.join()
//     //             .then(connection => { // Connection is an instance of VoiceConnection
//     //                 message.reply('I have successfully connected to the channel!');
//     //             })
//     //             .catch(console.log);
//     //     } else {
//     //         message.reply('You need to join a voice channel first!');
//     //     }
//     // }
//
// });
