import { Button } from '../ui/button'
import { Dialog, DialogTitle, DialogContent, DialogHeader, DialogTrigger } from '../ui/dialog'
import { Input } from '../ui/input'

const SettingsModal = () => {
  return (
    <Dialog>
        <DialogTrigger className="bg-green-600 text-white px-4 py-2 rounded-md">connect</DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Connect with Streamlabs & Video ID</DialogTitle>
            <Input type="text" placeholder="Streamlabs ID" />
            <Input type="text" placeholder="Video ID" />
            <Button>Connect</Button>
            </DialogHeader>
        </DialogContent>
    </Dialog>
  )
}

export default SettingsModal