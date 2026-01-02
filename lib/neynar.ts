// lib/neynar.ts - Single source of truth for Neynar API requests

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const NEYNAR_BASE_URL = "https://api.neynar.com/v2/farcaster";

if (!NEYNAR_API_KEY) {
  throw new Error("NEYNAR_API_KEY is not configured");
}

const NEYNAR_HEADERS = {
  "accept": "application/json",
  "api_key": NEYNAR_API_KEY,
};

export async function neynarRequest(endpoint: string): Promise<any> {
  const url = `${NEYNAR_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: NEYNAR_HEADERS,
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      
      if (response.status === 429) {
        throw new Error("Farcaster verification unavailable - rate limit hit");
      }
      
      throw new Error("Farcaster verification unavailable");
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Farcaster verification unavailable");
  }
}

// Verification helpers using the shared request function
export async function verifyFollow(fid: number, targetFid: number): Promise<boolean> {
  try {
    const data = await neynarRequest(`/following?fid=${fid}&limit=100`);
    return (data.users || []).some((u: any) => u.fid === targetFid);
  } catch (error) {
    return false;
  }
}

export async function verifyLikeAndRecast(fid: number, castHash: string): Promise<boolean> {
  try {
    const data = await neynarRequest(`/cast/reactions?hash=${castHash}&types=likes,recasts`);
    const likes = data.reactions?.likes || [];
    const recasts = data.reactions?.recasts || [];
    
    return (
      likes.some((r: any) => r.user?.fid === fid) &&
      recasts.some((r: any) => r.user?.fid === fid)
    );
  } catch (error) {
    return false;
  }
}

export async function verifyComment(fid: number, castHash: string): Promise<boolean> {
  try {
    const data = await neynarRequest(`/cast/conversation?hash=${castHash}&type=replies`);
    const replies = data.conversation?.cast?.direct_replies || [];
    
    return replies.some((r: any) => r.author?.fid === fid);
  } catch (error) {
    return false;
  }
}