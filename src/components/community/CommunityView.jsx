import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { getCommunity, getCommunityDiscussions } from "../../services/database";
import PostList from "./PostList";
import CreatePost from "./CreatePost";
import { motion } from "framer-motion";
import { LoadingIndicator } from "stream-chat-react";
import CommunitySidebar from "../../components/Side-Top bars/CommunitySidebar";
import ImageModal from "../../components/modals/ImageModal";

const CommunityView = () => {
  const { communityId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [community, setCommunity] = useState(null);
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  const [error, setError] = useState(null);
  const [isMember, setIsMember] = useState(false);

  // State for posts
  const [discussions, setDiscussions] = useState([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(true);
  const [postsError, setPostsError] = useState(null);

  // Add state for image modal
  const [modalImageUrl, setModalImageUrl] = useState(null);

  const [isCommunitySidebarExpanded, setIsCommunitySidebarExpanded] =
    useState(true);

  // Define fetchDiscussions first using useCallback
  const fetchDiscussions = useCallback(async () => {
    if (!communityId) return;
    setLoadingDiscussions(true);
    setPostsError(null);
    try {
      console.log(
        `[CommunityView] Fetching posts for community ID: ${communityId}`
      );
      const postsData = await getCommunityDiscussions(communityId);
      setDiscussions(postsData || []);
      console.log(`[CommunityView] Fetched ${postsData?.length || 0} posts.`);
    } catch (err) {
      console.error("[CommunityView] Error fetching posts:", err);
      setPostsError(err.message || "Failed to load posts.");
    } finally {
      setLoadingDiscussions(false);
      // Combine loading state check: Loading is false only when both community and posts are done
      setLoadingCommunity(false);
    }
  }, [communityId]);

  useEffect(() => {
    const fetchCommunityData = async () => {
      if (!communityId) return;
      setLoadingCommunity(true);
      setDiscussions([]); // Clear posts when community changes
      setPostsError(null);
      setError(null);
      try {
        console.log(
          `[CommunityView] Fetching data for community ID: ${communityId}`
        );
        const data = await getCommunity(communityId);
        if (data) {
          setCommunity(data);
          console.log("[CommunityView] Community data fetched:", data);

          // Check if user is a member - Placeholder, adapt based on your actual member check logic
          // Assuming getCommunity includes membership info or you have another function
          // setIsMember(checkIfUserIsMember(data, user?.id));
          setIsMember(true); // TEMPORARY: Assume member for testing

          // Fetch posts *after* community data is confirmed
          fetchDiscussions();
        } else {
          setError("Community not found.");
          setLoadingCommunity(false);
        }
      } catch (err) {
        console.error("[CommunityView] Error fetching community data:", err);
        setError(err.message || "Failed to load community data.");
        setLoadingCommunity(false);
      }
      // Removed finally block here, let fetchDiscussions handle final loading state
    };

    fetchCommunityData();
  }, [communityId, user?.id, fetchDiscussions]); // Added fetchDiscussions dependency

  // Toggle for Right Sidebar
  const toggleCommunitySidebar = () => {
    setIsCommunitySidebarExpanded(!isCommunitySidebarExpanded);
  };

  // Callback for when a new post is created
  const handlePostCreated = (newPost) => {
    fetchDiscussions(); // Refetch posts to show the new one
  };

  // Handlers for image modal
  const openImageModal = (imageUrl) => {
    setModalImageUrl(imageUrl);
  };

  const closeImageModal = () => {
    setModalImageUrl(null);
  };

  if (loadingCommunity) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingIndicator size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          {error}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The community you're looking for might have been removed or never
          existed.
        </p>
        <button
          onClick={() => navigate("/discover?tab=communities")}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Browse Communities
        </button>
      </div>
    );
  }

  if (!community) {
    return <div className="text-center py-10">Community not found.</div>;
  }

  // --- Restored Layout Structure ---
  return (
    <div className="relative flex flex-col min-h-screen">
      {" "}
      {/* Ensure it's flex column */}
      {/* Main scrollable content area */}
      {/* Let flex-1 handle width, center content inside with max-width */}
      <main
        className="flex-1 overflow-y-auto pt-4 pb-48 md:pl-72 transition-all duration-300 ease-in-out ${
          isCommunitySidebarExpanded ? 'md:pr-72' : 'md:pr-20'
        }"
      >
        {" "}
        {/* Removed dynamic right padding */}
        {/* Center content using max-width and mx-auto */}
        <div className="max-w-5xl mx-auto px-4">
          {" "}
          {/* Applied max-width, mx-auto, px */}
        {/* Banner */}
          <div className="mb-4 bg-gradient-to-r from-primary to-secondary rounded-lg shadow-md overflow-hidden h-32 relative">
          {community.banner_url ? (
            <img
              src={community.banner_url}
              alt={`${community.name} banner`}
              className="w-full h-full object-cover"
              onError={(e) => {
                  e.target.style.display = "none";
                const parent = e.target.parentNode;
                  if (parent) {
                    parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-700 text-gray-400">Banner Error</div>`;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <span className="text-gray-400">No banner</span>
          </div>
            )}
            <div className="absolute bottom-0 left-0 p-3 bg-black/50 w-full">
              <h1 className="text-2xl font-bold text-white mb-0 truncate">
            {community.name}
          </h1>
              <p className="text-gray-200 text-xs truncate">
            {community.description}
          </p>
            </div>
        </div>
          {/* Posts Section */}
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
            Discussions
          </h2>
            {loadingDiscussions ? (
              <div className="flex justify-center items-center py-8">
                <LoadingIndicator size={30} />
            </div>
            ) : postsError ? (
              <div className="text-center text-red-500 dark:text-red-400 py-4">
                Error loading posts: {postsError}
            </div>
            ) : (
              <PostList posts={discussions} onImageClick={openImageModal} />
            )}
          </div>
        </div>{" "}
        {/* End Centered Content Container */}
      </main>{" "}
      {/* End Scrollable main area */}
      {/* Right Community Sidebar (Smaller Width) */}
      {community && (
        <aside
          // Use w-60 / w-16 for sidebar width
          className={`fixed inset-y-0 right-0 z-20 pt-14 transition-all duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${
            isCommunitySidebarExpanded ? "w-60" : "w-16" // Skinny sidebar widths
          } hidden md:block`}
        >
          <CommunitySidebar
            community={community}
            communityId={communityId}
            isExpanded={isCommunitySidebarExpanded}
            toggleSidebar={toggleCommunitySidebar}
          />
        </aside>
      )}
      {/* Fixed Post Input Area (Updated Offsets and Centering) */}
      {user && (
        <div
          // Fixed position, adjust left/right based on sidebars
          className={`fixed bottom-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700
                     left-0 md:left-72  // Account for fixed UnifiedSidebar (assuming w-72)
                     transition-all duration-300 ease-in-out ${
                       // Use right-60 / right-16 to match new sidebar widths
                       isCommunitySidebarExpanded
                         ? "right-0 md:right-60"
                         : "right-0 md:right-16"
                     }`}
        >
          {/* Apply same max-w-5xl mx-auto to align with content */}
          <div className="max-w-5xl mx-auto px-4 py-1">
            {" "}
            {/* Centered inner container */}
            <CreatePost
              communityId={communityId}
              onPostCreated={handlePostCreated}
            />
          </div>
        </div>
      )}
      {/* Render Image Modal conditionally */}
      {modalImageUrl && (
        <ImageModal imageUrl={modalImageUrl} onClose={closeImageModal} />
      )}
    </div> // End Outermost relative div
  );
};

export default CommunityView;
