import TelegramBot from "node-telegram-bot-api"
import axios from "axios";
import { CronJob } from "cron"
import dotenv from "dotenv"
import express from "express"

dotenv.config();

const app = express();
const bot = new TelegramBot(process.env.TOKEN_BOT, { polling: true });
const chatID = [];

const response = await axios.get("https://web-anime-psi.vercel.app/anime?page=1&type=ongoing");
let oldAnime = response.data.reverse();

async function getNewAnime() {
    const response = await axios.get("https://web-anime-psi.vercel.app/anime?page=1&type=ongoing");
    let newAnime = response.data.reverse();
    if(oldAnime.length > 0){
        for(const old of oldAnime){
            newAnime = newAnime.filter((anime) => anime.slug !== old.slug);
        }
    }
    oldAnime = response.data.reverse();
    chatID.forEach((id) => {
        newAnime.forEach((anime) => {
            bot.sendPhoto(id, `https://mangapi-man.vercel.app/gambar?url=${anime.gambar}`, {
                caption: `
                ${anime.judul} Episode ${anime.eps[1]}


https://animan.fun/anime/${anime.slug}
            `});
        })
    })
}

const job = new CronJob('0 0 0 * * *', getNewAnime, null, true, 'Asia/Jakarta');

bot.on("message", (msg) => {
    if (msg.text === "/start") {
        const id = msg.chat.id
        bot.sendMessage(id, `Selamat datang ${msg.chat.first_name} saya akan memberikan update anime setiap 1 hari sekali`)
        const checkId = chatID.filter((chat) => chat == id);
        if (checkId.length == 0) {
            chatID.push(id)
            console.log(`New user ${id}`)
        }
    }
})

app.get("*",(req,res) => {
    return res.json("success");
})

app.listen(8000,() => {
    console.log("Server on port 8000")
})

