import CryptoJS from 'crypto-js';

// Encryption utilities for note security
export const encryption = {
  // Encrypt text with password
  encrypt: (text, password) => {
    try {
      const encrypted = CryptoJS.AES.encrypt(text, password).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt note');
    }
  },

  // Decrypt text with password
  decrypt: (encryptedText, password) => {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedText, password);
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedText) {
        throw new Error('Invalid password or corrupted data');
      }
      
      return decryptedText;
    } catch (error) {
      console.error('Decryption error:', error);
      // Add more specific error message for debugging
      if (error.message.includes('Malformed UTF-8 data')) {
        throw new Error('Invalid password.');
      }
      throw new Error('Failed to decrypt note. Please check your password.');
    }
  },

  // Generate a secure random password
  generatePassword: (length = 16) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return password;
  },

  // Hash password for storage (one-way)
  hashPassword: (password) => {
    return CryptoJS.SHA256(password).toString();
  },

  // Verify password hash
  verifyPassword: (password, hash) => {
    return CryptoJS.SHA256(password).toString() === hash;
  }
};

// Note encryption wrapper
export const noteEncryption = {
  // Encrypt a note
  encryptNote: (note, password) => {
    const encryptedContent = encryption.encrypt(note.content, password);
    return {
      ...note,
      content: encryptedContent,
      encrypted: true,
      passwordHash: encryption.hashPassword(password)
    };
  },

  // Decrypt a note
  decryptNote: (encryptedNote, password) => {
    if (!encryptedNote.encrypted) {
      return encryptedNote;
    }

    // If we have a stored password hash, verify first; otherwise attempt decryption directly
    if (encryptedNote.passwordHash) {
      if (!encryption.verifyPassword(password, encryptedNote.passwordHash)) {
        throw new Error('Invalid password');
      }
    }

    const decryptedContent = encryption.decrypt(encryptedNote.content, password);
    return {
      ...encryptedNote,
      content: decryptedContent,
      // Keep encrypted flag as true, but provide decrypted content
      // The parent component will be responsible for updating the note state
    };
  },

  // Check if note is encrypted
  isEncrypted: (note) => {
    return note.encrypted === true;
  }
};