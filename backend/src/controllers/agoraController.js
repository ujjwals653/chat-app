import pkg from 'agora-token'
const { RtcTokenBuilder, RtcRole } = pkg;
import dotenv from 'dotenv'
dotenv.config();

const appID = process.env.AGORA_APP_ID;
const appCertificate = process.env.AGORA_APP_CERTIFICATE;
const expirationTimeInSeconds = 3600;

// Validate environment variables
if (!appID || !appCertificate) {
    throw new Error('AGORA_APP_ID and AGORA_APP_CERTIFICATE must be defined in environment variables');
}

export const getToken = (req, res) => {
    try {
        const { channelName, username, imageUrl } = req.body;

        if (!channelName) {
            return res.status(400).json({ error: "Channel name is required" });
        }

        const userId = username || 0;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        const token = RtcTokenBuilder.buildTokenWithUid(
            appID,
            appCertificate,
            channelName,
            userId,
            RtcRole.PUBLISHER,
            privilegeExpiredTs
        );
        console.log(req.body); 
        return res.status(200).json({ appID, token, uid: userId, channelName, imageUrl});
    } catch (error) {
        console.error('Error generating Agora token:', error);
        return res.status(500).json({ error: "Failed to generate token" });
    }
}
