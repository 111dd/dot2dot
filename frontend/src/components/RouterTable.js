import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import RouterModal from './RouterModal'; // ודא שהנתיב נכון

const RouterTable = () => {
  const [routers, setRouters] = useState([]);
  const [selectedRouter, setSelectedRouter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // שליפת הנתבים מהשרת
  useEffect(() => {
    axios
      .get('http://127.0.0.1:5000/api/routers')
      .then((response) => {
        setRouters(response.data);
        setIsLoading(false); // סיום טעינה
      })
      .catch((error) => {
        console.error('Error fetching routers:', error);
        setError('Failed to fetch routers.');
        setIsLoading(false); // סיום טעינה עם שגיאה
      });
  }, []);

  // פתיחת מודל עם פרטי נתב
  const handleMoreClick = (router) => {
    setSelectedRouter(router);
    setIsModalOpen(true);
  };

  // סגירת המודל
  const handleCloseModal = () => {
    setSelectedRouter(null);
    setIsModalOpen(false);
  };

  // אם יש שגיאה, הצג הודעת שגיאה
  if (error) {
    return <div>Error: {error}</div>;
  }

  // אם המידע נטען, הצג הודעת טעינה
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <Link to="/add-router">
          <button>Add Router</button>
        </Link>
      </div>
      <table className="sticky-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>IP Address</th>
            <th>Floor</th>
            <th>Building</th>
            <th>Connection Speed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {routers.map((router) => (
            <tr key={router.id}>
              <td>{router.id || 'N/A'}</td>
              <td>{router.name || 'N/A'}</td>
              <td>{router.ip_address || 'N/A'}</td>
              <td>{router.floor || 'N/A'}</td>
              <td>{router.building || 'N/A'}</td>
              <td>{router.connection_speed || 'N/A'}</td>
              <td>
                <button onClick={() => handleMoreClick(router)}>More</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && selectedRouter && (
        <RouterModal
          router={selectedRouter}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default RouterTable;
