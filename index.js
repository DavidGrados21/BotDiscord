const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const schedule = require("node-schedule");

// Managers
const EventoManager = require("./EventoManager");
const MensajeManager = require("./MensajeManager");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Cargar lista de cumpleaños
let listaCumples = {};
if (fs.existsSync("cumples.json")) {
    listaCumples = JSON.parse(fs.readFileSync("cumples.json"));
}

client.once("ready", () => {
    console.log(`Bot conectado como ${client.user.tag}`);

    // ⚠️ PON AQUÍ TU SERVIDOR Y CANAL
    const SERVER_ID = "1380649990925451345";
    const CANAL_GENERAL = "1380649991755796516";

    const eventoMgr = new EventoManager(client, SERVER_ID);
    const mensajeMgr = new MensajeManager(client, CANAL_GENERAL);

    // Cada 10 segundos para pruebas
    schedule.scheduleJob("*/10 * * * * *", async () => {

        const hoyMMDD = new Date().toISOString().slice(5, 10);
        const hoyYYYYMMDD = new Date().toISOString().slice(0, 10);

        const guild = client.guilds.cache.get(SERVER_ID);
        if (!guild) return console.log("❌ No se encontró el servidor.");

        for (const userId in listaCumples) {
            const p = listaCumples[userId];
            const mmdd = p.cumple.slice(5, 10);

            if (mmdd !== hoyMMDD) continue;

            // --------------------------------------------
            // 1️⃣ Obtener eventos del servidor
            const eventos = await guild.scheduledEvents.fetch();
            const nombreEvento = `🎂 Cumpleaños de ${p.nombre}`;
            const yaExiste = eventos.find(e => e.name === nombreEvento);

            // --------------------------------------------
            // 2️⃣ Si el JSON dice que ya se creó, pero el evento NO existe → resetear
            if (!yaExiste && p.ultimoEvento === hoyYYYYMMDD) {
                console.log(`➡️ Reset: Se eliminó el evento manualmente, eliminando ultimoEvento.`);
                delete p.ultimoEvento;
                fs.writeFileSync("cumples.json", JSON.stringify(listaCumples, null, 2));
            }

            // --------------------------------------------
            // 3️⃣ Si ya existe en Discord → no crear otro
            if (yaExiste) {
                console.log(`⚠️ El evento ya existe en Discord para ${p.nombre}.`);
                continue;
            }

            // --------------------------------------------
            // 4️⃣ Si JSON dice que ya se creó → evitar duplicado
            if (p.ultimoEvento === hoyYYYYMMDD) {
                console.log(`Evento de hoy para ${p.nombre} ya existe (JSON).`);
                continue;
            }

            // --------------------------------------------
            // 5️⃣ Crear evento
            console.log(`🎉 Hoy cumple ${p.nombre}, creando evento...`);
            await eventoMgr.crearEventoCumple(p.nombre);

            // --------------------------------------------
            // 6️⃣ Enviar mensaje al canal
            await mensajeMgr.enviarMensajeCumple(guild, userId, p.nombre);

            // --------------------------------------------
            // 7️⃣ Guardar en JSON
            p.ultimoEvento = hoyYYYYMMDD;
            fs.writeFileSync("cumples.json", JSON.stringify(listaCumples, null, 2));

            console.log(`✔ Evento y mensaje creados para ${p.nombre}`);
        }
    });
});

require('dotenv').config(); 

client.login(process.env.DISCORD_BOT_TOKEN);
