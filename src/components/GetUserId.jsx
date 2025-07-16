'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy } from 'lucide-react'; // optional icons

export default function GetUserIdButton() {
  const { data: session } = useSession();
  const [showPopup, setShowPopup] = useState(false);
  const [copied, setCopied] = useState(false);

  const userId = session?.user_id;

  const handleClick = () => {
    if (userId) {
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  const handleCopy = async () => {
    if (userId) {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full py-3 px-4 bg-blue-500 text-white font-semibold rounded-xl shadow-md hover:bg-blue-600 transition"
      >
        Get User ID
      </motion.button>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="absolute top-14 bg-white shadow-xl border border-gray-300 px-4 py-3 rounded-xl flex items-center space-x-2"
          >
            <span className="text-sm font-mono text-gray-800">{userId}</span>
            <button
              onClick={handleCopy}
              className="text-blue-600 hover:text-blue-800 transition"
              title="Copy to clipboard"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
