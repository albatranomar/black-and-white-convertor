const { Client, MessageAttachment, Intents } = require('discord.js');
const Jimp = require('jimp');
const config = require('./config.json');

let client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
    ],
    partials: ['MESSAGE']
});

client.on('ready', nclient => {
    client = nclient;

    console.log(`Logged in ${client.user.tag}!`);
});


client.on('messageCreate', async message => {
    if (message.author.bot) return;
    const [commandName, imageURL] = message.content.slice(config.prefix.length).trim().split(/ /g);
    if (commandName == `tbaw`) {
        if (imageURL) {
            let image = await Jimp.read(imageURL);
            let blackAndWhite = await image.greyscale().getBufferAsync(image.getMIME());

            var attachment = new MessageAttachment(blackAndWhite, 'generatedImage.png');

            message.channel.send({
                files: [attachment]
            })
        } else {
            let collector = message.channel.createMessageCollector({
                filter: (m) => m.author.id == message.author.id,
                time: 15 * 1000
            });

            collector.on('collect', async msg => {
                if (msg.attachments && msg.attachments.size > 0) {
                    let generatedImages = await Promise.all(msg.attachments.map(a => a).map(async attachment => {
                        let image = await Jimp.read(attachment.url);
                        let blackAndWhite = await image.greyscale().getBufferAsync(image.getMIME());
                        return new MessageAttachment(blackAndWhite, `${attachment.name}`);
                    }));

                    await message.channel.send({
                        files: generatedImages
                    })
                }
            });
        }
    }

});


client.login(config.token);
