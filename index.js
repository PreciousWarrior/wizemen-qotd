import axios from "axios"
import cheerio from "cheerio"
import * as dotenv from 'dotenv'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

// Jugaad to properly set the current directory when it is loaded from CRON
// https://stackoverflow.com/a/50052194
// https://stackoverflow.com/a/50052194
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({path: __dirname + '/.env'})

async function scrape(){
    const response = await axios.post("https://psn.wizemen.net/homecontrollers/login/validateUser", {captcha: "", emailid: process.env.EMAIL , int_cnt: "0", pwd: process.env.PASSWORD, rememberMe: true, schoolCode: "PSN", schoolName: "Pathways School Noida"})
    const cookie = response.headers["set-cookie"][0]
    const sessionId = cookie.split(";")[0]
    const webpageResponse = await axios.get("https://psn.wizemen.net/launchpadnew", {headers: {"Cookie": sessionId}})
    const $ = cheerio.load(webpageResponse.data);
    const quoteText = $(".quoteday").text()
    const quote = quoteText.split("\n")[2].trim()
    const author = quoteText.split("\n")[4].trim()
    const webhook = process.env.WEBHOOK;
    await axios.post(webhook, {content: `> ${quote}\n${author}`})
}
scrape()
