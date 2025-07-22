'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, User } from 'lucide-react'; // Using lucide-react for icons

export default function GetUserIdButton() {
  const { data: session } = useSession();
  const [showId, setShowId] = useState(false);
  const [copied, setCopied] = useState(false);

  const userId = session?.user_id;

  const handleClick = () => {
    if (userId) {
      setShowId(true);
      setTimeout(() => setShowId(false), 5000);
    }
  };

  const handleCopy = async (e) => {
    e.stopPropagation(); 
    if (userId) {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const cardVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center hover:bg-gray-800 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-blue-500/20 cursor-pointer flex items-center justify-center min-h-[160px] overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {!showId ? (
          <motion.div
            key="default"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="flex justify-center mb-3 text-blue-400 group-hover:text-blue-300 transition-colors">
              <User size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-100 mb-2">Get User ID</h3>
            <p className="text-gray-400 text-sm">Retrieve your unique development identifier.</p>
          </motion.div>
        ) : (
          <motion.div
            key="showId"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Your User ID</p>
            <div className="flex items-center space-x-3 bg-gray-900/70 px-4 py-2 rounded-lg">
              <span className="text-lg font-mono text-teal-300">{userId}</span>
              <button
                onClick={handleCopy}
                className="transition-transform duration-200 active:scale-90"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check size={18} className="text-green-400" />
                ) : (
                  <Copy size={18} className="text-gray-400 hover:text-white" />
                )}
              </button>
            </div>
            {copied && <p className="text-xs text-green-400 mt-2">Copied!</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}