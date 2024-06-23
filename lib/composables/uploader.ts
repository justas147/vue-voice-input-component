export async function uploadAudioToAPI(
  audioBlob: Blob, 
  apiUrl: string | undefined,
  tagName?: string | undefined
): Promise<string> {

  if (!apiUrl) {
    console.error('API URL is not defined')
    throw new Error('API URL is not defined')
  }

  const fd = new FormData()
  fd.append(tagName ?? 'audio', audioBlob)

  try {
    console.log(`sending audio to server at ${apiUrl}`)

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: fd
    })

    // TODO: declear a return structure for the API response
    const transformedResponse = await response.json();
    return transformedResponse.transcription;
  } catch (error) {
    throw new Error(`Error uploading audio to API: ${error}`)
  }
}