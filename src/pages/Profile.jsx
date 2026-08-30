import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  updateProfile,
  updateProfilePicture,
  getProfile,
} from "../services/database";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { Modal } from "../components/ui/Modal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/Tabs";
import { CreatorTab } from "../components/creators/CreatorTab";
import { useSEO } from "../hooks/useSEO";

const Profile = () => {
  useSEO({ title: "Your Profile", description: "View and edit your BookPals profile." });
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState("reader");
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    avatar_url: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user?.id) {
          const profileData = await getProfile(user.id);
          setFormData({
            username: profileData?.username || "",
            bio: profileData?.bio || "",
            avatar_url: profileData?.avatar_url || "",
          });
          const isComplete = !!(profileData?.bio && profileData?.avatar_url);
          setProfileComplete(isComplete);
          setShowTutorial(!isComplete);
          setRole(profileData?.role || "reader");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, [user]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setUploadingImage(true);
        const updatedProfile = await updateProfilePicture(user.id, file);
        setFormData((prev) => ({
          ...prev,
          avatar_url: updatedProfile.avatar_url,
        }));
        setUploadingImage(false);
        if (!profileComplete) {
          setProfileComplete(!!formData.bio);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        setUploadingImage(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await updateProfile(user.id, formData);
      setIsEditing(false);
      if (!profileComplete && formData.bio && formData.avatar_url) {
        setProfileComplete(true);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const dismissTutorial = () => {
    setShowTutorial(false);
  };

  return (
    <div className="min-h-screen bg-paper py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-ink mb-8 text-center">
          My Profile
        </h1>

        <Modal isOpen={showTutorial} onClose={dismissTutorial} title="Complete Your Profile">
          <p className="text-ink-muted mb-4">
            Welcome to BookPals! Let's make your profile stand out to connect
            with fellow book lovers:
          </p>
          <ul className="list-disc pl-5 mb-6 text-ink-muted space-y-2">
            <li>Upload a profile picture</li>
            <li>Write a short bio about your reading preferences</li>
            <li>Describe your favorite books or genres</li>
          </ul>
          <div className="flex justify-end">
            <Button onClick={dismissTutorial}>Got it</Button>
          </div>
        </Modal>

        <Card className="p-0 backdrop-blur-sm bg-surface/90 overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-r from-accent to-accent-dark">
            <div className="absolute -bottom-16 left-8">
              <div className="relative group w-32 h-32">
                <Avatar
                  src={formData.avatar_url}
                  name={formData.username || "User"}
                  className="w-full h-full border-4 border-surface"
                />
                <label className="absolute bottom-0 right-0 bg-accent-dark hover:brightness-110 p-2 rounded-full cursor-pointer transition-colors shadow-lg">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </label>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <Button
                variant="secondary"
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </div>
          {/* Profile Content */}
          <div className="pt-20 px-8 pb-8">
          <Tabs defaultValue="profile">
            {(role === "creator" || role === "both") && (
              <TabsList className="mb-6">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="creator">Creator</TabsTrigger>
              </TabsList>
            )}
            <TabsContent value="profile">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  placeholder="Your username"
                />
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    className="w-full px-4 py-2 bg-surface text-ink border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="Tell us about yourself and your reading preferences..."
                    rows="4"
                  />
                  <p className="mt-1 text-sm text-ink-muted">
                    Share your favorite genres, authors, or what you're
                    currently reading.
                  </p>
                </div>
                <div className="flex justify-end mt-6">
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </form>
            ) : (
              <div>
                <h2 className="font-display text-2xl font-bold text-ink">
                  {formData.username || "Your Name"}
                </h2>
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-ink mb-2">About Me</h3>
                  {formData.bio ? (
                    <p className="text-ink-muted whitespace-pre-line">{formData.bio}</p>
                  ) : (
                    <p className="text-ink-muted italic">
                      No bio yet. Click "Edit Profile" to add information about
                      yourself.
                    </p>
                  )}
                </div>
                {!profileComplete && (
                  <div className="mt-8 p-4 bg-accent/10 rounded-lg border border-accent/20">
                    <h3 className="font-medium text-accent-dark mb-2">
                      Complete Your Profile
                    </h3>
                    <p className="text-accent-dark/80 text-sm">
                      {!formData.avatar_url && !formData.bio
                        ? "Add a profile picture and bio to help others connect with you."
                        : !formData.avatar_url
                        ? "Add a profile picture to complete your profile."
                        : "Add a bio to tell others about your reading interests."}
                    </p>
                  </div>
                )}
              </div>
            )}
            </TabsContent>
            {(role === "creator" || role === "both") && (
              <TabsContent value="creator">
                <CreatorTab userId={user.id} />
              </TabsContent>
            )}
          </Tabs>
          </div>
        </Card>
      </div>
    </div>
  );
};
export default Profile;
