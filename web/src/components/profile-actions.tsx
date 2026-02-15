"use client"

import type React from "react"

import { useState } from "react"
import type { User } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, Camera, UserIcon, Save } from "lucide-react"
import { useAppUser } from "@/hooks/use-app"

interface ProfileActionsProps {
  profileUser: User
}

const ProfileActions = ({ profileUser }: ProfileActionsProps) => {
  const { user: currentUser } = useAppUser()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingPicture, setIsEditingPicture] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: profileUser.first_name,
    last_name: profileUser.last_name,
    email: profileUser.email,
  })
  const [profilePicture, setProfilePicture] = useState(profileUser.profile_picture || "")

  // Only render if the current user is viewing their own profile
  if (!currentUser || currentUser.username !== profileUser.username) {
    return null
  }

  const handleProfileUpdate = () => {
    // TODO: Implement API call to update profile
    console.log("Updating profile:", profileData)
    setIsEditingProfile(false)
  }

  const handlePictureUpdate = () => {
    // TODO: Implement API call to update profile picture
    console.log("Updating profile picture:", profilePicture)
    setIsEditingPicture(false)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // TODO: Upload file and get URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfilePicture(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Profile Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Edit Profile Picture */}
        <Dialog open={isEditingPicture} onOpenChange={setIsEditingPicture}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Update Picture
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Profile Picture</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profilePicture || "/placeholder.svg?height=96&width=96"} />
                  <AvatarFallback>
                    {profileUser.first_name[0]}
                    {profileUser.last_name[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <Label htmlFor="picture-upload">Choose new picture</Label>
                <Input id="picture-upload" type="file" accept="image/*" onChange={handleFileUpload} className="mt-1" />
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePictureUpdate} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={() => setIsEditingPicture(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Profile Details */}
        <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <UserIcon className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, first_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, last_name: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleProfileUpdate} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditingProfile(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Additional Actions */}
        <div className="pt-4 border-t space-y-2">
          <Button variant="outline" size="sm" className="w-full">
            Change Password
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            Privacy Settings
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            Account Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProfileActions
