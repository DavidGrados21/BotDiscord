const { EmbedBuilder } = require("discord.js");

class MensajeManager {

    constructor(client, canalId) {
        this.client = client;
        this.canalId = canalId;
    }

    async enviarMensajeCumple(guild, userId, nombre) {
        try {
            const canal = guild.channels.cache.get(this.canalId);
            if (!canal) {
                console.log("❌ No se encontró el canal para enviar el mensaje.");
                return;
            }

            // 1️⃣ Mensaje previo con mención
            await canal.send(`¡Feliz cumpleaños <@${userId}>! 🎉`);

            // 2️⃣ Embed sin título
            const embed = new EmbedBuilder()
                .setDescription(
                    `**Felicidades a esta persona especial que hoy está celebrando su cumpleaños junto a la familia Temulandia.**\n\n` +
                    `Recuerden Ir al canal para Felicitarle : <#1438759713293598811>`
                )
                .setColor(0xF7A531)
                .setImage("https://cdn.nekotina.com/guilds/767798812705423370/3a23cce7-6ea2-469a-ace6-408ce34c50f8.jpg");

            await canal.send({ embeds: [embed] });

            console.log("📨 Mensaje de cumpleaños enviado sin título en el embed.");

        } catch (error) {
            console.error("❌ Error enviando mensaje:", error);
        }
    }
}

module.exports = MensajeManager;
