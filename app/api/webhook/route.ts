import { NextRequest, NextResponse } from 'next/server';

/**
 * Base App Webhook Handler
 * Handles lifecycle events and notifications from Base App
 * 
 * @see https://docs.base.org/mini-apps/features/webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract event type and data
    const { type, data, timestamp } = body;
    
    // Log webhook event for debugging
    console.log('[Webhook]', {
      type,
      timestamp: timestamp || new Date().toISOString(),
      data: JSON.stringify(data).substring(0, 100), // Log first 100 chars
    });
    
    // Handle different webhook event types
    switch (type) {
      case 'miniapp.saved':
        // User saved the app to their collection
        console.log('[Webhook] App saved by user:', data?.userId);
        // TODO: Track user engagement, send welcome notification
        break;
        
      case 'miniapp.unsaved':
        // User removed the app from their collection
        console.log('[Webhook] App unsaved by user:', data?.userId);
        // TODO: Track churn, potentially send re-engagement notification
        break;
        
      case 'miniapp.launched':
        // User launched the app
        console.log('[Webhook] App launched by user:', data?.userId);
        // TODO: Track app opens, update analytics
        break;
        
      case 'notification.clicked':
        // User clicked on a notification
        console.log('[Webhook] Notification clicked:', data?.notificationId);
        // TODO: Track notification engagement, route user to specific page
        break;
        
      case 'notification.delivered':
        // Notification was successfully delivered
        console.log('[Webhook] Notification delivered:', data?.notificationId);
        // TODO: Track delivery success rate
        break;
        
      case 'notification.failed':
        // Notification delivery failed
        console.log('[Webhook] Notification failed:', data?.notificationId, data?.error);
        // TODO: Track delivery failures, retry if needed
        break;
        
      default:
        console.log('[Webhook] Unknown event type:', type);
        // Don't fail on unknown events - Base App may add new event types
    }
    
    // Always return success to acknowledge receipt
    return NextResponse.json({ 
      success: true,
      received: true,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    
    // Return error but with 200 status to prevent retries
    // Base App will retry on 5xx errors
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 200 } // Return 200 to prevent retries
    );
  }
}

/**
 * Health check endpoint
 * Allows Base App to verify webhook is accessible
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'FarFISH Webhook',
    timestamp: new Date().toISOString(),
  });
}
