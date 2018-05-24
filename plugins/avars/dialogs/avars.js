
/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @fileOverview Definition for placeholder plugin dialog.
 *
 */

'use strict';

CKEDITOR.dialog.add( 'avars', function( editor ) {
	var lang = editor.lang.avars,
		generalLabel = editor.lang.common.generalTab;

	return {
		title: lang.title,
		minWidth: 300,
		minHeight: 80,
		contents: [
			{
				id: 'info',
				label: generalLabel,
				title: generalLabel,
				elements: [
                    {
                        type: 'vbox',
                        id: 'tplOptions',
                        padding: 1,
                        width:'100%',
                        children: [ {
                            type: 'select',
                            id: 'tplSelect',
                            label: lang.name,
                            required: true,
                            validate: function() {
                                var func = CKEDITOR.dialog.validate.notEmpty( lang.setValidTpl );
                                return func.apply( this );
                            },
                            setup: function( widget ) {
                                var select = this;
                                select.clear();

                                var dialog = this.getDialog();
                                var next = dialog.getContentElement('info','avarDesc');
                                next.getElement().setHtml('');

                                var dialog = this.getDialog();
                                var editor = dialog.getParentEditor();
                                var avars = editor.config.avars||[];

                                avars.forEach(function(el){
                                    //if(el.type ==='url') {
                                        select.add(el.text, el.code);
                                    //}
                                });

                                this.setValue( widget.data.name );

                                this.focus();

                            },
                            commit: function( widget ) {
                                widget.setData( 'name', this.getValue() );
                            },

                            onChange: function(evt){
                                var dialog = this.getDialog();
                                var editor = dialog.getParentEditor();
                                var avars = editor.config.avars||[];
                                var next = dialog.getContentElement('info','avarDesc');
                                avars.forEach(function(el){
                                    if(el.code==evt.data.value){
                                        next.getElement().setHtml('<h3>'+lang.descriptionLabel+'</h3><div>'+el.desc+'</div>');
                                        return true;
                                    }
                                });
                            },
                            items : [  ]
                        },{
                            type: 'html',
                            id:'avarDesc',
                            html: ''
                        }]
                    }
				]
			}
		]
	};
} );
