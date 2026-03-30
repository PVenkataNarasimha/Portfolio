import { useState } from 'react';
import './FileExplorer.css';

interface FileItem {
  name: string;
  type: 'folder' | 'file' | 'link' | 'image';
  content?: string;
  url?: string;
  imagePath?: string;
  children?: FileItem[];
}

const FILE_SYSTEM: FileItem[] = [
  {
    name: 'Projects',
    type: 'folder',
    children: [
      {
        name: 'Rentaly',
        type: 'folder',
        children: [
          { name: 'Rentaly_Live.lnk', type: 'link', url: 'https://github.com/PVenkataNarasimha/Rentaly' },
          { name: 'Screenshot.img', type: 'image', imagePath: '/projects/image.png' },
          { name: 'About_Rentaly.txt', type: 'file', content: "Rentaly – Vehicle Rental Booking System\n\nRentaly is a modern vehicle rental web application built with React, TypeScript, and Vite. It allows users to browse vehicles, book rentals, manage their bookings, and maintain their profile through an interactive dashboard." }
        ]
      },
      {
        name: 'Market Price',
        type: 'folder',
        children: [
          { name: 'Market_Price_Repo.lnk', type: 'link', url: 'https://github.com/PVenkataNarasimha/Market-Price' },
          { name: 'Analytics.img', type: 'image', imagePath: '/projects/image copy.png' },
          { name: 'Market_Price.txt', type: 'file', content: 'Market Price, your modern companion for tracking real-time poultry and market trends. Built for speed, reliability, and a premium user experience. This is a app which build for my father to track the market prices of his poultry farm. ' }
        ]
      },
      { name: 'Neural-Net.txt', type: 'file', content: 'Simulation of a neural network using raw JavaScript and canvas.' },
      { name: 'Dev-Vault.lnk', type: 'link', url: 'https://github.com/PVenkataNarasimha' }
    ]
  },
  {
    name: 'Personal',
    type: 'folder',
    children: [
      { name: 'Profile.txt', type: 'file', content: 'Name: Narasimha Pulipati\nRole: Full Stack Engineer\nSpecialty: React, Node, Cloud Architecture' },
      { name: 'Status.log', type: 'file', content: 'Current status: Implementing File System Explorer. All systems nominal.' }
    ]
  },
  {
    name: 'System',
    type: 'folder',
    children: [
      { name: 'Secret_Notes.md', type: 'file', content: '# ENCRYPTED\nIf you see this, you have bypassed level 3 security. The "Curiosity" card is just a decoy.' }
    ]
  }
];

export default function FileExplorer() {
  const [currentFolder, setCurrentFolder] = useState<FileItem | null>(null);
  const [pathStack, setPathStack] = useState<FileItem[]>([]);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const folders = currentFolder ? currentFolder.children || [] : FILE_SYSTEM;
  const currentPathName = pathStack.length > 0 ? pathStack.map(f => f.name).join(' / ') : 'Root';

  const handleFolderClick = (folder: FileItem) => {
    setPathStack([...pathStack, folder]);
    setCurrentFolder(folder);
    setPreviewFile(null);
  };

  const handleBack = () => {
    const newStack = [...pathStack];
    newStack.pop();
    setPathStack(newStack);
    setCurrentFolder(newStack.length > 0 ? newStack[newStack.length - 1] : null);
    setPreviewFile(null);
  };

  const handleItemClick = (item: FileItem) => {
    if (item.type === 'folder') {
      handleFolderClick(item);
    } else if (item.type === 'file' || item.type === 'image') {
      setPreviewFile(item);
    } else if (item.type === 'link' && item.url) {
      window.open(item.url, '_blank');
    }
  };

  return (
    <div className="file-explorer-container">
      <div className="explorer-sidebar">
        <div className="sidebar-section">
          <div className="sidebar-title">Locations</div>
          <div className={`sidebar-item ${!currentFolder ? 'active' : ''}`} onClick={() => { setCurrentFolder(null); setPathStack([]); setPreviewFile(null); }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            Home
          </div>
          {FILE_SYSTEM.map(folder => (
            <div
              key={folder.name}
              className={`sidebar-item ${currentFolder?.name === folder.name ? 'active' : ''}`}
              onClick={() => { setCurrentFolder(folder); setPathStack([folder]); setPreviewFile(null); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z" /></svg>
              {folder.name}
            </div>
          ))}
        </div>
      </div>

      <div className="explorer-main">
        <div className="explorer-toolbar">
          <button className="toolbar-btn" onClick={handleBack} disabled={pathStack.length === 0}>←</button>
          <div className="breadcrumb">{currentPathName}</div>
        </div>

        <div className="explorer-grid">
          {folders.map(item => (
            <div key={item.name} className="icon-item" onClick={() => handleItemClick(item)}>
              <div className="icon-graphic">
                {item.type === 'folder' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="rgba(0, 255, 65, 0.1)" stroke="#00ff41" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z" /></svg>
                ) : item.type === 'link' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00ff41" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                ) : item.type === 'image' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00ff41" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a4cead" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14.5 2 14.5 7.5 20 7.5" /></svg>
                )}
              </div>
              <div className="icon-label">{item.name}</div>
            </div>
          ))}
        </div>

        {previewFile && (
          <div className="file-preview-panel glass">
            <div className="preview-header">
              <span>{previewFile.name}</span>
              <button onClick={() => setPreviewFile(null)}>×</button>
            </div>
            <div className="preview-body">
              {previewFile.type === 'image' && previewFile.imagePath ? (
                <img src={previewFile.imagePath} alt={previewFile.name} className="preview-image" />
              ) : (
                previewFile.content
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
