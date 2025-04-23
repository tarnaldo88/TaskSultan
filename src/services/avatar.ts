// No import needed for File, it is a global type in browsers
export async function uploadAvatar({ file, token }: { file: File; token: string }) {
  if (!file || !token) throw new Error('Missing file or token')
  const formData = new FormData()
  formData.append('avatar', file)
  const response = await fetch('http://localhost:4000/api/user/avatar', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  if (!response.ok) {
    let errorMsg = 'Upload failed'
    try { errorMsg = (await response.json()).error || errorMsg } catch {}
    throw new Error(errorMsg)
  }
  return response.json()
}
