import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Toolbar from './components/Toolbar';
import { useNotes } from './hooks/useNotes';
import './App.css';

function App() {
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    searchNotes,
    getPinnedNotes,
    getUnpinnedNotes
  } = useNotes();

  // Get current note
  const currentNote = notes.find(note => note.id === selectedNoteId);

  // Handle note selection
  const handleNoteSelect = (noteId) => {
    setSelectedNoteId(noteId);
  };

  // Handle note creation
  const handleCreateNote = () => {
    const newNote = createNote({
      title: 'New Note',
      content: ''
    });
    setSelectedNoteId(newNote.id);
  };

  // Handle note update
  const handleNoteUpdate = (updates) => {
    if (selectedNoteId) {
      updateNote(selectedNoteId, updates);
    }
  };

  // Handle note deletion
  const handleNoteDelete = (noteId) => {
    deleteNote(noteId);
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null);
    }
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Get filtered notes
  const getFilteredNotes = () => {
    if (searchQuery.trim()) {
      return searchNotes(searchQuery);
    }
    return notes;
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading your notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Reload App
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Mobile menu button */}
      <button 
        className="mobile-menu-btn"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        notes={getFilteredNotes()}
        pinnedNotes={getPinnedNotes()}
        unpinnedNotes={getUnpinnedNotes()}
        selectedNoteId={selectedNoteId}
        searchQuery={searchQuery}
        onNoteSelect={handleNoteSelect}
        onNoteCreate={handleCreateNote}
        onNoteDelete={handleNoteDelete}
        onSearch={handleSearch}
        onTogglePin={togglePin}
      />

      {/* Main content */}
      <div className="main-content">
        {currentNote ? (
          <>
            <Toolbar
              note={currentNote}
              onNoteUpdate={handleNoteUpdate}
            />
            <Editor
              note={currentNote}
              onNoteUpdate={handleNoteUpdate}
            />
          </>
        ) : (
          <div className="welcome-screen">
            <div className="welcome-content">
              <h1>Welcome to Shareable Notes</h1>
              <p>Your AI-powered note-taking companion</p>
              <div className="welcome-features">
                <div className="feature">
                  <div className="feature-icon">🤖</div>
                  <h3>AI-Powered</h3>
                  <p>Smart summaries, grammar check, and intelligent tagging</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">🔒</div>
                  <h3>Secure</h3>
                  <p>Encrypt your notes with password protection</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">📝</div>
                  <h3>Rich Editor</h3>
                  <p>Format your notes with our custom rich text editor</p>
                </div>
              </div>
              <button 
                className="create-first-note-btn"
                onClick={handleCreateNote}
              >
                Create Your First Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;



