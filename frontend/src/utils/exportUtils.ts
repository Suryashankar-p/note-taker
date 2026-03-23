

export interface CSVExportConfig {
    headers: string[];
    data: (string | number)[][];
    filename: string;
}

/**
 * Exports data to CSV file and triggers download
 * @param config - Configuration object containing headers, data, and filename
 */
export const exportToCSV = (config: CSVExportConfig): void => {
    const { headers, data, filename } = config;

    // Create CSV content
    const csvContent = [
        headers.join(","),
        ...data.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Escapes special characters in CSV cell values
 * @param value - The value to escape
 * @returns Escaped value safe for CSV
 */
export const escapeCsvValue = (value: any): string => {
    if (value === null || value === undefined) return "";
    const stringValue = String(value);
    // Escape double quotes by doubling them
    return stringValue.replace(/"/g, '""');
};

/**
 * Formats a date for CSV export
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export const formatDateForCSV = (date: string | Date): string => {
    try {
        return new Date(date).toLocaleDateString("en-US");
    } catch {
        return "";
    }
};
