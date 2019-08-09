const Discord = require('discord.js');
const token = require('./token.json');
const botconfig = require('./botconfig.json');
const sqlite3 = require('sqlite3').verbose();

const client = new Discord.Client();

function exitHandler(options, exitCode) {
    if (options.cleanup) {
        console.log('Cosing database');
        db.close();
        console.log('Database closed.');
    }
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}

// Prevent the program from closing instantly
process.stdin.resume();

// Do something when app is closing
process.on('exit', exitHandler.bind(null, {cleanup: true}));

// Catch ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit: true}));

// Catch "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit: true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit: true}));

// Catch uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit: true}));


let db = new sqlite3.Database('./reminders.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to SQlite database.');
});

// Attempt to locate the "reminders" table, and if it doesn't exist already, create a new table.
db.all('SELECT name FROM sqlite_master WHERE type=? AND name=?', ['table', 'reminders'], (err, rows) => {
    if (err) {
        console.error(err.message);
        return;
    }

    if (rows.length === 0)
    {
        console.log('Reminders table does not exist. Creating.');

        db.run('CREATE TABLE reminders ('
            + 'guildId varchar, '
            + 'channelId varchar, '
            + 'messageId varchar, '
            + 'userId varchar, '
            + 'message varchar, '
            + 'request datetime, '
            + 'response datetime)', (err) => {
            if (err)
            {
                return console.error(err.message);
            }
        });

        db.all('SELECT name FROM sqlite_master WHERE type=? AND name=?', ['table', 'reminders'], (err, rows) => {
            if (err) {
                console.error(err.message);
                return;
            }

            if (rows.length === 0)
            {
                console.error('Unable to create reminders table');
            }
        });
    }
});

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {

    let guildId = '@me';
    let channelId = message.channel.id;
    let userId = message.author.id;

    if (message.channel.type !== 'dm')
        guildId = message.guild.id;

    if (message.content.toLowerCase().startsWith(botconfig.command + botconfig.postfix)) {
        console.log('RemindMe!');
        // TODO: Parse message.content for future date
        // TODO: Add current date to parsed future date
        // TODO: Store date in table

        // When responding, use this URL format:
        //    http://discordapp.com/channels/__GUILD_ID__/__CHANNEL__ID__/__MESSAGE__ID__
        // When responding to DM, use this URL format:
        //    http://discordapp.com/channels/@me/__CHANNEL__ID__/__MESSAGE__ID__
    }
});

// TODO: Need a timeout event to run every so often and search for messages to send

// Invite URL: https://discordapp.com/oauth2/authorize?&client_id=609445343133827073&scope=bot&permissions=0
// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login(token.token);
