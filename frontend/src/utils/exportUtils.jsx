import * as XLSX from 'xlsx'

export const exportToExcel = (data, fileName = 'transactions.xlsx') => {
    if(!data || data.length === 0) {
        console.error('No data to export');
        return;
    }

    try {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
        XLSX.writeFile(workbook, `${fileName}.xlsx`, {
            bookType: 'xlsx',
            type: 'array' // to generate an array buffer
        });
    } catch (error) {
        console.error('Error exporting to Excel:', error);
    }
};