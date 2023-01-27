const puppeteer = require('puppeteer');
const fs = require("fs");

const url = 'https://www.otodom.pl/pl/oferty/sprzedaz/mieszkanie/krakow?distanceRadius=0&page=1&limit=36&market=SECONDARY&locations=%5Bcities_6-38%5D&ownerTypeSingleSelect=ALL&by=DEFAULT&direction=DESC&viewType=listing'

const waitForNetwork0 = async (page, timeout = 4000) => {
    await new Promise((resolve) => {
        let timer;
        page.on('response', () => {
            clearTimeout(timer);
            timer = setTimeout(resolve, timeout);
        });
    });
};

const getNumberOfPages = async page => {
    const numberOfPages =await page.evaluate(()=>{
        const elems = document.querySelectorAll(".eoupkm71.css-190hi89.e11e36i3");

        return elems[elems.length-2].textContent;
    })

   return Number(numberOfPages);
}


 const scrape = async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url);

    let results = [];
    const  lastPageNumber = getNumberOfPages(page);

    for (let index = 0; index < lastPageNumber-1; index++) {
        await  waitForNetwork0(page);

        results =[...results, ...await resolveData(page)];

        if (index !== lastPageNumber - 1) {
            await Promise.all([
                page.waitForNavigation({timeout:4000}),
                page.click('[data-cy="pagination.next-page"]'),

            ])


        }
    }

    await browser.close();
    return results;
};


async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;

            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;

                window.scrollBy(0, distance);

                totalHeight += distance;

                if(totalHeight >= scrollHeight - window.innerHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 10);
        });
    });
}



async function resolveData(page) {
   await autoScroll(page)
    return page.evaluate(() => {
        let data = [];
        const items = document.querySelectorAll('.css-153eqh1.e1brl80i2');

        items.forEach(item => {
            if(item){
                const element = item.querySelectorAll(".css-s8wpzb.e1brl80i1");

                if(element){
                    const apartment = {
                        price:Number(element[0].textContent.replace(/[^0-9\.-]+/g,"")),
                        numberOfRooms: (element[2].textContent.split(" ").shift()),
                        area:(element[3].textContent.split(" ").shift()),
                    }
                    data.push(apartment)
                }
            }

        });
        return data;
    });
}

scrape().then((value) => {
    const csvContent = value.map(element => {
        return Object.values(element).map(item => `"${item}"`).join(',')
    }).join("\n")

    fs.writeFile('dane.csv', "Price(zł), NumberOfRooms, Area(m^2)" + '\n' + csvContent, 'utf8', function (err) {
        if (err) {
            console.log('Some error occurred - file either not saved or corrupted.')
        } else{
            console.log('File has been saved!')
        }
    })
});
