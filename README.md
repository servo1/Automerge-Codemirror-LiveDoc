# Automerge-Codemirror-LiveDoc
Potentially the most basic version of coordinating documents between client(s)/server(s) with Automerge and Codemirror

You will need to replace 'mc' as it's used as an eventemitter with your own.

# Example Implementation
```
var textbox = document.getElementById('mytextboxid),
  cm = CodeMirror.fromTextArea(textbox),
  liveCodeArea = new LiveDoc(cm),
  amc = require('automergeController')('/automerge/');

amc.setDefaultDocSetId('liveDocs');
ws.on('connId', handleConnId);
ws.on('close', amc.close.bind(amc))
ws.on('/automerge/:docSetId', receiveMsg);
amc.on('send', sendMsg);
amc.on('docLoaded', liveCodeArea.init.bind(liveCodeArea));
liveCodeArea.on('changes', amc.handleChanges.bind(amc));
amc.on('/automerge/livedocs/:docid/changes', function(changes){
  liveCodeArea.applyToCM(changes)
});

function sendMsg(data) {
  data.docSetId = amc.defDocSetId;
  sio.route(data.route, data);
}

function receiveMsg(data, params) {
  //ge('RECV', data, params);
  amc.handleMsg(data);
}

function handleConnId() {
  amc.connect(null, found.connId);
}
```
#  What to expect
Once you initialize the liveDoc, it will handle tracking all CM changes, convert them to automerge.changes
and use the 'Send' function to pass the changes to another client/server.  

When the EventEmitter or the last argument as 'ws' above receives ws.on(docId) (/path/to/my/doc)
it will take the Automerge.changes and apply them to the current doc and create a diff with the 
resulting document and existing one.  Then, apply them to codemirror.

You will need to replace the "mc" eventEmitter with your own.  

Code is pretty self explanatory with some comments.  This is a WIP.


