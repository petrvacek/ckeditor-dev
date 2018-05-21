/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @fileOverview The "placeholder" plugin.
 *
 */

'use strict';

(function () {
    CKEDITOR.plugins.add('avars', {
        requires : 'widget,dialog',
        lang     : 'cs,en', // %REMOVE_LINE_CORE%
        icons    : 'avars', // %REMOVE_LINE_CORE%
        hidpi    : true, // %REMOVE_LINE_CORE%

        codeToText : function (code, editor) {
            var a = this.codeToData(code, editor);
            return a.text;
        },

        codeToData : function (code, editor) {
            var avars = editor.config.avars || [];
            var found = false;
            avars.forEach(function (el, key) {
                if (el.code == code) {
                    found = el;
                    return true;
                }
            });
            return found;
        },

        onLoad : function () {
            // Register styles for placeholder widget frame.
            CKEDITOR.addCss('.cke_avars{background-color:#ff0}.cke_avars.invalid{background-color:#ff0000}');
        },

        init : function (editor) {
            var me = this;
            var lang = editor.lang.avars;

            // Register dialog.
            CKEDITOR.dialog.add('avars', this.path + 'dialogs/avars.js');

            // Put ur init code here.
            editor.widgets.add('avars', {
                // Widget code.
                dialog   : 'avars',
                pathName : lang.pathName,
                // We need to have wrapping element, otherwise there are issues in
                // add dialog.
                template : '<span class="cke_avars">[[]]</span>',

                downcast : function () {
                    return new CKEDITOR.htmlParser.text('[[' + this.data.name + ']]');
                },

                init : function () {
                    //var tmp = this.element.getText().slice(2, -2);
                    var code = this.element.$.dataset.avar;
                    this.setData('name', code);
                },

                data : function () {
                    // id to text
                    var code = this.data.name;
                    var data = me.codeToData(code, editor);
                    var text = code;
                    var valid = false;
                    if (data) {
                        var text = data.text;
                        valid = true;
                    }
                    if (valid) {
                        this.element.$.classList.remove('invalid');
                    } else {
                        this.element.$.classList.add('invalid');
                    }
                    this.element.setText('[[' + text + ']]');
                    //console.log('Xdata',this.element,this.data.name );
                },

                getLabel : function () {
                    return this.editor.lang.widget.label.replace(/%1/, this.data.name + ' ' + this.pathName);
                }
            });

            editor.ui.addButton && editor.ui.addButton('CreateAvars', {
                label   : lang.toolbar,
                command : 'avars',
                toolbar : 'insert,5',
                icon    : 'avars'
            });

            editor.on('paste', function (evt) {
                var avar = evt.data.dataTransfer.getData('avar');
                if (!avar) {
                    return;
                }

                var code = avar.code || avar;
                var data = me.codeToData(code, editor);
                if (data) {
                    evt.data.dataValue = '[[' + data.code + ']]';
                } else {
                    // return false to stop include, code to create invalid placeholder
                    evt.data.dataValue = '[[' + code + ']]';
                }
            });

            editor.validAvar = function(){
                return new Promise(function(resolve){
                    var data = editor.getData();
                    var valid = true;
                    var msg = {missing : [], invalid : [], used : []};
                    // find missing and required;
                    editor.config.avars.forEach(function (avar) {
                        if (avar.required === true) {
                            //try to find any
                            if (data.indexOf(avar.code) < 0) {
                                valid = false;
                                msg.missing.push(avar);
                            }
                        }
                    });
                    // try to find all possible
                    var avarsReplaceRegex = /\[\[([^\[\]])+\]\]/g;
                    var match = null;
                    while ((match = avarsReplaceRegex.exec(data)) != null) {
                        var code = match[0].slice(2, -2);
                        var avar = me.codeToData(code, editor);
                        if (avar) {
                            msg.used.push([avar, match.index]);
                        } else {
                            msg.invalid.push([code, match.index]);
                        }
                    }
                    resolve(msg);
                });
            };
            editor.on('change', function (evt) {
                /*me.changeTimer ;
                setTimeout(function() {

                    var data = evt.editor.getData();
                    var valid = true;
                    var msg = {missing : [], invalid : [], used : []};
                    // find missing and required;
                    editor.config.avars.forEach(function (avar) {
                        if (avar.required === true) {
                            //try to find any
                            if (data.indexOf(avar.code) < 0) {
                                valid = false;
                                msg.missing.push(avar);
                            }
                        }
                    });
                    // try to find all possible
                    var avarsReplaceRegex = /\[\[([^\[\]])+\]\]/g;
                    var match = null;
                    while ((match = avarsReplaceRegex.exec(data)) != null) {
                        var code = match[0].slice(2, -2);
                        var avar = me.codeToData(code, editor);
                        if (avar) {
                            msg.used.push([avar, match.index]);
                        } else {
                            msg.invalid.push([code, match.index]);
                        }
                    }
                }

                console.log('msg',msg);*/


            });
        },

        afterInit : function (editor) {
            var me = this;
            var avarsReplaceRegex = /\[\[([^\[\]])+\]\]/g;
            editor.dataProcessor.dataFilter.addRules({
                text : function (text, node) {
                    var dtd = node.parent && CKEDITOR.dtd[node.parent.name];

                    // Skip the case when placeholder is in elements like <title> or <textarea>
                    // but upcast placeholder in custom elements (no DTD).
                    if (dtd && !dtd.span)
                        return;

                    return text.replace(avarsReplaceRegex, function (match) {
                        // Creating widget code.
                        var code = match.slice(2, -2);
                        var data = me.codeToData(code, editor);
                        if (data) {
                            var text = data.text;
                            var valid = true;
                        } else {
                            var text = code;
                            var valid = false;
                        }

                        var widgetWrapper = null,
                            innerElement = new CKEDITOR.htmlParser.element('span', {
                                'class'     : 'cke_avars ' + (!valid ? ' invalid' : ''),
                                'data-avar' : code
                            });

                        // Adds placeholder identifier as innertext.
                        innerElement.add(new CKEDITOR.htmlParser.text('[[' + text + ']]'));
                        widgetWrapper = editor.widgets.wrapElement(innerElement, 'avars');

                        // Return outerhtml of widget wrapper so it will be placed
                        // as replacement.
                        return widgetWrapper.getOuterHtml();
                    });
                }
            });
        }
    });

})();
