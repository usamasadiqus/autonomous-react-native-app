import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {APP_CONSTANTS} from '../../utils/constants';

// Types
export interface App {
  id: number;
  userId: number;
  name: string;
  description: string;
  logo: string;
  packageName: string;
  version: string;
  status: 'active' | 'inactive' | 'development';
  subscriptionStatus: 'free' | 'basic' | 'premium';
  lastUpdated: string;
  createdAt: string;
  category: string;
  platform: string[];
  downloads: number;
  rating: number;
  features: string[];
}

export interface AppsState {
  apps: App[];
  filteredApps: App[];
  selectedApp: App | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  searchQuery: string;
  filterBy: 'all' | 'active' | 'inactive' | 'development';
  sortBy: 'name' | 'lastUpdated' | 'downloads' | 'rating';
}

// Async Thunks
export const fetchApps = createAsyncThunk(
  'apps/fetchApps',
  async (userId: number, {rejectWithValue}) => {
    try {
      const response = await fetch(
        `${APP_CONSTANTS.API_BASE_URL}/apps?userId=${userId}`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch apps');
      }
      const apps = await response.json();
      return apps;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const createApp = createAsyncThunk(
  'apps/createApp',
  async (
    appData: Omit<App, 'id' | 'createdAt' | 'lastUpdated'>,
    {rejectWithValue},
  ) => {
    try {
      const newApp = {
        ...appData,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      const response = await fetch(`${APP_CONSTANTS.API_BASE_URL}/apps`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newApp),
      });

      if (!response.ok) {
        throw new Error('Failed to create app');
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateApp = createAsyncThunk(
  'apps/updateApp',
  async (app: App, {rejectWithValue}) => {
    try {
      const updatedApp = {
        ...app,
        lastUpdated: new Date().toISOString(),
      };

      const response = await fetch(
        `${APP_CONSTANTS.API_BASE_URL}/apps/${app.id}`,
        {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(updatedApp),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to update app');
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteApp = createAsyncThunk(
  'apps/deleteApp',
  async (appId: number, {rejectWithValue}) => {
    try {
      const response = await fetch(
        `${APP_CONSTANTS.API_BASE_URL}/apps/${appId}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to delete app');
      }

      return appId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState: AppsState = {
  apps: [],
  filteredApps: [],
  selectedApp: null,
  loading: false,
  refreshing: false,
  error: null,
  searchQuery: '',
  filterBy: 'all',
  sortBy: 'lastUpdated',
};

const appsSlice = createSlice({
  name: 'apps',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      applyFilters(state);
    },
    setFilterBy: (
      state,
      action: PayloadAction<'all' | 'active' | 'inactive' | 'development'>,
    ) => {
      state.filterBy = action.payload;
      applyFilters(state);
    },
    setSortBy: (
      state,
      action: PayloadAction<'name' | 'lastUpdated' | 'downloads' | 'rating'>,
    ) => {
      state.sortBy = action.payload;
      applySorting(state);
    },
    setSelectedApp: (state, action: PayloadAction<App | null>) => {
      state.selectedApp = action.payload;
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.refreshing = action.payload;
    },
  },
  extraReducers: builder => {
    // Fetch Apps
    builder.addCase(fetchApps.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchApps.fulfilled, (state, action) => {
      state.loading = false;
      state.refreshing = false;
      state.apps = action.payload;
      applyFilters(state);
    });
    builder.addCase(fetchApps.rejected, (state, action) => {
      state.loading = false;
      state.refreshing = false;
      state.error = action.payload as string;
    });

    // Create App
    builder.addCase(createApp.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createApp.fulfilled, (state, action) => {
      state.loading = false;
      state.apps.unshift(action.payload);
      applyFilters(state);
    });
    builder.addCase(createApp.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update App
    builder.addCase(updateApp.fulfilled, (state, action) => {
      const index = state.apps.findIndex(app => app.id === action.payload.id);
      if (index !== -1) {
        state.apps[index] = action.payload;
        applyFilters(state);
      }
    });

    // Delete App
    builder.addCase(deleteApp.fulfilled, (state, action) => {
      state.apps = state.apps.filter(app => app.id !== action.payload);
      applyFilters(state);
    });
  },
});

// Helper functions
const applyFilters = (state: AppsState) => {
  let filtered = [...state.apps];

  // Apply search filter
  if (state.searchQuery.trim()) {
    const query = state.searchQuery.toLowerCase();
    filtered = filtered.filter(
      app =>
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query) ||
        app.category.toLowerCase().includes(query),
    );
  }

  // Apply status filter
  if (state.filterBy !== 'all') {
    filtered = filtered.filter(app => app.status === state.filterBy);
  }

  state.filteredApps = filtered;
  applySorting(state);
};

const applySorting = (state: AppsState) => {
  state.filteredApps.sort((a, b) => {
    switch (state.sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'lastUpdated':
        return (
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );
      case 'downloads':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });
};

export const {
  clearError,
  setSearchQuery,
  setFilterBy,
  setSortBy,
  setSelectedApp,
  setRefreshing,
} = appsSlice.actions;
export default appsSlice.reducer;
