import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function AddLinkForm({ refresh }) {
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/api/links`, { url, code });
      setUrl(""); setCode("");
      refresh();
    } catch (err) {
      alert(err.response?.data?.error || "Error");
    }
  };

  return (
    <form onSubmit={submit} className="mb-4 flex gap-2">
      <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="Long URL" className="border p-2 flex-1"/>
      <input value={code} onChange={e=>setCode(e.target.value)} placeholder="Custom code" className="border p-2"/>
      <button className="bg-blue-500 text-white px-4 py-2">Add</button>
    </form>
  );
}
