async function sendOrderToJSONBin(orderData) {
    try {
        const getResponse = await fetch('https://api.jsonbin.io/v3/b/68bd8750d0ea881f4074f432/latest', {
            headers: {
                'X-Master-Key': '$2a$10$W7Y1w05rI7FhqCSUCB/tRuDJYO2fRlTwgv2s3je3OlExS3oOz9UzG'
            }
        });
        
        let orders = [];
        if (getResponse.ok) {
            const data = await getResponse.json();
            orders = Array.isArray(data.record) ? data.record : [];
        }
        
        const newOrder = {
            ...orderData,
            timestamp: new Date().toISOString(),
            orderId: 'BLZ-' + Date.now()
        };
        
        orders.push(newOrder);
        
        const response = await fetch('https://api.jsonbin.io/v3/b/68bd8750d0ea881f4074f432', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': '$2a$10$W7Y1w05rI7FhqCSUCB/tRuDJYO2fRlTwgv2s3je3OlExS3oOz9UzG'
            },
            body: JSON.stringify(orders)
        });
        
        if (response.ok) {
            console.log('Order saved:', orders.length, 'total orders');
            sendOrderToGoogleSheets(newOrder);
        }
    } catch (error) {
        console.error('JSONBin error:', error);
    }
}

function sendOrderToGoogleSheets(orderData) {
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzdt8vk-jy0Hisfp-fv1BvQJcFVBHOgPFQawwWmQuiFCgzqFBA3f2JcULLRNRzU6qMGcQ/exec';
    
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(() => console.log('Sent to Google Sheets'))
    .catch(error => console.error('Google Sheets error:', error));
}