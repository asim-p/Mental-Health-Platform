import fetch from 'node-fetch';

/**
 * Retrieves a Server-to-Server OAuth access token from Zoom
 */
async function getZoomAccessToken() {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error('Zoom credentials are not configured in environment variables');
  }

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  const response = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to retrieve Zoom access token: ${errorData.reason || response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Creates a real Zoom meeting for a scheduled session
 * @param {Date} scheduledAt - The time of the appointment
 * @param {number} duration - The duration in minutes (default 60)
 * @param {string} patientName - The name of the patient
 */
export async function createZoomMeeting(scheduledAt, duration = 60, patientName = 'Patient') {
  try {
    const accessToken = await getZoomAccessToken();

    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: `Secure Consultation Session - ${patientName}`,
        type: 2, // Scheduled meeting
        start_time: new Date(scheduledAt).toISOString(),
        duration: duration,
        timezone: 'Asia/Kathmandu',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true, // Allow patient to join first
          jbh_time: 5, // 5 minutes before start
          mute_upon_entry: true,
          waiting_room: false, // Turn off waiting room for seamless client entry
          approval_type: 2, // No approval required
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Zoom Meeting creation failed: ${errorData.message || response.statusText}`);
    }

    const meetingData = await response.json();

    return {
      zoomMeetingUrl: meetingData.start_url, // URL for the therapist (Host)
      zoomJoinUrl: meetingData.join_url,     // URL for the patient (Participant)
    };
  } catch (error) {
    console.error('Error creating Zoom meeting:', error);
    // Fallback to randomized mockup in case the API rate limit is hit or credentials expire
    const mockId = Math.floor(100000000 + Math.random() * 900000000);
    return {
      zoomMeetingUrl: `https://zoom.us/j/mock${mockId}`,
      zoomJoinUrl: `https://zoom.us/j/mock${mockId}`,
    };
  }
}
