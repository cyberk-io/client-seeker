const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');

// MongoDB configuration
const uri = 'mongodb+srv://rhass:rhass@cluster0.vq7bx.mongodb.net/';
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true, // Kích hoạt TLS
});
const db = client.db("datacrawl");

async function find(table, condition) {
    const collection = db.collection(table);
    return await collection.find(condition).toArray();
}

async function insertOne(table, record) {
    const collection = db.collection(table);
    return await collection.insertOne(record);
}

async function checkFundingVisible(query) {
    const funding = await find("rawDataFundraisingCryptorank", query);
    return funding.length;
}

function replaceAll(string) {
    return string
        .replace(/,| |&|\/|\.|-|:|\(|\)/g, "")
        .toLowerCase();
}

async function sendNotifi(data) {
    const url = `https://api.telegram.org/bot7817152536:AAE13NQsSje5TqQo6WKAqgLM0uw7VfhiqC0/sendMessage?chat_id=-4506326252&text=${data}`;
    await axios.get(url);
}

async function main() {
    try {
        await client.connect();

        while (true) {
            const urlFundraising = "https://api.cryptorank.io/v0/coins?withFundingRoundsData=true&lifeCycle=crowdsale,inactive,funding,scheduled,traded&locale=en&date=asc";
            const response = await axios.get(urlFundraising);
            const Fundraising = response.data;

            for (const data of Fundraising.data) {
                if (data.fundingRounds.length > 1) {
                    for (const rounds of data.fundingRounds) {
                        const newFundingRound = {
                            round_id: rounds.id,
                            data: JSON.stringify(rounds),
                            data_info: "fundraising",
                            data_type: "new",
                        };

                        const checkFunding = { round_id: rounds.id };

                        if (await checkFundingVisible(checkFunding) === 0) {
                            await insertOne("rawDataFundraisingCryptorank", newFundingRound);
                            await sendNotifi(JSON.stringify(rounds));
                            console.log("Insert: " + rounds.id);
                        }
                    }
                }
            }

            // Wait for 600 seconds before the next iteration
            await new Promise(resolve => setTimeout(resolve, 600000));
        }
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}

main();