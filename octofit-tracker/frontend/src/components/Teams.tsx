import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Team = { name: string; mascot?: string; members: string[] };

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ teams: Team[] }>('/api/teams')
      .then((data) => {
        setTeams(data.teams);
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
        <h2 className="h4">Teams</h2>
        <p>Manage teams and members.</p>
        {error && (
          <div role="alert" className="alert alert-danger">
            Unable to load teams: {error}
          </div>
        )}
        {loading && <p role="status">Loading teams...</p>}
        {!loading && !error && teams.length === 0 && <p>No teams yet.</p>}
        {!loading && !error && teams.length > 0 && (
          <div className="list-group">
            {teams.map((team, index) => (
              <div key={index} className="list-group-item">
                <strong>{team.name}</strong> {team.mascot && `(${team.mascot})`} - {team.members.length} member{team.members.length !== 1 ? 's' : ''}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
