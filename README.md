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

# Documentation

## `function LiveDoc(docId, cm, amdata, sendFunc, emitter)`

LiveDoc - creates LiveDoc instance to coordinate changes between CodeMirror and an Automerge document. This is intended to be a minimalist version of coordinating data between clients/servers

 * **Parameters:**
   * `docId` — `string` — Unique Document ID passed to send function as path
   * `cm` — `object` — Code mirror instance already instantiated
   * `amdata` — `string` — Results from Automerge.save() to initialize doc
   * `sendFunc` — `function` — Send function post CM changes
   * `emitter` — `object` — Emitter for handling on(this.docId, changes) from server/client
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


