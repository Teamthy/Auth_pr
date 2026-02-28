import { useEffect, useState } from "react";
import api from "./api";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data } = await api.get("/profile");
        setProfile(data);
      } catch (err) {
        alert(err.response?.data?.error || "Failed to load profile");
      }
    }
    fetchProfile();
  }, []);

  if (!profile) return <p>Loading...</p>;

  return (
    <div>
      <h2>Profile</h2>
      <p>Email: {profile.email}</p>
      <p>Role: {profile.role}</p>
      <p>Verified: {profile.isVerified ? "Yes" : "No"}</p>
    </div>
  );
}
