const crypto = require('crypto');

/**
 * Generate or get guest session ID from cookies
 * @param {Request} req request object
 * @param {Response} res response object
 * @returns {String} guest session ID
 */
function getOrCreateGuestSession(req, res) {
    let guestSessionId = req.get("guest_session_id");
    // console.log("guestSessionId : ", guestSessionId);
    if (!guestSessionId) {
        // Generate a unique guest session ID
        guestSessionId = 'guest_' + crypto.randomBytes(16).toString('hex');
        
        // Set cookie with 30 days expiration
        res.cookie('guest_session_id', guestSessionId, {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: true,
            secure: true,
            sameSite: 'lax'
        });
    }
    
    return guestSessionId;
}

/**
 * Get user identifier (user_id for authenticated, guest_session_id for guests)
 * @param {Request} req request object
 * @returns {Object} { userId: number|null, guestSessionId: string|null, isGuest: boolean }
 */
function getUserIdentifier(req) {
    const userId = req.user?.userId || req.user?.data?.id;
    
    if (userId) {
        return {
            userId: userId,
            guestSessionId: null,
            isGuest: false
        };
    }
    let guestSessionId = req.get("guest_session_id");
    return {
        userId: null,
        guestSessionId: guestSessionId,
        isGuest: true
    };
}

module.exports = {
    getOrCreateGuestSession,
    getUserIdentifier
};

