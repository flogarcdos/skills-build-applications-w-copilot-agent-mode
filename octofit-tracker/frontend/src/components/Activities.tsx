import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Activity = { type: string; minutes: number; points: number; occurredAt: string };

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ activities: Activity[] }>('/api/activities')
      .then((data) => {
        setActivities(data.activities);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Activities</h2>
        <p>Track student activity minutes and points.</p>
        {error && (
          <div role="alert" className="alert alert-danger">
            Unable to load activities: {error}
          </div>
        )}
        {loading && <p role="status">Loading activities...</p>}
        {!loading && !error && activities.length === 0 && <p>No activities yet.</p>}
        {!loading && !error && activities.length > 0 && (
          <div className="list-group">
            {activities.map((activity, index) => (
              <div key={index} className="list-group-item">
                <strong>{activity.type}</strong> - {activity.minutes} minutes ({activity.points} points)
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
