import "./ChatWindow.css";
import { BookIcon } from "../components/Icons";

export const CommunitiesView = ({ className }) => {
  return (
    <div className={"chat-window-container " + className}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Communities</h2>
          <button className="new-chat-button">+</button>
        </div>
        
        <div className="search-container">
          <div className="search-box">
            <span>🔍</span>
            <input type="text" placeholder="Search communities..." />
          </div>
        </div>

        <div className="chat-list">
          <div className="chat-list-item active">
            <div className="chat-title">Quran Study Group</div>
            <div className="chat-preview">Brother Ahmad: SubhanAllah, the depth of Surah Al-Kahf never ceases to amaze...</div>
            <div className="chat-time">Just now</div>
          </div>
          <div className="chat-list-item">
            <div className="chat-title">Islamic Literature</div>
            <div className="chat-preview">Sister Aisha: Has anyone read "Reclaim Your Heart" by Yasmin Mogahed?...</div>
            <div className="chat-time">2h ago</div>
          </div>
          <div className="chat-list-item">
            <div className="chat-title">Poetry Enthusiasts</div>
            <div className="chat-preview">Discussing the works of Rumi and their spiritual significance in modern...</div>
            <div className="chat-time">Yesterday</div>
          </div>
          <div className="chat-list-item">
            <div className="chat-title">Book Recommendations</div>
            <div className="chat-preview">Top Islamic books for personal development and spiritual growth...</div>
            <div className="chat-time">2d ago</div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        <div className="chat-header">
          <div className="community-header">
            <BookIcon />
            <h3>Quran Study Group</h3>
            <span className="member-count">127 members</span>
          </div>
          <div className="header-actions">
            <button className="search-button">🔍</button>
            <button className="menu-button">⋮</button>
          </div>
        </div>

        <div className="chat-messages">
          <div className="message">
            <img className="message-avatar" src="/ahmad-avatar.png" alt="Ahmad" />
            <div className="message-content">
              <div className="message-header">
                <span className="message-sender">Brother Ahmad</span>
                <span className="message-time">Just now</span>
              </div>
              <p>SubhanAllah, the depth of Surah Al-Kahf never ceases to amaze me. The story of the People of the Cave teaches us so much about faith and patience.</p>
            </div>
          </div>

          <div className="message">
            <img className="message-avatar" src="/fatima-avatar.png" alt="Fatima" />
            <div className="message-content">
              <div className="message-header">
                <span className="message-sender">Sister Fatima</span>
                <span className="message-time">2 min ago</span>
              </div>
              <p>Yes! And the story of Dhul-Qarnayn shows us how to handle power with justice and humility. Would anyone like to share their reflections on these lessons?</p>
            </div>
          </div>
        </div>

        <div className="chat-input">
          <div className="input-box">
            <input 
              type="text" 
              placeholder="Share your thoughts with the community..."
            />
            <button className="voice-input">🎤</button>
          </div>
        </div>
      </div>
    </div>
  );
}; 