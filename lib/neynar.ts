// lib/neynar.ts
// Neynar API integration for Farcaster verification

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const NEYNAR_BASE_URL = "https://api.neynar.com/v2/farcaster";

// Enhanced logging for deployment debugging
if (!NEYNAR_API_KEY) {
  console.warn("[NEYNAR] NEYNAR_API_KEY not configured - Farcaster verification will be disabled");
  console.warn("[NEYNAR] Available env vars:", Object.keys(process.env).filter(key => key.includes('NEYNAR')));
} else {
  console.log("[NEYNAR] API key configured successfully");
}

/**
 * Verify if a user follows another user on Farcaster
 */
export async function verifyFollow(fid: number, targetFid: number): Promise<boolean> {
  if (!NEYNAR_API_KEY) {
    throw new Error("Farcaster verification unavailable - NEYNAR_API_KEY not configured");
  }

  try {
    const response = await fetch(
      `${NEYNAR_BASE_URL}/user/bulk?fids=${fid}`,
      {
        headers: {
          'accept': 'application/json',
          'api_key': NEYNAR_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error(`[NEYNAR] Follow verification failed: ${response.status}`);
      return false;
    }

    const data = await response.json();
    const user = data.users?.[0];
    
    if (!user) {
      return false;
    }

    // Check if user follows the target
    const followingResponse = await fetch(
      `${NEYNAR_BASE_URL}/following?fid=${fid}&limit=100`,
      {
        headers: {
          'accept': 'application/json',
          'api_key': NEYNAR_API_KEY,
        },
      }
    );

    if (!followingResponse.ok) {
      return false;
    }

    const followingData = await followingResponse.json();
    const following = followingData.users || [];
    
    return following.some((followedUser: any) => followedUser.fid === targetFid);
  } catch (error) {
    console.error("[NEYNAR] Follow verification error:", error);
    return false;
  }
}

/**
 * Verify if a user liked and recasted a specific cast
 */
export async function verifyLikeAndRecast(fid: number, castHash: string): Promise<boolean> {
  if (!NEYNAR_API_KEY) {
    throw new Error("Farcaster verification unavailable - NEYNAR_API_KEY not configured");
  }

  try {
    // Check for like
    const likeResponse = await fetch(
      `${NEYNAR_BASE_URL}/reactions/cast?hash=${castHash}&types=likes&limit=100`,
      {
        headers: {
          'accept': 'application/json',
          'api_key': NEYNAR_API_KEY,
        },
      }
    );

    if (!likeResponse.ok) {
      return false;
    }

    const likeData = await likeResponse.json();
    const hasLiked = likeData.reactions?.some((reaction: any) => reaction.user?.fid === fid);

    // Check for recast
    const recastResponse = await fetch(
      `${NEYNAR_BASE_URL}/reactions/cast?hash=${castHash}&types=recasts&limit=100`,
      {
        headers: {
          'accept': 'application/json',
          'api_key': NEYNAR_API_KEY,
        },
      }
    );

    if (!recastResponse.ok) {
      return false;
    }

    const recastData = await recastResponse.json();
    const hasRecasted = recastData.reactions?.some((reaction: any) => reaction.user?.fid === fid);

    return hasLiked && hasRecasted;
  } catch (error) {
    console.error("[NEYNAR] Like/Recast verification error:", error);
    return false;
  }
}

/**
 * Verify if a user commented on a specific cast
 */
export async function verifyComment(fid: number, castHash: string): Promise<boolean> {
  if (!NEYNAR_API_KEY) {
    throw new Error("Farcaster verification unavailable - NEYNAR_API_KEY not configured");
  }

  try {
    const response = await fetch(
      `${NEYNAR_BASE_URL}/cast/conversation?identifier=${castHash}&type=hash&reply_depth=1&include_chronological_parent_casts=false&limit=100`,
      {
        headers: {
          'accept': 'application/json',
          'api_key': NEYNAR_API_KEY,
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    const conversation = data.conversation?.cast?.direct_replies || [];
    
    return conversation.some((reply: any) => reply.author?.fid === fid);
  } catch (error) {
    console.error("[NEYNAR] Comment verification error:", error);
    return false;
  }
}