"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWeeklyPriceChangeDigest = exports.sendPriceChangeNotification = void 0;
const resend_1 = require("resend");
const logger_1 = require("../utils/logger");
// Initialize Resend with API key from environment variable
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
// Default from email address
const DEFAULT_FROM_EMAIL = process.env.DEFAULT_FROM_EMAIL || 'notifications@compare-v2.com';
/**
 * Send a price change notification email
 */
const sendPriceChangeNotification = async (to, data) => {
    try {
        const { toolName, oldPrice, newPrice, planName, changePercentage, changeDate } = data;
        // Format the date
        const formattedDate = changeDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        // Determine if price increased or decreased
        const priceChange = changePercentage >= 0 ? 'increased' : 'decreased';
        const absChangePercentage = Math.abs(changePercentage).toFixed(1);
        // Create email subject
        const subject = `Price Change Alert: ${toolName} ${priceChange} by ${absChangePercentage}%`;
        // Create email content
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Price Change Alert</h2>
        <p>We've detected a price change for a SaaS tool you're monitoring:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${toolName}</h3>
          <p><strong>Plan:</strong> ${planName}</p>
          <p><strong>Previous price:</strong> $${oldPrice}</p>
          <p><strong>New price:</strong> $${newPrice}</p>
          <p><strong>Change:</strong> ${changePercentage >= 0 ? '+' : ''}${changePercentage.toFixed(1)}%</p>
          <p><strong>Date changed:</strong> ${formattedDate}</p>
        </div>
        
        <p>
          <a href="${process.env.FRONTEND_URL}/dashboard/tools/${encodeURIComponent(toolName)}" 
             style="background-color: #4A6CF7; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Tool Details
          </a>
        </p>
        
        <p>Stay up-to-date with all your SaaS pricing changes!</p>
        <p>The Compare V2 Team</p>
      </div>
    `;
        // Send the email using Resend
        const { data: emailData, error } = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [to],
            subject,
            html
        });
        if (error) {
            logger_1.logger.error(`Failed to send price change email: ${error.message}`);
            return false;
        }
        logger_1.logger.info(`Price change notification sent to ${to} for ${toolName}`);
        return true;
    }
    catch (error) {
        logger_1.logger.error('Error sending price change notification email:', error);
        return false;
    }
};
exports.sendPriceChangeNotification = sendPriceChangeNotification;
/**
 * Send a weekly price change digest email
 */
const sendWeeklyPriceChangeDigest = async (to, toolChanges) => {
    try {
        if (!toolChanges.length) {
            logger_1.logger.info(`No price changes to send in digest to ${to}`);
            return true;
        }
        // Create email subject
        const subject = `Weekly SaaS Price Change Digest: ${toolChanges.length} updates`;
        // Create the HTML for each tool change
        const toolChangesHtml = toolChanges.map(change => {
            const { toolName, oldPrice, newPrice, planName, changePercentage, changeDate } = change;
            // Format the date
            const formattedDate = change.changeDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            // Determine if price increased or decreased
            const priceChange = changePercentage >= 0 ? 'increased' : 'decreased';
            const absChangePercentage = Math.abs(changePercentage).toFixed(1);
            return `
        <div style="border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px;">
          <h3 style="margin-top: 0;">${toolName}</h3>
          <p><strong>Plan:</strong> ${planName}</p>
          <p><strong>Previous price:</strong> $${oldPrice}</p>
          <p><strong>New price:</strong> $${newPrice}</p>
          <p><strong>Change:</strong> ${changePercentage >= 0 ? '+' : ''}${changePercentage.toFixed(1)}%</p>
          <p><strong>Date changed:</strong> ${formattedDate}</p>
        </div>
      `;
        }).join('');
        // Create email content
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Weekly SaaS Price Change Digest</h2>
        <p>Here are the price changes we've detected in the past week for SaaS tools you're monitoring:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          ${toolChangesHtml}
        </div>
        
        <p>
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background-color: #4A6CF7; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Dashboard
          </a>
        </p>
        
        <p>Stay up-to-date with all your SaaS pricing changes!</p>
        <p>The Compare V2 Team</p>
      </div>
    `;
        // Send the email using Resend
        const { data: emailData, error } = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [to],
            subject,
            html
        });
        if (error) {
            logger_1.logger.error(`Failed to send weekly digest email: ${error.message}`);
            return false;
        }
        logger_1.logger.info(`Weekly price change digest sent to ${to} with ${toolChanges.length} updates`);
        return true;
    }
    catch (error) {
        logger_1.logger.error('Error sending weekly price change digest email:', error);
        return false;
    }
};
exports.sendWeeklyPriceChangeDigest = sendWeeklyPriceChangeDigest;
