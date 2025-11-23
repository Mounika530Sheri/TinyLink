import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function StatsPage() {
  const { code } = useParams();
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API}/api/links/${code}`);
        setLink(res.data);
      } catch (err) {
        setLink(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [code]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!link) return <p className="p-4 text-red-500">Link not found</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Stats for {link.code}</h1>
      <p><strong>Target URL:</strong> <a href={link.url} className="text-blue-600 underline">{link.url}</a></p>
      <p><strong>Total Clicks:</strong> {link.clicks}</p>
      <p><strong>Last Clicked:</strong> {link.last_clicked ? new Date(link.last_clicked).toLocaleString() : "-"}</p>
      <p><strong>Created At:</strong> {new Date(link.created_at).toLocaleString()}</p>
    </div>
  );
}
