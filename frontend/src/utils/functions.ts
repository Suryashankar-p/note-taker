import sales from '../assets/sales_establish.png'
import ocr from '../assets/ocr.jpg'
import translate from '../assets/translator.jpg'
import TrainingQA from '../assets/training_qa.jpg'
import Thermax_GPT from '../assets/thermax_gpt.png'
import doctor_conbot from '../assets/doctor_conbot.png'
import troubleshooting from '../assets/troubleshooting.png'
import heating_ocr from '../assets/heating_ocr.png'
import cyberbuddy from '../assets/cyberbuddy.png'
import transmitter_ocr from '../assets/transmitter_ocr.jpg'

const BACKEND_THERMAX_GPT_URL = import.meta.env.VITE_BACKEND_THERMAX_GPT_URL || window.env?.BACKEND_THERMAX_GPT_URL;

export const roundToFourDecimals = (number: any) => {
    return Number(number.toFixed(4));
};

export const findPercentage = (num: number, total: number) => {
    return Number(((num / total) * 100).toFixed(2))
}

export function categorizeDate(inputDate: string): string {
    const today = new Date();
    const date = new Date(inputDate);


    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffInTime = today.getTime() - date.getTime();
    const diffInDays = diffInTime / (1000 * 3600 * 24);


    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    startOfLastMonth.setHours(0, 0, 0, 0);


    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    endOfLastMonth.setHours(23, 59, 59, 999);

    if (diffInDays === 0) {
        return "Today";
    } else if (diffInDays === 1) {
        return "Yesterday";
    } else if (diffInDays <= 7) {
        return "Previous 7 days";
    } else if (diffInDays <= 30) {
        return "Previous 30 days";
    } else if (date >= startOfLastMonth && date <= endOfLastMonth) {
        return "Last month";
    } else {
        return "Earlier";
    }
}

export const getInitials = (name: string) => {
    if (!name) return '';

    const nameParts = name.trim().split(' ');
    let initials = '';

    if (nameParts.length > 0) {
        initials += nameParts[0].charAt(0).toUpperCase();
    }

    if (nameParts.length > 1) {
        initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    } else if (nameParts.length === 1) {
        initials += nameParts[0].charAt(1)?.toUpperCase() || '';
    }

    return initials;
};

export const heatingOcrStatusMapper = (status: string) => {

    switch (status) {
        case 'approved':
            return 'APPROVED'
        case 'rejected':
            return 'REJECTED'
        case 'inReview':
            return 'IN_REVIEW'
        case 'notReviewed':
            return 'NOT_REVIEWED'
        case 'inProgress':
            return 'IN_PROGRESS'
        case 'submitted':
            return 'SUBMITTED'
        case 'waiting':
            return 'SUBMITTED_WAITING'
        case 'failed':
            return 'SUBMITTED_FAILED'
        case 'IN_PROGRESS':
            return 'In Progress'
        case 'REJECTED':
            return 'Rejected'
        case 'SUBMITTED_SUCCESS':
            return 'Submitted'
        case 'SUBMITTED':
            return 'Submitted'
        case 'SUBMITTED_FAILED':
            return 'Failed'
        case 'SUBMITTED_WAITING':
            return 'Waiting'
        case 'All':
            return 'All'
        case 'reject':
            return 'REJECTED';
        case 'submit':
            return 'SUBMITTED';
        default:
            return undefined
    }
}

export const statusMapper = (status: string) => {

    switch (status) {
        case 'approved':
            return 'APPROVED'
        case 'rejected':
            return 'REJECTED'
        case 'inReview':
            return 'IN_REVIEW'
        case 'notReviewed':
            return 'NOT_REVIEWED'
        case 'inProgress':
            return 'IN_PROGRESS'
        case 'submitted':
            return 'SUBMITTED_SUCCESS'
        case 'waiting':
            return 'SUBMITTED_WAITING'
        case 'failed':
            return 'SUBMITTED_FAILED'
        case 'IN_PROGRESS':
            return 'In Progress'
        case 'REJECTED':
            return 'Rejected'
        case 'SUBMITTED_SUCCESS':
            return 'Submitted'
        case 'SUBMITTED':
            return 'Submitted'
        case 'SUBMITTED_FAILED':
            return 'Failed'
        case 'SUBMITTED_WAITING':
            return 'Waiting'
        case 'ocrFailed':
            return 'OCR_FAILED'
        case 'OCR_FAILED':
            return 'OCR Failed'
        case 'All':
            return 'All'
        case 'reject':
            return 'REJECTED';
        case 'submit':
            return 'SUBMITTED';
        default:
            return undefined
    }
}

