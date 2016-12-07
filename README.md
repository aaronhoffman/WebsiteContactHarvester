# WebsiteContactHarvester
Crawl websites for contact information. Extract email, phone, facebook, twitter.

## How to use
  1. Clone the repo.
  1. Restore NPM packages.
  1. Update the sites to crawl in the `sitesToCrawl.js` file.
  1. Execute `node app.js`
  1. Harvested contact info will be placed into the `./output` directory.
  
## Output
Currently all potential phone numbers, email (mailto) address, twitter, and facebook URLs are harvested from retrieved HTML files.
You can harvest additional data by modifying the `harvestContactInfo` method of the `websiteContactHarvester.js` class.
The harvested data is saved to the `./output` directory, one .json file per domain in the source `sitesToCrawl.js` file.
You can use a tool like https://konklone.io/json/ to convert the .json files into .csv files.

## Roadmap
  1. Produce a .csv output file in addition to the .json files.
  1. Eliminate duplicate values from the output files.
