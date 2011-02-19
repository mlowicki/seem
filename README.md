Node-API-Simulator
==================

This tool is designed to make work with 3rd party APIs much more easier. It's responsible for simulating API used by application and it's launched on developer's machine so network connection is not required. It can be used for:

* testing behaviour of the app while unusual circumstances like long waiting for response, server errors etc,

* automate tests,

* creating test case data for task dev is working on and use it without need to connecting to external server and preparing test data (like test tweets on Twitter). Such data can be used then for automatic tests.

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
