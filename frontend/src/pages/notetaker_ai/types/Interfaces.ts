export interface ActionItem {
    id: string;
    task: string;
    assignee: string;
    completed: boolean;
}

export interface MeetingDetailsProps {
    meetingId?: string;
    onBack?: () => void;
    onPreviewEmail?: () => void;
}

export interface EmailPreviewProps {
    onBack?: () => void;
    onChooseRecipients?: () => void;
}

export interface Recipient {
    id: string;
    name: string;
    email: string;
    selected: boolean;
}

export interface DropdownListProps {
    recipients: Recipient[];
    onToggleRecipient: (id: string) => void;
    onSelectAllAttendees: () => void;
    onDone: () => void;
}