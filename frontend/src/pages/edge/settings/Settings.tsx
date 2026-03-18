import { useState, useEffect } from "react";
import Header from "../../../components/Header";
import SettingsSidebar from "./Sidebar";
import Knowledge from "./Knowledge";
import Members from "./Members";
import QandA from "./Q&A";
import Feedback from "./Feedback";
import useApiCheck from "../../../hooks/useApiCheck";
import { GetMemberEdgeRole } from "../../../services/edge";
import store, { Dispatch, RootState } from "../../../redux/store";
import Usage from "./Usage";
import PageLoading from "../../../components/PageLoading";

const breadCrumbs = [
    {
        title: 'AI Studio',
        url: '/ai-studio'
    },
    {
        title: 'Edge Agent Playground',
        url: '/ai-studio/edge'
    },
    {
        title: 'Settings',
        url: '/ai-studio/edge/settings'
    }
]

const Settings = () => {


    const SettingsComponents: { [key: string]: any } = {
        'knowledge': {
            title: 'Knowledge',
            component: <Knowledge />
        },
        'members': {
            title: 'Members',
            component: <Members />
        },
        'usage': {
            title: 'Usage',
            component: <Usage />
        }
    }

    const [currentElement, setCurrentElement] = useState(SettingsComponents['knowledge']);
    const [selectedKey, setSelectedKey] = useState('knowledge');
    const loading = useApiCheck('edgeagent-playground');

    useEffect(() => {
        // Retrieve the selected section from local storage if it exists
        const savedSection = localStorage.getItem('selectedSettingsSection');
        const initialSection = savedSection || 'knowledge';
        setCurrentElement(SettingsComponents[initialSection]);
        setSelectedKey(initialSection);
        getEdgeRole()
        return () => {
            localStorage.removeItem('selectedSettingsSection');
        }
    }, []);



    const onSelect = (key: string) => {
        const selectedElement = SettingsComponents[key];
        setCurrentElement(selectedElement);
        setSelectedKey(key);
        // Save the selected section to local storage
        localStorage.setItem('selectedSettingsSection', key);
    }

    if (loading) {
        return <PageLoading />;
    }

    return (
        <div className="flex flex-col h-screen">
            <div className="fixed w-full z-50">
                <Header breadCrumbs={breadCrumbs} />
            </div>
            <div className={`flex flex-1 mt-8 overflow-y-hidden relative bg-background`}>
                <div className="w-1/6 mt-2 bg-primary_text z-40">
                    <SettingsSidebar selected={selectedKey} onSelect={onSelect} />
                </div>
                <div className={`flex-1 bg-background mt-10 h-screen overflow-hidden pb-16 relative z-0`}>
                    {currentElement.component}
                </div>
            </div>
        </div>
    );
};

export default Settings;

export const getEdgeRole = async () => {
    const response = await GetMemberEdgeRole()
    if (response?.id) {
        (store.dispatch as Dispatch).memberRole.setRole({ service: 'edgeagent-playground', details: response })
    }
}