const schedule = require("node-schedule");

class EventoManager {
    constructor(client, guildId) {
        this.client = client;
        this.guildId = guildId;
    }

    async crearEventoCumple(nombre) {
        const guild = this.client.guilds.cache.get(this.guildId);
        if (!guild) return console.log("❌ Guild no encontrada.");

        const start = new Date(Date.now() + 60 * 1000);  // inicia en 1 minuto
        const end = new Date(start.getTime() + 24 * 60 * 60 * 1000); // dura 1 día

        const evento = await guild.scheduledEvents.create({
            name: `🎂 Cumpleaños de ${nombre}`,
            scheduledStartTime: start,
            scheduledEndTime: end,
            privacyLevel: 2,
            entityType: 3,
            entityMetadata: { location: "Discord" },
            description: `¡Hoy es el cumpleaños de ${nombre}! 🎉`
        });

        console.log("Evento creado:", evento.id);

        // borrar al finalizar
        schedule.scheduleJob(end, () => evento.delete());

        return evento.id;
    }
}

module.exports = EventoManager;
