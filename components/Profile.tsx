import React, { useState, useEffect } from "react";
import {
  Camera,
  MapPin,
  Mail,
  Link as LinkIcon,
  Edit2,
  Save,
  Award,
  Briefcase,
  Star,
  Clock,
  CheckCircle2,
  Plus,
  X,
  Image as ImageIcon,
  Upload,
  FileText,
} from "lucide-react";
import ResumeBuilder from "./ResumeBuilder";

const CURRENT_USER = {
  name: "",
  role: "",
  bio: "",
  hourlyRate: 0,
  rating: 0,
  skills: [],
  avatar: "https://picsum.photos/200",
  portfolio: [],
};

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    ...CURRENT_USER,
    portfolio: [],
  });

  const [showResumeBuilder, setShowResumeBuilder] = useState(false);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [rate, setRate] = useState("0");

  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    category: "",
    image: "",
  });

  /* ---------------- FETCH PROFILE ---------------- */
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8080/api/profile/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setUser({
        ...CURRENT_USER,
        name: data.displayName || data.email,
        role: data.role,
        bio: data.bio || "",
        hourlyRate: data.hourlyRate || 0,
        rating: data.rating || 0,
        skills: data.skills || [],
        avatar: data.avatarUrl || "https://picsum.photos/200",
        portfolio: data.portfolio || [],
      });

      setName(data.displayName || "");
      setRole(data.role || "CLIENT");
      setBio(data.bio || "");
      setRate((data.hourlyRate || 0).toString());
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- SAVE PROFILE ---------------- */
  const handleSaveProfile = () => {
    setUser((prev) => ({
      ...prev,
      name,
      role,
      bio,
      hourlyRate: parseFloat(rate) || 0,
    }));
    setIsEditing(false);
  };

  /* ---------------- ADD PORTFOLIO ---------------- */
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const payload = {
        items: [
          {
            title: newProject.title,
            image:
              newProject.image ||
              `https://picsum.photos/600/400?random=${Date.now()}`,
            category: newProject.category,
          },
        ],
      };

      const res = await fetch(
        "http://localhost:8080/api/profile/portfolio?mode=append",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      setUser((prev) => ({
        ...prev,
        portfolio: data.portfolio || [],
      }));

      setIsAddingProject(false);
      setNewProject({ title: "", category: "", image: "" });
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- DELETE PORTFOLIO ---------------- */
  const handleDeleteProject = async (id: string) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:8080/api/profile/portfolio/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser((prev) => ({
        ...prev,
        portfolio: prev.portfolio.filter((p: any) => p.id !== id),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="h-full overflow-y-auto p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <button
            onClick={() =>
              isEditing ? handleSaveProfile() : setIsEditing(true)
            }
            className="bg-cad-accent text-black px-5 py-2 rounded-xl font-bold"
          >
            {isEditing ? "Save" : "Edit"}
          </button>
        </div>

        {/* PROFILE INFO */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <h2 className="text-white text-xl font-bold">{user.name}</h2>
          <p className="text-gray-400">{user.role}</p>
          <p className="text-gray-300 mt-2">{user.bio}</p>
        </div>

        {/* PORTFOLIO */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-white text-xl font-bold">Portfolio</h2>

            <button
              onClick={() => setIsAddingProject(true)}
              className="bg-cad-accent text-black px-4 py-2 rounded-xl font-bold"
            >
              Add Project
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {user.portfolio?.map((item: any) => (
              <div
                key={item.id}
                className="relative group rounded-xl overflow-hidden border border-white/10"
              >
                <img src={item.image} className="w-full h-48 object-cover" />

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-4 transition">
                  <p className="text-cad-accent text-sm">
                    {item.category || "General"}
                  </p>
                  <h3 className="text-white font-bold">{item.title}</h3>
                </div>

                <button
                  onClick={() => handleDeleteProject(item.id)}
                  className="absolute top-2 right-2 bg-red-500 p-2 rounded-lg opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ADD PROJECT MODAL */}
        {isAddingProject && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
            <form
              onSubmit={handleAddProject}
              className="bg-[#111] p-6 rounded-xl w-[400px] space-y-4"
            >
              <input
                placeholder="Title"
                className="w-full p-2 bg-black border border-white/10"
                value={newProject.title}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    title: e.target.value,
                  })
                }
              />

              <input
                placeholder="Category"
                className="w-full p-2 bg-black border border-white/10"
                value={newProject.category}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    category: e.target.value,
                  })
                }
              />

              <input
                placeholder="Image URL"
                className="w-full p-2 bg-black border border-white/10"
                value={newProject.image}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    image: e.target.value,
                  })
                }
              />

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddingProject(false)}>
                  Cancel
                </button>

                <button className="bg-cad-accent px-4 py-2 rounded-lg text-black font-bold">
                  Add
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
