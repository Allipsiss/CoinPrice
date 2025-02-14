import fetch from "node-fetch";
import axios from "axios";

async function getCommodityPrices() {
    try {
        // Fetch commodity prices from the first API
        const response = await fetch("https://call1.tgju.org/ajax.json");
        const data = await response.json();

        // Extract the Farsi date from the first API (commodity prices)
        const farsiDate = data.current.retail_gerami?.t || "Date not available";  // Use the date from API or a fallback message

        // Fetch current Farsi date from the second API (Keybit API)
        const timeResponse = await fetch("https://api.keybit.ir/time/");
        const timeData = await timeResponse.json();
        const farsiCurrentDate = ".date.full.official.iso.fa" || "Date not available";  // Extract the Farsi date

        // Extract prices for different commodities and divide by 10,000
        if (data && data.current) {
            // Convert price strings to numbers, divide by 10,000, and format with commas
            const formatNumber = (num) => new Intl.NumberFormat().format(num);

            const emamiPrice = formatNumber(parseInt(data.current.sekee?.p.replace(/,/g, "")) / 10000);
            const baharAzadiPrice = formatNumber(parseInt(data.current.sekeb?.p.replace(/,/g, "")) / 10000);
            const nimSekePrice = formatNumber(parseInt(data.current.nim?.p.replace(/,/g, "")) / 10000);
            const robSekePrice = formatNumber(parseInt(data.current.rob?.p.replace(/,/g, "")) / 10000);

            // Farsi names for the coins
            const farsiCoinNames = {
                emami: "🏅 امامی",
                baharAzadi: "🥇 بهار آزادی",
                nimSeke: "🥈 نیم",
                robSeke: "🥉 ربع"
            };

            let priceMessages = [];

            // Add the Farsi date from the Keybit API and the Farsi names of the coins at the beginning of the message
            const headerMessage = `تاریخ امروز: ${farsiCurrentDate}\n\n` +
                                  `${farsiCoinNames.emami}: ${emamiPrice} تومان\n` +
                                  `${farsiCoinNames.baharAzadi}: ${baharAzadiPrice} تومان\n` +
                                  `${farsiCoinNames.nimSeke}: ${nimSekePrice} تومان\n` +
                                  `${farsiCoinNames.robSeke}: ${robSekePrice} تومان\n`;

            // Send the combined message to Telegram
            await sendMessageToTelegram(headerMessage);

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
        text: message
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
