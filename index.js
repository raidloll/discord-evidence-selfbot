
const { Client, GatewayIntentBits } = require('@discordjs');
const fs = require('fs');
const moment = require('moment');

// Insert your user token here
const TOKEN = 'YOUR_TOKEN_HERE';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    ws: { properties: { browser: "Discord iOS" } }
});

const suspiciousKeywords = ['age', 'pic', 'snapchat', 'secret', 'groom', 'dm me', 'are you alone', 'nsfw'];

function logMessage(message) {
    const time = moment().format('YYYY-MM-DD HH:mm:ss');
    const log = `[${time}] (${message.guild ? message.guild.name : 'DM'}) ${message.author.tag}: ${message.content}\n`;
    console.log(log);
    fs.appendFileSync('logs/evidence.log', log);
}

client.on('messageCreate', async message => {
    if (message.author.id === client.user.id) return; // Ignore self

    const contentLower = message.content.toLowerCase();
    const matched = suspiciousKeywords.some(k => contentLower.includes(k));

    if (matched) {
        logMessage(message);
        if (message.attachments.size > 0) {
            message.attachments.forEach(attachment => {
                const filename = `logs/${moment().format('YYYY-MM-DD_HH-mm-ss')}_${attachment.name}`;
                fetch(attachment.url).then(res => {
                    const dest = fs.createWriteStream(filename);
                    res.body.pipe(dest);
                });
            });
        }
    }
});

client.once('ready', () => {
    console.log(`Selfbot active as ${client.user.tag}`);
});

client.login(TOKEN);