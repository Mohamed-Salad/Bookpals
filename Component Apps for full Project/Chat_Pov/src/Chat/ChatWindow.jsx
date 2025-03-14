import { useState } from "react";
import "./ChatWindow.css";
import { ChatIcon, GridIcon, SearchIcon, MenuIcon, MicIcon, BookIcon } from "../components/Icons";
import { CommunitiesView } from "./CommunitiesView";

export const ChatWindow = ({ className }) => {
  const [currentView, setCurrentView] = useState('direct'); // 'direct' or 'communities'

  return (
    <div className={"chat-window-container " + className}>
      {/* Left-most panel */}
      <div className="left-most-panel">
        <div className="app-logo">
          <BookIcon />
        </div>
        <button 
          className={"nav-item " + (currentView === 'direct' ? 'active' : '')}
          onClick={() => setCurrentView('direct')}
        >
          <ChatIcon />
        </button>
        <button 
          className={"nav-item " + (currentView === 'communities' ? 'active' : '')}
          onClick={() => setCurrentView('communities')}
        >
          <GridIcon />
        </button>
        <div className="user-profile">
          <div className="avatar-circle">
            <span>AB</span>
          </div>
        </div>
      </div>

      {currentView === 'communities' ? (
        <CommunitiesView />
      ) : (
        <>
          {/* Sidebar for Direct Messages */}
          <div className="sidebar">
            <div className="sidebar-header">
              <h2>My Chats</h2>
              <button className="new-chat-button">+</button>
            </div>
            
            <div className="search-container">
              <div className="search-box">
                <SearchIcon />
                <input type="text" placeholder="Search..." />
              </div>
            </div>

            <div className="chat-list">
              <div className="chat-list-item active">
                <div className="chat-title">Name 1</div>
                <div className="chat-preview">Some 15 billion years ago the universe emerged from a hot, dense sea of...</div>
                <div className="chat-time">9:34 PM</div>
              </div>
              <div className="chat-list-item">
                <div className="chat-title">Name 2</div>
                <div className="chat-preview">Sure! Here are three different versions of 404 error messages for an ecommerce...</div>
                <div className="chat-time">Now</div>
              </div>
              <div className="chat-list-item">
                <div className="chat-title">Name 4</div>
                <div className="chat-preview">A competitive analysis of restaurant delivery mobile applications reveals key insights...</div>
                <div className="chat-time">Thu</div>
              </div>
              <div className="chat-list-item">
                <div className="chat-title">User Personas Research</div>
                <div className="chat-preview">User persona research is a process of creating fictional but realistic representati...</div>
                <div className="chat-time">Mon</div>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="chat-main">
            <div className="chat-header">
              <h3>James</h3>
              <div className="header-actions">
                <button className="search-button"><SearchIcon /></button>
                <button className="menu-button"><MenuIcon /></button>
              </div>
            </div>

            <div className="chat-messages">
              <div className="message">
                <div className="avatar-circle">
                  <span>YU</span>
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-sender">You</span>
                    <span className="message-time">24 Sep ▪ 11:30 PM</span>
                  </div>
                  <p>How do you define usability testing in UX design?</p>
                </div>
              </div>

              <div className="message">
                <div className="avatar-circle">
                  <span>JA</span>
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-sender">James</span>
                    <span className="message-time">24 Sep ▪ 11:30 PM</span>
                  </div>
                  <p>Usability testing is a technique used in user experience (UX) design to evaluate a product or service by testing it with representative users. The purpose of usability testing is to identify any usability problems, collect quantitative and qualitative data on users' experiences, and determine the overall user satisfaction with the product or service.</p>
                </div>
              </div>
            </div>

            <div className="chat-input">
              <div className="input-box">
                <input 
                  type="text" 
                  placeholder="Type your message..."
                />
                <button className="voice-input">
                  <MicIcon />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
