import './CuriosityCard.css';

interface CuriosityCardProps {
  onReopenSystem: () => void;
  onOpenProjects: () => void;
}

export default function CuriosityCard({ onReopenSystem, onOpenProjects }: CuriosityCardProps) {
  return (
    <div className="curiosity-card-content">
      <div className="avatar-circle">
        <img src="/avatar.png" alt="Curiosity Avatar" className="avatar-image" />
      </div>
      <h2 className="curiosity-title">You're really curious, aren't you?</h2>
      <p className="curiosity-text">
        If you got this far I suppose we really want to see my projects.
      </p>
      <div className="curiosity-actions">
        <button className="action-btn primary" onClick={onReopenSystem}>
          Reopen System
        </button>
        <button className="action-btn secondary" onClick={onOpenProjects}>
          See Projects
        </button>
      </div>
    </div>
  );
}
