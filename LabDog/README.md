This is Lab Dog, an alexa skill meant to tell short, science related puns .

This skill was built upon https://github.com/alexa/skill-sample-nodejs-fact, which is under Apache 2.0 license. 

You can find it on the Alexa App store with the jokes saved here. 

If you want to customize it with your own jokes, that is great! Folow the tutorial below and then

1. Go to lambda/custom

2. Open index.js and add your jokes to the 'data' object!

3. Have fun!



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
	$ git clone https://github.com/lubianat/LabFamily/tree/master/LabDog
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
	```

### Deployment

1. Navigate to the project's root directory. you should see a file named 'skill.json' there.
2. Deploy the skill by running the following command
	```bash

	$ ask deploy
	```
