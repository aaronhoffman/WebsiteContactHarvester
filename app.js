'use strict';

var urlParse = require("url-parse");
var websiteContactHarvester = require("./websiteContactHarvester.js");

// see here: update list of uris to crawl
var sites = require("./sitesToCrawl.js");

var sitesToCrawl = new sites();
var wch = new websiteContactHarvester();

var sites = process.argv.slice(2)
//console.log(sites)
var allContactInfoFromSite = [];

if (sites.length === 0 || sites[0] === "") {
    console.log("Please enter a URL")
    process.exit();
}

for (var i in sites) {

    try {
        console.log("start crawling: " + sites[i]);

        var url = urlParse(sites[i]);
        var pagesToParse = wch.recursiveCrawlSite(sites[i], [], 1);

        pagesToParse.forEach(function(page) {
            var newInfosFromPage = wch.harvestContactInfo(page.uri, page.htmlContent);
            newInfosFromPage.forEach(function(ni) { allContactInfoFromSite.push(ni); });
        });

    }
    catch (e) {
        console.log("exeption while crawling: " + sites[i]);
    }
    

}

console.log(JSON.stringify(allContactInfoFromSite))

process.exit();