# Automerge-Codemirror-LiveDoc
Potentially the most basic version of coordinating documents between client(s)/server(s) with Automerge and Codemirror

# Example Implementation

    var LiveDoc = require('./index.js'),
      CodeMirror = require('CodeMirror'),
      textAreaEl = document.getElementById('cmtextarea'),
      cm = CodeMirror.fromTextArea(textAreaEl),
      ws = require('ws'),  //websockets but could be other connection medium
      livedoc;
      ws.send('/path/to/my/doc/get', function(autoMergeSave){
        //results expected is Automerge.Save(doc) results (string format)
        liveDoc = LiveDoc('/path/to/my/doc', cm, autoMergeSave, ws.send, ws);
      });

#  What to expect
Once you initialize the liveDoc, it will handle tracking all CM changes, convert them to automerge.Changes
and use the 'Send' function to pass the changes to another client/server.  

When the EventEmitter or the last argument as 'ws' above receives ws.on(docId) (/path/to/my/doc)
it will take the Automerge.changes and apply them to the current doc and create a diff with the 
resulting document and existing one.  Then, apply them to codemirror.

The code is well documented.  See it for further details.

