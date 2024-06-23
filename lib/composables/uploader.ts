export async function uploadAudioToAPI(
  audioBlob: Blob, 
  audioContraints: any,
  apiUrl: string | undefined,
  apiHeaders: Record<string, string> | undefined,
  tagName?: string | undefined
): Promise<string> {

  if (!apiUrl) {
    throw new Error('API URL is not defined')
  }

  const fd = new FormData()
  fd.append(tagName ?? 'audio', audioBlob)
  fd.append('audioConstraints', JSON.stringify(audioContraints))

  try {
    let response: Response;
    if (apiHeaders) {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: apiHeaders,
        body: fd
      })
    } else {
      response = await fetch(apiUrl, {
        method: 'POST',
        body: fd
      })
    }

    // TODO: declear a return structure for the API response
    const transformedResponse = await response.json();
    return transformedResponse;
  } catch (error) {
    throw new Error(`Error uploading audio to API: ${error}`)
  }
}