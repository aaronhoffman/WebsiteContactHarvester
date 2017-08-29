'use strict';

var request = require("sync-request");
var cheerio = require("cheerio");
var urlParse = require("url-parse");

var websiteContactHarvester = function () {
    var self = this;

    self.maxCrawlDepth = 2;
    self.phoneNumberRegEx = /\(?\d{3}\)?[-\s\.]?\d{3}[-\s\.]?\d{4}/;

    // given the initial uri and the htmlContent from that uri
    // parse all anchor tags from the htmlContent and compile an array of unique sibling uris
    self.getSiblingUris = function (uri, htmlContent) {
        var initialUri = urlParse(uri);
        var $ = cheerio.load(htmlContent);
        var allAnchors = $("a");
        var siblingUris = [];

        var i = allAnchors.length;
        while (i--) {
            var a = allAnchors[i];
            var aUri = urlParse(a.attribs.href);
            // if the current uri is for the same host domain, and not exactly the original uri
            // and we don't already have it in our array, add it
            if (aUri.host == initialUri.host && a.attribs.href != uri) {
                if (siblingUris.indexOf(a.attribs.href) < 0)
                    siblingUris.push(a.attribs.href);
            }
        }

        return siblingUris;
    };

    self.getHtml = function (uri) {
        var htmlContent = "";

        try {
            var req = request("GET", uri);
            htmlContent = req.getBody('utf8');
        }
        catch (e) {
            console.log("exception while crawling: " + uri);
        }

        return htmlContent;
    };

    // start with the uri provided and crawl the site for other uris
    // crawl all sibling uris gathering the htmlcontent as we go until we hit the max crawl depth
    // don't crawl the same uri twice
    self.recursiveCrawlSite = function (uriToCrawl, crawledPages, crawlDepth) {
        var htmlContent = self.getHtml(uriToCrawl);
        
        if (htmlContent == "")
            return crawledPages;

        crawledPages.push({ uri: uriToCrawl, htmlContent: htmlContent });

        // if we reached the max crawl depth, just return the collection
        if (crawlDepth >= self.maxCrawlDepth)
            return crawledPages;

        // get any sibling uris that exist on the page
        var siblingUris = self.getSiblingUris(uriToCrawl, htmlContent);
        var crawledUris = crawledPages.map(function (d) { return d.uri; });

        // filter the sibling uris, remove those we've already crawled
        var siblingUrisNotYetCrawled = siblingUris.filter(function (uri) { return crawledUris.indexOf(uri) < 0; });

        // recursively call this method with the not-yet-crawled uris
        siblingUrisNotYetCrawled.forEach(function (uri) {
            crawledPages = self.recursiveCrawlSite(uri, crawledPages, (crawlDepth + 1));
        });

        return crawledPages;
    };

    self.harvestContactInfo = function (uri, htmlContent) {
        var infos = [];
        var i = 0;

        var url = urlParse(uri);
        var $ = cheerio.load(htmlContent);
        var bodyText = $("body").text();

        var phoneMatches = self.phoneNumberRegEx.exec(bodyText);
        if (phoneMatches) {
            phoneMatches.forEach(function (p) {
                infos.push({ host: url.host, uri: uri, infoType: "phone", value: p });
            });
        }

        // anchors with mailto hrefs
        var emailMatches = $("a[href^='mailto:']");
        i = emailMatches.length;
        while (i--) {
            var e = emailMatches[i];
            infos.push({ host: url.host, uri: uri, infoType: "email", value: e.attribs.href });
        }

        // anchors with twitter
        var twitterMatches = $("a[href*='twitter']");
        i = twitterMatches.length;
        while (i--) {
            var t = twitterMatches[i];
            infos.push({ host: url.host, uri: uri, infoType: "twitter", value: t.attribs.href });
        }

        // anchors with facebook
        var facebookMatches = $("a[href*='facebook']");
        i = facebookMatches.length;
        while (i--) {
            var f = facebookMatches[i];
            infos.push({ host: url.host, uri: uri, infoType: "facebook", value: f.attribs.href });
        }

        return infos;
    };

    return self;
};
module.exports = websiteContactHarvester;
