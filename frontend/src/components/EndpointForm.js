import React, { useState } from 'react';

const EndpointForm = ({ onSubmit }) => {
  const [endpoint, setEndpoint] = useState({
    network: '',
    technician_name: '',
    ip_address: '',
    port_number: '',
    point_location: '',
    destination_room: '',
    router_id: '',
  });

  const handleChange = (e) => {
    setEndpoint({ ...endpoint, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(endpoint);
    setEndpoint({
      network: '',
      technician_name: '',
      ip_address: '',
      port_number: '',
      point_location: '',
      destination_room: '',
      router_id: '',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="network" placeholder="Network" value={endpoint.network} onChange={handleChange} required />
      <input type="text" name="technician_name" placeholder="Technician Name" value={endpoint.technician_name} onChange={handleChange} required />
      <input type="text" name="ip_address" placeholder="IP Address" value={endpoint.ip_address} onChange={handleChange} required />
      <input type="number" name="port_number" placeholder="Port Number" value={endpoint.port_number} onChange={handleChange} required />
      <input type="text" name="point_location" placeholder="Point Location" value={endpoint.point_location} onChange={handleChange} required />
      <input type="text" name="destination_room" placeholder="Destination Room" value={endpoint.destination_room} onChange={handleChange} required />
      <input type="number" name="router_id" placeholder="Router ID" value={endpoint.router_id} onChange={handleChange} required />
      <button type="submit">Add Endpoint</button>
    </form>
  );
};

export default EndpointForm;
