import React from "react";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  InformationCircleIcon,
  ListBulletIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

// Placeholder for content moved from CommunityView
const AboutWidget = ({ community }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50">
    <h3 className="text-lg font-semibold mb-2 dark:text-white">About</h3>
    <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
      {community?.description || "No description provided."}
    </p>
  </div>
);

const RulesWidget = ({ community }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50">
    <h3 className="text-lg font-semibold mb-2 dark:text-white">Rules</h3>
    <div className="text-sm text-gray-600 dark:text-gray-300">
      {community?.rules ? (
        <pre className="whitespace-pre-wrap font-sans">{community.rules}</pre>
      ) : (
        <p>No rules specified.</p>
      )}
    </div>
  </div>
);

const MembersWidget = ({ communityId }) => (
  // Placeholder - real implementation needed later
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50 text-center text-gray-500">
    Members List (Coming Soon)
    {/* <CommunityMembersWidget communityId={communityId} /> */}
  </div>
);

const CommunitySidebar = ({
  community,
  communityId,
  isExpanded,
  toggleSidebar,
}) => {
  // Icons for Toggle Button
  const CollapseIcon = ChevronDoubleRightIcon;
  const ExpandIcon = ChevronDoubleLeftIcon;

  return (
    <div
      className={`bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full transition-all duration-300 ease-in-out ${
        isExpanded ? "w-72" : "w-20"
      }`}
    >
      {/* Header Section - Apply dark mode */}
      <div
        className={`p-4 border-b border-gray-200 dark:border-gray-700/50 ${
          !isExpanded && "px-2 py-3"
        }`}
      >
        {isExpanded ? (
          <h2 className="font-semibold text-lg text-gray-800 dark:text-white truncate">
            {community?.name || "Community"}
          </h2>
        ) : (
          <div className="w-8 h-8 rounded-md bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0 mx-auto">
            <span className="text-primary dark:text-primary-light font-semibold text-sm">
              {community?.name?.charAt(0).toUpperCase() || "C"}
            </span>
          </div>
        )}
      </div>

      {/* Main Content Area - Widgets */}
      <div
        className={`flex-grow overflow-y-auto overflow-x-hidden py-3 ${
          isExpanded ? "px-3 space-y-4" : "px-0 space-y-3"
        }`}
      >
        {isExpanded ? (
          // Show full widgets when expanded
          <>
            <AboutWidget community={community} />
            <RulesWidget community={community} />
            <MembersWidget communityId={communityId} />
          </>
        ) : (
          // Show icons when collapsed
          <div className="flex flex-col items-center space-y-3">
            <div
              title="About"
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50 cursor-pointer"
              onClick={!isExpanded ? toggleSidebar : undefined}
            >
              <InformationCircleIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div
              title="Rules"
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50 cursor-pointer"
              onClick={!isExpanded ? toggleSidebar : undefined}
            >
              <ListBulletIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div
              title="Members"
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50 cursor-pointer"
              onClick={!isExpanded ? toggleSidebar : undefined}
            >
              <UsersIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Toggle Button - Use toggleSidebar prop */}
      <div
        className={`p-2 border-t border-gray-200 dark:border-gray-700/50 mt-auto ${
          !isExpanded && "py-3"
        }`}
      >
        <button
          onClick={toggleSidebar}
          title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          className={`w-full flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors ${
            isExpanded ? "justify-start" : "justify-center"
          }`}
        >
          {isExpanded ? (
            <CollapseIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ExpandIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
          {isExpanded && (
            <span className="ml-2 text-sm text-gray-800 dark:text-white">
              Collapse
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default CommunitySidebar;
