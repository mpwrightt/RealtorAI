import { api } from "@/convex/_generated/api";
import { fetchQuery, fetchMutation } from "convex/nextjs";

export async function verifyBuyerSession(sessionCode: string) {
  try {
    const session = await fetchQuery(api.buyerSessions.getBuyerSessionByCode, {
      sessionCode,
    });
    
    if (!session || !session.active) {
      return null;
    }
    
    // Update last active timestamp
    await fetchMutation(api.buyerSessions.updateLastActive, {
      sessionId: session._id,
    });
    
    return session;
  } catch (error) {
    console.error('Error verifying buyer session:', error);
    return null;
  }
}

export async function verifySellerSession(sessionCode: string) {
  try {
    const session = await fetchQuery(api.sellerSessions.getSellerSessionByCode, {
      sessionCode,
    });
    
    if (!session || !session.active) {
      return null;
    }
    
    // Update last active timestamp
    await fetchMutation(api.sellerSessions.updateSellerSessionLastActive, {
      sessionId: session._id,
    });
    
    return session;
  } catch (error) {
    console.error('Error verifying seller session:', error);
    return null;
  }
}
