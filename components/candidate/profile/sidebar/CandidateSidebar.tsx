"use client";

import TrendingArticlesCard from "./TrendingArticlesCard";
import HomeFeedCard from "./HomeFeedCard";
import SavedJobsCard from "./SavedJobsCard";
import MyApplicationsCard from "./MyApplicationsCard";
import ContactCard from "./ContactCard";
import PublicUrlCard from "./PublicUrlCard";

interface CandidateSidebarProps {
  candidate?: any;
  username: string;
  isOwner?: boolean;
  onEditSocialsClick?: () => void;
}

export default function CandidateSidebar({
  candidate,
  username,
  isOwner,
  onEditSocialsClick,
}: CandidateSidebarProps) {
  return (
    <div className="lg:col-span-4 space-y-4">
      <TrendingArticlesCard />
      <HomeFeedCard />
      <SavedJobsCard />
      <MyApplicationsCard />
      <ContactCard
        candidate={candidate}
        isOwner={isOwner}
        onEditClick={onEditSocialsClick}
      />
      <PublicUrlCard username={candidate?.username || username} />
    </div>
  );
}
