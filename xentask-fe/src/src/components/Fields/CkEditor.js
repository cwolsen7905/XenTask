import React, { useEffect,useContext } from 'react';
import Editor from 'ckeditor5-custom-build/build/ckeditor';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { DataContext } from '../Contexts/DataContext';

const CkEditor = ({ props }) => {

  const { globalData } = useContext(DataContext);

  const items = globalData.WORKSPACE_USERS.map(user =>{
    return {
      id:`@${user.full_name}`,
      user_id: user.id,
    }
  });

  const editorConfiguration = {
    toolbar: {
      items: [
        'heading',
        'FontFamily',
        'FontBackgroundColor',
        'FontColor',
        'FontSize',
        'Highlight',
        // 'Style',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'alignment',
        'Outdent',
        'Indent',
        'BlockQuote',
        'HorizontalLine',
        '|',
        'BulletedList',
        'NumberedList',
        'ToDoList',
        'InsertTable',
        '-',
        'code',
        'CodeBlock',
        'ImageUpload',
        'ImageInsert',
        'mediaEmbed',
        'FindAndReplace',
      ],
      shouldNotGroupWhenFull: true,
    },
    removePlugins: ['Title', "MediaEmbedToolbar"],
    extraPlugins: [MentionCustomization],
    mention: {
      feeds: [
        {
          marker: '@',
          feed: items,
          minimumCharacters: 0,
          //itemRenderer: mentionItemRenderer
        }
      ]
    },
    findAndReplace: {
      uiType: 'dialog'
    },
    mediaEmbed: {}
  };


  const handleDragEnter = (evt, editor) => {
    console.log('Drag entered the editor.');
  };

  const handleDragLeave = (evt, editor) => {
    console.log('Drag left the editor.');
  };

  const handleDrop = (evt, editor) => {
    console.log('Content dropped into the editor.');

    // Handle dropped files
    // const files = evt.dataTransfer.files;
    console.log(evt);


  };


  const handleReady = (editor) => {
    //console.log('Editor is ready to use!', editor);

    if (props && ("returnRef" in props) && props.returnRef !== undefined) props.returnRef(editor);

    if (props && ("editorData" in props) && props.returnRef !== undefined) editor.setData(props.editorData);

    if (props && 'height' in props) {

      editor.editing.view.change((writer) => {

        writer.setStyle(
          "height",
          props.height,
          editor.editing.view.document.getRoot()
        );

      });

    }

    // Attach a drop event listener to the editor's editing view
    editor.editing.view.document.on('clipboardInput', (evt, data) => {
      console.log(data);
    });

  };

  const handleBlur = (event, editor) => {
    //console.log('Blur.', editor);
  };

  const handleFocus = (event, editor) => {
    //console.log('Focus.', editor);
  };

  //  Renders Mentions In A Custom Way
  function MentionCustomization(editor) {
    // elements to the model 'mention' text attribute.
    editor.conversion.for('upcast').elementToAttribute({
      view: {
        name: 'span',
        key: 'data-mention',
        classes: 'mention',
        attributes: {
          //href: true,
          'data-user-id': true
        }
      },
      model: {
        key: 'mention',
        value: viewItem => {
          // The mention feature expects that the mention attribute value
          // in the model is a plain object with a set of additional attributes.
          // In order to create a proper object use the toMentionAttribute() helper method:
          const mentionAttribute = editor.plugins.get('Mention').toMentionAttribute(viewItem, {
            // Add any other properties that you need.
            //link: viewItem.getAttribute('href'),
            user_id: viewItem.getAttribute('data-user-id')
          });

          return mentionAttribute;
        }
      },
      converterPriority: 'high'
    });

    // Downcast the model 'mention' text attribute to a view <a> element.
    editor.conversion.for('downcast').attributeToElement({
      model: 'mention',
      view: (modelAttributeValue, { writer }) => {
        // Do not convert empty attributes (lack of value means no mention).
        if (!modelAttributeValue) {
          return;
        }

        return writer.createAttributeElement('span', {
          class: 'mention',
          'data-mention': modelAttributeValue.id,
          'data-user-id': modelAttributeValue.user_id,
          //'href': modelAttributeValue.link
        }, {
          // Make mention attribute to be wrapped by other attribute elements.
          priority: 20,
          // Prevent merging mentions together.
          id: modelAttributeValue.uid
        });
      },
      converterPriority: 'high'
    });
  }



  return (
    <>
      <CKEditor
        id="Editor"
        editor={Editor}
        config={editorConfiguration}
        onReady={handleReady}
        onBlur={handleBlur}
        onFocus={handleFocus}
      />
    </>
  );
};

export default CkEditor;
