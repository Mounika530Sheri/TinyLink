import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function HealthCheck() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await axios.get(`${API}/healthz`);
        setStatus(res.data);
      } catch (err) {
        setStatus({ ok: false, error: err.message });
      }
    };
    check();
  }, []);

  if (!status) return <p className="p-4">Checking health...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">System Health</h1>
      <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(status, null, 2)}</pre>
    </div>
  );
}
