import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  InformationCircleIcon,
  ListBulletIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Card } from "../ui/Card";

const AboutWidget = ({ community }) => (
  <Card className="p-4">
    <h3 className="font-display text-lg font-semibold mb-2 text-ink">About</h3>
    <p className="text-sm text-ink-muted break-words">
      {community?.description || "No description provided."}
    </p>
  </Card>
);

const RulesWidget = ({ community }) => (
  <Card className="p-4">
    <h3 className="font-display text-lg font-semibold mb-2 text-ink">Rules</h3>
    <div className="text-sm text-ink-muted">
      {community?.rules ? (
        <pre className="whitespace-pre-wrap font-sans">{community.rules}</pre>
      ) : (
        <p>No rules specified.</p>
      )}
    </div>
  </Card>
);

const MembersWidget = () => (
  // Placeholder - real implementation needed later
  <Card className="p-4 text-center text-ink-muted">Members List (Coming Soon)</Card>
);

const CommunitySidebar = ({ community, communityId, isExpanded, toggleSidebar }) => {
  const CollapseIcon = ChevronDoubleRightIcon;
  const ExpandIcon = ChevronDoubleLeftIcon;

  return (
    <div
      className={`bg-surface border-l border-ink/10 flex flex-col h-full transition-all duration-300 ease-in-out ${
        isExpanded ? "w-72" : "w-20"
      }`}
    >
      <div className={`p-4 border-b border-ink/10 ${!isExpanded && "px-2 py-3"}`}>
        {isExpanded ? (
          <h2 className="font-display font-semibold text-lg text-ink truncate">
            {community?.name || "Community"}
          </h2>
        ) : (
          <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center shrink-0 mx-auto">
            <span className="text-accent-dark font-semibold text-sm">
              {community?.name?.charAt(0).toUpperCase() || "C"}
            </span>
          </div>
        )}
      </div>

      <div
        className={`flex-grow overflow-y-auto overflow-x-hidden py-3 ${
          isExpanded ? "px-3 space-y-4" : "px-0 space-y-3"
        }`}
      >
        {isExpanded ? (
          <>
            <AboutWidget community={community} />
            <RulesWidget community={community} />
            <MembersWidget communityId={communityId} />
          </>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div
              title="About"
              className="p-2 rounded-lg hover:bg-surface-raised cursor-pointer"
              onClick={toggleSidebar}
            >
              <InformationCircleIcon className="h-6 w-6 text-ink-muted" />
            </div>
            <div
              title="Rules"
              className="p-2 rounded-lg hover:bg-surface-raised cursor-pointer"
              onClick={toggleSidebar}
            >
              <ListBulletIcon className="h-6 w-6 text-ink-muted" />
            </div>
            <div
              title="Members"
              className="p-2 rounded-lg hover:bg-surface-raised cursor-pointer"
              onClick={toggleSidebar}
            >
              <UsersIcon className="h-6 w-6 text-ink-muted" />
            </div>
          </div>
        )}
      </div>

      <div className={`p-2 border-t border-ink/10 mt-auto ${!isExpanded && "py-3"}`}>
        <button
          onClick={toggleSidebar}
          title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          className={`w-full flex items-center p-2 rounded-lg hover:bg-surface-raised transition-colors ${
            isExpanded ? "justify-start" : "justify-center"
          }`}
        >
          {isExpanded ? (
            <CollapseIcon className="w-5 h-5 text-ink-muted" />
          ) : (
            <ExpandIcon className="w-5 h-5 text-ink-muted" />
          )}
          {isExpanded && <span className="ml-2 text-sm text-ink">Collapse</span>}
        </button>
      </div>
    </div>
  );
};

export default CommunitySidebar;
