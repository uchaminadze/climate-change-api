const PORT = process.env.PORT || 8000;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const newspapers = require('./newspapers')

const app = express();


const articles = [];


newspapers.forEach(newspaper => {
    axios.get(newspaper.address)
        .then((res) => {
            const html = res.data;
            const $ = cheerio.load(html);

            $('a:contains("climate")', html).each(function () {
                const url = $(this).attr('href');
                const title = $(this).text();

                articles.push({
                    title,
                    url: url.includes(newspaper.base) ? url : newspaper.base + url,
                    source: newspaper.name
                })
            })

        }).catch((err) => console.log(err))
})

app.get('/news', (req, res) => {
    res.json(articles);
});


app.get('/news/:id', (req, res) => {
    const id = req.params.id;

    const newspaperAddress = newspapers.find(newspaper => newspaper.name === id)?.address;
    const newspaperBase = newspapers.find(newspaper => newspaper.name === id)?.base;

    axios.get(newspaperAddress)
        .then((resp) => {
            const html = resp.data;
            const $ = cheerio.load(html);
            const singleArticle = [];

            $('a:contains("climate")', html).each(function () {
                const url = $(this).attr('href');
                const title = $(this).text();

                singleArticle.push({
                    title,
                    url: url.includes(newspaperBase) ? url : newspaperBase + url,
                    source: id
                })

            })

            res.json(singleArticle);

        }).catch((err) => console.log(err));

})


app.listen(PORT, () => console.log(`server listening on ${PORT}`))