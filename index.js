const puppeteer = require('puppeteer');
const PDFMerge = require('pdf-merge');
const fs = require('fs');
const express = require('express');
const app = express();

app.listen(8080, () => console.log('App listening on port 8080!'))

app.get('/', async (req, res) => {
     const url = req.query.url;
     if (!url || url.length < 10) {
          res.status(400).send('Invalid URL');
          return;
     }

     console.log(`start PDF generation for ${url}`, Date.now());

     const browser = await puppeteer.launch();
     const page = await browser.newPage();

     // page.on('console', msg => console.log('PAGE LOG:', msg.text()));

     // const url = 'https://fas.apartmentsites.net/report/saddle-creek/?print';
     await page.goto(url, {
          timeout: 0,
          waitUntil: 'networkidle2',
     });

     const checkMode = () => {
          const currentPage = window.document.querySelector('.page.current');
          const currentWrapper = window.document.querySelector('.wrapper');
          console.log('current', currentPage, document.querySelector('.page.current'));
          if (currentPage.className.indexOf('landscape') > -1) {
               currentWrapper.style.width = '1375px';
               return Promise.resolve(true);
          }
          currentWrapper.style.width = '1000px';
          return Promise.resolve(false);
     };

     const files = [];
     let i = 0;
     const makePdf = async () => {
          i++;
          const path = `report${i}.pdf`;
          files.push(path);

          const landscape = await page.evaluate(checkMode);
          let margin = {
               top: '0.25in',
               right: '0.5in',
               bottom: '0in',
               left: '0.5in',
          };

          await page.waitFor(1000);

          await page.pdf({
               path,
               landscape,
               margin,
               printBackground: true,
          });

          console.log(`created ${path}`);
     };

     await page.waitFor(5000);

     do {
          await makePdf();

          await page.click('.next_page');
     } while (await page.$('.next_page') !== null);
     await makePdf();

     await browser.close();

     PDFMerge(files).then((stream) => {
          res.set('content-type', 'application/pdf');
          res.send(stream);
          files.forEach((path) => {
               fs.unlinkSync(path);
          });
     });

     console.log(`finished PDF generation for ${url}`, Date.now());
});
