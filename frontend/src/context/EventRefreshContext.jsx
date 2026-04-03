import { createContext, useContext, useState, useCallback } from 'react';

const EventRefreshContext = createContext();

export const EventRefreshProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <EventRefreshContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </EventRefreshContext.Provider>
  );
};

export const useEventRefresh = () => {
  const context = useContext(EventRefreshContext);
  if (!context) {
    throw new Error('useEventRefresh must be used within EventRefreshProvider');
  }
  return context;
};
