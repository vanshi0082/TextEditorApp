import React, { useState } from 'react';
import { Search, Plus, Pin, PinOff, Trash2, MoreVertical } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({
  isOpen,
  onToggle,
  notes,
  pinnedNotes,
  unpinnedNotes,
  selectedNoteId,
  searchQuery,
  onNoteSelect,
  onNoteCreate,
  onNoteDelete,
  onSearch,
  onTogglePin
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleSearchChange = (e) => {
    onSearch(e.target.value);
  };

  const handleNoteClick = (noteId) => {
    onNoteSelect(noteId);
  };

  const handleCreateNote = () => {
    onNoteCreate();
  };

  const handleDeleteNote = (noteId, e) => {
    e.stopPropagation();
    if (showDeleteConfirm === noteId) {
      onNoteDelete(noteId);
      setShowDeleteConfirm(null);
    } else {
      setShowDeleteConfirm(noteId);
    }
  };

  const handleTogglePin = (noteId, e) => {
    e.stopPropagation();
    onTogglePin(noteId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const NoteItem = ({ note, isPinned = false }) => {
    const isSelected = selectedNoteId === note.id;
    const isEncrypted = note.encrypted;

    return (
      <div
        className={`note-item ${isSelected ? 'selected' : ''} ${isEncrypted ? 'encrypted' : ''}`}
        onClick={() => handleNoteClick(note.id)}
      >
        <div className="note-header">
          <div className="note-title">
            {isPinned && <Pin className="pin-icon" size={14} />}
            <span className="title-text">{note.title}</span>
            {isEncrypted && <span className="encrypted-badge">🔒</span>}
          </div>
          <div className="note-actions">
            <button
              className="action-btn pin-btn"
              onClick={(e) => handleTogglePin(note.id, e)}
              title={note.pinned ? 'Unpin note' : 'Pin note'}
            >
              {note.pinned ? <PinOff size={14} /> : <Pin size={14} />}
            </button>
            <button
              className="action-btn delete-btn"
              onClick={(e) => handleDeleteNote(note.id, e)}
              title="Delete note"
            >
              {showDeleteConfirm === note.id ? (
                <span className="confirm-text">✓</span>
              ) : (
                <Trash2 size={14} />
              )}
            </button>
          </div>
        </div>
        
        <div className="note-content">
          <p className="note-preview">
            {isEncrypted 
              ? '🔒 Encrypted content' 
              : truncateText(note.content.replace(/<[^>]*>/g, ''), 80)
            }
          </p>
        </div>
        
        <div className="note-footer">
          <span className="note-date">{formatDate(note.updatedAt)}</span>
          {note.tags && note.tags.length > 0 && (
            <div className="note-tags">
              {note.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
              {note.tags.length > 2 && (
                <span className="tag-more">+{note.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onToggle}></div>
      )}
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Notes</h2>
          <button
            className="create-note-btn"
            onClick={handleCreateNote}
            title="Create new note"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <div className="notes-container">
          {/* Pinned notes */}
          {pinnedNotes.length > 0 && (
            <div className="notes-section">
              <h3 className="section-title">
                <Pin size={16} />
                Pinned Notes
              </h3>
              <div className="notes-list">
                {pinnedNotes.map(note => (
                  <NoteItem key={note.id} note={note} isPinned={true} />
                ))}
              </div>
            </div>
          )}

          {/* Regular notes */}
          {unpinnedNotes.length > 0 && (
            <div className="notes-section">
              <h3 className="section-title">
                All Notes
              </h3>
              <div className="notes-list">
                {unpinnedNotes.map(note => (
                  <NoteItem key={note.id} note={note} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {notes.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No notes yet</h3>
              <p>Create your first note to get started</p>
              <button
                className="create-first-note-btn"
                onClick={handleCreateNote}
              >
                Create Note
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;



