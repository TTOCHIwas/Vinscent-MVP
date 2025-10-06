import { formatDate } from "./formatDate";

export const formatRelativeTime = (date: Date | string | undefined): string => {
  if (!date) return '';
  
  // UTC 시간을 명시적으로 처리
  let dateObj: Date;
  if (typeof date === 'string') {
    // DB에서 오는 UTC 시간 문자열을 올바르게 처리
    dateObj = date.includes('Z') ? new Date(date) : new Date(date + 'Z');
  } else {
    dateObj = date;
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  
  return formatDate(dateObj);
};