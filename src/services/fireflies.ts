const FIREFLIES_API = 'https://api.fireflies.ai/graphql';

interface FirefliesInviteResponse {
  success: boolean;
  transcriptId?: string;
  error?: string;
}

export const inviteFirefliesBot = async (
  meetingLink: string,
  meetingTitle: string
): Promise<FirefliesInviteResponse> => {
  const apiKey = import.meta.env.VITE_FIREFLIES_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'Fireflies API key not configured',
    };
  }

  const mutation = `
    mutation AddToLiveMeeting($meetingLink: String!, $title: String) {
      addToLiveMeeting(
        meeting_link: $meetingLink
        title: $title
      ) {
        success
      }
    }
  `;

  const variables = {
    meetingLink: meetingLink,
    title: meetingTitle,
  };

  try {
    const response = await fetch(FIREFLIES_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query: mutation,
        variables: variables,
      }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error('Fireflies API errors:', data.errors);
      return {
        success: false,
        error: data.errors[0]?.message || 'Failed to invite Fireflies bot',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: `API returned status ${response.status}: ${data.errors?.[0]?.message || 'Unknown error'}`,
      };
    }

    const result = data.data?.addToLiveMeeting;

    if (!result) {
      return {
        success: false,
        error: 'No response from Fireflies API',
      };
    }

    return {
      success: result.success || false,
      transcriptId: meetingLink,
      error: result.success ? undefined : 'Failed to add bot to meeting',
    };
  } catch (error) {
    console.error('Fireflies bot invite error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const getTranscriptStatus = async (transcriptId: string) => {
  const apiKey = import.meta.env.VITE_FIREFLIES_API_KEY;

  const query = `
    query {
      transcript(id: "${transcriptId}") {
        id
        title
        date
        duration
        transcript_url
        summary {
          overview
          action_items
        }
        participants {
          name
          email
        }
      }
    }
  `;

  try {
    const response = await fetch(FIREFLIES_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0]?.message || 'Failed to fetch transcript');
    }

    return data.data?.transcript;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return null;
  }
};

export const stopRecording = async (transcriptId: string): Promise<boolean> => {
  const apiKey = import.meta.env.VITE_FIREFLIES_API_KEY;

  const mutation = `
    mutation {
      stopRecording(transcript_id: "${transcriptId}") {
        success
        message
      }
    }
  `;

  try {
    const response = await fetch(FIREFLIES_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query: mutation }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.data?.stopRecording?.success || false;
  } catch (error) {
    console.error('Error stopping recording:', error);
    return false;
  }
};

export interface FirefliesTranscript {
  id: string;
  title: string;
  date: string;
  duration: number;
  transcript_url?: string;
  audio_url?: string;
  video_url?: string;
  summary?: {
    keywords?: string[];
    action_items?: string[];
    overview?: string;
    meeting_type?: string;
    topics_discussed?: string[];
  };
  speakers?: Array<{
    id: string;
    name: string;
  }>;
  meeting_attendees?: Array<{
    displayName: string;
    email: string;
  }>;
}

export const fetchTranscripts = async (
  limit: number = 50
): Promise<FirefliesTranscript[]> => {
  const apiKey = import.meta.env.VITE_FIREFLIES_API_KEY;

  if (!apiKey) {
    console.error('❌ Fireflies API key not configured');
    return [];
  }

  const query = `{
    transcripts(limit: ${limit}) {
      id
      title
      date
      duration
      transcript_url
      audio_url
      video_url
      summary {
        keywords
        action_items
        overview
      }
      speakers {
        id
        name
      }
      meeting_attendees {
        displayName
        email
      }
    }
  }`;

  try {
    console.log('🔄 Fetching transcripts from Fireflies...');
    console.log('📝 Query:', query);
    console.log('🔑 API Key exists:', !!apiKey);
    console.log('🔑 API Key length:', apiKey?.length);

    const response = await fetch(FIREFLIES_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query }),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);

    const data = await response.json();
    console.log('📦 Full API Response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error(`❌ HTTP error: ${response.status}`);
      console.error('❌ Response data:', data);
      return [];
    }

    if (data.errors) {
      console.error('❌ GraphQL errors:', JSON.stringify(data.errors, null, 2));
      return [];
    }

    const transcripts = data.data?.transcripts || [];
    console.log(`✅ Successfully fetched ${transcripts.length} transcripts`);

    if (transcripts.length > 0) {
      console.log('📋 First transcript:', JSON.stringify(transcripts[0], null, 2));
    }

    return transcripts;
  } catch (error) {
    console.error('❌ Exception while fetching transcripts:', error);
    if (error instanceof Error) {
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
    }
    return [];
  }
};
