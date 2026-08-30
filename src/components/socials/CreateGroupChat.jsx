import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createGroupConversation } from "../../services/chatService";
import { supabase } from "../../services/supabaseClient";
import { toast } from "react-toastify";

const CreateGroupChat = ({ onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  // Search for users
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setSearching(true);
        // Search for users by username only
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .ilike("username", `%${searchQuery}%`)
          .limit(10);

        if (error) throw error;

        // Filter out current user and already selected users
        const filteredData = data.filter(
          (u) =>
            u.id !== user.id &&
            !selectedUsers.some((selected) => selected.id === u.id)
        );

        setSearchResults(filteredData);
      } catch (err) {
        console.error("Error searching users:", err);
      } finally {
        setSearching(false);
      }
    };

    const debounce = setTimeout(() => {
      if (searchQuery) {
        searchUsers();
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, selectedUsers, user?.id]);

  // Add user to selected list
  const addUser = (userData) => {
    setSelectedUsers([...selectedUsers, userData]);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Remove user from selected list
  const removeUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  // Create group chat
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError("Please enter a group name");
      return;
    }

    if (selectedUsers.length < 1) {
      setError("Please add at least one user to the group");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const conversationId = await createGroupConversation(
        user.id,
        groupName,
        selectedUsers.map((u) => u.id)
      );

      // Close modal first
      onClose?.();

      // Then navigate
      navigate(`/chat/${conversationId}`);

      toast.success("Group chat created successfully!");
    } catch (err) {
      console.error("Error creating group chat:", err);
      setError("Failed to create group chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-800">
      <div className="mb-6">
        <label
          htmlFor="groupName"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Group Name
        </label>
        <input
          type="text"
          id="groupName"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* User search */}
      <div className="mb-6">
        <label
          htmlFor="userSearch"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Add Members
        </label>
        <input
          type="text"
          id="userSearch"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by username"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
        />

        {/* Search results */}
        {searching && (
          <div className="mt-2 text-center text-sm text-gray-500">
            Searching...
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
            {searchResults.map((userData) => (
              <div
                key={userData.id}
                className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => addUser(userData)}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                    {userData.username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-gray-800 dark:text-white">
                    {userData.username}
                  </span>
                </div>
                <button className="text-primary hover:text-primary-dark text-sm font-medium">
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected users */}
      {selectedUsers.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Selected Members ({selectedUsers.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((userData) => (
              <div
                key={userData.id}
                className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
              >
                <span className="text-gray-800 dark:text-white text-sm mr-2">
                  {userData.username}
                </span>
                <button
                  onClick={() => removeUser(userData.id)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

      {/* Action buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateGroup}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Group"}
        </button>
      </div>
    </div>
  );
};

export default CreateGroupChat;
