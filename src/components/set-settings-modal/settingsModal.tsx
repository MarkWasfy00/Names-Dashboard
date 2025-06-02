import { Button } from '../ui/button'
import { Dialog, DialogTitle, DialogContent, DialogHeader, DialogTrigger } from '../ui/dialog'
import { Input } from '../ui/input'
import { useState } from 'react'

interface SettingsModalProps {
  onSetVideoId: (videoId: string, streamlabsToken: string) => void;
}

const SettingsModal = ({ onSetVideoId }: SettingsModalProps) => {
  const [videoId, setVideoId] = useState('')
  const [streamlabsToken, setStreamlabsToken] = useState('')
  const [open, setOpen] = useState(false)

  const handleSubmit = () => {
    if (videoId && streamlabsToken) {
      onSetVideoId(videoId, streamlabsToken)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="bg-green-600 text-white px-4 py-2 rounded-md">set listener</DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Connect with Streamlabs & Video ID</DialogTitle>
                <div className="flex flex-col gap-4 mt-4">
                    <Input 
                        type="text" 
                        placeholder="Video ID" 
                        value={videoId}
                        onChange={(e) => setVideoId(e.target.value)}
                    />
                    <Input 
                        type="text" 
                        placeholder="Streamlabs Token" 
                        value={streamlabsToken}
                        onChange={(e) => setStreamlabsToken(e.target.value)}
                    />
                    <Button onClick={handleSubmit}>Connect</Button>
                </div>
            </DialogHeader>
        </DialogContent>
    </Dialog>
  )
}

export default SettingsModal