export function getCurrentDate(): { year: number, month: number, day: number } {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    return { year, month, day };
}

export const fileTypeSelctor = (type: string) => {
    switch (type) {
        case 'Technical Spec':
            return 'TECHNICAL_SPECIFICATION'
        case 'Brochure':
            return 'BROCHURE'
        case 'Manual':
            return 'MANUAL'
        case 'TECHNICAL_SPECIFICATION':
            return 'Technical Spec'
        case 'MANUAL':
            return 'Manual'
        case 'BROCHURE':
            return 'Brochure'
    }
}

export const fileTypeSelectorDoctorConBot = (type: string) => {
    switch (type) {
        case 'Manual':
            return 'MANUAL'
        case 'IMAGE':
            return 'Image'
        case 'MANUAL':
            return 'Manual'
        case 'Image':
            return 'IMAGE'
        case 'VIDEO':
            return 'Video'
        case 'Video':
            return 'VIDEO'
        case 'FAQ':
            return 'FAQ'
        case 'Faq':
            return 'FAQ'
        case 'Other':
            return 'OTHER'
        case 'OTHER':
            return 'Other'

    }
}

export const fileTypeSelectorCyberBuddy = (type: string) => {
    switch (type) {
        case 'pdf':
            return 'PDF';
        case 'xlsx':
            return 'Excel';
        case 'docx':
            return 'DOC';
        case 'OTHER':
            return 'Other'

    }
}

export function getFileType(fileName: string): string | null {
    // Extract the file extension
    const fileExtension = fileName?.split('.').pop()?.toLowerCase();

    switch (fileExtension) {
        case 'pdf':
            return 'PDF';
        case 'xls':
        case 'xlsx':
            return 'Excel';
        case 'doc':
            return 'DOC';
        case 'docx':
            return 'DOC';
        case 'ppt':
            return 'PPT';
        case 'pptx':
            return 'PPT';
        case 'csv':
            return 'CSV';
        case 'jpg':
            return 'JPG'
        case 'jpeg':
            return 'JPEG'
        case 'mp4':
            return 'MP4'
        default:
            return null;
    }
}

// roleMapping.ts
export const roleMapping = {
    'Owner': 'OWNER',
    'Reviewer': 'REVIEWER',
    'Member': 'MEMBER',
};

export const getKeyByValue = (object: any, value: any) => {
    return Object.entries(object).find(([key, val]) => val === value)?.[0];
};

export const listValues = [
    { name: 'Owner' },
    { name: 'Reviewer' },
    { name: 'Member' }
];


export const userStatusMapper = (status: string) => {
    switch (status) {
        case 'by me':
            return 'BY_ME';
        case 'by other':
            return 'BY_OTHERS';
        default:
            return undefined;
    }
}

export const getBorderColor = (activityStatus: string): string => {
    switch (activityStatus) {
        case 'SUBMITTED':
        case 'PASSED':
            return 'border-green-500'; // Green for submitted/passed
        case 'REJECTED':
        case 'FAILED':
            return 'border-red-500';   // Red for rejected/failed
        case 'IN_PROGRESS':
            return 'border-yellow-500';
        case 'SUBMITTED_WAITING':
            return 'border-orange-500'
        case 'SUBMITTED_FAILED':
            return 'border-red-500';
        case 'SUBMITTED_SUCCESS':
            return 'border-green-500';
        case 'OCR_FAILED':
            return 'border-orange-500'; // Orange for OCR failures
        default:
            return 'border-gray-300';
    }
};

export function capitalizeWords(sentence: string): string {
    return sentence
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export const selectImage = (title: string) => {
    switch (title) {
        case "Sales Enablement Tool":
            return sales;
        case "TBWES OCR":
            return ocr;
        case "Transmitter OCR":
            return transmitter_ocr;
        case 'Document Translator':
            return translate;
        case 'Training QA':
            return TrainingQA;
        case 'Thermax-GPT':
            return Thermax_GPT;
        case 'Dr. ConBot':
            return doctor_conbot;
        case 'Smart Troubleshooting App':
            return troubleshooting;
        case 'Heating OCR':
            return heating_ocr;
        case 'CyberBuddy':
            return cyberbuddy;
        case 'Edge Bot':
            return sales;
    }
}

export const getIframeSrc = (url, type) => {
    if (type === "PDF" || type === "JPG" || type === "JPEG" || type === "PNG") {
        return url; // Use the direct URL for PDFs and images
    } else if (type === "Excel" || type === "DOC" || type === "PPT") {
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    }
    return "";
};
