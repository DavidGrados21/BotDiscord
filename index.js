require('dotenv').config();
require("./server"); // <-- NECESARIO PARA RENDER

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

client.once("clientReady", () => {
    console.log(`Bot conectado como ${client.user.tag}`);

    const SERVER_ID = "1380649990925451345";
    const CANAL_GENERAL = "1380649991755796516";

    const eventoMgr = new EventoManager(client, SERVER_ID);
    const mensajeMgr = new MensajeManager(client, CANAL_GENERAL);

    schedule.scheduleJob("*/10 * * * * *", async () => {

        const hoyMMDD = new Date().toISOString().slice(5, 10);
        const hoyYYYYMMDD = new Date().toISOString().slice(0, 10);

        const guild = client.guilds.cache.get(SERVER_ID);
        if (!guild) return console.log("❌ No se encontró el servidor.");

        for (const userId in listaCumples) {
            const p = listaCumples[userId];
            const mmdd = p.cumple.slice(5, 10);

            if (mmdd !== hoyMMDD) continue;

            const eventos = await guild.scheduledEvents.fetch();
            const nombreEvento = `🎂 Cumpleaños de ${p.nombre}`;
            const yaExiste = eventos.find(e => e.name === nombreEvento);

            if (!yaExiste && p.ultimoEvento === hoyYYYYMMDD) {
                console.log(`➡️ Reset: Se eliminó el evento manualmente, eliminando ultimoEvento.`);
                delete p.ultimoEvento;
                fs.writeFileSync("cumples.json", JSON.stringify(listaCumples, null, 2));
            }

            if (yaExiste) {
                console.log(`⚠️ El evento ya existe en Discord para ${p.nombre}.`);
                continue;
            }

            if (p.ultimoEvento === hoyYYYYMMDD) {
                console.log(`Evento de hoy para ${p.nombre} ya existe (JSON).`);
                continue;
            }

            console.log(`🎉 Hoy cumple ${p.nombre}, creando evento...`);
            await eventoMgr.crearEventoCumple(p.nombre);

            await mensajeMgr.enviarMensajeCumple(guild, userId, p.nombre);

            p.ultimoEvento = hoyYYYYMMDD;
            fs.writeFileSync("cumples.json", JSON.stringify(listaCumples, null, 2));

            console.log(`✔ Evento y mensaje creados para ${p.nombre}`);
        }
    });
});

client.login(process.env.DISCORD_BOT_TOKEN);

