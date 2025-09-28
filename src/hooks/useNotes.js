import { useState, useEffect, useCallback } from 'react';
import { noteStorage } from '../utils/storage';
import { noteEncryption } from '../utils/encryption';

// Custom hook for note management
export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load notes from storage
  const loadNotes = useCallback(() => {
    try {
      const storedNotes = noteStorage.getAllNotes();
      setNotes(storedNotes);
      setError(null);
    } catch (err) {
      setError('Failed to load notes');
      console.error('Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save notes to storage
  const saveNotes = useCallback((newNotes) => {
    try {
      noteStorage.saveAllNotes(newNotes);
      setNotes(newNotes);
      setError(null);
    } catch (err) {
      setError('Failed to save notes');
      console.error('Error saving notes:', err);
    }
  }, []);

  // Create a new note
  const createNote = useCallback((noteData) => {
    const newNote = {
      id: Date.now().toString(),
      title: noteData.title || 'Untitled Note',
      content: noteData.content || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
      tags: noteData.tags || [],
      encrypted: false,
      passwordHash: null,
      ...noteData
    };

    const updatedNotes = [...notes, newNote];
    saveNotes(updatedNotes);
    return newNote;
  }, [notes, saveNotes]);

  // Update an existing note
  const updateNote = useCallback((id, updates) => {
    const updatedNotes = notes.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    );
    saveNotes(updatedNotes);
    return updatedNotes.find(note => note.id === id);
  }, [notes, saveNotes]);

  // Delete a note
  const deleteNote = useCallback((id) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    saveNotes(updatedNotes);
  }, [notes, saveNotes]);

  // Toggle pin status
  const togglePin = useCallback((id) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      updateNote(id, { pinned: !note.pinned });
    }
  }, [notes, updateNote]);

  // Search notes
  const searchNotes = useCallback((query) => {
    if (!query.trim()) return notes;
    
    const lowercaseQuery = query.toLowerCase();
    return notes.filter(note => {
      // Skip encrypted notes in search results for security
      if (note.encrypted) return false;
      
      return (
        note.title.toLowerCase().includes(lowercaseQuery) ||
        note.content.toLowerCase().includes(lowercaseQuery) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
      );
    });
  }, [notes]);

  // Get pinned notes
  const getPinnedNotes = useCallback(() => {
    return notes.filter(note => note.pinned);
  }, [notes]);

  // Get unpinned notes
  const getUnpinnedNotes = useCallback(() => {
    return notes.filter(note => !note.pinned);
  }, [notes]);

  // Encrypt a note
  const encryptNote = useCallback((id, password) => {
    const note = notes.find(n => n.id === id);
    if (!note) return null;

    try {
      const encryptedNote = noteEncryption.encryptNote(note, password);
      updateNote(id, encryptedNote);
      return encryptedNote;
    } catch (error) {
      setError('Failed to encrypt note: ' + error.message);
      return null;
    }
  }, [notes, updateNote]);

  // Decrypt a note
  const decryptNote = useCallback((id, password) => {
    const note = notes.find(n => n.id === id);
    if (!note || !note.encrypted) return note;

    try {
      const decryptedNote = noteEncryption.decryptNote(note, password);
      updateNote(id, decryptedNote);
      return decryptedNote;
    } catch (error) {
      setError('Failed to decrypt note: ' + error.message);
      return null;
    }
  }, [notes, updateNote]);

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    searchNotes,
    getPinnedNotes,
    getUnpinnedNotes,
    encryptNote,
    decryptNote,
    loadNotes
  };
};



