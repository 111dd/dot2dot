import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const RoutersByBuilding = () => {
  const { building } = useParams(); // קבלת שם הבניין מהנתיב
  const [routers, setRouters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // קריאה ל-API כדי להביא נתבים עבור הבניין
    axios
      .get(`http://127.0.0.1:5000/api/routers/building/${building}`)
      .then((response) => {
        setRouters(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching routers:', error);
        setError('Failed to fetch routers for the building.');
        setIsLoading(false);
      });
  }, [building]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Routers in {building} Building</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>IP Address</th>
            <th>Floor</th>
            <th>Connection Speed</th>
          </tr>
        </thead>
        <tbody>
          {routers.map((router) => (
            <tr key={router.id}>
              <td>{router.id}</td>
              <td>{router.name}</td>
              <td>{router.ip_address}</td>
              <td>{router.floor}</td>
              <td>{router.connection_speed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoutersByBuilding;
