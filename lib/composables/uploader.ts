import axios from 'axios'

export async function uploadAudioToAPI(
  audioBlob: Blob, 
  apiUrl: string | undefined,
  tagName?: string | undefined
): Promise<boolean> {

  if (!apiUrl) {
    console.error('API URL is not defined')
    return false;
  }

  const fd = new FormData()
  fd.append(tagName ?? 'audio', audioBlob)

  try {
    console.log(`sending audio to server at ${apiUrl}`)

    const response = await axios.post(apiUrl, fd, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    // transcription.value = response.data.transcription

    return true;
  } catch (error) {
    console.error(error)
    return false;
  }
}