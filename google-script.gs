function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getActiveSheet();
    
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 8).setValues([
        ['Order ID', 'Timestamp', 'Product', 'Price', 'Color', 'Customer Name', 'Phone', 'City']
      ]);
    }
    
    sheet.appendRow([
      data.orderId,
      data.timestamp,
      data.product.name,
      data.product.price + ' DH',
      data.product.color,
      data.customer.name,
      data.customer.phone,
      data.customer.city
    ]);
    
    return ContentService.createTextOutput('Success');
  } catch (error) {
    return ContentService.createTextOutput('Error: ' + error.toString());
  }
}