'use client';

import { useState } from 'react';
import { MessageSquare, Plus, Loader2, Send } from 'lucide-react';
import { Note } from '@/lib/types';

interface WorkerNotesProps {
  workerId: string;
  notes: Note[];
}

export default function WorkerNotes({ workerId, notes: initialNotes }: WorkerNotesProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    setLoading(true);
    
    try {
      const res = await fetch(`/api/workers/${workerId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotes((prev) => [...prev, data.note]);
        setNewNote('');
        setIsAdding(false);
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '700ms' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold font-display text-white">
            Notes
          </h2>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn-secondary text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </button>
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <div className="mb-6 p-4 rounded-xl bg-dark-900/50 border border-dark-700 animate-slide-up">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a note about this worker..."
            className="input-field min-h-[100px] resize-none mb-3"
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsAdding(false);
                setNewNote('');
              }}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNote}
              disabled={loading || !newNote.trim()}
              className="btn-primary text-sm flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Save Note
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <p className="text-dark-400 text-center py-8">
          No notes yet. Add one to keep track of important information.
        </p>
      ) : (
        <div className="space-y-4">
          {notes.map((note, index) => (
            <div
              key={note.id}
              className="p-4 rounded-xl bg-dark-900/50 border border-dark-800"
              style={{ animationDelay: `${800 + index * 100}ms` }}
            >
              <p className="text-white mb-3">{note.content}</p>
              <div className="flex items-center gap-4 text-sm text-dark-500">
                <span>By {note.createdBy}</span>
                <span>•</span>
                <span>{note.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


