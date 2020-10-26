# WebsiteContactHarvester
Crawl websites for contact information. Extract email, phone, facebook, twitter.

## How to use

`docker build -t WebsiteContactHarvester .`
`docker run --rm WebsiteContactHarvester https://test1.com https://test2.com > results.txt
  
## Output
Currently all potential phone numbers, email (mailto) address, twitter, and facebook URLs are harvested from retrieved HTML files.
You can harvest additional data by modifying the `harvestContactInfo` method of the `websiteContactHarvester.js` class.
