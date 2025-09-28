import React, { useState, useEffect, useRef, useMemo } from "react";
import { noteEncryption } from "../utils/encryption";
import "./Editor.css";

// Debounce function
const debounce = (func, delay) => {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

const Editor = ({ note, onNoteUpdate }) => {
  const [title, setTitle] = useState("");
  const [localContent, setLocalContent] = useState("");
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [isDecrypted, setIsDecrypted] = useState(false);

  const editorRef = useRef(null);
  const isFocusedRef = useRef(false);
  const currentNoteId = useRef(null);

  // Effect to handle incoming note changes from parent
  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      const isEncrypted = note.encrypted;

      setIsDecrypted(!isEncrypted);
      setShowPasswordPrompt(isEncrypted);

      // Only update local content if the note has changed or it's not focused
      // This prevents overwriting user input
      if (note.id !== currentNoteId.current || !isFocusedRef.current) {
        const nextContent = isEncrypted ? "" : note.content || "";
        setLocalContent(nextContent);
        currentNoteId.current = note.id;
        // Push content to DOM only when not focused to avoid caret jumps
        if (editorRef.current && !isFocusedRef.current) {
          editorRef.current.innerHTML = nextContent;
        }
      }
    } else {
      // Clear editor when no note is selected
      setTitle("");
      setLocalContent("");
      currentNoteId.current = null;
    }
  }, [note]);

  // Debounced save function
  const debouncedUpdate = useMemo(
    () => debounce((updates) => onNoteUpdate(updates), 500),
    [onNoteUpdate]
  );

  // Handle title changes
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debouncedUpdate({ title: newTitle });
  };

  // Handle content changes
  const handleContentChange = (e) => {
    const newContent = e.target.innerHTML;
    setLocalContent(newContent);
    debouncedUpdate({ content: newContent });
  };

  // Keep DOM in sync when localContent changes while not focused (e.g., external updates)
  useEffect(() => {
    if (editorRef.current && !isFocusedRef.current) {
      if (editorRef.current.innerHTML !== localContent) {
        editorRef.current.innerHTML = localContent || "";
      }
    }
  }, [localContent]);

  // Handle password submission for encrypted notes
  const handlePasswordSubmit = () => {
    if (!password.trim()) {
      alert("Please enter a password.");
      return;
    }
    try {
      const decrypted = noteEncryption.decryptNote(note, password);
      // Immediately update the note to be decrypted
      onNoteUpdate({
        content: decrypted.content,
        encrypted: false,
        passwordHash: null,
      });
      setPassword("");
    } catch (error) {
      alert(error.message || "Invalid password. Please try again.");
    }
  };

  const getPlainText = () => {
    if (!editorRef.current) return "";
    return editorRef.current.textContent || "";
  };

  // Render password prompt if necessary
  if (showPasswordPrompt && !isDecrypted) {
    return (
      <div className="editor-container">
        <div className="password-prompt">
          <div className="password-prompt-content">
            <div className="lock-icon">🔒</div>
            <h3>This note is encrypted</h3>
            <p>Enter the password to view and edit this note:</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="password-input"
              onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
              autoFocus
            />
            <div className="password-actions">
              <button
                className="btn-primary"
                onClick={handlePasswordSubmit}
                disabled={!password.trim()}
              >
                Decrypt
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="title-container">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          onFocus={() => (isFocusedRef.current = true)}
          onBlur={() => (isFocusedRef.current = false)}
          placeholder="Untitled Note"
          className="title-input"
        />
      </div>

      <div className="content-container">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          onFocus={() => (isFocusedRef.current = true)}
          onBlur={() => (isFocusedRef.current = false)}
          className="content-editor"
          data-placeholder="Start writing your note..."
          suppressContentEditableWarning={true}
        />
      </div>

      <div className="editor-status">
        <div className="status-info">
          <span className="word-count">
            {getPlainText().split(/\s+/).filter(Boolean).length} words
          </span>
          <span className="char-count">{getPlainText().length} characters</span>
        </div>
      </div>
    </div>
  );
};

export default Editor;
