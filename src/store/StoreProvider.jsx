import React, { createContext, useReducer, useContext } from "react";

export const StoreContext = createContext();

// Lấy user/pages từ localStorage nếu có
let userFromStorage = null;
let pagesFromStorage = [];
try {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const pages = localStorage.getItem("pages");
  if (accessToken) {
    userFromStorage = {
      accessToken,
      refreshToken,
      pages: pages ? JSON.parse(pages) : [],
    };
    pagesFromStorage = userFromStorage.pages;
  }
} catch {}

const initialState = {
  user: userFromStorage,
  isAuthenticated: !!userFromStorage,
  userRoles: [], // giả sử userRoles lưu roles của user
  pages: pagesFromStorage,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        userRoles: action.payload?.roles || [],
        pages: action.payload?.pages || [],
      };
    default:
      return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

// Hook custom để dễ sử dụng context
export function useAuthStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useAuthStore must be used within a StoreProvider");
  }
  return {
    isAuthenticated: context.state.isAuthenticated,
    user: context.state.user,
    userRoles: context.state.userRoles,
    pages: context.state.pages,
    dispatch: context.dispatch,
  };
}
