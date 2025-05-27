import API_BASE_URL from './../config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EndpointForm = ({ onSubmit, routers, initialEndpoint }) => {
  // אם יש אובייקט התחלה, נשתמש בו, אחרת ניקח ערכי ברירת מחדל ריקים.
  const [endpoint, setEndpoint] = useState(() => {
    return initialEndpoint || {
      technician_name: ``,
      connected_port_number: '',
      point_location: '',
      destination_room: '',
      router_id: '',
      rit_prefix_id: '',
      network_id: '',
      new_network_name: '',
    };
  });

  const [ritPrefixes, setRitPrefixes] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [isNewNetwork, setIsNewNetwork] = useState(false);

  useEffect(() => {
    const fetchRitPrefixes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/endpoints/rit-prefixes`);
        setRitPrefixes(response.data);
      } catch (error) {
        console.error('Failed to fetch RIT prefixes:', error);
      }
    };
    fetchRitPrefixes();
  }, []);

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/networks`);
        setNetworks(response.data);
      } catch (error) {
        console.error('Failed to fetch networks:', error);
      }
    };
    fetchNetworks();
  }, []);

  // מעדכן State של טופס
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'router_id') {
      // אם בחרנו ראוטר, אפשר למשוך network_id כברירת מחדל
      const selectedRouter = routers.find((r) => r.id === parseInt(value, 10));
      setEndpoint((prev) => ({
        ...prev,
        router_id: value,
        network_id: selectedRouter?.network_id || '',
      }));
    } else if (name === 'network_id') {
      if (value === 'new') {
        setIsNewNetwork(true);
        setEndpoint((prev) => ({ ...prev, network_id: '' }));
      } else {
        setIsNewNetwork(false);
        setEndpoint((prev) => ({
          ...prev,
          network_id: value,
          new_network_name: '',
        }));
      }
    } else {
      setEndpoint((prev) => ({ ...prev, [name]: value }));
    }
  };

  // שליחת הטופס
  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalNetworkId = endpoint.network_id;

    if (isNewNetwork && endpoint.new_network_name.trim() !== '') {
      try {
        const resp = await axios.post(`${API_BASE_URL}/api/networks`, {
          name: endpoint.new_network_name,
        });
        finalNetworkId = resp.data.id; // בהנחה שהשרת מחזיר {id: ...}
      } catch (error) {
        console.error('Failed to create new network:', error);
        alert('Failed to create new network. Please try again.');
        return;
      }
    }

    const endpointToSubmit = {
      ...endpoint,
      network_id: finalNetworkId,
    };
    delete endpointToSubmit.new_network_name;

    onSubmit(endpointToSubmit);

    // איפוס רק אם תרצה לנקות את השדות אחרי עריכה/הוספה
    setEndpoint({
      technician_name: '',
      connected_port_number: '',
      point_location: '',
      destination_room: '',
      router_id: '',
      rit_prefix_id: '',
      network_id: '',
      new_network_name: '',
    });
    setIsNewNetwork(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add / Edit Endpoint</h3>

      {/* Technician Name */}
      <input
        type="text"
        name="technician_name"
        placeholder="Technician Name"
        value={endpoint.technician_name}
        onChange={handleChange}
        required
      />
      {/* Connected Port Number */}
      <input
        type="number"
        name="connected_port_number"
        placeholder="Connected Port Number"
        value={endpoint.connected_port_number}
        onChange={handleChange}
        required
      />
      {/* ... שדות נוספים ... */}
      <select
        name="rit_prefix_id"
        value={endpoint.rit_prefix_id}  // כאן יוצג הערך הקיים מעריכה
        onChange={handleChange}
        required
      >
        <option value="">Select RIT Prefix</option>
        {ritPrefixes.map((prefix) => (
          <option key={prefix.id} value={prefix.id}>
            {prefix.prefix}
          </option>
        ))}
      </select>

      {/* ... וכו' ... */}

      <button type="submit">Save Endpoint</button>
    </form>
  );
};

export default EndpointForm;