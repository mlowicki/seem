Node-API-Simulator
==================

This tool is designed to make work with 3rd party APIs much more easier. It's responsible for simulating API used by application and it's launched on developer's machine so network connection is not required. It can be used for:

* testing behaviour of the app while unusual circumstances like long waiting for response, server errors etc,

* automate tests,

* creating test case data for task dev is working on and use it without need to connecting to external server and preparing test data (like test tweets on Twitter). This can be problematic if we want to reproduce bugs filed by users or special retweet or tweet with mentions is needed (sometimes it requires many Twitter accounts). Such data can be used then for automatic tests.

How is works
------------

Each API is defined by config.json file::
        {
            "url": "twitter",
            "actions": [
                {
                    "url": "users/show.json",
                    "method": "GET",
                    "parameters": { "screen_name": "mlowicki" },
                    "responseFile": "users|show.json?screen_name=mlowicki.json",
                    "contentType": "text/plain"
                }
            ]
        } 

Plans
-----

Right now in repo there is only POC code. I'm still gathering requirements and ideas so if you want some please let me know.

* web interface. Dev can e.g. change bevaiour of action directly from the browser (like from now on return server error or wait with response for 40 seconds),

* support for oAuth and other authentication mechanism like xAuth from Twitter.
