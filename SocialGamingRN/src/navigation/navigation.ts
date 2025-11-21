import { createNavigationContainerRef } from '@react-navigation/native';

// Global navigation ref to allow navigation outside components (e.g., in axios interceptors)
export const navigationRef = createNavigationContainerRef<any>();

export default navigationRef;