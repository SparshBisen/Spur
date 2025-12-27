export const storeKnowledge = {
    storeName: "TechGadgets Store",
    
    shippingPolicy: `
        SHIPPING POLICY:
        - We offer FREE shipping on orders over $50
        - Standard shipping (5-7 business days): $4.99
        - Express shipping (2-3 business days): $9.99
        - We ship to USA, Canada, UK, and Australia
        - International shipping takes 10-15 business days
        - All orders are processed within 1-2 business days
        - You will receive a tracking number via email once your order ships
    `,
    
    returnPolicy: `
        RETURN & REFUND POLICY:
        - 30-day return policy for most items
        - Items must be unused and in original packaging
        - To initiate a return, email us at returns@techgadgets.com
        - Refunds are processed within 5-7 business days after we receive the item
        - Shipping costs are non-refundable
        - Defective items can be returned for free
        - Sale items are final sale and cannot be returned
    `,
    
    supportHours: `
        SUPPORT HOURS:
        - Monday to Friday: 9 AM - 6 PM EST
        - Saturday: 10 AM - 4 PM EST
        - Sunday: Closed
        - Email support: support@techgadgets.com
        - Response time: Within 24 hours on business days
        - For urgent issues, use our live chat during business hours
    `,
    
    paymentMethods: `
        PAYMENT METHODS:
        - We accept Visa, MasterCard, American Express, and Discover
        - PayPal is also accepted
        - All payments are processed securely
        - We do not store your credit card information
    `,
    
    popularProducts: `
        POPULAR PRODUCTS:
        - Wireless Bluetooth Earbuds - $49.99
        - Portable Phone Charger 10000mAh - $29.99
        - Smart Watch Fitness Tracker - $79.99
        - Laptop Stand Adjustable - $34.99
        - USB-C Hub 7-in-1 - $44.99
    `,
    
    contactInfo: `
        CONTACT INFORMATION:
        - Email: support@techgadgets.com
        - Phone: 1-800-TECH-GAD (1-800-832-4423)
        - Address: 123 Tech Street, San Francisco, CA 94102
    `
};

export function getStoreKnowledgePrompt(): string {
    return `
Here is the store information you should use to answer customer questions:

Store Name: ${storeKnowledge.storeName}

${storeKnowledge.shippingPolicy}

${storeKnowledge.returnPolicy}

${storeKnowledge.supportHours}

${storeKnowledge.paymentMethods}

${storeKnowledge.popularProducts}

${storeKnowledge.contactInfo}
    `.trim();
}
