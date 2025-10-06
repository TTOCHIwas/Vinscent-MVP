'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, BarChart3, Users, Eye, Plus, Edit, Clock, Filter, RefreshCw } from 'lucide-react';

// 통계 API 인터페이스
interface MagazineStatistics {
  totalMagazines: number;
  publishedCount: number;
  draftCount: number;
  totalViews: number;
  recentCreated: number;
  recentUpdated: number;
  dailyViews: { date: string; count: number }[];
  recentActivity: {
    id: number;
    title: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    timestamp: string;
    status: string;
    category: string;
  }[];
}

// 통계 API 호출
const fetchMagazineStatistics = async (): Promise<MagazineStatistics> => {
  const token = localStorage.getItem('admin_token');
  const response = await fetch(`/api/control/stats?token=${token}`);
  
  if (!response.ok) {
    throw new Error('통계 데이터를 불러올 수 없습니다');
  }
  
  const data = await response.json();
  return data.statistics;
};

export const AdminDashboard: React.FC = () => {
  // 필터 상태
  const [actionFilter, setActionFilter] = useState<'ALL' | 'CREATE' | 'UPDATE' | 'DELETE'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'published' | 'draft'>('ALL');

  // 통계 데이터 쿼리
  const { 
    data: stats, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-statistics'],
    queryFn: fetchMagazineStatistics,
    refetchInterval: 5 * 60 * 1000, // 5분마다 갱신
  });

  // 필터링된 로그
  const filteredLogs = stats?.recentActivity.filter(log => {
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    return matchesAction && matchesStatus;
  }) || [];

  // 새로고침 핸들러
  const handleRefresh = () => {
    refetch();
  };

  // 활동 유형 표시 함수 (아이콘 + 텍스트)
  const getActionDisplay = (action: string) => {
    switch (action) {
      case 'CREATE':
        return {
          text: '생성',
          className: 'magazine-action magazine-action--create',
        };
      case 'UPDATE':
        return {
          text: '수정',
          className: 'magazine-action magazine-action--update',
        };
      case 'DELETE':
        return {
          text: '삭제',
          className: 'magazine-action magazine-action--delete',
        };
      default:
        return {
          text: action,
          className: 'magazine-action magazine-action--unknown',
        };
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="admin-page">
        <div className="admin-page__header">
          <div className="admin-page__title-section">
            <h1 className="admin-page__title">대시보드</h1>
            <p className="admin-page__description">
              매거진 통계 및 활동 로그를 확인하세요.
            </p>
          </div>
        </div>

        <div className="admin-list--loading">
          <div className="admin-list__loading">
            <div className="loading-spinner"></div>
            <p>데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !stats) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <h3>데이터 로드 실패</h3>
          <p>통계 데이터를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.</p>
          <button className="button button--variant-primary" onClick={handleRefresh}>
            <RefreshCw size={16} />
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* 페이지 헤더 */}
      <div className="admin-page__header">
        <div className="admin-page__title-section">
          <h1 className="admin-page__title">대시보드</h1>
          <p className="admin-page__description">
            매거진 통계와 모든 활동 로그를 한 곳에서 확인하세요.
          </p>
        </div>
        
        <div className="admin-actions">
          <button 
            className="button button--size-sm button--variant-secondary"
            onClick={handleRefresh}
            title="새로고침"
          >
            <RefreshCw size={16} />
            새로고침
          </button>
        </div>
      </div>

      {/* 통계 카드들 */}
      <div className="admin-stats">
        <div className="admin-stats__grid">
          <div className="admin-stats__card">
            <h3 className="admin-stats__title">
              <Users size={16} />
              전체 매거진
            </h3>
            <div className="admin-stats__value">{stats.totalMagazines}</div>
          </div>
          
          <div className="admin-stats__card">
            <h3 className="admin-stats__title">
              <BarChart3 size={16} />
              발행됨
            </h3>
            <div className="admin-stats__value admin-stats__value--published">
              {stats.publishedCount}
            </div>
          </div>
          
          <div className="admin-stats__card">
            <h3 className="admin-stats__title">
              <Edit size={16} />
              초안
            </h3>
            <div className="admin-stats__value admin-stats__value--draft">
              {stats.draftCount}
            </div>
          </div>
          
          <div className="admin-stats__card">
            <h3 className="admin-stats__title">
              <Eye size={16} />
              총 조회수
            </h3>
            <div className="admin-stats__value">{stats.totalViews.toLocaleString()}</div>
          </div>
          
          <div className="admin-stats__card">
            <h3 className="admin-stats__title">
              <Plus size={16} />
              최근 7일 생성
            </h3>
            <div className="admin-stats__value">{stats.recentCreated}</div>
          </div>
          
          <div className="admin-stats__card">
            <h3 className="admin-stats__title">
              <Clock size={16} />
              최근 7일 수정
            </h3>
            <div className="admin-stats__value">{stats.recentUpdated}</div>
          </div>
        </div>
      </div>

      {/* 활동 로그 섹션 */}
      <div className="admin-page__content">
        <h2 className="admin-page__title" style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-4)' }}>
          <Activity size={20} />
          활동 로그 (최근 50개)
        </h2>
        
        {/* 필터 */}
        <div className="admin-filters">
          <div className="admin-filters__group">
            <label className="admin-filters__label">
              <Filter size={16} />
              활동 유형:
            </label>
            <select 
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as typeof actionFilter)}
              className="button button--size-sm button--variant-secondary"
            >
              <option value="ALL">전체</option>
              <option value="CREATE">생성</option>
              <option value="UPDATE">수정</option>
              <option value="DELETE">삭제</option>
            </select>
          </div>

          <div className="admin-filters__group">
            <label className="admin-filters__label">상태:</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="button button--size-sm button--variant-secondary"
            >
              <option value="ALL">전체</option>
              <option value="published">발행됨</option>
              <option value="draft">초안</option>
            </select>
          </div>

          <div className="admin-filters__group">
            <span className="admin-filters__label">
              결과: {filteredLogs.length}개 / 전체 {stats.recentActivity.length}개
            </span>
          </div>
        </div>
        
        {filteredLogs.length === 0 ? (
          <div className="admin-list--empty">
            <div className="admin-list__empty">
              <h3>조건에 맞는 활동이 없습니다</h3>
              <p>필터 조건을 변경하여 다시 확인해보세요.</p>
            </div>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead className="admin-table__header">
                <tr>
                  <th className="admin-table__th" style={{ width: '60px' }}>ID</th>
                  <th className="admin-table__th admin-table__th--title">매거진 제목</th>
                  <th className="admin-table__th admin-table__th--action" style={{ width: '80px' }}>활동</th>
                  <th className="admin-table__th admin-table__th--status" style={{ width: '80px' }}>상태</th>
                  <th className="admin-table__th admin-table__th--category" style={{ width: '80px' }}>카테고리</th>
                  <th className="admin-table__th admin-table__th--date" style={{ width: '120px' }}>변경 시간</th>
                </tr>
              </thead>
              <tbody className="admin-table__body">
                {filteredLogs.map((log) => {
                  const actionDisplay = getActionDisplay(log.action);
                  
                  return (
                    <tr key={`${log.id}-${log.timestamp}`} className="admin-table__row">
                      <td className="admin-table__td">
                        <span className="magazine-views">#{log.id}</span>
                      </td>
                      <td className="admin-table__td">
                        <div className="magazine-title__main">
                          {log.title}
                        </div>
                      </td>
                      <td className="admin-table__td">
                        <span className={actionDisplay.className} title={`${actionDisplay.text} 작업`}>
                          <span className="magazine-action__text">
                            {actionDisplay.text}
                          </span>
                        </span>
                      </td>
                      <td className="admin-table__td">
                        <span className={`magazine-status magazine-status--${log.status}`}>
                          {log.status === 'published' ? '발행됨' : '초안'}
                        </span>
                      </td>
                      <td className="admin-table__td">
                        <span className={`magazine-category magazine-category--${log.category}`}>
                          {log.category === 'official' ? '공식' : '비공식'}
                        </span>
                      </td>
                      <td className="admin-table__td">
                        <span className="magazine-date">
                          {new Date(log.timestamp).toLocaleString('ko-KR')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};