const puppeteer = require('puppeteer');
const fs = require('fs');
const url = '';
const scrape = async (users) => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    let data = [];
    for (let user of users) {
        await page.goto(url);
        await page.waitFor(1000);

        if (await page.$('#searchRes > .cont-fc > .fc') !== null) {
            await Promise.all([
                page.waitForNavigation({ delay: 0 }),
                page.click('#searchRes > .cont-fc > .fc'),
            ]);

            const score = await page.evaluate(() => {
                const td = document.querySelector('#content > div > div.mbz.ipitra > div > table > tbody > tr:nth-child(1) > td:nth-child(2)');
                let value = td ? td.innerText : 'n/a';
                return value;
            });

            data.push({ ...user, score });
        } else {
            data.push({ ...user, score: 'n/a' });
        }
    }

    browser.close();
    return data;
};

const origNames = [];
const names = origNames.map(name => {
    const split = name.split(' ');
    return {
        first: split[0],
        last: split[split.length - 1]
    }
});


async function execute() {
    const result = await scrape(names);
    const mappedResult = result.sort((a, b) => {
        if (a.score === 'n/a') {
            return 1;
        } else if (b.score === 'n/a') {
            return -1;
        }
        return a.score < b.score ? 1 : -1 ;
    }).map((runner, i) => {
        return {
            rank: i + 1,
            name: `${runner.first} ${runner.last}`,
            itraScore: runner.score
        }
    });

    console.log(mappedResult);
    fs.writeFileSync('result.json', JSON.stringify(mappedResult), 'utf8');
}
execute();