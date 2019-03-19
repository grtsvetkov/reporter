const text = require('./texts.js');

const puppeteer = require('puppeteer');
const delay = time => new Promise(resolve => setTimeout(resolve, time)),
    rfa = arr => arr[Math.floor(Math.random() * (arr.length))]; //Random From Array

const puppeteer_options = {
        headless: true
    },

    planfix = {

        auth: {
            url: 'https://ibrush.planfix.ru/',
            data: {
                '#tbUserName': 'gr.tsvetkov@gmail.com',
                '#tbUserPassword': 'dtkjcbgtl'
            },
            selector: '.lf-btn'
        },

        report: {
            url: 'https://ibrush.planfix.ru/?action=report&id=529086&returnurl=&run=1',
            delay: 6000,
            pdf: {
                path: './report/test.pdf',
                format: 'A4'
            },
            removeBySelector: '.main-menu, .b-top-btn, .b-before-green-block, .b-green-block',
            expandSelector: '.report-head-expander'
        }
    };

console.log(rfa(text.title[0]) + rfa(text.title[1]) + rfa(text.title[2]));

process.exit();

(async() => {
    const browser = await puppeteer.launch(puppeteer_options);

    const page = await browser.newPage();
    await page.setViewport({width: 1980, height: 1080});

    // AUTH
    await page.goto(planfix.auth.url);
    for (let key of Object.keys(planfix.auth.data)) {
        await page.type(key, planfix.auth.data[key]);
    }
    await page.click(planfix.auth.selector);
    await page.waitForNavigation();

    // AUTH

    //REPORT
    await page.goto(planfix.report.url);
    await delay(planfix.report.delay);

    await page.evaluate((sel) => {
        var elements = document.querySelectorAll(sel);
        for (var i = 0; i < elements.length; i++) {
            elements[i].parentNode.removeChild(elements[i]);
        }
    }, planfix.report.removeBySelector);

    await page.click(planfix.report.expandSelector);

    const total = await page.evaluate(() => parseFloat(document.querySelector('tr.tr-report-total > td:nth-child(4) > span:nth-child(3)').innerText));

    const projects = await page.evaluate(() => {

        let projects = [];
        document.querySelectorAll('.tr-report-group > td:nth-child(2)').forEach(el => projects.push({name: el.innerText}));
        document.querySelectorAll('.tr-report-group > td:nth-child(4)').forEach((el, key) => projects[key].total = parseFloat(el.innerHTML));

        return projects;
    });

    await page.pdf(planfix.report.pdf);
    //REPORT

    console.log(total);
    console.log(projects);

    browser.close();
})();
