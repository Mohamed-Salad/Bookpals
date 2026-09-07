import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createGroupConversation } from "../../services/chatService";
import { supabase } from "../../services/supabaseClient";
import { toast } from "react-toastify";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";

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

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        setSearching(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .ilike("username", `%${searchQuery}%`)
          .limit(10);
        if (error) throw error;

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
      if (searchQuery) searchUsers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, selectedUsers, user?.id]);

  const addUser = (userData) => {
    setSelectedUsers([...selectedUsers, userData]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

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
        groupName,
        selectedUsers.map((u) => u.id)
      );

      onClose?.();
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
    <div className="max-w-lg mx-auto p-6 bg-surface">
      <Input
        label="Group Name"
        id="groupName"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        placeholder="Enter group name"
        className="mb-6"
      />

      <div className="mb-6">
        <Input
          label="Add Members"
          id="userSearch"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by username"
        />

        {searching && (
          <div className="mt-2 text-center text-sm text-ink-muted">Searching…</div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-2 border border-ink/15 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
            {searchResults.map((userData) => (
              <div
                key={userData.id}
                className="flex items-center justify-between p-3 hover:bg-surface-raised cursor-pointer"
                onClick={() => addUser(userData)}
              >
                <div className="flex items-center gap-3">
                  <Avatar src={userData.avatar_url} name={userData.username} size="sm" />
                  <span className="text-ink">{userData.username}</span>
                </div>
                <button className="text-accent-dark hover:underline text-sm font-medium">
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedUsers.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-ink-muted mb-2">
            Selected Members ({selectedUsers.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((userData) => (
              <div
                key={userData.id}
                className="flex items-center bg-surface-raised px-3 py-1 rounded-full"
              >
                <span className="text-ink text-sm mr-2">{userData.username}</span>
                <button
                  onClick={() => removeUser(userData.id)}
                  className="text-ink-muted hover:text-red-500"
                  aria-label={`Remove ${userData.username}`}
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

      {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleCreateGroup} disabled={loading}>
          {loading ? "Creating…" : "Create Group"}
        </Button>
      </div>
    </div>
  );
};

export default CreateGroupChat;
