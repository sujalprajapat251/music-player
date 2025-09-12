import React from "react";

const OpenProjectModal = ({ open, onClose, projects = [], onOpen, selectedProject, onSelect, excludeUntitled, onToggleExclude }) => {
  return (
    open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div className="bg-[#181818] rounded-xl shadow-2xl w-full max-w-2xl p-8 relative">
          <button
            className="absolute top-6 right-6 text-gray-400 text-2xl font-bold hover:text-gray-600"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="font-bold text-2xl text-white mb-6">Open project</h2>
          <div className="flex items-center gap-4 mb-6">
            <label className="flex items-center gap-2 text-gray-300 text-base">
              <input type="checkbox" checked={excludeUntitled} onChange={onToggleExclude} />
              Exclude untitled projects
            </label>
            <input
              type="text"
              placeholder="Search projects"
              className="bg-[#232323] text-white px-4 py-2 rounded w-64 border border-[#232323] focus:outline-none"
            />
          </div>
          <div className="bg-[#232323] rounded-lg overflow-hidden mb-6">
            <div className="grid grid-cols-2 px-6 py-3 border-b border-[#232323] text-gray-400 text-sm">
              <span>Project</span>
              <span className="text-right">Last Modified</span>
            </div>
            {projects.length === 0 ? (
              <div className="px-6 py-8 text-gray-500 text-center">No projects found.</div>
            ) : (
              projects.map((project, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-2 items-center px-6 py-4 border-b border-[#232323] cursor-pointer ${selectedProject === idx ? 'bg-[#232323]' : ''}`}
                  onClick={() => onSelect(idx)}
                >
                  <div className="flex items-center gap-4">
                    <button className="w-10 h-10 rounded-lg bg-[#232323] flex items-center justify-center">
                      <span className="text-gray-400 text-xl">▶</span>
                    </button>
                    <span className="text-white text-base">{project.name}</span>
                  </div>
                  <span className="text-gray-300 text-right">{project.lastModified}</span>
                </div>
              ))
            )}
          </div>
          <div className="flex items-center justify-between mt-6">
            <span className="text-gray-400 text-sm">Projects 1-{projects.length} of {projects.length}</span>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded bg-[#232323] text-gray-400 flex items-center justify-center">&#60;</button>
              <button className="w-8 h-8 rounded bg-[#232323] text-gray-400 flex items-center justify-center">&#62;</button>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-2 rounded-full bg-[#232323] border border-gray-600 text-gray-300 font-medium hover:bg-[#232323]" onClick={onClose}>Cancel</button>
              <button
                className={`px-6 py-2 rounded-full bg-[#6c2bd7] text-white font-medium ${selectedProject === null ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#4b1fa3]'} `}
                disabled={selectedProject === null}
                onClick={() => selectedProject !== null && onOpen(projects[selectedProject])}
              >
                Open
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default OpenProjectModal;
