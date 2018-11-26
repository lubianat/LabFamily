
## Lab Family - Open Voice User Interface Suite for Lab Life


The Lab Family is a suite of Voice User Interface skills built originally for Alexa. They were all based on the fact template by amazon, but thouroughly modified.

To test any of the skills on your alexa-enabled device, the easiest way is to go to your alexa app and search for the skill name on the store.



If you want to customize/improve one of the skills, awesome, that is why they are open!

If this is your first contact with Alexa skills, it is a nice idea to follow a few of Amazon tutorials on building alexa skills (such as this https://github.com/alexa/skill-sample-nodejs-fact).

If you already know the basics, the pre-requisites are the same of the tutorial above:

### Pre-requisites

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
	$ git clone https://github.com/lubianat/theskillofchoice
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


Setting up the ASK CLI can be a bit complicated, as you have to configure access keys and learn a bit about IAM, the authentication and security service of amazon. I know that, for me, after setting up my profile, the command that worked was

	```bash

	$ ask deploy --profile tiago
	```
In this case, tiago was my profile name, but you will have to change it for yours.

Well, if you have any doubts, don’t hesitate to contact!

Suggestions on how to improve the skill or the tutorial are more than welcome, so pull request at will.
