import { useState, useCallback, useRef, useEffect } from 'react';

// Custom hook for rich text editor functionality
export const useRichTextEditor = (initialContent = '') => {
  const [content, setContent] = useState(initialContent);
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef(null);

  // Format text with execCommand
  const formatText = useCallback((command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      const success = document.execCommand(command, false, value);
      if (success) {
        updateContent();
      }
    }
  }, []);

  // Update content from editor
  const updateContent = useCallback(() => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  }, []);

  // Handle content changes
  const handleContentChange = useCallback((e) => {
    setContent(e.target.innerHTML);
  }, []);

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Handle blur
  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Handle key events
  const handleKeyDown = useCallback((e) => {
    // Handle Ctrl+B for bold
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      formatText('bold');
    }
    // Handle Ctrl+I for italic
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      formatText('italic');
    }
    // Handle Ctrl+U for underline
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      formatText('underline');
    }
  }, [formatText]);

  // Set content programmatically
  const setEditorContent = useCallback((newContent) => {
    setContent(newContent);
    if (editorRef.current) {
      // Save cursor position
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const startOffset = range.startOffset;
      
      editorRef.current.innerHTML = newContent;
      
      // Restore cursor position at the end
      const newRange = document.createRange();
      const textNode = editorRef.current.childNodes[0] || editorRef.current;
      const endOffset = textNode.textContent ? textNode.textContent.length : 0;
      
      if (textNode.nodeType === Node.TEXT_NODE) {
        newRange.setStart(textNode, Math.min(startOffset, endOffset));
        newRange.setEnd(textNode, Math.min(startOffset, endOffset));
      } else {
        newRange.selectNodeContents(editorRef.current);
        newRange.collapse(false);
      }
      
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  }, []);

  // Get plain text content
  const getPlainText = useCallback(() => {
    if (editorRef.current) {
      return editorRef.current.textContent || '';
    }
    return '';
  }, []);

  // Get HTML content
  const getHtmlContent = useCallback(() => {
    return content;
  }, [content]);

  // Clear editor
  const clearEditor = useCallback(() => {
    setContent('');
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  }, []);

  // Insert text at cursor
  const insertText = useCallback((text) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertText', false, text);
      updateContent();
    }
  }, [updateContent]);

  // Insert HTML at cursor
  const insertHtml = useCallback((html) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, html);
      updateContent();
    }
  }, [updateContent]);

  // Check if text is selected
  const hasSelection = useCallback(() => {
    const selection = window.getSelection();
    return selection && selection.toString().length > 0;
  }, []);

  // Get selected text
  const getSelectedText = useCallback(() => {
    const selection = window.getSelection();
    return selection ? selection.toString() : '';
  }, []);

  // Replace selected text
  const replaceSelection = useCallback((newText) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertText', false, newText);
      updateContent();
    }
  }, [updateContent]);

  // Formatting functions
  const formatting = {
    bold: () => formatText('bold'),
    italic: () => formatText('italic'),
    underline: () => formatText('underline'),
    strikethrough: () => formatText('strikeThrough'),
    justifyLeft: () => formatText('justifyLeft'),
    justifyCenter: () => formatText('justifyCenter'),
    justifyRight: () => formatText('justifyRight'),
    justifyFull: () => formatText('justifyFull'),
    insertOrderedList: () => formatText('insertOrderedList'),
    insertUnorderedList: () => formatText('insertUnorderedList'),
    indent: () => formatText('indent'),
    outdent: () => formatText('outdent'),
    removeFormat: () => formatText('removeFormat'),
    fontSize: (size) => formatText('fontSize', size),
    fontName: (font) => formatText('fontName', font),
    foreColor: (color) => formatText('foreColor', color),
    backColor: (color) => formatText('backColor', color)
  };

  // Check current formatting state
  const getFormattingState = useCallback(() => {
    if (!editorRef.current) return {};

    return {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikethrough: document.queryCommandState('strikeThrough'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
      justifyFull: document.queryCommandState('justifyFull'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList')
    };
  }, []);

  return {
    content,
    isFocused,
    editorRef,
    setContent,
    setEditorContent,
    handleContentChange,
    handleFocus,
    handleBlur,
    handleKeyDown,
    getPlainText,
    getHtmlContent,
    clearEditor,
    insertText,
    insertHtml,
    hasSelection,
    getSelectedText,
    replaceSelection,
    formatting,
    getFormattingState,
    updateContent
  };
};
