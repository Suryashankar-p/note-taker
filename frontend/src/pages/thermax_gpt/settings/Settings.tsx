import { useState, useEffect } from "react";
import Header from "../../../components/Header";
import SettingsSidebar from "./Sidebar";
import Members from "./Members";
import useApiCheck from "../../../hooks/useApiCheck";
import { GetMemberSalesRole } from "../../../services/sales";
import store, { Dispatch, RootState } from "../../../redux/store";
import Usage from "./Usage";
import PageLoading from "../../../components/PageLoading";

const breadCrumbs = [
    {
        title: 'AI Studio',
        url: '/ai-studio'
    },
    {
        title: 'Thermax GPT',
        url: '/ai-studio/thermax_gpt'
    },
    {
        title: 'Settings',
        url: '/ai-studio/thermax_gpt/settings'
    }
]

const Settings = () => {


    const SettingsComponents: { [key: string]: any } = {

        'members': {
            title: 'Members',
            component: <Members />
        },
        'usage': {
            title: 'Usage',
            component: <Usage />
        }
    }

    const [currentElement, setCurrentElement] = useState(SettingsComponents['members']);
    const [selectedKey, setSelectedKey] = useState('members');
    const loading = useApiCheck('thermax_gpt');

    useEffect(() => {
        const savedSection = localStorage.getItem('selectedSettingsSection');
        const initialSection = savedSection || 'members';
        setCurrentElement(SettingsComponents[initialSection]);
        setSelectedKey(initialSection);
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
        return <PageLoading/>;
    }

    return (
        <div className="flex flex-col h-screen">
            <div className="fixed w-full z-50">
                <Header breadCrumbs={breadCrumbs} />
            </div>
            <div className={`flex flex-1 mt-8 overflow-y-hidden relative bg-background`}>
                <div className="w-1/5 mt-2 bg-primary_text z-40">
                    <SettingsSidebar selected={selectedKey} onSelect={onSelect} />
                </div>
                <div className={`flex-1 bg-background mt-10 h-screen overflow-hidden pb-16 relative z-0`}>
                    {currentElement?.component}
                </div>
            </div>
        </div>
    );
};

export default Settings;
