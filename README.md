# pdf-gen

This is a Node.js library for generating PDFs for AFI FAS reports.

It runs an [Express](https://expressjs.com/) server on port 8080 that expects a `url` param. It uses [Puppeteer](https://github.com/GoogleChrome/puppeteer/) to navigate to that URL and creates a PDF for each page. Finally, it uses [PDFMerge](https://www.npmjs.com/package/pdf-merge) to combine the single-page PDFs into one grand PDF and returns that to the browser.

## Local development

1. Clone this repo.
2. Run `npm i`.
3. Run `npm run dev`.
4. In a browser, navigate to `http://localhost:8080/?url={FAS URL}`. You'll see console logs as each PDF gets created and the resulting PDF.

## PDF creation process

*Note that this library is very particular, designed for FAS reports only.*

For it to work, the report page needs to have a first page with classes `.page.current`. If that page also has the `.landscape` class, the margins and orientation for the PDF page will change accordingly.

Once the first page is captured, Puppeteer will try to click on an element with class `.next_page`. On click, the report page will need to move the `.page.current` designation to the next page.

When there is no longer an element with class `.next_page`, we assume we are on the last page, capture it as a PDF, and close Puppeteer.

We then merge the individual PDFs, delete them from the server, and output the big PDF.
