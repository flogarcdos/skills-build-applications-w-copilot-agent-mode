import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Workout = { title: string; focus: string; minutes: number; difficulty: string; reason: string };

export default function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const userEmail = 'mona@example.com';
    getJson<{ suggestions: Workout[] }>(`/api/workouts/suggestions/${encodeURIComponent(userEmail)}`)
      .then((data) => {
        setWorkouts(data.suggestions);
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
        <h2 className="h4">Workout suggestions</h2>
        <p>Recommend workouts from activity patterns.</p>
        {error && (
          <div role="alert" className="alert alert-danger">
            Unable to load workout suggestions: {error}
          </div>
        )}
        {loading && <p role="status">Loading workout suggestions...</p>}
        {!loading && !error && workouts.length === 0 && <p>No workout suggestions yet.</p>}
        {!loading && !error && workouts.length > 0 && (
          <div className="list-group">
            {workouts.map((workout, index) => (
              <div key={index} className="list-group-item">
                <strong>{workout.title}</strong> ({workout.focus}, {workout.difficulty})
                <div className="text-muted small">{workout.reason}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
