This is Science Grandpa, an alexa skill meant to retrive information from the Pubmed database using the eUtils API via npm package node-ncbi(https://www.npmjs.com/package/node-ncbi)



If you want to customize or change it in anyway, that is great! To get it running as a custom skill on your alexa devices, follow the tutorial:

s
## Pre-requisites

* Node.js (> v8)
* Register for an [AWS Account](https://aws.amazon.com/)
* Register for an [Amazon Developer Account](https://developer.amazon.com?&sc_category=Owned&sc_channel=RD&sc_campaign=Evangelism2018&sc_publisher=github&sc_content=Content&sc_detail=fact-nodejs-V2_CLI-1&sc_funnel=Convert&sc_country=WW&sc_medium=Owned_RD_Evangelism2018_github_Content_fact-nodejs-V2_CLI-1_Convert_WW_beginnersdevs&sc_segment=beginnersdevs)
* Install and Setup [ASK CLI](https://developer.amazon.com/docs/smapi/quick-start-alexa-skills-kit-command-line-interface.html?&sc_category=Owned&sc_channel=RD&sc_campaign=Evangelism2018&sc_publisher=github&sc_content=Content&sc_detail=fact-nodejs-V2_CLI-1&sc_funnel=Convert&sc_country=WW&sc_medium=Owned_RD_Evangelism2018_github_Content_fact-nodejs-V2_CLI-1_Convert_WW_beginnersdevs&sc_segment=beginnersdevs)





### Installation
1. Make sure you are running the latest version of the CLI

	```bash
	$ npm update -g ask-cli
	```

2. Clone the repository.

	```bash
	$ git clone https://github.com/lubianat/LabFamily/tree/master/LabGrandpa
  ```

3. Initialie ask CLI.

	```bash
	$ cd skill-sample-nodejs-fact
	$ ask init
	```

4. Install npm dependencies into the `/lambda/custom` directory.

	```bash
	$ cd lambda/custom
	$ npm install
  $ npm install --save node-ncbi
	```

### Deployment

1. Navigate to the project's root directory. you should see a file named 'skill.json' there.
2. Deploy the skill by running the following command
	```bash

	$ ask deploy
	```
