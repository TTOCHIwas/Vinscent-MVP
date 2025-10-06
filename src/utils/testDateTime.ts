import { formatRelativeTime } from '@/utils/formatRelativeTime';

// AdminDashboard 테스트용 함수
export const testAdminDashboard = (timestamp: string) => {
  console.log('[TEST] AdminDashboard timestamp:', timestamp);
  console.log('[TEST] formatRelativeTime result:', formatRelativeTime(timestamp));
  return formatRelativeTime(timestamp);
};

// MagazineAdminList 테스트용 함수  
export const testMagazineAdminList = (updatedDate: string) => {
  console.log('[TEST] MagazineAdminList updatedDate:', updatedDate);
  console.log('[TEST] formatRelativeTime result:', formatRelativeTime(updatedDate));
  return formatRelativeTime(updatedDate);
};
