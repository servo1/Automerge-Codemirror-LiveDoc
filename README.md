# Automerge-Codemirror-LiveDoc
Potentially the most basic version of coordinating documents between client(s)/server(s) with Automerge and Codemirror

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

# Documentation

## `function LiveDoc(cm)`

LiveDoc - creates LiveDoc instance to coordinate changes between CodeMirror and an Automerge document. This is intended to be a minimalist version of coordinating data between clients/servers

 * **Parameters:**
   * `cm` — `object` — Code mirror instance already instantiated
 * **Returns:** `object` — Instance of LiveDoc

## `LiveDoc.prototype.cmChanges = function(cm, changes)`

LiveDoc.prototype.cmChanges - Take changes from CodeMirror instance for conversion

 * **Parameters:**
   * `cm` — `object` — CodeMirror Instance
   * `changes` — `Array` — CM changes
 * **Returns:** `undefined` — none

## `LiveDoc.prototype.cmChange = function(cm, change)`

LiveDoc.prototype.cmChange - Handle one change from changes set

 * **Parameters:**
   * `cm` — `object` — CodeMirror Instance
   * `change` — `object` — CM Change
 * **Returns:** `undefined` — none but sends converted change data to send function provided to constructor of LiveDoc

## `LiveDoc.prototype.doRes = function(data)`

LiveDoc.prototype.doRes - Handle response from send - blank as not necessary at this point CRDT doesn't require handling a response/client/server

 * **Parameters:** `data` — `type` — description
 * **Returns:** `type` — description

## `LiveDoc.prototype.applyChange = function(change, doc)`

LiveDoc.prototype.applyChange - Apply Change to Automerge doc from CM

 * **Parameters:**
   * `change` — `object` — CodeMirror Change
   * `doc` — `object` — Automerge document
 * **Returns:** `undefined` — 

## `LiveDoc.prototype.applyToCM = function(changes)`

LiveDoc.prototype.applyToCM - Take changes from server/client and apply them to CM instance uses automerge.applyChanges and new document to create an Automerge Diff got this concept from https://github.com/aslakhellesoy/automerge-codemirror

 * **Parameters:** `changes` — `Array` — Array of changes from Automerge.getChanges(currentDoc, newDoc) see cmChange function
 * **Returns:** `undefined` — 

## `LiveDoc.prototype.diffToCM = function(op)`

LiveDoc.prototype.diffToCM - Converts automerge.diff to codemirror changes

 * **Parameters:** `op` — `object` — op portion of automerge diff object
 * **Returns:** `undefined` — 


