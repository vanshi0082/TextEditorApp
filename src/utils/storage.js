// Local storage utilities for note persistence
export const STORAGE_KEYS = {
  NOTES: 'shareable_notes_app_notes',
  SETTINGS: 'shareable_notes_app_settings'
};

export const storage = {
  // Get data from localStorage
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  // Set data to localStorage
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },

  // Remove data from localStorage
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  // Clear all app data
  clear: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// Note management utilities
export const noteStorage = {
  // Get all notes
  getAllNotes: () => {
    return storage.get(STORAGE_KEYS.NOTES) || [];
  },

  // Save all notes
  saveAllNotes: (notes) => {
    return storage.set(STORAGE_KEYS.NOTES, notes);
  },

  // Get a specific note by ID
  getNote: (id) => {
    const notes = noteStorage.getAllNotes();
    return notes.find(note => note.id === id);
  },

  // Save a single note
  saveNote: (note) => {
    const notes = noteStorage.getAllNotes();
    const existingIndex = notes.findIndex(n => n.id === note.id);
    
    if (existingIndex >= 0) {
      notes[existingIndex] = note;
    } else {
      notes.push(note);
    }
    
    return noteStorage.saveAllNotes(notes);
  },

  // Delete a note
  deleteNote: (id) => {
    const notes = noteStorage.getAllNotes();
    const filteredNotes = notes.filter(note => note.id !== id);
    return noteStorage.saveAllNotes(filteredNotes);
  },

  // Get pinned notes
  getPinnedNotes: () => {
    const notes = noteStorage.getAllNotes();
    return notes.filter(note => note.pinned);
  },

  // Get unpinned notes
  getUnpinnedNotes: () => {
    const notes = noteStorage.getAllNotes();
    return notes.filter(note => !note.pinned);
  },

  // Search notes
  searchNotes: (query) => {
    const notes = noteStorage.getAllNotes();
    const lowercaseQuery = query.toLowerCase();
    
    return notes.filter(note => 
      note.title.toLowerCase().includes(lowercaseQuery) ||
      note.content.toLowerCase().includes(lowercaseQuery) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
    );
  }
};



