import React from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import Recordings from "./Recordings";
import Settings from "./Settings";
import MeetingDetails from "./MeetingDetails";
import EmailPreview from "./EmailPreview";
import ChooseRecipients from "./ChooseRecipients";

const NoteTakerMain: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const selectedTab = searchParams.get("tab") || "dashboard";
    const selectedMeetingId = searchParams.get("meetingId");
    const view = searchParams.get("view"); // e.g. "email-preview" | "choose-recipients"

    const handleSelectTab = (key: string) => {
        setSearchParams({ tab: key });
    };

    const handleMeetingClick = (meetingId: string) => {
        setSearchParams({ tab: selectedTab, meetingId });
    };

    const handlePreviewEmail = () => {
        setSearchParams({ tab: selectedTab, meetingId: selectedMeetingId || "1", view: "email-preview" });
    };

    const handleChooseRecipients = () => {
        setSearchParams({ tab: selectedTab, meetingId: selectedMeetingId || "1", view: "choose-recipients" });
    };

    const getBreadcrumbs = () => {
        const crumbs = [
            { title: "AI Studio", url: "/ai-studio" },
            { title: "Notetaker AI", url: "/ai-studio/notetaker" },
        ];

        if (selectedTab && selectedTab !== "dashboard") {
            crumbs.push({ title: selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1), url: `/ai-studio/notetaker?tab=${selectedTab}` });
        }

        if (selectedMeetingId) {
            crumbs.push({ title: "Meeting Details", url: `/ai-studio/notetaker?tab=${selectedTab}&meetingId=${selectedMeetingId}` });
        }

        if (view === "email-preview") {
            crumbs.push({ title: "Email Preview", url: `/ai-studio/notetaker?tab=${selectedTab}&meetingId=${selectedMeetingId || "1"}&view=email-preview` });
        } else if (view === "choose-recipients") {
            crumbs.push({ title: "Choose Recipients", url: `/ai-studio/notetaker?tab=${selectedTab}&meetingId=${selectedMeetingId || "1"}&view=choose-recipients` });
        }

        return crumbs;
    };

    const renderContent = () => {
        if (view === "choose-recipients") {
            return <ChooseRecipients />;
        }
        if (view === "email-preview") {
            return <EmailPreview onChooseRecipients={handleChooseRecipients} />;
        }
        if (selectedMeetingId) {
            return (
                <MeetingDetails
                    meetingId={selectedMeetingId}
                    onPreviewEmail={handlePreviewEmail}
                />
            );
        }
        if (selectedTab === "Recordings") return <Recordings />;
        if (selectedTab === "settings") return <Settings />;
        return <Dashboard onMeetingClick={handleMeetingClick} />;
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Fixed Header with Active Page Breadcrumbs */}
            <div className="fixed w-full z-50">
                <Header breadCrumbs={getBreadcrumbs()} />
            </div>

            {/* Main Content Layout with Sidebar */}
            <div className="flex flex-1 h-[calc(100vh-4rem)] mt-16 relative bg-background overflow-hidden">
                {/* Dark Sidebar */}
                <div className="w-full md:w-[20rem] lg:w-[20rem] bg-primary_text flex flex-col shrink-0">
                    <Sidebar
                        selected={selectedMeetingId || view ? "" : selectedTab}
                        onSelect={handleSelectTab}
                    />
                </div>

                {/* Tab View Container with Smooth Full Scrolling */}
                <div className="flex-1 h-full overflow-y-auto p-6 bg-background relative z-0">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default NoteTakerMain;
