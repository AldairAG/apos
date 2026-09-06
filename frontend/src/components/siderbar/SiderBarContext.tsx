import { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextType {
  visible: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(
  undefined
);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  const openSidebar = () => {
    setVisible(true);
  };

  const closeSidebar = () => {
    setVisible(false);
  };

  const toggleSidebar = () => {
    setVisible((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{
        visible,
        openSidebar,
        closeSidebar,
        toggleSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error(
      "useSidebar debe utilizarse dentro de un SidebarProvider"
    );
  }

  return context;
}