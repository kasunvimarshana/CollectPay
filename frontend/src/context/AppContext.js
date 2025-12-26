// App Context for global application state
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";

const AppContext = createContext(null);

// Action types
const SET_LOADING = "SET_LOADING";
const SET_ERROR = "SET_ERROR";
const CLEAR_ERROR = "CLEAR_ERROR";
const SET_SELECTED_SUPPLIER = "SET_SELECTED_SUPPLIER";
const SET_SELECTED_PRODUCT = "SET_SELECTED_PRODUCT";
const SET_DATE_RANGE = "SET_DATE_RANGE";
const UPDATE_SETTINGS = "UPDATE_SETTINGS";

const initialState = {
  isLoading: false,
  error: null,
  selectedSupplier: null,
  selectedProduct: null,
  dateRange: {
    from: null,
    to: null,
  },
  settings: {
    autoSyncEnabled: true,
    notificationsEnabled: true,
    theme: "light",
  },
};

function appReducer(state, action) {
  switch (action.type) {
    case SET_LOADING:
      return { ...state, isLoading: action.payload };
    case SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    case CLEAR_ERROR:
      return { ...state, error: null };
    case SET_SELECTED_SUPPLIER:
      return { ...state, selectedSupplier: action.payload };
    case SET_SELECTED_PRODUCT:
      return { ...state, selectedProduct: action.payload };
    case SET_DATE_RANGE:
      return { ...state, dateRange: action.payload };
    case UPDATE_SETTINGS:
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setLoading = useCallback((loading) => {
    dispatch({ type: SET_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: SET_ERROR, payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: CLEAR_ERROR });
  }, []);

  const setSelectedSupplier = useCallback((supplier) => {
    dispatch({ type: SET_SELECTED_SUPPLIER, payload: supplier });
  }, []);

  const setSelectedProduct = useCallback((product) => {
    dispatch({ type: SET_SELECTED_PRODUCT, payload: product });
  }, []);

  const setDateRange = useCallback((from, to) => {
    dispatch({ type: SET_DATE_RANGE, payload: { from, to } });
  }, []);

  const updateSettings = useCallback((settings) => {
    dispatch({ type: UPDATE_SETTINGS, payload: settings });
  }, []);

  const value = {
    ...state,
    setLoading,
    setError,
    clearError,
    setSelectedSupplier,
    setSelectedProduct,
    setDateRange,
    updateSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export default AppContext;
