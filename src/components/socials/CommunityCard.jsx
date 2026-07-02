// src/components/CommunityCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { joinCommunity, leaveCommunity } from "../../services/database";

const CommunityCard = ({ community, userMemberships = [] }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isJoined, setIsJoined] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Log the received banner URL for debugging
  React.useEffect(() => {
    console.log(
      `[CommunityCard] Rendering card for ${community.name}, Banner URL: ${community.banner_url}`
    );
  }, [community.banner_url, community.name]);

  React.useEffect(() => {
    // Check membership using the userMemberships prop
    if (user && community.id) {
      setIsJoined(userMemberships.includes(community.id));
    }
  }, [community.id, user, userMemberships]);

  const handleJoinClick = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      if (isJoined) {
        await leaveCommunity(community.id, user.id);
        setIsJoined(false);
      } else {
        await joinCommunity(community.id, user.id);
        setIsJoined(true);
      }
    } catch (error) {
      console.error("Failed to join/leave community:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/community/${community.id}`);
  };

  const communityGenres = Array.isArray(community.genre)
    ? community.genre
    : community.genre
    ? [community.genre] // Handle single string genre
    : [];

  return (
    <div
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-200 ease-in-out group cursor-pointer"
    >
      {/* Banner Area */}
      <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
        {community.banner_url ? (
          <img
            src={community.banner_url}
            alt={`${community.name} banner`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = "none"; /* Hide img on error */
            }}
          />
        ) : (
          /* Placeholder SVG Icon */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-gray-400 dark:text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.25 8.25h13.5m-13.5 7.5h13.5m-1.373-12.996l-1.49-1.49a1.5 1.5 0 00-2.12 0l-1.49 1.49m5.1 0l-1.49-1.49a1.5 1.5 0 01-2.12 0l-1.49 1.49m12 .027a11.95 11.95 0 00-3.244-2.43 1.5 1.5 0 00-1.612.153l-1.49 1.49M5.25 8.25h13.5M5.25 15.75h13.5m-1.373-12.996a11.95 11.95 0 013.244-2.43 1.5 1.5 0 011.612.153l1.49 1.49M21 15.75V8.25a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 8.25v7.5a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 15.75z"
            />
          </svg>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          {/* Name & Description */}
          <div className="flex-1 mr-3">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate group-hover:text-primary transition-colors">
              {community.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {community.description}
            </p>
          </div>
          {/* Join Button */}
          <button
            onClick={handleJoinClick}
            disabled={loading}
            className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ease-in-out ${
              isJoined
                ? "bg-transparent border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                : "bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "..." : isJoined ? "Joined" : "Join"}
          </button>
        </div>

        {/* Genres */}
        {communityGenres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
            {communityGenres.slice(0, 4).map(
              (
                g // Show max 4 genres initially
              ) => (
                <span
                  key={g}
                  className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 rounded-full font-medium whitespace-nowrap"
                >
                  {g}
                </span>
              )
            )}
            {communityGenres.length > 4 && (
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-full font-medium whitespace-nowrap">
                +{communityGenres.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Footer Metadata */}
        <div className="flex items-center justify-between mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {community.member_count || 0} members
          </span>
          {/* Example: Conditionally show category if available */}
          {/* {community.category && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Category: {community.category}
          </span>
          )} */}
          {community.is_private && (
            <span className="inline-block px-2 py-0.5 text-[11px] font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 rounded-full">
              Private
            </span>
          )}

          {/* Enter Button - Added */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click event
              handleCardClick(); // Navigate using the existing function
            }}
            className="ml-auto pl-3 pr-2 py-1 text-xs font-medium text-primary dark:text-primary-light hover:bg-primary/10 dark:hover:bg-primary/20 rounded-md transition-colors"
          >
            Enter
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 inline-block ml-1 -mt-px"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;
