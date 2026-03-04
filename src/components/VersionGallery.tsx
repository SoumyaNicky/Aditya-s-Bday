import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Trash2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';


interface Version {
  id: number;
  friend_name: string;
  version_title: string;
  known_since: number;
  timestamp: string;
}

export default function VersionGallery() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmingPurge, setIsConfirmingPurge] = useState(false);
  const [formData, setFormData] = useState({
    friend_name: '',
    version_title: '',
    known_since: 1996,
  });

  useEffect(() => {
    fetch('/api/versions')
      .then(res => res.json())
      .then(setVersions);

    // Real-time updates removed for Vercel compatibility. Use polling if needed.
  }, []);



  const handleReset = async () => {
    if (!isConfirmingPurge) {
      setIsConfirmingPurge(true);
      setTimeout(() => setIsConfirmingPurge(false), 3000);
      return;
    }

    try {
      setIsConfirmingPurge(false);
      const res = await fetch('/api/versions', { method: 'DELETE' });
      if (res.ok) {
        // State will be updated via socket 'versions_cleared'
        alert('Archives purged successfully.');
      } else {
        const err = await res.text();
        alert('Purge failed: ' + err);
      }
    } catch (err) {
      alert('Error during purge. Check console.');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/versions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      const data = await res.json();
      setVersions(prev => [...prev, data].sort((a, b) => a.known_since - b.known_since));
      setIsFormOpen(false);
      setFormData({
        friend_name: '',
        version_title: '',
        known_since: 1996,
      });
    }
  };

  return (
    <div className="mt-12">
      <div className="flex flex-col mb-8 border-b-2 border-ink pb-4">
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-4xl font-serif font-black uppercase italic tracking-tighter">The Anthology Section</h2>
          <div className="flex gap-4">
            {versions.length > 0 && (
              <button
                onClick={handleReset}
                className={cn(
                  "flex items-center gap-2 border-2 px-4 py-2 font-mono text-[10px] uppercase transition-all group",
                  isConfirmingPurge 
                    ? "bg-red-600 border-red-600 text-white animate-pulse" 
                    : "border-ink hover:bg-red-900 hover:text-paper hover:border-red-900"
                )}
              >
                <Trash2 className="w-3 h-3" />
                <span>{isConfirmingPurge ? "Click again to confirm purge" : "Purge Archives"}</span>
              </button>
            )}
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 border-2 border-ink px-6 py-2 font-mono text-xs uppercase hover:bg-ink hover:text-paper transition-all group"
            >
              <div className="bg-ink text-paper p-1 group-hover:bg-paper group-hover:text-ink transition-colors">
                <Plus className="w-3 h-3" />
              </div>
              <span>Accredit New Reporter</span>
            </button>
          </div>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
          30 Years, 30 Versions: A Retrospective of the Aditya Multiverse
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {versions.map((version, index) => (
          <motion.article
            key={version.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="border-b border-ink/20 pb-8"
          >
            <div className="mb-4">
              <span className="font-mono text-[10px] uppercase text-ink/40 tracking-widest">Edition: {version.known_since}</span>
              <h3 className="text-3xl font-serif font-black leading-[0.9] mb-3 uppercase tracking-tighter">
                {version.version_title}
              </h3>
              <div className="flex items-center gap-2 text-[9px] font-mono uppercase border-y border-ink/20 py-1.5 mb-4">
                <span className="font-black">By {version.friend_name}</span>
                <span className="mx-2 opacity-20">|</span>
                <span>Special Correspondent</span>
                <span className="ml-auto">Mar 4</span>
              </div>
            </div>


          </motion.article>
        ))}
      </div>

      {versions.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed border-ink/10">
          <p className="font-serif italic text-xl opacity-30">Waiting for the first headline...</p>
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-paper p-8 border-4 border-ink shadow-2xl overflow-hidden"
            >
              {/* Press Pass Stamp */}
              <div className="absolute -top-4 -right-4 w-32 h-32 border-4 border-red-900/20 rounded-full flex items-center justify-center rotate-12 pointer-events-none">
                <span className="text-red-900/20 font-mono font-black text-xl uppercase">Approved</span>
              </div>

              <div className="flex justify-between items-center mb-8 border-b-2 border-ink pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-ink text-paper p-2">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h4 className="text-2xl font-serif font-black uppercase">Press Accreditation</h4>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="hover:rotate-90 transition-transform"><X className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">Which version of Aditya have you encountered?</label>
                  <textarea
                    required
                    placeholder="Describe the version... e.g. The one who refused to lose at blitz chess even when his phone was at 1%"
                    className="w-full bg-transparent border-b-2 border-ink py-2 focus:outline-none font-serif text-lg italic resize-none h-24"
                    value={formData.version_title}
                    onChange={e => setFormData({...formData, version_title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block font-mono text-[10px] uppercase mb-1">Reporter Name</label>
                    <input
                      required
                      placeholder="Your Name"
                      className="w-full bg-transparent border-b border-ink py-2 focus:outline-none text-sm"
                      value={formData.friend_name}
                      onChange={e => setFormData({...formData, friend_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase mb-1">Start Year of Observation</label>
                    <input
                      required
                      type="number"
                      min="1996"
                      max="2026"
                      className="w-full bg-transparent border-b border-ink py-2 focus:outline-none text-sm"
                      value={formData.known_since}
                      onChange={e => setFormData({...formData, known_since: parseInt(e.target.value)})}
                    />
                  </div>
                </div>


                <button
                  type="submit"
                  className="w-full bg-ink text-paper py-4 font-serif font-black uppercase tracking-widest hover:bg-ink/90 transition-colors"
                >
                  Publish to Gazette
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
