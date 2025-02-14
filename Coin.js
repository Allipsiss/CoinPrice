import fetch from "node-fetch";
import axios from "axios";
import { format } from 'date-fns-jalali';

// Function to convert digits to Farsi digits
function convertToFarsiDigits(number) {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return number.toString().replace(/\d/g, (digit) => farsiDigits[digit]);
}

// Convert the current date to a Farsi date
const farsiDate2 = format(new Date(), 'yyyy/MM/dd');
const farsiDate2Formatted = convertToFarsiDigits(farsiDate2);  // Convert digits to Farsi
console.log("Farsi Date:", farsiDate2Formatted);  // Log the Farsi date correctly

async function getCommodityPrices() {
    try {
        // Fetch commodity prices from the first API
        const response = await fetch("https://call1.tgju.org/ajax.json");
        const data = await response.json();

        // Extract prices for different commodities and divide by 10,000
        if (data && data.current) {
            // Convert price strings to numbers, divide by 10,000, and format with commas
            const formatNumber = (num) => new Intl.NumberFormat().format(num);

            const emamiPrice = data.current.sekee?.p ? convertToFarsiDigits(formatNumber(parseInt(data.current.sekee.p.replace(/,/g, "")) / 10000)) : 'N/A';
            const baharAzadiPrice = data.current.sekeb?.p ? convertToFarsiDigits(formatNumber(parseInt(data.current.sekeb.p.replace(/,/g, "")) / 10000)) : 'N/A';
            const nimSekePrice = data.current.nim?.p ? convertToFarsiDigits(formatNumber(parseInt(data.current.nim.p.replace(/,/g, "")) / 10000)) : 'N/A';
            const robSekePrice = data.current.rob?.p ? convertToFarsiDigits(formatNumber(parseInt(data.current.rob.p.replace(/,/g, "")) / 10000)) : 'N/A';

            // Farsi names for the coins
            const farsiCoinNames = {
                emami: "🏅 امامی",
                baharAzadi: "🥇 بهار آزادی",
                nimSeke: "🥈 نیم",
                robSeke: "🥉 ربع"
            };

            // Construct the header message with Farsi date and coin prices
            const headerMessage = `
            📅 *تاریخ امروز:* ${farsiDate2Formatted}\n\n
            🏅 *سکه امامی:* ${emamiPrice} تومان 💵\n
            🥇 *بهار آزادی:* ${baharAzadiPrice} تومان 💵\n
            🥈 *نیم سکه:* ${nimSekePrice} تومان 💵\n
            🥉 *ربع: سکه* ${robSekePrice} تومان 💵\n
            `;

            // Escape special characters for MarkdownV2
            const escapedMessage = headerMessage.replace(/([_*[\]()~`>#+\-=|{}.!$%^&:;,.?¿])/g, '\\$1');

            // Send the combined message to Telegram
            await sendMessageToTelegram(escapedMessage);
        } else {
            console.log("Price data not found!");
        }
    } catch (error) {
        console.error("Error fetching commodity prices:", error);
    }
}

async function sendMessageToTelegram(message) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;  // Replace with your actual bot token
    const chatId = process.env.TELEGRAM_CHAT_ID;      // Replace with your actual chat ID

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const params = {
        chat_id: chatId,
        text: message,
        parse_mode: "MarkdownV2"
    };

    try {
        await axios.post(url, params);
        console.log("Message sent to Telegram!");
    } catch (error) {
        console.error("Error sending message to Telegram:", error);
    }
}

// Run the function
getCommodityPrices();
