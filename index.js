/**
 * Author: martinejohnstone@gmail.com
 * License: null
 */
(function() {

  const mc = require('mc');

  /**
   * LiveDoc - creates LiveDoc instance to coordinate changes
   *          between CodeMirror and an Automerge document.
   *          This is intended to be a minimalist version of
   *          coordinating data between clients/servers
   *
   * @param  {object} cmh    CodeMirrorHelper Instance
   * @return {object}          Instance of CodeMirror
   */
  function LiveDoc(cm) {
    this.cm = cm;
    this.cm.on('changes', this.cmChanges.bind(this));
    mc.call(this);
    return this;
  }
  inherits(mc, LiveDoc);

  LiveDoc.prototype.init = function(docId, content) {
    //this.cm.on('selectionChange', this.onSelectionChange.bind(this));
    //this.cm.on('cursorActivity', this.onFocusOrActivity.bind(this));
    //this.cm.on('focus', this.onFocusOrActivity.bind(this));
    //this.cm.on('blur', this.onBlur.bind(this));
    //this.cm.on('changes', this.onChanges.bind(this));
    this.docId = docId;
    if (typeof content === 'string') this.cmh.setContent(content);
    else this.cm.getDoc().setValue('');
  }

  LiveDoc.prototype.off = function() {
    this.cm.off('changes', this.cmChanges);
  }

  LiveDoc.prototype.handleErr = function(err) {
    console.log(err, Error().stack);
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
      len = changes.length,
      change, diffChanges = [];
    for (; i < len; i++) {
      change = changes[i];
      if (change.origin !== 'automerge' && change.origin !== 'setValue') {
        this.getChange(changes[i], diffChanges);
      }
    }
    this.emit('changes', this.docId, diffChanges);
  }


  /**
   * LiveDoc.prototype.applyChange - Apply Change to Automerge doc from CM
   *
   * @param  {object} change CodeMirror Change
   * @param  {object} doc    Automerge document
   * @return {undefined}
   */
  LiveDoc.prototype.getChange = function(change, diffChanges) {
    const at = this.cm.indexFromPos(change.from),
      removedLength = change.removed.join('\n').length,
      addedText = change.text.join('\n'),
      changes = [];

    if (removedLength > 0) {
      diffChanges.push(['-', at, removedLength]);
    }
    if (addedText.length > 0) {
      diffChanges.push(['+', addedText, at]);
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
    var i = 0,
      len = changes.length;
    for (; i < len; i++) {
      this.diffToCM(changes[i]);
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
