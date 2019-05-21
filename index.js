
/**
 * Author: martinejohnstone@gmail.com
 * License: null
 */

(function() {

  var automerge = require('automerge');

  /**
   * LiveDoc - creates LiveDoc instance to coordinate changes
   *          between CodeMirror and an Automerge document.
   *          This is intended to be a minimalist version of
   *          coordinating data between clients/servers
   *
   * @param  {string} docId    Unique Document ID passed to send function as path
   * @param  {object} cm       Code mirror instance already instantiated
   * @param  {string} amdata   Results from Automerge.save() to initialize doc
   * @param  {function} sendFunc Send function post CM changes
   * @param  {object} emitter  Emitter for handling on(this.docId, changes) from server/client
   * @return {object}          Instance of LiveDoc
   */
  function LiveDoc(docId, cm, amdata, sendFunc, emitter) {
    this.cm = cm;
    this.cm.on('changes', this.cmChanges.bind(this));
    this.docId = docId;
    this.doc = automerge.load(amdata);
    this.cm.getDoc().setValue(this.doc.text.join(''));
    this.emitter = emitter;
    this.send = sendFunc;
    emitter.on(docId, this.applyToCM.bind(this));

    return this;
  }


  /**
   * LiveDoc.prototype.cmChanges - Take changes from CodeMirror instance for conversion
   *
   * @param  {object} cm      CodeMirror Instance
   * @param  {Array} changes CM changes
   * @return {undefined}         none
   */
  LiveDoc.prototype.cmChanges = function(cm, changes) {
    var i = 0,
      len = changes.length;
    for (; i < len; i++) {
      this.cmChange(cm, changes[0]);
    }
  }

  /**
   * LiveDoc.prototype.cmChange - Handle one change from changes set
   *
   * @param  {object} cm     CodeMirror Instance
   * @param  {object} change CM Change
   * @return {undefined}        none but sends converted change data to send function provided to constructor of LiveDoc
   */
  LiveDoc.prototype.cmChange = function(cm, change) {
    // && change.origin !== 'setValue'
    if (change.origin !== 'automerge' && change.origin !== 'setValue') {
      var newDoc = automerge.change(this.doc, this.applyChange.bind(this, change)),
        //changes = automerge.getChanges(this.doc, newDoc),
        nchanges = automerge.getChanges(this.doc, newDoc);
      this.send(this.docId, {
        operation: nchanges,
        actorId: Automerge.getActorId(newDoc)
      }, this.doRes.bind(this));
      this.doc = newDoc;
    }
  }


  /**
   * LiveDoc.prototype.doRes - Handle response from send - blank as not necessary at this point
   *   CRDT doesn't require handling a response/client/server
   *
   * @param  {type} data description
   * @return {type}      description
   */
  LiveDoc.prototype.doRes = function(data) {

  }


  /**
   * LiveDoc.prototype.applyChange - Apply Change to Automerge doc from CM
   *
   * @param  {object} change CodeMirror Change
   * @param  {object} doc    Automerge document
   * @return {undefined}
   */
  LiveDoc.prototype.applyChange = function(change, doc) {
    const at = this.cm.indexFromPos(change.from),
      removedLength = change.removed.join('\n').length,
      addedText = change.text.join('\n');

    if (removedLength > 0) {
      doc.text.splice(at, removedLength)
    }
    if (addedText.length > 0) {
      doc.text.insertAt(at, ...addedText.split(''))
    }
  }


  /**
   * LiveDoc.prototype.applyToCM - Take changes from server/client and apply them to CM instance
   *   uses automerge.applyChanges and new document to create an Automerge Diff
   *  got this from https://github.com/aslakhellesoy/automerge-codemirror
   *
   * @param  {Array} changes Array of changes from Automerge.getChanges(currentDoc, newDoc) see cmChange function
   * @return {undefined}
   */
  LiveDoc.prototype.applyToCM = function(changes) {
    var e, _a
    var newDoc = automerge.applyChanges(this.doc, changes.operation.data),
      nchanges = automerge.diff(this.doc, newDoc);
    this.doc = newDoc;
    var i = 0,
      len = nchanges.length;
    for (; i < len; i++) {
      this.diffToCM(nchanges[i]);
    }
  }


  /**
   * LiveDoc.prototype.diffToCM - Converts automerge.diff to codemirror changes
   *
   * @param  {object} op op portion of automerge diff object
   * @return {undefined}
   */
  LiveDoc.prototype.diffToCM = function(op) {
    switch (op.action) {
      case 'insert':
        var fromPos = this.cm.posFromIndex(op.index);
        this.cm.replaceRange(op.value, fromPos, undefined, 'automerge')
        break
      case 'remove':
        var fromPos = this.cm.posFromIndex(op.index),
          toPos = this.cm.posFromIndex(op.index + 1)
        this.cm.replaceRange('', fromPos, toPos, 'automerge')
        break
      default:
        ge('default', op)
    }
  }

  if (typeof module !== "undefined" && ('exports' in module)) {
    module.exports = LiveDoc;
  } else window.LiveDoc = LiveDoc

})();
