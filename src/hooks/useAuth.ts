import {useDispatch, useSelector} from 'react-redux';
import {loadStoredAuth} from '../store/slices/authSlice';
import {AppDispatch, RootState} from '../store';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();

  const {isAuthenticated, loading, user, token} = useSelector(
    (state: RootState) => state.auth,
  );

  // Returns a promise that resolves to the session (user) or null
  const restoreAuth = async () => {
    const result = await dispatch(loadStoredAuth()).unwrap();
    return result && result.user ? result.user : null;
  };

  return {
    isAuthenticated,
    loading,
    user,
    token,
    restoreAuth,
  };
}
