import puppeteer from 'puppeteer'
import { config } from 'dotenv'
import { contacts } from './contacts'

config()
const establishConnection = async () => {
    try {
        const browser = await puppeteer.connect({
            browserWSEndpoint: process.env.wsPath,
        })
        const page = await browser.newPage()
        // await page.setViewport({ width: 250, height: 250 })
        return page
    } catch (e) {
        console.error('Error in establishing connection')
    }
}

const visitPage = async (page) => {
    try {
        await page.goto(process.env.URL, {
            waitUntil: 'networkidle0',
            timeout: 0,
        })
    } catch (e) {
        console.error('Error in visiting pages')
    }
}

const sendMessage = async (page, name, message) => {
    try {
        await page.waitForSelector('._3xpD_') // Wait for Search tab to load
        await page.focus('[data-tab="3"]') // focus on the Search tag where Contact Name has to  be typed
        await page.keyboard.type(name, { delay: 1 }) // After focusing type the contact name
        await page.focus('[aria-label="Search results."]') // Wait for Search result of Contacts to load
        // await page.waitFor(5000);
        await page.keyboard.press('Enter') // Press Enter and open the chat
        await page.waitForSelector('header') // Wait for the chat to open (i.e : header is where the name is loaded on the right side where chat happens)
        await page.focus('[data-tab="1"]') // focus on tag where text will be typed
        await page.keyboard.type(message, { delay: 1 }) // Type the msg.
        await page.keyboard.press('Enter') // Press enter to send the msg
    } catch (e) {
        console.error(`error in accessing dom${e}`)
    }
}
const whatsUp = async () => {
    try {
        const page = await establishConnection()
        await visitPage(page)
        const mapSeries = async (iterable, action) => {
            // eslint-disable-next-line no-restricted-syntax
            for (const { name, message } of iterable) {
                // eslint-disable-next-line no-await-in-loop
                await action(page, name, message)
            }
        }
        await mapSeries(contacts, sendMessage)
        await page.close()
    } catch (e) {
        console.error(`An error occured ${e}`)
    }
}
whatsUp()
