<user-context><current-time>Thursday, April 9, 2026 at 19:35 Asia/Shanghai</current-time>…</user-context>
<attachment><assistant-capability type="list" category="format"><content>The user is requesting that you format your response as a list.</content></assistant-capability></attachment>
<attachment><assistant-capability type="textProposal" category="format"><content>The user is requesting that you format your response using a text proposal.</content></assistant-capability></attachment>
<attachment><assistant-capability type="codeBlock" category="format"><content>The user is requesting that you format your response using a code block.</content></assistant-capability></attachment>
<attachment><assistant-capability type="table" category="format"><content>The user is requesting that you format your response as a table.</content></assistant-capability></attachment>
<attachment><assistant-capability type="images" category="format"><content>The user is requesting that you include images in your response.</content></assistant-capability></attachment>
<user-message>
<assistant-capability title='Search Web' userTypedQuery='Search Web' /> <assistant-capability title='Autofill' userTypedQuery='Autofill' /> <assistant-capability title='Tabs' userTypedQuery='Tabs' /> When I @ these tools, what is raw input, output in md code block
</user-message>

o{

  "search_web": {

    "input": {

      "queries": [

        "Search Web"

      ]

    },

    "output": {

      "results": [

        {

          "title": "Example result title",

          "snippet": "Short description of this search result…",

          "resultId": "example.com/1a",

          "url": "https://example.com/page"

        }

      ]

    }

  }

}

{

  "autofill": {

    "input": {

      "commands": [

        {

          "fieldName": "Example Field",

          "id": "//*[@id='example-field']",

          "value": "Example value"

        }

      ]

    },

    "output": {

      "status": "success",

      "appliedCommands": [

        {

          "fieldName": "Example Field",

          "id": "//*[@id='example-field']",

          "value": "Example value",

          "result": "ok"

        }

      ]

    }

  }

}

{

  "tabs_read": {

    "input": {

      "contentPaneIDs": [],

      "includeFullTextContent": false

    },

    "output": {

      "tabs": [

        {

          "contentPaneID": "pane-123",

          "title": "Example Tab",

          "url": "https://example.com",

          "type": "webContent"

        }

      ]

    }

  }

}

{

  "tabs_open": {

    "input": {

      "urls": [

        "https://example.com",

        "https://another-example.com"

      ]

    },

    "output": {

      "results": [

        {

          "url": "https://example.com",

          "status": "success"

        },

        {

          "url": "https://another-example.com",

          "status": "failure",

          "error": "network_error"

        }

      ]

    }

  }

}

{

  "tabs_close": {

    "input": {

      "contentPaneIDs": [

        "pane-123",

        "pane-456"

      ]

    },

    "output": {

      "results": [

        {

          "contentPaneID": "pane-123",

          "status": "success"

        },

        {

          "contentPaneID": "pane-456",

          "status": "failure",

          "error": "not_found"

        }

      ]

    }

  }

}


