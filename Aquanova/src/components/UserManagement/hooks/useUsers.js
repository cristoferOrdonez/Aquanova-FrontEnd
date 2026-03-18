import { useState, useEffect, useCallback } from 'react';
import { usersService } from '../../../services/usersService';

export function useUsers() {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersService.getUsers();
      if (response && response.users) {
        setUsersList(response.users);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    usersList,
    loading,
    error,
    refreshUsers: fetchUsers,
  };
}
