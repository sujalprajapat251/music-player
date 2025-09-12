import React, { useState, useEffect } from "react";

const OpenProjectModal = ({ open, onClose }) => {
  const projects = [
    { name: "Untitled Song", lastModified: "2025/09/12 12:00", waveform: true },
    { name: "Untitled song", lastModified: "2025/09/12 12:00", waveform: false },
    { name: "Untitled song", lastModified: "2025/09/12 10:10", waveform: true },
    { name: "Untitled song", lastModified: "2025/09/11 18:30", waveform: false },
    { name: "Untitled song", lastModified: "2025/09/11 17:20", waveform: false }
  ];

  const [search, setSearch] = useState("");
  const [excludeUntitled, setExcludeUntitled] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // 🔑 Reset selection whenever modal closes
  useEffect(() => {
    if (!open) {
      setSelectedProject(null);
      setSearch("");
    }
  }, [open]);

  let filteredProjects = projects.filter(
    (p) =>
      (!excludeUntitled || !p.name.toLowerCase().includes("untitled")) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  const isOpenDisabled =
    selectedProject === null || filteredProjects.length === 0;

  return (
    open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div className="bg-[#181818] rounded-xl shadow-2xl w-full max-w-2xl p-6 relative">
          <button
            className="absolute top-3 right-5 text-gray-400 text-2xl font-bold hover:text-gray-200"
            onClick={onClose}
          >
            &times;
          </button>

          {/* Header */}
          <div className="flex items-center justify-between mt-2 mb-4">
            <h2 className="font-bold text-2xl text-white mb-1 ml-10">
              Open project
            </h2>
            <input
              type="text"
              placeholder="Search projects"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#232323] text-white px-4 py-2 w-56 mr-8 rounded border border-[#333] focus:outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Exclude toggle */}
          <div className="flex items-center gap-2 mb-3">
            <label className="flex items-center gap-3 text-gray-300 text-sm ml-10">
              <span className="relative inline-block w-10 h-5">
                <input
                  type="checkbox"
                  checked={excludeUntitled}
                  onChange={() => {
                    setExcludeUntitled(!excludeUntitled);
                    setSelectedProject(null); // deselect on toggle
                  }}
                  className="sr-only peer"
                />
                <span className="absolute w-10 h-5 bg-[#232323] rounded-full peer-checked:bg-[#6c2bd7] transition-colors"></span>
                <span
                  className={`absolute left-1 top-1 w-3 h-3 rounded-full bg-gray-400 peer-checked:bg-white transition-transform duration-200 ${
                    excludeUntitled ? "translate-x-5" : ""
                  }`}
                ></span>
              </span>
              Exclude untitled projects
            </label>
          </div>

          <hr className="my-1 border-gray-700" />

          {/* Table Header */}
          <div className="flex justify-between px-6 py-1">
            <span className="text-gray-400 text-md ml-36">Project</span>
            <span className="text-gray-400 text-md">Last Modified</span>
          </div>

          <hr className="my-1 border-gray-700" />

          {/* Projects list */}
          <div className="overflow-y-auto h-[320px]">
            {filteredProjects.length === 0 ? (
              <div className="px-6 py-8 text-gray-500 text-center">
                No projects found.
              </div>
            ) : (
              filteredProjects.map((project, idx) => (
                <div
                  key={idx}
                  className={`flex justify-between items-center px-6 py-4 border-b border-[#232323] cursor-pointer ${
                    selectedProject === idx ? "bg-[#232323]" : ""
                  }`}
                  onClick={() => setSelectedProject(idx)}
                >
                  {/* Left: Play + Project info */}
                  <div className="flex items-center gap-4">
                    <button className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                      <span className="text-gray-300 text-lg">▶</span>
                    </button>
                    <div>
                      <span className="text-white text-sm">{project.name}</span>
                      {project.waveform && (
                        <div className="mt-2 h-6 w-44 bg-[#232323] rounded flex items-center overflow-hidden">
                          <div className="flex h-full w-full">
                            {Array.from({ length: 50 }).map((_, i) => (
                              <div
                                key={i}
                                className="w-[2px] mx-[0.5px] bg-white"
                                style={{ height: `${6 + (i % 12) * 2}px` }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Date */}
                  <span className="text-gray-300 text-sm">
                    {project.lastModified}
                  </span>
                </div>
              ))
            )}
          </div>

          <hr className="my-1 border-gray-700" />

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 mb-1">
            <span className="text-gray-400 text-sm ml-6">
              Projects 1 - {filteredProjects.length} of {filteredProjects.length}
            </span>

            <div className="flex gap-2 mr-32">
              <button className="w-8 h-8 rounded bg-[#232323] text-gray-200 flex items-center justify-center">
                &#60;
              </button>
              <button className="w-8 h-8 rounded bg-[#232323] text-gray-200 flex items-center justify-center">
                &#62;
              </button>
            </div>

            <div className="flex gap-4">
              <button
                className="px-6 py-1 rounded-full bg-[#232323] border border-gray-600 text-gray-300 hover:bg-[#2c2c2c]"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className={`px-6 py-1 rounded-full bg-[#6c2bd7] text-white ${
                  isOpenDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#4b1fa3]"
                }`}
                disabled={isOpenDisabled}
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

