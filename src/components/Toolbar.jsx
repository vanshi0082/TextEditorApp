import React, { useState, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Lock,
  Unlock,
  Sparkles,
  Tag,
  FileText,
  Shield,
  MoreHorizontal
} from 'lucide-react';
import { noteEncryption } from '../utils/encryption';
import './Toolbar.css';

const Toolbar = ({ note, onNoteUpdate }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [showAIFeatures, setShowAIFeatures] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [highlightedTerms, setHighlightedTerms] = useState([]);
  const [grammarErrors, setGrammarErrors] = useState([]);
  const [formattingState, setFormattingState] = useState({});

  // Format text with execCommand
  const formatText = (command, value = null) => {
    const success = document.execCommand(command, false, value);
    if (success) {
      updateFormattingState();
    }
  };

  // Update formatting state
  const updateFormattingState = () => {
    setFormattingState({
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
    });
  };

  // Update formatting state on selection change
  useEffect(() => {
    const handleSelectionChange = () => {
      updateFormattingState();
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  // Handle encryption
  const handleEncrypt = () => {
    if (!password.trim()) {
      alert('Please enter a password.');
      return;
    }

    if (note.encrypted) {
      // Decrypt note
      try {
        const decryptedNote = noteEncryption.decryptNote(note, password);
        onNoteUpdate({
          content: decryptedNote.content,
          encrypted: false,
          passwordHash: null
        });
        setPassword('');
        setShowPasswordModal(false);
        alert('Note decrypted successfully!');
      } catch (error) {
        console.error('Decryption error:', error);
        alert('Invalid password. Please try again.');
      }
    } else {
      // Encrypt note
      try {
        const encryptedNote = noteEncryption.encryptNote(note, password);
        onNoteUpdate({
          content: encryptedNote.content,
          encrypted: true,
          passwordHash: encryptedNote.passwordHash
        });
        setPassword('');
        setShowPasswordModal(false);
        alert('Note encrypted successfully!');
      } catch (error) {
        console.error('Encryption error:', error);
        alert('Failed to encrypt note. Please try again.');
      }
    }
  };

  // Handle highlighting terms
  const handleHighlightTerms = (terms) => {
    setHighlightedTerms(terms);
  };

  // Handle grammar errors
  const handleShowGrammarErrors = (errors) => {
    setGrammarErrors(errors);
  };

  const formatButtons = [
    {
      id: 'bold',
      icon: Bold,
      command: 'bold',
      title: 'Bold (Ctrl+B)',
      action: () => formatText('bold')
    },
    {
      id: 'italic',
      icon: Italic,
      command: 'italic',
      title: 'Italic (Ctrl+I)',
      action: () => formatText('italic')
    },
    {
      id: 'underline',
      icon: Underline,
      command: 'underline',
      title: 'Underline (Ctrl+U)',
      action: () => formatText('underline')
    }
  ];

  const alignmentButtons = [
    {
      id: 'alignLeft',
      icon: AlignLeft,
      command: 'justifyLeft',
      title: 'Align Left',
      action: () => formatText('justifyLeft')
    },
    {
      id: 'alignCenter',
      icon: AlignCenter,
      command: 'justifyCenter',
      title: 'Align Center',
      action: () => formatText('justifyCenter')
    },
    {
      id: 'alignRight',
      icon: AlignRight,
      command: 'justifyRight',
      title: 'Align Right',
      action: () => formatText('justifyRight')
    }
  ];

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <div className="toolbar-group">
          {formatButtons.map(button => (
            <button
              key={button.id}
              className={`toolbar-btn ${formattingState[button.command] ? 'active' : ''}`}
              onClick={button.action}
              title={button.title}
            >
              <button.icon size={16} />
            </button>
          ))}
        </div>

        <div className="toolbar-group">
          {alignmentButtons.map(button => (
            <button
              key={button.id}
              className={`toolbar-btn ${formattingState[button.command] ? 'active' : ''}`}
              onClick={button.action}
              title={button.title}
            >
              <button.icon size={16} />
            </button>
          ))}
        </div>

        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => formatText('insertOrderedList')}
            title="Numbered List"
          >
            <span className="list-icon">1.</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => formatText('insertUnorderedList')}
            title="Bullet List"
          >
            <span className="list-icon">•</span>
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => setShowPasswordModal(true)}
            title={note.encrypted ? 'Decrypt Note' : 'Encrypt Note'}
          >
            {note.encrypted ? <Unlock size={16} /> : <Lock size={16} />}
          </button>
        </div>

        <div className="toolbar-group">
          
            
        </div>
      </div>

      {/* AI Features Panel */}
      {showAIFeatures && (
        <div className="ai-features-panel">
          <div className="ai-features-header">
            <h3>AI Features</h3>
            
          </div>
          <AIFeatures
            note={note}
            onNoteUpdate={onNoteUpdate}
            onHighlightTerms={handleHighlightTerms}
            onShowGrammarErrors={handleShowGrammarErrors}
          />
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="password-modal">
            <div className="modal-header">
              <h3>{note.encrypted ? 'Decrypt Note' : 'Encrypt Note'}</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <p>
                {note.encrypted 
                  ? 'Enter the password to decrypt this note:'
                  : 'Enter a password to encrypt this note:'
                }
              </p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={note.encrypted ? "Enter decryption password" : "Enter encryption password"}
                className="password-input"
                onKeyPress={(e) => e.key === 'Enter' && handleEncrypt()}
                autoFocus
              />
              {!note.encrypted && (
                <p className="password-hint">
                  ⚠️ Make sure to remember this password. You won't be able to access the note without it.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleEncrypt}
                disabled={!password.trim()}
              >
                {note.encrypted ? 'Decrypt' : 'Encrypt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;