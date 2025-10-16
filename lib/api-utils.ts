export async function apiCall(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      throw new Error(`Expected JSON response but got: ${contentType}. Response: ${text.substring(0, 200)}...`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('API call failed:', error)
    
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON response from server')
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error - please check your connection')
    }
    
    throw error
  }
}

export async function uploadFile(file: File, type: string = 'upload', folder: string = 'anytime-pooja') {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    formData.append('folder', folder)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Upload failed with status: ${response.status}`
      
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorMessage
      } catch {
        // If not JSON, use the text as error message
        errorMessage = errorText || errorMessage
      }
      
      throw new Error(errorMessage)
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      throw new Error(`Expected JSON response but got HTML. This usually means the upload endpoint is not working. Response: ${text.substring(0, 200)}...`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Upload failed')
    }
    
    return data.url
  } catch (error) {
    console.error('File upload failed:', error)
    
    if (error instanceof SyntaxError) {
      throw new Error('Server returned invalid response - upload endpoint may not be working')
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error - please check your connection')
    }
    
    throw error
  }
}