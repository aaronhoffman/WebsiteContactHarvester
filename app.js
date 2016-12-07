'use strict';

var fs = require("fs");
var urlParse = require("url-parse");
var websiteContactHarvester = require("./websiteContactHarvester.js");

// see here: update list of uris to crawl
var sites = require("./sitesToCrawl.js");

var sitesToCrawl = new sites();
var wch = new websiteContactHarvester();

// ensure output dir exists
var outputDir = "./output";
if (!fs.existsSync(outputDir))
    fs.mkdirSync(outputDir);

sitesToCrawl.uris.forEach(function (uri) {
    try {
        console.log("start crawling: " + uri);

        var url = urlParse(uri);
        var pagesToParse = wch.recursiveCrawlSite(uri, [], 1);

        var allContactInfoFromSite = [];
        pagesToParse.forEach(function(page) {
            var newInfosFromPage = wch.harvestContactInfo(page.uri, page.htmlContent);
            newInfosFromPage.forEach(function(ni) { allContactInfoFromSite.push(ni); });
        });

        fs.writeFileSync(outputDir + "/" + url.host + ".json", JSON.stringify(allContactInfoFromSite));
        fs.appendFileSync(outputDir + "/" + "allInfos.json", JSON.stringify(allContactInfoFromSite));
        // todo: save retrieved html content to file
    }
    catch (e) {
        console.log("exeption while crawling: " + uri);
    }
});

process.exit();