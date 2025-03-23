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
        const { channelName, username } = req.body;

        if (!channelName) {
            return res.status(400).json({ error: "Channel name is required" });
        }

        const uid = Math.floor(Math.random()*9999);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        const token = RtcTokenBuilder.buildTokenWithUid(
            appID,
            appCertificate,
            channelName,
            uid,
            RtcRole.PUBLISHER,
            privilegeExpiredTs
        );
        
        return res.status(200).json({ token, uid, channelName });
    } catch (error) {
        console.error('Error generating Agora token:', error);
        return res.status(500).json({ error: "Failed to generate token" });
    }
}
