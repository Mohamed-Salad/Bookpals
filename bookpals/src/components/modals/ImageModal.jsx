import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/solid";

const ImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  // Prevent background scroll when modal is open
  // Note: This is a simple approach; more robust solutions might involve libraries
  // or checking if scrollbars exist before disabling.
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
        onClick={onClose} // Close modal by clicking background
      >
        {/* Modal Content - stopPropagation prevents closing when clicking image */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={imageUrl}
            alt="Enlarged post content"
            className="block max-w-full max-h-[85vh] object-contain" // Allow image to dictate size up to limits
          />
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1.5 bg-gray-800/50 text-white rounded-full hover:bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close image view"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageModal;
